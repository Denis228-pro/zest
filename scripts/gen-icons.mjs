import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

const zPath = (s, tx, ty) =>
  `<g transform="translate(${tx} ${ty}) skewX(-12) scale(${s})">
    <path d="M14 16 H50 L30 39 H50 V48 H14 L34 25 H14 Z" fill="#FFFFFF"/>
  </g>`;

const grad = `
  <defs>
    <radialGradient id="zg" cx="0.32" cy="0.28" r="0.95">
      <stop offset="0" stop-color="#FFB13D"/>
      <stop offset="0.55" stop-color="#FF7A00"/>
      <stop offset="1" stop-color="#EF5300"/>
    </radialGradient>
  </defs>`;

const squareIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  ${grad}
  <rect width="512" height="512" fill="url(#zg)"/>
  ${zPath(8, 48, 0)}
</svg>`;

const maskableIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  ${grad}
  <rect width="512" height="512" fill="url(#zg)"/>
  ${zPath(6.4, 102, 40)}
</svg>`;

function render(name, svg, width) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
  writeFileSync(name, r.render().asPng());
  console.log('ok', name);
}

render('public/icons/icon-192.png', squareIcon, 192);
render('public/icons/icon-512.png', squareIcon, 512);
render('public/icons/maskable-512.png', maskableIcon, 512);
render('public/apple-touch-icon.png', squareIcon, 180);
console.log('done');
