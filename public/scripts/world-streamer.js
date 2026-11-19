import {
  r as React,
  b as useFrame,
  l as useGLTF
} from '../assets/three-vendor-BrF7bqo1.js';
import {
  R as RigidBody
} from '../assets/physics-vendor-HODa8zue.js';
import {
  G as collisionGroups
} from '../assets/CollisionConfig-_pz6FJXP.js';

const h = React.createElement;
const MANIFEST_URL = '/world/world-manifest.json';
const COLLISION_NODE = 'city_Collision';
const QUALITY_STORAGE_KEY = 'lexi.world.quality';
const SCAN_DISTANCE_M = 12;
const SCAN_INTERVAL_S = 0.75;

const DEFAULT_QUALITY = {
  high: {
    high_radius_m: 820,
    low_radius_m: 1450,
    fog_near_m: 260,
    fog_far_m: 1580
  },
  medium: {
    high_radius_m: 600,
    low_radius_m: 1100,
    fog_near_m: 220,
    fog_far_m: 1120
  },
  low: {
    high_radius_m: 360,
    low_radius_m: 740,
    fog_near_m: 140,
    fog_far_m: 760
  }
};

const HIGH_CHUNK_LIMITS = {
  high: 12,
  medium: 8,
  low: 4
};

function isQualityTier(value) {
  return value === 'high' || value === 'medium' || value === 'low';
}

function chooseInitialTier() {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(QUALITY_STORAGE_KEY);
      if (isQualityTier(stored)) return stored;
    } catch (error) {
      void error;
    }
  }
  if (typeof navigator === 'undefined') return 'high';
  const userAgent = navigator.userAgent || '';
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) ||
    (navigator.maxTouchPoints > 1 && typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches);
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  if (isMobile || cores <= 4 || memory <= 4) return 'low';
  if (cores <= 8 || memory <= 8) return 'medium';
  return 'high';
}

function prepareChunkScene(scene) {
  const clone = scene.clone(true);
  clone.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = false;
      object.receiveShadow = false;
    }
  });
  return clone;
}

function getPlayerPosition(manifest) {
  const location = typeof window !== 'undefined' ? window.GermanWorldLocation : null;
  if (location && Number.isFinite(location.x) && Number.isFinite(location.z)) {
    return { x: location.x, z: location.z };
  }
  if (manifest?.spawn && Number.isFinite(manifest.spawn.x) && Number.isFinite(manifest.spawn.z)) {
    return { x: manifest.spawn.x, z: manifest.spawn.z };
  }
  return null;
}

function chunkEdgeDistance(chunk, x, z) {
  const bounds = chunk.bounds;
  const dx = Math.max(bounds.min_x - x, 0, x - bounds.max_x);
  const dz = Math.max(bounds.min_z - z, 0, z - bounds.max_z);
  return Math.hypot(dx, dz);
}

function computeActiveChunks(manifest, profile, x, z, highLimit) {
  const candidates = manifest.chunks
    .map((chunk) => ({
      chunk,
      distance: Math.hypot(x - chunk.center.x, z - chunk.center.z),
      edgeDistance: chunkEdgeDistance(chunk, x, z)
    }))
    .filter((entry) => entry.edgeDistance <= profile.low_radius_m)
    .sort((a, b) => a.distance - b.distance);
  const highIds = new Set();
  const active = [];
  for (const entry of candidates) {
    if (entry.distance <= profile.high_radius_m && highIds.size < highLimit) {
      highIds.add(entry.chunk.id);
      active.push({ chunk: entry.chunk, lod: 'high' });
    }
  }
  for (const entry of candidates) {
    if (!highIds.has(entry.chunk.id)) {
      active.push({ chunk: entry.chunk, lod: 'low' });
    }
  }
  return active;
}

function activeSignature(active) {
  return active.map((entry) => `${entry.chunk.id}:${entry.lod}`).join('|');
}

function LowChunk({ chunk, hidden }) {
  const { scene } = useGLTF(chunk.low.model, true);
  const { nodes } = useGLTF(chunk.low.collision, true);
  const model = React.useMemo(() => prepareChunkScene(scene), [scene]);
  const collision = nodes[COLLISION_NODE];
  return h(React.Fragment, null,
    h('primitive', { object: model, visible: !hidden }),
    collision
      ? h(RigidBody, {
        type: 'fixed',
        colliders: 'trimesh',
        friction: 1,
        collisionGroups
      }, h('mesh', { geometry: collision.geometry },
        h('meshBasicMaterial', { visible: false })))
      : null
  );
}

