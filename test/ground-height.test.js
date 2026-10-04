'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const J = require('../src/joinfs-ground-height.js');

/** A straight flight east at 47 N: n frames, 1 s apart, about `mPerFrame` metres between frames. */
function line(n, mPerFrame = 50, t0 = 0) {
  const times = new Float64Array(n), lat = new Float64Array(n), lon = new Float64Array(n);
  for (let i = 0; i < n; i++) { times[i] = t0 + i; lat[i] = 47; lon[i] = 8 + (i * mPerFrame) / 75800; }
  return { times, lat, lon };
}

test('pickSamples keeps first and last, spaces the rest', () => {
  const f = line(1000, 50);                                   // about 50 km
  const picks = J.pickSamples(f, { spacingM: 1000, maxPoints: 600 });
  assert.equal(picks[0], 0);
  assert.equal(picks[picks.length - 1], 999);
  assert.ok(picks.length > 40 && picks.length < 60, `got ${picks.length}`);
  assert.deepEqual(picks, [...picks].sort((a, b) => a - b));
});

test('pickSamples never exceeds maxPoints, the spacing grows instead', () => {
  const picks = J.pickSamples(line(20000, 100), { spacingM: 100, maxPoints: 100 });
  assert.ok(picks.length <= 110, `got ${picks.length}`);
});

test('pickSamples ignores 0,0 and non-finite fixes; empty track gives no samples', () => {
  const f = line(10, 500);
  f.lat[0] = 0; f.lon[0] = 0; f.lat[3] = NaN;
  const picks = J.pickSamples(f, { spacingM: 100 });
  assert.ok(!picks.includes(0) && !picks.includes(3));
  assert.deepEqual(J.pickSamples({ times: [], lat: [], lon: [] }), []);
});

test('pickSamples adds the frame before a move after a long pause (a parked aircraft stays flat)', () => {
  const times = Float64Array.from([0, 1, 2, 3600, 3601]);
  const lat = Float64Array.from([47, 47, 47, 47, 47]);
  const lon = Float64Array.from([8, 8, 8, 8.01, 8.02]);
  const picks = J.pickSamples({ times, lat, lon }, { spacingM: 250 });
  assert.ok(picks.includes(2), 'frame 2 (last before the move) is sampled');
});

test('fetchElevations batches by 100, asks identical positions once, keeps order', async () => {
  const batches = [];
  const provider = async (b) => { batches.push(b.length); return b.map((c) => c.lon * 10); };
  const coords = [];
  for (let i = 0; i < 250; i++) coords.push({ lat: 47, lon: 8 + i * 0.001 });
  coords.push({ lat: 47, lon: 8 });                           // duplicate of the first
  const out = await J.fetchElevations(coords, { provider });
  assert.deepEqual(batches, [100, 100, 50]);
  assert.equal(out.length, 251);
  assert.ok(Math.abs(out[0] - 80) < 1e-9 && Math.abs(out[250] - 80) < 1e-9);
});

test('fetchElevations: Open-Meteo request shape, no data becomes 0, progress is reported', async () => {
  const urls = [], progress = [];
  const fetch = async (url) => { urls.push(url); return { ok: true, status: 200, json: async () => ({ elevation: [412, null] }) }; };
  const out = await J.fetchElevations([{ lat: 47.12345678, lon: 8.5 }, { lat: 1, lon: 2 }], { fetch, onProgress: (d, t) => progress.push([d, t]) });
  assert.deepEqual(out, [412, 0]);
  assert.equal(urls[0], 'https://api.open-meteo.com/v1/elevation?latitude=47.1235,1&longitude=8.5,2');
  assert.deepEqual(progress, [[2, 2]]);
});

