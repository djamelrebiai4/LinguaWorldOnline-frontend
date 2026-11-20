import {
  r as React,
  u as useThree,
  k as useKeyboardControls,
  V as Vector3,
  E as Euler,
  b as useFrame,
  p as PointerLockControls,
  l as useGLTF,
  o as Environment
} from './three-vendor-BrF7bqo1.js';
import {
  u as useRapier,
  g as Rapier,
  R as RigidBody,
  C as CapsuleCollider,
  P as Physics
} from './physics-vendor-HODa8zue.js';
import {
  G as collisionGroups,
  d as EffectComposer,
  a as SSAO
} from './CollisionConfig-_pz6FJXP.js';
import { d as audio, I as ObjectInteraction } from './index-C2Y9NDyy.js';
import { loadLivingTownSimulation } from '../scripts/living-town-engine.js';
import { loadSmartPlaceSystem } from '../scripts/smart-place-system.js';
import { CityNavigationGraph, ResidentNavigationManager } from '../scripts/living-town-navigation.js';
import { createGameUi, ROLE_LABELS, EMOTES } from '../scripts/multiplayer-games.js';
import WorldStreamer from '../scripts/world-streamer.js';

const h = React.createElement;
const LOW_POWER_RENDERING = typeof navigator !== 'undefined' && (
  /Firefox/i.test(navigator.userAgent) || (navigator.hardwareConcurrency || 4) <= 4
);
let sharedLivingTownSimulation = null;

const CITY_PORTALS = [
  {
    id: 'house',
    targetLevel: 2,
    title: { ar: 'المنزل', en: 'the house', de: 'das Haus' },
    position: { x: 140, z: -203 },
    radius: 24,
    spawn: { x: 0, y: 0, z: 0 },
    returnPosition: { x: 140, y: 0, z: -203 }
  },
  {
    id: 'classroom',
    targetLevel: 3,
    title: { ar: 'المدرسة', en: 'the school', de: 'die Schule' },
    position: { x: -131, z: 281 },
    radius: 23,
    spawn: { x: 0, y: 0, z: 0 },
    returnPosition: { x: -131, y: 0, z: 281 }
  },
  {
    id: 'restaurant',
    targetLevel: 4,
    title: { ar: 'المطعم', en: 'the restaurant', de: 'das Restaurant' },
    position: { x: 99, z: 170 },
    radius: 22,
    spawn: { x: 0, y: 0, z: 0 },
    returnPosition: { x: 99, y: 0, z: 170 }
  },
  {
    id: 'supermarket',
    targetLevel: 5,
    title: { ar: 'السوبرماركت', en: 'the supermarket', de: 'der Supermarkt' },
    position: { x: 83, z: 284 },
    radius: 24,
    spawn: { x: 0, y: 0, z: 0 },
    returnPosition: { x: 83, y: 0, z: 284 }
  }
];

const INTERIOR_EXITS = {
  2: { position: { x: 3, z: 16 }, radius: 8, returnPosition: CITY_PORTALS[0].returnPosition },
  3: { position: { x: 17, z: -14 }, radius: 10, returnPosition: CITY_PORTALS[1].returnPosition },
  4: { position: { x: -5, z: 25 }, radius: 10, returnPosition: CITY_PORTALS[2].returnPosition },
  5: { position: { x: 0, z: 42 }, radius: 11, returnPosition: CITY_PORTALS[3].returnPosition }
};

const LEVEL_NAMES = {
  2: { ar: 'المنزل', en: 'the house' },
  3: { ar: 'المدرسة', en: 'the school' },
  4: { ar: 'المطعم', en: 'the restaurant' },
  5: { ar: 'السوبرماركت', en: 'the supermarket' }
};

const LEVEL_STARTS = {
  1: { x: 39, y: 0, z: 118 },
  2: { x: 0, y: 0, z: 0 },
  3: { x: 0, y: 0, z: 0 },
  4: { x: 0, y: 0, z: 0 },
  5: { x: 0, y: 0, z: 0 }
};

function readCitySpawn() {
  if (typeof window === 'undefined') return LEVEL_STARTS[1];
  const raw = new URLSearchParams(window.location.search).get('spawn');
  if (!raw) return LEVEL_STARTS[1];
  const [x, z] = raw.split(',').map(Number);
  if (!Number.isFinite(x) || !Number.isFinite(z)) return LEVEL_STARTS[1];
  return { x, y: 4, z };
}

const CITY_MAP = {
  width: 220,
  height: 260,
  left: 12,
  right: 208,
  top: 16,
  bottom: 244,
  minX: -230,
  maxX: 230,
  minZ: -255,
  maxZ: 335
};

const CITY_MAP_PLACES = [
  {
    id: 'town-center',
    name: { ar: 'وسط المدينة', de: 'Stadtzentrum', en: 'Town center' },
    aliases: ['crossing-main', 'crosswalk', 'تقاطع الشارع الرئيسي', 'Hauptkreuzung'],
    category: { ar: 'شارع رئيسي', de: 'Hauptstraße', en: 'Main street' },
    x: 30, z: 95, color: '#58b8a5'
  },
  {
    id: 'town-park',
    name: { ar: 'حديقة المدينة', de: 'Stadtpark', en: 'City park' },
    aliases: ['park', 'الحديقة', 'grünanlage'],
    category: { ar: 'حديقة', de: 'Park', en: 'Park' },
    x: -170, z: 130, color: '#70b88c'
  },
  {
    id: 'house',
    name: { ar: 'المنزل', de: 'Haus', en: 'House' },
    aliases: ['home', 'zu hause', 'البيت'],
    category: { ar: 'منزل', de: 'Wohnhaus', en: 'Home' },
    x: 140, z: -203, footprint: [28, 28], color: '#d9b18f'
  },
  {
    id: 'classroom',
    name: { ar: 'المدرسة', de: 'Schule', en: 'School' },
    aliases: ['classroom', 'الصف', 'schule'],
    category: { ar: 'تعليم', de: 'Bildung', en: 'Education' },
    x: -131, z: 264, footprint: [42, 34], color: '#86b9df'
  },
  {
    id: 'cafe',
    name: { ar: 'المقهى', de: 'Café', en: 'Cafe' },
    aliases: ['coffee shop', 'kaffee', 'كافيه'],
    category: { ar: 'مقهى', de: 'Café', en: 'Cafe' },
    x: 99, z: 160, footprint: [32, 30], color: '#e8a878'
  },
  {
    id: 'restaurant',
    name: { ar: 'المطعم', de: 'Restaurant', en: 'Restaurant' },
    aliases: ['essen', 'food', 'الطعام'],
    category: { ar: 'طعام', de: 'Essen', en: 'Dining' },
    x: 99, z: 170, color: '#f2a876'
  },
  {
    id: 'supermarket',
    name: { ar: 'السوبرماركت', de: 'Supermarkt', en: 'Supermarket' },
    aliases: ['market', 'einkaufen', 'متجر', 'سوق'],
    category: { ar: 'تسوّق', de: 'Einkaufen', en: 'Shopping' },
    x: 83, z: 268, footprint: [46, 48], color: '#ffd166'
  },
  ...[
    { id: 'street-main', x: 30, z: 0, name: { ar: 'الشارع الرئيسي', de: 'Hauptstraße', en: 'Main Street' }, aliases: ['hauptstrasse', 'main street'] },
    { id: 'street-park', x: -80, z: 170, name: { ar: 'شارع الحديقة', de: 'Parkstraße', en: 'Park Street' }, aliases: ['parkstrasse', 'park street'] },
    { id: 'street-market', x: 120, z: 95, name: { ar: 'شارع السوق', de: 'Marktstraße', en: 'Market Street' }, aliases: ['marktstrasse', 'market street'] },
    { id: 'street-school', x: -60, z: 284, name: { ar: 'شارع المدرسة', de: 'Schulstraße', en: 'School Street' }, aliases: ['schulstrasse', 'school street'] },
    { id: 'street-south', x: -80, z: -130, name: { ar: 'الشارع الجنوبي', de: 'Südstraße', en: 'South Street' }, aliases: ['suedstrasse', 'sudstrasse', 'south street'] },
    { id: 'street-residential', x: 100, z: -203, name: { ar: 'شارع المنازل', de: 'Wohnstraße', en: 'Residential Street' }, aliases: ['wohnstrasse', 'residential street'] }
  ].map((street) => ({
    ...street,
    category: { ar: 'شارع', de: 'Straße', en: 'Street' },
    color: '#526b65',
    kind: 'street',
    showLabel: true
  })),
  ...[
    { id: 'crossing-cafe', x: 30, z: 170, name: { ar: 'معبر المقهى', de: 'Café-Übergang', en: 'Cafe crossing' } },
    { id: 'crossing-school', x: 30, z: 284, name: { ar: 'معبر المدرسة', de: 'Schulübergang', en: 'School crossing' } },
    { id: 'crossing-house', x: 30, z: -203, name: { ar: 'معبر المنزل', de: 'Haus-Übergang', en: 'House crossing' } }
  ].map((crossing) => ({
    ...crossing,
    aliases: ['crossing', 'zebrastreifen', 'معبر مشاة'],
    category: { ar: 'معبر مشاة', de: 'Fußgängerüberweg', en: 'Crosswalk' },
    color: '#f4d774'
  }))
];

function cityMapPoint(x, z) {
  return {
    x: CITY_MAP.left + (x - CITY_MAP.minX) *
      (CITY_MAP.right - CITY_MAP.left) / (CITY_MAP.maxX - CITY_MAP.minX),
    y: CITY_MAP.top + (CITY_MAP.maxZ - z) *
      (CITY_MAP.bottom - CITY_MAP.top) / (CITY_MAP.maxZ - CITY_MAP.minZ)
  };
}

