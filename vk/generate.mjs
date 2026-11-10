import resvgMod from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';

const { Resvg } = resvgMod;
const fontFiles = readdirSync('vk/fonts').filter(f => f.endsWith('.ttf')).map(f => `vk/fonts/${f}`);

mkdirSync('vk/png', { recursive: true });
mkdirSync('vk/tiles', { recursive: true });
mkdirSync('vk/products', { recursive: true });

function render(outName, svg, width) {
  const r = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Golos Text' },
  });
  writeFileSync(outName, r.render().asPng());
  console.log('ok', outName);
}

render('vk/png/logo-avatar.png', readFileSync('vk/logo-avatar.svg', 'utf8'), 1024);

const NAVY = '#1A2B5E';
const ACCENT = '#FF6A00';

function lid(cx, topY, w) {
  return `
  <ellipse cx="${cx}" cy="${topY}" rx="${w * 0.5}" ry="${w * 0.075}" fill="#E9E9EE"/>
  <ellipse cx="${cx}" cy="${topY}" rx="${w * 0.38}" ry="${w * 0.05}" fill="#C7C7CF"/>
  <rect x="${cx - w * 0.11}" y="${topY - w * 0.028}" width="${w * 0.22}" height="${w * 0.056}" rx="${w * 0.028}" fill="#A6A6AF"/>`;
}

function blackBodyGrad(gid) {
  return `<linearGradient id="b${gid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3A3A40"/>
      <stop offset="0.12" stop-color="#101013"/>
      <stop offset="0.5" stop-color="#0A0A0C"/>
      <stop offset="0.88" stop-color="#101013"/>
      <stop offset="1" stop-color="#3A3A40"/>
    </linearGradient>`;
}

function adrenalineCan(cx, topY, w, gid, dark) {
  const h = 3.4 * w;
  const x = cx - w / 2;
  return `
  <g>
    <defs>${blackBodyGrad(gid)}</defs>
    <rect x="${x}" y="${topY}" width="${w}" height="${h}" rx="${w * 0.1}" fill="url(#b${gid})" stroke="#FFFFFF" stroke-opacity="${dark ? 0.14 : 0}" stroke-width="1.5"/>
    ${lid(cx, topY, w)}
    <text x="${cx}" y="${topY + h * 0.058}" text-anchor="middle" font-family="Golos Text" font-weight="700" font-size="${w * 0.065}" letter-spacing="0.5" fill="#D9A93C">АБСОЛЮТНАЯ ЭНЕРГИЯ</text>
    <text x="${cx}" y="${topY + h * 0.315}" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="${w * 0.6}" fill="#D9A93C">A</text>
    <path d="M ${cx - w * 0.32} ${topY + h * 0.348} Q ${cx} ${topY + h * 0.378} ${cx + w * 0.3} ${topY + h * 0.325}" stroke="#D9A93C" stroke-width="${w * 0.028}" fill="none" stroke-linecap="round"/>
    <g transform="translate(${cx} ${topY + h * 0.472}) skewX(-8)">
      <text x="0" y="0" text-anchor="middle" font-family="Unbounded" font-weight="700" font-size="${w * 0.155}" fill="#FFFFFF">Adrenaline</text>
    </g>
    <text x="${cx}" y="${topY + h * 0.558}" text-anchor="middle" font-family="Unbounded" font-weight="800" font-size="${w * 0.2}" letter-spacing="4" fill="#E7C25C">RUSH</text>
    <text x="${cx}" y="${topY + h * 0.878}" text-anchor="middle" font-family="Golos Text" font-weight="600" font-size="${w * 0.075}" letter-spacing="2" fill="#FFFFFF" fill-opacity="0.85">ВСЕ ТЫ МОЖЕШЬ</text>
    <rect x="${x}" y="${topY + h * 0.955}" width="${w}" height="${h * 0.045}" fill="#C7C7CF"/>
  </g>`;
}

function gorillaCan(cx, topY, w, gid, dark) {
  const h = 2.55 * w;
  const x = cx - w / 2;
  const fy = topY + h * 0.07;
  const fs = w / 150;
  return `
  <g>
    <defs>${blackBodyGrad(gid)}</defs>
    <rect x="${x}" y="${topY}" width="${w}" height="${h}" rx="${w * 0.1}" fill="url(#b${gid})" stroke="#FFFFFF" stroke-opacity="${dark ? 0.14 : 0}" stroke-width="1.5"/>
    ${lid(cx, topY, w)}
    <g transform="translate(${cx - w * 0.5} ${fy}) scale(${fs})">
      <polygon points="82,4 115,10 135,30 129,58 139,84 119,108 91,120 47,120 21,106 11,80 17,52 25,26 51,10" fill="#A4D233"/>
      <polygon points="40,118 50,106 60,118 70,106 80,118 90,106 100,118 110,118 110,128 40,128" fill="#FFFFFF"/>
      <path d="M55 46 L69 40 L73 54 L59 60 Z" fill="#0A0A0C"/>
      <path d="M95 46 L81 40 L77 54 L91 60 Z" fill="#0A0A0C"/>
    </g>
    <text x="${cx}" y="${topY + h * 0.68}" text-anchor="middle" font-family="Unbounded" font-weight="800" font-size="${w * 0.185}" letter-spacing="1" fill="#FFFFFF">GORILLA</text>
    <text x="${cx}" y="${topY + h * 0.765}" text-anchor="middle" font-family="Golos Text" font-weight="700" font-size="${w * 0.082}" letter-spacing="2" fill="#FFFFFF" fill-opacity="0.8">ENERGY DRINK</text>
    <rect x="${x}" y="${topY + h * 0.955}" width="${w}" height="${h * 0.045}" fill="#C7C7CF"/>
  </g>`;
}

