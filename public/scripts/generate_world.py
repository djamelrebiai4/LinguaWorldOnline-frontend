#!/usr/bin/env python3
"""Generate the streamed 4 km x 4 km LinguaWorld Phase 0 world."""

import json
import math
import random
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from generate_city import City, MATERIALS, write_glb, compress_glb

ROOT = SCRIPT_DIR.parent
WORLD_DIR = ROOT / "world"
CHUNK_DIR = WORLD_DIR / "chunks"
WORLD_SIZE = 4096
WORLD_HALF = WORLD_SIZE // 2
CHUNK_SIZE = 512
GRID = WORLD_SIZE // CHUNK_SIZE
SEED = 20261119

WORLD_MATERIALS = {
    **MATERIALS,
    "world_asphalt": {"color": [0.16, 0.17, 0.17], "roughness": 0.98},
    "world_sidewalk": {"color": [0.58, 0.56, 0.5], "roughness": 0.94},
    "world_brick": {"color": [0.46, 0.24, 0.18], "roughness": 0.96},
    "field_wheat": {"color": [0.78, 0.65, 0.27], "roughness": 1},
    "field_corn": {"color": [0.37, 0.53, 0.22], "roughness": 1},
    "field_soil": {"color": [0.35, 0.26, 0.17], "roughness": 1},
    "barn_red": {"color": [0.5, 0.16, 0.12], "roughness": 0.93},
    "silo_metal": {"color": [0.62, 0.63, 0.58], "roughness": 0.45, "metallic": 0.35},
    "forest_floor": {"color": [0.24, 0.34, 0.18], "roughness": 1},
    "dirt_path": {"color": [0.51, 0.42, 0.29], "roughness": 1},
    "village_stone": {"color": [0.52, 0.5, 0.44], "roughness": 0.95},
}

MATERIAL_ALIASES = {
    "asphalt": "world_asphalt",
    "sidewalk": "world_sidewalk",
    "brick": "world_brick",
}

WALLS = ["wall_cream", "wall_sand", "wall_sage", "wall_blue", "brick"]
ROOFS = ["roof_tile", "roof_slate"]

VILLAGES = [
    {"id": "dorf-west", "name": "Westdorf", "x": -1000, "z": 1000, "radius": 250},
    {"id": "dorf-east", "name": "Ostdorf", "x": 1000, "z": -1000, "radius": 250},
    {"id": "dorf-south", "name": "Süddorf", "x": -1000, "z": -1000, "radius": 250},
]

FARMS = [
    {"id": "hof-nord", "name": "Nordhof", "x": 620, "z": 1210, "w": 320, "d": 280},
    {"id": "hof-east", "name": "Osthof", "x": 1360, "z": 360, "w": 300, "d": 300},
    {"id": "hof-south", "name": "Südhof", "x": 520, "z": -1320, "w": 330, "d": 280},
    {"id": "hof-west", "name": "Westhof", "x": -1370, "z": -330, "w": 300, "d": 300},
]

FORESTS = [
    {"id": "wald-west", "min_x": -1900, "max_x": -650, "min_z": -520, "max_z": 1800, "density": 0.52},
    {"id": "wald-north-east", "min_x": 520, "max_x": 1900, "min_z": 1060, "max_z": 1900, "density": 0.5},
    {"id": "wald-south", "min_x": -700, "max_x": 900, "min_z": -1900, "max_z": -860, "density": 0.46},
    {"id": "wald-east", "min_x": 1060, "max_x": 1900, "min_z": -900, "max_z": 720, "density": 0.4},
]