function createCityMap(language) {
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const svgElement = (name, attributes = {}) => {
    const element = document.createElementNS(svgNamespace, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };
  const panel = document.createElement('section');
  panel.className = 'lw-city-map';
  panel.lang = 'de';
  panel.dir = 'ltr';
  panel.setAttribute('aria-label', 'Stadtplan');

  const header = document.createElement('div');
  header.className = 'lw-city-map-header';
  const heading = document.createElement('strong');
  heading.textContent = 'Stadtplan';
  const controls = document.createElement('div');
  controls.className = 'lw-city-map-controls';
  const makeMapButton = (className, label, iconMarkup) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML = iconMarkup;
    return button;
  };
  const legendToggle = makeMapButton(
    'lw-city-map-action lw-city-map-legend-toggle',
    'Legende anzeigen',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></svg>'
  );
  legendToggle.setAttribute('aria-expanded', 'false');
  const searchToggle = makeMapButton(
    'lw-city-map-action lw-city-map-search-toggle',
    'Ort suchen',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>'
  );
  searchToggle.setAttribute('aria-pressed', 'false');
  const enlargeToggle = makeMapButton(
    'lw-city-map-action lw-city-map-enlarge-toggle',
    'Karte vergrößern',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><path d="M8 8 3 3m13 5 5-5M8 16l-5 5m13-5 5 5"/></svg>'
  );
  enlargeToggle.setAttribute('aria-pressed', 'false');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'lw-city-map-toggle';
  toggle.textContent = '−';
  toggle.setAttribute('aria-label', 'Karte einklappen');
  toggle.setAttribute('aria-expanded', 'true');
  controls.append(searchToggle, legendToggle, enlargeToggle, toggle);
  header.append(heading, controls);

  const searchPanel = document.createElement('div');
  searchPanel.className = 'lw-city-map-search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'lw-city-map-search-input';
  searchInput.placeholder = 'Ort suchen: Park, Schule, Haus …';
  searchInput.setAttribute('aria-label', 'Ort suchen');
  const searchResults = document.createElement('div');
  searchResults.className = 'lw-city-map-results';
  searchResults.setAttribute('role', 'listbox');
  searchPanel.append(searchInput, searchResults);

  const body = document.createElement('div');
  body.className = 'lw-city-map-body';
  const map = svgElement('svg', {
    viewBox: `0 0 ${CITY_MAP.width} ${CITY_MAP.height}`,
    role: 'group',
    'aria-label': 'Stadtplan mit Orten, Übergängen und deinem aktuellen Standort'
  });
  map.appendChild(svgElement('rect', {
    x: 3, y: 3, width: CITY_MAP.width - 6, height: CITY_MAP.height - 6, rx: 12,
    class: 'lw-city-map-ground'
  }));
  const park = cityMapPoint(-201, 155);
  const parkEnd = cityMapPoint(-139, 105);
  map.appendChild(svgElement('rect', {
    x: park.x,
    y: park.y,
    width: parkEnd.x - park.x,
    height: parkEnd.y - park.y,
    rx: 5,
    class: 'lw-city-map-park'
  }));

  const streets = [
    { start: [30, -255], end: [30, 335], width: 15 },
    { start: [-220, 95], end: [220, 95], width: 14 },
    { start: [-185, -50], end: [185, -50], width: 11 },
    { start: [-140, -130], end: [160, -130], width: 11 },
    { start: [-215, 170], end: [135, 170], width: 12 },
    { start: [-155, 230], end: [145, 230], width: 12 },
    { start: [-150, 284], end: [115, 284], width: 14 },
    { start: [30, -203], end: [160, -203], width: 13 }
  ];
  streets.forEach(({ start, end, width }) => {
    const first = cityMapPoint(start[0], start[1]);
    const last = cityMapPoint(end[0], end[1]);
    const horizontal = start[1] === end[1];
    const roadWidth = width * (horizontal
      ? (CITY_MAP.bottom - CITY_MAP.top) / (CITY_MAP.maxZ - CITY_MAP.minZ)
      : (CITY_MAP.right - CITY_MAP.left) / (CITY_MAP.maxX - CITY_MAP.minX));
    const path = `M ${first.x} ${first.y} L ${last.x} ${last.y}`;
    map.appendChild(svgElement('path', {
      d: path,
      class: 'lw-city-map-road-edge',
      'stroke-width': roadWidth + 1.5
    }));
    map.appendChild(svgElement('path', {
      d: path,
      class: 'lw-city-map-road',
      'stroke-width': roadWidth
    }));
    map.appendChild(svgElement('path', {
      d: path,
      class: 'lw-city-map-road-marking',
      'stroke-width': 0.65
    }));
  });

  CITY_MAP_PLACES.filter((place) => place.footprint).forEach((place) => {
    const first = cityMapPoint(place.x - place.footprint[0] / 2, place.z + place.footprint[1] / 2);
    const last = cityMapPoint(place.x + place.footprint[0] / 2, place.z - place.footprint[1] / 2);
    map.appendChild(svgElement('rect', {
      x: first.x,
      y: first.y,
      width: last.x - first.x,
      height: last.y - first.y,
      rx: 1.5,
      class: `lw-city-map-building is-${place.id}`
    }));
  });

  const routeLine = svgElement('line', { class: 'lw-city-map-route', visibility: 'hidden' });
  map.appendChild(routeLine);
  const placeMarkers = new Map();
  CITY_MAP_PLACES.forEach((place) => {
    const position = cityMapPoint(place.x, place.z);
    const marker = svgElement('g', {
      class: `lw-city-map-marker is-poi is-${place.kind || place.id}`,
      transform: `translate(${position.x} ${position.y})`
    });
    const title = svgElement('title');
    title.textContent = `${place.name[language]} / ${place.name.de}`;
    marker.append(title, place.kind === 'street'
      ? svgElement('rect', { x: -1.7, y: -1.7, width: 3.4, height: 3.4, transform: 'rotate(45)', fill: place.color })
      : svgElement('circle', { r: place.footprint ? 4.4 : 3.2, fill: place.color }));
    if (place.footprint || place.id === 'town-park' || place.showLabel) {
      const label = svgElement('text', { x: 0, y: -6, class: 'lw-city-map-label' });
      label.textContent = place.name[language];
      marker.appendChild(label);
    }
    marker.setAttribute('tabindex', '0');
    marker.setAttribute('role', 'button');
    marker.setAttribute('aria-label', title.textContent);
    marker.addEventListener('click', (event) => {
      event.stopPropagation();
      selectPlace(place);
    });
    marker.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectPlace(place);
      }
    });
    placeMarkers.set(place.id, marker);
    map.appendChild(marker);
  });

  const start = cityMapPoint(LEVEL_STARTS[1].x, LEVEL_STARTS[1].z);
  const playerMarker = svgElement('g', {
    class: 'lw-city-map-player',
    transform: `translate(${start.x} ${start.y})`
  });
  playerMarker.append(
    svgElement('circle', { r: 6.2, class: 'lw-city-map-player-halo' }),
    svgElement('path', { d: 'M 0 -7 L 4 4 L 0 2 L -4 4 Z' })
  );
  map.appendChild(playerMarker);

  const compass = document.createElement('span');
  compass.className = 'lw-city-map-compass';
  compass.textContent = 'Norden';
  const compassIcon = svgElement('svg', {
    viewBox: '0 0 24 24',
    'aria-hidden': 'true'
  });
  compassIcon.appendChild(svgElement('path', { d: 'M12 3 6 21l6-4 6 4-6-18Z' }));
  compass.prepend(compassIcon);

  const legend = document.createElement('div');
  legend.className = 'lw-city-map-legend';
  const legendItems = [
    { label: 'Du', color: '#ffb36b', player: true },
    ...CITY_MAP_PLACES.map((place) => ({
      label: place.name[language],
      color: place.color,
      id: place.id
    }))
  ];
  legendItems.forEach(({ label, color, player, id }) => {
    const item = document.createElement('span');
    item.className = `lw-city-map-legend-item${id === 'supermarket' ? ' is-supermarket' : ''}`;
    const dot = document.createElement('i');
    dot.style.setProperty('--lw-map-marker', color);
    if (player) dot.classList.add('is-player');
    const text = document.createElement('bdi');
    text.textContent = label;
    item.append(dot, text);
    legend.appendChild(item);
  });

  const liveInfo = document.createElement('div');
  liveInfo.className = 'lw-city-map-info';
  const currentLocation = document.createElement('div');
  currentLocation.className = 'lw-city-map-current';
  currentLocation.setAttribute('aria-live', 'polite');
  const selectedLocation = document.createElement('div');
  selectedLocation.className = 'lw-city-map-selected';
  selectedLocation.setAttribute('aria-live', 'polite');
  selectedLocation.textContent = 'Wähle einen Ort für Entfernung und Richtung.';
  liveInfo.append(currentLocation, selectedLocation);
  body.append(map, compass, legend, liveInfo);
  panel.append(header, searchPanel, body);

  const normalizeSearch = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
  let selectedPlace = null;
  let lastPlayerPosition = null;
  const directionFor = (dx, dz) => {
    const angle = (Math.atan2(dx, dz) * 180 / Math.PI + 360) % 360;
    const directions = ['Norden', 'Nordosten', 'Osten', 'Südosten', 'Süden', 'Südwesten', 'Westen', 'Nordwesten'];
    return directions[Math.round(angle / 45) % 8];
  };
  const updateInfo = () => {
    if (!lastPlayerPosition) return;
    const { x, z } = lastPlayerPosition;
    const nearest = CITY_MAP_PLACES.reduce((best, place) => {
      const distance = Math.hypot(place.x - x, place.z - z);
      return !best || distance < best.distance ? { place, distance } : best;
    }, null);
    const currentText = `Du bist in der Nähe von ${nearest.place.name.de} · ${Math.round(nearest.distance)} m entfernt · X ${Math.round(x)}, Z ${Math.round(z)}`;
    if (currentLocation.textContent !== currentText) currentLocation.textContent = currentText;
    if (!selectedPlace) return;
    const dx = selectedPlace.x - x;
    const dz = selectedPlace.z - z;
    const distance = Math.hypot(dx, dz);
    const selectedText = `${selectedPlace.name.de} · ${Math.round(distance)} m ${directionFor(dx, dz)}`;
    if (selectedLocation.textContent !== selectedText) selectedLocation.textContent = selectedText;
  };
  const selectPlace = (place) => {
    selectedPlace = place;
    placeMarkers.forEach((marker, id) => marker.classList.toggle('is-selected', id === place.id));
    routeLine.setAttribute('visibility', 'visible');
    if (lastPlayerPosition) {
      const player = cityMapPoint(lastPlayerPosition.x, lastPlayerPosition.z);
      const target = cityMapPoint(place.x, place.z);
      routeLine.setAttribute('x1', player.x);
      routeLine.setAttribute('y1', player.y);
      routeLine.setAttribute('x2', target.x);
      routeLine.setAttribute('y2', target.y);
    }
    updateInfo();
    searchResults.querySelectorAll('.lw-city-map-result').forEach((result) => {
      result.setAttribute('aria-selected', String(result.dataset.placeId === place.id));
    });
  };
  const renderResults = () => {
    const query = normalizeSearch(searchInput.value);
    const matches = CITY_MAP_PLACES.filter((place) => [
      place.name.ar, place.name.de, place.name.en, place.category.ar,
      place.category.de, place.category.en, ...place.aliases
    ].some((term) => normalizeSearch(term).includes(query)));
    searchResults.replaceChildren();
    matches.forEach((place) => {
      const result = document.createElement('button');
      result.type = 'button';
      result.className = 'lw-city-map-result';
      result.dataset.placeId = place.id;
      result.setAttribute('role', 'option');
      result.setAttribute('aria-selected', String(selectedPlace?.id === place.id));
      const name = document.createElement('bdi');
      name.textContent = place.name[language];
      const detail = document.createElement('small');
      detail.textContent = `${place.name.de} · ${place.category[language]}`;
      result.append(name, detail);
      result.addEventListener('click', () => selectPlace(place));
      searchResults.appendChild(result);
    });
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'lw-city-map-empty';
      empty.textContent = 'Keine Orte gefunden.';
      searchResults.appendChild(empty);
    }
  };
  searchInput.addEventListener('input', renderResults);
  renderResults();

  const updatePosition = (x, z, heading) => {
    const position = cityMapPoint(x, z);
    lastPlayerPosition = { x, z };
    playerMarker.setAttribute('transform', `translate(${position.x} ${position.y}) rotate(${heading})`);
    if (selectedPlace) {
      const target = cityMapPoint(selectedPlace.x, selectedPlace.z);
      routeLine.setAttribute('x1', position.x);
      routeLine.setAttribute('y1', position.y);
      routeLine.setAttribute('x2', target.x);
      routeLine.setAttribute('y2', target.y);
      updateInfo();
    } else {
      updateInfo();
    }
  };
  legendToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const expanded = panel.classList.toggle('is-legend-open');
    legendToggle.setAttribute('aria-expanded', String(expanded));
    legendToggle.setAttribute(
      'aria-label',
      expanded ? 'Legende ausblenden' : 'Legende anzeigen'
    );
  });
  const closeEnlargedMap = () => {
    panel.classList.remove('is-enlarged');
    panel.classList.remove('is-search-open');
    document.body.classList.remove('map-overlay-open');
    enlargeToggle.setAttribute('aria-pressed', 'false');
    searchToggle.setAttribute('aria-pressed', 'false');
  };
  searchToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = !panel.classList.contains('is-search-open');
    panel.classList.toggle('is-search-open', open);
    panel.classList.toggle('is-enlarged', open);
    document.body.classList.toggle('map-overlay-open', open);
    searchToggle.setAttribute('aria-pressed', String(open));
    enlargeToggle.setAttribute('aria-pressed', String(open));
    if (open) {
      renderResults();
      searchInput.focus();
    }
  });
  enlargeToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const enlarged = panel.classList.toggle('is-enlarged');
    document.body.classList.toggle('map-overlay-open', enlarged);
    enlargeToggle.setAttribute('aria-pressed', String(enlarged));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('is-enlarged')) closeEnlargedMap();
  });
  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const collapsed = panel.classList.toggle('is-collapsed');
    body.hidden = collapsed;
    toggle.textContent = collapsed ? '+' : '−';
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute(
      'aria-label',
      collapsed ? 'Karte ausklappen' : 'Karte einklappen'
    );
  });
  ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach((eventName) => {
    panel.addEventListener(eventName, (event) => event.stopPropagation());
  });

  return { panel, playerMarker, updatePosition };
}

const PLAYER_MODEL_OPTIONS = [
  { id: 'Barbarian', label: 'Barbar' },
  { id: 'Knight', label: 'Ritter' },
  { id: 'Mage', label: 'Magier' },
  { id: 'Ranger', label: 'Waldläufer' },
  { id: 'Rogue', label: 'Schurke' }
];

function RemotePlayerAvatar({ player, camera, gl, movementAnimations, idleAnimations, gameRole, emote, speaking }) {
  const modelName = PLAYER_MODEL_OPTIONS.some((option) => option.id === player.model)
    ? player.model
    : 'Ranger';
  const { scene } = useGLTF(`/Grounds/NPC/${modelName}.glb`, true);
  const group = React.useRef(null);
  const label = React.useRef(null);
  const target = React.useRef(new Vector3(player.x, 0, player.z));
  const screenPosition = React.useRef(new Vector3());
  const animationTime = React.useRef(0);
  const animationMode = React.useRef('idle');
  const model = React.useMemo(() => scene.clone(true), [scene]);
  const nodes = React.useMemo(() => {
    const lookup = new Map();
    model.traverse((node) => {
      if (node.name) lookup.set(node.name, node);
      if (node.isMesh || node.isSkinnedMesh) {
        node.castShadow = false;
        node.receiveShadow = false;
      }
    });
    model.traverse((node) => {
      if (!node.isSkinnedMesh) return;
      const skeleton = node.skeleton.clone();
      skeleton.bones = skeleton.bones.map((bone) => lookup.get(bone.name));
      node.bind(skeleton, node.bindMatrix);
    });
    return lookup;
  }, [model]);
  const walkClip = movementAnimations.find((clip) => clip.name === 'Walking_A') || movementAnimations[0];
  const idleClip = idleAnimations.find((clip) => clip.name === 'Idle_A') || idleAnimations[0];
  const walkTracks = React.useMemo(() => bindNpcAnimation(walkClip, nodes), [walkClip, nodes]);
  const idleTracks = React.useMemo(() => bindNpcAnimation(idleClip, nodes), [idleClip, nodes]);

  React.useEffect(() => {
    const element = document.createElement('div');
    element.className = 'lw-remote-name';
    document.body.appendChild(element);
    label.current = element;
    return () => {
      element.remove();
      if (label.current === element) label.current = null;
    };
  }, [player.id]);

  React.useEffect(() => {
    const element = label.current;
    if (!element) return;
    element.replaceChildren();
    const name = document.createElement('span');
    name.className = 'lw-remote-name-text';
    name.textContent = player.name;
    element.appendChild(name);
    if (gameRole && gameRole !== 'spieler' && gameRole !== 'spectator') {
      const badge = document.createElement('small');
      badge.className = 'lw-remote-role';
      badge.textContent = ROLE_LABELS[gameRole] || gameRole;
      element.appendChild(badge);
    }
    if (emote?.id) {
      const emoteLabel = EMOTES.find((entry) => entry.id === emote.id);
      if (emoteLabel) {
        const badge = document.createElement('span');
        badge.className = 'lw-remote-emote';
        badge.textContent = emoteLabel.icon;
        badge.title = emoteLabel.label;
        element.appendChild(badge);
      }
    }
    element.classList.toggle('is-it', gameRole === 'it' || gameRole === 'seeker');
    element.classList.toggle('is-speaking', Boolean(speaking));
  }, [player.name, gameRole, emote?.id, emote?.at, speaking]);

  React.useEffect(() => {
    target.current.set(player.x, 0, player.z);
  }, [player.x, player.z, player.heading, player.name]);

  useFrame((_, delta) => {
    const actor = group.current;
    if (actor) {
      const distance = actor.position.distanceTo(target.current);
      actor.position.lerp(target.current, Math.min(1, delta * 8));
      const angle = player.heading * Math.PI / 180;
      actor.rotation.y += Math.atan2(Math.sin(angle - actor.rotation.y), Math.cos(angle - actor.rotation.y))
        * Math.min(1, delta * 8);
      let emoteLift = 0;
      let emoteRoll = 0;
      const emoteAge = emote?.at ? (Date.now() - emote.at) / 1000 : Infinity;
      if (emoteAge < 2.6) {
        const t = emoteAge;
        if (emote.id === 'dance') emoteLift = Math.abs(Math.sin(t * 7)) * 0.28;
        else if (emote.id === 'cheer') emoteLift = Math.abs(Math.sin(t * 9)) * 0.42;
        else if (emote.id === 'laugh') emoteLift = Math.abs(Math.sin(t * 11)) * 0.12;
        else if (emote.id === 'wave') emoteRoll = Math.sin(t * 10) * 0.09;
        else if (emote.id === 'spin') actor.rotation.y += delta * 9;
      }
      actor.position.y = emoteLift;
      actor.rotation.z = emoteRoll;
      const mode = distance > 0.035 ? 'walk' : 'idle';
      if (animationMode.current !== mode) {
        animationMode.current = mode;
        animationTime.current = 0;
      }
      animationTime.current += delta;
      applyNpcAnimation(
        mode === 'walk' ? walkTracks : idleTracks,
        animationTime.current,
        (mode === 'walk' ? walkClip : idleClip)?.duration
      );
    }
    const element = label.current;
    const canvas = gl.domElement;
    if (!element || !canvas) return;
    const bounds = canvas.getBoundingClientRect();
    screenPosition.current.set(target.current.x, 2.15, target.current.z).project(camera);
    const visible = screenPosition.current.z >= -1 && screenPosition.current.z <= 1
      && screenPosition.current.x >= -1.05 && screenPosition.current.x <= 1.05
      && screenPosition.current.y >= -1.05 && screenPosition.current.y <= 1.05;
    element.style.display = visible ? 'block' : 'none';
    if (visible) {
      element.style.left = `${bounds.left + (screenPosition.current.x + 1) * bounds.width / 2}px`;
      element.style.top = `${bounds.top + (1 - screenPosition.current.y) * bounds.height / 2}px`;
    }
  });

  return h('group', {
    ref: group,
    position: [player.x, 0, player.z],
    rotation: [0, player.heading * Math.PI / 180, 0]
  }, h('primitive', { object: model }));
}

function HuntCollectible({ spawn, playerBody, camera, gl, onCollect }) {
  const group = React.useRef(null);
  const label = React.useRef(null);
  const attempted = React.useRef(false);
  const screenPosition = React.useMemo(() => new Vector3(), []);

  React.useEffect(() => {
    attempted.current = false;
    const element = document.createElement('div');
    element.className = 'lw-hunt-word';
    element.dataset.lwNoTranslate = 'true';
    element.textContent = spawn.de;
    document.body.appendChild(element);
    label.current = element;
    return () => {
      element.remove();
      if (label.current === element) label.current = null;
    };
  }, [spawn.id, spawn.article, spawn.de]);

  useFrame((_, delta) => {
    const actor = group.current;
    if (actor) {
      actor.rotation.y += delta * 1.4;
      actor.position.y = 1.15 + Math.sin(Date.now() / 520 + spawn.x) * 0.16;
    }
    const body = playerBody.current;
    if (body && !attempted.current) {
      const player = body.translation();
      if (Math.hypot(player.x - spawn.x, player.z - spawn.z) <= 3.8) {
        attempted.current = true;
        onCollect(spawn.id);
      }
    }
    const element = label.current;
    const canvas = gl.domElement;
    if (!element || !canvas) return;
    const bounds = canvas.getBoundingClientRect();
    screenPosition.set(spawn.x, 2.35, spawn.z).project(camera);
    const visible = screenPosition.z >= -1 && screenPosition.z <= 1
      && screenPosition.x >= -1.05 && screenPosition.x <= 1.05
      && screenPosition.y >= -1.05 && screenPosition.y <= 1.05;
    element.style.display = visible ? 'block' : 'none';
    if (visible) {
      element.style.left = `${bounds.left + (screenPosition.x + 1) * bounds.width / 2}px`;
      element.style.top = `${bounds.top + (1 - screenPosition.y) * bounds.height / 2}px`;
    }
  });

  return h('group', { ref: group, position: [spawn.x, 1.15, spawn.z] },
    h('mesh', { rotation: [Math.PI / 4, 0, Math.PI / 4] },
      h('octahedronGeometry', { args: [0.42, 0] }),
      h('meshStandardMaterial', {
        color: 0xf2b84b,
        emissive: 0xb86a2a,
        emissiveIntensity: 0.55,
        roughness: 0.35,
        metalness: 0.2
      })),
    h('pointLight', { color: 0xffd27a, intensity: 0.8, distance: 5 }));
}