function kadoCan(cx, topY, w, gid, dark) {
  const h = 3.39 * w;
  const x = cx - w / 2;
  const letters = ['K', 'A', 'D', 'O'];
  let letterTexts = '';
  letters.forEach((L, i) => {
    letterTexts += `<text x="${cx}" y="${topY + h * (0.545 + i * 0.115)}" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="${w * 0.3}" fill="#141414">${L}</text>\n`;
  });
  return `
  <g>
    <defs>
      <linearGradient id="pk${gid}" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0" stop-color="#F2ABD9"/>
        <stop offset="0.5" stop-color="#E23FA0"/>
        <stop offset="1" stop-color="#A90F66"/>
      </linearGradient>
    </defs>
    <rect x="${x}" y="${topY}" width="${w}" height="${h}" rx="${w * 0.1}" fill="#FAFAFC" stroke="#FFFFFF" stroke-opacity="${dark ? 0.14 : 0}" stroke-width="1.5"/>
    <rect x="${x}" y="${topY + h * 0.42}" width="${w}" height="${h * 0.58}" rx="${w * 0.1}" fill="url(#pk${gid})"/>
    <rect x="${x}" y="${topY + h * 0.42}" width="${w}" height="${h * 0.58 - w * 0.1}" fill="url(#pk${gid})"/>
    <rect x="${x + w * 0.05}" y="${topY + h * 0.05}" width="${w * 0.055}" height="${h * 0.9}" rx="${w * 0.027}" fill="#FFFFFF" opacity="0.3"/>
    ${lid(cx, topY, w)}
    <text x="${cx}" y="${topY + h * 0.078}" text-anchor="middle" font-family="Golos Text" font-weight="800" font-size="${w * 0.1}" letter-spacing="1.5" fill="#141414">DREAM VIBES</text>
    <line x1="${cx - w * 0.19}" y1="${topY + h * 0.14}" x2="${cx + w * 0.19}" y2="${topY + h * 0.365}" stroke="#E23FA0" stroke-width="${w * 0.13}"/>
    <line x1="${cx + w * 0.19}" y1="${topY + h * 0.14}" x2="${cx - w * 0.19}" y2="${topY + h * 0.365}" stroke="#E23FA0" stroke-width="${w * 0.13}"/>
    <text x="${cx - w * 0.22}" y="${topY + h * 0.262}" text-anchor="end" font-family="Golos Text" font-weight="700" font-size="${w * 0.05}" fill="#141414">VITAMINS</text>
    <text x="${cx + w * 0.22}" y="${topY + h * 0.262}" text-anchor="start" font-family="Golos Text" font-weight="700" font-size="${w * 0.05}" fill="#141414">ENERGY</text>
    ${letterTexts}
    <rect x="${x}" y="${topY + h * 0.945}" width="${w}" height="${h * 0.055}" rx="${w * 0.05}" fill="#D9D9DE"/>
  </g>`;
}

const MARK = `
    <radialGradient id="zg" cx="0.32" cy="0.28" r="0.95">
      <stop offset="0" stop-color="#FFB13D"/>
      <stop offset="0.55" stop-color="#FF7A00"/>
      <stop offset="1" stop-color="#EF5300"/>
    </radialGradient>`;
const MARK_G = `
    <g id="mark">
      <circle cx="32" cy="32" r="30" fill="url(#zg)"/>
      <g transform="translate(4 0) skewX(-12)">
        <path d="M14 16 H50 L30 39 H50 V48 H14 L34 25 H14 Z" fill="#FFFFFF"/>
        <path d="M35 16 H39 L31 25 H27 Z" fill="#E84E00"/>
        <path d="M33 39 H37 L29 48 H25 Z" fill="#E84E00"/>
      </g>
    </g>`;

const coverDesktop = `<svg width="1920" height="768" viewBox="0 0 1920 768" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${MARK}
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FF6A00" stop-opacity="0.5"/>
      <stop offset="0.7" stop-color="#FF6A00" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#FF6A00" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="aur" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFC728"/>
      <stop offset="0.6" stop-color="#FF6A00"/>
      <stop offset="1" stop-color="#FF8F3E"/>
    </linearGradient>
    ${MARK_G}
  </defs>

  <rect width="1920" height="768" fill="#0F0F13"/>
  <ellipse cx="420" cy="740" rx="980" ry="560" fill="url(#glow)"/>
  <path d="M-140 600 C 480 430, 1120 300, 2060 150" stroke="url(#aur)" stroke-width="34" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M-140 668 C 540 500, 1180 342, 2060 212" stroke="#FFC728" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.4"/>
  <path d="M-100 520 C 460 372, 1020 250, 2060 92" stroke="#FF6A00" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.35"/>

  <g fill="#FFFFFF">
    <path transform="translate(1240 110)" d="M0 -16 L4.5 -4.5 L16 0 L4.5 4.5 L0 16 L-4.5 4.5 L-16 0 L-4.5 -4.5 Z" opacity="0.8"/>
    <path transform="translate(1622 196)" d="M0 -11 L3 -3 L11 0 L3 3 L0 11 L-3 3 L-11 0 L-3 -3 Z" opacity="0.55"/>
    <path transform="translate(1770 86)" d="M0 -18 L5 -5 L18 0 L5 5 L0 18 L-5 5 L-18 0 L-5 -5 Z" opacity="0.9"/>
    <path transform="translate(1462 318)" d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5 Z" opacity="0.45"/>
    <path transform="translate(1080 220)" d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" opacity="0.4"/>
  </g>

  <ellipse cx="1720" cy="640" rx="280" ry="280" fill="url(#glow)"/>
  <circle cx="1720" cy="640" r="200" stroke="#FF6A00" stroke-width="28" fill="none" opacity="0.95"/>
  <circle cx="1848" cy="716" r="92" stroke="#FFC728" stroke-width="12" fill="none"/>
  <circle cx="1568" cy="700" r="44" stroke="#FFFFFF" stroke-width="10" fill="none" opacity="0.28"/>
  <g transform="rotate(-8 1720 640)">
    <path transform="translate(1625.7 541.6) scale(8.2)" d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="url(#zg)"/>
  </g>

  <use xlink:href="#mark" href="#mark" transform="translate(96 176) scale(3.5)"/>
  <text x="356" y="318" font-family="Unbounded" font-weight="900" font-size="132" letter-spacing="2" fill="#FFFFFF">ZeSt</text>
  <text x="362" y="388" font-family="Golos Text" font-weight="800" font-size="42" letter-spacing="10" fill="#FF8F3E">ЭНЕРГИЯ В ОДИН ТАП</text>

  <rect x="96" y="470" width="390" height="64" rx="32" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(120 486) scale(1.33)" fill="none" stroke="#FF8F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>
  </g>
  <text x="158" y="512" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">Доставка 40–60 минут</text>

  <rect x="510" y="470" width="245" height="64" rx="32" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(534 486) scale(1.33)" fill="none" stroke="#FF8F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/>
    <circle cx="12" cy="10" r="2.5"/>
  </g>
  <text x="572" y="512" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">Нарьян-Мар</text>

  <rect x="779" y="470" width="395" height="64" rx="32" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(803 486) scale(1.33)" fill="none" stroke="#FF8F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="2" width="12" height="20" rx="3"/>
    <path d="M10.5 19h3"/>
  </g>
  <text x="841" y="512" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">Мини-приложение в VK</text>

  <rect x="1198" y="470" width="320" height="64" rx="32" fill="#7C2AE8"/>
  <g transform="translate(1222 486) scale(1.33)" fill="none" stroke="#FFC728" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3l2.7 5.6 6.2.9-4.5 4.3 1.1 6.1L12 17l-5.5 2.9 1.1-6.1L3.1 9.5l6.2-.9L12 3z"/>
  </g>
  <text x="1260" y="512" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">ZeSt Club · −10%</text>

  <text x="96" y="712" font-family="Golos Text" font-weight="400" font-size="30" fill="#FFFFFF" fill-opacity="0.6">Магазин энергетиков и безалкогольных напитков · Нарьян-Мар · 10:00–23:00</text>
</svg>`;

