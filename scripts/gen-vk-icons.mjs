import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'fs';

mkdirSync('vk/icons', { recursive: true });

const grad = `<defs>
    <radialGradient id="g" cx="0.32" cy="0.28" r="0.95">
      <stop offset="0" stop-color="#FFB13D"/>
      <stop offset="0.55" stop-color="#FF7A00"/>
      <stop offset="1" stop-color="#EF5300"/>
    </radialGradient>
  </defs>`;
const z = `<g transform="translate(48 0) skewX(-12)">
    <path d="M112 128 H400 L240 312 H400 V384 H112 L272 200 H112 Z" fill="#FFFFFF"/>
  </g>`;

const icon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  ${grad}
  <rect width="512" height="512" fill="url(#g)"/>
  ${z}
</svg>`;

function render(name, width) {
  const r = new Resvg(icon, { fitTo: { mode: 'width', value: width } });
  writeFileSync(name, r.render().asPng());
  console.log('ok', name);
}

render('vk/icons/icon-576.png', 576);
render('vk/icons/icon-278.png', 278);
render('vk/icons/icon-150.png', 150);
console.log('done');