function createMultiplayerPanel() {
  const panel = document.createElement('section');
  panel.className = 'lw-multiplayer-panel';
  panel.setAttribute('aria-label', 'Online-Spieler und Chat');
  panel.innerHTML = '<div class="lw-multiplayer-header"><span>Öffentlicher Chat</span><span class="lw-multiplayer-state">Verbinde ...</span></div>'
    + '<label class="lw-multiplayer-name-row"><span>Name</span><input maxlength="24" aria-label="Dein Spielername"></label>'
    + `<label class="lw-multiplayer-character-row"><span>Figur</span><select aria-label="Wähle deine Figur">${PLAYER_MODEL_OPTIONS.map((option) => `<option value="${option.id}">${option.label}</option>`).join('')}</select></label>`
    + '<nav class="lw-chat-tabs" aria-label="Chat-Ansicht"><button type="button" class="is-active" data-chat-tab="public">Alle</button><button type="button" data-chat-tab="nearby">In der Nähe</button></nav>'
    + '<div class="lw-nearby-players" hidden></div>'
    + '<div class="lw-private-heading" hidden><span></span><button type="button">Zurück</button></div>'
    + '<div class="lw-multiplayer-messages" role="log" aria-live="polite"></div>'
    + '<form class="lw-multiplayer-compose"><input maxlength="240" autocomplete="off" placeholder="Nachricht schreiben ..." aria-label="Nachricht"><button type="submit" aria-label="Nachricht senden">Senden</button><button type="button" class="lw-voice-toggle" aria-label="Sprachchat aktivieren" aria-pressed="false" title="Sprachchat aktivieren">🎙</button><button type="button" class="lw-ptt-toggle" aria-label="Push-to-Talk" aria-pressed="false" title="Push-to-Talk (V)">PTT</button></form>'
    + '<details class="lw-multiplayer-settings"><summary>Serververbindung</summary><form><input type="url" aria-label="WebSocket-Serveradresse" placeholder="wss://dein-server/multiplayer"><button type="submit">Verbinden</button></form></details>';
  ['pointerdown', 'mousedown', 'touchstart', 'click', 'wheel'].forEach((eventName) => {
    panel.addEventListener(eventName, (event) => event.stopPropagation());
  });
  panel.addEventListener('keydown', (event) => event.stopPropagation());
  return panel;
}

const FirstPersonPlayer = React.forwardRef(function FirstPersonPlayer({
  joystickInput = { x: 0, y: 0 },
  initialPosition = { x: 0, y: 1, z: 0 },
  eyeHeight = 1.5,
  cameraLerp = 0.2,
  isPaused = false,
  movementLocked = false,
  isMobile = false
}, bodyRef) {
  const { camera } = useThree();
  const { world } = useRapier();
  const [, getKeys] = useKeyboardControls();
  const walkSpeed = 8;
  const runSpeed = 17.6;
  const jumpImpulse = 6;
  const groundRayLength = 1.05;
  const shiftPressed = React.useRef(false);
  const ready = React.useRef(false);
  const grounded = React.useRef(false);
  const movement = React.useRef(new Vector3());
  const forward = React.useRef(new Vector3());
  const right = React.useRef(new Vector3());
  const target = React.useRef(new Vector3());
  const rotation = React.useRef(new Euler(0, 0, 0, 'YXZ'));
  const groundRay = React.useRef(
    new Rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 })
  );
  const pointerLockRef = React.useRef();
  const stepTimer = React.useRef(1);

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Shift') shiftPressed.current = true;
    };
    const onKeyUp = (event) => {
      if (event.key === 'Shift') shiftPressed.current = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    const readyTimer = window.setTimeout(() => {
      ready.current = true;
    }, 160);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.clearTimeout(readyTimer);
    };
  }, []);

  React.useEffect(() => {
    if (!isMobile) return undefined;
    let active = false;
    let touch = null;
    const onTouchStart = (event) => {
      const current = event.changedTouches[0];
      if (current && current.clientX > window.innerWidth / 2) {
        active = true;
        touch = current;
      }
    };
    const onTouchMove = (event) => {
      if (!active || !touch) return;
      const current = Array.from(event.touches).find((item) => item.identifier === touch.identifier);
      if (!current) return;
      const deltaX = current.clientX - touch.clientX;
      const deltaY = current.clientY - touch.clientY;
      touch = current;
      rotation.current.setFromQuaternion(camera.quaternion);
      rotation.current.y -= deltaX * 0.005;
      rotation.current.x -= deltaY * 0.005;
      const limit = Math.PI / 2 - 0.05;
      rotation.current.x = Math.max(-limit, Math.min(limit, rotation.current.x));
      camera.quaternion.setFromEuler(rotation.current);
    };
    const onTouchEnd = (event) => {
      if (touch && !Array.from(event.touches).some((item) => item.identifier === touch.identifier)) {
        active = false;
        touch = null;
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [camera, isMobile]);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (isPaused) {
      if (body) {
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        body.setGravityScale(0, true);
      }
      return;
    }
    if (!body) return;
    body.setGravityScale(1, true);
    if (movementLocked) {
      const frozen = body.linvel();
      body.setLinvel({ x: 0, y: frozen.y, z: 0 }, true);
      const frozenPosition = body.translation();
      target.current.set(frozenPosition.x, frozenPosition.y + eyeHeight, frozenPosition.z);
      camera.position.lerp(target.current, isMobile ? 1 : cameraLerp);
      return;
    }
    if (!ready.current) return;

    const position = body.translation();
    groundRay.current.origin.x = position.x;
    groundRay.current.origin.y = position.y;
    groundRay.current.origin.z = position.z;
    grounded.current = world.castRay(groundRay.current, groundRayLength, true) !== null;

    const {
      forward: moveForward,
      backward: moveBackward,
      left: moveLeft,
      right: moveRight,
      jump
    } = getKeys();
    const sprint = shiftPressed.current || Math.abs(joystickInput.x) > 0.7 ||
      Math.abs(joystickInput.y) > 0.7;
    const speed = sprint ? runSpeed : walkSpeed;
    const forwardInput = (moveForward ? 1 : 0) - (moveBackward ? 1 : 0) - joystickInput.y;
    const sideInput = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0) + joystickInput.x;

    camera.getWorldDirection(forward.current);
    forward.current.y = 0;
    forward.current.normalize();
    right.current.crossVectors(forward.current, camera.up).normalize();
    movement.current.set(0, 0, 0);
    movement.current.addScaledVector(forward.current, forwardInput);
    movement.current.addScaledVector(right.current, sideInput);
    if (movement.current.length() > 0.1) movement.current.normalize();
    else movement.current.set(0, 0, 0);
    movement.current.multiplyScalar(speed);

    const velocity = body.linvel();
    body.setLinvel({ x: movement.current.x, y: velocity.y, z: movement.current.z }, true);
    if ((Math.abs(sideInput) > 0.1 || Math.abs(forwardInput) > 0.1) && grounded.current) {
      stepTimer.current += delta;
      const interval = sprint ? 0.3 : 0.6;
      if (stepTimer.current >= interval) {
        audio.playSFX('footstep', 0.1);
        stepTimer.current = 0;
      }
    } else {
      stepTimer.current = 1;
    }
    if (jump && grounded.current) {
      body.applyImpulse({ x: 0, y: jumpImpulse, z: 0 }, true);
      grounded.current = false;
    }

    target.current.set(position.x, position.y + eyeHeight, position.z);
    camera.position.lerp(target.current, isMobile ? 1 : cameraLerp);
  });

  return h(React.Fragment, null,
    h(RigidBody, {
      ref: bodyRef,
      name: 'player',
      type: 'dynamic',
      colliders: false,
      position: [initialPosition.x, initialPosition.y + eyeHeight + 2, initialPosition.z],
      mass: 1,
      linearDamping: 1.5,
      angularDamping: 1.5,
      canSleep: false,
      lockRotations: true,
      ccd: true
    }, h(CapsuleCollider, { args: [0.8, 0.4] })),
    !isPaused && !isMobile
      ? h(PointerLockControls, { ref: pointerLockRef })
      : null
  );
});

function useWorldModel(modelPath, collisionPath, collisionNode, playerStart, onPositionsReady) {
  const { scene, materials } = useGLTF(modelPath, true);
  const { nodes } = useGLTF(collisionPath, true);
  const model = React.useMemo(() => {
    const clone = scene.clone();
    clone.traverse((object) => {
      if (object.isMesh) {
        const isCityModel = modelPath === '/Grounds/LinguaCity.glb';
        object.receiveShadow = isCityModel;
        object.castShadow = isCityModel && !LOW_POWER_RENDERING &&
          !/ground|sea|street|canal|boundary|asphalt|sidewalk|road|grass|collision|^I_/i.test(object.name);
        if (materials.MazeMat) object.material = materials.MazeMat;
      }
      if (modelPath === '/Grounds/Restaurant.glb' &&
        (object.name === 'I_Male' || object.name === 'I_Female')) {
        object.visible = false;
      }
    });
    return clone;
  }, [scene, materials, modelPath]);

  React.useEffect(() => {
    onPositionsReady({ playerStart });
  }, [onPositionsReady, playerStart]);

  return h(React.Fragment, null,
    h('primitive', { object: model }),
    h(RigidBody, {
      type: 'fixed',
      colliders: 'trimesh',
      friction: 1,
      collisionGroups
    }, nodes[collisionNode]
      ? h('mesh', { geometry: nodes[collisionNode].geometry },
        h('meshBasicMaterial', { visible: false }))
      : null)
  );
}

function LevelWorld({ level, onPositionsReady, isPaused }) {
  if (level === 1) {
    return h(CityWorld, { onPositionsReady, isPaused });
  }
  if (level === 2) {
    return h(HouseWorld, { onPositionsReady });
  }
  if (level === 3) {
    return h(ClassroomWorld, { onPositionsReady });
  }
  if (level === 4) {
    return h(RestaurantWorld, { onPositionsReady });
  }
  if (level === 5) {
    return h(SupermarketWorld, { onPositionsReady });
  }
  return null;
}

function RendererTuning() {
  const gl = useThree((state) => state.gl);
  React.useEffect(() => {
    gl.toneMapping = 4;
    gl.toneMappingExposure = 1.06;
    gl.outputColorSpace = 'srgb';
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = 2;
  }, [gl]);
  return null;
}

function CitySky() {
  return h(React.Fragment, null,
    h('color', { attach: 'background', args: ['#9dc6e8'] }),
    h('mesh', { position: [-260, 300, 220], renderOrder: -2 },
      h('sphereGeometry', { args: [42, 24, 16] }),
      h('meshBasicMaterial', {
        color: '#ffe8ae', transparent: true, opacity: 0.16,
        depthWrite: false, fog: false, toneMapped: false
      })),
    h('mesh', { position: [-260, 300, 220], renderOrder: -1 },
      h('sphereGeometry', { args: [16, 24, 16] }),
      h('meshBasicMaterial', { color: '#fff6dc', fog: false, toneMapped: false }))
  );
}

function CityWorld({ onPositionsReady, isPaused }) {
  const [worldProfile, setWorldProfile] = React.useState(null);
  const spawnPoint = React.useMemo(readCitySpawn, []);
  const fogNear = worldProfile?.fog_near_m ?? 260;
  const fogFar = worldProfile?.fog_far_m ?? 760;
  return h(React.Fragment, null,
    h(RendererTuning),
    h(CitySky),
    h('fog', { attach: 'fog', args: ['#c3d2d2', fogNear, fogFar] }),
    h('ambientLight', { intensity: 0.28, color: 0xffffff }),
    h('hemisphereLight', {
      skyColor: 0xb7d9ec,
      groundColor: 0x8b7b68,
      intensity: 0.55
    }),
    h('directionalLight', {
      position: [-110, 170, 70],
      intensity: 2.1,
      color: 0xffe8c2,
      castShadow: !LOW_POWER_RENDERING,
      'shadow-mapSize-width': 2048,
      'shadow-mapSize-height': 2048,
      'shadow-camera-near': 1,
      'shadow-camera-far': 760,
      'shadow-camera-left': -320,
      'shadow-camera-right': 320,
      'shadow-camera-top': 380,
      'shadow-camera-bottom': -380,
      'shadow-bias': -0.0002,
      'shadow-normalBias': 0.035,
      'shadow-radius': 3
    }),
    h('directionalLight', {
      position: [130, 70, -120],
      intensity: 0.22,
      color: 0xa8c8e4
    }),
    useWorldModel(
      '/Grounds/LinguaCity.glb',
      '/Grounds/LinguaCity_Collision.glb',
      'city_Collision',
      spawnPoint,
      onPositionsReady
    ),
    h(WorldStreamer, { onProfileChange: setWorldProfile }),
    h(CityVehicles, { isPaused })
  );
}

function HouseWorld({ onPositionsReady }) {
  return useWorldModel(
    '/Grounds/House.glb',
    '/Grounds/House_Collision.glb',
    'house_Collision',
    LEVEL_STARTS[2],
    onPositionsReady
  );
}

function ClassroomWorld({ onPositionsReady }) {
  return useWorldModel(
    '/Grounds/Classroom.glb',
    '/Grounds/Classroom_Collision.glb',
    'classroom_Collision',
    LEVEL_STARTS[3],
    onPositionsReady
  );
}

function RestaurantWorld({ onPositionsReady }) {
  return useWorldModel(
    '/Grounds/Restaurant.glb',
    '/Grounds/Restaurant_Collision.glb',
    'restaurant_Collision',
    LEVEL_STARTS[4],
    onPositionsReady
  );
}

function SupermarketWorld({ onPositionsReady }) {
  return useWorldModel(
    '/Grounds/Supermarket.glb',
    '/Grounds/Supermarket_Collision.glb',
    'supermarket_Collision',
    LEVEL_STARTS[5],
    onPositionsReady
  );
}

