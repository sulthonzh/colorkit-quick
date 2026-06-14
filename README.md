# colorkit-quick

Zero-dependency color manipulation library for JavaScript. RGB/HSL/HSV conversions, mixing, WCAG contrast, harmonies, gradients — everything you need for working with colors, in one tiny package.

## Why

Every project needs color manipulation eventually. Most libraries are either bloated, have weird APIs, or pull in dependencies you don't need. This one does the job cleanly, exports tree-shakeable ESM, and works anywhere JavaScript runs.

## Install

```bash
npm install colorkit-quick
```

## Usage

### Parse any color format

```js
import { parse, format } from 'colorkit-quick';

const rgb = parse('#ff6600');        // { r: 255, g: 102, b: 0 }
const rgb2 = parse('rgba(100, 200, 50, 0.5)');
const rgb3 = parse('hsl(180, 100%, 50%)');

// Format output
format(rgb, 'hex');   // '#ff6600'
format(rgb, 'rgb');   // 'rgb(255, 102, 0)'
format(rgb, 'hsl');   // 'hsl(24, 100%, 50%)'
format(rgb, 'hsv');   // 'hsv(24, 100%, 100%)'
```

### Color operations

```js
import { lighten, darken, rotate, mix, invert, grayscale } from 'colorkit-quick';

lighten('#336699', 20);              // lighter blue
darken('#ff8800', 30);               // darker orange
rotate('#ff0000', 120);              // red → green
mix('#ff0000', '#0000ff', 0.5);     // purple
invert('#ffffff');                   // black
grayscale('#ff8800');                // muted gray
```

### WCAG contrast & accessibility

```js
import { contrast, contrastGrade, readableText } from 'colorkit-quick';

const ratio = contrast('#ffffff', '#336699');  // 5.27:1
const grade = contrastGrade(ratio);
// { aa_small: true, aa_large: true, aaa_small: false, aaa_large: true }

readableText('#1a1a2e');  // '#ffffff' — best text color for this bg
```

### Color harmonies

```js
import { harmony } from 'colorkit-quick';

harmony('#ff0000', 'complementary');    // [red, cyan]
harmony('#ff0000', 'analogous');        // [orange-red, red, red-orange]
harmony('#336699', 'triadic');           // 3 evenly spaced colors
harmony('#336699', 'tetradic');          // 4 colors (rectangle)
harmony('#336699', 'splitComplement');   // 3 colors
```

### Gradients

```js
import { gradient, gradientStops } from 'colorkit-quick';

// Simple 2-color gradient
gradient('#ff0000', '#0000ff', 5);    // 5 steps from red to blue

// Multi-stop gradient
gradientStops(['#ff0000', '#00ff00', '#0000ff'], 9);  // 9 steps through red→green→blue
```

### All conversion functions

```js
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb } from 'colorkit-quick';

const rgb = hexToRgb('#ff6600');
const hex = rgbToHex({ r: 255, g: 102, b: 0 });
const hsl = rgbToHsl({ r: 255, g: 102, b: 0 });  // { h: 24, s: 100, l: 50 }
const rgb2 = hslToRgb(hsl);                        // round-trip
const hsv = rgbToHsv(rgb);                         // { h: 24, s: 100, v: 100 }
```

### Utility functions

```js
import { luminance, brightness, isDark, isLight, isWarm, saturate, desaturate } from 'colorkit-quick';

luminance('#ffffff');   // 1.0
brightness('#000000'); // 0
isDark('#1a1a2e');     // true
isWarm('#ff8800');     // true (reds, oranges, yellows)
saturate('#888888', 50);
desaturate('#ff0000', 30);
```

## CLI

```bash
# Info about a color
colorkit info '#ff6600'

# Convert between formats
colorkit convert '#ff6600' --format=hsl

# WCAG contrast
colorkit contrast '#ffffff' '#336699'

# Mix colors
colorkit mix '#ff0000' '#0000ff' 0.5

# Generate harmony palette
colorkit harmony '#336699' triadic

# Gradient
colorkit gradient '#ff0000' '#0000ff' 5

# Best text color
colorkit text '#1a1a2e'    → '#ffffff'

# All commands support --json
colorkit contrast '#fff' '#336699' --json
```

## API

| Function | Description |
|---|---|
| `parse(str)` | Parse hex/rgb()/hsl() string → RGB |
| `hexToRgb(hex)` | Hex string → RGB |
| `rgbToHex(rgb, alpha?)` | RGB → hex string |
| `rgbToHsl(rgb)` | RGB → HSL |
| `hslToRgb(hsl)` | HSL → RGB |
| `rgbToHsv(rgb)` | RGB → HSV |
| `hsvToRgb(hsv)` | HSV → RGB |
| `lighten(color, amt)` | Increase lightness by % |
| `darken(color, amt)` | Decrease lightness by % |
| `saturate(color, amt)` | Increase saturation by % |
| `desaturate(color, amt)` | Decrease saturation by % |
| `rotate(color, deg)` | Rotate hue by degrees |
| `invert(color)` | Invert color |
| `grayscale(color)` | Convert to grayscale |
| `mix(c1, c2, t)` | Blend two colors (t=0..1) |
| `luminance(color)` | WCAG relative luminance (0-1) |
| `contrast(c1, c2)` | WCAG contrast ratio (1-21) |
| `contrastGrade(ratio)` | AA/AAA pass/fail for small/large text |
| `readableText(bg)` | Best text color (#000 or #fff) |
| `harmony(color, type)` | complementary, analogous, triadic, tetradic, splitComplement |
| `gradient(c1, c2, steps)` | N-step gradient between 2 colors |
| `gradientStops(colors, steps)` | Multi-stop gradient |
| `brightness(color)` | Perceived brightness (0-255) |
| `isDark(color)` / `isLight(color)` | Brightness check |
| `isWarm(color)` | Warm (red/orange/yellow) vs cool |
| `format(color, fmt)` | Output as hex/rgb/hsl/hsv string |
| `clamp(rgb)` | Clamp values to valid range |

All functions accept either an RGB object or a CSS color string (hex, rgb(), rgba(), hsl(), hsla()).

## License

MIT