writeFileSync('vk/cover-desktop.svg', coverDesktop);
render('vk/png/cover-desktop.png', coverDesktop, 1920);

const coverMobile = `<svg width="1196" height="600" viewBox="0 0 1196 600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${MARK}
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FF6A00" stop-opacity="0.5"/>
      <stop offset="0.7" stop-color="#FF6A00" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#FF6A00" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="aur" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFC728"/>
      <stop offset="0.6" stop-color="#FF6A00"/>
      <stop offset="1" stop-color="#FF8F3E"/>
    </linearGradient>
    ${MARK_G}
  </defs>

  <rect width="1196" height="600" fill="#0F0F13"/>
  <ellipse cx="280" cy="600" rx="700" ry="400" fill="url(#glow)"/>
  <path d="M-80 470 C 320 360, 700 260, 1260 130" stroke="url(#aur)" stroke-width="24" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M-80 530 C 360 410, 740 300, 1260 180" stroke="#FFC728" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.4"/>

  <g fill="#FFFFFF">
    <path transform="translate(760 90)" d="M0 -13 L3.5 -3.5 L13 0 L3.5 3.5 L0 13 L-3.5 3.5 L-13 0 L-3.5 -3.5 Z" opacity="0.75"/>
    <path transform="translate(560 200)" d="M0 -8 L2.2 -2.2 L8 0 L2.2 2.2 L0 8 L-2.2 2.2 L-8 0 L-2.2 -2.2 Z" opacity="0.45"/>
    <path transform="translate(1100 70)" d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z" opacity="0.85"/>
  </g>

  <ellipse cx="920" cy="470" rx="150" ry="150" fill="url(#glow)"/>
  <circle cx="920" cy="470" r="110" stroke="#FF6A00" stroke-width="16" fill="none" opacity="0.9"/>
  <circle cx="1118" cy="524" r="46" stroke="#FFC728" stroke-width="8" fill="none"/>
  <g transform="rotate(-8 920 470)">
    <path transform="translate(877.9 426.1) scale(3.66)" d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="url(#zg)"/>
  </g>

  <use xlink:href="#mark" href="#mark" transform="translate(64 96) scale(2.6)"/>
  <text x="250" y="196" font-family="Unbounded" font-weight="900" font-size="92" letter-spacing="1" fill="#FFFFFF">ZeSt</text>
  <text x="254" y="248" font-family="Golos Text" font-weight="800" font-size="26" letter-spacing="6" fill="#FF8F3E">ЭНЕРГИЯ В ОДИН ТАП</text>

  <rect x="64" y="300" width="330" height="54" rx="27" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(89 314) scale(1.08)" fill="none" stroke="#FF8F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>
  </g>
  <text x="127" y="336" font-family="Golos Text" font-weight="600" font-size="24" fill="#FFFFFF">Доставка 40–60 мин</text>

  <rect x="414" y="300" width="208" height="54" rx="27" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(432 314) scale(1.08)" fill="none" stroke="#FF8F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/>
    <circle cx="12" cy="10" r="2.5"/>
  </g>
  <text x="470" y="336" font-family="Golos Text" font-weight="600" font-size="24" fill="#FFFFFF">Нарьян-Мар</text>

  <text x="64" y="430" font-family="Golos Text" font-weight="600" font-size="26" fill="#FFFFFF" fill-opacity="0.85">Энергетики и безалкогольные напитки</text>
  <text x="64" y="468" font-family="Golos Text" font-weight="400" font-size="24" fill="#FFFFFF" fill-opacity="0.6">Ежедневно 10:00–23:00 · Мини-приложение внутри VK</text>
</svg>`;

writeFileSync('vk/cover-mobile.svg', coverMobile);
render('vk/png/cover-mobile.png', coverMobile, 1196);

const ICONS = {
  bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>',
  sparkle: '<path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z"/>',
  percent: '<path d="M5 19 19 5"/><circle cx="7.5" cy="7.5" r="2.4"/><circle cx="16.5" cy="16.5" r="2.4"/>',
  pin: '<path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  box: '<path d="M3 8h18v12H3z"/><path d="M3 8l2-4h14l2 4"/><path d="M12 12v8"/>',
  star: '<path d="M12 3l2.7 5.6 6.2.9-4.5 4.3 1.1 6.1L12 17l-5.5 2.9 1.1-6.1L3.1 9.5l6.2-.9L12 3z"/>',
  chat: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-6 4V6z"/>',
};