function DetailedCar({ vehicle, vehicleRef }) {
  const wheelRefs = React.useRef([]);
  const style = vehicle.style === 'van'
    ? { length: 5, cabinLength: 2.85, cabinX: -0.05, cabinHeight: 0.78, windowCount: 3 }
    : vehicle.style === 'hatchback'
      ? { length: 4.25, cabinLength: 2.2, cabinX: -0.22, cabinHeight: 0.6, windowCount: 2 }
      : { length: 4.55, cabinLength: 2.15, cabinX: -0.2, cabinHeight: 0.6, windowCount: 2 };
  const paint = () => h('meshPhysicalMaterial', {
    color: vehicle.color,
    metalness: 0.28,
    roughness: 0.34,
    clearcoat: 0.7,
    clearcoatRoughness: 0.24
  });
  const glass = () => h('meshPhysicalMaterial', {
    color: '#31505b',
    metalness: 0.18,
    roughness: 0.22,
    clearcoat: 0.8
  });
  const box = (key, position, size, material, rotation = [0, 0, 0]) =>
    h('mesh', { key, position, rotation, castShadow: true, receiveShadow: true },
      h('boxGeometry', { args: size }), material);
  const wheelNodes = [-1, 1].flatMap((side, sideIndex) =>
    [-1, 1].map((along, alongIndex) => {
      const index = sideIndex * 2 + alongIndex;
      return h('group', {
        key: `wheel-${side}-${along}`,
        ref: (node) => { wheelRefs.current[index] = node; },
        position: [along * (style.length * 0.31), 0.48, side * 0.96]
      },
      h('mesh', { scale: [0.2, 0.43, 0.43], castShadow: true },
        h('sphereGeometry', { args: [1, 16, 12] }),
        h('meshStandardMaterial', { color: '#202728', roughness: 0.92 })),
      h('mesh', {
        position: [0, 0, side * 0.19],
        rotation: [Math.PI / 2, 0, 0],
        castShadow: true
      },
      h('cylinderGeometry', { args: [0.22, 0.22, 0.07, 16] }),
      h('meshStandardMaterial', { color: '#b8c2bd', metalness: 0.76, roughness: 0.28 })));
    })
  );
  const windows = [-1, 1].flatMap((side) =>
    Array.from({ length: style.windowCount }, (_, index) => {
      const windowWidth = style.cabinLength / style.windowCount - 0.1;
      const x = style.cabinX - style.cabinLength / 2 +
        (index + 0.5) * style.cabinLength / style.windowCount;
      return h('mesh', {
        key: `window-${side}-${index}`,
        position: [x, 1.4 + (style.cabinHeight - 0.6) / 2, side * 0.72],
        castShadow: true
      },
      h('boxGeometry', { args: [windowWidth, 0.38, 0.035] }),
      glass());
    })
  );
  const windshieldY = 1.4 + (style.cabinHeight - 0.6) / 2;
  const windshields = [
    h('mesh', {
      key: 'front-windshield',
      position: [style.cabinX + style.cabinLength / 2 + 0.035, windshieldY, 0],
      rotation: [0, 0, -0.22],
      castShadow: true
    },
    h('boxGeometry', { args: [0.035, 0.4, 1.26] }),
    glass()),
    h('mesh', {
      key: 'rear-windshield',
      position: [style.cabinX - style.cabinLength / 2 - 0.035, windshieldY, 0],
      rotation: [0, 0, 0.22],
      castShadow: true
    },
    h('boxGeometry', { args: [0.035, 0.4, 1.26] }),
    glass())
  ];
  const doors = [-1, 1].flatMap((side) => [-0.55, 0.45].map((x) =>
    box(`door-seam-${side}-${x}`, [x, 0.93, side * 0.93], [0.025, 0.4, 0.025],
      h('meshStandardMaterial', { color: '#263a3c', roughness: 0.6 }))));
  const bodyParts = [
    h('mesh', {
      key: 'main-body',
      position: [0, 0.83, 0],
      scale: [style.length * 0.51, 0.42, 0.92],
      castShadow: true,
      receiveShadow: true
    }, h('sphereGeometry', { args: [1, 20, 14] }), paint()),
    h('mesh', {
      key: 'hood',
      position: [style.length * 0.29, 1.02, 0],
      scale: [0.96, 0.23, 0.88],
      castShadow: true
    }, h('sphereGeometry', { args: [1, 16, 12] }), paint()),
    h('mesh', {
      key: 'trunk',
      position: [-style.length * 0.35, 0.99, 0],
      scale: [0.72, 0.22, 0.87],
      castShadow: true
    }, h('sphereGeometry', { args: [1, 16, 12] }), paint()),
    h('mesh', {
      key: 'cabin',
      position: [style.cabinX, 1.35 + (style.cabinHeight - 0.6) / 2, 0],
      castShadow: true,
      receiveShadow: true
    },
    h('boxGeometry', { args: [style.cabinLength, style.cabinHeight, 1.42] }),
    paint()),
    h('mesh', {
      key: 'roof',
      position: [style.cabinX, 1.67 + (style.cabinHeight - 0.6) / 2, 0],
      scale: [style.cabinLength * 0.46, 0.11, 0.73],
      castShadow: true
    }, h('sphereGeometry', { args: [1, 16, 10] }), paint()),
    ...windows,
    ...windshields,
    ...doors,
    ...wheelNodes,
    ...[-1, 1].flatMap((side) => [
      box(`mirror-${side}`, [0.65, 1.35, side * 0.99], [0.24, 0.12, 0.16],
        h('meshStandardMaterial', { color: vehicle.color, metalness: 0.2, roughness: 0.38 })),
      box(`handle-${side}-front`, [0.2, 1.08, side * 0.95], [0.2, 0.045, 0.025],
        h('meshStandardMaterial', { color: '#d8d6ca', metalness: 0.7, roughness: 0.3 })),
      box(`handle-${side}-rear`, [-0.8, 1.08, side * 0.95], [0.2, 0.045, 0.025],
        h('meshStandardMaterial', { color: '#d8d6ca', metalness: 0.7, roughness: 0.3 }))
    ]),
    box('front-bumper', [style.length * 0.51, 0.58, 0], [0.16, 0.16, 1.62],
      h('meshStandardMaterial', { color: '#596263', metalness: 0.45, roughness: 0.4 })),
    box('rear-bumper', [-style.length * 0.51, 0.58, 0], [0.16, 0.16, 1.62],
      h('meshStandardMaterial', { color: '#596263', metalness: 0.45, roughness: 0.4 })),
    box('front-grille', [style.length * 0.51 + 0.015, 0.78, 0], [0.04, 0.25, 0.58],
      h('meshStandardMaterial', { color: '#202b2d', metalness: 0.35, roughness: 0.55 })),
    ...[0.72, 0.8, 0.88].map((y) =>
      box(`grille-bar-${y}`, [style.length * 0.51 + 0.04, y, 0], [0.025, 0.025, 0.44],
        h('meshStandardMaterial', { color: '#9da9a5', metalness: 0.72, roughness: 0.3 }))),
    ...[-1, 1].flatMap((side) => [
      box(`headlight-${side}`, [style.length * 0.49, 0.94, side * 0.58],
        [0.08, 0.2, 0.34],
        h('meshStandardMaterial', {
          color: '#fff2c7',
          emissive: '#e5bc69',
          emissiveIntensity: 0.3,
          roughness: 0.28
        })),
      box(`tail-light-${side}`, [-style.length * 0.49, 0.91, side * 0.58],
        [0.08, 0.22, 0.28],
        h('meshStandardMaterial', {
          color: '#bf493f',
          emissive: '#7c1915',
          emissiveIntensity: 0.2,
          roughness: 0.3
        }))
    ])
  ];

  if (vehicle.style === 'taxi') {
    bodyParts.push(box('taxi-sign', [-0.18, 1.82, 0], [0.62, 0.18, 0.34],
      h('meshStandardMaterial', {
        color: '#f4c343',
        emissive: '#8b6915',
        emissiveIntensity: 0.15,
        roughness: 0.42
      })));
  }

  useFrame((_, delta) => {
    if (!vehicle.wheelSpeed) return;
    wheelRefs.current.forEach((wheel) => {
      if (wheel) wheel.rotation.z -= vehicle.wheelSpeed * delta / 0.43;
    });
  });

  return h('group', {
    ref: vehicleRef,
    name: 'I_car',
    position: vehicle.position,
    rotation: [0, vehicle.rotation || 0, 0]
  }, ...bodyParts);
}

const PARKED_CARS = [
  { id: 'parked-sedan', position: [-75, 0, 91], rotation: 0, style: 'sedan', color: '#54879a' },
  { id: 'parked-hatchback', position: [152, 0, 99], rotation: Math.PI, style: 'hatchback', color: '#ddd8c9' },
  { id: 'parked-van', position: [33, 0, 18], rotation: -Math.PI / 2, style: 'van', color: '#bd6252' },
  { id: 'parked-taxi', position: [33, 0, -94], rotation: -Math.PI / 2, style: 'taxi', color: '#e1ad45' }
];

const MOVING_CARS = [
  {
    id: 'traffic-sedan',
    axis: 'x',
    lane: -54,
    min: -180,
    max: 180,
    direction: 1,
    speed: 6.5,
    start: -145,
    style: 'sedan',
    color: '#477d68'
  },
  {
    id: 'traffic-hatchback',
    axis: 'x',
    lane: -46,
    min: -180,
    max: 180,
    direction: -1,
    speed: 5.5,
    start: 130,
    style: 'hatchback',
    color: '#647eae'
  },
  {
    id: 'traffic-van',
    axis: 'x',
    lane: 227,
    min: -145,
    max: 135,
    direction: 1,
    speed: 5.2,
    start: -92,
    style: 'van',
    color: '#e4dfd1'
  },
  {
    id: 'traffic-taxi',
    axis: 'x',
    lane: 233,
    min: -145,
    max: 135,
    direction: -1,
    speed: 6,
    start: 95,
    style: 'taxi',
    color: '#c95f4c'
  }
];

function MovingCar({ vehicle, isPaused }) {
  const groupRef = React.useRef(null);
  const distance = React.useRef(vehicle.direction > 0
    ? vehicle.start - vehicle.min
    : vehicle.max - vehicle.start);
  const span = vehicle.max - vehicle.min;
  const rotation = vehicle.direction > 0 ? 0 : Math.PI;
  const position = vehicle.axis === 'x'
    ? [vehicle.start, 0, vehicle.lane]
    : [vehicle.lane, 0, vehicle.start];

  useFrame((_, delta) => {
    if (isPaused || !groupRef.current) return;
    distance.current = (distance.current + vehicle.speed * delta) % span;
    const along = vehicle.direction > 0
      ? vehicle.min + distance.current
      : vehicle.max - distance.current;
    if (vehicle.axis === 'x') groupRef.current.position.x = along;
    else groupRef.current.position.z = along;
  });

  return h(DetailedCar, {
    vehicle: {
      ...vehicle,
      position,
      rotation,
      wheelSpeed: vehicle.speed * vehicle.direction
    },
    vehicleRef: groupRef
  });
}

function CityVehicles({ isPaused }) {
  return h(React.Fragment, null,
    PARKED_CARS.map((vehicle) => h(DetailedCar, { key: vehicle.id, vehicle })),
    MOVING_CARS.map((vehicle) =>
      h(MovingCar, { key: vehicle.id, vehicle, isPaused }))
  );
}

const WORLD_NPCS = {
  1: [
    {
      id: 'max',
      npcKey: 'max',
      name: { ar: 'ماكس بيكر', en: 'Max Becker' },
      model: 'Ranger',
      path: [{ x: 27, z: 91 }, { x: 36, z: 91 }, { x: 36, z: 100 }, { x: 27, z: 100 }],
      speed: 1.2,
      walkAnimation: 'Walking_A'
    },
    {
      id: 'city-roamer-1',
      name: { ar: 'مقيم في المدينة', en: 'Town resident' },
      model: 'Rogue',
      path: [{ x: 17, z: 93 }, { x: 24, z: 93 }, { x: 24, z: 99 }, { x: 17, z: 99 }],
      speed: 1.05,
      walkAnimation: 'Walking_B'
    },
    {
      id: 'city-roamer-2',
      name: { ar: 'مقيم في المدينة', en: 'Town resident' },
      model: 'Mage',
      path: [{ x: 38, z: 106 }, { x: 45, z: 106 }, { x: 45, z: 112 }, { x: 38, z: 112 }],
      speed: 1.1,
      walkAnimation: 'Walking_C'
    }
  ],
  2: [{
    id: 'herr_weber',
    npcKey: 'herr_weber',
    name: { ar: 'السيد هاينريش فيبر', en: 'Herr Heinrich Weber' },
    model: 'Knight',
    path: [{ x: -2, z: 4 }, { x: 2, z: 4 }, { x: 2, z: 8 }, { x: -2, z: 8 }],
    speed: 0.75,
    walkAnimation: 'Walking_B'
  }, {
    id: 'house-visitor',
    name: { ar: 'زائر', en: 'Visitor' },
    model: 'Rogue',
    path: [{ x: 4, z: 3 }, { x: 7, z: 3 }, { x: 7, z: 7 }, { x: 4, z: 7 }],
    speed: 0.65,
    walkAnimation: 'Walking_C',
    activityAnimation: 'Interact',
    stopDuration: 2.4
  }],
  3: [{
    id: 'lukas',
    npcKey: 'lukas',
    name: { ar: 'لوكاس فاغنر', en: 'Lukas Wagner' },
    model: 'Mage',
    path: [{ x: -3, z: -2 }, { x: 3, z: -2 }, { x: 3, z: 2 }, { x: -3, z: 2 }],
    speed: 0.85,
    walkAnimation: 'Walking_A',
    activityAnimation: 'Interact',
    stopDuration: 2
  }, {
    id: 'classmate-1',
    name: { ar: 'طالب', en: 'Student' },
    model: 'Ranger',
    path: [{ x: -7, z: -4 }, { x: -4, z: -4 }, { x: -4, z: 1 }, { x: -7, z: 1 }],
    speed: 0.6,
    walkAnimation: 'Walking_B',
    activityAnimation: 'Use_Item',
    stopDuration: 3
  }],
  4: [{
    id: 'sophie',
    npcKey: 'sophie',
    name: { ar: 'صوفي مولر', en: 'Sophie Müller' },
    model: 'Rogue',
    path: [{ x: -3, z: 1 }, { x: 2, z: 1 }, { x: 2, z: 5 }, { x: -3, z: 5 }],
    speed: 0.8,
    walkAnimation: 'Walking_C',
    activityAnimation: 'Use_Item',
    stopDuration: 2.2
  }, {
    id: 'karim',
    npcKey: 'karim',
    name: { ar: 'كريم يلماز', en: 'Karim Yilmaz' },
    model: 'Knight',
    path: [{ x: 6, z: 4 }, { x: 8, z: 4 }, { x: 8, z: 7 }, { x: 6, z: 7 }],
    speed: 0.55,
    walkAnimation: 'Walking_B',
    activityAnimation: 'Use_Item',
    stopDuration: 3.6,
    initialWait: 1.4
  }, {
    id: 'maria',
    npcKey: 'maria',
    name: { ar: 'ماريا فيشر', en: 'Maria Fischer' },
    model: 'Ranger',
    path: [{ x: -6, z: 2 }, { x: 4, z: 2 }, { x: 4, z: 7 }, { x: -6, z: 7 }],
    speed: 0.9,
    walkAnimation: 'Walking_A',
    activityAnimation: 'Interact',
    stopDuration: 1.8
  }, {
    id: 'restaurant-diner',
    name: { ar: 'زبون', en: 'Diner' },
    model: 'Mage',
    path: [{ x: 9, z: 2 }, { x: 10, z: 2 }, { x: 10, z: 5 }, { x: 9, z: 5 }],
    speed: 0.4,
    walkAnimation: 'Walking_C',
    activityAnimation: 'Use_Item',
    stopDuration: 4,
    initialWait: 2
  }, {
    id: 'restaurant-leaving-guest',
    name: { ar: 'مغادر', en: 'Leaving guest' },
    model: 'Barbarian',
    path: [{ x: 8, z: 8 }, { x: 8, z: 13 }, { x: 3, z: 19 }, { x: -5, z: 25 }],
    speed: 0.8,
    walkAnimation: 'Walking_B',
    leaveAfterRoute: true,
    initialWait: 5
  }],
  5: [{
    id: 'hanna',
    npcKey: 'hanna',
    name: { ar: 'هانا شنايدر', en: 'Hanna Schneider' },
    model: 'Barbarian',
    path: [{ x: -3, z: 2 }, { x: 3, z: 2 }, { x: 3, z: 7 }, { x: -3, z: 7 }],
    speed: 0.8,
    walkAnimation: 'Walking_B',
    activityAnimation: 'Interact',
    stopDuration: 2
  }, {
    id: 'leon',
    npcKey: 'leon',
    name: { ar: 'ليون هارتمان', en: 'Leon Hartmann' },
    model: 'Rogue',
    path: [{ x: -7, z: 5 }, { x: -4, z: 5 }, { x: -4, z: 10 }, { x: -7, z: 10 }],
    speed: 0.55,
    walkAnimation: 'Walking_C',
    activityAnimation: 'PickUp',
    stopDuration: 3.4,
    initialWait: 1.2
  }, {
    id: 'aylin',
    npcKey: 'aylin',
    name: { ar: 'أيلين دمير', en: 'Aylin Demir' },
    model: 'Mage',
    path: [{ x: 5, z: 10 }, { x: 8, z: 10 }, { x: 8, z: 15 }, { x: 5, z: 15 }],
    speed: 0.6,
    walkAnimation: 'Walking_A',
    activityAnimation: 'PickUp',
    stopDuration: 3,
    initialWait: 2.5
  }, {
    id: 'supermarket-shopper',
    name: { ar: 'متسوق', en: 'Shopper' },
    model: 'Knight',
    path: [{ x: 10, z: 8 }, { x: 12, z: 8 }, { x: 12, z: 13 }, { x: 10, z: 13 }],
    speed: 0.5,
    walkAnimation: 'Walking_B',
    activityAnimation: 'PickUp',
    stopDuration: 3.2,
    initialWait: 3
  }, {
    id: 'supermarket-leaving-shopper',
    name: { ar: 'متسوق مغادر', en: 'Leaving shopper' },
    model: 'Ranger',
    path: [{ x: -9, z: 10 }, { x: -9, z: 17 }, { x: -4, z: 25 }, { x: 0, z: 42 }],
    speed: 0.9,
    walkAnimation: 'Walking_C',
    leaveAfterRoute: true,
    initialWait: 6
  }]
};

function bindNpcAnimation(clip, nodes) {
  if (!clip) return [];
  return clip.tracks.map((track) => {
    const property = ['.quaternion', '.position', '.scale']
      .find((suffix) => track.name.endsWith(suffix));
    if (!property) return null;
    const node = nodes.get(track.name.slice(0, -property.length));
    return node ? { node, property, interpolant: track.createInterpolant() } : null;
  }).filter(Boolean);
}

function applyNpcAnimation(tracks, time, duration) {
  if (!duration) return;
  const clipTime = time % duration;
  tracks.forEach(({ node, property, interpolant }) => {
    const value = interpolant.evaluate(clipTime);
    if (property === '.quaternion') node.quaternion.fromArray(value);
    else if (property === '.position') node.position.fromArray(value);
    else node.scale.fromArray(value);
  });
}

