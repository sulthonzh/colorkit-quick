#!/usr/bin/env node
import { parse, rgbToHex, rgbToHsl, rgbToHsv, hexToRgb, hslToRgb, hsvToRgb,
  mix, lighten, darken, saturate, desaturate, rotate, invert, grayscale,
  contrast, contrastGrade, readableText, luminance, brightness, isDark, isLight,
  isWarm, harmony, gradient, gradientStops, format } from './index.js';

function die(msg) { console.error(msg); process.exit(1); }

function out(obj, json) {
  if (json) { console.log(JSON.stringify(obj, null, 2)); return; }
  if (Array.isArray(obj)) {
    obj.forEach((c, i) => console.log(`${i}: ${format(c, 'hex')}  ${format(c, 'rgb')}  ${format(c, 'hsl')}`));
  } else if (typeof obj === 'object' && obj.r !== undefined) {
    console.log(`hex: ${format(obj, 'hex')}`);
    console.log(`rgb: ${format(obj, 'rgb')}`);
    console.log(`hsl: ${format(obj, 'hsl')}`);
    console.log(`hsv: ${format(obj, 'hsv')}`);
  } else {
    console.log(obj);
  }
}

const [,, cmd, ...args] = process.argv;
const jsonFlag = args.includes('--json');
const opts = args.filter(a => !a.startsWith('--'));
const fmt = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'rgb';

if (!cmd) {
  console.log(`colorkit — zero-dep color manipulation

Usage:
  colorkit info <color>              Show all color representations
  colorkit convert <color> --format=hex|rgb|hsl|hsv
  colorkit mix <c1> <c2> [t]         Mix two colors (t=0..1, default 0.5)
  colorkit lighten <color> <amount>  Lighten by %
  colorkit darken <color> <amount>   Darken by %
  colorkit saturate <color> <amt>    Saturate by %
  colorkit desaturate <color> <amt>  Desaturate by %
  colorkit rotate <color> <degrees>  Rotate hue
  colorkit invert <color>            Invert color
  colorkit grayscale <color>         Convert to grayscale
  colorkit contrast <c1> <c2>        WCAG contrast ratio
  colorkit harmony <color> <type>    complementary|analogous|triadic|tetradic|splitComplement
  colorkit gradient <c1> <c2> <n>    N-step gradient
  colorkit text <bg>                 Best text color (black/white)

Flags: --json, --format=hex|rgb|hsl|hsv
`);
  process.exit(0);
}

try {
  switch (cmd) {
    case 'info': {
      const c = parse(opts[0]);
      out(c, jsonFlag);
      break;
    }
    case 'convert': {
      const c = parse(opts[0]);
      console.log(format(c, fmt));
      break;
    }
    case 'mix': {
      const c = mix(opts[0], opts[1], parseFloat(opts[2] || 0.5));
      console.log(format(c, fmt));
      break;
    }
    case 'lighten':
      console.log(format(lighten(opts[0], parseFloat(opts[1])), fmt));
      break;
    case 'darken':
      console.log(format(darken(opts[0], parseFloat(opts[1])), fmt));
      break;
    case 'saturate':
      console.log(format(saturate(opts[0], parseFloat(opts[1])), fmt));
      break;
    case 'desaturate':
      console.log(format(desaturate(opts[0], parseFloat(opts[1])), fmt));
      break;
    case 'rotate':
      console.log(format(rotate(opts[0], parseFloat(opts[1])), fmt));
      break;
    case 'invert':
      console.log(format(invert(opts[0]), fmt));
      break;
    case 'grayscale':
      console.log(format(grayscale(opts[0]), fmt));
      break;
    case 'contrast': {
      const ratio = contrast(opts[0], opts[1]);
      const grade = contrastGrade(ratio);
      if (jsonFlag) {
        console.log(JSON.stringify({ ratio, ...grade }, null, 2));
      } else {
        console.log(`Contrast: ${ratio.toFixed(2)}:1`);
        console.log(`AA (normal): ${grade.aa_small ? 'PASS' : 'FAIL'}`);
        console.log(`AA (large): ${grade.aa_large ? 'PASS' : 'FAIL'}`);
        console.log(`AAA (normal): ${grade.aaa_small ? 'PASS' : 'FAIL'}`);
        console.log(`AAA (large): ${grade.aaa_large ? 'PASS' : 'FAIL'}`);
      }
      break;
    }
    case 'harmony': {
      const colors = harmony(opts[0], opts[1] || 'complementary');
      out(colors, jsonFlag);
      break;
    }
    case 'gradient': {
      const colors = gradient(opts[0], opts[1], parseInt(opts[2], 10));
      out(colors, jsonFlag);
      break;
    }
    case 'text': {
      console.log(readableText(opts[0]));
      break;
    }
    default:
      die(`Unknown command: ${cmd}. Run 'colorkit' for help.`);
  }
} catch (e) {
  die(`Error: ${e.message}`);
}