const TILES = [
  { name: 'tile-catalog', grad: ['#FF8A2B', '#EF5300'], title: 'КАТАЛОГ', sub: 'Доставка за 40–60 минут', icon: 'bolt', iconBg: '#000000', iconBgOp: 0.18, iconFg: '#FFFFFF', ring: '#FFFFFF', ringOp: 0.3, titleFill: '#FFFFFF', subFill: '#FFFFFF', subOp: 0.85 },
  { name: 'tile-new', grad: null, bg: '#FFF4EA', title: 'НОВИНКИ', sub: 'Свежий дроп вкусов', icon: 'sparkle', iconBg: '#FFE3CB', iconBgOp: 1, iconFg: '#FF6A00', ring: '#FF6A00', ringOp: 0.25, titleFill: '#141419', subFill: '#8A8378', subOp: 1 },
  { name: 'tile-club', grad: ['#7C2AE8', '#4A15A0'], title: 'ZeSt CLUB', sub: 'Кэшбэк 10% и закрытые дропы', icon: 'star', iconBg: '#FFFFFF', iconBgOp: 0.15, iconFg: '#FFC728', ring: '#FFFFFF', ringOp: 0.25, titleFill: '#FFFFFF', subFill: '#FFFFFF', subOp: 0.8 },
  { name: 'tile-promo', grad: null, bg: '#141419', title: 'АКЦИИ', sub: '2 по цене 1 каждую неделю', icon: 'percent', iconBg: '#FFC728', iconBgOp: 0.15, iconFg: '#FFC728', ring: '#FFC728', ringOp: 0.3, titleFill: '#FFFFFF', subFill: '#FFFFFF', subOp: 0.8 },
  { name: 'tile-delivery', grad: null, bg: '#FFF4EA', title: 'ДОСТАВКА', sub: 'Зоны, время и оплата VK Pay', icon: 'pin', iconBg: '#FFE3CB', iconBgOp: 1, iconFg: '#FF6A00', ring: '#FF6A00', ringOp: 0.25, titleFill: '#141419', subFill: '#8A8378', subOp: 1 },
  { name: 'tile-wholesale', grad: null, bg: '#1B1B21', title: 'ОПТ И ОФИСЫ', sub: 'Заказы для компаний города', icon: 'box', iconBg: '#FF6A00', iconBgOp: 0.15, iconFg: '#FF8F3E', ring: '#FF6A00', ringOp: 0.35, titleFill: '#FFFFFF', subFill: '#FFFFFF', subOp: 0.8 },
  { name: 'tile-reviews', grad: ['#FFA53D', '#FF6A00'], title: 'ОТЗЫВЫ', sub: 'Что говорят люди', icon: 'star', iconBg: '#000000', iconBgOp: 0.18, iconFg: '#FFFFFF', ring: '#FFFFFF', ringOp: 0.3, titleFill: '#FFFFFF', subFill: '#FFFFFF', subOp: 0.85 },
  { name: 'tile-support', grad: null, bg: '#FFF4EA', title: 'ПОДДЕРЖКА', sub: 'Ответим за 5 минут', icon: 'chat', iconBg: '#E9DEFF', iconBgOp: 1, iconFg: '#7C2AE8', ring: '#7C2AE8', ringOp: 0.25, titleFill: '#141419', subFill: '#8A8378', subOp: 1 },
];

function tileSvg(t) {
  const defs = t.grad
    ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.grad[0]}"/><stop offset="1" stop-color="${t.grad[1]}"/></linearGradient></defs>`
    : '';
  const bgFill = t.grad ? 'url(#bg)' : t.bg;
  return `<svg width="376" height="256" viewBox="0 0 376 256" xmlns="http://www.w3.org/2000/svg">
  ${defs}
  <rect width="376" height="256" fill="${bgFill}"/>
  <circle cx="334" cy="16" r="120" stroke="${t.ring}" stroke-opacity="${t.ringOp}" stroke-width="14" fill="none"/>
  <circle cx="36" cy="248" r="70" stroke="${t.ring}" stroke-opacity="${t.ringOp * 0.5}" stroke-width="8" fill="none"/>
  <rect x="28" y="28" width="60" height="60" rx="18" fill="${t.iconBg}" fill-opacity="${t.iconBgOp}"/>
  <g transform="translate(41 41) scale(1.42)" fill="none" stroke="${t.iconFg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[t.icon]}</g>
  <text x="30" y="152" font-family="Unbounded" font-weight="800" font-size="40" letter-spacing="1" fill="${t.titleFill}">${t.title}</text>
  <text x="30" y="202" font-family="Golos Text" font-weight="600" font-size="22" fill="${t.subFill}" fill-opacity="${t.subOp}">${t.sub}</text>
</svg>`;
}

for (const t of TILES) {
  const svg = tileSvg(t);
  writeFileSync(`vk/tiles/${t.name}.svg`, svg);
  render(`vk/png/${t.name}.png`, svg, 752);
}

const PRODUCTS = [
  {
    name: 'product-adrenaline',
    header: 'НАПИТОК',
    brand: 'Adrenaline RUSH',
    brandSize: 62,
    kind: 'энергетический',
    desc: ['Адреналин Раш —', 'твой мгновенный', 'заряд энергии!', 'Прогони усталость,', 'почувствуй мощный', 'импульс и', 'достигай большего.'],
    vol: '0.449 л',
    blob: '#F3E8D2',
    can: (gid) => adrenalineCan(310, 280, 228, gid, false),
  },
  {
    name: 'product-gorilla',
    header: 'НАПИТОК',
    brand: 'GORILLA ENERGY DRINK',
    brandSize: 48,
    kind: 'энергетический',
    desc: ['Почувствуй', 'силу дикой', 'природы! Даст', 'тебе дикий заряд', 'бодрости, чтобы', 'покорить любые', 'вершины и жить', 'полной, неудержимой', 'жизнью.'],
    vol: '0.45 л',
    blob: '#E9F3DC',
    can: (gid) => gorillaCan(300, 330, 250, gid, false),
  },
  {
    name: 'product-kado',
    header: 'НАПИТОК',
    brand: 'KADO Dream Vibes',
    brandSize: 54,
    kind: 'энергетический',
    desc: ['Яркий вкус,', 'витамины и', 'заряд энергии.', 'DREAM VIBES —', 'включай своё', 'настроение и', 'действуй.'],
    vol: '0.45 л',
    blob: '#FBE3F1',
    can: (gid) => kadoCan(310, 275, 228, gid, false),
  },
];

