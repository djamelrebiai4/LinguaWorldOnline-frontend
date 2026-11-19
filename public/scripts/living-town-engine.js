const DAY_MINUTES = 1440;
const NEED_KEYS = ['energy', 'hunger', 'social', 'fun', 'money_need'];
const MOODS = new Set(['happy', 'neutral', 'tired', 'stressed', 'angry', 'excited']);
const GERMAN_NAMES = {
  female: ['Anna', 'Mia', 'Lena', 'Clara', 'Mila', 'Nora', 'Lea', 'Emilia', 'Ida', 'Amira', 'Aylin', 'Sophie', 'Hanna', 'Maja', 'Elif', 'Lina', 'Marlene', 'Zeynep'],
  male: ['Ben', 'Leon', 'Paul', 'Noah', 'Emil', 'Jonas', 'Lukas', 'Max', 'Elias', 'Karim', 'Milan', 'Oskar', 'Theo', 'Yusuf', 'Finn', 'David', 'Amir', 'Anton'],
  nonbinary: ['Alex', 'Sam', 'Jules', 'Noa', 'Kim', 'Robin', 'Mika', 'Lou']
};
const GERMAN_SURNAMES = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Yilmaz', 'Wagner', 'Becker', 'Hoffmann', 'Schulz', 'Koch', 'Bauer', 'Demir', 'Klein', 'Wolf', 'Özdemir', 'Hartmann', 'Neumann'];
const ACTIVITY_NEEDS = {
  sleep: { energy: 1.3 },
  eat: { hunger: 1.4 },
  social: { social: 1.15 },
  leisure: { fun: 1.1 },
  work: { money_need: 1.05 }
};
const NEED_ACTIVITY = {
  hunger: { activity: 'eat', place: 'cafe', threshold: 62, scale: 0.95 },
  social: { activity: 'social', place: 'cafe', threshold: 78, scale: 0.78 },
  fun: { activity: 'leisure', place: 'park', threshold: 82, scale: 0.72 },
  money_need: { activity: 'work', place: null, threshold: 88, scale: 0.72 }
};

