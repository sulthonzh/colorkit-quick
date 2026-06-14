import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hexToRgb, rgbToHex, parse, rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb,
  clamp, lighten, darken, saturate, desaturate, rotate, invert, grayscale,
  mix, luminance, contrast, contrastGrade, readableText,
  harmony, gradient, gradientStops, format, brightness, isDark, isLight, isWarm,
} from '../src/index.js';

// ─── hexToRgb ───────────────────────────────────────────
test('hexToRgb: parses 6-digit hex', () => {
  assert.deepEqual(hexToRgb('#ff0000'), { r: 255, g: 0, b: 0 });
  assert.deepEqual(hexToRgb('00ff00'), { r: 0, g: 255, b: 0 });
  assert.deepEqual(hexToRgb('#0000ff'), { r: 0, g: 0, b: 255 });
});

test('hexToRgb: parses 3-digit shorthand', () => {
  assert.deepEqual(hexToRgb('#f00'), { r: 255, g: 0, b: 0 });
  assert.deepEqual(hexToRgb('#0f0'), { r: 0, g: 255, b: 0 });
  assert.deepEqual(hexToRgb('#abc'), { r: 170, g: 187, b: 204 });
});

test('hexToRgb: parses 8-digit with alpha', () => {
  const c = hexToRgb('#ff000080');
  assert.equal(c.r, 255);
  assert.equal(c.g, 0);
  assert.equal(c.b, 0);
  assert.ok(Math.abs(c.a - 128 / 255) < 0.01);
});

test('hexToRgb: parses 4-digit with alpha', () => {
  const c = hexToRgb('#f00f');
  assert.equal(c.r, 255);
  assert.equal(c.a, 1);
});

test('hexToRgb: throws on invalid', () => {
  assert.throws(() => hexToRgb('#ff'), /Invalid hex/);
  assert.throws(() => hexToRgb('#gggggg'), /Invalid hex/);
});

// ─── rgbToHex ───────────────────────────────────────────
test('rgbToHex: converts to hex', () => {
  assert.equal(rgbToHex({ r: 255, g: 0, b: 0 }), '#ff0000');
  assert.equal(rgbToHex({ r: 0, g: 255, b: 0 }), '#00ff00');
  assert.equal(rgbToHex({ r: 128, g: 64, b: 32 }), '#804020');
});

test('rgbToHex: includes alpha', () => {
  assert.equal(rgbToHex({ r: 255, g: 0, b: 0, a: 0.5 }, true), '#ff000080');
});

// ─── parse ──────────────────────────────────────────────
test('parse: hex', () => {
  assert.deepEqual(parse('#ff8800'), { r: 255, g: 136, b: 0 });
});

test('parse: rgb()', () => {
  assert.deepEqual(parse('rgb(255, 136, 0)'), { r: 255, g: 136, b: 0 });
});

test('parse: rgba()', () => {
  const c = parse('rgba(255, 136, 0, 0.5)');
  assert.equal(c.r, 255);
  assert.equal(c.g, 136);
  assert.equal(c.b, 0);
  assert.equal(c.a, 0.5);
});

test('parse: hsl()', () => {
  const c = parse('hsl(0, 100%, 50%)');
  assert.equal(c.r, 255);
  assert.equal(c.g, 0);
  assert.equal(c.b, 0);
});

test('parse: hsla()', () => {
  const c = parse('hsla(120, 100%, 50%, 0.5)');
  assert.equal(c.r, 0);
  assert.equal(c.g, 255);
  assert.equal(c.b, 0);
  assert.equal(c.a, 0.5);
});

test('parse: throws on unknown', () => {
  assert.throws(() => parse('not a color'), /Cannot parse/);
});

// ─── RGB ↔ HSL ──────────────────────────────────────────
test('rgbToHsl: red', () => {
  const hsl = rgbToHsl({ r: 255, g: 0, b: 0 });
  assert.equal(hsl.h, 0);
  assert.equal(hsl.s, 100);
  assert.equal(hsl.l, 50);
});

test('rgbToHsl: green', () => {
  const hsl = rgbToHsl({ r: 0, g: 255, b: 0 });
  assert.equal(hsl.h, 120);
  assert.equal(hsl.s, 100);
  assert.equal(hsl.l, 50);
});