function productSvg(p) {
  const descLines = p.desc
    .map((l, i) => `<text x="520" y="${366 + i * 56}" font-family="Golos Text" font-weight="600" font-size="40" fill="${NAVY}">${l}</text>`)
    .join('\n  ');
  return `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>${blackBodyGrad('card')}</defs>
  <rect width="1200" height="1200" fill="#FFFFFF"/>
  <circle cx="320" cy="680" r="330" fill="${p.blob}"/>
  <circle cx="1128" cy="84" r="56" stroke="${ACCENT}" stroke-width="10" fill="none"/>
  <rect x="36" y="54" width="46" height="46" stroke="${ACCENT}" stroke-width="8" fill="none"/>
  <circle cx="44" cy="950" r="30" stroke="${NAVY}" stroke-width="8" fill="none"/>
  <rect x="36" y="1030" width="40" height="40" stroke="${NAVY}" stroke-width="8" fill="none"/>
  <path d="M1120 380 q24 28 -8 56 q-32 28 -6 56" stroke="${ACCENT}" stroke-width="9" fill="none" stroke-linecap="round"/>
  <text x="600" y="120" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="96" fill="${NAVY}">${p.header}</text>
  <text x="600" y="198" text-anchor="middle" font-family="Unbounded" font-weight="800" font-size="${p.brandSize}" fill="${ACCENT}">${p.brand}</text>
  <text x="600" y="252" text-anchor="middle" font-family="Golos Text" font-weight="700" font-size="42" fill="${NAVY}">${p.kind}</text>
  <ellipse cx="310" cy="${310 + 3.4 * 228 + 8}" rx="150" ry="22" fill="#000000" opacity="0.12"/>
  ${p.can('card')}
  ${descLines}
  <text x="1160" y="1074" text-anchor="end" font-family="Unbounded" font-weight="800" font-size="92" fill="${ACCENT}">${p.vol}</text>
  <rect x="1044" y="1108" width="124" height="62" rx="14" fill="#141414"/>
  <text x="1106" y="1152" text-anchor="middle" font-family="Unbounded" font-weight="800" font-size="38" fill="#FFFFFF">18+</text>
  <text x="48" y="1152" font-family="Golos Text" font-weight="700" font-size="30" fill="${NAVY}">ZeSt · Нарьян-Мар · доставка 40–60 минут</text>
</svg>`;
}

for (const p of PRODUCTS) {
  const svg = productSvg(p);
  writeFileSync(`vk/products/${p.name}.svg`, svg);
  render(`vk/png/${p.name}.png`, svg, 1200);
}

const clubCoverDesktop = `<svg width="1920" height="768" viewBox="0 0 1920 768" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${MARK}
    <radialGradient id="glowP" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#7C2AE8" stop-opacity="0.4"/>
      <stop offset="0.7" stop-color="#7C2AE8" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#7C2AE8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="aurP" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#C9B4FF"/>
      <stop offset="0.6" stop-color="#7C2AE8"/>
      <stop offset="1" stop-color="#5A18B8"/>
    </linearGradient>
    <linearGradient id="cardg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8A35F5"/>
      <stop offset="1" stop-color="#42129E"/>
    </linearGradient>
    <linearGradient id="goldg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFD84D"/>
      <stop offset="1" stop-color="#DFA612"/>
    </linearGradient>
    ${MARK_G}
  </defs>

  <rect width="1920" height="768" fill="#0D0A14"/>
  <ellipse cx="420" cy="740" rx="980" ry="560" fill="url(#glowP)"/>
  <path d="M-140 600 C 480 430, 1120 300, 2060 150" stroke="url(#aurP)" stroke-width="30" fill="none" stroke-linecap="round" opacity="0.45"/>
  <path d="M-140 668 C 540 500, 1180 342, 2060 212" stroke="#C9B4FF" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.3"/>

  <g fill="#FFFFFF">
    <path transform="translate(1240 110)" d="M0 -16 L4.5 -4.5 L16 0 L4.5 4.5 L0 16 L-4.5 4.5 L-16 0 L-4.5 -4.5 Z" opacity="0.8"/>
    <path transform="translate(1770 86)" d="M0 -18 L5 -5 L18 0 L5 5 L0 18 L-5 5 L-18 0 L-5 -5 Z" opacity="0.9"/>
    <path transform="translate(1330 190)" d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5 Z" opacity="0.45"/>
  </g>

  <ellipse cx="1648" cy="428" rx="320" ry="320" fill="url(#glowP)"/>
  <circle cx="1648" cy="428" r="245" stroke="#7C2AE8" stroke-width="26" fill="none" opacity="0.85"/>
  <circle cx="1866" cy="586" r="50" stroke="#FFC728" stroke-width="10" fill="none"/>
  <circle cx="1396" cy="244" r="38" stroke="#FFFFFF" stroke-width="9" fill="none" opacity="0.25"/>

  <g transform="translate(1418 283) rotate(-8 230 145)">
    <rect width="460" height="290" rx="32" fill="url(#cardg)" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5"/>
    <g transform="translate(290 54) scale(4.6)"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="#FFFFFF" opacity="0.1"/></g>
    <use xlink:href="#mark" href="#mark" transform="translate(32 32) scale(1.4)"/>
    <text x="138" y="88" font-family="Unbounded" font-weight="800" font-size="44" fill="#FFFFFF">ZeSt <tspan fill="#C9B4FF">CLUB</tspan></text>
    <text x="32" y="144" font-family="Golos Text" font-weight="700" font-size="17" letter-spacing="1" fill="#DCCBFF">БЕСПЛАТНАЯ ДОСТАВКА · КЭШБЭК 10%</text>
    <rect x="32" y="172" width="58" height="42" rx="8" fill="url(#goldg)"/>
    <path d="M32 186 h58 M50 172 v14" stroke="#B8860B" stroke-width="2" fill="none"/>
    <text x="104" y="202" font-family="Golos Text" font-weight="700" font-size="22" fill="#FFFFFF" fill-opacity="0.85">№ 0001 · НАРЬЯН-МАР</text>
    <text x="32" y="258" font-family="Unbounded" font-weight="700" font-size="24" letter-spacing="3" fill="#FFD84D">УЧАСТНИК КЛУБА</text>
    <g transform="translate(398 234) scale(1.4)" fill="none" stroke="#FFD84D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></g>
  </g>

  <use xlink:href="#mark" href="#mark" transform="translate(96 150) scale(3.5)"/>
  <text x="356" y="300" font-family="Unbounded" font-weight="900" font-size="110" fill="#FFFFFF">ZeSt <tspan fill="#A06BFF">CLUB</tspan></text>
  <text x="362" y="372" font-family="Golos Text" font-weight="800" font-size="34" letter-spacing="10" fill="#C9B4FF">ЭНЕРГИЯ БЕЗ ГРАНИЦ</text>

  <rect x="96" y="470" width="275" height="64" rx="32" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(120 486) scale(1.33)" fill="none" stroke="#C9B4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>
  </g>
  <text x="158" y="512" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">Доставка 0 ₽</text>

  <rect x="395" y="470" width="240" height="64" rx="32" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(419 486) scale(1.33)" fill="none" stroke="#C9B4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z"/>
  </g>
  <text x="457" y="512" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">Кэшбэк 10%</text>

  <rect x="659" y="470" width="300" height="64" rx="32" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(683 486) scale(1.33)" fill="none" stroke="#C9B4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
  </g>
  <text x="721" y="512" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">Закрытые дропы</text>

  <rect x="983" y="470" width="380" height="64" rx="32" fill="#7C2AE8"/>
  <g transform="translate(1011 486) scale(1.33)" fill="none" stroke="#FFD84D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>
  </g>
  <text x="1049" y="512" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">Вступить · 199 ₽/мес</text>

  <text x="96" y="712" font-family="Golos Text" font-weight="400" font-size="30" fill="#FFFFFF" fill-opacity="0.6">Оплата через VK Pay · автопродление · отмена в один тап</text>
</svg>`;

