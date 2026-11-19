const STREET_SPECS = [
  { id: 'main-north-south', axis: 'z', fixed: 30, min: -255, max: 335, width: 15, sidewalk: 3 },
  { id: 'main-west-east', axis: 'x', fixed: 95, min: -220, max: 220, width: 14, sidewalk: 3 },
  { id: 'north-west-east', axis: 'x', fixed: -50, min: -185, max: 185, width: 11, sidewalk: 2.5 },
  { id: 'south-west-east', axis: 'x', fixed: -130, min: -140, max: 160, width: 11, sidewalk: 2.5 },
  { id: 'park-west-east', axis: 'x', fixed: 170, min: -215, max: 135, width: 12, sidewalk: 2.8 },
  { id: 'school-west-east', axis: 'x', fixed: 284, min: -150, max: 115, width: 14, sidewalk: 3 },
  { id: 'house-west-east', axis: 'x', fixed: -203, min: 30, max: 160, width: 13, sidewalk: 2.8 },
  { id: 'upper-west-east', axis: 'x', fixed: 230, min: -155, max: 145, width: 12, sidewalk: 2.8 }
];

const CROSSINGS = [
  { id: 'main', x: 30, z: 95 },
  { id: 'park', x: 30, z: 170 },
  { id: 'school', x: 30, z: 284 },
  { id: 'house', x: 30, z: -203 }
];

const RESIDENTIAL_BUILDINGS = [
  [-130, -165.37], [-78, -168.37], [76, -166.87], [126, -166.87],
  [-182, -79.37], [-128, -80.87], [-22, -79.37], [76, -82.37], [181, -82.37],
  [-185, 1.13], [-78, 1.13], [-22, -0.37], [128, -0.37], [184, 1.13],
  [-132, 23.87], [-78, 22.37], [78, 23.87], [130, 22.37],
  [-82, 123.87], [-25, 123.87], [133, 123.87], [186, 123.37],
  [-177, 271.13], [-80, 269.63], [0, 269.63], [132, 271.13],
  [-184, 330.63], [-128, 327.63], [-20, 329.13], [72, 327.63]
];

const EXTERIOR_DESTINATIONS = {
  park: { x: -170, z: 130 },
  school: { x: -131, z: 264.13 },
  supermarket: { x: 83, z: 268.13 },
  cafe: { x: 99, z: 160.13 },
  restaurant: { x: 99, z: 160.13 },
  home: null,
  city_street: null
};

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

function getSeededUnit(value) {
  let seed = hashSeed(value) || 1;
  seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
  seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
  seed ^= seed >>> 16;
  return (seed >>> 0) / 4294967296;
}

function distanceBetween(first, second) {
  return Math.hypot(first.x - second.x, first.z - second.z);
}

function sampleLine(minimum, maximum, step, extras = []) {
  const values = [minimum, maximum, ...extras.filter((value) => value >= minimum && value <= maximum)];
  for (let value = minimum + step; value < maximum; value += step) values.push(value);
  return [...new Set(values.map((value) => Number(value.toFixed(2))))].sort((a, b) => a - b);
}

export class CityNavigationGraph {
  constructor(options = {}) {
    this.step = options.step || 22;
    this.nodes = new Map();
    this.edges = new Map();
    this.streetNodes = new Map();
    this.build();
  }