ROADS = [
    {"axis": "z", "fixed": 30, "low": -1800, "high": -255, "width": 14, "sidewalk": 2.8},
    {"axis": "z", "fixed": 30, "low": 335, "high": 1800, "width": 14, "sidewalk": 2.8},
    {"axis": "x", "fixed": 95, "low": -1800, "high": -220, "width": 14, "sidewalk": 2.8},
    {"axis": "x", "fixed": 95, "low": 220, "high": 1800, "width": 14, "sidewalk": 2.8},
    {"axis": "z", "fixed": -1000, "low": -1800, "high": 1800, "width": 12, "sidewalk": 2.4},
    {"axis": "z", "fixed": 1000, "low": -1800, "high": 1800, "width": 12, "sidewalk": 2.4},
    {"axis": "x", "fixed": -1000, "low": -1800, "high": 1800, "width": 12, "sidewalk": 2.4},
    {"axis": "x", "fixed": 1000, "low": -1800, "high": 1800, "width": 12, "sidewalk": 2.4},
]

CITY_BOUNDS = {"min_x": -272, "max_x": 272, "min_z": -332, "max_z": 396}


class WorldBuilder(City):
    def __init__(self, detail="high"):
        super().__init__()
        self.detail = detail

    def interaction_box(self, key, center, size):
        return None

    def box(self, material, center, size, collision=False, visible=True):
        super().box(MATERIAL_ALIASES.get(material, material), center, size,
                    collision=collision, visible=visible)

    def quad(self, material, points, width, height):
        super().quad(MATERIAL_ALIASES.get(material, material), points, width, height)

    def rectangle(self, material, x, y, z, face, width, height, offset=0):
        super().rectangle(MATERIAL_ALIASES.get(material, material),
                          x, y, z, face, width, height, offset)

    def terrain(self, x, z, forest=False):
        self.box("grass", (x, -0.22, z), (CHUNK_SIZE, 0.4, CHUNK_SIZE), collision=True)
        if forest and self.detail == "high":
            self.visual.box("forest_floor", (x, 0.012, z), (CHUNK_SIZE, 0.024, CHUNK_SIZE))

    def simple_tree(self, x, z, scale=1):
        trunk_height = 3.2 * scale
        self.visual.cylinder("bark", (x, trunk_height / 2, z), 0.24 * scale,
                             0.18 * scale, trunk_height, 6)
        self.visual.sphere("foliage_dark", (x, trunk_height + 1.5 * scale, z),
                           2.15 * scale, (1, 0.92, 1), 3, 6)

    def simple_building(self, x, z, width, depth, floors, wall, roof,
                        style="house", front="north", label="", sign="sign_home"):
        height = max(3.2, floors * 3.05)
        self.collision.box("collision", (x, height / 2, z), (width, height, depth))
        self.visual.box(wall, (x, height / 2, z), (width, height, depth))
        self.visual.box("trim", (x, 0.18, z), (width + 0.18, 0.36, depth + 0.18))
        self.visual.box(roof, (x, height + 0.18, z), (width + 0.7, 0.36, depth + 0.7))
        self.visual.box("world_brick", (x, 1.2, z + depth / 2 + 0.04), (1.35, 2.3, 0.12))

    def barn(self, x, z, width=18, depth=24, rotation=0):
        if self.detail == "low":
            self.simple_building(x, z, width, depth, 1, "barn_red", "roof_slate")
            return
        self.collision.box("collision", (x, 3.4, z), (width, 6.8, depth))
        self.visual.box("barn_red", (x, 3.4, z), (width, 6.8, depth))
        self.visual.box("trim", (x, 0.24, z), (width + 0.5, 0.48, depth + 0.5))
        self.quad("roof_slate", [
            (x - width / 2 - 0.8, 6.8, z + depth / 2 + 0.8),
            (x + width / 2 + 0.8, 6.8, z + depth / 2 + 0.8),
            (x + width / 2 + 0.8, 9.2, z),
            (x - width / 2 - 0.8, 9.2, z)
        ], width, depth)
        self.quad("roof_slate", [
            (x + width / 2 + 0.8, 6.8, z - depth / 2 - 0.8),
            (x - width / 2 - 0.8, 6.8, z - depth / 2 - 0.8),
            (x - width / 2 - 0.8, 9.2, z),
            (x + width / 2 + 0.8, 9.2, z)
        ], width, depth)
        self.visual.box("dark_wood", (x, 2.2, z + depth / 2 + 0.08), (5.4, 4.4, 0.16))
        self.visual.rectangle("trim", x, 1.75, z + depth / 2 + 0.18, "north", 5.8, 5.1, 0)

    def silo(self, x, z, scale=1):
        self.collision.box("collision", (x, 6 * scale, z), (4.2 * scale, 12 * scale, 4.2 * scale))
        self.visual.cylinder("silo_metal", (x, 6 * scale, z), 2.1 * scale,
                             1.7 * scale, 12 * scale, 12)
        self.visual.sphere("silo_metal", (x, 12.1 * scale, z), 2.1 * scale,
                           (1, 0.35, 1), 4, 12)

    def windmill(self, x, z):
        self.collision.box("collision", (x, 6, z), (6, 12, 6))
        self.visual.cylinder("wall_cream", (x, 6, z), 2.9, 1.5, 12, 10)
        self.visual.sphere("roof_slate", (x, 12.3, z), 1.8, (1, 0.7, 1), 3, 8)
        if self.detail == "low":
            return
        for index in range(4):
            angle = index * math.pi / 2
            cosine, sine = math.cos(angle), math.sin(angle)
            self.visual.box("wood", (x + cosine * 2.6, 12.3 + sine * 2.6, z),
                            (0.34, 5.2, 0.12))
        self.visual.box("metal", (x, 12.3, z), (0.5, 0.5, 0.5))

    def fence_line(self, start, end):
        if self.detail != "high":
            return
        x1, z1 = start
        x2, z2 = end
        length = math.hypot(x2 - x1, z2 - z1)
        count = max(2, int(length // 5))
        for index in range(count + 1):
            t = index / count
            x = x1 + (x2 - x1) * t
            z = z1 + (z2 - z1) * t
            self.collision.box("collision", (x, 0.65, z), (0.18, 1.3, 0.18))
            self.visual.box("wood", (x, 0.65, z), (0.18, 1.3, 0.18))
        for offset in (0.4, 0.95):
            self.visual.box("wood", ((x1 + x2) / 2, offset, (z1 + z2) / 2),
                            (max(0.16, abs(x2 - x1)), 0.12, max(0.16, abs(z2 - z1))))

    def field(self, x, z, width, depth, kind="wheat"):
        material = "field_wheat" if kind == "wheat" else "field_corn"
        self.visual.box("field_soil", (x, 0.025, z), (width, 0.05, depth))
        self.visual.box(material, (x, 0.06, z), (width - 3, 0.08, depth - 3))
        if self.detail == "low":
            return
        rows = max(3, int(depth // 18))
        for index in range(rows):
            row_z = z - depth / 2 + 3 + (index + 0.5) * (depth - 6) / rows
            self.visual.box(material, (x, 0.13, row_z), (width - 8, 0.12, 0.75))

    def village_square(self, x, z, size=70):
        self.visual.box("village_stone", (x, 0.035, z), (size, 0.07, size))
        if self.detail == "low":
            return
        self.visual.box("water", (x, 0.11, z), (12, 0.12, 12))
        self.visual.box("village_stone", (x, 0.16, z), (15, 0.18, 15))
        self.visual.box("water", (x, 0.25, z), (11, 0.08, 11))
        self.bench(x - 22, z, math.pi / 2)
        self.bench(x + 22, z, math.pi / 2)
        self.bench(x, z - 22, 0)
        self.bench(x, z + 22, math.pi)

    def church(self, x, z):
        if self.detail == "low":
            self.simple_building(x, z, 22, 34, 2, "wall_cream", "roof_slate")
            self.visual.box("village_stone", (x, 11, z + 13), (7, 22, 7))
            return
        self.building(x, z, 22, 34, 2, "wall_cream", "roof_slate", "school", "south")
        self.collision.box("collision", (x, 12, z + 14), (8, 24, 8))
        self.visual.box("village_stone", (x, 12, z + 14), (8, 24, 8))
        self.visual.box("roof_slate", (x, 24.2, z + 14), (9, 0.6, 9))
        self.visual.box("metal", (x, 27, z + 14), (0.5, 5.5, 0.5))
        self.visual.box("metal", (x, 27.5, z + 14), (3, 0.5, 0.5))


def inside_bounds(x, z, bounds, margin=0):
    return (bounds["min_x"] - margin <= x <= bounds["max_x"] + margin
            and bounds["min_z"] - margin <= z <= bounds["max_z"] + margin)


def inside_city(x, z, margin=0):
    return inside_bounds(x, z, CITY_BOUNDS, margin)


def inside_village(x, z, margin=0):
    return any(math.hypot(x - village["x"], z - village["z"]) <= village["radius"] + margin
               for village in VILLAGES)


def inside_farm(x, z, margin=0):
    return any(abs(x - farm["x"]) <= farm["w"] / 2 + margin
               and abs(z - farm["z"]) <= farm["d"] / 2 + margin
               for farm in FARMS)


def near_road(x, z, margin=0):
    for road in ROADS:
        half = road["width"] / 2 + margin
        if road["axis"] == "z":
            if abs(x - road["fixed"]) <= half and road["low"] <= z <= road["high"]:
                return True
        elif abs(z - road["fixed"]) <= half and road["low"] <= x <= road["high"]:
            return True
    return False


def chunk_index(x, z):
    return (max(0, min(GRID - 1, int((x + WORLD_HALF) // CHUNK_SIZE))),
            max(0, min(GRID - 1, int((z + WORLD_HALF) // CHUNK_SIZE))))


def chunk_bounds(cx, cz):
    min_x = cx * CHUNK_SIZE - WORLD_HALF
    min_z = cz * CHUNK_SIZE - WORLD_HALF
    return {
        "min_x": min_x,
        "max_x": min_x + CHUNK_SIZE,
        "min_z": min_z,
        "max_z": min_z + CHUNK_SIZE,
    }


def in_chunk(feature, chunk):
    x, z = feature["x"], feature["z"]
    return (chunk["min_x"] <= x < chunk["max_x"]
            and chunk["min_z"] <= z < chunk["max_z"])


def generate_features():
    rng = random.Random(SEED)
    buildings = []
    trees = []
    fields = []
    fences = []
    silos = []
    windmills = []
    lamps = []
    squares = []
    churches = []

    for village in VILLAGES:
        vx, vz = village["x"], village["z"]
        squares.append({"x": vx, "z": vz, "size": 74})
        churches.append({"x": vx - 120, "z": vz + 120})
        offsets = [
            (-190, -190), (-120, -190), (-45, -190), (45, -190), (120, -190), (190, -190),
            (-190, -110), (190, -110), (-190, 110), (190, 110),
            (-190, 190), (-120, 190), (-45, 190), (45, 190), (120, 190), (190, 190),
            (-120, 45), (-120, -45), (120, 45), (120, -45),
        ]
        for index, (dx, dz) in enumerate(offsets):
            x, z = vx + dx, vz + dz
            if near_road(x, z, 20):
                continue
            width = rng.choice((18, 20, 22, 24))
            depth = rng.choice((18, 21, 24))
            buildings.append({
                "kind": "village",
                "x": x,
                "z": z,
                "width": width,
                "depth": depth,
                "floors": rng.choice((1, 2, 2, 3)),
                "wall": WALLS[(index + len(buildings)) % len(WALLS)],
                "roof": ROOFS[index % len(ROOFS)],
                "style": "shop" if index % 6 == 0 else "house",
                "front": "south" if dz > 0 else "north",
            })
        for index in range(10):
            angle = index * math.pi * 2 / 10
            trees.append({
                "x": vx + math.cos(angle) * (village["radius"] - 35),
                "z": vz + math.sin(angle) * (village["radius"] - 35),
                "scale": 0.8 + rng.random() * 0.35,
            })
        for index in range(6):
            angle = index * math.pi * 2 / 6
            lamps.append({
                "x": vx + math.cos(angle) * 52,
                "z": vz + math.sin(angle) * 52,
            })

    for farm in FARMS:
        fx, fz = farm["x"], farm["z"]
        half_w, half_d = farm["w"] / 2, farm["d"] / 2
        buildings.append({
            "kind": "barn",
            "x": fx - half_w + 45,
            "z": fz - half_d + 48,
            "width": 20,
            "depth": 28,
            "floors": 1,
        })
        silos.append({"x": fx - half_w + 72, "z": fz - half_d + 50, "scale": 1})
        windmills.append({"x": fx + half_w - 50, "z": fz + half_d - 50})
        field_width = (farm["w"] - 80) / 2
        field_depth = (farm["d"] - 70) / 2
        for index, (ox, oz) in enumerate((
            (-field_width / 2 - 8, -field_depth / 2 - 6),
            (field_width / 2 + 8, -field_depth / 2 - 6),
            (-field_width / 2 - 8, field_depth / 2 + 6),
            (field_width / 2 + 8, field_depth / 2 + 6)
        )):
            fields.append({
                "x": fx + ox,
                "z": fz + oz,
                "width": field_width,
                "depth": field_depth,
                "kind": "wheat" if index % 2 == 0 else "corn",
            })
        for x in (fx - half_w, fx + half_w):
            fences.append(((x, fz - half_d), (x, fz + half_d)))
        for z in (fz - half_d, fz + half_d):
            fences.append(((fx - half_w, z), (fx + half_w, z)))

    for forest in FORESTS:
        for x in range(int(forest["min_x"]), int(forest["max_x"]), 26):
            for z in range(int(forest["min_z"]), int(forest["max_z"]), 26):
                if rng.random() > forest["density"]:
                    continue
                px = x + (rng.random() * 2 - 1) * 9
                pz = z + (rng.random() * 2 - 1) * 9
                if (inside_city(px, pz, 28) or inside_village(px, pz, 18)
                        or inside_farm(px, pz, 12) or near_road(px, pz, 18)):
                    continue
                trees.append({"x": px, "z": pz, "scale": 0.78 + rng.random() * 0.6})

    for road in ROADS:
        for distance in range(int(road["low"]), int(road["high"]), 165):
            if road["axis"] == "z":
                x, z = road["fixed"] + road["width"] / 2 + 7, distance
            else:
                x, z = distance, road["fixed"] + road["width"] / 2 + 7
            if inside_city(x, z, 5) or inside_village(x, z, 10):
                continue
            lamps.append({"x": x, "z": z})

    return {
        "buildings": buildings,
        "trees": trees,
        "fields": fields,
        "fences": fences,
        "silos": silos,
        "windmills": windmills,
        "lamps": lamps,
        "squares": squares,
        "churches": churches,
    }


def clip_road(road, chunk):
    half = road["width"] / 2
    if road["axis"] == "z":
        x = road["fixed"]
        if not (chunk["min_x"] - half <= x <= chunk["max_x"] + half):
            return None
        low = max(road["low"], chunk["min_z"])
        high = min(road["high"], chunk["max_z"])
        if high - low < 2:
            return None
        return ((x, low), (x, high), road["width"], road["sidewalk"])
    z = road["fixed"]
    if not (chunk["min_z"] - half <= z <= chunk["max_z"] + half):
        return None
    low = max(road["low"], chunk["min_x"])
    high = min(road["high"], chunk["max_x"])
    if high - low < 2:
        return None
    return ((low, z), (high, z), road["width"], road["sidewalk"])


def forest_overlap(chunk):
    return any(not (chunk["max_x"] < forest["min_x"] or chunk["min_x"] > forest["max_x"]
                    or chunk["max_z"] < forest["min_z"] or chunk["min_z"] > forest["max_z"])
               for forest in FORESTS)


def build_chunk(cx, cz, features, detail):
    chunk = chunk_bounds(cx, cz)
    center_x = (chunk["min_x"] + chunk["max_x"]) / 2
    center_z = (chunk["min_z"] + chunk["max_z"]) / 2
    builder = WorldBuilder(detail)
    builder.terrain(center_x, center_z, forest_overlap(chunk))

    for road in ROADS:
        clipped = clip_road(road, chunk)
        if clipped:
            builder.street(clipped[0], clipped[1], clipped[2], clipped[3])

    for square in features["squares"]:
        if in_chunk(square, chunk):
            builder.village_square(square["x"], square["z"], square["size"])
    for church in features["churches"]:
        if in_chunk(church, chunk):
            builder.church(church["x"], church["z"])

    for building in features["buildings"]:
        if not in_chunk(building, chunk):
            continue
        if building["kind"] == "barn":
            builder.barn(building["x"], building["z"], building["width"], building["depth"])
        elif detail == "low":
            builder.simple_building(
                building["x"], building["z"], building["width"], building["depth"],
                building["floors"], building["wall"], building["roof"],
                building["style"], building["front"]
            )
        else:
            builder.building(
                building["x"], building["z"], building["width"], building["depth"],
                building["floors"], building["wall"], building["roof"],
                building["style"], building["front"]
            )

    for silo in features["silos"]:
        if in_chunk(silo, chunk):
            builder.silo(silo["x"], silo["z"], silo["scale"])
    for windmill in features["windmills"]:
        if in_chunk(windmill, chunk):
            builder.windmill(windmill["x"], windmill["z"])
    for field in features["fields"]:
        if in_chunk(field, chunk):
            builder.field(field["x"], field["z"], field["width"], field["depth"], field["kind"])
    for start, end in features["fences"]:
        mid_x, mid_z = (start[0] + end[0]) / 2, (start[1] + end[1]) / 2
        if chunk["min_x"] <= mid_x < chunk["max_x"] and chunk["min_z"] <= mid_z < chunk["max_z"]:
            builder.fence_line(start, end)

    tree_step = 1 if detail == "high" else 5
    for index, tree in enumerate(features["trees"]):
        if index % tree_step or not in_chunk(tree, chunk):
            continue
        if detail == "high":
            builder.tree(tree["x"], tree["z"], tree["scale"])
        else:
            builder.simple_tree(tree["x"], tree["z"], tree["scale"])

    for lamp in features["lamps"]:
        if in_chunk(lamp, chunk):
            if detail == "high":
                builder.lamp(lamp["x"], lamp["z"])
            else:
                builder.visual.box("metal", (lamp["x"], 2.5, lamp["z"]), (0.18, 5, 0.18))

    if cx == 0:
        builder.collision.box("collision", (chunk["min_x"] + 1, 6, center_z),
                              (2, 12, CHUNK_SIZE))
    if cx == GRID - 1:
        builder.collision.box("collision", (chunk["max_x"] - 1, 6, center_z),
                              (2, 12, CHUNK_SIZE))
    if cz == 0:
        builder.collision.box("collision", (center_x, 6, chunk["min_z"] + 1),
                              (CHUNK_SIZE, 12, 2))
    if cz == GRID - 1:
        builder.collision.box("collision", (center_x, 6, chunk["max_z"] - 1),
                              (CHUNK_SIZE, 12, 2))

    return builder


def main():
    CHUNK_DIR.mkdir(parents=True, exist_ok=True)
    features = generate_features()
    chunks = []
    for cz in range(GRID):
        for cx in range(GRID):
            chunk = chunk_bounds(cx, cz)
            for detail in ("high", "low"):
                name = f"chunk_{cx}_{cz}_{detail}"
                target = CHUNK_DIR / f"{name}.glb"
                collision_target = CHUNK_DIR / f"{name}_collision.glb"
                builder = build_chunk(cx, cz, features, detail)
                write_glb(target, builder.visual, include_textures=False, materials=WORLD_MATERIALS)
                write_glb(collision_target, builder.collision, collision=True, materials=WORLD_MATERIALS)
                compress_glb(target)
                compress_glb(collision_target)
            chunks.append({
                "id": f"c{cx}_{cz}",
                "cx": cx,
                "cz": cz,
                "bounds": chunk,
                "center": {
                    "x": (chunk["min_x"] + chunk["max_x"]) / 2,
                    "z": (chunk["min_z"] + chunk["max_z"]) / 2,
                },
                "high": {
                    "model": f"/world/chunks/chunk_{cx}_{cz}_high.glb",
                    "collision": f"/world/chunks/chunk_{cx}_{cz}_high_collision.glb",
                },
                "low": {
                    "model": f"/world/chunks/chunk_{cx}_{cz}_low.glb",
                    "collision": f"/world/chunks/chunk_{cx}_{cz}_low_collision.glb",
                },
                "biome": "forest" if forest_overlap(chunk) else "countryside",
            })

    manifest = {
        "schema_version": 1,
        "name": "LinguaWorld Phase 0",
        "units": "meters",
        "size_m": WORLD_SIZE,
        "chunk_size_m": CHUNK_SIZE,
        "grid": {"columns": GRID, "rows": GRID},
        "origin": {"x": -WORLD_HALF, "z": -WORLD_HALF},
        "bounds": {"min_x": -WORLD_HALF, "max_x": WORLD_HALF,
                   "min_z": -WORLD_HALF, "max_z": WORLD_HALF},
        "spawn": {"x": 30, "y": 0, "z": 95},
        "quality": {
            "high": {"high_radius_m": 820, "low_radius_m": 1450,
                     "fog_near_m": 260, "fog_far_m": 1580, "player_limit": 24},
            "medium": {"high_radius_m": 600, "low_radius_m": 1100,
                       "fog_near_m": 220, "fog_far_m": 1120, "player_limit": 20},
            "low": {"high_radius_m": 360, "low_radius_m": 740,
                    "fog_near_m": 140, "fog_far_m": 760, "player_limit": 12},
        },
        "landmarks": [
            {"id": "city", "name": "LinguaCity", "kind": "city",
             "x": 0, "z": 30},
            *[{"id": village["id"], "name": village["name"], "kind": "village",
               "x": village["x"], "z": village["z"]} for village in VILLAGES],
            *[{"id": farm["id"], "name": farm["name"], "kind": "farm",
               "x": farm["x"], "z": farm["z"]} for farm in FARMS],
            *[{"id": forest["id"], "name": forest["id"], "kind": "forest",
               "x": (forest["min_x"] + forest["max_x"]) / 2,
               "z": (forest["min_z"] + forest["max_z"]) / 2} for forest in FORESTS],
        ],
        "stats": {
            "chunks": len(chunks),
            "trees": len(features["trees"]),
            "buildings": len(features["buildings"]),
            "fields": len(features["fields"]),
            "villages": len(VILLAGES),
            "farms": len(FARMS),
        },
        "chunks": chunks,
    }
    (WORLD_DIR / "world-manifest.json").write_text(
        json.dumps(manifest, separators=(",", ":"), ensure_ascii=False),
        encoding="utf-8"
    )
    print(f"Generated {len(chunks)} chunks with {len(features['trees'])} trees, "
          f"{len(features['buildings'])} buildings, {len(features['fields'])} fields.")


if __name__ == "__main__":
    main()