writeFileSync('vk/club-cover-desktop.svg', clubCoverDesktop);
render('vk/png/club-cover-desktop.png', clubCoverDesktop, 1920);

const clubCoverMobile = `<svg width="1196" height="600" viewBox="0 0 1196 600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${MARK}
    <radialGradient id="glowP" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#7C2AE8" stop-opacity="0.4"/>
      <stop offset="0.7" stop-color="#7C2AE8" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#7C2AE8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="aurP" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#C9B4FF"/>
      <stop offset="0.6" stop-color="#7C2AE8"/>
      <stop offset="1" stop-color="#5A18B8"/>
    </linearGradient>
    <linearGradient id="cardg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8A35F5"/>
      <stop offset="1" stop-color="#42129E"/>
    </linearGradient>
    <linearGradient id="goldg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFD84D"/>
      <stop offset="1" stop-color="#DFA612"/>
    </linearGradient>
    ${MARK_G}
  </defs>

  <rect width="1196" height="600" fill="#0D0A14"/>
  <ellipse cx="280" cy="600" rx="700" ry="400" fill="url(#glowP)"/>
  <path d="M-80 470 C 320 360, 700 260, 1260 130" stroke="url(#aurP)" stroke-width="22" fill="none" stroke-linecap="round" opacity="0.45"/>
  <path d="M-80 530 C 360 410, 740 300, 1260 180" stroke="#C9B4FF" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.3"/>

  <g fill="#FFFFFF">
    <path transform="translate(700 80)" d="M0 -12 L3.3 -3.3 L12 0 L3.3 3.3 L0 12 L-3.3 3.3 L-12 0 L-3.3 -3.3 Z" opacity="0.75"/>
    <path transform="translate(1090 66)" d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z" opacity="0.85"/>
  </g>

  <ellipse cx="990" cy="380" rx="190" ry="190" fill="url(#glowP)"/>
  <circle cx="990" cy="380" r="130" stroke="#7C2AE8" stroke-width="14" fill="none" opacity="0.9"/>
  <circle cx="1148" cy="508" r="34" stroke="#FFC728" stroke-width="7" fill="none"/>

  <g transform="translate(840 287) rotate(-8 150 92)">
    <rect width="300" height="185" rx="24" fill="url(#cardg)" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5"/>
    <g transform="translate(185 30) scale(3)"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="#FFFFFF" opacity="0.1"/></g>
    <use xlink:href="#mark" href="#mark" transform="translate(20 20) scale(0.95)"/>
    <text x="94" y="62" font-family="Unbounded" font-weight="800" font-size="30" fill="#FFFFFF">ZeSt <tspan fill="#C9B4FF">CLUB</tspan></text>
    <text x="24" y="112" font-family="Golos Text" font-weight="700" font-size="13" letter-spacing="0.5" fill="#DCCBFF">ДОСТАВКА 0 ₽ · КЭШБЭК 10%</text>
    <rect x="24" y="126" width="44" height="32" rx="6" fill="url(#goldg)"/>
    <text x="82" y="149" font-family="Golos Text" font-weight="700" font-size="17" fill="#FFFFFF" fill-opacity="0.85">№ 0001 · НМ</text>
    <text x="24" y="176" font-family="Unbounded" font-weight="700" font-size="14" letter-spacing="2" fill="#FFD84D">УЧАСТНИК КЛУБА</text>
  </g>

  <use xlink:href="#mark" href="#mark" transform="translate(64 96) scale(2.6)"/>
  <text x="250" y="196" font-family="Unbounded" font-weight="900" font-size="76" fill="#FFFFFF">ZeSt <tspan fill="#A06BFF">CLUB</tspan></text>
  <text x="254" y="252" font-family="Golos Text" font-weight="800" font-size="24" letter-spacing="5" fill="#C9B4FF">ЭНЕРГИЯ БЕЗ ГРАНИЦ</text>

  <rect x="64" y="300" width="240" height="54" rx="27" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(85 314) scale(1.08)" fill="none" stroke="#C9B4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>
  </g>
  <text x="121" y="336" font-family="Golos Text" font-weight="600" font-size="24" fill="#FFFFFF">Доставка 0 ₽</text>

  <rect x="324" y="300" width="215" height="54" rx="27" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(346 314) scale(1.08)" fill="none" stroke="#C9B4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z"/>
  </g>
  <text x="382" y="336" font-family="Golos Text" font-weight="600" font-size="24" fill="#FFFFFF">Кэшбэк 10%</text>

  <rect x="559" y="300" width="205" height="54" rx="27" fill="#7C2AE8"/>
  <g transform="translate(583 314) scale(1.08)" fill="none" stroke="#FFD84D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>
  </g>
  <text x="619" y="336" font-family="Golos Text" font-weight="600" font-size="24" fill="#FFFFFF">199 ₽/мес</text>

  <text x="64" y="430" font-family="Golos Text" font-weight="600" font-size="26" fill="#FFFFFF" fill-opacity="0.85">ZeSt Club — подписка для своих</text>
  <text x="64" y="468" font-family="Golos Text" font-weight="400" font-size="24" fill="#FFFFFF" fill-opacity="0.6">199 ₽/мес · год со скидкой 33% · отмена в один тап</text>
</svg>`;