test('rgbToHsl: blue', () => {
  const hsl = rgbToHsl({ r: 0, g: 0, b: 255 });
  assert.equal(hsl.h, 240);
  assert.equal(hsl.s, 100);
  assert.equal(hsl.l, 50);
});

test('rgbToHsl: white', () => {
  const hsl = rgbToHsl({ r: 255, g: 255, b: 255 });
  assert.equal(hsl.s, 0);
  assert.equal(hsl.l, 100);
});

test('rgbToHsl: gray', () => {
  const hsl = rgbToHsl({ r: 128, g: 128, b: 128 });
  assert.equal(hsl.s, 0);
  assert.ok(hsl.l > 45 && hsl.l < 55);
});

test('hslToRgb: red', () => {
  const rgb = hslToRgb({ h: 0, s: 100, l: 50 });
  assert.equal(rgb.r, 255);
  assert.equal(rgb.g, 0);
  assert.equal(rgb.b, 0);
});

test('hslToRgb: roundtrip', () => {
  const colors = [{ r: 100, g: 150, b: 200 }, { r: 50, g: 200, b: 100 }];
  for (const c of colors) {
    const back = hslToRgb(rgbToHsl(c));
    assert.ok(Math.abs(back.r - c.r) <= 1, `r: ${back.r} vs ${c.r}`);
    assert.ok(Math.abs(back.g - c.g) <= 1, `g: ${back.g} vs ${c.g}`);
    assert.ok(Math.abs(back.b - c.b) <= 1, `b: ${back.b} vs ${c.b}`);
  }
});

test('hslToRgb: preserves alpha', () => {
  const rgb = hslToRgb({ h: 0, s: 100, l: 50, a: 0.5 });
  assert.equal(rgb.a, 0.5);
});

// ─── RGB ↔ HSV ──────────────────────────────────────────
test('rgbToHsv: red', () => {
  const hsv = rgbToHsv({ r: 255, g: 0, b: 0 });
  assert.equal(hsv.h, 0);
  assert.equal(hsv.s, 100);
  assert.equal(hsv.v, 100);
});

test('rgbToHsv: green', () => {
  const hsv = rgbToHsv({ r: 0, g: 255, b: 0 });
  assert.equal(hsv.h, 120);
});

test('rgbToHsv: black', () => {
  const hsv = rgbToHsv({ r: 0, g: 0, b: 0 });
  assert.equal(hsv.v, 0);
});

test('hsvToRgb: roundtrip', () => {
  const colors = [{ r: 100, g: 150, b: 200 }, { r: 200, g: 50, b: 150 }];
  for (const c of colors) {
    const back = hsvToRgb(rgbToHsv(c));
    assert.ok(Math.abs(back.r - c.r) <= 1);
    assert.ok(Math.abs(back.g - c.g) <= 1);
    assert.ok(Math.abs(back.b - c.b) <= 1);
  }
});

// ─── clamp ──────────────────────────────────────────────
test('clamp: clamps RGB', () => {
  assert.deepEqual(clamp({ r: 300, g: -10, b: 128 }), { r: 255, g: 0, b: 128 });
});

test('clamp: clamps alpha', () => {
  assert.deepEqual(clamp({ r: 0, g: 0, b: 0, a: 2 }), { r: 0, g: 0, b: 0, a: 1 });
});

// ─── lighten / darken ───────────────────────────────────
test('lighten: increases lightness', () => {
  const c = lighten({ r: 100, g: 100, b: 100 }, 20);
  const hsl = rgbToHsl(c);
  assert.ok(hsl.l > 40); // original ~40, +20
});

test('lighten: caps at 100', () => {
  const c = lighten('#ffffff', 50);
  assert.equal(rgbToHsl(c).l, 100);
});

test('darken: decreases lightness', () => {
  const c = darken({ r: 200, g: 200, b: 200 }, 20);
  const hsl = rgbToHsl(c);
  assert.ok(hsl.l < 70);
});

test('darken: caps at 0', () => {
  const c = darken('#000000', 50);
  assert.equal(rgbToHsl(c).l, 0);
});

// ─── saturate / desaturate ──────────────────────────────
test('saturate: increases saturation', () => {
  const c = saturate({ r: 128, g: 100, b: 100 }, 30);
  assert.ok(rgbToHsl(c).s > rgbToHsl({ r: 128, g: 100, b: 100 }).s);
});