  addNode(id, x, z, kind = 'sidewalk') {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id, x, z, kind });
      this.edges.set(id, []);
    }
    return this.nodes.get(id);
  }

  connect(firstId, secondId, kind = 'sidewalk') {
    const first = this.nodes.get(firstId);
    const second = this.nodes.get(secondId);
    if (!first || !second || firstId === secondId) return;
    const weight = distanceBetween(first, second);
    this.edges.get(firstId).push({ to: secondId, weight, kind });
    this.edges.get(secondId).push({ to: firstId, weight, kind });
  }

  build() {
    const verticalStreets = STREET_SPECS.filter((street) => street.axis === 'z');
    const horizontalStreets = STREET_SPECS.filter((street) => street.axis === 'x');
    for (const street of STREET_SPECS) {
      const intersections = street.axis === 'z'
        ? horizontalStreets.filter((crossing) => street.fixed >= crossing.min && street.fixed <= crossing.max).map((crossing) => crossing.fixed)
        : verticalStreets.filter((crossing) => crossing.fixed >= street.min && crossing.fixed <= street.max).map((crossing) => crossing.fixed);
      for (const side of [-1, 1]) {
        const offset = side * (street.width / 2 + street.sidewalk / 2 + 0.16);
        const coordinates = sampleLine(street.min, street.max, this.step, intersections)
          .filter((value) => !intersections.some((intersection) => Math.abs(intersection - value) < 0.01));
        const ids = [];
        coordinates.forEach((value, index) => {
          const x = street.axis === 'z' ? street.fixed + offset : value;
          const z = street.axis === 'z' ? value : street.fixed + offset;
          const id = `walk:${street.id}:${side}:${index}`;
          this.addNode(id, x, z);
          ids.push(id);
        });
        this.streetNodes.set(`${street.id}:${side}`, ids);
        for (let index = 1; index < ids.length; index += 1) {
          const previous = coordinates[index - 1];
          const current = coordinates[index];
          if (intersections.some((intersection) => intersection > previous && intersection < current)) continue;
          this.connect(ids[index - 1], ids[index]);
        }
      }
    }

    for (const vertical of verticalStreets) {
      for (const horizontal of horizontalStreets) {
        if (vertical.fixed < horizontal.min || vertical.fixed > horizontal.max) continue;
        const markedCrossing = CROSSINGS.some((crossing) =>
          Math.abs(crossing.x - vertical.fixed) < 0.01 && Math.abs(crossing.z - horizontal.fixed) < 0.01
        );
        const intersectionId = `${markedCrossing ? 'crossing' : 'intersection'}:${vertical.id}:${horizontal.id}`;
        this.addNode(intersectionId, vertical.fixed, horizontal.fixed, markedCrossing ? 'crosswalk' : 'intersection');

        for (const verticalSide of [-1, 1]) {
          const x = vertical.fixed + verticalSide * (vertical.width / 2 + vertical.sidewalk / 2 + 0.16);
          const verticalPrefix = `walk:${vertical.id}:${verticalSide}:`;
          const verticalBefore = this.nearestNodeId({ x, z: horizontal.fixed - 0.5 }, verticalPrefix, null, (node) => node.z < horizontal.fixed);
          const verticalAfter = this.nearestNodeId({ x, z: horizontal.fixed + 0.5 }, verticalPrefix, null, (node) => node.z > horizontal.fixed);
          this.connect(intersectionId, verticalBefore, markedCrossing ? 'crosswalk' : 'intersection');
          this.connect(intersectionId, verticalAfter, markedCrossing ? 'crosswalk' : 'intersection');

          for (const horizontalSide of [-1, 1]) {
            const z = horizontal.fixed + horizontalSide * (horizontal.width / 2 + horizontal.sidewalk / 2 + 0.16);
            const cornerId = `corner:${vertical.id}:${horizontal.id}:${verticalSide}:${horizontalSide}`;
            this.addNode(cornerId, x, z, 'sidewalk_corner');
            const horizontalPrefix = `walk:${horizontal.id}:${horizontalSide}:`;
            const verticalId = this.nearestNodeId({ x, z }, verticalPrefix);
            const horizontalId = this.nearestNodeId({ x, z }, horizontalPrefix);
            this.connect(cornerId, verticalId, 'corner');
            this.connect(cornerId, horizontalId, 'corner');

            const horizontalBefore = this.nearestNodeId({ x: vertical.fixed - 0.5, z }, horizontalPrefix, null, (node) => node.x < vertical.fixed);
            const horizontalAfter = this.nearestNodeId({ x: vertical.fixed + 0.5, z }, horizontalPrefix, null, (node) => node.x > vertical.fixed);
            this.connect(intersectionId, horizontalBefore, markedCrossing ? 'crosswalk' : 'intersection');
            this.connect(intersectionId, horizontalAfter, markedCrossing ? 'crosswalk' : 'intersection');
          }
        }
      }
    }

    for (const crossing of CROSSINGS) {
      const centerId = `crossing:${crossing.id}`;
      this.addNode(centerId, crossing.x, crossing.z, 'crosswalk');
      for (const street of STREET_SPECS) {
        if (street.axis === 'z' && Math.abs(street.fixed - crossing.x) < 0.01
          && crossing.z >= street.min && crossing.z <= street.max) {
          for (const side of [-1, 1]) this.connect(centerId, this.nearestNodeId({ x: street.fixed + side * (street.width / 2 + street.sidewalk / 2 + 0.16), z: crossing.z }, `walk:${street.id}:${side}:`), 'crosswalk');
        }
        if (street.axis === 'x' && Math.abs(street.fixed - crossing.z) < 0.01
          && crossing.x >= street.min && crossing.x <= street.max) {
          for (const side of [-1, 1]) this.connect(centerId, this.nearestNodeId({ x: crossing.x, z: street.fixed + side * (street.width / 2 + street.sidewalk / 2 + 0.16) }, `walk:${street.id}:${side}:`), 'crosswalk');
        }
      }
    }

    const landmarks = [
      ...RESIDENTIAL_BUILDINGS.map(([x, z], index) => ({ id: `home:${String(index + 1).padStart(2, '0')}`, x, z, kind: 'home' })),
      { id: 'place:park', ...EXTERIOR_DESTINATIONS.park, kind: 'park' },
      { id: 'place:school', ...EXTERIOR_DESTINATIONS.school, kind: 'entrance' },
      { id: 'place:supermarket', ...EXTERIOR_DESTINATIONS.supermarket, kind: 'entrance' },
      { id: 'place:cafe', ...EXTERIOR_DESTINATIONS.cafe, kind: 'entrance' }
    ];
    for (const landmark of landmarks) {
      this.addNode(landmark.id, landmark.x, landmark.z, landmark.kind);
      const closest = this.nearestNodeId(landmark, 'walk:', landmark.id);
      this.connect(landmark.id, closest, 'access');
    }
  }

  nearestNodeId(position, prefix = null, excludeId = null, filter = null) {
    let nearestId = null;
    let nearestDistance = Infinity;
    for (const [id, node] of this.nodes) {
      if (id === excludeId || (prefix && !id.startsWith(prefix)) || (filter && !filter(node))) continue;
      const distance = distanceBetween(position, node);
      if (distance < nearestDistance) {
        nearestId = id;
        nearestDistance = distance;
      }
    }
    return nearestId;
  }

  findPath(start, destination) {
    if (!start || !destination) return [];
    const startId = typeof start === 'string' ? start : this.nearestNodeId(start);
    const targetId = typeof destination === 'string' ? destination : this.nearestNodeId(destination);
    if (!startId || !targetId) return [];
    if (startId === targetId) return [this.nodes.get(startId)];

    const distances = new Map([[startId, 0]]);
    const previous = new Map();
    const open = new Set([startId]);
    while (open.size) {
      let currentId = null;
      let currentDistance = Infinity;
      for (const id of open) {
        const candidateDistance = distances.get(id);
        if (candidateDistance < currentDistance) {
          currentDistance = candidateDistance;
          currentId = id;
        }
      }
      if (currentId === targetId) break;
      open.delete(currentId);
      for (const edge of this.edges.get(currentId) || []) {
        const nextDistance = currentDistance + edge.weight;
        if (nextDistance >= (distances.get(edge.to) ?? Infinity)) continue;
        distances.set(edge.to, nextDistance);
        previous.set(edge.to, currentId);
        open.add(edge.to);
      }
    }
    if (!previous.has(targetId)) return [];
    const path = [];
    for (let id = targetId; id; id = previous.get(id)) path.push(this.nodes.get(id));
    path.reverse();
    return path;
  }

  nearestResidentialHome(residentId) {
    const index = Math.floor(getSeededUnit(residentId) * RESIDENTIAL_BUILDINGS.length) + 1;
    return this.nodes.get(`home:${String(index).padStart(2, '0')}`) || null;
  }

  destinationFor(resident) {
    const placeType = resident.current_place_type || resident.schedule_place_type;
    if (placeType === 'home') return this.nearestResidentialHome(resident.id);
    if (placeType === 'city_street' || !EXTERIOR_DESTINATIONS[placeType]) {
      const streetNodes = [...this.nodes.values()].filter((node) => node.kind === 'crosswalk' || node.kind === 'sidewalk');
      if (!streetNodes.length) return null;
      return streetNodes[Math.floor(getSeededUnit(`${resident.id}:${resident.schedule_activity}`) * streetNodes.length)];
    }
    const destinationKey = placeType === 'restaurant' ? 'cafe' : placeType;
    const destination = EXTERIOR_DESTINATIONS[destinationKey];
    return this.nodes.get(`place:${destinationKey}`) || destination;
  }
}