function NPCCharacter({
  npc,
  movementAnimations,
  idleAnimations,
  onPosition,
  playerBody,
  isPaused,
  isEngaged,
  navigationManager
}) {
  const { scene } = useGLTF(`/Grounds/NPC/${npc.model}.glb`, true);
  const groupRef = React.useRef(null);
  const routeIndex = React.useRef(1);
  const waitTime = React.useRef(npc.initialWait ?? 0.5);
  const animationTime = React.useRef(0);
  const animationAccumulator = React.useRef(0);
  const animationMode = React.useRef(null);
  const hasLeft = React.useRef(false);
  const steering = React.useMemo(() => ({ x: 0, z: 0 }), []);
  const model = React.useMemo(() => scene.clone(true), [scene]);
  const nodes = React.useMemo(() => {
    const lookup = new Map();
    model.traverse((node) => {
      if (node.name) lookup.set(node.name, node);
      if (node.isMesh || node.isSkinnedMesh) {
        node.castShadow = false;
        node.receiveShadow = false;
      }
    });
    model.traverse((node) => {
      if (!node.isSkinnedMesh) return;
      const skeleton = node.skeleton.clone();
      skeleton.bones = skeleton.bones.map((bone) => lookup.get(bone.name));
      node.bind(skeleton, node.bindMatrix);
    });
    return lookup;
  }, [model]);
  const walkClip = movementAnimations.find((clip) => clip.name === npc.walkAnimation) ||
    movementAnimations.find((clip) => clip.name === 'Walking_A');
  const idleClip = idleAnimations.find((clip) => clip.name === 'Idle_A') ||
    idleAnimations.find((clip) => clip.name === 'Idle_B');
  const activityClip = npc.activityAnimation
    ? idleAnimations.find((clip) => clip.name === npc.activityAnimation)
    : null;
  const interactClip = idleAnimations.find((clip) => clip.name === 'Interact');
  const walkTracks = React.useMemo(
    () => bindNpcAnimation(walkClip, nodes),
    [walkClip, nodes]
  );
  const idleTracks = React.useMemo(
    () => bindNpcAnimation(idleClip, nodes),
    [idleClip, nodes]
  );
  const activityTracks = React.useMemo(
    () => bindNpcAnimation(activityClip, nodes),
    [activityClip, nodes]
  );
  const interactTracks = React.useMemo(
    () => bindNpcAnimation(interactClip, nodes),
    [interactClip, nodes]
  );

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || hasLeft.current) return;

    let walking = false;
    if (!isPaused && !isEngaged && npc.path.length > 1) {
      if (waitTime.current > 0) {
        waitTime.current = Math.max(0, waitTime.current - delta);
      } else {
        const target = npc.path[routeIndex.current];
        const dx = target.x - group.position.x;
        const dz = target.z - group.position.z;
        const distance = Math.hypot(dx, dz);

        if (distance < 0.2) {
          if (npc.leaveAfterRoute && routeIndex.current === npc.path.length - 1) {
            hasLeft.current = true;
            group.visible = false;
            onPosition(npc.id, null, null);
            return;
          }
          routeIndex.current = (routeIndex.current + 1) % npc.path.length;
          waitTime.current = npc.stopDuration ?? 1.1;
        } else {
          steering.x = (dx / distance) * npc.speed;
          steering.z = (dz / distance) * npc.speed;
          if (npc.livingResident && navigationManager) {
            const player = playerBody.current && playerBody.current.translation();
            navigationManager.avoid(npc.id, group.position, steering, player);
          }
          const velocityLength = Math.hypot(steering.x, steering.z) || 1;
          const step = Math.min(distance, velocityLength * delta);
          group.position.x += (steering.x / velocityLength) * step;
          group.position.z += (steering.z / velocityLength) * step;
          group.rotation.y = Math.atan2(steering.x, steering.z);
          walking = true;
        }
      }
    }

    if (isEngaged) {
      const player = playerBody.current && playerBody.current.translation();
      if (player) {
        const dx = player.x - group.position.x;
        const dz = player.z - group.position.z;
        if (Math.hypot(dx, dz) > 0.01) group.rotation.y = Math.atan2(dx, dz);
      }
    }

    onPosition(npc.id, group.position.x, group.position.z);
    if (isPaused) return;
    const mode = isEngaged
      ? 'interact'
      : walking
        ? 'walk'
        : npc.activityAnimation
          ? 'activity'
          : 'idle';
    if (animationMode.current !== mode) {
      animationMode.current = mode;
      animationTime.current = 0;
      animationAccumulator.current = 0;
    }
    if (npc.livingResident) {
      animationAccumulator.current += delta;
      if (animationAccumulator.current < 1 / 15) return;
      animationTime.current += animationAccumulator.current;
      animationAccumulator.current = 0;
    } else {
      animationTime.current += delta;
    }
    const clip = mode === 'walk'
      ? walkClip
      : mode === 'interact'
        ? interactClip
        : mode === 'activity'
          ? activityClip
          : idleClip;
    const tracks = mode === 'walk'
      ? walkTracks
      : mode === 'interact'
        ? interactTracks
        : mode === 'activity'
          ? activityTracks
          : idleTracks;
    applyNpcAnimation(tracks, animationTime.current, clip && clip.duration);
  });

  return h('group', {
    ref: groupRef,
    position: [npc.path[0].x, 0, npc.path[0].z]
  },
    h('primitive', { object: model }));
}