function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRandom(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(random, values) {
  return values[Math.floor(random() * values.length)];
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function getWeekday(dayIndex) {
  return ((dayIndex % 7) + 7) % 7;
}

function getScheduleDay(dayIndex) {
  const weekday = getWeekday(dayIndex);
  return weekday === 5 ? 'saturday' : weekday === 6 ? 'sunday' : 'weekday';
}

function getScheduleBlock(template, minuteOfDay, offsetMinutes) {
  const shiftedMinute = (minuteOfDay - offsetMinutes + DAY_MINUTES) % DAY_MINUTES;
  return template.find((block) => shiftedMinute >= block.start && shiftedMinute < block.end)
    || template[template.length - 1];
}

function getMood(needs, personality) {
  if (needs.energy < 13) return 'tired';
  if (needs.hunger > 94 && personality.patience < 0.42) return 'angry';
  if (needs.energy < 29 || needs.hunger > 83 || needs.money_need > 96) return 'stressed';
  if (needs.fun > 82 && needs.energy > 58) return 'excited';
  if (needs.social < 27 && needs.hunger < 72 && needs.energy > 38) return 'happy';
  return 'neutral';
}

function placeId(placeType, residentIndex) {
  if (!placeType) return null;
  const zone = Math.floor(residentIndex / 6) + 1;
  return `${placeType}-${String(zone).padStart(2, '0')}`;
}

function buildResident(archetype, index, config, worldSeed, gameMinute) {
  const id = `resident-${String(index + 1).padStart(3, '0')}`;
  const random = makeRandom(hashSeed(`${worldSeed}:${id}`));
  const gender = pick(random, archetype.gender_mix);
  const firstName = pick(random, GERMAN_NAMES[gender] || GERMAN_NAMES.nonbinary);
  const surname = pick(random, GERMAN_SURNAMES);
  const seed = Math.floor(random() * 2147483647);
  const palettes = config.appearance_palettes;
  const variation = archetype.variation_minutes || 0;
  const offsetRange = Math.min(40, variation);
  const startOffset = Math.round((random() * 2 - 1) * offsetRange);
  const model = pick(random, archetype.model_pool);
  const color = (values) => pick(random, values);
  const clothes = pick(random, palettes.clothes_colors);
  const accessories = [];
  const accessory = pick(random, palettes.accessories);
  if (accessory !== 'none') accessories.push(accessory);

  const needs = Object.fromEntries(NEED_KEYS.map((key) => [key, archetype.initial_needs[key]]));
  const scheduleDaySeed = hashSeed(`${id}:${worldSeed}:0`);
  const scheduleRandom = makeRandom(scheduleDaySeed);
  const relationships = {};
  for (let otherIndex = Math.max(0, index - 2); otherIndex <= index + 2; otherIndex += 1) {
    if (otherIndex !== index) relationships[`resident-${String(otherIndex + 1).padStart(3, '0')}`] = Math.round((scheduleRandom() * 2 - 1) * 12);
  }

  return {
    id,
    name: { de: `${firstName} ${surname}` },
    age_group: pick(random, archetype.age_groups),
    gender,
    job: archetype.job_de,
    archetype_id: archetype.id,
    home_place_type: archetype.home_place_type,
    home_place_id: placeId(archetype.home_place_type, index),
    workplace_place_type: archetype.workplace_place_type,
    workplace_place_id: placeId(archetype.workplace_place_type, index),
    favorite_place_types: [...archetype.favorite_place_types],
    appearance: {
      seed,
      model,
      skin_color: color(palettes.skin_colors),
      hair_color: color(palettes.hair_colors),
      clothes_color: [...clothes],
      accessories,
      height_scale: Number((palettes.height_scale_range[0] + random() * (palettes.height_scale_range[1] - palettes.height_scale_range[0])).toFixed(3))
    },
    personality: { ...archetype.personality },
    needs,
    mood: archetype.baseline_mood,
    schedule: {
      template_id: archetype.schedule_template_id,
      personal_variation: {
        start_offset_minutes: startOffset,
        duration_scale: Number((0.9 + random() * 0.2).toFixed(3)),
        day_seed: scheduleDaySeed
      }
    },
    memory: { recent_interactions: [], player_relationship: 0, relationships },
    language_level: archetype.language_level,
    speech_vocabulary: [...archetype.speech_vocabulary],
    current_activity: 'sleep',
    current_place_type: archetype.home_place_type,
    current_place_id: placeId(archetype.home_place_type, index),
    schedule_activity: 'sleep',
    schedule_place_type: archetype.home_place_type,
    last_schedule_day: -1,
    think_timer: random() * 0.5,
    last_activity_score: 0,
    last_need_update_minute: gameMinute
  };
}

function deriveNeedRates(resident) {
  const traits = resident.personality;
  const sleepRelief = resident.current_activity === 'sleep' ? 3.2 : 1;
  const workHunger = ['work', 'work_route', 'work_prep'].includes(resident.current_activity) ? 1.2 : 1;
  return {
    energy: -(0.018 + (1 - traits.energy) * 0.012) * sleepRelief,
    hunger: (0.012 + traits.energy * 0.004) * workHunger,
    social: resident.current_activity === 'social' ? -0.05 : 0.006 + (1 - traits.talkativeness) * 0.004,
    fun: ['leisure', 'exercise', 'hobby', 'social', 'walk'].includes(resident.current_activity) ? -0.045 : 0.008 + (1 - traits.curiosity) * 0.003,
    money_need: ['work', 'work_route', 'work_prep'].includes(resident.current_activity) ? -0.018 : 0.0035
  };
}

function scoreActivity(resident, activity, scheduleBlock, weather, random) {
  const baseline = activity === scheduleBlock.activity ? 0.68 : 0.08;
  const needWeights = ACTIVITY_NEEDS[activity] || {};
  let needUtility = 0;
  for (const [need, weight] of Object.entries(needWeights)) {
    const level = need === 'energy' ? 100 - resident.needs.energy : resident.needs[need];
    needUtility += (level / 100) * weight;
  }
  const preference = resident.favorite_place_types.includes(scheduleBlock.place) ? 0.06 : 0;
  const weatherPenalty = weather === 'rain' && ['exercise', 'walk', 'sightseeing'].includes(activity) ? -0.14 : 0;
  const personality = activity === 'social'
    ? resident.personality.talkativeness * 0.08
    : activity === 'leisure'
      ? resident.personality.curiosity * 0.06
      : activity === 'sleep'
        ? (1 - resident.personality.energy) * 0.05
        : 0;
  return baseline + needUtility + preference + weatherPenalty + personality + random() * 0.035;
}

function chooseActivity(resident, scheduleBlock, weather, random, config) {
  let selected = {
    activity: scheduleBlock.activity,
    place: scheduleBlock.place,
    score: scoreActivity(resident, scheduleBlock.activity, scheduleBlock, weather, random)
  };
  const candidates = [];

  if (resident.needs.energy < 42) candidates.push({ activity: 'sleep', place: resident.home_place_type, need: (42 - resident.needs.energy) / 42 });
  for (const [need, candidate] of Object.entries(NEED_ACTIVITY)) {
    if (resident.needs[need] <= candidate.threshold) continue;
    const place = need === 'money_need' ? resident.workplace_place_type : candidate.place;
    if (!place) continue;
    candidates.push({ activity: candidate.activity, place, need: ((resident.needs[need] - candidate.threshold) / (100 - candidate.threshold)) * candidate.scale });
  }

  for (const candidate of candidates) {
    const block = { ...scheduleBlock, activity: candidate.activity, place: candidate.place };
    const score = candidate.need + scoreActivity(resident, candidate.activity, block, weather, random) * 0.42;
    if (score > selected.score + config.utility_hysteresis) selected = { ...candidate, score };
  }
  return selected;
}

function updateNeeds(resident, elapsedGameMinutes) {
  if (elapsedGameMinutes <= 0) return;
  const rates = deriveNeedRates(resident);
  for (const key of NEED_KEYS) {
    resident.needs[key] = Number(clamp(resident.needs[key] + rates[key] * elapsedGameMinutes, 0, 100).toFixed(2));
  }
  resident.mood = getMood(resident.needs, resident.personality);
}

export class LivingTownSimulation {
  constructor(config, options = {}) {
    if (!config || !Array.isArray(config.archetypes) || !config.schedule_templates) {
      throw new TypeError('Living town archetype configuration is invalid.');
    }
    this.config = config;
    this.population = clamp(Math.floor(options.population ?? config.population_defaults.default), config.population_defaults.minimum, config.population_defaults.maximum);
    this.fullSimulationCap = config.population_defaults.full_simulation_cap;
    this.fullSimulationRadius = config.population_defaults.full_simulation_radius_m;
    this.minutesPerRealSecond = options.minutesPerRealSecond ?? 2;
    this.aiThinkInterval = options.aiThinkInterval ?? 0.5;
    this.utilityHysteresis = options.utilityHysteresis ?? 0.08;
    this.worldSeed = String(options.seed ?? 'linguaworld-town-v1');
    this.dayIndex = options.dayIndex ?? 0;
    this.minuteOfDay = options.minuteOfDay ?? 420;
    this.totalGameMinutes = this.dayIndex * DAY_MINUTES + this.minuteOfDay;
    this.weather = options.weather ?? 'clear';
    this.paused = false;
    this.accumulator = 0;
    this.residents = Array.from({ length: this.population }, (_, index) => {
      const archetype = config.archetypes[index % config.archetypes.length];
      const resident = buildResident(archetype, index, config, this.worldSeed, this.totalGameMinutes);
      this.updateResidentSchedule(resident);
      return resident;
    });
    this.listeners = new Set();
    this.lastEmittedMinute = -1;
    this.destroyed = false;
  }

  subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('Listener must be a function.');
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(type, payload) {
    for (const listener of this.listeners) listener({ type, ...payload });
  }

  updateResidentSchedule(resident) {
    const day = getScheduleDay(this.dayIndex);
    const template = this.config.schedule_templates[resident.schedule.template_id];
    const blocks = template[day] || template.weekday;
    const block = getScheduleBlock(blocks, this.minuteOfDay, resident.schedule.personal_variation.start_offset_minutes);
    resident.schedule_activity = block.activity;
    resident.schedule_place_type = block.place;
    resident.last_schedule_day = this.dayIndex;
  }

  thinkResident(resident) {
    if (resident.last_schedule_day !== this.dayIndex) this.updateResidentSchedule(resident);
    const block = {
      activity: resident.schedule_activity,
      place: resident.schedule_place_type
    };
    const dailySeed = hashSeed(`${resident.id}:${this.worldSeed}:${this.dayIndex}`);
    const random = makeRandom((dailySeed + Math.floor(this.minuteOfDay / 5)) >>> 0);
    const decision = chooseActivity(resident, block, this.weather, random, this);
    const changed = resident.current_activity !== decision.activity || resident.current_place_type !== decision.place;
    if (changed) {
      resident.current_activity = decision.activity;
      resident.current_place_type = decision.place;
      resident.current_place_id = decision.place === resident.home_place_type
        ? resident.home_place_id
        : decision.place === resident.workplace_place_type
          ? resident.workplace_place_id
          : placeId(decision.place, Number(resident.id.slice(-3)) - 1);
      resident.last_activity_score = Number(decision.score.toFixed(3));
      this.emit('activity', this.publicResidentState(resident));
    }
  }

  publicResidentState(resident) {
    return {
      id: resident.id,
      name: resident.name.de,
      archetype_id: resident.archetype_id,
      activity: resident.current_activity,
      place_type: resident.current_place_type,
      place_id: resident.current_place_id,
      schedule_activity: resident.schedule_activity,
      schedule_place_type: resident.schedule_place_type,
      mood: resident.mood,
      needs: { ...resident.needs },
      score: resident.last_activity_score
    };
  }

  snapshot() {
    return {
      day_index: this.dayIndex,
      weekday: getWeekday(this.dayIndex),
      minute_of_day: Math.floor(this.minuteOfDay),
      time: `${String(Math.floor(this.minuteOfDay / 60)).padStart(2, '0')}:${String(Math.floor(this.minuteOfDay % 60)).padStart(2, '0')}`,
      weather: this.weather,
      population: this.population,
      full_simulation_cap: this.fullSimulationCap,
      full_simulation_radius_m: this.fullSimulationRadius,
      residents: this.residents.map((resident) => this.publicResidentState(resident))
    };
  }

  setWorldState(state = {}) {
    if (this.destroyed || !state || typeof state !== 'object') return;
    if (typeof state.seed === 'string' && state.seed) this.worldSeed = state.seed;
    if (Number.isFinite(state.dayIndex)) this.dayIndex = Math.max(0, Math.floor(state.dayIndex));
    if (Number.isFinite(state.minuteOfDay)) {
      const minute = ((Math.floor(state.minuteOfDay) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
      this.minuteOfDay = minute;
    }
    if (typeof state.weather === 'string' && state.weather) this.weather = state.weather;
    this.totalGameMinutes = this.dayIndex * DAY_MINUTES + this.minuteOfDay;
    this.residents.forEach((resident) => this.updateResidentSchedule(resident));
    const roundedMinute = Math.floor(this.minuteOfDay);
    this.lastEmittedMinute = roundedMinute;
    this.emit('clock', {
      day_index: this.dayIndex,
      weekday: getWeekday(this.dayIndex),
      minute_of_day: roundedMinute,
      time: `${String(Math.floor(roundedMinute / 60)).padStart(2, '0')}:${String(roundedMinute % 60).padStart(2, '0')}`,
      weather: this.weather,
      synced: true
    });
  }

  advance(realDeltaSeconds, paused = false, weather = this.weather) {
    if (this.destroyed || !Number.isFinite(realDeltaSeconds) || realDeltaSeconds <= 0) return;
    this.paused = Boolean(paused);
    if (this.paused) return;
    if (weather && weather !== this.weather) this.weather = weather;
    this.accumulator += Math.min(realDeltaSeconds, 0.25);
    const interval = this.aiThinkInterval;
    while (this.accumulator >= interval) {
      this.accumulator -= interval;
      const gameMinutes = interval * this.minutesPerRealSecond;
      this.minuteOfDay += gameMinutes;
      this.totalGameMinutes += gameMinutes;
      if (this.minuteOfDay >= DAY_MINUTES) {
        this.minuteOfDay -= DAY_MINUTES;
        this.dayIndex += 1;
        this.emit('day', { day_index: this.dayIndex, weekday: getWeekday(this.dayIndex) });
      }

      for (let index = 0; index < this.residents.length; index += 1) {
        const resident = this.residents[index];
        const elapsedMinutes = Math.max(0, this.totalGameMinutes - resident.last_need_update_minute);
        updateNeeds(resident, elapsedMinutes);
        resident.last_need_update_minute = this.totalGameMinutes;
        resident.think_timer += interval;
        if (resident.think_timer >= this.aiThinkInterval) {
          resident.think_timer = 0;
          this.thinkResident(resident);
        }
      }
      const roundedMinute = Math.floor(this.minuteOfDay);
      if (roundedMinute !== this.lastEmittedMinute) {
        this.lastEmittedMinute = roundedMinute;
        this.emit('clock', {
          day_index: this.dayIndex,
          weekday: getWeekday(this.dayIndex),
          minute_of_day: roundedMinute,
          time: `${String(Math.floor(roundedMinute / 60)).padStart(2, '0')}:${String(roundedMinute % 60).padStart(2, '0')}`,
          weather: this.weather
        });
      }
    }
  }

  getResident(id) {
    const resident = this.residents.find((entry) => entry.id === id);
    return resident ? this.publicResidentState(resident) : null;
  }

  recordInteraction(id, interaction, actorId = 'player') {
    const resident = this.residents.find((entry) => entry.id === id);
    if (!resident || !interaction) return false;
    const relationshipDelta = clamp(Number(interaction.relationship_delta) || 0, -25, 25);
    const record = {
      actor_id: actorId,
      kind: interaction.kind || 'conversation',
      timestamp: Date.now(),
      relationship_delta: relationshipDelta
    };
    resident.memory.recent_interactions.push(record);
    resident.memory.recent_interactions.splice(0, Math.max(0, resident.memory.recent_interactions.length - 5));
    if (actorId === 'player') resident.memory.player_relationship = clamp(resident.memory.player_relationship + relationshipDelta, -100, 100);
    else resident.memory.relationships[actorId] = clamp((resident.memory.relationships[actorId] || 0) + relationshipDelta, -100, 100);
    resident.needs.social = clamp(resident.needs.social - 8 - resident.personality.friendliness * 4, 0, 100);
    resident.mood = getMood(resident.needs, resident.personality);
    this.emit('interaction', this.publicResidentState(resident));
    return true;
  }

  destroy() {
    this.destroyed = true;
    this.listeners.clear();
    this.residents.length = 0;
  }
}

export async function loadLivingTownSimulation(options = {}) {
  const fetcher = options.fetcher || globalThis.fetch;
  if (typeof fetcher !== 'function') throw new Error('Fetch is unavailable; cannot load local town data.');
  const response = await fetcher(options.configUrl || '/data/living-town-archetypes.json', { cache: 'force-cache' });
  if (!response.ok) throw new Error(`Could not load local town data (${response.status}).`);
  const config = await response.json();
  return new LivingTownSimulation(config, options);
}

export { DAY_MINUTES, getMood, getScheduleBlock, getScheduleDay, hashSeed };