function resolveResidentModel(resident) {
  return resident.appearance?.model || 'Ranger';
}

function resolveWalkAnimation(resident) {
  const choices = ['Walking_A', 'Walking_B', 'Walking_C'];
  return choices[hashSeed(resident.id) % choices.length];
}

export class ResidentNavigationManager {
  constructor(graph, simulation, options = {}) {
    if (!(graph instanceof CityNavigationGraph) || !simulation?.residents) {
      throw new TypeError('Navigation needs a city graph and a living-town simulation.');
    }
    this.graph = graph;
    this.simulation = simulation;
    this.radius = options.radius || simulation.fullSimulationRadius || 40;
    this.fullCap = options.fullCap || simulation.fullSimulationCap || 36;
    this.fixedActors = options.fixedActors || 3;
    this.visibleCap = Math.max(0, this.fullCap - this.fixedActors);
    this.maxAbstractStepSeconds = options.maxAbstractStepSeconds || 1.5;
    this.agents = new Map();
    this.fullIds = new Set();
    this.elapsed = 0;
    this.abstractAccumulator = 0;
    this.destroyed = false;

    const spawnNodes = [...this.graph.nodes.values()].filter((node) => node.kind === 'sidewalk' || node.kind === 'crosswalk');

    simulation.residents.forEach((resident, index) => {
      const startNode = spawnNodes[Math.floor(getSeededUnit(`${resident.id}:spawn`) * spawnNodes.length)];
      const position = startNode || this.graph.nodes.values().next().value;
      const agent = {
        id: resident.id,
        resident,
        x: position.x,
        z: position.z,
        speed: 0.75 + resident.personality.energy * 0.55,
        destination: null,
        path: [],
        pathIndex: 1,
        stuckSeconds: 0,
        lastX: position.x,
        lastZ: position.z,
        routeVersion: 0,
        lod: 'abstract',
        animation: resolveWalkAnimation(resident),
        model: resolveResidentModel(resident),
        separation: (getSeededUnit(`${resident.id}:lane`) - 0.5) * 0.7,
        index
      };
      this.planRoute(agent, true);
      this.agents.set(agent.id, agent);
    });
  }