function WorldExplorer({
  joystickInput,
  currentLevel,
  onLevelComplete,
  onObjectClick,
  isPaused,
  isMobile
}) {
  const playerBody = React.useRef(null);
  const multiplayerSocket = React.useRef(null);
  const remotePlayersById = React.useRef(new Map());
  const localPlayerPosition = React.useRef({ x: 30, z: 95 });
  const renderNearbyPlayers = React.useRef(null);
  const movementSyncTimer = React.useRef(0);
  const [remotePlayers, setRemotePlayers] = React.useState([]);
  const [positions, setPositions] = React.useState(null);
  const [level, setLevel] = React.useState(currentLevel);
  const [isLoading, setIsLoading] = React.useState(false);
  const [nearbyPortal, setNearbyPortal] = React.useState(null);
  const [nearbyNpc, setNearbyNpc] = React.useState(null);
  const [engagedNpcKey, setEngagedNpcKey] = React.useState(null);
  const [npcSpeech, setNpcSpeech] = React.useState(null);
  const [residentNpcs, setResidentNpcs] = React.useState([]);
  const firstScene = React.useRef(true);
  const pendingSpawn = React.useRef(null);
  const currentPortal = React.useRef(null);
  const currentNpc = React.useRef(null);
  const npcPositions = React.useRef(new Map());
  const speechBubbleElement = React.useRef(null);
  const interactionPromptElement = React.useRef(null);
  const interactionPromptNpcId = React.useRef(null);
  const cityMapElement = React.useRef(null);
  const cityMapPlayerMarker = React.useRef(null);
  const cityMapUpdate = React.useRef(null);
  const speechSequence = React.useRef(0);
  const chatOpen = React.useRef(false);
  const townSimulation = React.useRef(null);
  const townNavigation = React.useRef(null);
  const residentSelectionTimer = React.useRef(0);
  const residentSelectionSignature = React.useRef('');
  const screenPosition = React.useMemo(() => new Vector3(), []);
  const mapDirection = React.useMemo(() => new Vector3(), []);
  const loadingRef = React.useRef(false);
  const readyLevel = React.useRef(null);
  const gameUiRef = React.useRef(null);
  const gameRef = React.useRef(null);
  const worldStateRef = React.useRef(null);
  const selfPlayerRef = React.useRef(null);
  const questRef = React.useRef(null);
  const gameUiPlayerSignature = React.useRef('');
  const [game, setGame] = React.useState(null);
  const [selfId, setSelfId] = React.useState(null);
  const [movementLocked, setMovementLocked] = React.useState(false);
  const [emoteStates, setEmoteStates] = React.useState({});
  const { camera, gl } = useThree();
  const { animations: movementAnimations } = useGLTF('/Grounds/NPC/Movement.glb', true);
  const { animations: idleAnimations } = useGLTF('/Grounds/NPC/General.glb', true);
  const activeNpcs = WORLD_NPCS[level] || [];
  const language = 'de';

  const sendGameMessage = React.useCallback((payload) => {
    const socket = multiplayerSocket.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
      return true;
    }
    gameUiRef.current?.showToast('Nicht mit dem Server verbunden.');
    return false;
  }, []);

  const handleGameState = React.useCallback((state) => {
    gameRef.current = state;
    setGame(state);
    if (state) window.dispatchEvent(new CustomEvent('lw-game-state', { detail: state }));
  }, []);

  const applyWorldState = React.useCallback((state) => {
    if (!state) return;
    worldStateRef.current = state;
    if (state.weather) window.LivingTownWeather = state.weather;
    const simulation = townSimulation.current;
    if (simulation && typeof simulation.setWorldState === 'function') {
      simulation.setWorldState(state);
    }
    window.dispatchEvent(new CustomEvent('lw-world-state', { detail: state }));
  }, []);

  const showEmote = React.useCallback((playerId, emote) => {
    if (!playerId || !emote) return;
    const at = Date.now();
    setEmoteStates((previous) => ({ ...previous, [playerId]: { id: emote, at } }));
    window.setTimeout(() => {
      setEmoteStates((previous) => {
        if (previous[playerId]?.at !== at) return previous;
        const next = { ...previous };
        delete next[playerId];
        return next;
      });
    }, 2800);
  }, []);

  const collectHuntItem = React.useCallback((spawnId) => {
    sendGameMessage({ type: 'hunt:collect', spawnId });
  }, [sendGameMessage]);

  React.useEffect(() => {
    const ui = createGameUi({
      send: sendGameMessage,
      onGameState: handleGameState,
      onWorldState: applyWorldState,
      onHuntCollect: () => audio.playSFX('click', 0.35),
      onQuestState: (state) => {
        questRef.current = state;
      },
      onEmote: (emote) => {
        const names = { wave: 'Winken', dance: 'Tanzen', laugh: 'Lachen', point: 'Zeigen', cheer: 'Jubeln', spin: 'Drehen' };
        gameUiRef.current?.showToast(`Geste: ${names[emote] || emote}`);
      }
    });
    gameUiRef.current = ui;
    return () => {
      ui.destroy();
      if (gameUiRef.current === ui) gameUiRef.current = null;
    };
  }, [applyWorldState, handleGameState, sendGameMessage]);

  React.useEffect(() => {
    const onObjectForQuest = (event) => {
      const rawKey = event.detail?.key;
      if (typeof rawKey !== 'string') return;
      const key = rawKey.toLowerCase().trim();
      const quest = questRef.current;
      const task = quest?.tasks?.find((entry) => entry.key.toLowerCase() === key);
      if (!task || task.completed) return;
      sendGameMessage({ type: 'quest:collect', key: task.key });
    };
    window.addEventListener('german-world-object-click', onObjectForQuest);
    return () => window.removeEventListener('german-world-object-click', onObjectForQuest);
  }, [sendGameMessage]);

  React.useEffect(() => {
    let locked = false;
    if (game && game.phase !== 'ended') {
      const role = selfId ? game.roles?.[selfId] : null;
      locked = game.game === 'quiz'
        || game.phase === 'countdown'
        || (game.game === 'hide' && game.phase === 'hiding' && (role === 'seeker' || role === 'found'));
    }
    setMovementLocked(locked);
  }, [game, selfId]);

  React.useEffect(() => {
    if (!game || (game.game !== 'tag' && game.game !== 'hide') || game.phase !== 'playing') return undefined;
    const onTagKey = (event) => {
      if (event.repeat || event.key.toLowerCase() !== 't') return;
      const target = event.target;
      if (target && target.matches?.('input, textarea, select, [contenteditable="true"]')) return;
      const role = selfId ? game.roles?.[selfId] : null;
      const isHunter = game.game === 'tag' ? role === 'it' : role === 'seeker';
      if (!isHunter) {
        gameUiRef.current?.showToast(game.game === 'tag' ? 'Nur der Fänger kann fangen.' : 'Nur die suchende Person kann fangen.');
        return;
      }
      const body = playerBody.current;
      if (!body) return;
      const player = body.translation();
      let closest = null;
      let closestDistance = 4;
      remotePlayersById.current.forEach((remote) => {
        const distance = Math.hypot(player.x - remote.x, player.z - remote.z);
        if (distance <= closestDistance) {
          closest = remote;
          closestDistance = distance;
        }
      });
      if (!closest) {
        gameUiRef.current?.showToast('Geh näher an eine Person heran.');
        return;
      }
      sendGameMessage({ type: 'tag:attempt', targetId: closest.id });
    };
    window.addEventListener('keydown', onTagKey);
    return () => window.removeEventListener('keydown', onTagKey);
  }, [game, selfId, sendGameMessage]);

  React.useEffect(() => {
    const panel = createMultiplayerPanel();
    const status = panel.querySelector('.lw-multiplayer-state');
    const nameInput = panel.querySelector('.lw-multiplayer-name-row input');
    const modelSelect = panel.querySelector('.lw-multiplayer-character-row select');
    const publicTab = panel.querySelector('[data-chat-tab="public"]');
    const nearbyTab = panel.querySelector('[data-chat-tab="nearby"]');
    const nearbyPlayers = panel.querySelector('.lw-nearby-players');
    const privateHeading = panel.querySelector('.lw-private-heading');
    const privateTitle = privateHeading.querySelector('span');
    const privateBackButton = privateHeading.querySelector('button');
    const messages = panel.querySelector('.lw-multiplayer-messages');
    const chatForm = panel.querySelector('.lw-multiplayer-compose');
    const chatInput = chatForm.querySelector('input');
    const voiceButton = panel.querySelector('.lw-voice-toggle');
    const pttButton = panel.querySelector('.lw-ptt-toggle');
    const settingsForm = panel.querySelector('.lw-multiplayer-settings form');
    const endpointInput = settingsForm.querySelector('input');
    const queryEndpoint = new URLSearchParams(window.location.search).get('multiplayer');
    const localHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    const metaEndpoint = localHost ? null : document.querySelector('meta[name="lw-multiplayer-url"]')?.content;
    const requestedEndpoint = queryEndpoint || metaEndpoint;
    const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const defaultEndpoint = localHost || window.location.protocol === 'http:'
      ? `${socketProtocol}//${window.location.hostname}:3031/multiplayer`
      : `${socketProtocol}//${window.location.host}/multiplayer`;
    const savedEndpoint = localStorage.getItem('lw_multiplayer_url');
    const staleLocalEndpoint = localHost && /^ws:\/\/(localhost|127\.0\.0\.1):(3000|3001)\/multiplayer$/.test(savedEndpoint || '');
    const shouldConnectAutomatically = !localHost || Boolean(
      requestedEndpoint || (savedEndpoint && savedEndpoint !== defaultEndpoint)
    );
    endpointInput.value = requestedEndpoint
      || (savedEndpoint && !staleLocalEndpoint ? savedEndpoint : defaultEndpoint);
    const savedName = localStorage.getItem('lw_player_name');
    const playerName = savedName || `Gast-${Math.floor(1000 + Math.random() * 9000)}`;
    nameInput.value = playerName;
    localStorage.setItem('lw_player_name', playerName);
    const savedModel = localStorage.getItem('lw_player_model');
    modelSelect.value = PLAYER_MODEL_OPTIONS.some((option) => option.id === savedModel) ? savedModel : 'Ranger';
    localStorage.setItem('lw_player_model', modelSelect.value);
    document.body.appendChild(panel);
    const voicePeers = new Map();
    let localStream = null;
    let localPlayerId = null;
    let voiceActive = false;
    let transmitting = false;
    let activePrivate = null;
    let activeChatView = 'public';
    let reconnectTimer = null;
    let reconnectAttempt = 0;
    let audioContext = null;
    let spatialTimer = 0;
    const publicTranscript = [];
    const privateThreads = new Map();

    const sendSignal = (target, signal) => {
      if (multiplayerSocket.current?.readyState === WebSocket.OPEN) {
        multiplayerSocket.current.send(JSON.stringify({ type: 'signal', target, signal }));
      }
    };
    const closeVoicePeer = (peerId) => {
      const peer = voicePeers.get(peerId);
      if (!peer) return;
      peer.connection.close();
      peer.source?.disconnect();
      peer.panner?.disconnect();
      peer.audio.remove();
      voicePeers.delete(peerId);
    };
    const updateVoicePositions = () => {
      if (!audioContext) return;
      const body = playerBody.current;
      if (!body) return;
      const listener = audioContext.listener;
      const position = body.translation();
      if (listener.positionX) {
        listener.positionX.value = position.x;
        listener.positionY.value = position.y + 1.5;
        listener.positionZ.value = position.z;
      } else {
        listener.setPosition(position.x, position.y + 1.5, position.z);
      }
      const forward = new Vector3();
      camera.getWorldDirection(forward);
      const up = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      if (listener.forwardX) {
        listener.forwardX.value = forward.x;
        listener.forwardY.value = forward.y;
        listener.forwardZ.value = forward.z;
        listener.upX.value = up.x;
        listener.upY.value = up.y;
        listener.upZ.value = up.z;
      } else {
        listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
      }
      voicePeers.forEach((peer, peerId) => {
        const remote = remotePlayersById.current.get(peerId);
        if (!remote || !peer.panner) return;
        if (peer.panner.positionX) {
          peer.panner.positionX.value = remote.x;
          peer.panner.positionY.value = 1.5;
          peer.panner.positionZ.value = remote.z;
        } else {
          peer.panner.setPosition(remote.x, 1.5, remote.z);
        }
      });
    };
    const ensureAudioContext = async () => {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!audioContext) audioContext = new AudioContextClass();
      if (audioContext.state === 'suspended') await audioContext.resume().catch(() => {});
      return audioContext;
    };
    const createVoicePeer = (peerId, isInitiator) => {
      if (voicePeers.has(peerId)) return voicePeers.get(peerId).connection;
      const connection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      const audio = document.createElement('audio');
      audio.autoplay = true;
      audio.playsInline = true;
      audio.hidden = true;
      document.body.appendChild(audio);
      const peer = { connection, audio, source: null, panner: null };
      voicePeers.set(peerId, peer);
      if (localStream) localStream.getTracks().forEach((track) => connection.addTrack(track, localStream));
      connection.onicecandidate = (event) => {
        if (event.candidate) sendSignal(peerId, { kind: 'candidate', candidate: event.candidate.toJSON() });
      };
      connection.ontrack = (event) => {
        if (audioContext) {
          try {
            const source = audioContext.createMediaStreamSource(event.streams[0]);
            const panner = audioContext.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.refDistance = 1.8;
            panner.maxDistance = 30;
            panner.rolloffFactor = 1.2;
            source.connect(panner).connect(audioContext.destination);
            peer.source = source;
            peer.panner = panner;
            updateVoicePositions();
            return;
          } catch {
            peer.source = null;
            peer.panner = null;
          }
        }
        audio.srcObject = event.streams[0];
        audio.play().catch(() => {});
      };
      connection.onconnectionstatechange = () => {
        if (connection.connectionState === 'failed' || connection.connectionState === 'closed') {
          closeVoicePeer(peerId);
        }
      };
      if (isInitiator) {
        connection.createOffer()
          .then((offer) => connection.setLocalDescription(offer))
          .then(() => sendSignal(peerId, { kind: 'description', description: connection.localDescription }))
          .catch(() => addMessage('', 'Der Sprachkanal zu einer Person konnte nicht aufgebaut werden.', true));
      }
      return connection;
    };
    const startVoiceWith = (player) => {
      if (!voiceActive || !player.voiceEnabled || !localPlayerId || localPlayerId.localeCompare(player.id) >= 0) return;
      createVoicePeer(player.id, true);
    };
    const setVoiceButton = (active) => {
      voiceButton.classList.toggle('is-active', active);
      voiceButton.setAttribute('aria-pressed', String(active));
      voiceButton.setAttribute('aria-label', active ? 'Sprachchat deaktivieren' : 'Sprachchat aktivieren');
      voiceButton.title = active ? 'Sprachchat deaktivieren' : 'Sprachchat aktivieren';
    };
    const setPttButton = (active) => {
      pttButton.classList.toggle('is-active', active);
      pttButton.setAttribute('aria-pressed', String(active));
      pttButton.textContent = active ? 'LIVE' : 'PTT';
    };
    const setTransmitting = (active) => {
      if (!voiceActive) {
        if (active) addMessage('', 'Aktiviere zuerst den Sprachchat über das Mikrofon-Symbol.', true);
        return;
      }
      transmitting = Boolean(active);
      localStream?.getAudioTracks().forEach((track) => {
        track.enabled = transmitting;
      });
      setPttButton(transmitting);
      if (multiplayerSocket.current?.readyState === WebSocket.OPEN) {
        multiplayerSocket.current.send(JSON.stringify({
          type: 'voice-state',
          enabled: true,
          transmitting
        }));
      }
      if (selfPlayerRef.current) {
        selfPlayerRef.current.transmitting = transmitting;
        gameUiPlayerSignature.current = '';
        updatePlayers();
      }
    };
    const stopVoice = (notifyRoom) => {
      if (notifyRoom && multiplayerSocket.current?.readyState === WebSocket.OPEN) {
        multiplayerSocket.current.send(JSON.stringify({
          type: 'voice-state',
          enabled: false,
          transmitting: false
        }));
      }
      voiceActive = false;
      transmitting = false;
      setPttButton(false);
      voicePeers.forEach((peer) => {
        peer.connection.close();
        peer.source?.disconnect();
        peer.panner?.disconnect();
        peer.audio.remove();
      });
      voicePeers.clear();
      localStream?.getTracks().forEach((track) => track.stop());
      localStream = null;
      setVoiceButton(false);
      if (selfPlayerRef.current) {
        selfPlayerRef.current.transmitting = false;
        gameUiPlayerSignature.current = '';
        updatePlayers();
      }
    };

    const setStatus = (text, online = false) => {
      status.textContent = text;
      status.classList.toggle('is-online', online);
      gameUiRef.current?.setConnection(text, online);
    };
    const addMessage = (name, text, isSystem = false, container = messages, metadata = {}) => {
      const shouldStickToBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 48;
      if (isSystem) {
        const notice = document.createElement('div');
        notice.className = 'lw-chat-system';
        notice.textContent = text;
        container.appendChild(notice);
      } else {
        const ownMessage = metadata.senderId === localPlayerId;
        const senderId = metadata.senderId || name;
        let group = container.lastElementChild;
        if (!group || !group.classList.contains('lw-chat-group') || group.dataset.sender !== String(senderId)) {
          group = document.createElement('div');
          group.className = `lw-chat-group${ownMessage ? ' is-own' : ''}`;
          group.dataset.sender = String(senderId);
          const author = document.createElement('bdi');
          author.className = 'lw-chat-sender';
          author.lang = metadata.nameLanguage || 'de';
          author.dir = metadata.nameDirection || 'auto';
          author.textContent = name;
          group.appendChild(author);
          container.appendChild(group);
        }

        const previousBubble = group.querySelector('.lw-chat-bubble:last-of-type');
        const previousTime = previousBubble?.nextElementSibling;
        const repeat = previousTime?.nextElementSibling?.classList.contains('lw-chat-repeat')
          ? previousTime.nextElementSibling
          : null;
        if (previousBubble && previousBubble.textContent === text) {
          const count = Number(repeat?.dataset.count || 1) + 1;
          const badge = repeat || document.createElement('span');
          badge.className = 'lw-chat-repeat';
          badge.dataset.count = String(count);
          badge.textContent = `×${count}`;
          if (!repeat) group.appendChild(badge);
          const time = previousTime?.classList.contains('lw-chat-time') ? previousTime : null;
          if (time) time.textContent = thisChatTime(metadata.timestamp);
        } else {
          const bubble = document.createElement('bdi');
          bubble.className = 'lw-chat-bubble';
          bubble.dir = 'auto';
          bubble.textContent = text;
          group.appendChild(bubble);
          const time = document.createElement('time');
          time.className = 'lw-chat-time';
          time.textContent = thisChatTime(metadata.timestamp);
          group.appendChild(time);
        }
      }
      while (container.children.length > 40) container.firstElementChild.remove();
      if (shouldStickToBottom) container.scrollTop = container.scrollHeight;
    };
    const thisChatTime = (timestamp) => {
      const date = Number.isFinite(timestamp) ? new Date(timestamp) : new Date();
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    const addPublicMessage = (entry) => {
      publicTranscript.push(entry);
      if (publicTranscript.length > 40) publicTranscript.shift();
      if (!activePrivate && activeChatView === 'public') {
        addMessage(entry.name, entry.text, Boolean(entry.isSystem), messages, entry);
      }
    };
    const renderPublicThread = () => {
      messages.replaceChildren();
      publicTranscript.forEach((entry) => addMessage(
        entry.name,
        entry.text,
        Boolean(entry.isSystem),
        messages,
        { ...entry, replay: true }
      ));
    };
    const renderPrivateThread = () => {
      messages.replaceChildren();
      if (!activePrivate) return;
      const thread = privateThreads.get(activePrivate.id) || [];
      thread.forEach((entry) => addMessage(entry.name, entry.text, false, messages, { ...entry, replay: true }));
    };
    const openPrivateChat = (player) => {
      activePrivate = { id: player.id, name: player.name };
      activeChatView = 'private';
      publicTab.classList.remove('is-active');
      nearbyTab.classList.add('is-active');
      nearbyPlayers.hidden = true;
      messages.hidden = false;
      chatForm.hidden = false;
      privateHeading.hidden = false;
      privateTitle.replaceChildren(document.createTextNode('Privater Chat mit '));
      const peerName = document.createElement('bdi');
      peerName.dir = 'auto';
      peerName.textContent = player.name;
      privateTitle.append(peerName);
      renderPrivateThread();
      chatInput.focus();
    };
    const showChatView = (view) => {
      activeChatView = view;
      activePrivate = null;
      privateHeading.hidden = true;
      publicTab.classList.toggle('is-active', view === 'public');
      nearbyTab.classList.toggle('is-active', view === 'nearby');
      nearbyPlayers.hidden = view !== 'nearby';
      messages.hidden = view === 'nearby';
      chatForm.hidden = view === 'nearby';
      if (view === 'public') renderPublicThread();
      if (view === 'nearby') renderNearbyPlayers.current?.();
    };
    const renderNearbyList = () => {
      nearbyPlayers.replaceChildren();
      const local = localPlayerPosition.current;
      const closePlayers = [...remotePlayersById.current.values()]
        .map((player) => ({
          player,
          distance: Math.hypot(local.x - player.x, local.z - player.z)
        }))
        .filter((entry) => entry.distance <= 8)
        .sort((first, second) => first.distance - second.distance);
      if (!closePlayers.length) {
        const empty = document.createElement('div');
        empty.className = 'lw-nearby-empty';
        empty.textContent = 'Keine Spieler in der Nähe.';
        nearbyPlayers.appendChild(empty);
        return;
      }
      closePlayers.forEach(({ player, distance }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'lw-nearby-player';
        const name = document.createElement('span');
        name.textContent = player.name;
        const detail = document.createElement('small');
        detail.textContent = `${distance.toFixed(1)} m · Privater Chat`;
        button.append(name, detail);
        button.addEventListener('click', () => openPrivateChat(player));
        nearbyPlayers.appendChild(button);
      });
    };
    renderNearbyPlayers.current = renderNearbyList;
    const updatePlayers = () => {
      const nextPlayers = [...remotePlayersById.current.values()].map((player) => ({ ...player }));
      setRemotePlayers(nextPlayers);
      renderNearbyList();
      const signaturePlayers = selfPlayerRef.current
        ? [...nextPlayers, selfPlayerRef.current]
        : nextPlayers;
      const signature = signaturePlayers
        .map((player) => `${player.id}:${player.name}:${player.model}:${player.ready}:${player.score}:${player.role}:${player.voiceEnabled}:${player.transmitting}:${player.muted}`)
        .sort()
        .join('|');
      if (signature !== gameUiPlayerSignature.current) {
        gameUiPlayerSignature.current = signature;
        gameUiRef.current?.setPlayers(nextPlayers);
        if (selfPlayerRef.current) gameUiRef.current?.setSelf(selfPlayerRef.current);
      }
      if (multiplayerSocket.current?.readyState === WebSocket.OPEN) {
        setStatus(`Online · ${remotePlayersById.current.size + 1}`, true);
      }
    };
    const onSocketMessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message.type === 'welcome') {
        localPlayerId = message.id;
        selfPlayerRef.current = message.self || null;
        setSelfId(message.id);
        gameUiPlayerSignature.current = '';
        gameUiRef.current?.handleMessage(message);
        if (message.self) gameUiRef.current?.setSelf(message.self);
        if (message.hostId) gameUiRef.current?.setHostId(message.hostId);
        if (message.world) applyWorldState(message.world);
        remotePlayersById.current.clear();
        (message.players || []).forEach((player) => {
          remotePlayersById.current.set(player.id, player);
          startVoiceWith(player);
        });
        updatePlayers();
        addPublicMessage({ name: '', text: 'Du bist jetzt mit diesem Level verbunden.', isSystem: true });
      } else if (message.type === 'player-joined') {
        remotePlayersById.current.set(message.player.id, message.player);
        updatePlayers();
        addPublicMessage({ name: '', text: `${message.player.name} ist beigetreten.`, isSystem: true });
      } else if (message.type === 'player-left') {
        const player = remotePlayersById.current.get(message.id);
        closeVoicePeer(message.id);
        remotePlayersById.current.delete(message.id);
        privateThreads.delete(message.id);
        updatePlayers();
        if (activePrivate?.id === message.id) {
          activePrivate = null;
          showChatView('public');
          addMessage('', 'Der private Chat wurde beendet, weil die Person den Raum verlassen hat.', true);
        }
        if (player) addPublicMessage({ name: '', text: `${player.name} hat das Level verlassen.`, isSystem: true });
      } else if (message.type === 'player-renamed') {
        const player = remotePlayersById.current.get(message.id);
        if (player) {
          player.name = message.name;
          updatePlayers();
        }
        if (message.id === localPlayerId && selfPlayerRef.current) {
          selfPlayerRef.current.name = message.name;
          updatePlayers();
        }
      } else if (message.type === 'player-customized') {
        const player = remotePlayersById.current.get(message.id);
        if (player) {
          player.name = message.name;
          player.model = message.model;
          updatePlayers();
        }
        if (message.id === localPlayerId && selfPlayerRef.current) {
          selfPlayerRef.current.name = message.name;
          selfPlayerRef.current.model = message.model;
          updatePlayers();
        }
      } else if (message.type === 'player-updated') {
        const player = message.player;
        if (player) {
          if (player.id === localPlayerId) selfPlayerRef.current = { ...selfPlayerRef.current, ...player };
          else remotePlayersById.current.set(player.id, player);
          updatePlayers();
          gameUiRef.current?.handleMessage(message);
        }
      } else if (message.type === 'position') {
        remotePlayersById.current.set(message.player.id, message.player);
        updatePlayers();
      } else if (message.type === 'voice-state') {
        const player = remotePlayersById.current.get(message.id);
        if (player) {
          player.voiceEnabled = message.enabled;
          player.transmitting = Boolean(message.transmitting);
          player.muted = Boolean(message.muted);
          if (message.enabled) startVoiceWith(player);
          else closeVoicePeer(message.id);
          updatePlayers();
        }
        if (message.id === localPlayerId && selfPlayerRef.current) {
          selfPlayerRef.current.voiceEnabled = message.enabled;
          selfPlayerRef.current.transmitting = Boolean(message.transmitting);
          selfPlayerRef.current.muted = Boolean(message.muted);
          updatePlayers();
        }
      } else if (message.type === 'emote') {
        showEmote(message.id, message.emote);
      } else if (message.type === 'signal') {
        const { from, signal } = message;
        const connection = voicePeers.get(from)?.connection || createVoicePeer(from, false);
        if (signal.kind === 'description') {
          connection.setRemoteDescription(signal.description)
            .then(() => signal.description.type === 'offer' ? connection.createAnswer() : null)
            .then((answer) => answer ? connection.setLocalDescription(answer) : null)
            .then(() => {
              if (connection.localDescription?.type === 'answer') {
                sendSignal(from, { kind: 'description', description: connection.localDescription });
              }
            })
            .catch(() => addMessage('', 'Der Sprachkanal konnte nicht eingerichtet werden.', true));
        } else if (signal.kind === 'candidate') {
          connection.addIceCandidate(signal.candidate).catch(() => {});
        }
      } else if (message.type === 'chat') {
        const entry = {
          name: message.name,
          text: message.text,
          senderId: message.id,
          timestamp: message.timestamp
        };
        addPublicMessage(entry);
        window.dispatchEvent(new CustomEvent('lw-chat-message', { detail: { id: message.id } }));
      } else if (message.type === 'private-chat') {
        const peerId = message.id === localPlayerId ? message.target : message.id;
        const thread = privateThreads.get(peerId) || [];
        const entry = {
          id: message.id,
          name: message.name,
          text: message.text,
          nameLanguage: 'de',
          nameDirection: 'auto',
          senderId: message.id,
          timestamp: message.timestamp
        };
        thread.push(entry);
        privateThreads.set(peerId, thread.slice(-40));
        if (activePrivate?.id === peerId) renderPrivateThread();
        window.dispatchEvent(new CustomEvent('lw-chat-message', { detail: { id: message.id, private: true } }));
      } else if (message.type === 'room:state') {
        if (message.hostId) gameUiRef.current?.setHostId(message.hostId);
        gameUiRef.current?.handleMessage(message);
      } else if (message.type === 'game:state') {
        handleGameState(message.state || null);
        gameUiRef.current?.handleMessage(message);
      } else if (message.type === 'game:started') {
        gameUiRef.current?.handleMessage(message);
      } else if (message.type === 'game:event') {
        gameUiRef.current?.handleMessage(message);
      } else if (message.type === 'game:ended') {
        gameUiRef.current?.handleMessage(message);
      } else if (message.type === 'quiz:result' || message.type === 'quiz:ack') {
        gameUiRef.current?.handleMessage(message);
      } else if (message.type === 'quest:state' || message.type === 'quest:completed') {
        gameUiRef.current?.handleMessage(message);
      } else if (message.type === 'world:state') {
        if (message.world) applyWorldState(message.world);
        gameUiRef.current?.handleMessage(message);
      } else if (message.type === 'leaderboard:data') {
        gameUiRef.current?.handleMessage(message);
      } else if (message.type === 'game:error') {
        gameUiRef.current?.handleMessage(message);
      } else if (message.type === 'game:teleport') {
        const body = playerBody.current;
        if (body) {
          body.setTranslation({ x: message.x, y: 0.25, z: message.z }, true);
          body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }
        gameUiRef.current?.showToast('Du wurdest zum Spielort gebracht.');
      } else if (message.type === 'game:positions') {
        Object.entries(message.positions || {}).forEach(([id, position]) => {
          const player = remotePlayersById.current.get(id);
          if (!player) return;
          player.x = position.x;
          player.z = position.z;
        });
        updatePlayers();
      } else if (message.type === 'voice-error') {
        stopVoice(false);
        addMessage('', message.message, true);
        gameUiRef.current?.showToast(message.message, 4200);
      } else if (message.type === 'private-error') {
        addMessage('', message.message, true);
      } else if (message.type === 'error') {
        setStatus(message.message || 'Verbindungsfehler');
        gameUiRef.current?.showToast(message.message || 'Verbindungsfehler.');
      }
    };
    const connect = () => {
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (voiceActive) stopVoice(true);
      if (multiplayerSocket.current) multiplayerSocket.current.close();
      remotePlayersById.current.clear();
      setRemotePlayers([]);
      selfPlayerRef.current = null;
      gameUiPlayerSignature.current = '';
      handleGameState(null);
      gameUiRef.current?.handleMessage({ type: 'game:state', state: null });
      const endpoint = endpointInput.value.trim();
      if (!/^wss?:\/\//i.test(endpoint)) {
        setStatus('Serveradresse prüfen');
        return;
      }
      localStorage.setItem('lw_multiplayer_url', endpoint);
      setStatus('Verbinde ...');
      try {
        const socket = new WebSocket(endpoint);
        multiplayerSocket.current = socket;
        socket.addEventListener('open', () => {
          reconnectAttempt = 0;
          socket.send(JSON.stringify({
            type: 'join',
            room: String(level),
            name: nameInput.value,
            model: modelSelect.value
          }));
        });
        socket.addEventListener('message', onSocketMessage);
        socket.addEventListener('error', () => setStatus('Server nicht erreichbar'));
        socket.addEventListener('close', () => {
          if (multiplayerSocket.current === socket) {
            setStatus('Offline · Serververbindung prüfen');
            setSelfId(null);
            selfPlayerRef.current = null;
            gameUiPlayerSignature.current = '';
            handleGameState(null);
            gameUiRef.current?.handleMessage({ type: 'game:state', state: null });
            gameUiRef.current?.setPlayers([]);
            remotePlayersById.current.clear();
            setRemotePlayers([]);
            if (activePrivate) showChatView('public');
            stopVoice(false);
            if (!shouldConnectAutomatically) return;
            reconnectAttempt += 1;
            const delay = Math.min(10000, 500 * (2 ** Math.min(reconnectAttempt - 1, 5)));
            reconnectTimer = window.setTimeout(connect, delay);
          }
        });
      } catch {
        setStatus('Serveradresse prüfen');
      }
    };

    const onNameChange = () => {
      const name = nameInput.value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24) || 'Spieler';
      nameInput.value = name;
      localStorage.setItem('lw_player_name', name);
      if (multiplayerSocket.current?.readyState === WebSocket.OPEN) {
        multiplayerSocket.current.send(JSON.stringify({ type: 'rename', name }));
      }
    };
    const onModelChange = () => {
      localStorage.setItem('lw_player_model', modelSelect.value);
      if (multiplayerSocket.current?.readyState === WebSocket.OPEN) {
        multiplayerSocket.current.send(JSON.stringify({
          type: 'customize',
          name: nameInput.value,
          model: modelSelect.value
        }));
      }
    };
    const onChatSubmit = (event) => {
      event.preventDefault();
      const text = chatInput.value.trim();
      if (!text || multiplayerSocket.current?.readyState !== WebSocket.OPEN) return;
      multiplayerSocket.current.send(JSON.stringify({
        type: 'chat',
        text,
        ...(activePrivate ? { target: activePrivate.id } : {})
      }));
      chatInput.value = '';
    };
    const onVoiceClick = async () => {
      if (voiceActive) {
        stopVoice(true);
        addMessage('', 'Mikrofon ausgeschaltet.', true);
        return;
      }
      if (multiplayerSocket.current?.readyState !== WebSocket.OPEN) {
        addMessage('', 'Verbinde dich zuerst mit dem Server, um den Sprachchat zu nutzen.', true);
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        addMessage('', 'Dieser Browser unterstützt keinen Mikrofonzugriff.', true);
        return;
      }
      if (!window.RTCPeerConnection) {
        addMessage('', 'Dieser Browser unterstützt keinen direkten Sprachchat.', true);
        return;
      }
      try {
        await ensureAudioContext();
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
        voiceActive = true;
        transmitting = false;
        multiplayerSocket.current.send(JSON.stringify({
          type: 'voice-state',
          enabled: true,
          transmitting: false
        }));
        remotePlayersById.current.forEach(startVoiceWith);
        setVoiceButton(true);
        setPttButton(false);
        addMessage('', 'Sprachchat aktiv. Halte V oder den PTT-Knopf gedrückt, um zu sprechen.', true);
      } catch {
        stopVoice(false);
        addMessage('', 'Mikrofon oder Sprachchat konnte nicht aktiviert werden.', true);
      }
    };
    const onSettingsSubmit = (event) => {
      event.preventDefault();
      connect();
    };
    const isTypingTarget = (target) => Boolean(
      target && target.matches?.('input, textarea, select, [contenteditable="true"]')
    );
    const onPushToTalkDown = (event) => {
      if (event.repeat || event.key.toLowerCase() !== 'v' || isTypingTarget(event.target)) return;
      event.preventDefault();
      setTransmitting(true);
    };
    const onPushToTalkUp = (event) => {
      if (event.key.toLowerCase() !== 'v') return;
      setTransmitting(false);
    };
    const onPttDown = (event) => {
      event.preventDefault();
      setTransmitting(true);
    };
    const onPttUp = () => setTransmitting(false);
    const onPublicTabClick = () => showChatView('public');
    const onNearbyTabClick = () => showChatView('nearby');
    const onPrivateBack = () => showChatView('nearby');

    nameInput.addEventListener('change', onNameChange);
    modelSelect.addEventListener('change', onModelChange);
    nameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') nameInput.blur();
    });
    chatForm.addEventListener('submit', onChatSubmit);
    settingsForm.addEventListener('submit', onSettingsSubmit);
    voiceButton.addEventListener('click', onVoiceClick);
    publicTab.addEventListener('click', onPublicTabClick);
    nearbyTab.addEventListener('click', onNearbyTabClick);
    privateBackButton.addEventListener('click', onPrivateBack);
    pttButton.addEventListener('pointerdown', onPttDown);
    pttButton.addEventListener('pointerup', onPttUp);
    pttButton.addEventListener('pointerleave', onPttUp);
    pttButton.addEventListener('pointercancel', onPttUp);
    window.addEventListener('keydown', onPushToTalkDown);
    window.addEventListener('keyup', onPushToTalkUp);
    if (shouldConnectAutomatically) connect();
    else setStatus('Offline · Serververbindung prüfen');
    spatialTimer = window.setInterval(updateVoicePositions, 180);

    return () => {
      nameInput.removeEventListener('change', onNameChange);
      modelSelect.removeEventListener('change', onModelChange);
      chatForm.removeEventListener('submit', onChatSubmit);
      settingsForm.removeEventListener('submit', onSettingsSubmit);
      voiceButton.removeEventListener('click', onVoiceClick);
      publicTab.removeEventListener('click', onPublicTabClick);
      nearbyTab.removeEventListener('click', onNearbyTabClick);
      privateBackButton.removeEventListener('click', onPrivateBack);
      pttButton.removeEventListener('pointerdown', onPttDown);
      pttButton.removeEventListener('pointerup', onPttUp);
      pttButton.removeEventListener('pointerleave', onPttUp);
      pttButton.removeEventListener('pointercancel', onPttUp);
      window.removeEventListener('keydown', onPushToTalkDown);
      window.removeEventListener('keyup', onPushToTalkUp);
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (spatialTimer) window.clearInterval(spatialTimer);
      stopVoice(true);
      if (audioContext) {
        audioContext.close().catch(() => {});
        audioContext = null;
      }
      if (multiplayerSocket.current) {
        multiplayerSocket.current.close();
        multiplayerSocket.current = null;
      }
      remotePlayersById.current.clear();
      setRemotePlayers([]);
      if (renderNearbyPlayers.current === renderNearbyList) renderNearbyPlayers.current = null;
      panel.remove();
    };
  }, [level]);

  const updateNpcPosition = React.useCallback((id, x, z) => {
    if (typeof x !== 'number' || typeof z !== 'number') {
      npcPositions.current.delete(id);
      return;
    }
    let position = npcPositions.current.get(id);
    if (!position) {
      position = { x, z };
      npcPositions.current.set(id, position);
    } else {
      position.x = x;
      position.z = z;
    }
    townNavigation.current?.updatePosition(id, x, z);
  }, []);

  React.useEffect(() => {
    if (currentLevel !== null && currentLevel !== level) setLevel(currentLevel);
  }, [currentLevel]);

  React.useEffect(() => {
    let cancelled = false;
    let simulation = null;
    let smartPlaces = null;
    let navigation = null;
    let unsubscribe = null;

    loadLivingTownSimulation({
      population: Number(localStorage.getItem('lw_town_population')) || undefined,
      seed: localStorage.getItem('lw_town_seed') || undefined,
      aiThinkInterval: 0.8
    }).then((loadedSimulation) => {
      simulation = loadedSimulation;
      return loadSmartPlaceSystem().then((loadedPlaces) => {
        if (cancelled) {
          loadedPlaces.destroy();
          simulation.destroy();
          return;
        }
        smartPlaces = loadedPlaces;
        navigation = new ResidentNavigationManager(
          new CityNavigationGraph(),
          simulation,
          {
            fixedActors: (WORLD_NPCS[1] || []).length,
            fullCap: isMobile || /Firefox/i.test(navigator.userAgent)
              || (navigator.hardwareConcurrency || 4) <= 4
              ? 10
              : (navigator.hardwareConcurrency || 4) <= 8 ? 14 : 18
          }
        );
        townNavigation.current = navigation;
        sharedLivingTownSimulation = simulation;
        townSimulation.current = simulation;
        if (worldStateRef.current && typeof simulation.setWorldState === 'function') {
          simulation.setWorldState(worldStateRef.current);
        }
        window.LivingTownSimulation = simulation;
        window.SmartPlaces = smartPlaces;
        window.LivingTownNavigation = navigation;
        unsubscribe = simulation.subscribe((event) => {
          if (event.type === 'clock') smartPlaces.advance(1, event);
          window.dispatchEvent(new CustomEvent(`living-town-${event.type}`, { detail: event }));
        });
        window.dispatchEvent(new CustomEvent('living-town-ready', {
          detail: {
            population: simulation.population,
            place_count: smartPlaces.places.size,
            waypoint_count: navigation.graph.nodes.size,
            full_simulation_cap: navigation.fullCap,
            day_index: simulation.dayIndex,
            weekday: ((simulation.dayIndex % 7) + 7) % 7,
            minute_of_day: Math.floor(simulation.minuteOfDay),
            time: `${String(Math.floor(simulation.minuteOfDay / 60)).padStart(2, '0')}:${String(Math.floor(simulation.minuteOfDay % 60)).padStart(2, '0')}`,
            weather: simulation.weather
          }
        }));
      });
    }).catch((error) => {
      if (!cancelled) console.warn('Local town simulation could not load its JSON data.', error);
    });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
      if (smartPlaces) {
        smartPlaces.destroy();
        if (window.SmartPlaces === smartPlaces) delete window.SmartPlaces;
      }
      if (navigation) {
        navigation.destroy();
        if (townNavigation.current === navigation) townNavigation.current = null;
        if (window.LivingTownNavigation === navigation) delete window.LivingTownNavigation;
      }
      if (simulation) {
        simulation.destroy();
        if (townSimulation.current === simulation) townSimulation.current = null;
        if (sharedLivingTownSimulation === simulation) sharedLivingTownSimulation = null;
        if (window.LivingTownSimulation === simulation) delete window.LivingTownSimulation;
      }
    };
  }, []);

  React.useEffect(() => {
    if (level !== 1) return undefined;
    const cityMap = createCityMap(language);
    document.body.appendChild(cityMap.panel);
    cityMapElement.current = cityMap.panel;
    cityMapPlayerMarker.current = cityMap.playerMarker;
    cityMapUpdate.current = cityMap.updatePosition;
    return () => {
      cityMap.panel.remove();
      if (cityMapUpdate.current === cityMap.updatePosition) cityMapUpdate.current = null;
      if (cityMapElement.current === cityMap.panel) cityMapElement.current = null;
      if (cityMapPlayerMarker.current === cityMap.playerMarker) {
        cityMapPlayerMarker.current = null;
      }
    };
  }, [language, level]);

  React.useEffect(() => {
    const location = {};
    window.GermanWorldLocation = location;
    return () => {
      if (window.GermanWorldLocation === location) {
        delete window.GermanWorldLocation;
      }
    };
  }, []);

  React.useEffect(() => {
    const onNpcSpeech = (event) => {
      const { npcKey, text } = event.detail || {};
      const target = activeNpcs.find((npc) => npc.npcKey === npcKey);
      if (!target || typeof text !== 'string' || !text.trim()) return;
      speechSequence.current += 1;
      setNpcSpeech({
        npcId: target.id,
        text: text.trim().slice(0, 240),
        sequence: speechSequence.current
      });
    };
    const onChatState = (event) => {
      chatOpen.current = Boolean(event.detail && event.detail.open);
      setEngagedNpcKey(chatOpen.current ? event.detail.npcKey : null);
      if (interactionPromptElement.current) {
        interactionPromptElement.current.style.display = chatOpen.current ? 'none' : '';
      }
      if (cityMapElement.current) {
        cityMapElement.current.style.display = chatOpen.current ? 'none' : '';
      }
    };
    window.addEventListener('german-npc-speech', onNpcSpeech);
    window.addEventListener('german-npc-chat-state', onChatState);
    return () => {
      window.removeEventListener('german-npc-speech', onNpcSpeech);
      window.removeEventListener('german-npc-chat-state', onChatState);
    };
  }, [activeNpcs]);

  React.useEffect(() => {
    if (!npcSpeech) return undefined;
    const bubble = document.createElement('div');
    bubble.className = 'lw-npc-speech-bubble';
    bubble.setAttribute('role', 'status');
    bubble.setAttribute('aria-live', 'polite');
    const text = document.createElement('bdi');
    text.lang = 'de';
    text.dir = 'ltr';
    text.textContent = npcSpeech.text;
    bubble.appendChild(text);
    document.body.appendChild(bubble);
    speechBubbleElement.current = bubble;

    const timeout = window.setTimeout(() => {
      setNpcSpeech((current) => current && current.sequence === npcSpeech.sequence ? null : current);
    }, 6500);
    return () => {
      window.clearTimeout(timeout);
      bubble.remove();
      if (speechBubbleElement.current === bubble) speechBubbleElement.current = null;
    };
  }, [npcSpeech]);

  React.useEffect(() => {
    setNpcSpeech(null);
  }, [level]);

  useFrame((_, delta) => {
    const simulation = townSimulation.current;
    if (!simulation) return;
    simulation.advance(delta, isPaused || isLoading, window.LivingTownWeather || 'clear');
  });

  useFrame((_, delta) => {
    const navigation = townNavigation.current;
    if (!navigation) return;
    const player = playerBody.current && playerBody.current.translation();
    navigation.advance(delta, player, { paused: isPaused || isLoading });
    if (level !== 1) {
      if (residentSelectionSignature.current) {
        residentSelectionSignature.current = '';
        setResidentNpcs([]);
      }
      return;
    }
    if (!player) return;

    residentSelectionTimer.current += delta;
    if (residentSelectionTimer.current < 0.3) return;
    residentSelectionTimer.current = 0;
    const selected = navigation.selectFullSimulation(player, (agent) => {
      screenPosition.set(agent.x, 1, agent.z).project(camera);
      return screenPosition.z >= -1 && screenPosition.z <= 1
        && screenPosition.x >= -1.05 && screenPosition.x <= 1.05
        && screenPosition.y >= -1.05 && screenPosition.y <= 1.05;
    });
    const signature = selected.map((npc) => `${npc.id}:${npc.routeVersion}`).join('|');
    if (signature !== residentSelectionSignature.current) {
      residentSelectionSignature.current = signature;
      setResidentNpcs(selected);
    }
  });

  useFrame((_, delta) => {
    const player = playerBody.current && playerBody.current.translation();
    if (player) localPlayerPosition.current = { x: player.x, z: player.z };
    if (level === 1 && player && cityMapPlayerMarker.current) {
      const position = cityMapPoint(player.x, player.z);
      camera.getWorldDirection(mapDirection);
      const heading = Math.atan2(mapDirection.x, -mapDirection.z) * 180 / Math.PI;
      if (cityMapUpdate.current) cityMapUpdate.current(player.x, player.z, heading);
      else cityMapPlayerMarker.current.setAttribute(
        'transform', `translate(${position.x} ${position.y}) rotate(${heading})`
      );
    }

    const socket = multiplayerSocket.current;
    if (player && socket?.readyState === WebSocket.OPEN) {
      movementSyncTimer.current += delta;
      if (movementSyncTimer.current >= 0.1) {
        movementSyncTimer.current = 0;
        renderNearbyPlayers.current?.();
        camera.getWorldDirection(mapDirection);
        socket.send(JSON.stringify({
          type: 'position',
          x: player.x,
          z: player.z,
          heading: Math.atan2(mapDirection.x, mapDirection.z) * 180 / Math.PI
        }));
      }
    }

    const canvas = gl.domElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const positionElement = (element, npcId, height) => {
      if (!element || !npcId) return;
      const position = npcPositions.current.get(npcId);
      if (!position) {
        element.style.display = 'none';
        return;
      }
      screenPosition.set(position.x, height, position.z).project(camera);
      const visible = screenPosition.z >= -1 && screenPosition.z <= 1
        && screenPosition.x >= -1.15 && screenPosition.x <= 1.15
        && screenPosition.y >= -1.15 && screenPosition.y <= 1.15;
      if (!visible) {
        element.style.display = 'none';
        return;
      }
      element.style.display = 'block';
      element.style.left = `${rect.left + (screenPosition.x + 1) * rect.width / 2}px`;
      element.style.top = `${rect.top + (1 - screenPosition.y) * rect.height / 2}px`;
    };

    const prompt = interactionPromptElement.current;
    if (prompt && interactionPromptNpcId.current) {
      if (chatOpen.current) prompt.style.display = 'none';
      else positionElement(prompt, interactionPromptNpcId.current, 1.35);
    }
    if (npcSpeech && speechBubbleElement.current) {
      positionElement(speechBubbleElement.current, npcSpeech.npcId, 2.25);
    }
  });

  const changeLevel = React.useCallback((nextLevel, markComplete = true) => {
    if (loadingRef.current || nextLevel === level) return;
    loadingRef.current = true;
    window.dispatchEvent(new CustomEvent('level-loading-start'));
    window.setTimeout(() => {
      if (markComplete && level && onLevelComplete) onLevelComplete(level);
      setIsLoading(true);
      setLevel(nextLevel);
    }, 100);
  }, [level, onLevelComplete]);

  const onPositionsReady = React.useCallback((data) => {
    if (readyLevel.current === level) return;
    readyLevel.current = level;
    setPositions(data);
    window.dispatchEvent(new CustomEvent('level-loading-end'));
    if (firstScene.current) {
      firstScene.current = false;
      return;
    }
    const spawn = pendingSpawn.current || data.playerStart;
    pendingSpawn.current = null;
    if (playerBody.current) {
      playerBody.current.setTranslation({ x: spawn.x, y: spawn.y, z: spawn.z }, true);
      playerBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
    loadingRef.current = false;
    setIsLoading(false);
  }, [level]);

  useFrame(() => {
    if (!positions || !playerBody.current || isLoading || isPaused) return;
    const player = playerBody.current.translation();
    const gameLocation = window.GermanWorldLocation;
    if (gameLocation) {
      gameLocation.level = level;
      gameLocation.x = player.x;
      gameLocation.z = player.z;
    }
    if (gameRef.current && gameRef.current.phase !== 'ended') {
      if (currentPortal.current) {
        currentPortal.current = null;
        setNearbyPortal(null);
      }
      return;
    }
    let match = null;
    let closestNpc = null;
    let closestNpcDistance = 4.5;

    activeNpcs.forEach((npc) => {
      if (!npc.npcKey) return;
      const position = npcPositions.current.get(npc.id);
      if (!position) return;
      const distance = Math.hypot(player.x - position.x, player.z - position.z);
      if (distance < closestNpcDistance) {
        closestNpc = npc;
        closestNpcDistance = distance;
      }
    });

    if (!closestNpc && level === 1) {
      match = CITY_PORTALS.find((portal) => {
        const dx = player.x - portal.position.x;
        const dz = player.z - portal.position.z;
        return dx * dx + dz * dz <= portal.radius * portal.radius;
      }) || null;
    } else if (!closestNpc) {
      const exit = INTERIOR_EXITS[level];
      if (exit) {
        const dx = player.x - exit.position.x;
        const dz = player.z - exit.position.z;
        if (dx * dx + dz * dz <= exit.radius * exit.radius) {
          match = {
            id: `exit-${level}`,
            targetLevel: 1,
            title: LEVEL_NAMES[level],
            returnPosition: exit.returnPosition,
            isExit: true
          };
        }
      }
    }

    const nextNpcId = closestNpc ? closestNpc.id : null;
    if (currentNpc.current !== nextNpcId) {
      currentNpc.current = nextNpcId;
      setNearbyNpc(closestNpc);
    }
    const nextId = match ? match.id : null;
    if (currentPortal.current !== nextId) {
      currentPortal.current = nextId;
      setNearbyPortal(match);
    }
  });

  const enterPortal = React.useCallback((portal) => {
    if (!portal || loadingRef.current) return;
    if (gameRef.current && gameRef.current.phase !== 'ended') return;
    pendingSpawn.current = portal.isExit ? portal.returnPosition : portal.spawn;
    currentPortal.current = null;
    setNearbyPortal(null);
    changeLevel(portal.targetLevel, false);
  }, [changeLevel]);

  const talkToNpc = React.useCallback((npc) => {
    if (!npc || !npc.npcKey) return;
    const openConversation = window.GermanLife && window.GermanLife.openNPCConversation;
    if (typeof openConversation !== 'function') {
      console.error(`NPC conversation is unavailable for "${npc.npcKey}".`);
      return;
    }
    if (document.pointerLockElement) document.exitPointerLock();
    openConversation(npc.npcKey);
  }, []);

  React.useEffect(() => {
    if ((nearbyPortal || nearbyNpc) && document.pointerLockElement) document.exitPointerLock();
  }, [nearbyPortal, nearbyNpc]);

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (chatOpen.current || event.repeat || event.key.toLowerCase() !== 'f') return;
      if (!nearbyNpc && !nearbyPortal) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (nearbyNpc) talkToNpc(nearbyNpc);
      else enterPortal(nearbyPortal);
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [enterPortal, nearbyNpc, nearbyPortal, talkToNpc]);

  const portalText = nearbyPortal
    ? nearbyPortal.isExit
      ? 'Zurück in die Stadt'
      : `Betrete ${nearbyPortal.title.de}`
    : '';
  const buttonText = nearbyPortal?.isExit ? 'Zurückkehren' : 'Betreten';
  const npcText = nearbyNpc ? `Sprich mit ${nearbyNpc.name.en}` : '';
  const npcButtonText = 'Sprechen';

  React.useEffect(() => {
    if (!nearbyNpc && !nearbyPortal) return undefined;

    const prompt = document.createElement('div');
    prompt.id = 'lw-world-interaction-prompt';
    prompt.className = `lw-world-portal-prompt${nearbyNpc ? ' is-npc-prompt' : ''}`;
    prompt.setAttribute('role', 'status');
    prompt.setAttribute('aria-live', 'polite');

    const text = document.createElement('span');
    text.className = 'lw-world-portal-text';
    text.textContent = nearbyNpc ? npcText : portalText;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lw-world-portal-button';
    const buttonLabel = document.createElement('span');
    buttonLabel.textContent = nearbyNpc ? npcButtonText : buttonText;
    const key = document.createElement('kbd');
    key.textContent = 'F';
    button.append(buttonLabel, key);
    text.dir = 'ltr';
    buttonLabel.dir = 'auto';

    const stopPropagation = (event) => event.stopPropagation();
    const activate = () => {
      if (nearbyNpc) talkToNpc(nearbyNpc);
      else enterPortal(nearbyPortal);
    };
    prompt.addEventListener('pointerdown', stopPropagation);
    prompt.addEventListener('mousedown', stopPropagation);
    button.addEventListener('click', activate);
    prompt.append(text, button);
    document.body.appendChild(prompt);
    interactionPromptElement.current = prompt;
    interactionPromptNpcId.current = nearbyNpc ? nearbyNpc.id : null;
    const beacon = nearbyNpc && document.getElementById('de-npc-world-beacon');
    if (beacon) beacon.style.display = 'none';

    return () => {
      prompt.removeEventListener('pointerdown', stopPropagation);
      prompt.removeEventListener('mousedown', stopPropagation);
      button.removeEventListener('click', activate);
      if (interactionPromptElement.current === prompt) interactionPromptElement.current = null;
      if (interactionPromptNpcId.current === (nearbyNpc && nearbyNpc.id)) {
        interactionPromptNpcId.current = null;
      }
      if (beacon) beacon.style.display = '';
      prompt.remove();
    };
  }, [
    buttonText,
    enterPortal,
    nearbyNpc,
    nearbyPortal,
    npcButtonText,
    npcText,
    portalText,
    talkToNpc
  ]);

  return h(React.Fragment, null,
    positions
      ? h(FirstPersonPlayer, {
        ref: playerBody,
        joystickInput,
        initialPosition: positions.playerStart,
        isPaused: isPaused || isLoading,
        movementLocked,
        isMobile
      })
      : null,
    remotePlayers.map((player) => h(RemotePlayerAvatar, {
      key: player.id,
      player,
      camera,
      gl,
      movementAnimations,
      idleAnimations,
      gameRole: game?.roles?.[player.id],
      emote: emoteStates[player.id],
      speaking: player.transmitting
    })),
    game?.game === 'hunt' && game.phase === 'playing'
      ? (game.hunt?.spawns || [])
        .filter((spawn) => !spawn.claimedBy)
        .map((spawn) => h(HuntCollectible, {
          key: spawn.id,
          spawn,
          playerBody,
          camera,
          gl,
          onCollect: collectHuntItem
        }))
      : null,
    h(LevelWorld, { level, onPositionsReady, isPaused: isPaused || isLoading }),
    [...activeNpcs, ...residentNpcs].map((npc) => h(NPCCharacter, {
      key: npc.id,
      npc,
      movementAnimations,
      idleAnimations,
      onPosition: updateNpcPosition,
      playerBody,
      isPaused: isPaused || isLoading,
      isEngaged: npc.id === (nearbyNpc && nearbyNpc.id) || npc.npcKey === engagedNpcKey,
      navigationManager: npc.livingResident ? townNavigation.current : null
    })),
  );
}