test('desaturate: decreases saturation', () => {
  const c = desaturate('#ff0000', 50);
  assert.ok(rgbToHsl(c).s < 100);
});

// ─── rotate ─────────────────────────────────────────────
test('rotate: shifts hue', () => {
  const c = rotate('#ff0000', 180);
  assert.ok(Math.abs(rgbToHsl(c).h - 180) <= 1);
});

test('rotate: wraps around 360', () => {
  const c = rotate({ r: 0, g: 0, b: 255 }, 180); // blue h=240 + 180 = 420 → 60
  assert.ok(Math.abs(rgbToHsl(c).h - 60) <= 1);
});

// ─── invert / grayscale ─────────────────────────────────
test('invert: inverts', () => {
  assert.deepEqual(invert({ r: 0, g: 0, b: 0 }), { r: 255, g: 255, b: 255 });
  assert.deepEqual(invert({ r: 255, g: 255, b: 255 }), { r: 0, g: 0, b: 0 });
});

test('invert: preserves alpha', () => {
  const c = invert({ r: 0, g: 0, b: 0, a: 0.5 });
  assert.equal(c.a, 0.5);
});

test('grayscale: produces gray', () => {
  const c = grayscale({ r: 255, g: 0, b: 0 });
  assert.equal(c.r, c.g);
  assert.equal(c.g, c.b);
});

