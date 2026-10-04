# Ground Height Data

## Where the heights come from

By default the [Open-Meteo elevation API](https://open-meteo.com/en/docs/elevation-api) is asked. It serves the Copernicus
GLO-90 terrain model: a 90 m grid, free for non-commercial use, no key, up to 100 positions per request. Please name the
source (*Weather data by Open-Meteo.com*) where you show the heights to users; see `NOTICE.md`.

## What is sent

**A thinned-out sample of the track's positions**, rounded to 4 decimals (about 11 m), as latitude and longitude only: no
times, no altitudes, no names. Nothing is sent before you call `computeProfile`, and the chart itself never talks to a server.

Which positions: the first and last valid fix, then one every `spacingM` (250 m), at least one every `maxGapS` (60 s) so a
parked aircraft keeps a flat ground height, and one before a gap in the recording. For long flights the spacing and the gap
grow so that about `maxPoints` (600) are looked up at most. Identical positions are asked once. A position at exactly 0/0 is
treated as "no fix" and skipped.

## How exact it is

- The model has a 90 m grid and the track is sampled, so the ground height is an **estimate**: good for terrain clearance,
  not for judging a runway or a low pass over a building.
- Open sea has no data and counts as 0 m.
- Bridges, buildings and trees are not in the model.
- Between two looked-up positions the height is interpolated linearly in time.

## Errors

| `code` | Meaning |
|---|---|
| `noPositions` | the track has no usable position |
| `network` | the service could not be reached (offline, blocked) |
| `http` | the service answered with an error |
| `rateLimited` | the request limit was reached (retried with a pause first) |
| `badResponse` | the answer could not be used |
| `aborted` | stopped through the `signal` |

## Another service

Pass `provider: async (batch) => heights` to `computeProfile` or `fetchElevations`: `batch` is an array of `{ lat, lon }`
(at most `batchSize`, 100), the result an array of heights in metres in the same order. Use it for your own terrain data, a
different service, or tests.
