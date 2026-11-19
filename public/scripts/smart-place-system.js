function clockDay(clock) {
  return ((Number(clock?.weekday ?? clock?.day_index ?? 0) % 7) + 7) % 7;
}

function clockMinute(clock) {
  return Math.max(0, Math.min(1439, Math.floor(Number(clock?.minute_of_day) || 0)));
}

function stableIndex(value, length) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return (hash >>> 0) % length;
}

function positionIsValid(position) {
  return position && Number.isFinite(position.x) && Number.isFinite(position.z);
}

export class SmartPlaceSystem {
  constructor(catalog) {
    if (!catalog || !Array.isArray(catalog.places)) {
      throw new TypeError('Smart place catalog is invalid.');
    }
    this.places = new Map(catalog.places.map((place) => [place.id, place]));
    this.resolvedSlots = new Map();
    this.reservations = new Map();
    this.queues = new Map();
    this.interactions = new Map();
    this.listeners = new Set();
    this.sequence = 0;
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

  getPlace(placeId) {
    return this.places.get(placeId) || null;
  }

  isOpen(placeId, clock) {
    const place = this.getPlace(placeId);
    if (!place) return false;
    const day = clockDay(clock);
    if (place.closed_days.includes(day)) return false;
    const minute = clockMinute(clock);
    const { open_minute: opens, close_minute: closes } = place.opening_hours;
    if (opens === 0 && closes === 1440) return true;
    if (opens < closes) return minute >= opens && minute < closes;
    return minute >= opens || minute < closes;
  }

  getSlotTemplate(place, slotId) {
    return (place.slot_templates || []).find((slot) => slot.id === slotId) || null;
  }

  registerResolvedSlots(placeId, templateId, slots) {
    const place = this.getPlace(placeId);
    const template = place && this.getSlotTemplate(place, templateId);
    if (!template) return { ok: false, reason: 'unknown_template' };
    if (!Array.isArray(slots) || slots.length === 0) return { ok: false, reason: 'empty_resolution' };
    if (slots.some((slot) => !slot.id || !positionIsValid(slot.position))) {
      return { ok: false, reason: 'invalid_slot_position' };
    }
    const key = `${placeId}:${templateId}`;
    const uniqueIds = new Set(slots.map((slot) => slot.id));
    if (uniqueIds.size !== slots.length) return { ok: false, reason: 'duplicate_slot_id' };
    const normalized = slots.map((slot) => ({
      ...slot,
      template_id: templateId,
      kind: slot.kind || template.kind,
      role: slot.role || template.role,
      capacity: Math.max(1, Math.floor(slot.capacity || 1))
    }));
    this.resolvedSlots.set(key, normalized);
    this.emit('slots-resolved', { place_id: placeId, template_id: templateId, count: normalized.length });
    return { ok: true, count: normalized.length };
  }

  getSlots(place, slotId) {
    const staticSlot = (place.slots || []).find((slot) => slot.id === slotId);
    if (staticSlot) return [staticSlot];
    const key = `${place.id}:${slotId}`;
    return this.resolvedSlots.get(key) || [];
  }

  reserveSlot(placeId, slotId, npcId, roleGroup, clock) {
    const place = this.getPlace(placeId);
    if (!place) return { ok: false, reason: 'unknown_place' };
    if (!this.isOpen(placeId, clock)) return { ok: false, reason: 'closed' };
    if (!npcId) return { ok: false, reason: 'missing_npc' };
    if (roleGroup && !['staff', 'visitors'].some((group) => group === roleGroup || place.roles[group]?.includes(roleGroup))) {
      return { ok: false, reason: 'role_not_allowed' };
    }

    const slots = this.getSlots(place, slotId);
    if (slots.length === 0) {
      const template = this.getSlotTemplate(place, slotId);
      return { ok: false, reason: template ? 'anchor_pending' : 'unknown_slot', anchor_node: template?.anchor_node };
    }

    for (const slot of slots) {
      const key = `${placeId}:${slot.id}`;
      let occupants = this.reservations.get(key);
      if (!occupants) {
        occupants = new Set();
        this.reservations.set(key, occupants);
      }
      if (occupants.has(npcId)) return { ok: true, slot_id: slot.id, already_reserved: true, position: slot.position };
      if (occupants.size >= slot.capacity) continue;
      occupants.add(npcId);
      this.emit('slot-reserved', { place_id: placeId, slot_id: slot.id, npc_id: npcId });
      return { ok: true, slot_id: slot.id, position: slot.position, rotation_y: slot.rotation_y || 0 };
    }
    return { ok: false, reason: 'full', slot_id: slotId };
  }

  releaseSlot(placeId, slotId, npcId) {
    const key = `${placeId}:${slotId}`;
    const occupants = this.reservations.get(key);
    if (!occupants || !occupants.delete(npcId)) return false;
    if (occupants.size === 0) this.reservations.delete(key);
    this.emit('slot-released', { place_id: placeId, slot_id: slotId, npc_id: npcId });
    return true;
  }

  joinQueue(placeId, queueId, npcId, clock) {
    const place = this.getPlace(placeId);
    if (!place) return { ok: false, reason: 'unknown_place' };
    if (!this.isOpen(placeId, clock)) return { ok: false, reason: 'closed' };
    const template = this.getSlotTemplate(place, queueId);
    const slot = (place.slots || []).find((entry) => entry.id === queueId);
    if (!template && !slot) return { ok: false, reason: 'unknown_queue' };
    const key = `${placeId}:${queueId}`;
    let queue = this.queues.get(key);
    if (!queue) {
      queue = [];
      this.queues.set(key, queue);
    }
    const existing = queue.findIndex((entry) => entry.npc_id === npcId);
    if (existing >= 0) return { ok: true, position: existing + 1, already_waiting: true };
    const capacity = template?.queue_capacity ?? slot?.capacity ?? 12;
    if (queue.length >= capacity) return { ok: false, reason: 'queue_full' };
    queue.push({ npc_id: npcId, joined_minute: clockMinute(clock), role: template?.role || slot?.role });
    this.emit('queue-joined', { place_id: placeId, queue_id: queueId, npc_id: npcId, position: queue.length });
    return { ok: true, position: queue.length };
  }

  leaveQueue(placeId, queueId, npcId) {
    const key = `${placeId}:${queueId}`;
    const queue = this.queues.get(key);
    if (!queue) return false;
    const index = queue.findIndex((entry) => entry.npc_id === npcId);
    if (index < 0) return false;
    queue.splice(index, 1);
    if (queue.length === 0) this.queues.delete(key);
    else this.emit('queue-reordered', { place_id: placeId, queue_id: queueId, npc_ids: queue.map((entry) => entry.npc_id) });
    return true;
  }

  expandScript(script, npcId, dayIndex) {
    const expanded = [];
    for (const step of script) {
      if (!step.repeat) {
        expanded.push({ ...step });
        continue;
      }
      const count = step.repeat.min + stableIndex(`${npcId}:${dayIndex}:${step.state}`, step.repeat.max - step.repeat.min + 1);
      for (let index = 0; index < count; index += 1) {
        expanded.push({ ...step, repeat_index: index });
      }
    }
    return expanded;
  }

  startScript(placeId, scriptId, npcId, options = {}) {
    const place = this.getPlace(placeId);
    if (!place) return { ok: false, reason: 'unknown_place' };
    if (!this.isOpen(placeId, options.clock)) return { ok: false, reason: 'closed' };
    const definition = place.scripts[scriptId];
    if (!definition) return { ok: false, reason: 'unknown_script' };
    if (!npcId) return { ok: false, reason: 'missing_npc' };

    const heldSlots = [];
    for (const slotId of options.slotIds || []) {
      const reservation = this.reserveSlot(placeId, slotId, npcId, options.roleGroup, options.clock);
      if (!reservation.ok) {
        heldSlots.forEach((heldSlotId) => this.releaseSlot(placeId, heldSlotId, npcId));
        return reservation;
      }
      heldSlots.push(reservation.slot_id);
    }

    const interactionId = `${placeId}:${npcId}:${++this.sequence}`;
    const steps = this.expandScript(definition, npcId, options.clock?.day_index || 0);
    const interaction = {
      id: interactionId,
      place_id: placeId,
      script_id: scriptId,
      npc_id: npcId,
      role: options.role || 'resident',
      steps,
      step_index: 0,
      remaining_minutes: steps[0].duration_minutes,
      held_slots: heldSlots,
      auto_held_slots: [],
      satisfied_slots: new Set(),
      role_group: options.roleGroup,
      queue_id: null,
      waiting_reason: null,
      state: 'running'
    };
    this.interactions.set(interactionId, interaction);
    this.emit('script-step', this.publicInteraction(interaction));
    return { ok: true, interaction_id: interactionId, step: this.publicInteraction(interaction) };
  }

  publicInteraction(interaction) {
    const step = interaction.steps[interaction.step_index];
    return {
      interaction_id: interaction.id,
      place_id: interaction.place_id,
      script_id: interaction.script_id,
      npc_id: interaction.npc_id,
      role: step?.role || interaction.role,
      run_state: interaction.state,
      state: step?.state || 'complete',
      animation: step?.animation || null,
      speech_de: step?.speech_de || null,
      remaining_minutes: Math.max(0, interaction.remaining_minutes),
      repeat_index: step?.repeat_index ?? null,
      requires_slot: step?.requires_slot || null,
      requires_slots: step?.requires_slots || []
    };
  }

  advance(gameMinutes, clock) {
    if (this.destroyed || !Number.isFinite(gameMinutes) || gameMinutes <= 0) return;
    for (const [id, interaction] of this.interactions) {
      if (!['running', 'waiting_slot', 'waiting_queue'].includes(interaction.state)) continue;
      if (!this.isOpen(interaction.place_id, clock)) {
        this.cancelScript(id, 'place_closed');
        continue;
      }
      let remaining = gameMinutes;
      let transitions = 0;
      while (remaining > 0 && interaction.step_index < interaction.steps.length && transitions < 32) {
        const currentStep = interaction.steps[interaction.step_index];
        const requiredSlots = [...new Set([...(currentStep.requires_slots || []), currentStep.requires_slot].filter(Boolean))];
        const place = this.getPlace(interaction.place_id);
        for (const requiredSlot of requiredSlots) {
          if (interaction.satisfied_slots.has(requiredSlot)) continue;
          const template = this.getSlotTemplate(place, requiredSlot);
          if (template?.kind === 'queue') {
            const queued = this.joinQueue(interaction.place_id, requiredSlot, interaction.npc_id, clock);
            if (!queued.ok) {
              interaction.state = 'waiting_queue';
              interaction.waiting_reason = queued.reason;
              if (interaction.last_wait_event !== queued.reason) {
                interaction.last_wait_event = queued.reason;
                this.emit('script-waiting', { interaction_id: id, npc_id: interaction.npc_id, reason: queued.reason });
              }
              break;
            }
            const queue = this.queues.get(`${interaction.place_id}:${requiredSlot}`) || [];
            const queueIndex = queue.findIndex((entry) => entry.npc_id === interaction.npc_id);
            if (queueIndex > 0) {
              interaction.state = 'waiting_queue';
              interaction.waiting_reason = 'queue_position';
              if (interaction.last_wait_event !== queueIndex + 1) {
                interaction.last_wait_event = queueIndex + 1;
                this.emit('script-waiting', { interaction_id: id, npc_id: interaction.npc_id, reason: 'queue_position', position: queueIndex + 1 });
              }
              break;
            }
            interaction.queue_id = requiredSlot;
            interaction.satisfied_slots.add(requiredSlot);
          } else {
            const reservation = this.reserveSlot(
              interaction.place_id,
              requiredSlot,
              interaction.npc_id,
              interaction.role_group,
              clock
            );
            if (!reservation.ok) {
              interaction.state = 'waiting_slot';
              interaction.waiting_reason = reservation.reason;
              if (interaction.last_wait_event !== reservation.reason) {
                interaction.last_wait_event = reservation.reason;
                this.emit('script-waiting', { interaction_id: id, npc_id: interaction.npc_id, reason: reservation.reason, slot_id: requiredSlot, anchor_node: reservation.anchor_node });
              }
              break;
            }
            interaction.held_slots.push(reservation.slot_id);
            interaction.auto_held_slots.push({ slot_id: reservation.slot_id, template_id: requiredSlot });
            interaction.satisfied_slots.add(requiredSlot);
          }
        }
        if (interaction.state === 'waiting_slot' || interaction.state === 'waiting_queue') break;
        interaction.state = 'running';
        interaction.waiting_reason = null;
        const consumed = Math.min(remaining, interaction.remaining_minutes);
        remaining -= consumed;
        interaction.remaining_minutes -= consumed;
        if (interaction.remaining_minutes > 0) break;
        if (interaction.queue_id && requiredSlots.includes(interaction.queue_id)) {
          this.leaveQueue(interaction.place_id, interaction.queue_id, interaction.npc_id);
          interaction.satisfied_slots.delete(interaction.queue_id);
          interaction.queue_id = null;
        }
        interaction.step_index += 1;
        transitions += 1;
        const remainingSlotTemplates = new Set(
          interaction.steps.slice(interaction.step_index)
            .flatMap((step) => [...(step.requires_slots || []), step.requires_slot])
            .filter(Boolean)
        );
        for (let index = interaction.auto_held_slots.length - 1; index >= 0; index -= 1) {
          const held = interaction.auto_held_slots[index];
          if (remainingSlotTemplates.has(held.template_id)) continue;
          this.releaseSlot(interaction.place_id, held.slot_id, interaction.npc_id);
          interaction.held_slots = interaction.held_slots.filter((slotId) => slotId !== held.slot_id);
          interaction.satisfied_slots.delete(held.template_id);
          interaction.auto_held_slots.splice(index, 1);
        }
        if (interaction.step_index >= interaction.steps.length) {
          interaction.state = 'complete';
          for (const slotId of interaction.held_slots) this.releaseSlot(interaction.place_id, slotId, interaction.npc_id);
          this.interactions.delete(id);
          this.emit('script-complete', { interaction_id: id, place_id: interaction.place_id, npc_id: interaction.npc_id });
          break;
        }
        interaction.remaining_minutes = interaction.steps[interaction.step_index].duration_minutes;
        this.emit('script-step', this.publicInteraction(interaction));
      }
    }
  }

  cancelScript(interactionId, reason = 'cancelled') {
    const interaction = this.interactions.get(interactionId);
    if (!interaction) return false;
    for (const slotId of interaction.held_slots) this.releaseSlot(interaction.place_id, slotId, interaction.npc_id);
    interaction.state = 'cancelled';
    this.interactions.delete(interactionId);
    this.emit('script-cancelled', { interaction_id: interactionId, npc_id: interaction.npc_id, reason });
    return true;
  }

  destroy() {
    this.destroyed = true;
    for (const id of [...this.interactions.keys()]) this.cancelScript(id, 'system_destroyed');
    this.listeners.clear();
    this.reservations.clear();
    this.queues.clear();
    this.resolvedSlots.clear();
  }
}

export async function loadSmartPlaceSystem(options = {}) {
  const fetcher = options.fetcher || globalThis.fetch;
  if (typeof fetcher !== 'function') throw new Error('Fetch is unavailable; cannot load local place data.');
  const response = await fetcher(options.catalogUrl || '/data/living-town-places.json', { cache: 'force-cache' });
  if (!response.ok) throw new Error(`Could not load local place data (${response.status}).`);
  return new SmartPlaceSystem(await response.json());
}
