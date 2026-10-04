# Embedding in a Page

```html
<script src="joinfs-ground-height.js"></script>
<joinfs-ground-profile id="chart" unit="ft" style="height: 60vh"></joinfs-ground-profile>
<script>
  // frames: { times (s), lat (deg), lon (deg), alt (m) }, typed arrays or plain arrays
  JoinfsGroundHeight.computeProfile(frames).then((ground) => {
    chart.data = { name: 'D-ABCD', times: frames.times, alt: frames.alt, ground };
    chart.playhead = 600;                                         // optional, seconds
    chart.addEventListener('seek', (e) => { chart.playhead = e.detail.time; });
  });
</script>
```

Host the locale files (`joinfs-ground-height-<locale>.json`) **in the same folder as the script**, see [Languages](Languages).
`demo/index.html` does this with a made-up flight and terrain (`?live` asks the real service, `?lang=de`, `?theme=dark`).

## The element

| | |
|---|---|
| Attributes | `lang`, `unit` (`ft` default, or `m`), `locale-base` |
| `data` | `{ name, times, alt, ground }`: `times` in seconds (the x axis, any origin), `alt` in **metres**, `ground` is `{ times, height }` from `computeProfile`, or `null` |
| `playhead` | seconds, or `null` |
| Methods | `zoomIn()`, `zoomOut()`, `fit()` |
| Event | `seek`, `detail { time }` |

Give the element a height (it fills the width of its container; the diagram stretches to the height you give it, at least
320 px). In a dialog, make the element the dialog body's only child and let it stretch.

## Frames with no position

Recordings keep events and variables in the same arrays as the position frames, with zeros. Before you pass `times` and
`alt` to the chart, keep only the frames with a real position (latitude and longitude not both 0); `computeProfile`
already skips them.

## The functions

| Function | Result |
|---|---|
| `computeProfile(frames, opts)` | `Promise<{ times, height, source, points }>`: times in the track's time, height in metres |
| `interpolate(profile, t)` | ground height at `t` (linear, held before the first and after the last point) |
| `aglSeries(frames, profile)` | `Float32Array` of altitude minus ground height per frame, `NaN` without a valid position |
| `statistics(times, alt, profile)` | `{ minAgl, minAglTime, maxAlt, maxGround }` |
| `fetchElevations(coords, opts)` | the lookup itself for `[{ lat, lon }]` |
| `pickSamples(frames, opts)` | the frame indices `computeProfile` would look up |

`opts` of `computeProfile`: `spacingM` (250), `maxPoints` (600), `maxGapS` (60), `provider`, `signal`, `onProgress(done, total)`,
`fetch`, `retries` (3). Errors are `GroundHeightError` with a `code`: `noPositions`, `network`, `http`, `rateLimited`,
`badResponse`, `aborted`.

`aglSeries` and `statistics` are what an analysis (ground clearance, low passes) builds on.