test('fetchElevations: error codes', async () => {
  const bad = (status) => ({ fetch: async () => ({ ok: false, status, json: async () => ({}) }), retries: 0 });
  const one = [{ lat: 1, lon: 1 }];
  await assert.rejects(J.fetchElevations(one, bad(500)), { code: 'http' });
  await assert.rejects(J.fetchElevations(one, bad(429)), { code: 'rateLimited' });
  await assert.rejects(J.fetchElevations(one, { fetch: async () => { throw new Error('offline'); } }), { code: 'network' });
  await assert.rejects(J.fetchElevations(one, { fetch: async () => ({ ok: true, status: 200, json: async () => ({ elevation: [] }) }) }), { code: 'badResponse' });
  const ac = new AbortController(); ac.abort();
  await assert.rejects(J.fetchElevations(one, { provider: async () => [0], signal: ac.signal }), { code: 'aborted' });
});

test('computeProfile returns track-time samples; a track without positions is refused', async () => {
  const f = line(300, 100, 50);
  const profile = await J.computeProfile(f, { provider: async (b) => b.map(() => 500), spacingM: 1000 });
  assert.equal(profile.times[0], 50);
  assert.equal(profile.times[profile.times.length - 1], 349);
  assert.ok(profile.height.every((h) => h === 500));
  assert.equal(profile.source, 'custom');
  await assert.rejects(J.computeProfile({ times: [1], lat: [0], lon: [0] }, { provider: async () => [] }), { code: 'noPositions' });
});

test('interpolate: linear inside, held outside', () => {
  const p = { times: Float64Array.from([10, 20, 40]), height: Float32Array.from([100, 200, 0]) };
  assert.equal(J.interpolate(p, 0), 100);
  assert.equal(J.interpolate(p, 15), 150);
  assert.equal(J.interpolate(p, 30), 100);
  assert.equal(J.interpolate(p, 99), 0);
  assert.ok(Number.isNaN(J.interpolate({ times: [], height: [] }, 1)));
});

test('aglSeries and statistics', () => {
  const frames = { times: Float64Array.from([0, 10, 20]), lat: [47, 47, 0], lon: [8, 8, 0], alt: Float64Array.from([300, 150, 400]) };
  const profile = { times: Float64Array.from([0, 20]), height: Float32Array.from([100, 100]) };
  const agl = J.aglSeries(frames, profile);
  assert.equal(agl[0], 200); assert.equal(agl[1], 50); assert.ok(Number.isNaN(agl[2]));
  const s = J.statistics(frames.times, frames.alt, profile);
  assert.equal(s.minAgl, 50); assert.equal(s.minAglTime, 10); assert.equal(s.maxAlt, 400); assert.equal(s.maxGround, 100);
  const none = J.statistics(frames.times, frames.alt, null);
  assert.ok(Number.isNaN(none.minAgl)); assert.equal(none.maxAlt, 400);
  assert.ok(Number.isNaN(J.aglSeries(frames, null)[0]));
});

test('niceTicks, timeTickStep and formatClock', () => {
  assert.deepEqual(J.niceTicks(0, 100, 5), [0, 20, 40, 60, 80, 100]);
  assert.deepEqual(J.niceTicks(5, 5), [5]);
  assert.equal(J.timeTickStep(80, 8), 10);
  assert.equal(J.formatClock(75), '1:15');
  assert.equal(J.formatClock(3725), '1:02:05');
  assert.equal(J.formatClock(5, true), '0:00:05');
  assert.equal(J.formatClock(-5), '-0:05');
});

test('decimate keeps peaks and thins long series; short series pass through without NaN', () => {
  const n = 100000, times = new Float64Array(n), values = new Float64Array(n);
  for (let i = 0; i < n; i++) { times[i] = i; values[i] = i === 50000 ? 9999 : Math.sin(i / 100) * 10; }
  const d = J.decimate(times, values, 0, n - 1, 500);
  assert.ok(d.x.length < 2500, `got ${d.x.length}`);
  assert.ok(d.y.includes(9999), 'the spike survives');
  const small = J.decimate(Float64Array.from([0, 1, 2, 3]), Float64Array.from([5, NaN, 7, 8]), 1, 2, 500);
  assert.ok(small.y.length > 0 && !small.y.some(Number.isNaN));
});
