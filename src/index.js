// colorkit-quick — Zero-dep color manipulation
// RGB/HSL/HSV conversions, mixing, WCAG contrast, harmonies, gradients

/**
 * @typedef {Object} RGB
 * @property {number} r — Red (0-255)
 * @property {number} g — Green (0-255)
 * @property {number} b — Blue (0-255)
 * @property {number} [a] — Alpha (0-1)
 */

/**
 * @typedef {Object} HSL
 * @property {number} h — Hue (0-360)
 * @property {number} s — Saturation (0-100)
 * @property {number} l — Lightness (0-100)
 * @property {number} [a] — Alpha (0-1)
 */

/**
 * @typedef {Object} HSV
 * @property {number} h — Hue (0-360)
 * @property {number} s — Saturation (0-100)
 * @property {number} v — Value (0-100)
 * @property {number} [a] — Alpha (0-1)
 */

// ─── Parsing ────────────────────────────────────────────

/**
 * Parse a hex color string to RGB.
 * Supports #rgb, #rgba, #rrggbb, #rrggbbaa (with or without #).
 * @param {string} hex
 * @returns {RGB}
 */
export function hexToRgb(hex) {
  let h = hex.replace(/^#/, '');
  if (h.length === 3 || h.length === 4) {
    h = h.split('').map(c => c + c).join('');
  }
  if (h.length !== 6 && h.length !== 8) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : undefined;
  return a !== undefined ? { r, g, b, a } : { r, g, b };
}

/**
 * Convert RGB to hex string.
 * @param {RGB} rgb
 * @param {boolean} [includeAlpha=false]
 * @returns {string}
 */
export function rgbToHex({ r, g, b, a }, includeAlpha = false) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  let hex = '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');
  if (includeAlpha && a !== undefined) {
    hex += Math.round(clamp(a * 255)).toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Parse any CSS color string (hex, rgb(), rgba(), hsl(), hsla()) to RGB.
 * @param {string} str
 * @returns {RGB}
 */
export function parse(str) {
  str = str.trim();
  if (str.startsWith('#') || /^[0-9a-fA-F]{3,8}$/.test(str)) {
    return hexToRgb(str);
  }
  const m = str.match(/^(rgba?|hsla?)\(([^)]+)\)/i);
  if (!m) throw new Error(`Cannot parse color: ${str}`);
  const fn = m[1].toLowerCase();
  const parts = m[2].split(',').map(s => s.trim());
  if (fn.startsWith('rgb')) {
    const r = parseFloat(parts[0]);
    const g = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    const a = parts.length > 3 ? parseFloat(parts[3]) : undefined;
    return a !== undefined ? { r, g, b, a } : { r, g, b };
  }
  // hsl/hsla
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]);
  const l = parseFloat(parts[2]);
  const a = parts.length > 3 ? parseFloat(parts[3]) : undefined;
  const rgb = hslToRgb({ h, s, l });
  return a !== undefined ? { ...rgb, a } : rgb;
}

// ─── RGB ↔ HSL ──────────────────────────────────────────

/**
 * Convert RGB to HSL.
 * @param {RGB} rgb
 * @returns {HSL}
 */