writeFileSync('vk/club-cover-mobile.svg', clubCoverMobile);
render('vk/png/club-cover-mobile.png', clubCoverMobile, 1196);

function scooter() {
  return `
  <g>
    <ellipse cx="210" cy="240" rx="180" ry="15" fill="#000000" opacity="0.35"/>
    <rect x="26" y="62" width="112" height="82" rx="16" fill="#FFFFFF"/>
    <rect x="26" y="62" width="112" height="20" rx="10" fill="#FF6A00"/>
    <g transform="translate(66 88) scale(0.5)">
      <path d="M14 16 H50 L30 39 H50 V48 H14 L34 25 H14 Z" fill="#E84E00"/>
    </g>
    <path d="M310 166 L344 96" stroke="#FF7A1A" stroke-width="16" stroke-linecap="round"/>
    <rect x="298" y="158" width="50" height="28" rx="13" fill="#FF6A00"/>
    <path d="M322 90 H366" stroke="#141419" stroke-width="10" stroke-linecap="round"/>
    <circle cx="366" cy="100" r="9" fill="#FFC728"/>
    <rect x="70" y="152" width="270" height="30" rx="15" fill="#FF6A00"/>
    <rect x="150" y="124" width="80" height="32" rx="15" fill="#141419"/>
    <circle cx="120" cy="192" r="38" fill="#141419"/>
    <circle cx="120" cy="192" r="14" fill="#C7C7CF"/>
    <circle cx="120" cy="192" r="5" fill="#E9E9EE"/>
    <circle cx="322" cy="192" r="38" fill="#141419"/>
    <circle cx="322" cy="192" r="14" fill="#C7C7CF"/>
    <circle cx="322" cy="192" r="5" fill="#E9E9EE"/>
  </g>`;
}

const deliveryCoverDesktop = `<svg width="1920" height="768" viewBox="0 0 1920 768" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${MARK}
    <radialGradient id="glowD" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FF6A00" stop-opacity="0.5"/>
      <stop offset="0.7" stop-color="#FF6A00" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#FF6A00" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="aurD" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFC728"/>
      <stop offset="0.6" stop-color="#FF6A00"/>
      <stop offset="1" stop-color="#FF8F3E"/>
    </linearGradient>
    ${MARK_G}
  </defs>

  <rect width="1920" height="768" fill="#0F0F13"/>
  <ellipse cx="420" cy="740" rx="980" ry="560" fill="url(#glowD)"/>
  <path d="M-140 600 C 480 430, 1120 300, 2060 150" stroke="url(#aurD)" stroke-width="30" fill="none" stroke-linecap="round" opacity="0.45"/>
  <path d="M-140 668 C 540 500, 1180 342, 2060 212" stroke="#FFC728" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.35"/>

  <g fill="#FFFFFF">
    <path transform="translate(1240 110)" d="M0 -16 L4.5 -4.5 L16 0 L4.5 4.5 L0 16 L-4.5 4.5 L-16 0 L-4.5 -4.5 Z" opacity="0.8"/>
    <path transform="translate(1560 250)" d="M0 -11 L3 -3 L11 0 L3 3 L0 11 L-3 3 L-11 0 L-3 -3 Z" opacity="0.55"/>
    <path transform="translate(1820 130)" d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z" opacity="0.9"/>
  </g>

  <circle cx="1580" cy="420" r="220" stroke="#FF6A00" stroke-width="24" fill="none" opacity="0.8"/>
  <circle cx="1866" cy="620" r="56" stroke="#FFC728" stroke-width="10" fill="none"/>
  <circle cx="1420" cy="212" r="34" stroke="#FFFFFF" stroke-width="9" fill="none" opacity="0.25"/>

  <g stroke-linecap="round">
    <path d="M1170 300 H 1330" stroke="#FF6A00" stroke-width="10" opacity="0.5"/>
    <path d="M1140 350 H 1268" stroke="#FFFFFF" stroke-width="6" opacity="0.3"/>
    <path d="M1210 402 H 1380" stroke="#FFC728" stroke-width="8" opacity="0.4"/>
  </g>
  <ellipse cx="1672" cy="462" rx="210" ry="20" fill="#000000" opacity="0.35"/>
  <g transform="translate(1460 186) scale(1.05) rotate(-3 190 120)">
    ${scooter()}
  </g>

  <use xlink:href="#mark" href="#mark" transform="translate(96 108) scale(3)"/>
  <text x="356" y="262" font-family="Unbounded" font-weight="900" font-size="104" letter-spacing="2" fill="#FFFFFF">ДОСТАВКА</text>
  <text x="362" y="332" font-family="Golos Text" font-weight="800" font-size="36" letter-spacing="6" fill="#FF8F3E">40–60 МИНУТ ПО НАРЬЯН-МАРУ</text>

  <rect x="96" y="430" width="430" height="64" rx="32" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(120 446) scale(1.33)" fill="none" stroke="#FF8F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>
  </g>
  <text x="158" y="472" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">0 ₽ от 700 ₽ · Club — всегда</text>

  <rect x="550" y="430" width="240" height="64" rx="32" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(574 446) scale(1.33)" fill="none" stroke="#FF8F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="3"/>
    <path d="M2 10h20"/>
  </g>
  <text x="614" y="472" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">Оплата VK Pay</text>

  <rect x="814" y="430" width="240" height="64" rx="32" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(838 446) scale(1.33)" fill="none" stroke="#FF8F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="8.5"/>
    <path d="M12 7v5l3 2"/>
  </g>
  <text x="886" y="472" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">10:00–23:00</text>

  <rect x="1078" y="430" width="380" height="64" rx="32" fill="#7C2AE8"/>
  <g transform="translate(1102 446) scale(1.33)" fill="none" stroke="#FFD84D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>
  </g>
  <text x="1150" y="472" font-family="Golos Text" font-weight="600" font-size="28" fill="#FFFFFF">Заказ за 3 касания</text>

  <text x="96" y="712" font-family="Golos Text" font-weight="400" font-size="30" fill="#FFFFFF" fill-opacity="0.6">Доставляем энергетики, воду и лимонады · Нарьян-Мар · ежедневно 10:00–23:00</text>
</svg>`;

