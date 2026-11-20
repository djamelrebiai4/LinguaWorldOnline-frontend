# Phase 0 — Streamed World Report

**Project:** lexiexplorer-clone  
**Status:** Phase 0 validation complete  
**Date:** 2026-11-19

---

## 1. Executive Summary

Phase 0 delivers a streamed 4 km x 4 km outdoor world around LinguaCity with high/low LOD chunks, collision assets, quality tiers, and integration into `WorldScene`. The city bounds are embedded in the world manifest and the city chunks are present in both LOD variants.

The public multiplayer stack was also revalidated: the web page returns HTTP 200, the public WebSocket opens, and two clients can join the same room and see each other.

---

## 2. World Deliverables

| Item | Result |
|------|--------|
| World size | 4096 m x 4096 m |
| Chunk size | 512 m |
| Grid | 8 x 8 (64 chunks) |
| LOD variants | high + low |
| Collision per chunk | high + low collision GLBs |
| World GLB files | 256 |
| World GLB size | 7,572,708 bytes |
| City visual GLB | 793,288 bytes |
| City collision GLB | 28,104 bytes |
| Total validated GLBs | 258 |
| Total validated size | 8,394,100 bytes |
| Draco-compressed files | 258 / 258 |
| Largest high chunk | 210,256 bytes (`chunk_1_6_high.glb`) |

Generation output:

```text
Generated 42 visual materials and 51 buildings.
Generated 64 chunks with 4429 trees, 64 buildings, 16 fields.
```

Manifest stats:

```json
{
  "buildings": 64,
  "chunks": 64,
  "farms": 4,
  "fields": 16,
  "trees": 4429,
  "villages": 3,
  "water_bodies": 4
}
```

---

## 3. City Boundary Linking

`CITY_BOUNDS` is now written into the `city` landmark in `world-manifest.json`:

```json
{
  "min_x": -272,
  "max_x": 272,
  "min_z": -332,
  "max_z": 396
}
```

Verification results:

| Check | Result |
|-------|--------|
| City bounds inside world bounds | PASS |
| Spawn `(30, 95)` inside city bounds | PASS |
| City chunks present in manifest | PASS (`c3_3`, `c3_4`, `c4_3`, `c4_4`) |
| City chunks have high + low models | PASS |
| All 256 world GLBs exist and are non-empty | PASS |

City chunk mesh counts:

```text
c3_3 high=1 low=1
c4_3 high=6 low=5
c3_4 high=6 low=5
c4_4 high=6 low=5
```

---

## 4. Streaming, LOD, and Quality

`WorldStreamer` is mounted inside `CityWorld` in `WorldScene.js`. The streamer reads `world-manifest.json`, selects chunks by player position, and loads high LOD only inside the high radius, with low LOD as the fallback.

Quality tiers and active chunks at spawn `(30, 95)`:

| Tier | Active chunks | High LOD | Low LOD | Low radius |
|------|---------------|----------|---------|------------|
| high | 36 | 9 | 27 | 1450 m |
| medium | 25 | 4 | 21 | 1100 m |
| low | 14 | 2 | 12 | 740 m |

Quality switching was verified in headless Chrome:

```text
BEFORE      tier=medium count=25 high=4  low=21
AFTER_HIGH  tier=high   count=36 high=9  low=27
```

The manifest fetch now uses `cache: 'no-cache'` so regenerated LOD/quality metadata is revalidated instead of being served from an old cache entry.

---

## 5. Validation Results

### Syntax checks

```text
PY_COMPILE_OK
WORLD_STREAMER_CHECK_OK
WORLD_SCENE_CHECK_OK
GIT_DIFF_CHECK_OK
```

### GLB validation

The validator checks GLB magic/version, declared length, JSON chunk, BIN chunk, buffer length, and Draco extension. GLB BIN padding is accepted when the padding is below 4 bytes.

```text
GLB_VALIDATE_OK files=258 total_bytes=8394100 draco_files=258 padded_buffers=177 max_high_bytes=210256 max_high=chunk_1_6_high.glb
```

### Headless Chrome

Public page test:

```text
ONLINE true
manifest true
canvas 1
cityBounds present
activeCount 25
chunkRequests 54
chunkFailures []
manifestRequests [200]
glbRequests 63
errors []
HEADLESS_VERIFY_PASS
```

The only browser messages were non-blocking WebGL performance warnings from the headless SwiftShader/OpenGL path.

---

## 6. Multiplayer Readiness

| Check | Result |
|-------|--------|
| Public web page | HTTP 200 |
| Public WebSocket | OPEN |
| Client A join | welcome received |
| Client B join | welcome received; sees A |
| Player join broadcast | `player-joined` received |
| Room state | `playerCount=2` |

Current temporary endpoints:

```text
Web:       https://posing-welding-stunning-taught.trycloudflare.com/levels/city.html?v=3
WebSocket: wss://functionality-applicants-weight-inch.trycloudflare.com/multiplayer
```

These are Cloudflare Quick Tunnel URLs. They remain valid only while the tunnel processes stay running.

---

## 7. Performance Notes

- High tier keeps 36 chunks active at spawn: 27 low + 9 high. This is the heaviest path and should be treated as the main memory/network budget.
- Medium tier keeps 25 chunks active; low tier keeps 14. The tier split is working as intended.
- Low LOD collision is always kept for active chunks so physics remains stable when high LOD loads or unloads.
- First load in the headless run requested 63 GLBs; 54 were chunk resources for the medium active set (low model + low collision + high models).
- Headless Chrome uses software rendering, so its frame timing is not representative of a real GPU. No FPS claim is made from this run.
- The world manifest is small (24,463 bytes) and is now revalidated rather than force-cached.
- Quick Tunnel latency and availability are external to the game; a named Cloudflare Tunnel or stable hosting is required for a persistent public link.

---

## 8. Known Limitations

1. The public URL is temporary and changes if the Cloudflare tunnel restarts.
2. The high tier can load 36 chunk scenes plus city geometry; low-end devices should use medium or low.
3. The headless verification confirms loading and LOD switching, not real-device FPS.
4. Multiplayer room capacity and gameplay behavior were smoke-tested, not load-tested with a large group.
5. `frontend/vercel.json` still appears as modified in `git status` although its content diff is empty; it was not part of this phase.

---

## 9. Commands Used

```bash
python3 -m py_compile frontend/public/scripts/generate_city.py frontend/public/scripts/generate_world.py
node --check frontend/public/scripts/world-streamer.js
node --check frontend/public/assets/WorldScene.js
python3 frontend/public/scripts/generate_city.py
python3 frontend/public/scripts/generate_world.py
git diff --check
node /tmp/opencode/item3-headless.js
node /tmp/opencode/item3-quality-debug.js
```