  planRoute(agent, force = false) {
    const destination = this.graph.destinationFor(agent.resident);
    if (!destination) return false;
    const targetId = destination.id || this.graph.nearestNodeId(destination);
    if (!force && agent.destination?.id === targetId) return false;
    const path = this.graph.findPath({ x: agent.x, z: agent.z }, destination);
    if (!path.length) return false;
    agent.destination = destination;
    agent.path = path;
    agent.pathIndex = path.length > 1 ? 1 : 0;
    agent.routeVersion += 1;
    return true;
  }

  setFullIds(ids) {
    this.fullIds.clear();
    for (const id of ids) this.fullIds.add(id);
    for (const agent of this.agents.values()) agent.lod = this.fullIds.has(agent.id) ? 'full' : 'abstract';
  }

  selectFullSimulation(playerPosition, isVisible = () => true) {
    const candidates = [];
    for (const agent of this.agents.values()) {
      const distance = Math.hypot(agent.x - playerPosition.x, agent.z - playerPosition.z);
      const visible = isVisible(agent);
      if (distance > this.radius && !visible) continue;
      candidates.push({ agent, distance, visible });
    }
    candidates.sort((first, second) => (first.distance - (first.visible ? 10 : 0))
      - (second.distance - (second.visible ? 10 : 0)) || first.agent.index - second.agent.index);
    const selected = candidates.slice(0, this.visibleCap);
    this.setFullIds(selected.map(({ agent }) => agent.id));
    return selected.map(({ agent }) => this.toNpcConfig(agent));
  }

  toNpcConfig(agent) {
    if (agent.path.length < 2) return null;
    const routeAhead = agent.path.slice(Math.min(agent.pathIndex, agent.path.length - 1));
    const loop = [
      { x: agent.x, z: agent.z },
      ...routeAhead.map((node) => ({ x: node.x, z: node.z })),
      ...agent.path.slice(0, Math.min(agent.pathIndex, agent.path.length - 1)).reverse().map((node) => ({ x: node.x, z: node.z }))
    ];
    if (loop.length < 2) return null;
    return {
      id: agent.id,
      name: { de: agent.resident.name.de, en: agent.resident.name.de, ar: '' },
      model: agent.model,
      path: loop,
      speed: agent.speed,
      walkAnimation: agent.animation,
      activityAnimation: ['sleep', 'rest', 'eat', 'study', 'work', 'social', 'leisure'].includes(agent.resident.current_activity) ? 'Idle_A' : null,
      stopDuration: 0.7,
      initialWait: getSeededUnit(`${agent.id}:wait`) * 1.2,
      routeVersion: agent.routeVersion,
      livingResident: true
    };
  }