writeFileSync('vk/delivery-cover-desktop.svg', deliveryCoverDesktop);
render('vk/png/delivery-cover-desktop.png', deliveryCoverDesktop, 1920);

const deliveryCoverMobile = `<svg width="1196" height="600" viewBox="0 0 1196 600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${MARK}
    <radialGradient id="glowD" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FF6A00" stop-opacity="0.5"/>
      <stop offset="0.7" stop-color="#FF6A00" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#FF6A00" stop-opacity="0"/>
    </radialGradient>
    ${MARK_G}
  </defs>

  <rect width="1196" height="600" fill="#0F0F13"/>
  <ellipse cx="280" cy="600" rx="700" ry="400" fill="url(#glowD)"/>
  <path d="M-80 470 C 320 360, 700 260, 1260 130" stroke="#FFC728" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.4"/>

  <g fill="#FFFFFF">
    <path transform="translate(700 84)" d="M0 -12 L3.3 -3.3 L12 0 L3.3 3.3 L0 12 L-3.3 3.3 L-12 0 L-3.3 -3.3 Z" opacity="0.75"/>
    <path transform="translate(1080 66)" d="M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4 Z" opacity="0.85"/>
  </g>

  <circle cx="1000" cy="310" r="150" stroke="#FF6A00" stroke-width="16" fill="none" opacity="0.8"/>
  <circle cx="864" cy="176" r="26" stroke="#FFFFFF" stroke-width="7" fill="none" opacity="0.25"/>

  <g stroke-linecap="round">
    <path d="M700 260 H 826" stroke="#FF6A00" stroke-width="8" opacity="0.5"/>
    <path d="M668 308 H 780" stroke="#FFFFFF" stroke-width="5" opacity="0.3"/>
  </g>
  <ellipse cx="1032" cy="382" rx="160" ry="15" fill="#000000" opacity="0.35"/>
  <g transform="translate(880 172) scale(0.78) rotate(-4 190 120)">
    ${scooter()}
  </g>

  <use xlink:href="#mark" href="#mark" transform="translate(64 80) scale(2.2)"/>
  <text x="228" y="178" font-family="Unbounded" font-weight="900" font-size="72" letter-spacing="1" fill="#FFFFFF">ДОСТАВКА</text>
  <text x="232" y="228" font-family="Golos Text" font-weight="800" font-size="24" letter-spacing="4" fill="#FF8F3E">40–60 МИНУТ ПО ГОРОДУ</text>

  <rect x="64" y="280" width="220" height="54" rx="27" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(84 294) scale(1.08)" fill="none" stroke="#FF8F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>
  </g>
  <text x="120" y="316" font-family="Golos Text" font-weight="600" font-size="24" fill="#FFFFFF">0 ₽ от 700 ₽</text>

  <rect x="304" y="280" width="170" height="54" rx="27" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(324 294) scale(1.08)" fill="none" stroke="#FF8F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="3"/>
    <path d="M2 10h20"/>
  </g>
  <text x="360" y="316" font-family="Golos Text" font-weight="600" font-size="24" fill="#FFFFFF">VK Pay</text>

  <rect x="494" y="280" width="210" height="54" rx="27" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(514 294) scale(1.08)" fill="none" stroke="#FF8F3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="8.5"/>
    <path d="M12 7v5l3 2"/>
  </g>
  <text x="550" y="316" font-family="Golos Text" font-weight="600" font-size="24" fill="#FFFFFF">10:00–23:00</text>

  <text x="64" y="430" font-family="Golos Text" font-weight="600" font-size="26" fill="#FFFFFF" fill-opacity="0.85">Доставляем по всему Нарьян-Мару</text>
  <text x="64" y="468" font-family="Golos Text" font-weight="400" font-size="24" fill="#FFFFFF" fill-opacity="0.6">Заказ за 3 касания в мини-приложении · 0 ₽ от 700 ₽</text>
</svg>`;

writeFileSync('vk/delivery-cover-mobile.svg', deliveryCoverMobile);
render('vk/png/delivery-cover-mobile.png', deliveryCoverMobile, 1196);

console.log('done');
