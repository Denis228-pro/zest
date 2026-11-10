import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, existsSync } from 'fs';

const res = 'android/app/src/main/res';
if (!existsSync(res)) {
  console.error('android res folder not found — run npx cap add android first');
  process.exit(1);
}

const GRAD = `<defs>
    <radialGradient id="g" cx="0.32" cy="0.28" r="0.95">
      <stop offset="0" stop-color="#FFB13D"/>
      <stop offset="0.55" stop-color="#FF7A00"/>
      <stop offset="1" stop-color="#EF5300"/>
    </radialGradient>
    <clipPath id="c"><circle cx="256" cy="256" r="256"/></clipPath>
  </defs>`;
const Z = `<path d="M112 128 H400 L240 312 H400 V384 H112 L272 200 H112 Z" fill="#FFFFFF"/>`;

const square = size =>
  `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    ${GRAD}
    <rect width="512" height="512" fill="url(#g)"/>
    <g transform="translate(48 0) skewX(-12)">${Z}</g>
  </svg>`;

const round = size =>
  `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    ${GRAD}
    <g clip-path="url(#c)">
      <rect width="512" height="512" fill="url(#g)"/>
      <g transform="translate(48 0) skewX(-12)">${Z}</g>
    </g>
  </svg>`;

const fgShift = 0.2126 * 256;
const foreground = size => {
  const s = (0.5 * size) / 256;
  const tx = size / 2 - 256 * s + fgShift * s;
  const ty = size / 2 - 256 * s;
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${tx} ${ty}) skewX(-12) scale(${s})">${Z}</g>
  </svg>`;
};

const background = size =>
  `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    ${GRAD}
    <rect width="512" height="512" fill="url(#g)"/>
  </svg>`;

const launchers = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const layers = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

function render(name, svg) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: 512 } });
  writeFileSync(name, r.render().asPng());
  console.log('ok', name);
}

for (const [dir, size] of Object.entries(launchers)) {
  mkdir(`${res}/${dir}`);
  render(`${res}/${dir}/ic_launcher.png`, square(size));
  render(`${res}/${dir}/ic_launcher_round.png`, round(size));
}
for (const [dir, size] of Object.entries(layers)) {
  mkdir(`${res}/${dir}`);
  render(`${res}/${dir}/ic_launcher_foreground.png`, foreground(size));
  render(`${res}/${dir}/ic_launcher_background.png`, background(size));
}

function mkdir(d) {
  writeFileSync(d + '/.keep', '');
}
console.log('done');