  updatePosition(id, x, z) {
    const agent = this.agents.get(id);
    if (!agent || !Number.isFinite(x) || !Number.isFinite(z)) return false;
    agent.x = x;
    agent.z = z;
    return true;
  }

  avoid(id, position, velocity, playerPosition) {
    const agent = this.agents.get(id);
    if (!agent) return velocity;
    let avoidX = 0;
    let avoidZ = 0;
    const radius = 1.25;
    for (const other of this.agents.values()) {
      if (other.id === id || (Math.abs(other.x - position.x) > radius && Math.abs(other.z - position.z) > radius)) continue;
      const dx = position.x - other.x;
      const dz = position.z - other.z;
      const distanceSquared = dx * dx + dz * dz;
      if (distanceSquared > 0.0001 && distanceSquared < radius * radius) {
        const weight = (radius - Math.sqrt(distanceSquared)) / radius;
        avoidX += dx * weight;
        avoidZ += dz * weight;
      }
    }
    if (playerPosition) {
      const dx = position.x - playerPosition.x;
      const dz = position.z - playerPosition.z;
      const distanceSquared = dx * dx + dz * dz;
      const playerRadius = 1.6;
      if (distanceSquared > 0.0001 && distanceSquared < playerRadius * playerRadius) {
        const weight = (playerRadius - Math.sqrt(distanceSquared)) / playerRadius;
        avoidX += dx * weight * 1.4;
        avoidZ += dz * weight * 1.4;
      }
    }
    const length = Math.hypot(avoidX, avoidZ);
    if (length < 0.001) return velocity;
    velocity.x += avoidX / length * 0.65;
    velocity.z += avoidZ / length * 0.65;
    return velocity;
  }

  advance(deltaSeconds, playerPosition, options = {}) {
    if (this.destroyed || options.paused || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return;
    this.elapsed += deltaSeconds;
    this.abstractAccumulator += deltaSeconds;
    if (this.abstractAccumulator < 0.5) return;
    const step = Math.min(this.abstractAccumulator, this.maxAbstractStepSeconds);
    this.abstractAccumulator = 0;
    for (const agent of this.agents.values()) {
      this.planRoute(agent);
      if (agent.path.length < 2) continue;
      if (agent.pathIndex >= agent.path.length) agent.pathIndex = 1;
      const target = agent.path[agent.pathIndex];
      const dx = target.x - agent.x;
      const dz = target.z - agent.z;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.35) {
        agent.pathIndex = (agent.pathIndex + 1) % agent.path.length;
        agent.stuckSeconds = 0;
        continue;
      }
      const direction = { x: dx / distance, z: dz / distance };
      let velocity = { x: direction.x * agent.speed, z: direction.z * agent.speed };
      if (agent.lod === 'full') velocity = this.avoid(agent.id, agent, velocity, playerPosition);
      const moveLength = Math.min(distance, Math.hypot(velocity.x, velocity.z) * step);
      if (agent.lod === 'abstract' || options.advanceFullAgents) {
        agent.x += velocity.x / Math.max(0.001, Math.hypot(velocity.x, velocity.z)) * moveLength;
        agent.z += velocity.z / Math.max(0.001, Math.hypot(velocity.x, velocity.z)) * moveLength;
      }
      if (Math.hypot(agent.x - agent.lastX, agent.z - agent.lastZ) < 0.02) agent.stuckSeconds += step;
      else agent.stuckSeconds = 0;
      agent.lastX = agent.x;
      agent.lastZ = agent.z;
      if (agent.stuckSeconds > 5 && agent.lod === 'abstract') {
        const nearestId = this.graph.nearestNodeId(agent);
        const nearest = this.graph.nodes.get(nearestId);
        if (nearest) {
          agent.x = nearest.x;
          agent.z = nearest.z;
          agent.pathIndex = 1;
          agent.stuckSeconds = 0;
        }
      } else if (agent.stuckSeconds > 5) {
        const nearestId = this.graph.nearestNodeId(agent);
        const replacement = this.graph.findPath(nearestId, agent.destination);
        if (replacement.length > 1) {
          agent.path = replacement;
          agent.pathIndex = 1;
          agent.routeVersion += 1;
        }
        agent.stuckSeconds = 0;
      }
    }
  }

  destroy() {
    this.destroyed = true;
    this.agents.clear();
    this.fullIds.clear();
  }
}

export { RESIDENTIAL_BUILDINGS, STREET_SPECS };