// ─── mix ────────────────────────────────────────────────
test('mix: 50/50 blend', () => {
  const c = mix({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
  assert.ok(c.r > 120 && c.r < 135);
});

test('mix: t=0 returns first color', () => {
  const c = mix('#ff0000', '#0000ff', 0);
  assert.equal(c.r, 255);
  assert.equal(c.b, 0);
});

test('mix: t=1 returns second color', () => {
  const c = mix('#ff0000', '#0000ff', 1);
  assert.equal(c.r, 0);
  assert.equal(c.b, 255);
});

test('mix: blends alpha', () => {
  const c = mix({ r: 0, g: 0, b: 0, a: 0.2 }, { r: 0, g: 0, b: 0, a: 0.8 });
  assert.ok(Math.abs(c.a - 0.5) < 0.01);
});

// ─── luminance / contrast ───────────────────────────────
test('luminance: black is 0', () => {
  assert.equal(luminance('#000000'), 0);
});

test('luminance: white is 1', () => {
  assert.ok(Math.abs(luminance('#ffffff') - 1) < 0.001);
});

test('contrast: black/white is 21', () => {
  const ratio = contrast('#000000', '#ffffff');
  assert.ok(ratio > 20, `expected ~21, got ${ratio}`);
});

test('contrast: same color is 1', () => {
  const ratio = contrast('#ff0000', '#ff0000');
  assert.ok(Math.abs(ratio - 1) < 0.01);
});

test('contrastGrade: AA pass for high contrast', () => {
  const g = contrastGrade(contrast('#000000', '#ffffff'));
  assert.equal(g.aa_small, true);
  assert.equal(g.aaa_small, true);
});

test('contrastGrade: fail for low contrast', () => {
  const g = contrastGrade(2.0);
  assert.equal(g.aa_small, false);
  assert.equal(g.aa_large, false);
});

// ─── readableText ───────────────────────────────────────
test('readableText: picks white for dark bg', () => {
  assert.equal(readableText('#000000'), '#ffffff');
});

test('readableText: picks black for light bg', () => {
  assert.equal(readableText('#ffffff'), '#000000');
});

// ─── harmony ────────────────────────────────────────────
test('harmony: complementary', () => {
  const [c1, c2] = harmony('#ff0000', 'complementary');
  assert.ok(Math.abs(rgbToHsl(c1).h - 0) <= 1);
  assert.ok(Math.abs(rgbToHsl(c2).h - 180) <= 1);
});

test('harmony: analogous', () => {
  const colors = harmony('#ff0000', 'analogous');
  assert.equal(colors.length, 3);
});

test('harmony: triadic', () => {
  const colors = harmony('#ff0000', 'triadic');
  assert.equal(colors.length, 3);
  const hues = colors.map(c => rgbToHsl(c).h);
  assert.ok(Math.abs(hues[1] - 120) <= 1);
  assert.ok(Math.abs(hues[2] - 240) <= 1);
});

test('harmony: tetradic', () => {
  const colors = harmony('#336699', 'tetradic');
  assert.equal(colors.length, 4);
});

test('harmony: splitComplement', () => {
  const colors = harmony('#ff0000', 'splitComplement');
  assert.equal(colors.length, 3);
});

test('harmony: unknown type throws', () => {
  assert.throws(() => harmony('#fff', 'unknown'), /Unknown harmony/);
});

// ─── gradient ───────────────────────────────────────────
test('gradient: correct number of steps', () => {
  const g = gradient('#000000', '#ffffff', 5);
  assert.equal(g.length, 5);
});

test('gradient: endpoints are exact', () => {
  const g = gradient('#000000', '#ffffff', 3);
  assert.equal(g[0].r, 0);
  assert.equal(g[2].r, 255);
});

test('gradient: middle is average', () => {
  const g = gradient('#000000', '#ffffff', 3);
  assert.ok(g[1].r > 120 && g[1].r < 135);
});

test('gradient: throws on < 2 steps', () => {
  assert.throws(() => gradient('#000', '#fff', 1), /steps must be/);
});

test('gradientStops: multi-stop', () => {
  const g = gradientStops(['#ff0000', '#00ff00', '#0000ff'], 7);
  assert.equal(g.length, 7);
});

test('gradientStops: includes endpoints', () => {
  const g = gradientStops(['#ff0000', '#0000ff'], 3);
  assert.equal(rgbToHex(g[0]), '#ff0000');
  assert.equal(rgbToHex(g[2]), '#0000ff');
});

// ─── format ─────────────────────────────────────────────
test('format: rgb', () => {
  assert.equal(format({ r: 255, g: 0, b: 0 }, 'rgb'), 'rgb(255, 0, 0)');
});

test('format: rgba', () => {
  assert.equal(format({ r: 255, g: 0, b: 0, a: 0.5 }, 'rgb'), 'rgba(255, 0, 0, 0.5)');
});

test('format: hex', () => {
  assert.equal(format({ r: 255, g: 0, b: 0 }, 'hex'), '#ff0000');
});

test('format: hex with alpha', () => {
  assert.equal(format({ r: 255, g: 0, b: 0, a: 0.5 }, 'hex'), '#ff000080');
});

test('format: hsl', () => {
  const s = format({ r: 255, g: 0, b: 0 }, 'hsl');
  assert.match(s, /hsl\(0.*100.*50/);
});

test('format: hsv', () => {
  const s = format({ r: 255, g: 0, b: 0 }, 'hsv');
  assert.match(s, /hsv\(0.*100.*100/);
});

// ─── brightness / isDark / isLight ──────────────────────
test('brightness: black is 0', () => {
  assert.equal(brightness('#000000'), 0);
});

test('brightness: white is 255', () => {
  assert.equal(brightness('#ffffff'), 255);
});

test('isDark: black', () => {
  assert.equal(isDark('#000000'), true);
});

test('isDark: white', () => {
  assert.equal(isDark('#ffffff'), false);
});

test('isLight: white', () => {
  assert.equal(isLight('#ffffff'), true);
});

test('isLight: black', () => {
  assert.equal(isLight('#000000'), false);
});

// ─── isWarm ─────────────────────────────────────────────
test('isWarm: red is warm', () => {
  assert.equal(isWarm('#ff0000'), true);
});

test('isWarm: blue is cool', () => {
  assert.equal(isWarm('#0000ff'), false);
});

test('isWarm: orange is warm', () => {
  assert.equal(isWarm('#ff8800'), true);
});

test('isWarm: cyan is cool', () => {
  assert.equal(isWarm('#00ffff'), false);
});

// ─── string inputs ──────────────────────────────────────
test('lighten: accepts string input', () => {
  const c = lighten('#336699', 10);
  assert.equal(c.r, undefined || c.r); // just check it doesn't throw
});

test('contrast: accepts string inputs', () => {
  const ratio = contrast('#000000', '#ffffff');
  assert.ok(ratio > 20);
});

test('mix: accepts string inputs', () => {
  const c = mix('#ff0000', '#0000ff', 0.5);
  assert.ok(c.r > 100 && c.b > 100);
});