export function rgbToHsl({ r, g, b, a }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  const result = { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  if (a !== undefined) result.a = a;
  return result;
}

/**
 * Convert HSL to RGB.
 * @param {HSL} hsl
 * @returns {RGB}
 */
export function hslToRgb({ h, s, l, a }) {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const result = {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
  if (a !== undefined) result.a = a;
  return result;
}

// ─── RGB ↔ HSV ──────────────────────────────────────────

/**
 * Convert RGB to HSV.
 * @param {RGB} rgb
 * @returns {HSV}
 */
export function rgbToHsv({ r, g, b, a }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  const result = { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
  if (a !== undefined) result.a = a;
  return result;
}

/**
 * Convert HSV to RGB.
 * @param {HSV} hsv
 * @returns {RGB}
 */
export function hsvToRgb({ h, s, v, a }) {
  h = ((h % 360) + 360) % 360;
  s /= 100; v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const result = {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
  if (a !== undefined) result.a = a;
  return result;
}

// ─── Color Operations ───────────────────────────────────

/**
 * Clamp RGB values to valid range.
 * @param {RGB} rgb
 * @returns {RGB}
 */
export function clamp({ r, g, b, a }) {
  const c = (v) => Math.max(0, Math.min(255, v));
  const result = { r: c(r), g: c(g), b: c(b) };
  if (a !== undefined) result.a = Math.max(0, Math.min(1, a));
  return result;
}

/**
 * Lighten a color by a percentage (0-100).
 * @param {RGB|string} color
 * @param {number} amount
 * @returns {RGB}
 */
export function lighten(color, amount) {
  const hsl = typeof color === 'string' ? rgbToHsl(parse(color)) : rgbToHsl(color);
  hsl.l = Math.min(100, hsl.l + amount);
  return hslToRgb(hsl);
}

/**
 * Darken a color by a percentage (0-100).
 * @param {RGB|string} color
 * @param {number} amount
 * @returns {RGB}
 */
export function darken(color, amount) {
  const hsl = typeof color === 'string' ? rgbToHsl(parse(color)) : rgbToHsl(color);
  hsl.l = Math.max(0, hsl.l - amount);
  return hslToRgb(hsl);
}

/**
 * Saturate a color by a percentage (0-100).
 * @param {RGB|string} color
 * @param {number} amount
 * @returns {RGB}
 */
export function saturate(color, amount) {
  const hsl = typeof color === 'string' ? rgbToHsl(parse(color)) : rgbToHsl(color);
  hsl.s = Math.min(100, hsl.s + amount);
  return hslToRgb(hsl);
}

/**
 * Desaturate a color by a percentage (0-100).
 * @param {RGB|string} color
 * @param {number} amount
 * @returns {RGB}
 */
export function desaturate(color, amount) {
  const hsl = typeof color === 'string' ? rgbToHsl(parse(color)) : rgbToHsl(color);
  hsl.s = Math.max(0, hsl.s - amount);
  return hslToRgb(hsl);
}

/**
 * Rotate hue by degrees.
 * @param {RGB|string} color
 * @param {number} degrees
 * @returns {RGB}
 */
export function rotate(color, degrees) {
  const hsl = typeof color === 'string' ? rgbToHsl(parse(color)) : rgbToHsl(color);
  hsl.h = (hsl.h + degrees + 360) % 360;
  return hslToRgb(hsl);
}

/**
 * Invert/grayscale a color.
 * @param {RGB|string} color
 * @returns {RGB}
 */
export function invert(color) {
  const rgb = typeof color === 'string' ? parse(color) : color;
  return { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b, ...(rgb.a !== undefined && { a: rgb.a }) };
}

/**
 * Convert color to grayscale using luminance weights.
 * @param {RGB|string} color
 * @returns {RGB}
 */
export function grayscale(color) {
  const rgb = typeof color === 'string' ? parse(color) : color;
  const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  return { r: gray, g: gray, b: gray, ...(rgb.a !== undefined && { a: rgb.a }) };
}

/**
 * Mix (blend) two colors. t=0 → color1, t=1 → color2.
 * @param {RGB|string} c1
 * @param {RGB|string} c2
 * @param {number} [t=0.5]
 * @returns {RGB}
 */
export function mix(c1, c2, t = 0.5) {
  const a = typeof c1 === 'string' ? parse(c1) : c1;
  const b = typeof c2 === 'string' ? parse(c2) : c2;
  const lerp = (x, y) => Math.round(x + (y - x) * t);
  const result = { r: lerp(a.r, b.r), g: lerp(a.g, b.g), b: lerp(a.b, b.b) };
  if (a.a !== undefined || b.a !== undefined) {
    result.a = (a.a ?? 1) + ((b.a ?? 1) - (a.a ?? 1)) * t;
  }
  return result;
}

// ─── WCAG Contrast & Accessibility ──────────────────────

/**
 * Relative luminance per WCAG 2.1.
 * @param {RGB|string} color
 * @returns {number}
 */
export function luminance(color) {
  const rgb = typeof color === 'string' ? parse(color) : color;
  const channel = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/**
 * WCAG contrast ratio between two colors (1-21).
 * @param {RGB|string} c1
 * @param {RGB|string} c2
 * @returns {number}
 */
export function contrast(c1, c2) {
  const l1 = luminance(c1);
  const l2 = luminance(c2);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Returns WCAG grade for contrast ratio.
 * @param {number} ratio
 * @returns {{aa_small: boolean, aa_large: boolean, aaa_small: boolean, aaa_large: boolean}}
 */
export function contrastGrade(ratio) {
  return {
    aa_small: ratio >= 4.5,
    aa_large: ratio >= 3,
    aaa_small: ratio >= 7,
    aaa_large: ratio >= 4.5,
  };
}

/**
 * Pick black or white text for best contrast against a background.
 * @param {RGB|string} bg
 * @returns {string} '#000000' or '#ffffff'
 */
export function readableText(bg) {
  return contrast(bg, '#ffffff') > contrast(bg, '#000000') ? '#ffffff' : '#000000';
}

// ─── Color Harmonies ────────────────────────────────────

/**
 * Generate harmony palette from a color.
 * @param {RGB|string} color
 * @param {string} type — 'complementary', 'analogous', 'triadic', 'tetradic', 'splitComplement'
 * @returns {RGB[]}
 */
export function harmony(color, type = 'complementary') {
  const hsl = typeof color === 'string' ? rgbToHsl(parse(color)) : rgbToHsl(color);
  const { h, s, l, a } = hsl;

  switch (type) {
    case 'complementary':
      return [hslToRgb({ h, s, l, a }), hslToRgb({ h: (h + 180) % 360, s, l, a })];
    case 'analogous':
      return [
        hslToRgb({ h: (h - 30 + 360) % 360, s, l, a }),
        hslToRgb({ h, s, l, a }),
        hslToRgb({ h: (h + 30) % 360, s, l, a }),
      ];
    case 'triadic':
      return [
        hslToRgb({ h, s, l, a }),
        hslToRgb({ h: (h + 120) % 360, s, l, a }),
        hslToRgb({ h: (h + 240) % 360, s, l, a }),
      ];
    case 'tetradic':
      return [
        hslToRgb({ h, s, l, a }),
        hslToRgb({ h: (h + 90) % 360, s, l, a }),
        hslToRgb({ h: (h + 180) % 360, s, l, a }),
        hslToRgb({ h: (h + 270) % 360, s, l, a }),
      ];
    case 'splitComplement':
      return [
        hslToRgb({ h, s, l, a }),
        hslToRgb({ h: (h + 150) % 360, s, l, a }),
        hslToRgb({ h: (h + 210) % 360, s, l, a }),
      ];
    default:
      throw new Error(`Unknown harmony type: ${type}`);
  }
}

// ─── Gradient Generation ────────────────────────────────

/**
 * Generate a gradient of N steps between two colors.
 * @param {RGB|string} c1
 * @param {RGB|string} c2
 * @param {number} steps
 * @returns {RGB[]}
 */
export function gradient(c1, c2, steps) {
  if (steps < 2) throw new Error('steps must be >= 2');
  return Array.from({ length: steps }, (_, i) => mix(c1, c2, i / (steps - 1)));
}

/**
 * Generate a multi-stop gradient.
 * @param {(RGB|string)[]} colors
 * @param {number} totalSteps
 * @returns {RGB[]}
 */
export function gradientStops(colors, totalSteps) {
  if (colors.length < 2) throw new Error('need at least 2 colors');
  if (totalSteps < colors.length) throw new Error('totalSteps must be >= number of colors');
  const result = [];
  const segments = colors.length - 1;
  for (let i = 0; i < totalSteps; i++) {
    const pos = (i / (totalSteps - 1)) * segments;
    const segIdx = Math.min(Math.floor(pos), segments - 1);
    const t = pos - segIdx;
    result.push(mix(colors[segIdx], colors[segIdx + 1], t));
  }
  return result;
}

// ─── Temperature & Misc ─────────────────────────────────

/**
 * Estimate if a color is "warm" (reds, oranges, yellows) or "cool" (blues, greens).
 * @param {RGB|string} color
 * @returns {boolean} true if warm
 */
export function isWarm(color) {
  const hsl = typeof color === 'string' ? rgbToHsl(parse(color)) : rgbToHsl(color);
  return hsl.h < 90 || hsl.h > 270;
}

/**
 * Get the perceived brightness (0-255).
 * @param {RGB|string} color
 * @returns {number}
 */
export function brightness(color) {
  const rgb = typeof color === 'string' ? parse(color) : color;
  return Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
}

/**
 * Check if a color is dark (brightness < 128).
 * @param {RGB|string} color
 * @returns {boolean}
 */
export function isDark(color) {
  return brightness(color) < 128;
}

/**
 * Check if a color is light (brightness >= 128).
 * @param {RGB|string} color
 * @returns {boolean}
 */
export function isLight(color) {
  return !isDark(color);
}

// ─── Format Output ──────────────────────────────────────

/**
 * Format a color as a CSS string.
 * @param {RGB|string} color
 * @param {string} [format='rgb'] — 'rgb', 'hex', 'hsl', 'hsv'
 * @returns {string}
 */
export function format(color, format = 'rgb') {
  const rgb = typeof color === 'string' ? parse(color) : color;
  switch (format) {
    case 'hex':
      return rgbToHex(rgb, rgb.a !== undefined && rgb.a < 1);
    case 'rgb':
      if (rgb.a !== undefined && rgb.a < 1) {
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
      }
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case 'hsl': {
      const hsl = rgbToHsl(rgb);
      if (hsl.a !== undefined && hsl.a < 1) {
        return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`;
      }
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    case 'hsv': {
      const hsv = rgbToHsv(rgb);
      const a = hsv.a !== undefined && hsv.a < 1 ? `, ${hsv.a}` : '';
      return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%${a})`;
    }
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

// Convenience: accept any color input and return RGB object
function _toRgb(color) {
  return typeof color === 'string' ? parse(color) : color;
}