export default function WorldScene({
  joystickInput,
  currentLevel,
  onLevelComplete,
  teleportCount,
  onTeleport,
  onObjectClick,
  isPaused,
  isMobile
}) {
  const [reducePostProcessing, setReducePostProcessing] = React.useState(() =>
    isMobile || /Firefox/i.test(navigator.userAgent) || (navigator.hardwareConcurrency || 4) <= 4
  );
  const qualityWindow = React.useRef({
    elapsed: 0,
    frames: 0,
    slowSeconds: 0,
    fastSeconds: 0,
    crowdReduced: false,
    crowdRestoreSeconds: 0
  });

  useFrame((_, delta) => {
    const worldLocation = window.GermanWorldLocation;
    if (!worldLocation || !Number.isFinite(worldLocation.x) || !Number.isFinite(worldLocation.z)) return;
    const quality = qualityWindow.current;
    quality.elapsed += delta;
    quality.frames += 1;
    if (quality.elapsed < 1) return;
    const averageDelta = quality.elapsed / quality.frames;
    if (averageDelta > 1 / 48) {
      quality.slowSeconds += quality.elapsed;
      quality.fastSeconds = 0;
      quality.crowdRestoreSeconds = 0;
    } else if (averageDelta < 1 / 55) {
      quality.fastSeconds += quality.elapsed;
      quality.slowSeconds = 0;
      if (averageDelta < 1 / 58) quality.crowdRestoreSeconds += quality.elapsed;
      else quality.crowdRestoreSeconds = 0;
    } else {
      quality.slowSeconds = 0;
      quality.fastSeconds = 0;
      quality.crowdRestoreSeconds = 0;
    }
    quality.elapsed = 0;
    quality.frames = 0;
    if (!reducePostProcessing && quality.slowSeconds >= 2) setReducePostProcessing(true);
    else if (reducePostProcessing && !LOW_POWER_RENDERING && !isMobile && quality.fastSeconds >= 8) {
      setReducePostProcessing(false);
    }

    const navigation = sharedLivingTownSimulation && window.LivingTownNavigation;
    if (navigation && quality.slowSeconds >= 2 && !quality.crowdReduced) {
      navigation.visibleCap = 4;
      quality.crowdReduced = true;
      window.dispatchEvent(new CustomEvent('living-town-quality-change', {
        detail: { visible_npc_cap: navigation.visibleCap, post_processing_reduced: true }
      }));
    } else if (navigation && quality.crowdReduced && quality.crowdRestoreSeconds >= 8) {
      navigation.visibleCap = Math.min(navigation.fullCap - navigation.fixedActors, navigation.visibleCap + 4);
      quality.crowdRestoreSeconds = 0;
      if (navigation.visibleCap >= navigation.fullCap - navigation.fixedActors) quality.crowdReduced = false;
      window.dispatchEvent(new CustomEvent('living-town-quality-change', {
        detail: { visible_npc_cap: navigation.visibleCap, post_processing_reduced: reducePostProcessing }
      }));
    }
  });

  const handleObjectClick = React.useCallback((objectName) => {
    if (typeof objectName === 'string' && objectName.startsWith('I_')) {
      const vocabularyKey = objectName.slice(2).split('|')[0]
        .replace(/_/g, ' ')
        .trim()
        .toLowerCase();
      window.dispatchEvent(new CustomEvent('german-world-object-click', {
        detail: { key: vocabularyKey }
      }));
    }

    if (onObjectClick) onObjectClick(objectName);
  }, [onObjectClick]);

  return h(React.Fragment, null,
    h(ObjectInteraction, { onObjectClick: handleObjectClick, isPaused, isMobile }),
    h('ambientLight', { intensity: 0.1, color: 0xffffff }),
    h('hemisphereLight', { skyColor: 0x87ceeb, groundColor: 0x8b8b8b, intensity: 0.2 }),
    h('directionalLight', { position: [10, 20, 10], intensity: 0.1, color: 0xfff0a0 }),
    h(React.Suspense, { fallback: null },
      h(Physics, { gravity: [0, -9.81, 0], debug: false },
        h(WorldExplorer, {
          joystickInput,
          currentLevel,
          onLevelComplete,
          onObjectClick,
          isPaused,
          isMobile
        }))),
    !isMobile && !reducePostProcessing
      ? h(EffectComposer, { disableNormalPass: true },
        h(SSAO, { aoRadius: 2, intensity: 2, color: 'black' }))
      : null
  );
}