function HighChunk({ modelPath, onReady }) {
  const { scene } = useGLTF(modelPath, true);
  const model = React.useMemo(() => prepareChunkScene(scene), [scene]);
  React.useEffect(() => {
    onReady(true);
    return () => onReady(false);
  }, [onReady]);
  return h('primitive', { object: model });
}

function WorldChunk({ chunk, lod }) {
  const [highReady, setHighReady] = React.useState(false);
  React.useEffect(() => {
    if (lod !== 'high') setHighReady(false);
  }, [lod]);
  return h(React.Fragment, null,
    h(React.Suspense, { fallback: null },
      h(LowChunk, { chunk, hidden: lod === 'high' && highReady })),
    lod === 'high'
      ? h(React.Suspense, { fallback: null },
        h(HighChunk, { modelPath: chunk.high.model, onReady: setHighReady }))
      : null
  );
}

export default function WorldStreamer({ enabled = true, onProfileChange }) {
  const [manifest, setManifest] = React.useState(null);
  const [tier, setTierState] = React.useState(chooseInitialTier);
  const [active, setActive] = React.useState([]);
  const activeRef = React.useRef([]);
  const signatureRef = React.useRef('');
  const scanRef = React.useRef({
    x: Number.NaN,
    z: Number.NaN,
    chunkX: Number.NaN,
    chunkZ: Number.NaN,
    tier: '',
    at: 0
  });

  const setTier = React.useCallback((nextTier) => {
    if (!isQualityTier(nextTier)) return;
    setTierState(nextTier);
    try {
      window.localStorage.setItem(QUALITY_STORAGE_KEY, nextTier);
    } catch (error) {
      void error;
    }
  }, []);

  React.useEffect(() => {
    let live = true;
    fetch(MANIFEST_URL, { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`World manifest request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (live) setManifest(data);
      })
      .catch((error) => {
        console.warn('[world-streamer]', error);
      });
    return () => {
      live = false;
    };
  }, []);

  const profile = manifest?.quality?.[tier] || DEFAULT_QUALITY[tier];

  React.useEffect(() => {
    if (onProfileChange) onProfileChange(profile);
  }, [onProfileChange, profile]);

  React.useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const refresh = React.useCallback(() => {
    if (!enabled || !manifest) return;
    const position = getPlayerPosition(manifest);
    if (!position) return;
    const chunkSize = manifest.chunk_size_m || 512;
    const origin = manifest.origin || { x: -2048, z: -2048 };
    const chunkX = Math.floor((position.x - origin.x) / chunkSize);
    const chunkZ = Math.floor((position.z - origin.z) / chunkSize);
    const next = computeActiveChunks(
      manifest,
      profile,
      position.x,
      position.z,
      HIGH_CHUNK_LIMITS[tier] || 8
    );
    const signature = activeSignature(next);
    scanRef.current = {
      x: position.x,
      z: position.z,
      chunkX,
      chunkZ,
      tier,
      at: typeof performance !== 'undefined' ? performance.now() / 1000 : 0
    };
    if (signature === signatureRef.current) return;
    signatureRef.current = signature;
    setActive(next);
  }, [enabled, manifest, profile, tier]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  useFrame((state) => {
    if (!enabled || !manifest) return;
    const position = getPlayerPosition(manifest);
    if (!position) return;
    const chunkSize = manifest.chunk_size_m || 512;
    const origin = manifest.origin || { x: -2048, z: -2048 };
    const chunkX = Math.floor((position.x - origin.x) / chunkSize);
    const chunkZ = Math.floor((position.z - origin.z) / chunkSize);
    const now = typeof performance !== 'undefined' ? performance.now() / 1000 : state.clock.elapsedTime;
    const scan = scanRef.current;
    const moved = Math.hypot(position.x - scan.x, position.z - scan.z);
    if (scan.tier === tier &&
      scan.chunkX === chunkX &&
      scan.chunkZ === chunkZ &&
      moved < SCAN_DISTANCE_M &&
      now - scan.at < SCAN_INTERVAL_S) {
      return;
    }
    refresh();
  });

  React.useEffect(() => {
    const api = {
      get manifest() {
        return manifest;
      },
      get tier() {
        return tier;
      },
      get activeChunks() {
        return activeRef.current;
      },
      setTier,
      refresh
    };
    window.LexiWorldStreamer = api;
    return () => {
      if (window.LexiWorldStreamer === api) delete window.LexiWorldStreamer;
    };
  }, [manifest, refresh, setTier, tier]);

  return h(React.Fragment, null,
    active.map((entry) => h(WorldChunk, {
      key: entry.chunk.id,
      chunk: entry.chunk,
      lod: entry.lod
    }))
  );
}
