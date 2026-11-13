/* AJWA — izometrik 3B oda maketi (Three.js, yalnız maketi olan oda sayfasında yüklenir).
   Kullanım: (await import('./iso.js')).kur(el, odaId, dil) → { kapat() }
   Yerleşim odanın kendi fotoğraflarından çıkarıldı; ölçüler temsilîdir (m).
   Kesik maket: kameraya uzak dış duvarlar tam boy, kameraya yakın olanlar alçak kesik;
   oda döndükçe duvarlar kendiliğinden yükselip alçalır. */
// jsDelivr ESM: GLTFLoader ile aynı three örneğini paylaşır
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';

/* ---------- tuval dokuları ---------- */
let DOKU = [];
function doku(w, h, ciz, tekrar) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  ciz(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (tekrar) t.repeat.set(...tekrar);
  DOKU.push(t); return t;
}
let tohum = 7; const rnd = () => ((tohum = (tohum * 9301 + 49297) % 233280) / 233280);
const TAM = Math.PI * 2;

function cevizCiz(g, w, h, L) {
  g.fillStyle = `hsl(22,44%,${L}%)`; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 80; i++) {
    const x = rnd() * w; g.strokeStyle = `rgba(${rnd() < .6 ? '22,9,2' : '150,92,48'},${.07 + rnd() * .14})`; g.lineWidth = .5 + rnd() * 2.6;
    g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + (rnd() - .5) * 34, h * .33, x + (rnd() - .5) * 34, h * .66, x, h); g.stroke();
  }
}
const ceviz = (L = 24, tekrar) => doku(256, 512, (g, w, h) => cevizCiz(g, w, h, L), tekrar);

// koyu ceviz parke, tahtalar pencereye doğru uzanır
const parke = () => doku(512, 512, (g, w, h) => {
  const sut = 8, en = w / sut;
  for (let i = 0; i < sut; i++) {
    let y = -rnd() * 300;
    while (y < h) {
      const l = 200 + rnd() * 260;
      g.fillStyle = `hsl(${19 + rnd() * 6},${42 + rnd() * 12}%,${17 + rnd() * 9}%)`; g.fillRect(i * en, y, en, l);
      for (let k = 0; k < 8; k++) {
        g.strokeStyle = `rgba(${rnd() < .55 ? '20,8,2' : '130,76,38'},${.1 + rnd() * .16})`; g.lineWidth = .6 + rnd() * 1.6;
        const xx = i * en + 4 + rnd() * (en - 8); g.beginPath(); g.moveTo(xx, y);
        g.bezierCurveTo(xx + (rnd() - .5) * 10, y + l * .33, xx + (rnd() - .5) * 10, y + l * .66, xx + (rnd() - .5) * 6, y + l); g.stroke();
      }
      g.fillStyle = 'rgba(8,3,0,.75)'; g.fillRect(i * en, y, en, 2); g.fillRect(i * en, y, 1.5, l);
      y += l;
    }
  }
});

// krem-altın şam desenli duvar kâğıdı (yarım kaydırmalı madalyon)
const sam = () => doku(256, 320, (g, w, h) => {
  g.fillStyle = '#e8dcc5'; g.fillRect(0, 0, w, h);
  const motif = (cx, cy, s) => {
    g.save(); g.translate(cx, cy); g.scale(s, s);
    for (const yon of [1, -1]) {
      g.save(); g.scale(yon, 1);
      g.beginPath(); g.moveTo(0, -80); g.bezierCurveTo(16, -64, 30, -46, 16, -28); g.bezierCurveTo(46, -44, 66, -12, 44, 6);
      g.bezierCurveTo(66, 22, 54, 52, 26, 44); g.bezierCurveTo(30, 62, 14, 76, 0, 84); g.closePath();
      g.fillStyle = 'rgba(246,236,214,.85)'; g.fill(); g.strokeStyle = 'rgba(176,146,98,.42)'; g.lineWidth = 1.6; g.stroke();
      g.beginPath(); g.moveTo(6, -44); g.bezierCurveTo(32, -32, 34, 12, 8, 22); g.moveTo(10, 30); g.bezierCurveTo(30, 34, 36, 46, 22, 52); g.stroke();
      g.beginPath(); g.moveTo(40, -70); g.bezierCurveTo(70, -80, 84, -50, 70, -36); g.bezierCurveTo(90, -40, 100, -20, 92, -8); g.strokeStyle = 'rgba(150,118,74,.26)'; g.stroke();
      g.restore();
    }
    g.beginPath(); g.ellipse(0, 6, 8, 22, 0, 0, TAM); g.fillStyle = 'rgba(176,141,87,.28)'; g.fill();
    g.beginPath(); g.ellipse(0, -52, 5, 10, 0, 0, TAM); g.fill();
    g.restore();
  };
  for (const [x, y] of [[0, 0], [256, 0], [0, 320], [256, 320], [128, 160]]) motif(x, y, 1.32);
});

const tul = () => doku(64, 64, (g, w, h) => {
  g.fillStyle = '#f2ebde'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 4) { g.fillStyle = `rgba(255,255,255,${.12 + rnd() * .22})`; g.fillRect(x, 0, 2, h); }
}, [26, 1]);
// tül kıvrımları: geometrideki her dalgaya bir açık/koyu bant (u ekseni perdeyi soldan sağa geçer)
const tulKat = (kat) => doku(128, 8, (g, w, h) => {
  for (let x = 0; x < w; x++) { const a = Math.sin(x / w * TAM), v = Math.round(226 + a * 28); g.fillStyle = `rgb(${v},${v - 3},${v - 9})`; g.fillRect(x, 0, 1, h); }
  for (let x = 0; x < w; x += 3) { g.fillStyle = `rgba(255,255,255,${.06 + rnd() * .08})`; g.fillRect(x, 0, 1, h); }
}, [kat, 1]);
const kumas = (renk) => doku(64, 64, (g, w, h) => {
  g.fillStyle = renk; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 2) { g.fillStyle = `rgba(${rnd() < .5 ? '255,255,255' : '0,0,0'},${rnd() * .06})`; g.fillRect(x, 0, 1, h); }
}, [8, 1]);

// el dokuması ipek halı: krem zemin, lacivert hat bordür, uçlarda saçak
const hali = () => doku(512, 1024, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  const F = 26, B = 58;
  g.fillStyle = '#ddcfb1'; g.fillRect(0, F, w, h - 2 * F);
  g.fillStyle = 'rgba(160,128,84,.16)'; g.beginPath(); g.ellipse(w / 2, h / 2, 120, 230, 0, 0, TAM); g.fill();
  for (let i = 0; i < 300; i++) {
    const x = B + 20 + rnd() * (w - 2 * B - 60), y = F + B + 20 + rnd() * (h - 2 * F - 2 * B - 50);
    g.strokeStyle = `rgba(150,118,78,${.22 + rnd() * .25})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 12, y - 10, x + 22, y + 8, x + 32, y - 2); g.stroke();
    g.fillStyle = rnd() < .3 ? 'rgba(52,72,112,.4)' : 'rgba(170,128,86,.38)'; g.beginPath(); g.arc(x + 32, y - 2, 3, 0, TAM); g.fill();
  }
  g.fillStyle = '#e9dec6'; g.fillRect(0, F, w, B); g.fillRect(0, h - F - B, w, B); g.fillRect(0, F, B, h - 2 * F); g.fillRect(w - B, F, B, h - 2 * F);
  g.strokeStyle = '#8f7a55'; g.lineWidth = 3; g.strokeRect(B, F + B, w - 2 * B, h - 2 * F - 2 * B); g.lineWidth = 2; g.strokeRect(7, F + 7, w - 14, h - 2 * F - 14);
  g.strokeStyle = 'rgba(36,56,98,.85)'; g.lineWidth = 4; g.lineCap = 'round';
  const hat = (x, y, a) => { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(-15, 5); g.bezierCurveTo(-6, -12, 4, 12, 15, -4); g.moveTo(-4, -11); g.lineTo(-2, -3); g.moveTo(8, 8); g.lineTo(10, 12); g.stroke(); g.restore(); };
  for (let y = F + 44; y < h - F - 30; y += 58) { hat(B / 2, y, Math.PI / 2); hat(w - B / 2, y, -Math.PI / 2); }
  for (let x = 44; x < w - 30; x += 58) { hat(x, F + B / 2, 0); hat(x, h - F - B / 2, Math.PI); }
  g.strokeStyle = '#efe7d6'; g.lineWidth = 2.5;
  for (let x = 4; x < w; x += 7) {
    g.beginPath(); g.moveTo(x, F); g.lineTo(x + (rnd() - .5) * 4, 2 + rnd() * 6); g.stroke();
    g.beginPath(); g.moveTo(x, h - F); g.lineTo(x + (rnd() - .5) * 4, h - 2 - rnd() * 6); g.stroke();
  }
});

// sedef kakma: koyu ceviz zemin + inci arabesk (koltuk, sehpa) / açık inci zemin (bench)
const sedef = (zemin, cizgi, nokta, tekrar = [2, 2]) => doku(256, 256, (g, w, h) => {
  g.fillStyle = zemin; g.fillRect(0, 0, w, h);
  g.strokeStyle = cizgi; g.lineWidth = 2.6; g.strokeRect(6, 6, w - 12, h - 12); g.lineWidth = 1.6; g.strokeRect(14, 14, w - 28, h - 28);
  g.lineWidth = 2.4;
  for (let i = 0; i < 30; i++) { const x = 24 + rnd() * (w - 48), y = 24 + rnd() * (h - 48), r = 12 + rnd() * 22, a = rnd() * TAM; g.beginPath(); g.arc(x, y, r, a, a + 2.6); g.stroke(); }
  g.fillStyle = nokta;
  for (let i = 0; i < 20; i++) {
    const x = 26 + rnd() * (w - 52), y = 26 + rnd() * (h - 52);
    for (let k = 0; k < 5; k++) { const a = k * TAM / 5; g.beginPath(); g.arc(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 3, 0, TAM); g.fill(); }
  }
  for (let i = 0; i < 140; i++) { g.beginPath(); g.arc(20 + rnd() * (w - 40), 20 + rnd() * (h - 40), 1 + rnd() * 1.3, 0, TAM); g.fill(); }
}, tekrar);

// Mimar Sinan çinisi: beyaz zemin, lale, saz yaprağı, kobalt-turkuaz
const cini = () => doku(256, 256, (g, w, h) => {
  g.fillStyle = '#f6f3ec'; g.fillRect(0, 0, w, h);
  const yap = (x, y, r, a, c) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = c; g.beginPath(); g.moveTo(0, -r); g.bezierCurveTo(r * .6, -r * .5, r * .45, r * .6, 0, r); g.bezierCurveTo(-r * .2, r * .3, -r * .3, -r * .4, 0, -r); g.fill(); g.restore(); };
  g.strokeStyle = '#1d5f8a'; g.lineWidth = 3; g.beginPath(); g.moveTo(128, 250); g.bezierCurveTo(100, 180, 160, 120, 128, 46); g.stroke();
  yap(98, 192, 34, -1, '#1b7f7a'); yap(160, 150, 30, 1, '#1b7f7a'); yap(98, 110, 25, -.8, '#2557a0'); yap(160, 92, 22, .9, '#2557a0');
  g.fillStyle = '#b8322a'; g.beginPath(); g.moveTo(108, 50); g.quadraticCurveTo(108, 14, 120, 30); g.quadraticCurveTo(128, 4, 136, 30); g.quadraticCurveTo(148, 14, 148, 50); g.quadraticCurveTo(128, 64, 108, 50); g.fill();
  for (const [x, y] of [[0, 0], [256, 0], [0, 256], [256, 256]]) {
    g.fillStyle = '#2557a0'; g.beginPath(); g.arc(x, y, 30, 0, TAM); g.fill();
    g.fillStyle = '#f6f3ec'; g.beginPath(); g.arc(x, y, 19, 0, TAM); g.fill();
    g.fillStyle = '#1b7f7a'; g.beginPath(); g.arc(x, y, 9, 0, TAM); g.fill();
  }
  g.strokeStyle = 'rgba(150,150,150,.55)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
});
const mermer = (derz) => doku(512, 512, (g, w, h) => {
  g.fillStyle = '#f0ece5'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) {
    g.strokeStyle = `rgba(118,118,124,${.08 + rnd() * .2})`; g.lineWidth = .8 + rnd() * 2;
    g.beginPath(); let x = rnd() * w, y = 0; g.moveTo(x, y);
    while (y < h) { const nx = x + (rnd() - .5) * 90, ny = y + 40 + rnd() * 60; g.quadraticCurveTo((x + nx) / 2 + (rnd() - .5) * 40, (y + ny) / 2, nx, ny); x = nx; y = ny; }
    g.stroke();
  }
  if (derz) { g.strokeStyle = 'rgba(150,140,128,.6)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke(); }
});
// Osmanlı fener camı: pirinç kafes içinde amber renkli camlar
const fener = () => doku(128, 128, (g, w, h) => {
  g.fillStyle = '#2a1b0b'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
    const cx = x * 32 + (y % 2) * 16, cy = y * 32;
    g.fillStyle = ['#ffd27e', '#ffb24a', '#ffe4ad', '#f39a3c'][(x + y) % 4];
    g.beginPath(); g.moveTo(cx, cy - 12); g.lineTo(cx + 10, cy); g.lineTo(cx, cy + 12); g.lineTo(cx - 10, cy); g.closePath(); g.fill();
  }
}, [3, 1]);
// dikey bahçenin en arkası: odak dışı, yumuşak yeşillik (yapraklar önünde 3B katmanlar hâlinde durur)
const bahce = () => doku(512, 512, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#46663a'); gr.addColorStop(.5, '#2a4424'); gr.addColorStop(1, '#14210f');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.filter = 'blur(9px)';
  for (let i = 0; i < 260; i++) { g.fillStyle = `hsla(${88 + rnd() * 40},${35 + rnd() * 30}%,${12 + rnd() * 26}%,.75)`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 10 + rnd() * 30, 6 + rnd() * 18, rnd() * 3, 0, TAM); g.fill(); }
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(214,236,160,${.08 + rnd() * .14})`; g.beginPath(); g.arc(rnd() * w, rnd() * h * .7, 3 + rnd() * 9, 0, TAM); g.fill(); }
  g.filter = 'none';
});
// yaprak atlası (1024²; dört çeyrek): monstera, filodendron, eğrelti, sarmaşık — saydam zemin, damar, ışık geçişi
const yaprakAtlas = () => doku(1024, 1024, (g) => {
  g.clearRect(0, 0, 1024, 1024);
  const kalp = (cx, cy, R) => {
    g.beginPath(); g.moveTo(cx, cy + R * .7);
    g.bezierCurveTo(cx - R * .18, cy + R * .98, cx - R * 1.0, cy + R * .62, cx - R * .96, cy - R * .02);
    g.bezierCurveTo(cx - R * .92, cy - R * .68, cx - R * .36, cy - R * 1.0, cx, cy - R * .98);
    g.bezierCurveTo(cx + R * .36, cy - R * 1.0, cx + R * .92, cy - R * .68, cx + R * .96, cy - R * .02);
    g.bezierCurveTo(cx + R * 1.0, cy + R * .62, cx + R * .18, cy + R * .98, cx, cy + R * .7); g.closePath();
  };
  const dolgu = (cx, cy, R, c0, c1) => { const gr = g.createLinearGradient(cx - R, cy - R, cx + R * .6, cy + R); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; };
  const damar = (cx, cy, R, renk, n) => {
    g.strokeStyle = renk; g.lineWidth = R * .035; g.beginPath(); g.moveTo(cx, cy + R * .72); g.quadraticCurveTo(cx + R * .05, cy, cx, cy - R * .95); g.stroke();
    g.lineWidth = R * .016;
    for (let k = 1; k <= n; k++) { const yy = cy + R * .6 - k * R * 1.45 / (n + 1); for (const sy of [-1, 1]) { g.beginPath(); g.moveTo(cx, yy); g.quadraticCurveTo(cx + sy * R * .45, yy - R * .08, cx + sy * R * .85, yy - R * .3); g.stroke(); } }
  };
  const isilti = (cx, cy, R, a) => { const gr = g.createRadialGradient(cx - R * .35, cy - R * .45, 0, cx - R * .35, cy - R * .45, R * .9); gr.addColorStop(0, `rgba(235,250,210,${a})`); gr.addColorStop(1, 'rgba(235,250,210,0)'); g.fillStyle = gr; g.fill(); };
  // 1) monstera: yarıklı ve delikli
  let cx = 256, cy = 266, R = 228;
  kalp(cx, cy, R); g.fillStyle = dolgu(cx, cy, R, '#5a9446', '#234a1f'); g.fill(); isilti(cx, cy, R, .22);
  g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round';
  for (let k = 0; k < 6; k++) for (const sy of [-1, 1]) {
    const yy = cy - R * .62 + k * R * .26; g.lineWidth = R * (.055 + rnd() * .02);
    g.beginPath(); g.moveTo(cx + sy * R * 1.05, yy - R * .12); g.lineTo(cx + sy * R * (.48 + rnd() * .1), yy + R * .02); g.stroke();
    if (k > 0 && k < 5) { g.beginPath(); g.ellipse(cx + sy * R * .24, yy + R * .12, R * .045, R * .075, sy * .5, 0, TAM); g.fill(); }
  }
  g.globalCompositeOperation = 'source-over'; damar(cx, cy, R, 'rgba(196,224,150,.55)', 6);
  // 2) filodendron: koyu, parlak kalp yaprak
  cx = 768; cy = 266; R = 222;
  kalp(cx, cy, R); g.fillStyle = dolgu(cx, cy, R, '#3f7d36', '#163a18'); g.fill(); isilti(cx, cy, R, .3); damar(cx, cy, R, 'rgba(170,210,130,.45)', 5);
  // 3) eğrelti: kavisli orta damar boyunca küçük yaprakçıklar
  cx = 256; cy = 768; R = 232;
  g.lineCap = 'round';
  for (let i = 0; i <= 26; i++) {
    const tt = i / 26, x = cx + Math.sin(tt * 1.6) * R * .12, y = cy + R * .95 - tt * R * 1.9, L = R * .5 * (1 - tt * .78);
    for (const sy of [-1, 1]) {
      g.save(); g.translate(x, y); g.rotate(sy * (1.05 - tt * .35)); g.fillStyle = dolgu(0, 0, L, '#8cbf55', '#3d6e2a');
      g.beginPath(); g.ellipse(0, -L * .5, L * .16, L * .52, 0, 0, TAM); g.fill(); g.restore();
    }
  }
  g.strokeStyle = '#4c6d2c'; g.lineWidth = 7; g.beginPath(); g.moveTo(cx, cy + R * .95); g.quadraticCurveTo(cx + R * .12, cy, cx + R * .05, cy - R * .95); g.stroke();
  // 4) sarmaşık (pothos): sarı çizgili küçük yapraklar
  for (const [x, y, r, a] of [[680, 640, 92, -.5], [850, 610, 86, .45], [700, 800, 96, -.2], [860, 790, 88, .35], [775, 900, 70, 0], [770, 700, 80, .1]]) {
    g.save(); g.translate(x, y); g.rotate(a); kalp(0, 0, r); g.fillStyle = dolgu(0, 0, r, '#69a446', '#2e6527'); g.fill();
    g.strokeStyle = 'rgba(232,228,140,.55)'; g.lineWidth = 5; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo((rnd() - .5) * r * .6, r * .5); g.quadraticCurveTo((rnd() - .5) * r, 0, (rnd() - .5) * r * .5, -r * .7); g.stroke(); }
    isilti(0, 0, r, .25); g.restore();
  }
});
// yaprak katmanı: adet kadar hafif kıvrık yaprak (3×3 ızgara) tek geometride; zDis: duvarın dış yüzü, d: duvardan uzaklık
function yaprakKatmani(adet, xa, xb, zDis, d0, d1, b0, b1, H) {
  const poz = [], uv = [], ind = [], m4 = new THREE.Matrix4(), e = new THREE.Euler(), v = new THREE.Vector3();
  for (let n = 0; n < adet; n++) {
    const r = rnd(), q = r < .3 ? 0 : r < .58 ? 1 : r < .78 ? 2 : 3;
    const sz = b0 + rnd() * (b1 - b0), d = d0 + rnd() * (d1 - d0);
    const ust = H - (d + .14) * .75 - sz * 1.05; // duvarın üstünden taşmasın
    const x = xa + rnd() * (xb - xa), y = -.08 + Math.pow(rnd(), 1.25) * Math.max(.1, ust + .08), z = zDis - d; // dipte daha sık: toprak görünmesin
    e.set(.25 + rnd() * .65, (rnd() - .5) * 1.0, (rnd() - .5) * 1.4); m4.makeRotationFromEuler(e); m4.setPosition(x, y, z);
    const bas = poz.length / 3, eg = .1 + rnd() * .3, kup = .06 + rnd() * .14, uz = q === 2 ? 1.3 : 1;
    const [u0, v0] = [[0, .5], [.5, .5], [0, 0], [.5, 0]][q];
    for (let j = 0; j <= 2; j++) for (let i = 0; i <= 2; i++) {
      const a = i / 2 - .5, bb = j / 2;
      v.set(a * sz, bb * sz * uz, (-eg * bb * bb + kup * a * a) * sz).applyMatrix4(m4);
      poz.push(v.x, v.y, v.z); uv.push(u0 + .008 + i / 2 * .484, v0 + .008 + j / 2 * .484);
    }
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { const p0 = bas + j * 3 + i; ind.push(p0, p0 + 1, p0 + 3, p0 + 1, p0 + 4, p0 + 3); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(poz, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ind);
  geo.computeVertexNormals(); return geo;
}
// Fransız balkon korkuluğu: siyah baklava kafes (saydam zemin)
const kafes = () => doku(256, 256, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.strokeStyle = '#17130f'; g.lineWidth = 5;
  for (let i = -w; i < 2 * w; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i, h); g.lineTo(i + h, 0); g.stroke(); }
});
// kakmalı ceviz kapak (gardırop, giriş kapısı): çerçeveli paneller ve açık renk rumi madalyon
const kakmaKapak = () => doku(256, 512, (g, w, h) => {
  cevizCiz(g, w, h, 25);
  const pano = (x, y, pw, ph) => {
    g.strokeStyle = 'rgba(12,5,1,.6)'; g.lineWidth = 5; g.strokeRect(x, y, pw, ph);
    g.strokeStyle = 'rgba(255,214,160,.14)'; g.lineWidth = 2; g.strokeRect(x + 7, y + 7, pw - 14, ph - 14);
    const cx = x + pw / 2, cy = y + ph / 2, rx = pw * .26, ry = ph * .3;
    g.strokeStyle = 'rgba(226,194,142,.75)'; g.lineWidth = 4;
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAM); g.stroke();
    g.beginPath(); g.moveTo(cx, cy - ry); g.bezierCurveTo(cx + rx * .9, cy - ry * .4, cx - rx * .9, cy + ry * .4, cx, cy + ry); g.stroke();
    g.fillStyle = 'rgba(226,194,142,.7)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx, cy + s * (ry + 14), 6, 10, 0, 0, TAM); g.fill(); }
  };
  pano(20, 20, w - 40, h * .36); pano(20, h * .36 + 34, w - 40, h - h * .36 - 54);
});

// yumuşak temas gölgesi (eşyanın altı): kenarları bulanık yuvarlak dikdörtgen
const golgeDoku = () => doku(128, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.filter = 'blur(14px)'; g.fillStyle = '#000';
  g.beginPath(); g.roundRect(30, 30, w - 60, h - 60, 16); g.fill(); g.filter = 'none';
});
// tek yönlü geçiş: koyu kenar → saydam (duvar dibi kararması, tavan ışığı)
const gecis = (renk, a0) => doku(8, 128, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, `rgba(${renk},${a0})`); gr.addColorStop(.45, `rgba(${renk},${a0 * .35})`); gr.addColorStop(1, `rgba(${renk},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
const hale = () => doku(128, 128, (g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,206,140,.9)'); gr.addColorStop(.3, 'rgba(255,180,100,.35)'); gr.addColorStop(1, 'rgba(255,170,90,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});

/* ---------- yardımcılar ---------- */
const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .78, metalness: 0, envMapIntensity: .55, ...o });
function ekle(par, geo, m, x, y, z, ry = 0, golge = true) {
  const k = new THREE.Mesh(geo, m); k.position.set(x, y, z); k.rotation.y = ry;
  k.castShadow = golge; k.receiveShadow = true; par.add(k); return k;
}
// alt yüzü y'de duran kutu
const kutu = (par, w, h, d, m, x, y, z, ry = 0) => ekle(par, new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z, ry);
// yuvarlatılmış köşeli kutu (şilte, yastık, minder)
function yuvarlakG(w, h, d, r) {
  r = Math.min(r, w / 2 - .002, h / 2 - .002, d / 2 - .002);
  const a = w / 2 - r, b = h / 2 - r, c = Math.min(r * .6, a * .9, b * .9), s = new THREE.Shape();
  s.moveTo(-a + c, -b); s.lineTo(a - c, -b); s.quadraticCurveTo(a, -b, a, -b + c); s.lineTo(a, b - c); s.quadraticCurveTo(a, b, a - c, b);
  s.lineTo(-a + c, b); s.quadraticCurveTo(-a, b, -a, b - c); s.lineTo(-a, -b + c); s.quadraticCurveTo(-a, -b, -a + c, -b);
  const geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(.002, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 4, curveSegments: 4 });
  geo.center(); return geo;
}
const yk = (par, w, h, d, r, m, x, y, z, ry = 0) => ekle(par, yuvarlakG(w, h, d, r), m, x, y + h / 2, z, ry);
const silindir = (par, rt, rb, h, m, x, y, z, seg = 24) => ekle(par, new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y + h / 2, z);
const torna = (par, profil, m, x, y, z, seg = 18) => ekle(par, new THREE.LatheGeometry(profil.map(([r, h]) => new THREE.Vector2(r, h)), seg), m, x, y, z);
const sekilG = (s, d) => new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 2, curveSegments: 16 });
// alt kenarı sivri kemerli panel; şekil x∈[-w/2,w/2], y∈[0,h], kalınlık z'de ortalı
function kemerliG(w, h, n, derin, kal = .045, ayak = .035) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(-w / 2, h); s.lineTo(w / 2, h); s.lineTo(w / 2, 0);
  const a = w / n;
  for (let i = n - 1; i >= 0; i--) {
    const x1 = -w / 2 + (i + 1) * a - ayak, x0 = -w / 2 + i * a + ayak, xm = (x0 + x1) / 2;
    s.lineTo(x1, 0); s.quadraticCurveTo(x1, derin * .85, xm, derin); s.quadraticCurveTo(x0, derin * .85, x0, 0);
  }
  s.lineTo(-w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: kal, bevelEnabled: true, bevelThickness: .006, bevelSize: .006, bevelSegments: 1, curveSegments: 8 });
  geo.translate(0, 0, -kal / 2); return geo;
}
// kemer tepeli şekil (yatak başlığı, ayna çerçevesi)
function kemerSekli(w, h0, h1, tepe) {
  const s = new THREE.Shape(), d = tepe - h1;
  s.moveTo(-w / 2, h0); s.lineTo(-w / 2, h1);
  s.quadraticCurveTo(-w * .47, h1 + d * .75, -w * .27, h1 + d * .8); s.quadraticCurveTo(-w * .07, h1 + d * .85, 0, tepe);
  s.quadraticCurveTo(w * .07, h1 + d * .85, w * .27, h1 + d * .8); s.quadraticCurveTo(w * .47, h1 + d * .75, w / 2, h1);
  s.lineTo(w / 2, h0); s.lineTo(-w / 2, h0); return s;
}
// büzgülü perde: kat sayısı kadar dalga; isteğe bağlı bağcıkla yana toplanır
function perdeG(w, h, kat, derin, buzgu) {
  const geo = new THREE.PlaneGeometry(w, h, Math.max(16, kat * 12), 14), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i); const y = p.getY(i) + h / 2;
    let z = Math.sin((x / w + .5) * kat * TAM) * derin;
    if (buzgu) { const s = Math.exp(-(((y - buzgu.y) / .5) ** 2)) * buzgu.oran, kenar = buzgu.yon * w / 2; x = kenar + (x - kenar) * (1 - s); z *= 1 + s * 1.4; }
    p.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals(); return geo;
}
// kabarık yastık: üst/alt yüzey kenardaki dikişte birleşir, köşeler sivrilir, kenarlar içe kavislenir, yüzeyde hafif kırışık
// a: x boyu, b: z boyu, t: en kalın yer (y)
function yastikG(a, b, t, kirisik = .01) {
  const N = 30, K = 22, poz = [], uv = [], ind = [];
  for (const yon of [1, -1]) {
    const bas = poz.length / 3;
    for (let j = 0; j <= K; j++) for (let i = 0; i <= N; i++) {
      const u = i / N * 2 - 1, v = j / K * 2 - 1;
      const f = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.6)), .5) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(v), 2.6)), .5);
      const kr = (Math.sin(u * 9.1 + v * 3.7 + yon) + Math.sin(u * 4.3 - v * 7.9)) * kirisik * f * (1 - f) * 2.4;
      poz.push(u * a / 2 * (1 - .08 * (1 - v * v)), yon * (t / 2 * f + kr), v * b / 2 * (1 - .08 * (1 - u * u)));
      uv.push(i / N, j / K);
    }
    for (let j = 0; j < K; j++) for (let i = 0; i < N; i++) {
      const p0 = bas + j * (N + 1) + i, q = p0 + N + 1;
      if (yon > 0) ind.push(p0, q, p0 + 1, p0 + 1, q, q + 1); else ind.push(p0, p0 + 1, q, p0 + 1, q + 1, q);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(poz, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ind);
  geo.computeVertexNormals(); return geo;
}
// eğri boru (batarya ağzı, duş kolu): noktalar yerel koordinatta
const boruG = (noktalar, r, seg = 40) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(noktalar.map(n => new THREE.Vector3(...n))), seg, r, 10, false);
// havlu / pamuk: ince ilmek dokusu
const havluDoku = (renk) => doku(128, 128, (g, w, h) => {
  g.fillStyle = renk; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '255,255,255' : '90,80,70'},${.05 + rnd() * .09})`; g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
}, [6, 6]);

// dünya koordinatına göre UV: bitişik duvar parçalarında desen kesintisiz akar
function dunyaUV(geo, cx, cy, cz, eksen, ou, ov) {
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (eksen === 'x' ? p.getX(i) + cx : p.getZ(i) + cz) / ou, (p.getY(i) + cy) / ov);
  uv.needsUpdate = true;
}

/* ---------- duvar sistemi: kameraya bakan duvarlar kesilir ---------- */
function duvarSistemi(g, H, KES, M) {
  // Duvarlar tek parça (tam boy) kurulur; kameraya yakın duvar web'de bir kesme düzlemiyle alçaltılır.
  // Böylece ışık pişirmede alt/üst parça birleşimi (ince çizgi) hiç oluşmaz.
  const D = {};
  const yeni = (ad, nx, nz, ic) => {
    const duvar = new THREE.Group(), ekli = new THREE.Group(), kap = new THREE.Group();
    duvar.name = 'duvar_' + ad; ekli.name = 'ekli_' + ad; kap.name = 'kap_' + ad; g.add(duvar, ekli, kap);
    return D[ad] = { ad, n: [nx, nz], ic, duvar, ekli, kap, k: 1 };
  };
  // duvar parçası: (x,z) orta, y alt; iç yüze desen, diğer yüzlere sıva / kesit
  const parca = (ad, w, h, d, icMat, x, y, z) => {
    const dv = D[ad], eksen = dv.n[0] ? 'z' : 'x';
    const yuzler = [M.dis, M.dis, M.kesit, M.kesit, M.dis, M.dis]; yuzler[dv.ic] = icMat;
    const geo = new THREE.BoxGeometry(w, h, d); dunyaUV(geo, x, y + h / 2, z, eksen, 1, 1);
    ekle(dv.duvar, geo, yuzler, x, y + h / 2, z);
    // kesik görünümün siyah üst kapağı: web'de kesme yüksekliğine taşınır (tam boyda gizli; pişirmeye katılmaz)
    if (y < KES && y + h > KES) kutu(dv.kap, w + .001, .02, d + .001, M.kesit, x, KES - .02, z);
    if (y + h >= H - .001) kutu(dv.duvar, w - .002, .02, d - .002, M.kesit, x, H - .01, z);
  };
  // duvara takılı eşya: duvarla birlikte kesilir
  const ustune = (ad, mesh) => { D[ad].duvar.add(mesh); return mesh; };
  return { D, yeni, parca, ustune };
}

/* ---------- oda: Deluxe Dikey Bahçe Manzaralı (King), ~32 m² ----------
   Fotoğraflardan: yatak başlığı şam desenli sol duvarda, yatak ayağı karşıdaki ceviz
   TV/çalışma ünitesine bakar; arka duvar boydan boya perdeli pencere ve dikey bahçe;
   pencere köşesinde sedef koltuk + sekizgen sehpa; girişte sağda kakmalı gardırop,
   solda çinili mermer banyo. */
function deluxeDikey(sahne) {
  const g = new THREE.Group(); g.name = 'oda'; sahne.add(g);
  const W = 4.6, D = 7.0, H = 2.85, t = .14, X0 = -W / 2, X1 = W / 2, Z0 = -D / 2, Z1 = D / 2, KES = .62;
  const BZ = 1.2, BX = .55; // banyo bölmeleri
  const parkeD = parke(); parkeD.repeat.set(W / 1.3, D / 1.3);
  const mermerD = mermer(true); mermerD.repeat.set(3, 3);
  const haliD = hali(); haliD.wrapS = haliD.wrapT = THREE.ClampToEdgeWrapping;
  const fenerD = fener();
  const M = {
    sam: mat({ map: sam(), roughness: .7 }), cini: mat({ map: cini(), roughness: .25 }),
    dis: mat({ color: 0xe6dccb, roughness: .95 }), kesit: mat({ color: 0x16110e, roughness: .7 }),
    lambri: mat({ map: ceviz(26, [1.6, .8]), roughness: .5 }),
    parke: mat({ map: parkeD, roughness: .42 }), mermerZ: mat({ map: mermerD, color: 0xd6cdbf, roughness: .2 }), taban: mat({ color: 0x241710, roughness: .8 }),
    ceviz: mat({ map: ceviz(26), roughness: .45 }), cevizK: mat({ map: ceviz(17), roughness: .4 }), kakma: mat({ map: kakmaKapak(), roughness: .45 }),
    sedefK: mat({ map: sedef('#3a2416', 'rgba(238,230,212,.9)', 'rgba(248,242,228,.95)'), roughness: .38 }),
    sedefS: mat({ map: sedef('#3a2416', 'rgba(238,230,212,.9)', 'rgba(248,242,228,.95)', [4, 1]), roughness: .38 }),
    sedefA: mat({ map: sedef('#cfc4ad', 'rgba(72,56,40,.55)', 'rgba(252,249,241,.95)'), roughness: .35 }),
    keten: mat({ map: kumas('#f6f2eb'), roughness: 1 }), yastik: mat({ map: kumas('#f8f5ef'), roughness: 1 }),
    havlu: mat({ map: havluDoku('#f4f0e8'), roughness: 1 }), seramik: mat({ color: 0xf7f6f2, roughness: .16 }),
    yesilAltin: mat({ map: kumas('#9a8a4c'), roughness: .62, metalness: .1 }),
    kadife: mat({ map: kumas('#a8937a'), roughness: .96 }), kadifeK: mat({ map: kumas('#7b5e45'), roughness: .9 }),
    perde: mat({ map: kumas('#b29c80'), roughness: .96, side: THREE.DoubleSide }),
    tul: mat({ map: tulKat(15), transparent: true, opacity: .58, side: THREE.DoubleSide, roughness: 1, depthWrite: false }),
    altin: mat({ color: 0xb48e55, metalness: .85, roughness: .28, envMapIntensity: 1 }),
    siyah: mat({ color: 0x141210, roughness: .35, metalness: .4 }), ekran: mat({ color: 0x08090b, roughness: .12, metalness: .2, envMapIntensity: 1 }),
    beyaz: mat({ color: 0xffffff, roughness: .18 }), ayna: mat({ color: 0xd2d8da, roughness: .04, metalness: 1, envMapIntensity: 1.2 }),
    cam: new THREE.MeshPhysicalMaterial({ color: 0xe4efec, transparent: true, opacity: .3, roughness: .04, metalness: 0, envMapIntensity: 1, depthWrite: false }),
    hali: mat({ map: haliD, roughness: .9, alphaTest: .4, side: THREE.DoubleSide }),
    bahce: new THREE.MeshBasicMaterial({ map: bahce(), color: 0xd0d6c4 }), toprak: new THREE.MeshBasicMaterial({ color: 0x2b3a22 }),
    kafes: mat({ map: kafes(), transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .5 }),
    fener: new THREE.MeshStandardMaterial({ map: fenerD, emissiveMap: fenerD, emissive: 0xffc070, emissiveIntensity: 2.2, roughness: .4 }),
    led: new THREE.MeshBasicMaterial({ color: 0xffe2b0 }), puskul: mat({ color: 0xe8dcc4, roughness: 1 }),
    cicekP: mat({ color: 0xe9b7c0, roughness: .9 }), cicekB: mat({ color: 0xf6f0ea, roughness: .9 }), yesil: mat({ color: 0x51683a, roughness: .9 })
  };

  const atlas = yaprakAtlas();
  M.yaprakA = new THREE.MeshBasicMaterial({ map: atlas, color: 0x6f8c62, alphaTest: .45, side: THREE.DoubleSide });
  M.yaprakB = new THREE.MeshBasicMaterial({ map: atlas, color: 0xa9bf98, alphaTest: .45, side: THREE.DoubleSide });
  M.yaprakC = new THREE.MeshBasicMaterial({ map: atlas, color: 0xe2edd2, alphaTest: .45, side: THREE.DoubleSide });
  for (const [k, m] of Object.entries(M)) m.name = k; // Blender'a aktarımda malzemeler bu adlarla tanınır
  M.sam.map.repeat.set(1 / .52, 1 / .65); M.cini.map.repeat.set(1 / .22, 1 / .22);
  for (const [m, k] of [[M.parke, 1.2], [M.sam, .35], [M.cini, .5], [M.hali, 2], [M.sedefA, .6], [M.sedefK, .6], [M.kakma, .8], [M.ceviz, .4], [M.cevizK, .4], [M.mermerZ, .3]]) { m.bumpMap = m.map; m.bumpScale = k; }

  /* zemin */
  kutu(g, W + 2 * t + .24, .24, D + 2 * t + .24, M.taban, 0, -.24, 0);
  kutu(g, W + 2 * t + .26, .02, D + 2 * t + .26, M.kesit, 0, -.25, 0);
  const zemin = ekle(g, new THREE.PlaneGeometry(W, D), M.parke, 0, .002, 0, 0, false); zemin.rotation.x = -Math.PI / 2;
  const bZem = ekle(g, new THREE.PlaneGeometry(BX - X0, Z1 - BZ), M.mermerZ, (X0 + BX) / 2, .005, (BZ + Z1) / 2, 0, false); bZem.rotation.x = -Math.PI / 2;

  /* duvarlar */
  const S = duvarSistemi(g, H, KES, M), Dw = S.D;
  S.yeni('sol', 1, 0, 0); S.yeni('sag', -1, 0, 1); S.yeni('arka', 0, 1, 4); S.yeni('on', 0, -1, 5);
  // sol: yatak başlığı duvarı (şam), girişe doğru banyo (çini)
  S.parca('sol', t, H, BZ - Z0 + t, M.sam, X0 - t / 2, 0, (Z0 - t + BZ) / 2);
  S.parca('sol', t, H, Z1 + t - BZ, M.cini, X0 - t / 2, 0, (BZ + Z1 + t) / 2);
  // sağ: ceviz TV ünitesi ve gardırop duvarı
  S.parca('sag', t, H, D + 2 * t, M.sam, X1 + t / 2, 0, 0);
  // arka: boydan boya pencere açıklığı
  const PX0 = -1.62, PX1 = 2.02, PH = 2.55;
  S.parca('arka', PX0 - X0, H, t, M.sam, (X0 + PX0) / 2, 0, Z0 - t / 2);
  S.parca('arka', X1 - PX1, H, t, M.sam, (PX1 + X1) / 2, 0, Z0 - t / 2);
  S.parca('arka', PX1 - PX0, H - PH, t, M.sam, (PX0 + PX1) / 2, PH, Z0 - t / 2);
  // ön: banyo bölümü çini, giriş kapısı x[0.8, 1.7]
  S.parca('on', BX - X0, H, t, M.cini, (X0 + BX) / 2, 0, Z1 + t / 2);
  S.parca('on', .8 - BX, H, t, M.dis, (BX + .8) / 2, 0, Z1 + t / 2);
  S.parca('on', X1 - 1.7, H, t, M.dis, (1.7 + X1) / 2, 0, Z1 + t / 2);
  S.parca('on', .9, H - 2.15, t, M.dis, 1.25, 2.15, Z1 + t / 2);
  // tavan pervazı + gizli LED
  const pervaz = (ad, w, d, x, z) => { S.ustune(ad, kutu(g, w, .1, d, M.dis, x, H - .1, z)); S.ustune(ad, kutu(g, w * .999, .018, d * .7, M.led, x, H - .12, z)); };
  pervaz('sol', .07, D, X0 + .035, 0); pervaz('sag', .07, D, X1 - .035, 0); pervaz('arka', W, .07, 0, Z0 + .035); pervaz('on', W, .07, 0, Z1 - .035);
  // ceviz süpürgelik
  kutu(g, .02, .09, BZ - Z0, M.cevizK, X0 + .01, 0, (Z0 + BZ) / 2); kutu(g, .02, .09, D, M.cevizK, X1 - .01, 0, 0);
  kutu(g, PX0 - X0, .09, .02, M.cevizK, (X0 + PX0) / 2, 0, Z0 + .01); kutu(g, X1 - PX1, .09, .02, M.cevizK, (PX1 + X1) / 2, 0, Z0 + .01);
  // iç bölmeler (hep alçak kesik): banyo arkası (yatak odası yüzü şam) ve koridor yanı (koridor yüzü ceviz lambri)
  const bolme = (w, d, x, z, yuz) => { const geo = new THREE.BoxGeometry(w, KES, d); dunyaUV(geo, x, KES / 2, z, w > d ? 'x' : 'z', 1, 1); ekle(g, geo, yuz, x, KES / 2, z); kutu(g, w + .004, .02, d + .004, M.kesit, x, KES - .01, z); };
  bolme(BX - X0 + .05, .1, (X0 + BX) / 2 + .025, BZ, [M.lambri, M.dis, M.kesit, M.kesit, M.cini, M.sam]);
  bolme(.1, 2.05 - BZ - .05, BX, (BZ + .05 + 2.05) / 2, [M.lambri, M.cini, M.kesit, M.kesit, M.dis, M.dis]); // arka bölmenin bittiği yerden başlar
  bolme(.1, Z1 - 2.85, BX, (2.85 + Z1) / 2, [M.lambri, M.cini, M.kesit, M.kesit, M.dis, M.dis]);

  /* pencere duvarı: çelik doğramalı cam kapı, Fransız balkon kafesi, dikey bahçe, tül + fon perde */
  const A = Dw.arka.ekli, pc = (PX0 + PX1) / 2, pw = PX1 - PX0;
  ekle(A, new THREE.PlaneGeometry(pw, PH), M.cam, pc, PH / 2, Z0 - t / 2, 0, false);
  for (const x of [PX0 + .025, PX0 + pw / 3, PX0 + pw * 2 / 3, PX1 - .025]) kutu(A, .05, PH, .06, M.siyah, x, 0, Z0 - t / 2);
  kutu(A, pw, .05, .06, M.siyah, pc, PH - .05, Z0 - t / 2); kutu(A, pw, .05, .06, M.siyah, pc, 2.1, Z0 - t / 2);
  M.kafes.map.repeat.set(pw / .42, .95 / .42);
  ekle(A, new THREE.PlaneGeometry(pw, .95), M.kafes, pc, .475, Z0 - t - .03, 0, false);
  kutu(A, pw, .04, .03, M.siyah, pc, .93, Z0 - t - .03);
  // dikey bahçe: pencerenin dışında 70 cm derinliğinde yaşayan duvar; yandan bakınca (bahce_arka) gizlenir
  const bah = new THREE.Group(); bah.name = 'bahce_arka'; g.add(bah);
  const dD = Z0 - t;
  ekle(bah, new THREE.PlaneGeometry(pw + .5, 2.3), M.bahce, pc, 1.15, dD - .72, 0, false);
  for (const [x, ry] of [[PX0 - .22, Math.PI / 2], [PX1 + .22, -Math.PI / 2]]) ekle(bah, new THREE.PlaneGeometry(.72, 2.3), M.bahce, x, 1.15, dD - .36, ry, false);
  const yer = ekle(bah, new THREE.PlaneGeometry(pw + .5, .72), M.toprak, pc, .001, dD - .36, 0, false); yer.rotation.x = -Math.PI / 2;
  for (const [mt, adet, d0, d1, b0, b1] of [[M.yaprakA, 360, .5, .66, .14, .3], [M.yaprakB, 230, .32, .48, .17, .34], [M.yaprakC, 100, .14, .3, .2, .4]])
    ekle(bah, yaprakKatmani(adet, PX0 - .2, PX1 + .2, dD, d0, d1, b0, b1, H), mt, 0, 0, 0, 0, false);
  ekle(A, perdeG(3.4, 2.72, 15, .035), M.tul, .17, 0, Z0 + .17, 0, false);
  ekle(A, perdeG(.55, 2.74, 4, .06, { y: 1.05, yon: -1, oran: .42 }), M.perde, -1.68, 0, Z0 + .25);
  ekle(A, perdeG(.55, 2.74, 4, .06, { y: 1.05, yon: 1, oran: .42 }), M.perde, 2.02, 0, Z0 + .25);
  for (const [x, s] of [[-1.88, 1], [2.24, -1]]) { torna(A, [[0, 0], [.018, .01], [.022, .05], [.01, .09], [0, .1]], M.altin, x, 1.0, Z0 + .26, 10); silindir(A, .006, .006, .2, M.puskul, x + s * .02, .82, Z0 + .26, 6); }
  kutu(A, W - .4, .03, .04, M.kesit, .2, 2.76, Z0 + .21);
  // perdenin önünde sarkan pirinç bereket süsü ve püskül
  silindir(A, .004, .004, .78, M.altin, .95, 2.05, Z0 + .34, 6);
  torna(A, [[0, 0], [.03, .03], [.055, .1], [.05, .16], [.022, .22], [.008, .25], [0, .26]], M.altin, .95, 1.78, Z0 + .34, 16);
  silindir(A, .012, .045, .5, M.puskul, .95, 1.28, Z0 + .34, 12);

  /* ceviz king yatak: başlık sol duvarda, ayak TV ünitesine bakar */
  const yz = -1.6;
  ekle(g, sekilG(kemerSekli(1.98, 0, 1.0, 1.42), .07), M.cevizK, X0 + .01, 0, yz, Math.PI / 2);
  ekle(g, sekilG(kemerSekli(1.68, .5, 1.0, 1.3), .05), M.kadifeK, X0 + .07, 0, yz, Math.PI / 2);
  const dikme = [[0, 0], [.042, 0], [.042, .38], [.03, .42], [.046, .48], [.03, .54], [.036, 1.02], [.048, 1.07], [.03, 1.12], [.042, 1.2], [.018, 1.29], [.03, 1.36], [.012, 1.44], [0, 1.47]];
  for (const s of [-1, 1]) torna(g, dikme, M.cevizK, X0 + .08, 0, yz + s * 1.03);
  const ayakD = [[0, 0], [.03, 0], [.04, .08], [.028, .16], [.04, .24], [.042, .52], [.024, .58], [.03, .62], [0, .66]];
  for (const s of [-1, 1]) torna(g, ayakD, M.cevizK, -.1, 0, yz + s * 1.03);
  kutu(g, 2.04, .26, 1.98, M.ceviz, X0 + .08 + 1.02, .14, yz);                     // karyola kasası
  kutu(g, .05, .3, 1.98, M.cevizK, -.1, .2, yz);                                    // ayak tahtası
  yk(g, 2.0, .26, 1.92, .06, M.keten, X0 + .1 + 1.0, .4, yz);                       // şilte
  yk(g, 1.72, .08, 2.02, .035, M.keten, -1.0, .62, yz);                             // nevresim
  for (const s of [-1, 1]) yk(g, 1.72, .26, .035, .015, M.keten, -1.0, .42, yz + s * 1.0);
  yk(g, .48, .02, 2.06, .01, M.yesilAltin, -.55, .7, yz);                           // yeşil-altın yatak şalı
  for (const s of [-1, 1]) yk(g, .48, .26, .02, .008, M.yesilAltin, -.55, .45, yz + s * 1.03);
  for (const dz of [-.46, .46]) { const y = ekle(g, yastikG(.58, .84, .22), M.yastik, X0 + .3, .92, yz + dz); y.rotation.z = -1.2; y.rotation.y = dz * .06; }
  for (const dz of [-.44, .44]) { const y = ekle(g, yastikG(.44, .76, .16, .008), M.yastik, X0 + .62, .76, yz + dz); y.rotation.z = .42; y.rotation.y = -dz * .08; }

  /* komodinler + Osmanlı fener lambalar; pencere köşesinde ceviz dolap */
  const komodin = (z) => {
    kutu(g, .44, .54, .54, M.ceviz, X0 + .25, .06, z);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) kutu(g, .04, .06, .04, M.cevizK, X0 + .25 + sx * .19, 0, z + sz * .24);
    for (const y of [.12, .34]) { kutu(g, .012, .18, .46, M.cevizK, X0 + .475, y, z); ekle(g, new THREE.SphereGeometry(.016, 10, 8), M.altin, X0 + .49, y + .09, z); }
    kutu(g, .46, .025, .56, M.cevizK, X0 + .25, .6, z);
    const lx = X0 + .2, lz = z + (z < yz ? -.1 : .1);
    torna(g, [[0, 0], [.065, 0], [.07, .025], [.045, .05], [0, .05]], M.altin, lx, .625, lz, 16);
    silindir(g, .058, .058, .3, M.fener, lx, .675, lz, 12);
    torna(g, [[.068, 0], [.06, .05], [.024, .1], [.012, .14], [.024, .17], [0, .23]], M.altin, lx, .975, lz, 16);
    const isik = new THREE.PointLight(0xffb060, 2.4, 3.6, 1.6); isik.position.set(lx + .05, .85, lz); g.add(isik);
  };
  komodin(yz - 1.33); komodin(yz + 1.33);
  kutu(g, .2, .06, .16, M.siyah, X0 + .34, .625, yz - 1.22);                        // telefon
  kutu(g, .14, .08, .2, M.ceviz, X0 + .34, .625, yz + 1.22);                        // mendil kutusu
  for (const dz of [.14, .28]) kutu(g, .01, .1, .1, M.altin, X0 + .005, .9, yz + 1.25 + dz); // anahtar paneli
  kutu(g, .3, 1.35, .3, M.cevizK, X0 + .15, 0, Z0 + .15);                           // köşe dolabı
  kutu(g, .02, 1.1, .22, M.ceviz, X0 + .305, .12, Z0 + .15);

  /* yatak ayağında sedef kakmalı, kadife minderli bench */
  const bench = new THREE.Group(); bench.position.set(.2, 0, yz); g.add(bench);
  for (const s of [-1, 1]) ekle(bench, kemerliG(.46, .42, 1, .2, .05), M.sedefA, 0, 0, s * .7);
  for (const s of [-1, 1]) ekle(bench, kemerliG(1.36, .2, 4, .09, .04), M.sedefA, s * .21, .22, 0, Math.PI / 2);
  kutu(bench, .48, .03, 1.48, M.sedefA, 0, .42, 0);
  yk(bench, .5, .1, 1.5, .04, M.kadife, 0, .45, 0);
  yk(bench, .3, .03, .44, .01, M.cevizK, .02, .55, -.15); kutu(bench, .12, .005, .16, M.cicekB, .02, .58, -.05);

  /* pencere köşesi: sedef kakmalı koltuk + sekizgen sehpa */
  const kol = new THREE.Group(); kol.position.set(1.74, 0, -2.92); kol.rotation.y = -.55; g.add(kol);
  ekle(kol, kemerliG(.66, .42, 2, .2, .05), M.sedefK, 0, 0, .3);
  for (const s of [-1, 1]) ekle(kol, kemerliG(.62, .64, 1, .24, .05), M.sedefK, s * .33, 0, 0, Math.PI / 2);
  const sirt = new THREE.Shape(); sirt.moveTo(-.35, 0); sirt.lineTo(-.35, .96); sirt.quadraticCurveTo(-.22, .99, -.12, 1.03); sirt.quadraticCurveTo(-.03, 1.06, 0, 1.12); sirt.quadraticCurveTo(.03, 1.06, .12, 1.03); sirt.quadraticCurveTo(.22, .99, .35, .96); sirt.lineTo(.35, 0); sirt.lineTo(-.35, 0);
  ekle(kol, new THREE.ExtrudeGeometry(sirt, { depth: .06, bevelEnabled: true, bevelThickness: .008, bevelSize: .008, bevelSegments: 1 }), M.sedefK, 0, 0, -.34);
  for (const s of [-1, 1]) kutu(kol, .08, .03, .66, M.sedefK, s * .33, .64, 0);
  yk(kol, .58, .11, .56, .045, M.kadife, 0, .42, .02);
  yk(kol, .52, .4, .07, .03, M.kadife, 0, .5, -.27);
  silindir(g, .22, .22, .52, M.sedefS, .9, 0, -3.18, 8); silindir(g, .25, .25, .03, M.siyah, .9, .52, -3.18, 8);
  const kart = kutu(g, .11, .14, .01, M.cicekB, .9, .55, -3.2); kart.rotation.x = -.2;

  /* el dokuması ipek halı (yatak ile TV ünitesi arasında, boyuna) */
  const hl = ekle(g, new THREE.PlaneGeometry(1.24, 3.1), M.hali, 1.17, .008, -.95, 0, false); hl.rotation.x = -Math.PI / 2;

  /* sağ duvar: ceviz çalışma masası / konsol, üstünde çerçeveli 40" TV ve kemerli ayna */
  const ux = X1 - .24, uz0 = -2.55, uz1 = .75, uzc = (uz0 + uz1) / 2, ul = uz1 - uz0;
  kutu(g, .48, .7, ul, M.ceviz, ux, .05, uzc); kutu(g, .5, .03, ul + .02, M.cevizK, ux - .01, .75, uzc);
  kutu(g, .46, .05, ul - .04, M.cevizK, ux + .01, 0, uzc);
  for (let i = 0; i < 5; i++) { const z = uz0 + .33 + i * (ul - .66) / 4; kutu(g, .012, .2, .58, M.cevizK, ux - .245, .5, z); ekle(g, new THREE.SphereGeometry(.017, 10, 8), M.beyaz, ux - .26, .6, z); }
  const sag = Dw.sag.ekli;
  kutu(sag, .04, 1.8, ul, M.lambri, X1 - .02, .78, uzc);                              // ceviz lambri pano
  kutu(sag, .07, .74, 1.12, M.cevizK, X1 - .06, 1.1, yz); kutu(sag, .012, .52, .9, M.ekran, X1 - .1, 1.21, yz);
  ekle(sag, sekilG(kemerSekli(.64, 0, .8, 1.16), .04), M.cevizK, X1 - .07, .98, .05, -Math.PI / 2);
  ekle(sag, new THREE.ShapeGeometry(kemerSekli(.52, .06, .78, 1.08), 16), M.ayna, X1 - .125, .98, .05, -Math.PI / 2, false);
  kutu(sag, .05, .02, ul, M.led, X1 - .05, 2.56, uzc);
  silindir(g, .07, .05, .18, M.altin, ux - .02, .78, .5, 16);                    // vazo ve çiçekler
  for (let i = 0; i < 14; i++) ekle(g, new THREE.SphereGeometry(.045 + rnd() * .03, 10, 8), rnd() < .55 ? M.cicekP : M.cicekB, ux - .02 + (rnd() - .5) * .22, 1.0 + rnd() * .12, .5 + (rnd() - .5) * .26);
  for (let i = 0; i < 6; i++) ekle(g, new THREE.SphereGeometry(.035, 8, 6), M.yesil, ux - .02 + (rnd() - .5) * .26, .96, .5 + (rnd() - .5) * .3);
  yk(g, .34, .03, .26, .01, M.cevizK, ux - .02, .78, -2.25);                          // tepsi
  yk(g, .38, .09, .38, .035, M.kadife, ux - .4, .42, -.3);                           // tabure
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const b = kutu(g, .025, .42, .025, M.cevizK, ux - .4 + sx * .14, 0, -.3 + sz * .14); b.rotation.z = sx * .08; }

  /* giriş: kakmalı ceviz gardırop (sağ), giriş kapısı (ön) */
  const gx = X1 - .3, gz0 = 1.35, gz1 = 2.95, gzc = (gz0 + gz1) / 2;
  S.ustune('sag', kutu(g, .6, 2.45, gz1 - gz0, M.ceviz, gx, 0, gzc));                 // gömme gardırop: duvarla birlikte kesilir
  S.ustune('sag', kutu(g, .62, .02, gz1 - gz0 + .02, M.kesit, gx, 2.45, gzc));
  kutu(Dw.sag.kap, .601, .02, gz1 - gz0 + .001, M.cevizK, gx, KES - .02, gzc);
  for (let i = 0; i < 4; i++) {
    const z = gz0 + .2 + i * .4;
    S.ustune('sag', kutu(g, .012, 2.29, .38, M.kakma, gx - .305, .08, z));
    S.ustune('sag', ekle(g, new THREE.CylinderGeometry(.012, .012, .16, 10), M.cicekB, gx - .32, 1.15, z + (i % 2 ? -.17 : .17)));
  }
  kutu(Dw.on.ekli, .9, 2.15, .05, M.kakma, 1.25, 0, Z1 - .02);
  for (const x of [.77, 1.73]) kutu(Dw.on.ekli, .07, 2.22, .04, M.cevizK, x, 0, Z1 - .02);
  kutu(Dw.on.ekli, 1.03, .07, .04, M.cevizK, 1.25, 2.15, Z1 - .02);
  kutu(g, .9, .012, .14, M.mermerZ, 1.25, 0, Z1 + t / 2);
  ekle(Dw.on.ekli, new THREE.SphereGeometry(.03, 12, 8), M.altin, .9, 1.05, Z1 - .06);

  /* çinili mermer banyo: kurnalı duş köşesi, ceviz lavabo dolabı + kemerli ayna, klozet */
  const bx = X0;
  // kurna: oymalı mermer gövde, yuvarlak taş tekne, pirinç musluk ve hamam tası
  kutu(g, .38, .5, .55, M.mermerZ, bx + .19, 0, 1.75);
  ekle(g, sekilG(kemerSekli(.4, .05, .3, .44), .015), M.mermerZ, bx + .385, 0, 1.75, Math.PI / 2);
  kutu(g, .4, .04, .57, M.mermerZ, bx + .2, .5, 1.75);
  torna(g, [[0, 0], [.18, 0], [.21, .03], [.215, .12], [.19, .125], [.165, .05], [.1, .03], [0, .03]], M.mermerZ, bx + .21, .54, 1.75, 40);
  silindir(g, .03, .036, .03, M.altin, bx + .02, .82, 1.75, 16);
  ekle(g, boruG([[0, 0, 0], [.05, .0, 0], [.1, -.02, 0], [.13, -.07, 0]], .012), M.altin, bx + .02, .83, 1.75);
  torna(g, [[0, 0], [.03, 0], [.022, .012], [0, .014]], M.altin, bx + .03, .9, 1.75, 16);                      // musluk başı
  torna(g, [[0, 0], [.045, 0], [.075, .03], [.085, .055], [.08, .058], [.07, .032], [.04, .008], [0, .008]], M.altin, bx + .33, .66, 1.58, 28); // hamam tası
  ekle(g, new THREE.PlaneGeometry(.85, 2.0), M.cam, bx + 1.12, 1.0, BZ + .43, Math.PI / 2, false);   // duş camı
  kutu(g, .03, .02, .86, M.altin, bx + 1.12, 0, BZ + .43);                                             // cam alt profili
  // duş: yağmur başlığı, el duşu sürgüsü, termostatik batarya (duvar tam boyken görünür)
  ekle(Dw.sol.ekli, boruG([[0, 0, 0], [.18, 0, 0], [.3, -.04, 0]], .011), M.altin, bx + .01, 2.12, 1.75);
  silindir(Dw.sol.ekli, .12, .12, .012, M.altin, bx + .32, 2.06, 1.75, 40);
  silindir(Dw.sol.ekli, .008, .008, .75, M.altin, bx + .04, 1.0, 2.0, 10);
  const el = ekle(Dw.sol.ekli, new THREE.CylinderGeometry(.035, .02, .2, 16), M.altin, bx + .07, 1.62, 2.0); el.rotation.z = -.4;
  const ter = silindir(Dw.sol.ekli, .075, .075, .012, M.altin, bx + .01, 1.05, 1.75, 32); ter.rotation.z = Math.PI / 2; ter.position.set(bx + .01, 1.05, 1.75);
  const tk = silindir(Dw.sol.ekli, .022, .022, .05, M.altin, bx + .04, 1.05, 1.75, 16); tk.rotation.z = Math.PI / 2; tk.position.set(bx + .04, 1.05, 1.75);
  // lavabo: kapaklı ceviz dolap, profilli mermer tezgâh, tezgâh üstü seramik çanak, kuğu boyunlu pirinç batarya
  kutu(g, .5, .72, .95, M.ceviz, bx + .25, .08, 2.95);
  for (const dz of [-.235, .235]) { kutu(g, .012, .58, .44, M.cevizK, bx + .505, .15, 2.95 + dz); ekle(g, new THREE.SphereGeometry(.014, 10, 8), M.altin, bx + .52, .62, 2.95 + dz * .25); }
  kutu(g, .48, .08, .93, M.cevizK, bx + .25, 0, 2.95);
  yk(g, .56, .045, 1.02, .012, M.mermerZ, bx + .28, .8, 2.95);
  torna(g, [[0, 0], [.07, 0], [.13, .03], [.17, .09], [.18, .13], [.17, .135], [.155, .095], [.11, .045], [0, .03]], M.seramik, bx + .3, .845, 2.95, 40);
  silindir(g, .022, .026, .03, M.altin, bx + .06, .845, 2.95, 16);
  ekle(g, boruG([[0, 0, 0], [0, .2, 0], [.03, .27, 0], [.1, .285, 0], [.16, .24, 0], [.17, .21, 0]], .011), M.altin, bx + .06, .87, 2.95);
  const batKol = kutu(g, .06, .012, .016, M.altin, bx + .08, 1.0, 2.95); batKol.rotation.z = .3;
  // havlular (katlanmış yığın + rulo), buklet tepsisi ve şişeler, sabunluk
  yk(g, .3, .045, .24, .018, M.havlu, bx + .27, .845, 2.59); yk(g, .28, .042, .22, .018, M.havlu, bx + .275, .89, 2.59);
  for (const dz of [.29, .37]) { const r = ekle(g, new THREE.CylinderGeometry(.04, .04, .24, 18), M.havlu, bx + .22, .885, 2.95 + dz); r.rotation.z = Math.PI / 2; }
  yk(g, .16, .015, .24, .006, M.cevizK, bx + .12, .845, 3.33);
  for (const [dz, h] of [[-.07, .12], [0, .14], [.07, .1]]) { silindir(g, .022, .024, h, M.seramik, bx + .12, .86, 3.33 + dz, 16); silindir(g, .012, .012, .02, M.altin, bx + .12, .86 + h, 3.33 + dz, 12); }
  torna(g, [[0, 0], [.04, 0], [.055, .015], [.05, .02], [.035, .008], [0, .008]], M.altin, bx + .45, .845, 3.33, 20);
  ekle(Dw.sol.ekli, sekilG(kemerSekli(.72, 0, .7, 1.06), .03), M.cevizK, bx + .01, 1.1, 2.95, Math.PI / 2);
  ekle(Dw.sol.ekli, new THREE.ShapeGeometry(kemerSekli(.6, .05, .69, .99), 16), M.ayna, bx + .056, 1.1, 2.95, Math.PI / 2, false);
  for (const z of [2.42, 3.48]) silindir(Dw.sol.ekli, .035, .05, .2, M.fener, bx + .1, 1.75, z, 8);
  // klozet: oval ayak ve hazne, oturak halkası, kapak, sifon deposu ve basma düğmesi (ön duvara yaslı)
  const kz = new THREE.Group(); kz.position.set(-.75, 0, Z1 - .34); g.add(kz);
  const ayakK = torna(kz, [[0, 0], [.12, 0], [.115, .04], [.1, .18], [.13, .29], [.175, .36], [.195, .395], [0, .395]], M.seramik, 0, 0, 0, 40); ayakK.scale.z = 1.32;
  const hazne = torna(kz, [[.195, .395], [.19, .41], [.15, .405], [.12, .33], [.05, .28], [0, .275]], M.seramik, 0, 0, 0, 40); hazne.scale.z = 1.32;
  const otur = ekle(kz, new THREE.TorusGeometry(.158, .02, 12, 48), M.seramik, 0, .422, 0); otur.rotation.x = Math.PI / 2; otur.scale.y = 1.3;
  const kpk = ekle(kz, new THREE.CylinderGeometry(.18, .18, .018, 48), M.seramik, 0, .45, -.005); kpk.scale.z = 1.28;
  yk(kz, .4, .36, .17, .035, M.seramik, 0, .4, .24); yk(kz, .42, .03, .19, .012, M.seramik, 0, .76, .24);
  silindir(kz, .026, .026, .008, M.altin, 0, .79, .24, 24);
  // tuvalet kâğıtlığı (bölmede, klozetin yanında) ve yumuşak banyo paspası
  kutu(g, .02, .03, .12, M.altin, BX - .06, .5, Z1 - .5); const rulo = ekle(g, new THREE.CylinderGeometry(.055, .055, .1, 20), M.havlu, BX - .12, .47, Z1 - .5); rulo.rotation.x = Math.PI / 2;
  yk(g, .42, .025, .62, .012, M.havlu, -.15, 0, 2.55);

  /* gerçekçilik katmanı (ucuz "ortam gölgesi"): eşyaların altında yumuşak gölge, duvar diplerinde kararma,
     tam boy duvarlarda gizli LED'in yaydığı sıcak ışık, fenerlerin çevresinde hale */
  const golM = new THREE.MeshBasicMaterial({ map: golgeDoku(), transparent: true, depthWrite: false, opacity: .5, polygonOffset: true, polygonOffsetFactor: -2 });
  const golge = (w, d, x, z, ry = 0, op = 1, y = .004) => {
    const m = op === 1 ? golM : Object.assign(golM.clone(), { opacity: .5 * op });
    const o = ekle(g, new THREE.PlaneGeometry(w * 1.45, d * 1.45), m, x, y, z, 0, false); o.rotation.set(-Math.PI / 2, 0, ry); o.receiveShadow = false; o.renderOrder = 1; o.userData.sahte = 1; return o;
  };
  golge(2.2, 2.1, -1.2, yz, 0, 1.1); golge(.48, .58, X0 + .25, yz - 1.33); golge(.48, .58, X0 + .25, yz + 1.33); golge(.34, .34, X0 + .15, Z0 + .15);
  golge(.5, 1.5, .2, yz, 0, .9); golge(.72, .72, 1.74, -2.92, -.55); golge(.48, .48, .9, -3.18); golge(.5, 3.3, ux, uzc); golge(.4, .4, ux - .4, -.3, 0, .7);
  golge(.62, 1.62, gx, gzc); golge(.52, .97, bx + .25, 2.95, 0, .9, .008); golge(.4, .57, bx + .19, 1.75, 0, .9, .008); golge(.42, .6, -.75, Z1 - .25, 0, .8, .008);
  const dipM = new THREE.MeshBasicMaterial({ map: gecis('20,12,6', .42), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
  const dip = (uz, x, z, aci, y = .0035) => { const o = ekle(g, new THREE.PlaneGeometry(uz, .42), dipM, x, y, z, 0, false); o.rotation.set(-Math.PI / 2, 0, aci); o.receiveShadow = false; o.renderOrder = 1; o.userData.sahte = 1; };
  dip(BZ - Z0, X0 + .21, (Z0 + BZ) / 2, Math.PI / 2); dip(Z1 - BZ, X0 + .21, (BZ + Z1) / 2, Math.PI / 2, .007);
  dip(D, X1 - .21, 0, -Math.PI / 2); dip(W, 0, Z0 + .21, 0); dip(X1 - BX, (BX + X1) / 2, Z1 - .21, Math.PI);
  dip(BX - X0, (X0 + BX) / 2, BZ - .26, Math.PI); dip(BX - X0, (X0 + BX) / 2, BZ + .26, 0, .007);
  dip(Z1 - BZ, BX + .26, (BZ + Z1) / 2, Math.PI / 2); dip(Z1 - BZ, BX - .26, (BZ + Z1) / 2, -Math.PI / 2, .007);
  const isikM = new THREE.MeshBasicMaterial({ map: gecis('255,196,128', .38), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const yay = (ad, uz, x, z, ry) => { S.ustune(ad, ekle(g, new THREE.PlaneGeometry(uz, 1.1), isikM, x, H - .7, z, ry, false)).userData.sahte = 1; };
  yay('sol', D - .1, X0 + .006, 0, Math.PI / 2); yay('sag', D - .1, X1 - .14, 0, -Math.PI / 2); yay('arka', W - .1, 0, Z0 + .006, 0); yay('on', W - .1, 0, Z1 - .006, Math.PI);
  const haleM = new THREE.SpriteMaterial({ map: hale(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .85 });
  for (const z of [yz - 1.43, yz + 1.43]) { const h = new THREE.Sprite(haleM); h.scale.set(.75, .75, 1); h.position.set(X0 + .2, .83, z); h.userData.sahte = 1; g.add(h); }

  return { ...META['deluxe-vertical-king'], duvarlar: Object.values(Dw), bahce: bah };
}
/* =====================================================================
   AJWA Sultanahmet — binanın dış maketi (Odalarımız sayfası hero'su)
   Kaynaklar: sitedeki cephe/gece/giriş fotoğrafları (g-facade, g-night, g-entrance, intro-entrance),
   OpenStreetMap bina izi (Piyer Loti Cd. 30 yanındaki 8 katlı blok ≈ 30 × 17 m), "9 kat · çatıda Zeferan" bilgisi.
   Kurgu: x uzun cephe (güney, +z'ye bakar), z kısa cephe (doğu, +x'e bakar); giriş köşkü doğu cephesinde güneydoğu köşede.
   Gece sahnesi: cephe aydınlatması Blender'da pişirilir; pencereler, kemerli giriş ve çatı camı kendi ışığını saçar.
   Not: gerçek girişteki yıldızlı geçme oymaları kullanılmaz (yıldız motifi yasağı) — rumi kıvrım ve kemer kafesi konur.
   ===================================================================== */
// kumtaşı: bal rengi, sıra sıra düzgün kesme taş, ince derzler
const kumtasi = (L = 70) => doku(512, 512, (g, w, h) => {
  g.fillStyle = `hsl(37,52%,${L}%)`; g.fillRect(0, 0, w, h);
  const sira = 8, sh = h / sira;
  for (let i = 0; i < sira; i++) {
    let x = -rnd() * 120;
    while (x < w) {
      const l = 120 + rnd() * 140; g.fillStyle = `hsla(${33 + rnd() * 8},${45 + rnd() * 15}%,${L - 6 + rnd() * 10}%,.55)`; g.fillRect(x, i * sh, l, sh);
      for (let k = 0; k < 20; k++) { g.fillStyle = `rgba(${rnd() < .5 ? '255,240,210' : '120,85,40'},${rnd() * .08})`; g.fillRect(x + rnd() * l, i * sh + rnd() * sh, 2 + rnd() * 6, 1 + rnd() * 2); }
      g.fillStyle = 'rgba(110,80,45,.28)'; g.fillRect(x, i * sh, 1.5, sh); x += l;
    }
    g.fillStyle = 'rgba(110,80,45,.3)'; g.fillRect(0, i * sh, w, 1.5);
  }
});
// yivli pilaster: dikey oluklar
const yivli = () => doku(256, 64, (g, w, h) => {
  g.fillStyle = 'hsl(38,50%,72%)'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, 'rgba(110,78,40,.32)'); gr.addColorStop(.35, 'rgba(255,240,210,.18)'); gr.addColorStop(.7, 'rgba(255,240,210,.05)'); gr.addColorStop(1, 'rgba(110,78,40,.3)'); g.fillStyle = gr; g.fillRect(x + 4, 0, 24, h); }
});
// beyaz mermer üzerine rumi kıvrım oyma (yıldızsız)
const rumiOyma = (zemin = '#ece7dd', cizgi = 'rgba(150,135,110,.55)') => doku(256, 256, (g, w, h) => {
  g.fillStyle = zemin; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '255,255,255' : '160,150,135'},${rnd() * .1})`; g.fillRect(rnd() * w, rnd() * h, 10 + rnd() * 30, 1 + rnd() * 2); }
  g.strokeStyle = cizgi; g.lineWidth = 3; g.lineCap = 'round';
  const kivrim = (cx, cy, s, a) => {
    g.save(); g.translate(cx, cy); g.rotate(a); g.scale(s, s);
    g.beginPath(); g.moveTo(-60, 0); g.bezierCurveTo(-40, -40, 10, -40, 20, -10); g.bezierCurveTo(28, 14, 0, 26, -10, 10); g.bezierCurveTo(-16, 0, -4, -10, 4, -4); g.stroke();
    g.beginPath(); g.moveTo(20, -10); g.bezierCurveTo(40, -30, 62, -22, 60, 0); g.stroke();
    g.beginPath(); g.moveTo(-30, -22); g.quadraticCurveTo(-36, -44, -18, -50); g.stroke();
    g.restore();
  };
  for (const [x, y, a] of [[64, 64, 0], [192, 64, Math.PI], [64, 192, Math.PI], [192, 192, 0], [128, 128, Math.PI / 2], [0, 128, -Math.PI / 2], [256, 128, -Math.PI / 2], [128, 0, Math.PI / 2], [128, 256, Math.PI / 2]]) kivrim(x, y, .9, a);
});
// çini pano (kobalt/turkuaz, lale ve yaprak; yıldızsız)
const ciniPano = () => doku(256, 128, (g, w, h) => {
  g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1f4f8f'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  g.strokeStyle = '#2a8a86'; g.lineWidth = 2; g.strokeRect(10, 10, w - 20, h - 20);
  const yap = (x, y, r, a, c) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = c; g.beginPath(); g.moveTo(0, -r); g.bezierCurveTo(r * .6, -r * .5, r * .45, r * .6, 0, r); g.bezierCurveTo(-r * .2, r * .3, -r * .3, -r * .4, 0, -r); g.fill(); g.restore(); };
  for (const cx of [64, 192]) { g.strokeStyle = '#1f4f8f'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(cx, 108); g.bezierCurveTo(cx - 20, 80, cx + 20, 50, cx, 26); g.stroke(); yap(cx - 16, 84, 16, -1, '#2a8a86'); yap(cx + 16, 66, 15, 1, '#1f4f8f'); g.fillStyle = '#b8322a'; g.beginPath(); g.moveTo(cx - 10, 32); g.quadraticCurveTo(cx - 10, 12, cx - 3, 20); g.quadraticCurveTo(cx, 6, cx + 3, 20); g.quadraticCurveTo(cx + 10, 12, cx + 10, 32); g.quadraticCurveTo(cx, 40, cx - 10, 32); g.fill(); }
  g.fillStyle = '#1f4f8f'; g.beginPath(); g.arc(128, 64, 14, 0, TAM); g.fill(); g.fillStyle = '#f2f0ea'; g.beginPath(); g.arc(128, 64, 8, 0, TAM); g.fill();
});
// ferforje balkon korkuluğu (saydam zemin): dikey çubuklar ve kıvrımlar
const korkulukDoku = () => doku(256, 96, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.strokeStyle = '#1b1612'; g.lineWidth = 5; g.strokeRect(2, 2, w - 4, h - 4);
  g.lineWidth = 3; for (let x = 16; x < w; x += 16) { g.beginPath(); g.moveTo(x, 4); g.lineTo(x, h - 4); g.stroke(); }
  g.lineWidth = 2.5; for (let x = 32; x < w; x += 64) { g.beginPath(); g.arc(x, h / 2, 14, 0, TAM); g.stroke(); g.beginPath(); g.arc(x + 32, h / 2, 9, 0, TAM); g.stroke(); }
});
// aydınlık pencere: sıcak ışık, tül perde kıvrımları (gece içeriden yanar)
const pencereIsik = (p) => doku(128, 192, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, `rgba(255,${200 * p | 0},${120 * p | 0},1)`); gr.addColorStop(1, `rgba(${220 * p | 0},${150 * p | 0},${80 * p | 0},1)`); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 8) { g.fillStyle = `rgba(90,55,25,${.08 + rnd() * .1})`; g.fillRect(x, 0, 3, h); }
  for (const x of [0, w - 26]) { g.fillStyle = 'rgba(70,40,18,.55)'; g.fillRect(x, 0, 26, h); }
});
// ışıklı mermer kafes (giriş kemeri): sıcak ışık sızan kemerli delikler
const jaliDoku = () => doku(128, 128, (g, w, h) => {
  g.fillStyle = '#efe6d4'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const cx = x * 32 + 16 + (y % 2) * 16, cy = y * 32 + 18;
    g.fillStyle = '#ffd9a0'; g.beginPath(); g.moveTo(cx - 8, cy + 9); g.lineTo(cx - 8, cy - 2); g.quadraticCurveTo(cx - 8, cy - 10, cx, cy - 13); g.quadraticCurveTo(cx + 8, cy - 10, cx + 8, cy - 2); g.lineTo(cx + 8, cy + 9); g.closePath(); g.fill();
  }
}, [6, 6]);
// yeşil boyalı saçak altı: kenar şeritleri ve kalem işi kıvrımlar
// yeşil saçak altı: ince tahta lambri, kenarda kiremit kırmızısı şerit
const sacakAlti = () => doku(256, 256, (g, w, h) => {
  g.fillStyle = '#86a874'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 8) { g.fillStyle = `rgba(${rnd() < .5 ? '40,70,35' : '230,240,200'},${.08 + rnd() * .08})`; g.fillRect(x, 0, 2, h); }
  g.fillStyle = '#a9563c'; g.fillRect(0, h - 22, w, 10); g.fillStyle = 'rgba(240,226,180,.55)'; g.fillRect(0, h - 34, w, 3);
}, [1, 1]);
// mansart çatının koyu gri metal kaplaması: dikiş çizgileri
const catiMetal = () => doku(256, 256, (g, w, h) => {
  g.fillStyle = '#4c515d'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(20,22,28,.45)'; g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(160,168,185,.18)'; g.fillRect(x + 3, 0, 2, h); }
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '255,255,255' : '0,0,0'},${rnd() * .05})`; g.fillRect(rnd() * w, rnd() * h, 6, 6); }
});
// cam aydınlık (çatıdaki Zeferan): koyu lacivert kayıtlar arasında sıcak ışık
const aydinlikDoku = () => doku(128, 128, (g, w, h) => {
  g.fillStyle = '#ffd59a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1d2a4a'; g.lineWidth = 6; for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}, [4, 2]);
// Zeferan cam bandı: dikey kayıtlar arasında sıcak ışık
const zeferanBant = () => doku(256, 64, (g, w, h) => {
  g.fillStyle = '#ffcf8c'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 32) { g.fillStyle = '#20283a'; g.fillRect(x, 0, 5, h); }
  g.fillStyle = '#20283a'; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5);
  for (let i = 0; i < 12; i++) { g.fillStyle = `rgba(120,70,30,${.1 + rnd() * .15})`; g.fillRect(rnd() * w, 8, 10 + rnd() * 20, h - 16); }
}, [12, 1]);
const kaldirimDoku = () => doku(256, 256, (g, w, h) => {
  g.fillStyle = '#8d8478'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 * 16; x < w; x += 32) { g.fillStyle = `hsl(32,${8 + rnd() * 8}%,${48 + rnd() * 12}%)`; g.fillRect(x + 2, y + 2, 28, 28); }
}, [10, 10]);
const parkeTasi = () => doku(256, 256, (g, w, h) => {
  g.fillStyle = '#3d3934'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 22) for (let x = (y / 22) % 2 * 11; x < w; x += 22) { g.fillStyle = `hsl(28,${6 + rnd() * 6}%,${26 + rnd() * 12}%)`; g.beginPath(); g.ellipse(x + 11, y + 11, 9.5, 9.5, 0, 0, TAM); g.fill(); }
}, [14, 14]);

// halka parçası (yuvarlak kemer taşı, kemer pervazı): merkez etrafında a0→a1, yarıçap r1→r2, kalınlık d (z yönünde)
function halkaG(r1, r2, a0, a1, d, seg = 10) {
  const s = new THREE.Shape(); s.absarc(0, 0, r2, a0, a1, false); s.absarc(0, 0, r1, a1, a0, true); s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: seg });
}
// sivri kemer yayı (iki yay, tepede birleşir): üzengi y=0, açıklık 2r, yükseklik k·r
function sivriYol(s, r, k, ters) {
  const c = r * .55; // iki merkez: ±c
  const R = r + c, ust = Math.sqrt(R * R - c * c) * Math.min(1, k);
  if (!ters) { s.lineTo(-r, 0); s.quadraticCurveTo(-r, ust * .78, 0, ust); s.quadraticCurveTo(r, ust * .78, r, 0); }
  else { s.lineTo(r, 0); s.quadraticCurveTo(r, ust * .78, 0, ust); s.quadraticCurveTo(-r, ust * .78, -r, 0); }
  return ust;
}
// sivri kemer pervazı (halka): iç açıklık 2r, kalınlık t, derinlik d
function sivriHalkaG(r, t, d) {
  const s = new THREE.Shape(); s.moveTo(-r - t, 0); sivriYol(s, r + t, 1); s.lineTo(r, 0); sivriYol(s, r, 1, true); s.lineTo(-r - t, 0);
  return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 10 });
}
// sivri kemerli dikdörtgen (pencere): genişlik w, alt y0, üzengi y1
function sivriPencere(w, y0, y1) { const s = new THREE.Shape(), r = w / 2; s.moveTo(-r, y0); s.lineTo(-r, y1); const q = new THREE.Shape(); void q; s.quadraticCurveTo(-r, y1 + r * 1.05, 0, y1 + r * 1.35); s.quadraticCurveTo(r, y1 + r * 1.05, r, y1); s.lineTo(r, y0); s.lineTo(-r, y0); return s; }
// sivri kemer şekli (giriş): genişlik w, üzengi yüksekliği h1, tepe h2, alt y0
function sivriKemer(w, y0, h1, h2) {
  const s = new THREE.Shape(), r = w / 2;
  s.moveTo(-r, y0); s.lineTo(-r, h1); s.quadraticCurveTo(-r, h1 + (h2 - h1) * .72, 0, h2); s.quadraticCurveTo(r, h1 + (h2 - h1) * .72, r, h1); s.lineTo(r, y0); s.lineTo(-r, y0); return s;
}
// yuvarlak kemerli dikdörtgen (podyum kemer açıklığı)
function kemerliDik(w, y0, h1) { const s = new THREE.Shape(), r = w / 2; s.moveTo(-r, y0); s.lineTo(-r, h1); s.absarc(0, h1, r, Math.PI, 0, true); s.lineTo(r, y0); s.lineTo(-r, y0); return s; }
// dışbükey çokgeni (x,z noktaları) d kadar içe (d<0: dışa) kaydırır: kenarlar paralel ötelenir, komşu kenarların kesişimi yeni köşe
function icCokgen(P, d) {
  const n = P.length, cx = P.reduce((s, p) => s + p[0], 0) / n, cz = P.reduce((s, p) => s + p[1], 0) / n, hat = [];
  for (let i = 0; i < n; i++) {
    const a = P[i], b = P[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    let nx = -dz / L, nz = dx / L; const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    if ((cx - mx) * nx + (cz - mz) * nz < 0) { nx = -nx; nz = -nz; }    // iç normal
    hat.push({ x: a[0] + nx * d, z: a[1] + nz * d, dx, dz });
  }
  return hat.map((h1, i) => {
    const h0 = hat[(i - 1 + n) % n], det = h0.dx * h1.dz - h0.dz * h1.dx, t = ((h1.x - h0.x) * h1.dz - (h1.z - h0.z) * h1.dx) / det;
    return [h0.x + h0.dx * t, h0.z + h0.dz * t];
  });
}
// çokgen prizma (dikey): taban y0, yükseklik h; yan duvar UV'si dünya ölçüsünde (m)
function prizmaG(P, h) { const s = new THREE.Shape(P.map(([x, z]) => new THREE.Vector2(x, -z))); const geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); return geo; }
// kesik çokgen piramit (mansart kademesi): alt çokgen A (y=0) → iç çokgen B (y=h); yalnız eğik yan yüzler
function kesikCokgenG(A, B, h) {
  const poz = [], uv = [], n = A.length;
  for (let i = 0; i < n; i++) {
    const a0 = A[i], a1 = A[(i + 1) % n], b0 = B[i], b1 = B[(i + 1) % n], en = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]), eg = Math.hypot(h, Math.hypot(b0[0] - a0[0], b0[1] - a0[1]));
    const q = [[a0[0], 0, a0[1], 0, 0], [a1[0], 0, a1[1], en, 0], [b1[0], h, b1[1], en, eg], [b0[0], h, b0[1], 0, eg]];
    // yüz normali dışarı ve yukarı baksın (ters sarım Blender'da 'aşağı bakan yüz' sayılıp ışıktan çıkıyordu)
    const ux = q[1][0] - q[0][0], uz = q[1][2] - q[0][2], vx = q[3][0] - q[0][0], vy = h, vz = q[3][2] - q[0][2], ny = uz * vx - ux * vz;
    for (const k of (ny >= 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2])) { poz.push(q[k][0], q[k][1], q[k][2]); uv.push(q[k][3] / 1.6, q[k][4] / 1.6); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(poz, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.computeVertexNormals(); return geo;
}

function ajwaSultanahmet(sahne) {
  const g = new THREE.Group(); g.name = 'oda'; sahne.add(g);
  /* Plan (OpenStreetMap bina izi + kuşbakışı fotoğraf): 30 × 17 m; güneydoğu köşe tam boy 45° pahlı (≈ 6,9 m) —
     giriş bu çapraz yüzde. Güney cephe 25 m / 8 aks, pah 2 aks, doğu cephe 12 m / 4 aks, kuzey 10, batı 5 aks. */
  // OSM bina izi (way 526321933) güney cepheye hizalanmış hâli (three: x doğu, z güney): doğu cephe 26° eğik, pah güney cepheyle 54°
  const PLAN = [[-17.2, 8.9], [-17.3, -8.9], [11.72, -8.25], [17.31, 3.34], [13.24, 8.9]];
  const LX = 30, LZ = 17.8, X1 = 17.31, Z1 = 8.9;
  const KEN = PLAN.map((a, i) => {                       // kenar bilgisi: uzunluk, orta, dış normal, cephe dönüşü
    const b = PLAN[(i + 1) % PLAN.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let n = [(b[1] - a[1]) / L, -(b[0] - a[0]) / L]; if (n[0] * m[0] + n[1] * m[1] < 0) n = [-n[0], -n[1]];
    return { a, b, L, m, n, ry: Math.atan2(n[0], n[1]) };
  });
  const PODYUM = 7.3, KAT = 3.15, UST = PODYUM + 6 * KAT /* 26.2 */, ATIK0 = 26.9, ATIK1 = 30.1, SACAK = 1.85;
  const M = {
    tasBal: mat({ map: kumtasi(68), roughness: .85 }), tasAcik: mat({ map: kumtasi(76), roughness: .8 }), yivli: mat({ map: yivli(), roughness: .8 }),
    mermer: mat({ map: rumiOyma('#efebe3', 'rgba(150,135,110,.0)'), roughness: .5 }), mermerOyma: mat({ map: rumiOyma(), roughness: .55 }),
    friz: mat({ map: rumiOyma('#e9e2d4', 'rgba(130,110,80,.7)'), roughness: .6 }), ablaqK: mat({ color: 0x8a3a30, roughness: .55 }),
    tasKoyu: mat({ color: 0x8f877b, roughness: .9 }), ciniPano: mat({ map: ciniPano(), roughness: .3 }), ciniBant: mat({ map: ciniPano(), roughness: .3 }),
    korkuluk: mat({ map: korkulukDoku(), transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .5 }), siyah: mat({ color: 0x1b1714, roughness: .5, metalness: .4 }),
    pencereA: null, pencereB: null, vitrin: null, zeferanCam: null, jali: null, kubbeCam: null, zeferanBant: null,
    kakma: mat({ map: kakmaKapak(), roughness: .45 }), altin: mat({ color: 0xc09a5a, metalness: .85, roughness: .3 }),
    sacakAlt: mat({ map: sacakAlti(), roughness: .8, side: THREE.DoubleSide }), sacakYuz: mat({ color: 0xa9563c, roughness: .7 }), konsol: mat({ color: 0xa9563c, roughness: .7 }),
    cati: mat({ map: catiMetal(), roughness: .6, metalness: .2, side: THREE.DoubleSide }), catiDuz: mat({ color: 0x5a5e66, roughness: .9 }),
    kaldirim: mat({ map: kaldirimDoku(), roughness: .9 }), yol: mat({ map: parkeTasi(), roughness: .95 }), taban: mat({ color: 0x241b15, roughness: .8 }), kesit: mat({ color: 0x16110e, roughness: .7 }),
    agac: mat({ color: 0x3b5a2e, roughness: 1 }), govde: mat({ color: 0x4a3a2c, roughness: 1 }),
    fenerSokak: new THREE.MeshStandardMaterial({ color: 0xffe0a8, emissive: 0xffc070, emissiveIntensity: 2, roughness: .4 })
  };
  const isikli = (d, e = 1, ek = {}) => new THREE.MeshStandardMaterial({ map: d, emissiveMap: d, emissive: 0xffffff, emissiveIntensity: e, roughness: .3, ...ek });
  M.pencereA = isikli(pencereIsik(1)); M.pencereB = isikli(pencereIsik(.55), .55); M.vitrin = isikli(pencereIsik(.8), .8, { roughness: .2 });
  M.zeferanCam = isikli(pencereIsik(1.1), 1.3, { roughness: .2 }); M.jali = isikli(jaliDoku(), 1, { emissive: 0xffe2b0, roughness: .5 });
  M.kubbeCam = isikli(aydinlikDoku(), 1, { roughness: .2 }); M.zeferanBant = isikli(zeferanBant(), 1.2, { roughness: .2 });
  M.tasBal.map.repeat.set(1 / 4, 1 / 4); M.tasAcik.map.repeat.set(1 / 4, 1 / 4); M.mermerOyma.map.repeat.set(1, 1);
  M.sacakAlt.map.repeat.set(1 / 2.5, 1 / 2.5); M.zeferanBant.map.repeat.set(1 / 2.5, 1);
  for (const [k, m] of Object.entries(M)) m.name = k;
  const prizma = (P, y0, h, m) => ekle(g, prizmaG(P, h), m, 0, y0, 0);

  /* ana kütle: pahlı plan boyunca podyum mermeri, kumtaşı gövde, çatı katı */
  prizma(PLAN, 0, PODYUM, M.mermerOyma); prizma(PLAN, PODYUM, UST - PODYUM, M.tasBal); prizma(icCokgen(PLAN, .15), UST, ATIK1 - UST, M.tasAcik);

  /* çatı: yeşil lambrili saçak (pahı izler), üstünde iki kademeli koyu gri mansart; kademelerde Zeferan cam bantları */
  const DIS = icCokgen(PLAN, -SACAK);
  prizma(DIS, ATIK1, .4, [M.catiDuz, M.sacakYuz]);
  const alt = new THREE.Shape(DIS.map(([x, z]) => new THREE.Vector2(x, z))); alt.holes.push(new THREE.Path(PLAN.map(([x, z]) => new THREE.Vector2(x, z))));
  const altM = ekle(g, new THREE.ShapeGeometry(alt), M.sacakAlt, 0, ATIK1 - .005, 0, 0, false); altM.rotation.x = Math.PI / 2;
  for (let i = 0; i < DIS.length; i++) {                                                                   // kiremit renkli saçak kenarı
    const a = DIS[i], b = DIS[(i + 1) % DIS.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const k = kutu(g, L + .05, .14, .1, M.konsol, (a[0] + b[0]) / 2, ATIK1 + .3, (a[1] + b[1]) / 2); k.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
  }
  const CY = ATIK1 + .4, k1 = 1.9, b1 = 1.0, k2 = 1.5, b2 = .8;
  const T0 = icCokgen(PLAN, -SACAK + .15), T1 = icCokgen(T0, 1.6), T1b = icCokgen(T1, -.15), T2 = icCokgen(T1, 1.3);
  ekle(g, kesikCokgenG(T0, T1, k1), M.cati, 0, CY, 0);
  prizma(T1, CY + k1, b1, [M.catiDuz, M.zeferanBant]);
  ekle(g, kesikCokgenG(T1b, T2, k2), M.cati, 0, CY + k1 + b1, 0);
  prizma(T2, CY + k1 + b1 + k2, b2, [M.catiDuz, M.zeferanBant]);
  const TY = CY + k1 + b1 + k2 + b2;
  prizma(icCokgen(T2, -.15), TY, .18, M.catiDuz);
  kutu(g, 7, .4, 4.2, M.tasAcik, -4, TY + .18, -1.8);
  const ayd = ekle(g, new THREE.CylinderGeometry(.3, 2.6, 1.4, 8, 1, true), M.kubbeCam, -4, TY + .58 + .7, -1.8); ayd.rotation.y = Math.PI / 8; ayd.scale.z = .75;
  kutu(g, 2.6, 1.2, 1.8, M.catiDuz, 5.5, TY + .18, -2.4); kutu(g, 1.6, .9, 1.2, M.catiDuz, 8.5, TY + .18, .8);

  /* cephe kurucusu: yerel x cephe boyunca, yerel z dışarı, y yukarı */
  const cephe = (L, bays, cx, cz, ry, secenek = {}) => {
    const c = new THREE.Group(); c.position.set(cx, 0, cz); c.rotation.y = ry; g.add(c);
    const pitch = (L - 1.2) / bays, bx = i => -L / 2 + .6 + pitch * (i + .5), px = i => -L / 2 + .6 + pitch * i;
    /* — podyum: alaca kemerler, oyma friz, mukarnas, korniş — */
    kutu(c, L + .02, .55, .3, M.tasKoyu, 0, 0, .12);
    if (secenek.kemer !== 'yok') for (let i = 0; i < bays; i++) {
      const x = bx(i), r = Math.min(1.2, pitch / 2 - .45), yU = 3.5;
      if (secenek.kemer !== false) {
        ekle(c, new THREE.ShapeGeometry(kemerliDik(2 * r, .6, yU), 12), M.vitrin, x, 0, .015, 0, false);
        const n = 11, r2 = r + .36;
        for (let k = 0; k < n; k++) ekle(c, halkaG(r, r2, Math.PI * k / n, Math.PI * (k + 1) / n, .14), k % 2 ? M.mermer : M.ablaqK, x, yU, 0);
        ekle(c, halkaG(r2, r2 + .08, 0, Math.PI, .18, 16), M.mermer, x, yU, 0);
        for (const s of [-1, 1]) kutu(c, .34, yU - .55, .14, M.mermer, x + s * (r + .17), .55, .07);
        kutu(c, .05, yU - .6, .05, M.siyah, x, .6, .05); kutu(c, 2 * r, .05, .05, M.siyah, x, yU - .02, .05);
        for (const a of [-.55, .55]) { const k2 = ekle(c, new THREE.BoxGeometry(.04, r, .04), M.siyah, x + Math.sin(a) * r / 2, yU + Math.cos(a) * r / 2, .05); k2.rotation.z = -a; }
      } else {
        ekle(c, new THREE.PlaneGeometry(1.15, 1.6), M.pencereB, x, 2.6, .015, 0, false); kutu(c, 1.35, .12, .25, M.mermer, x, 1.75, .12);
      }
    }
    kutu(c, L + .02, 1.1, .14, M.friz, 0, 5.1, .07);
    kutu(c, L + .02, .6, .26, M.mermer, 0, 6.2, .13);
    for (let x = -L / 2 + .3; x < L / 2 - .2; x += .48) {
      torna(c, [[0, 0], [.03, .02], [.08, .1], [.1, .16], [.12, .24], [.13, .32], [.14, .42], [0, .42]], M.mermer, x, 6.18, .32, 8);
      ekle(c, sivriHalkaG(.16, .05, .06), M.mermer, x, 6.5, .26);
    }
    kutu(c, L + .5, .2, .62, M.mermer, 0, 6.82, .31); kutu(c, L + .7, .28, .78, M.mermer, 0, 7.02, .39);
    /* — gövde: yivli dev pilasterler, pencereler, balkonlar, çini panolar, sivri dev kemerler — */
    for (let i = 1; i < bays; i++) {
      const x = px(i);
      kutu(c, .76, UST - PODYUM, .26, M.yivli, x, PODYUM, .13); kutu(c, .92, .3, .34, M.tasAcik, x, PODYUM, .17);
      for (let k = 2; k <= 5; k++) ekle(c, new THREE.TorusGeometry(.08, .022, 6, 14), M.tasAcik, x, PODYUM + (k - 1) * KAT + .25, .27);
    }
    for (let i = 0; i < bays; i++) {
      const x = bx(i), r = pitch / 2 - .42;
      for (let k = 1; k <= 6; k++) {
        const yf = PODYUM + (k - 1) * KAT, yP = yf + .9, pw = 1.12, ph = k === 6 ? 1.4 : 1.75, m = rnd() < .72 ? M.pencereA : M.pencereB;
        if (k === 6) ekle(c, new THREE.ShapeGeometry(sivriPencere(pw, yP, yP + ph), 12), m, x, 0, .02, 0, false);
        else ekle(c, new THREE.PlaneGeometry(pw, ph), m, x, yP + ph / 2, .02, 0, false);
        for (const s of [-1, 1]) kutu(c, .14, ph, .16, M.tasAcik, x + s * (pw / 2 + .07), yP, .08);
        if (k === 6) ekle(c, sivriHalkaG(pw / 2, .14, .16), M.tasAcik, x, yP + ph, 0);
        else { kutu(c, pw + .44, .2, .24, M.tasAcik, x, yP + ph, .12); kutu(c, pw + .6, .08, .3, M.tasAcik, x, yP + ph + .2, .15); }
        kutu(c, .04, ph, .04, M.siyah, x, yP, .04);
        kutu(c, pw + .5, .12, .3, M.tasAcik, x, yP - .14, .15);
        for (const s of [-1, 1]) kutu(c, .14, .2, .22, M.tasAcik, x + s * (pw / 2 + .05), yP - .34, .11);
        if (k === 1) { kutu(c, 1.5, .64, .06, M.tasAcik, x, yf + .16, .03); ekle(c, new THREE.PlaneGeometry(1.38, .54), M.ciniPano, x, yf + .48, .065, 0, false); }
        if (k >= 2 && k <= 5) { ekle(c, new THREE.PlaneGeometry(pw + .26, .52), M.korkuluk, x, yP + .28, .3, 0, false); kutu(c, pw + .3, .04, .05, M.siyah, x, yP + .54, .3); }
      }
      ekle(c, sivriHalkaG(r, .26, .16), M.tasAcik, x, UST - 1.95, 0);
    }
    kutu(c, L + .02, .42, .1, M.ciniBant, 0, UST, .05); kutu(c, L + .4, .26, .46, M.tasAcik, 0, UST + .42, .23);
    /* — çatı katı: ince pilaster şeritleri, ikiz sivri kemerli pencereler, T başlıklı kırmızı konsollar — */
    for (let i = 0; i <= bays; i++) {
      const x = i === 0 ? -L / 2 + .35 : i === bays ? L / 2 - .35 : px(i);
      if (i > 0 && i < bays) kutu(c, .5, ATIK1 - ATIK0, .16, M.tasAcik, x, ATIK0, .08);
      kutu(c, .2, 1.05, .22, M.konsol, x, ATIK1 - 1.05, .12);
      kutu(c, .5, .14, .55, M.konsol, x, ATIK1 - .14, .3); kutu(c, .34, .1, .38, M.konsol, x, ATIK1 - .24, .22);
      kutu(c, .26, .12, .26, M.konsol, x, ATIK1 - 1.17, .12);
    }
    for (let i = 0; i < bays; i++) for (const s of [-1, 1]) {
      const x = bx(i) + s * .42;
      ekle(c, new THREE.ShapeGeometry(sivriPencere(.52, ATIK0 + .5, ATIK0 + 1.75), 10), M.zeferanCam, x, 0, .02, 0, false);
      ekle(c, sivriHalkaG(.26, .1, .12), M.tasAcik, x, ATIK0 + 1.75, 0);
      for (const t of [-1, 1]) kutu(c, .09, 1.25, .12, M.tasAcik, x + t * .3, ATIK0 + .5, .06);
      kutu(c, .7, .1, .2, M.tasAcik, x, ATIK0 + .42, .1);
    }
    return c;
  };
  // cepheler: güney (8 aks, alaca kemerler), pah (2 aks, giriş köşkü), doğu (4), kuzey (10), batı (5)
  // kenar sırası: batı, kuzey, doğu (eğik), pah (giriş), güney
  const AYAR = [{ bays: 5, kemer: false }, { bays: 10, kemer: false }, { bays: 4 }, { bays: 2, kemer: 'yok' }, { bays: 10 }];
  KEN.forEach((k, i) => cephe(k.L, AYAR[i].bays, k.m[0], k.m[1], k.ry, AYAR[i]));
  // köşe pilasterleri: her köşede iki komşu cephenin açıortayına dönük
  KEN.forEach((k, i) => {
    const o = KEN[(i - 1 + KEN.length) % KEN.length], bx = k.n[0] + o.n[0], bz = k.n[1] + o.n[1], bl = Math.hypot(bx, bz), ry = Math.atan2(bx / bl, bz / bl);
    const x = k.a[0] + bx / bl * .08, z = k.a[1] + bz / bl * .08;
    kutu(g, 1.1, PODYUM, 1.1, M.mermerOyma, x, 0, z, ry);
    kutu(g, 1.05, UST - PODYUM, 1.05, M.yivli, x, PODYUM, z, ry); kutu(g, 1.2, .38, 1.2, M.tasAcik, x, UST - .38, z, ry);
  });
  const PAH = KEN[3], DOGU = KEN[2];

  /* giriş köşkü: pahın önünde (yerel z dışarı = güneydoğu), podyum boyunda, üstü korkuluklu teras; büyük sivri kemerli kapı */
  const gk = new THREE.Group(); gk.position.set(PAH.m[0], 0, PAH.m[1]); gk.rotation.y = PAH.ry; g.add(gk);
  const GW = 5.8, GD = 1.5;
  ekle(gk, prizmaG([[-GW / 2, -.3], [GW / 2, -.3], [GW / 2, GD], [-GW / 2, GD]], PODYUM - .2), M.mermerOyma, 0, 0, 0);
  kutu(gk, GW + .5, .3, GD + .55, M.mermer, 0, PODYUM - .2, GD / 2 + .1); kutu(gk, GW + .7, .22, GD + .75, M.mermer, 0, PODYUM + .1, GD / 2 + .2);
  for (let x = -GW / 2 + .1; x < GW / 2; x += .45) torna(gk, [[0, 0], [.03, .02], [.08, .1], [.12, .26], [0, .26]], M.mermer, x, PODYUM - .48, GD + .12, 8);
  for (const s of [-1, 1]) torna(gk, [[0, 0], [.05, .02], [.16, .2], [.26, .45], [.3, .7], [0, .7]], M.mermer, s * (GW / 2 - .1), PODYUM - .95, GD + .05, 12);   // köşelerdeki iri sarkıt konsollar
  ekle(gk, sekilG(sivriKemer(4.4, .3, 4.0, 6.8), .06), M.mermerOyma, 0, 0, GD);
  ekle(gk, new THREE.ShapeGeometry(sivriKemer(3.8, .3, 3.9, 6.45), 16), M.jali, 0, 0, GD + .08, 0, false);
  ekle(gk, sekilG(sivriKemer(2.3, .3, 2.7, 4.05), .05), M.kakma, 0, 0, GD + .09);
  ekle(gk, new THREE.ShapeGeometry(sivriKemer(2.0, .3, 2.65, 3.85), 16), M.kakma, 0, 0, GD + .16, 0, false);
  for (const s of [-1, 1]) {
    kutu(gk, .6, PODYUM - .2, .3, M.mermerOyma, s * (GW / 2 - .3), 0, GD + .1);
    const mad = ekle(gk, new THREE.TorusGeometry(.3, .035, 8, 32), M.altin, s * 2.05, 3.0, GD + .14); mad.scale.y = .78;
    silindir(gk, .015, .015, 1.2, M.altin, s * 2.05, 3.3, GD + .14, 6);
  }
  for (const [r, y] of [[2.5, 0], [2.15, .15], [1.8, .3]]) ekle(gk, new THREE.CylinderGeometry(r, r, .15, 40, 1, false, -Math.PI / 2, Math.PI), M.mermer, 0, y + .075, GD);
  const ty = PODYUM + .32, n = Math.round((GW + .6) / .28);
  for (let k = 0; k <= n; k++) torna(gk, [[0, 0], [.06, 0], [.04, .1], [.07, .32], [.035, .55], [.06, .62], [0, .62]], M.mermer, -GW / 2 - .3 + (GW + .6) * k / n, ty, GD + .3, 10);
  kutu(gk, GW + .6, .12, .22, M.mermer, 0, ty + .62, GD + .3);
  for (const s of [-1, 1]) kutu(gk, .5, 1.1, .5, M.mermer, s * (GW / 2 + .3), ty - .05, GD + .3);
  for (const t of [1.6, 2.15, 2.7]) { const u = [(DOGU.a[0] - DOGU.b[0]) / DOGU.L, (DOGU.a[1] - DOGU.b[1]) / DOGU.L]; silindir(g, .04, .05, 8, M.altin, DOGU.b[0] + u[0] * t + DOGU.n[0] * 1.2, 0, DOGU.b[1] + u[1] * t + DOGU.n[1] * 1.2, 8); }   // bayrak direkleri (bayraksız)

  /* sokak dioraması: uzun cephe boyunca batıya tırmanan basamaklı kaldırım; pah önünde küçük meydan; doğu sokağında çınarlar */
  const DX0 = -23, DX1 = 23, DZ0 = -15.5, DZ1 = 15.5;
  kutu(g, DX1 - DX0, .6, DZ1 - DZ0, M.taban, 0, -.62, 0); kutu(g, DX1 - DX0 + .04, .03, DZ1 - DZ0 + .04, M.kesit, 0, -.64, 0);
  M.yol.map.repeat.set((DX1 - DX0) / 3, (DZ1 - DZ0) / 3);
  const yer = ekle(g, new THREE.PlaneGeometry(DX1 - DX0, DZ1 - DZ0), M.yol, 0, -.015, 0, 0, false); yer.rotation.x = -Math.PI / 2;
  const kal = (w, d, x, z, y = 0) => kutu(g, w, .16 + y, d, M.kaldirim, x, -.02, z);
  for (let j = 0; j < 7; j++) kal(4.2, 2.4, 13.24 - 2.1 - j * 4.2, Z1 + 1.2, j * .17);   // güney: batıya tırmanan basamaklı kaldırım
  kal(33, 2, -2.8, -Z1 - .7); kal(2.2, LZ + 2, -17.3 - 1.1, 0);
  const dk = (k, w) => [k.a, k.b, [k.b[0] + k.n[0] * w, k.b[1] + k.n[1] * w], [k.a[0] + k.n[0] * w, k.a[1] + k.n[1] * w]];
  ekle(g, prizmaG(dk(DOGU, 2.6), .16), M.kaldirim, 0, -.02, 0);                                                  // eğik doğu cephesi boyunca kaldırım
  ekle(g, prizmaG([[13.24, 8.9], [17.31, 3.34], [19.6, 2.2], [22.6, 8.5], [20.5, 14.5], [13.0, 14.5]], .16), M.kaldirim, 0, -.02, 0);   // pahın önündeki küçük meydan
  const agac = (x, z, s) => {
    torna(g, [[0, 0], [.32 * s, 0], [.24 * s, 1], [.2 * s, 3.2 * s], [.12 * s, 4.6 * s], [0, 4.6 * s]], M.govde, x, 0, z, 10);
    for (let i = 0; i < 26; i++) {
      const geo = new THREE.IcosahedronGeometry((.9 + rnd() * 1.1) * s, 1), p = geo.attributes.position;
      for (let k = 0; k < p.count; k++) { const f = 1 + (rnd() - .5) * .35; p.setXYZ(k, p.getX(k) * f, p.getY(k) * f * .8, p.getZ(k) * f); }
      geo.computeVertexNormals();
      const a = rnd() * TAM, rr = rnd() * 2.6 * s;
      ekle(g, geo, M.agac, x + Math.cos(a) * rr, (4.2 + rnd() * 3.4) * s, z + Math.sin(a) * rr);
    }
  };
  agac(19.8, -3.5, 1.1); agac(16.5, -11.5, 1.0); agac(-20.2, 12.5, .85);   // çınarlar: eğik doğu sokağı ve köşeler (girişin önü açık)
  for (const [x, z] of [[21.6, 5.4], [-8, Z1 + 2.2], [15.2, -6.5]]) {
    torna(g, [[0, 0], [.12, 0], [.1, .3], [.05, .4], [.05, 3.2], [.08, 3.3], [0, 3.3]], M.siyah, x, 0, z, 10);
    silindir(g, .16, .12, .45, M.fenerSokak, x, 3.3, z, 8); torna(g, [[.2, 0], [.1, .18], [.03, .3], [0, .36]], M.siyah, x, 3.75, z, 8);
  }
  return { ...META['ajwa-sultanahmet'], duvarlar: [] };
}

/* ---------- AJWA Cappadocia yerleşkesi (Mustafapaşa) ----------
   Kaynak: güncel uydu görüntüsü (z19, 0.2334 m/px), otelin bilgi föyündeki yerleşke haritası, gece drone fotoğrafı, otel fotoğrafları.
   Arazi: tools/maket/kapadokya_arazi.py → src/maket/kapadokya-arazi.json (yükseklik ızgarası, ağaçlar, yollar) + kapadokya-zemin.webp.
   Koordinat: x doğu, z güney (m); başlangıç uydu z19 pikseli (1000, 800). */
let KAP = null;
const ON_YUKLE = {
  'ajwa-kapadokya': async () => {
    if (KAP) return;
    const [veri, img] = await Promise.all([
      fetch('maket/kapadokya-arazi.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
      new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = 'maket/kapadokya-zemin.webp'; })
    ]);
    const b = atob(veri.yukseklik), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    veri.h = new Uint16Array(u.buffer); KAP = { veri, img };
  }
};
// geometri birleştirme (indekssiz): binlerce küçük parça (ağaç, direk) tek ağ olsun
function birlesik(parcalar) {
  const poz = [], nor = [], uv = [];
  for (const [g0, mtx] of parcalar) {
    const g = (g0.index ? g0.toNonIndexed() : g0).clone(); g.applyMatrix4(mtx);
    poz.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array);
    if (g.attributes.uv) uv.push(...g.attributes.uv.array); else for (let i = 0; i < g.attributes.position.count; i++) uv.push(0, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(poz, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return geo;
}
const mtx = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(sx, sy, sz));
const dik = (w, d) => [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];

function ajwaKapadokya(sahne) {
  if (!KAP) throw new Error('Kapadokya arazi verisi yüklenmedi');
  const g = new THREE.Group(); g.name = 'oda'; sahne.add(g);
  const V = KAP.veri, [X0, X1, Z0, Z1] = V.sinir, NX = V.nx, NZ = V.nz;
  const hAt = (x, z) => {   // ızgaradan çift doğrusal yükseklik
    const fx = Math.max(0, Math.min(NX - 1.001, x - X0)), fz = Math.max(0, Math.min(NZ - 1.001, z - Z0)), i = fx | 0, j = fz | 0, a = fx - i, b = fz - j, H = (ii, jj) => V.h[jj * NX + ii] * V.adim;
    return (H(i, j) * (1 - a) + H(i + 1, j) * a) * (1 - b) + (H(i, j + 1) * (1 - a) + H(i + 1, j + 1) * a) * b;
  };
  const isikli = (d, e = 1, ek = {}) => new THREE.MeshStandardMaterial({ map: d, emissiveMap: d, emissive: 0xffffff, emissiveIntensity: e, roughness: .3, ...ek });
  const zemT = new THREE.Texture(KAP.img); zemT.needsUpdate = true; zemT.colorSpace = THREE.SRGBColorSpace; zemT.anisotropy = 8; DOKU.push(zemT);
  const M = {
    zemin: mat({ map: zemT, color: 0xcdc3b6, roughness: 1 }), kesit: mat({ color: 0x5b4634, roughness: 1 }), taban: mat({ color: 0x241b15, roughness: .9 }),
    tas: mat({ map: kumtasi(84), roughness: .85 }), tasKrem: mat({ map: kumtasi(76), roughness: .85 }), tasGri: mat({ map: kumtasi(62), color: 0xb9b6b4, roughness: .9 }),
    beyaz: mat({ color: 0xf2eee6, roughness: .7 }), tasBeyaz: mat({ map: kumtasi(90), color: 0xf6f3ee, roughness: .85 }), kiremit: mat({ color: 0xa0533a, roughness: .8 }), kaya: mat({ map: kumtasi(80), color: 0xf1e2cc, roughness: 1 }), kayaKapak: mat({ color: 0x7d6a58, roughness: 1 }),
    catiDuz: mat({ color: 0xa79f94, roughness: .95 }), makine: mat({ color: 0x8c8f93, roughness: .7, metalness: .3 }), siyah: mat({ color: 0x1b1714, roughness: .5, metalness: .4 }),
    panjurMavi: mat({ color: 0x2f78b0, roughness: .6 }), panjurYesil: mat({ color: 0x5f7d4c, roughness: .6 }), ahsap: mat({ color: 0x6e4b2c, roughness: .8 }),
    agacTac: mat({ color: 0x3f5f2f, roughness: 1 }), agacTacK: mat({ color: 0x2e4a2a, roughness: 1 }), govde: mat({ color: 0x4a3a2c, roughness: 1 }),
    camKorkuluk: mat({ color: 0xcfe3e6, roughness: .1, metalness: .2, transparent: true, opacity: .35 }),
    fener: new THREE.MeshStandardMaterial({ color: 0xffe0a8, emissive: 0xffc070, emissiveIntensity: 2.2, roughness: .4 }),
    pencereA: isikli(pencereIsik(1)), pencereB: isikli(pencereIsik(.55), .55), camCati: isikli(aydinlikDoku(), 1, { roughness: .2 }), vitrin: isikli(pencereIsik(.8), .8, { roughness: .2 })
  };
  for (const k of ['tas', 'tasKrem', 'tasGri', 'kaya', 'tasBeyaz']) M[k].map.repeat.set(1 / 4, 1 / 4);
  for (const [k, m] of Object.entries(M)) m.name = k;
  const pencereM = () => rnd() < .62 ? M.pencereA : M.pencereB;

  /* --- arazi: ızgara ağı (zemin dokusu uydu sınıflandırmasından), kenarda toprak kesiti --- */
  {
    const poz = [], uv = [], ind = [];
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const x = X0 + i, z = Z0 + j; poz.push(x, V.h[j * NX + i] * V.adim, z); uv.push(i / (NX - 1), 1 - j / (NZ - 1)); }
    for (let j = 0; j < NZ - 1; j++) for (let i = 0; i < NX - 1; i++) { const a = j * NX + i, b = a + 1, c = a + NX, d = c + 1; ind.push(a, c, b, b, c, d); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(poz, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ind); geo.computeVertexNormals();
    const z = ekle(g, geo, M.zemin, 0, 0, 0, 0, false); z.name = 'arazi';
    // kesit: dört kenar boyunca y=-4'ten araziye
    const kp = [], ki = []; let n = 0;
    const kenar = (pts) => { for (let k = 0; k < pts.length - 1; k++) { const [a, b] = [pts[k], pts[k + 1]]; kp.push(a[0], -4, a[1], b[0], -4, b[1], b[0], hAt(b[0], b[1]), b[1], a[0], hAt(a[0], a[1]), a[1]); ki.push(n, n + 1, n + 2, n, n + 2, n + 3); n += 4; } };
    const cizgi = (x0, z0, x1, z1, s) => Array.from({ length: s + 1 }, (_, k) => [x0 + (x1 - x0) * k / s, z0 + (z1 - z0) * k / s]);
    kenar(cizgi(X0, Z1, X1, Z1, NX - 1)); kenar(cizgi(X1, Z1, X1, Z0, NZ - 1)); kenar(cizgi(X1, Z0, X0, Z0, NX - 1)); kenar(cizgi(X0, Z0, X0, Z1, NZ - 1));
    const kg = new THREE.BufferGeometry(); kg.setAttribute('position', new THREE.Float32BufferAttribute(kp, 3)); kg.setIndex(ki); kg.computeVertexNormals();
    ekle(g, kg, M.kesit, 0, 0, 0, 0, false);
    kutu(g, X1 - X0, .2, Z1 - Z0, M.taban, (X0 + X1) / 2, -4.2, (Z0 + Z1) / 2);
  }

  /* --- ağaçlar: uydudaki koyu yeşil lekeler; tek ağda birleşik taç ve gövde --- */
  {
    const tac = [], tacK = [], gov = [], ico = new THREE.IcosahedronGeometry(1, 1), kon = new THREE.CylinderGeometry(.12, .2, 1, 6);
    for (const [x, z, r0] of V.agaclar) {
      const y = hAt(x, z), kavak = rnd() < .16, r = kavak ? r0 * .55 : r0 * .82;
      const H = kavak ? r0 * 4.2 : r0 * 1.9;
      gov.push([kon, mtx(x, y + H * .22, z, 0, 1, H * .44, 1)]);
      const hedef = rnd() < .5 ? tac : tacK;
      if (kavak) hedef.push([ico, mtx(x, y + H * .55, z, rnd() * 3, r, H * .5, r)]);
      else for (let k = 0; k < 3; k++) { const a = rnd() * TAM, d = r * .35; hedef.push([ico, mtx(x + Math.cos(a) * d, y + H * (.6 + rnd() * .15), z + Math.sin(a) * d, rnd() * 3, r * (.7 + rnd() * .3), r * (.6 + rnd() * .25), r * (.7 + rnd() * .3))]); }
    }
    ekle(g, birlesik(tac), M.agacTac, 0, 0, 0).name = 'agaclar_a'; ekle(g, birlesik(tacK), M.agacTacK, 0, 0, 0).name = 'agaclar_b'; ekle(g, birlesik(gov), M.govde, 0, 0, 0).name = 'govdeler';
  }

  /* --- yol kenarı aydınlatma babaları (drone fotoğrafındaki ışık dizileri) --- */
  const hale = [];
  {
    const direk = [], bas = [], cyl = new THREE.CylinderGeometry(.11, .13, .75, 8), cap = new THREE.CylinderGeometry(.12, .12, .14, 8);
    const koy = (x, z) => { if (x < X0 + .5 || x > X1 - .5 || z < Z0 + .5 || z > Z1 - .5) return; const y = hAt(x, z); direk.push([cyl, mtx(x, y + .375, z)]); bas.push([cap, mtx(x, y + .82, z)]); if (rnd() < .25) hale.push([x, y + .85, z]); };
    for (const [gen, P] of V.yollar) {
      let artik = 0;
      for (let k = 0; k < P.length - 1; k++) {
        const [a, b] = [P[k], P[k + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, o = gen / 2 + .7;
        for (let t = artik; t < L; t += 8) for (const s of [-1, 1]) koy(a[0] + ux * t - uz * o * s, a[1] + uz * t + ux * o * s);
        artik = ((artik - L) % 8 + 8) % 8;
      }
    }
    for (const [cx, cz, r, gen] of V.halkalar) for (const rr of [r - gen / 2 - .7, r + gen / 2 + .7]) { const n = Math.round(TAM * rr / 7); for (let k = 0; k < n; k++) koy(cx + Math.cos(k / n * TAM) * rr, cz + Math.sin(k / n * TAM) * rr); }
    ekle(g, birlesik(direk), M.siyah, 0, 0, 0, 0, false).name = 'babalar'; ekle(g, birlesik(bas), M.fener, 0, 0, 0, 0, false).name = 'baba_isik';
  }

  /* --- yapı yardımcıları --- */
  const yapi = (cx, cz, ry = 0, y = 0) => { const b = new THREE.Group(); b.position.set(cx, y, cz); b.rotation.y = ry; g.add(b); return b; };
  // dikdörtgen kütlenin dört cephesi: yerel x cephe boyunca, yerel z dışarı
  const cepheler = (b, w, d) => [
    { ad: 'g', L: w, c: mk(b, 0, d / 2, 0) }, { ad: 'k', L: w, c: mk(b, 0, -d / 2, Math.PI) },
    { ad: 'd', L: d, c: mk(b, w / 2, 0, Math.PI / 2) }, { ad: 'b', L: d, c: mk(b, -w / 2, 0, -Math.PI / 2) }];
  function mk(b, x, z, ry) { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; b.add(c); return c; }
  // pencere: tip kare | kemer (yuvarlak) | sivri; y alt kenar, h toplam boy; çerçeve beyaz taş
  const pencere = (c, tip, x, y, w, h, o = {}) => {
    const m = o.m || pencereM(), z = o.z ?? 0;
    if (tip === 'kare') ekle(c, new THREE.PlaneGeometry(w, h), m, x, y + h / 2, z + .03, 0, false);
    else ekle(c, new THREE.ShapeGeometry(tip === 'kemer' ? kemerliDik(w, y, y + h - w / 2) : sivriPencere(w, y, y + h - w * .67), 10), m, x, 0, z + .03, 0, false);
    if (o.cerceve !== false) {
      const cm = o.cm || M.beyaz, t = o.t || .16;
      for (const s of [-1, 1]) kutu(c, t, h - (tip === 'kare' ? 0 : w / 2), .12, cm, x + s * (w / 2 + t / 2), y, z + .06);
      kutu(c, w + 2 * t + .1, .14, .2, cm, x, y - .14, z + .1);
      if (tip === 'kare') kutu(c, w + 2 * t, .16, .14, cm, x, y + h, z + .07);
      else if (tip === 'kemer') ekle(c, halkaG(w / 2, w / 2 + t, 0, Math.PI, .14, 12), cm, x, y + h - w / 2, z);
      else ekle(c, sivriHalkaG(w / 2, t, .14), cm, x, y + h - w * .67, z);
    }
    if (o.panjur) for (const s of [-1, 1]) kutu(c, w * .52, h * .98, .06, o.panjur, x + s * (w * .78 + (o.t || .16)), y, z + .08);
  };
  const parapet = (b, w, d, y, m, h = .7) => { ekle(b, prizmaG(dik(w + .3, d + .3), h), m, 0, y, 0); kutu(b, w - .4, .05, d - .4, M.catiDuz, 0, y + .1, 0); };
  const makineler = (b, w, d, y, n) => { for (let i = 0; i < n; i++) kutu(b, 1.2 + rnd() * 2.4, .8 + rnd() * .9, 1 + rnd() * 1.8, M.makine, (rnd() - .5) * (w - 5), y, (rnd() - .5) * (d - 5)); };

  /* === 1 · KERVANSARAY: 33 × 76 m, iki kat, ana cephe batı; ortada cam beşik çatılı lobi galerisi, iki avlu üstünde cam piramit === */
  {
    const W = 33, D = 76, H = 9.6, b = yapi(-121.6, 13.8), GZ = -1.5, GW = 10.5;
    ekle(b, prizmaG(dik(W, D), H), M.tasBeyaz, 0, -.3, 0); parapet(b, W, D, H - .3, M.tasBeyaz, .8);
    for (const f of cepheler(b, W, D)) {
      const { c, L, ad } = f, uzun = ad === 'd' || ad === 'b';
      kutu(c, L + .3, .5, .3, M.tasKrem, 0, -.3, .1);                    // taban silmesi
      kutu(c, L + .3, .25, .35, M.tasKrem, 0, H - .55, .15);             // korniş
      const sg = ad === 'b' ? 1 : -1;                                       // batı cephede yerel x = dünya z, doğuda −z
      const bos = uzun ? [[GZ * sg, GW / 2 + 1.2]] : [];   // galeri ucu boşluğu (yerel x)
      const panolar = uzun ? [-22, 21].map(v => v * sg) : [];
      // pencereler ikişerli gruplar hâlinde (drone fotoğrafı): grup aralığı ~5,3 m, grup içi 1,5 m
      const n = Math.floor((L - 4) / 5.3);
      for (let i = 0; i < n; i++) {
        const xg = -L / 2 + 2 + (L - 4) * (i + .5) / n;
        if (bos.some(([m, r]) => Math.abs(xg - m) < r + 1.4) || panolar.some(p => Math.abs(xg - p) < 3.6)) continue;
        for (const dx of [-.75, .75]) for (const y of [1.6, 5.8]) pencere(c, 'kare', xg + dx, y, .9, 1.25, { t: .1, m: rnd() < .45 ? M.pencereA : M.pencereB });
      }
      for (const p of panolar) {      // beyaz çerçeveli yüksek sivri kemerli nişler
        kutu(c, 4.2, 8.4, .25, M.beyaz, p, .2, .1);
        pencere(c, 'sivri', p, 1.0, 2.1, 6.6, { z: .25, t: .22, cm: M.beyaz, m: M.vitrin });
      }
    }
    // lobi galerisi: cepheden taşan uç köşkleri ve cam beşik çatı (doğu-batı)
    for (const s of [-1, 1]) {
      const k = mk(b, s * (W / 2), GZ, s * Math.PI / 2);
      ekle(k, prizmaG([[-GW / 2 - 1, -.6], [GW / 2 + 1, -.6], [GW / 2 + 1, 1.2], [-GW / 2 - 1, 1.2]], 11.6), M.beyaz, 0, -.3, 0);
      kutu(k, GW + 2.6, .3, 2.2, M.tasKrem, 0, 11.3, .3);
      ekle(k, sekilG(sivriKemer(4.6, 0, 4.8, 8.2), .1), M.tasKrem, 0, 0, 1.15);
      ekle(k, new THREE.ShapeGeometry(sivriKemer(3.8, 0, 4.6, 7.6), 16), M.vitrin, 0, 0, 1.27, 0, false);
      for (const t of [-1, 1]) ekle(k, new THREE.PlaneGeometry(1.4, 8.5), M.pencereB, t * (GW / 2 + .3), 4.6, 1.22, 0, false);   // köşk yanlarında koyu cam şerit
      if (s < 0) for (const [r, y] of [[4.2, 0], [3.6, .16], [3, .32]]) ekle(k, new THREE.CylinderGeometry(r, r, .16, 32, 1, false, -Math.PI / 2, Math.PI), M.tasKrem, 0, y - .22, 1.2);
    }
    const sirt = new THREE.Shape([new THREE.Vector2(-GW / 2, 0), new THREE.Vector2(GW / 2, 0), new THREE.Vector2(0, 3.4)]);
    const gal = ekle(b, new THREE.ExtrudeGeometry(sirt, { depth: W + 2, bevelEnabled: false }), M.camCati, -W / 2 - 1, H + .2, GZ, Math.PI / 2);
    gal.name = 'galeri_cati';
    kutu(b, .25, .25, W + 2.2, M.makine, -W / 2 - 1.1 + (W + 2.2) / 2, H + 3.55, GZ, Math.PI / 2);                     // mahya
    for (let x = -W / 2 - .5; x <= W / 2 + .6; x += 2.2) { const a = Math.atan2(3.4, GW / 2), l = Math.hypot(3.4, GW / 2); for (const s of [-1, 1]) { const r = ekle(b, new THREE.BoxGeometry(.1, l, .1), M.makine, x, H + .2 + 1.7, GZ + s * GW / 4); r.rotation.x = -s * (Math.PI / 2 - a); } }
    for (const pz of [-23, 20]) {     // avlu cam piramitleri: pahlı kare taban
      const A = icCokgen([[-8.75, -6], [-6, -8.75], [6, -8.75], [8.75, -6], [8.75, 6], [6, 8.75], [-6, 8.75], [-8.75, 6]], 0), B = A.map(([x, z]) => [x * .06, z * .06]);
      ekle(b, prizmaG(icCokgen(A, -.5), .6), M.tasKrem, 0, H + .2, pz);
      ekle(b, kesikCokgenG(A, B, 4.2), M.camCati, 0, H + .8, pz);
      for (const [ax, az] of A) {           // piramidin kalkan kayıtları (koyu gri çerçeve)
        const p0 = new THREE.Vector3(ax, H + .85, az + pz), p1 = new THREE.Vector3(0, H + .8 + 4.2, pz), l = p0.distanceTo(p1);
        const r = ekle(b, new THREE.BoxGeometry(.14, .14, l), M.makine, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2, (p0.z + p1.z) / 2); r.lookAt(p1.clone().add(b.position));
      }
    }
    // güneydoğu köşedeki gri taş ek bina: alçak, kırma çatılı, iki koyu açıklık (drone fotoğrafı)
    const ek = yapi(-98.6, 38);                // Kervansaray doğu cephesi (−105,1) ile servis yolu (−93) arasında
    ekle(ek, prizmaG(dik(8, 16), 4.2), M.tasGri, 0, -.3, 0);
    ekle(ek, kesikCokgenG(dik(8.6, 16.6), dik(1.6, 8), 1.6), M.catiDuz, 0, 3.9, 0); ekle(ek, prizmaG(dik(1.6, 8), .05), M.catiDuz, 0, 5.5, 0);
    for (const z of [-3.5, 3.5]) { const c = mk(ek, -4, z, -Math.PI / 2); ekle(c, new THREE.PlaneGeometry(1.8, 2.6), M.pencereB, 0, 1.3, .03, 0, false); }
    makineler(b, W, D, H + .2, 14);
  }

  /* === 2 · ZEFERAN: sekizgen, cam tavanlı orta avlu; güneyde Zeferan yazılı ön blok, çift kollu merdivenli teras === */
  {
    const b = yapi(58.8, 7.5), R = 13 / Math.cos(Math.PI / 8), P = 1.8, H = 8.6;
    const sek = Array.from({ length: 8 }, (_, i) => [R * Math.cos(Math.PI / 8 + i * Math.PI / 4), R * Math.sin(Math.PI / 8 + i * Math.PI / 4)]);
    ekle(b, prizmaG(icCokgen(sek, -3.5).concat(), P), M.tasGri, 0, -.3, 0);                // teras kaidesi
    ekle(b, prizmaG(sek, H), M.tasGri, 0, P - .3, 0); ekle(b, prizmaG(icCokgen(sek, -.25), .5), M.tas, 0, P + H - .5, 0);
    for (let i = 0; i < 8; i++) {
      const a = sek[i], c2 = sek[(i + 1) % 8], m = [(a[0] + c2[0]) / 2, (a[1] + c2[1]) / 2], L = Math.hypot(c2[0] - a[0], c2[1] - a[1]);
      const c = mk(b, m[0], m[1], Math.atan2(m[0], m[1])); c.position.y = P - .3;
      if (Math.abs(Math.atan2(m[0], m[1])) < .3) continue;                   // güney yüzü ön bloğa bakar
      for (const s of [-1, 1]) { pencere(c, 'kemer', s * L / 4, .4, 2.4, 3.4, { m: M.vitrin, cm: M.tas }); pencere(c, 'kemer', s * L / 4, 4.9, 1.6, 2.6, { cm: M.tas }); }
      const kk = mk(b, m[0] * 1.0, m[1] * 1.0, Math.atan2(m[0], m[1])); kk.position.y = P + H - .3; ekle(kk, new THREE.PlaneGeometry(L, 1.0), M.camKorkuluk, 0, .5, -.2, 0, false);
    }
    const kub = Array.from({ length: 8 }, (_, i) => [7 * Math.cos(Math.PI / 8 + i * Math.PI / 4), 7 * Math.sin(Math.PI / 8 + i * Math.PI / 4)]);
    ekle(b, prizmaG(icCokgen(kub, -.4), .8), M.tas, 0, P + H - .3, 0);
    ekle(b, kesikCokgenG(kub, kub.map(([x, z]) => [x * .08, z * .08]), 3.6), M.camCati, 0, P + H + .5, 0).name = 'zeferan_kubbe';
    // ön blok (güney): yüksek taş kütle, beyaz pano içinde üç kemerli pencere, yazı bandı
    const on = mk(b, 3.8, 17, 0); const OH = 11;
    ekle(on, prizmaG(dik(12, 11), OH + P), M.tasGri, 0, -.3, 0);
    kutu(on, 12.4, 1.6, .4, M.beyaz, 0, P + OH - 2.2, 5.5); ekle(on, new THREE.PlaneGeometry(6, .7), M.vitrin, 0, P + OH - 1.4, 5.73, 0, false);
    kutu(on, 6.6, 3.8, .3, M.beyaz, 0, P + 4.6, 5.5);
    for (const x of [-1.7, 0, 1.7]) pencere(on, 'kemer', x, P + 5.2, 1.2, 2.6, { z: 5.8, cerceve: false });
    pencere(on, 'kare', 0, P - .3, 2.6, 3.4, { z: 5.5, m: M.vitrin, cm: M.beyaz });
    // teras istinat duvarı ve iki yandan çıkan merdiven
    kutu(b, 30, P, 14, M.tasGri, 3.8, -.3, 18); kutu(b, 30.4, .25, 14.4, M.tas, 3.8, P - .3, 18);
    for (const s of [-1, 1]) for (let k = 0; k < 8; k++) kutu(b, 3, (k + 1) * P / 8, .45, M.tas, 3.8 + s * 11.5, -.3, 27.5 - k * .45 - .2);
  }

  /* === 3 · SAKURA: köy evleri gibi kademeli 2–3 katlı bloklar, yeşil panjurlar, ahşap pergolalı teraslar === */
  {
    const b = yapi(2.3, 64.7, .349), PAR = [[8, 7.4, 15], [7, 10.4, 13.5], [9, 7.4, 15], [6, 10.4, 14], [8, 7.4, 13], [7, 10.4, 15], [10, 7.4, 14]];
    let x0 = -27.5;
    for (const [w, h, d] of PAR) {
      const k = mk(b, x0 + w / 2, (15 - d) / 2 * (rnd() < .5 ? 1 : -1), 0); x0 += w;
      ekle(k, prizmaG(dik(w, d), h), M.tasKrem, 0, -.3, 0); parapet(k, w, d, h - .3, M.tasKrem, .5);
      for (const f of cepheler(k, w, d)) {
        if (f.L < 7.5 && (f.ad === 'd' || f.ad === 'b')) continue;
        const n = Math.max(1, Math.floor(f.L / 2.6));
        for (let i = 0; i < n; i++) {
          const x = -f.L / 2 + f.L * (i + .5) / n;
          if (f.ad === 'g' && i % 3 === 1) pencere(f.c, 'kemer', x, .2, 2.2, 3.1, { m: M.vitrin, cm: M.tas }); else pencere(f.c, 'kare', x, 1.1, .95, 1.5, { panjur: M.panjurYesil, t: .1 });
          for (let y = 3.9; y < h - 2; y += 3) pencere(f.c, rnd() < .25 ? 'kemer' : 'kare', x, y, .95, 1.6, { panjur: M.panjurYesil, t: .1 });
        }
      }
      if (h < 9) {   // alçak bloğun damı: ahşap pergolalı teras
        const ty = h - .3 + .5;
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) kutu(k, .2, 2.4, .2, M.ahsap, sx * (w / 2 - .5), ty, sz * (d / 2 - 1));
        for (let x = -w / 2 + .6; x < w / 2; x += .7) kutu(k, .1, .14, d - 1.6, M.ahsap, x, ty + 2.4, 0);
        for (const sz of [-1, 1]) kutu(k, w - .6, .22, .2, M.ahsap, 0, ty + 2.2, sz * (d / 2 - 1));
      }
    }
    // batıdaki alçak ek blok
    const ek = yapi(-35, 67.2, .349);
    ekle(ek, prizmaG(dik(14, 13), 4.4), M.tasKrem, 0, -.3, 0); parapet(ek, 14, 13, 4.1, M.tasKrem, .5);
    for (const f of cepheler(ek, 14, 13)) for (let i = 0; i < 4; i++) pencere(f.c, 'kemer', -f.L / 2 + f.L * (i + .5) / 4, .3, 1.8, 2.8, { m: M.vitrin, cm: M.tas });
    // önündeki taş köprü (fotoğraftaki kuru dere üstü)
    const kp = yapi(4.7, 24, 0), kem = new THREE.Shape(); kem.moveTo(-6, 0); kem.lineTo(-6, .9); kem.quadraticCurveTo(0, 2.6, 6, .9); kem.lineTo(6, 0); kem.lineTo(3, 0); kem.quadraticCurveTo(0, 2.1, -3, 0); kem.lineTo(-6, 0);
    ekle(kp, new THREE.ExtrudeGeometry(kem, { depth: 2.6, bevelEnabled: false }), M.tasKrem, 0, hAt(4.7, 24) - .3, -1.3);
  }

  /* === 4 · SANAT ÇARŞISI: zemin kat gri taş büyük kemerler, üst kat beyaz taş ve mavi panjurlar; çatıda cam şerit === */
  {
    const W = 18, D = 41, b = yapi(140.3, -71.9), H1 = 5.2, H = 9.4;
    ekle(b, prizmaG(dik(W, D), H1), M.tasGri, 0, -.3, 0); ekle(b, prizmaG(dik(W, D), H - H1), M.tas, 0, H1 - .3, 0); parapet(b, W, D, H - .3, M.tas, .6);
    for (const f of cepheler(b, W, D)) {
      const uzun = f.ad === 'd' || f.ad === 'b', n = uzun ? 7 : 3;
      kutu(f.c, f.L + .2, .3, .3, M.beyaz, 0, H1 - .45, .12);
      for (let i = 0; i < n; i++) {
        const x = -f.L / 2 + f.L * (i + .5) / n;
        pencere(f.c, 'kemer', x, .1, uzun ? 3.9 : 3.2, 4.4, { m: M.vitrin, cm: M.tasGri, t: .35 });
        for (const s of uzun ? [-1, 1] : [0]) pencere(f.c, 'kare', x + s * 1.3, H1 + .9, .85, 1.4, { panjur: M.panjurMavi, t: .08 });
      }
    }
    const cs = new THREE.Shape([new THREE.Vector2(-3.25, 0), new THREE.Vector2(3.25, 0), new THREE.Vector2(0, 1.4)]);
    ekle(b, new THREE.ExtrudeGeometry(cs, { depth: D - 6, bevelEnabled: false }), M.camCati, 0, H + .1, -(D - 6) / 2).name = 'carsi_cati';
  }

  /* === 5 · CAMİ (Ebubekir Sıddık): sade taş kütle, kemerli pencereler, kuzey revakı === */
  {
    const b = yapi(100.4, .2), W = 16, D = 25, H = 7.2;
    ekle(b, prizmaG(dik(W, D), H), M.tas, 0, -.3, 0); parapet(b, W, D, H - .3, M.tas, .6);
    for (const f of cepheler(b, W, D)) { const n = Math.floor(f.L / 3.4); for (let i = 0; i < n; i++) pencere(f.c, 'sivri', -f.L / 2 + f.L * (i + .5) / n, 1.4, 1.3, 3.6, { cm: M.beyaz }); }
    const rv = mk(b, 0, -D / 2, Math.PI);
    ekle(rv, prizmaG([[-5, 0], [5, 0], [5, 3], [-5, 3]], 5), M.tas, 0, -.3, 0);
    for (const x of [-3, 0, 3]) pencere(rv, 'sivri', x, 0, 2, 3.8, { z: 3, m: M.vitrin, cm: M.beyaz });
  }

  /* === 7 · GİRİŞ binası (döner kavşak ortası) === */
  {
    const b = yapi(104.8, -98), W = 20, D = 21, H = 8;
    ekle(b, prizmaG(dik(W, D), H), M.tasKrem, 0, -.3, 0); parapet(b, W, D, H - .3, M.tasKrem, .6);
    for (const f of cepheler(b, W, D)) { const n = 5; for (let i = 0; i < n; i++) { const x = -f.L / 2 + f.L * (i + .5) / n; pencere(f.c, i === 2 ? 'sivri' : 'kemer', x, .3, 1.8, 3.2, { m: M.vitrin, cm: M.beyaz }); pencere(f.c, 'kare', x, 4.6, 1, 1.5, { t: .12 }); } }
  }

  /* === 12 · MAĞARA SÜİTLERİ: kaya sırtlarının eteğine oyulmuş taş cepheler, teraslar === */
  for (const [x, z, ry] of [[-163, -70, .3], [-100, -56, 0], [-91, -46, -.3], [-70, -59, .1], [-56, -65, -.2], [-16, -42, .2], [42, -37, 0], [-128, -48, .15]]) {
    const yOn = hAt(x + Math.sin(ry) * 6, z + Math.cos(ry) * 6), b = yapi(x, z, ry, yOn);
    ekle(b, prizmaG(dik(9, 7), 4.6), M.kaya, 0, -.6, -2);
    kutu(b, 9.6, .5, .4, M.tasKrem, 0, 3.9, 1.6);
    for (const xx of [-2.8, 0, 2.8]) pencere(b, 'kemer', xx, .1, 1.6, 2.7, { z: 1.5, m: M.vitrin, cm: M.tasKrem });
    kutu(b, 12, .5, 5, M.tasKrem, 0, -.6, 4); for (const s of [-1, 1]) kutu(b, .3, .9, 5, M.tasKrem, s * 5.9, -.1, 4);
  }

  /* === 16 · ÇOCUK KULÜBÜ ve oyun alanı (kırmızı çatılı köşk) === */
  {
    const b = yapi(-30.3, -13.2, .3), H = 4.6;
    ekle(b, prizmaG(dik(9.5, 11), H), M.tasKrem, 0, -.3, 0); parapet(b, 9.5, 11, H - .3, M.tasKrem, .5);
    for (const f of cepheler(b, 9.5, 11)) for (let i = 0; i < 3; i++) pencere(f.c, 'kemer', -f.L / 2 + f.L * (i + .5) / 3, .4, 1.5, 2.5, { m: M.vitrin, cm: M.beyaz });
    const k = yapi(-32.7, -3, 0); silindir(k, 2.4, 2.4, 2.6, M.beyaz, 0, -.2, 0, 8);
    ekle(k, new THREE.ConeGeometry(3, 1.8, 8), M.kiremit, 0, 2.4 + .9, 0).rotation.y = Math.PI / 8;
  }
  /* === 15 · MAĞARA ETKİNLİK SALONU: yamaca gömülü iki taş blok === */
  for (const [x, z, w, d] of [[22.9, -92.2, 11.7, 10], [36.6, -85.7, 21.8, 9.3]]) {
    const b = yapi(x, z, -.28, hAt(x, z + 8));
    ekle(b, prizmaG(dik(w, d), 4.6), M.kaya, 0, -.8, 0); parapet(b, w, d, 3.8, M.tasKrem, .5);
    const c = mk(b, 0, d / 2, 0); const n = Math.floor(w / 3.2);
    for (let i = 0; i < n; i++) pencere(c, 'kemer', -w / 2 + w * (i + .5) / n, .1, 1.7, 2.8, { m: M.vitrin, cm: M.tasKrem });
  }
  /* === 9 · SERA (tarım alanı) === */
  {
    const b = yapi(39.7, -117, -.14, hAt(39.7, -117));
    ekle(b, prizmaG(dik(9.3, 16), 2.4), M.camCati, 0, -.2, 0);
    const cs = new THREE.Shape([new THREE.Vector2(-4.65, 0), new THREE.Vector2(4.65, 0), new THREE.Vector2(0, 1.8)]);
    ekle(b, new THREE.ExtrudeGeometry(cs, { depth: 16, bevelEnabled: false }), M.camCati, 0, 2.2, -8);
  }
  /* === 8 · KONİK ÇATILI TAŞ YAPI === */
  {
    const y = hAt(78.4, -57.4), b = yapi(78.4, -57.4, 0, y);
    silindir(b, 3.5, 3.6, 4.2, M.tasKrem, 0, -.4, 0, 20); ekle(b, new THREE.ConeGeometry(4, 3.4, 20), M.kiremit, 0, 3.8 + 1.7, 0);
    pencere(mk(b, 0, 3.5, 0), 'kemer', 0, -.2, 1.4, 2.6, { m: M.vitrin, cm: M.tas });
  }
  /* --- doğu girişindeki güvenlik kulübesi --- */
  { const b = yapi(146, 24.3); ekle(b, prizmaG(dik(6, 8), 3.6), M.tasKrem, 0, -.3, 0); parapet(b, 6, 8, 3.3, M.tasKrem, .4); for (const f of cepheler(b, 6, 8)) pencere(f.c, 'kare', 0, 1, 1.8, 1.4, { m: M.vitrin }); }

  /* --- peri bacaları: geniş tüf gövde, bazalt şapka (yerleşke haritasındaki konik kayalar) --- */
  for (const [x, z, s] of [[-56, 51, 1.1], [-64, 60, .9], [-48, 64, .8], [-61, 44, .7]]) {
    const y = hAt(x, z) - .4, prof = [[0, 0], [4.4 * s, 0], [3.4 * s, 2 * s], [2.2 * s, 5 * s], [1.3 * s, 8.5 * s], [.9 * s, 10.5 * s], [0, 11 * s]];
    torna(g, prof.map(([r, h]) => [r * (.9 + rnd() * .2), h]), M.kaya, x, y, z, 14);
    if (s > .75) { const k = ekle(g, new THREE.SphereGeometry(1.5 * s, 10, 6, 0, TAM, 0, Math.PI / 2), M.kayaKapak, x, y + 10.4 * s, z); k.scale.y = .55; }
  }

  return { ...META['ajwa-kapadokya'], duvarlar: [], haleNokta: hale };
}

const META = {
  'ajwa-kapadokya': {
    etiketler: [
      { p: [-138.6, 6, 12.3], t: ['Kervansaray · ana bina ve lobi', 'Kervansaray · main building and lobby', 'كرفانساراي · المبنى الرئيسي والردهة'] },
      { p: [58.8, 14, 7.5], t: ['Zeferan Restoran · cam tavanlı avlu', 'Zeferan Restaurant · glass-roofed courtyard', 'مطعم زعفران · فناء بسقف زجاجي'] },
      { p: [2.3, 11, 64.7], t: ['Sakura · teraslı odalar', 'Sakura · rooms with terraces', 'ساكورا · غرف بتراسات'] },
      { p: [140.3, 10, -71.9], t: ['Sanat Çarşısı · kahve müzesi, galeri', 'Art Bazaar · coffee museum, gallery', 'سوق الفنون · متحف القهوة والمعرض'] },
      { p: [-91, 14, -46], t: ['Mağara süitleri', 'Cave suites', 'أجنحة الكهوف'] },
      { p: [100.4, 8, .2], t: ['Ebubekir Sıddık Camii', 'Abu Bakr Al-Siddiq Mosque', 'مسجد أبو بكر الصديق'] }
    ],
    yonler: {}, hale: [], kutu: [-190, 158, -4, 25, -125, 108], sinir: [165, 110], zoomMax: 9, odakZoom: 3.4
  },
  'ajwa-sultanahmet': {
    etiketler: [
      { p: [16.6, 3.8, 7.1], t: ['Ana giriş · oymalı mermer kapı', 'Main entrance · carved marble portal', 'المدخل الرئيسي · بوابة رخامية منحوتة'] },
      { p: [-3, 33.2, 8.4], t: ['Zeferan çatı restoranı', 'Zeferan rooftop restaurant', 'مطعم زعفران على السطح'] },
      { p: [15.6, 24.4, 6.4], t: ['Sultan Süiti · 7. kat', 'Sultan Suite · 7th floor', 'جناح السلطان · الطابق السابع'] },
      { p: [-6.5, 18.2, 9.2], t: ['Marmara manzaralı odalar', 'Sea of Marmara view rooms', 'غرف بإطلالة على بحر مرمرة'] },
      { p: [-10.5, 2.6, 9.2], t: ['Kırmızı-beyaz kemerli mermer cephe', 'Marble façade with banded stone arches', 'واجهة رخامية بأقواس حجرية مخططة'] }
    ],
    yonler: {}, hale: [], kutu: [-23, 23, -.65, 35.2, -15.5, 15.5], sinir: [12, 9], zoomMax: 6, odakZoom: 2.1
  },
  'deluxe-vertical-king': {
    etiketler: [
      { p: [-1.2, .95, -1.6], t: ['King yatak', 'King bed', 'سرير كينغ'] },
      { p: [.2, 2.05, -3.3], t: ['Dikey bahçe manzarası', 'Vertical garden view', 'إطلالة على الحديقة العمودية'], duvar: 'arka' },
      { p: [1.5, 1.15, -3.0], t: ['Sedef kakmalı koltuk ve sehpa', 'Mother-of-pearl armchair & table', 'كرسي وطاولة مطعّمان بالصدف'] },
      { p: [1.96, .95, -.6], t: ['Ceviz masa · 40" Loewe TV', 'Walnut desk · 40" Loewe TV', 'مكتب من الجوز · تلفاز لووي 40 بوصة'] },
      { p: [1.17, .03, .1], t: ['El dokuması ipek halı', 'Hand-woven silk carpet', 'سجادة حرير منسوجة يدويًا'] },
      { p: [-2.05, 1.0, 1.75], t: ['Çinili mermer banyo · kurna', 'Tiled marble bathroom · basin fountain', 'حمّام رخامي بالبلاط · جرن'] }
    ],
    yonler: { sol: [1, 0], sag: [-1, 0], arka: [0, 1], on: [0, -1] },
    hale: [[-2.1, .83, -3.03], [-2.1, .83, -.17]],
    pencere: [-1.62, 2.02, 2.55, -3.57], // dış bahçe yalnız bu açıklıktan görünür (x0, x1, üst, z)
    kes: .62, tavan: 2.85,
    kutu: [-2.56, 2.56, -.26, 2.85, -3.76, 3.76], sinir: [2.3, 3.5]
  }
};
const PLANLAR = { 'deluxe-vertical-king': deluxeDikey, 'ajwa-sultanahmet': ajwaSultanahmet, 'ajwa-kapadokya': ajwaKapadokya };
// Blender'da ışığı pişirilmiş sürümü olan odalar (tools/maket: disa.mjs → pisir.py); yüklenemezse yordamsal maket çizilir
const PISMIS = { 'deluxe-vertical-king': 'maket/deluxe-vertical-king', 'ajwa-sultanahmet': 'maket/ajwa-sultanahmet', 'ajwa-kapadokya': 'maket/ajwa-kapadokya' };
export const VAR = id => id in PLANLAR;
// araç: yordamsal sahneyi Blender'a aktarmak için üretir (tools/maket/disa.mjs)
export async function sahneOlustur(id) { await ON_YUKLE[id]?.(); DOKU = []; tohum = 7; const sahne = new THREE.Scene(); const plan = PLANLAR[id](sahne); return { sahne, plan, THREE }; }

/* ---------- ortam yansıması: sıcak oda ışığı (cila, pirinç, mermer, ayna için) ---------- */
function ortam(renderer) {
  const es = new THREE.Scene(), atilacak = [];
  const m = (geo, renk, x, y, z, rx = 0, ry = 0) => { const mm = new THREE.MeshBasicMaterial({ color: renk, side: THREE.DoubleSide }), o = new THREE.Mesh(geo, mm); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); es.add(o); atilacak.push(geo, mm); };
  m(new THREE.BoxGeometry(12, 6, 12), new THREE.Color(.42, .34, .26), 0, 2, 0);
  m(new THREE.PlaneGeometry(7, 7), new THREE.Color(2.4, 2.1, 1.7), 0, 4.8, 0, Math.PI / 2);
  m(new THREE.PlaneGeometry(5, 2.6), new THREE.Color(1.1, 1.5, .9), 0, 1.6, -5.9);
  m(new THREE.PlaneGeometry(3, 1.6), new THREE.Color(2.2, 1.6, 1), 5.9, 1.4, 0, 0, Math.PI / 2);
  const pm = new THREE.PMREMGenerator(renderer), rt = pm.fromScene(es, .04);
  pm.dispose(); atilacak.forEach(a => a.dispose());
  return rt;
}

/* ---------- pişmiş maket: Blender'da hesaplanmış ışık (lightmap) + aynı duvar/etiket düzeni ---------- */
const PARLAK = { altin: .65, ayna: 1, ekran: .5, cam: .8, seramik: .3, beyaz: .25, mermerZ: .16, cini: .14, siyah: .2, parke: .08 };
async function pismisYukle(sahne, id) {
  const yol = PISMIS[id], m = META[id];
  const [{ GLTFLoader }, { DRACOLoader }, bilgi] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm'),
    import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/DRACOLoader.js/+esm'),
    fetch(yol + '.json', { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  ]);
  const v = bilgi.surum ? '?v=' + bilgi.surum : ''; // yeni pişirmede eski glb/ışık dokusu önbellekten gelmesin (UV'ler değişir)
  // Draco ile sıkıştırılmış geometri (tools/maket/sikistir.py): çözücü jsDelivr'den, yalnız maket açılınca iner
  const draco = new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/');
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync(yol + '.glb' + v); draco.dispose();
  const kok = gltf.scene; sahne.add(kok);
  const dizin = yol.slice(0, yol.lastIndexOf('/') + 1), tl = new THREE.TextureLoader();
  const isikDoku = {};
  const ek = v;
  await Promise.all(Object.entries(bilgi.nesneler).map(async ([ad, v]) => {
    const t = await tl.loadAsync(dizin + v.lm + ek); t.flipY = false; t.channel = 1; t.colorSpace = THREE.SRGBColorSpace; isikDoku[ad] = [t, v.olcek];
  }));
  kok.traverse(o => {
    if (!o.isMesh) return;
    // birleşik nesne adı (lm_* ışık dokulu, dz_* saydam/ışık saçan); çok malzemeli nesneler alt düğüm olarak gelir
    let n = o; while (n && !isikDoku[n.name]) n = n.parent; // çok malzemeli nesnede parçalar lm_oda_1, lm_oda_2… adını alır
    const lm = n && isikDoku[n.name];
    o.material = [].concat(o.material).map(m0 => {
      const ad = m0.name.split('.')[0];
      if (ad.startsWith('yaprak') || ad === 'toprak') { const b = m0.clone(); b.name = ad; b.alphaTest = ad === 'toprak' ? 0 : .45; if (ad === 'toprak') b.color.set(0x2b3a22); b.side = THREE.DoubleSide; b.toneMapped = false; return b; } // dış mekân: gün ışığı renkleri ton eşlemeyle soldurulmaz
      if (['tul', 'kafes', 'bahce'].includes(ad)) {
        const b = new THREE.MeshBasicMaterial({ name: ad, map: ad === 'tul' ? tulKat(15) : m0.map, color: ad === 'tul' ? 0xffffff : ad === 'bahce' ? 0xd2d8c0 : 0x141210, transparent: m0.transparent, opacity: ad === 'tul' ? .38 : m0.opacity, alphaTest: m0.alphaTest, side: m0.side, depthWrite: ad !== 'tul', toneMapped: ad === 'kafes' });
        return b;
      }
      const mm = m0.clone(); mm.name = ad;
      if (ad === 'cam') { mm.opacity = .07; mm.color.set(0xeef6f3); } // cam neredeyse görünmez; yeşillik bulanıklaşmasın
      if (lm) { mm.lightMap = lm[0]; mm.lightMapIntensity = lm[1] * Math.PI * 1.05; }
      mm.envMapIntensity = PARLAK[ad] ?? .04; // kumaş, ahşap, duvar: neredeyse hiç yansıma yok
      if (!PARLAK[ad]) mm.roughness = Math.max(mm.roughness, .85);
      return mm;
    });
    if (o.material.length === 1) o.material = o.material[0];
  });
  // fener haleleri (ışıma)
  const haleM = new THREE.SpriteMaterial({ map: hale(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .7 });
  for (const p of m.hale) { const h = new THREE.Sprite(haleM); h.scale.set(.7, .7, 1); h.position.set(...p); kok.add(h); }
  const bos = () => new THREE.Group();
  const duvarlar = Object.entries(m.yonler).map(([ad, n]) => ({ ad, n, k: 1, duvar: kok.getObjectByName('duvar_' + ad) || bos(), ekli: kok.getObjectByName('ekli_' + ad) || bos(), kap: kok.getObjectByName('kap_' + ad) || bos() }));
  return { ...m, duvarlar, bahce: kok.getObjectByName('bahce_arka') };
}

/* ---------- sahne, kamera, etkileşim ---------- */
export async function kur(el, id, dil = 0, ayar = {}) {
  DOKU = []; tohum = 7;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, stencil: true });
  renderer.setPixelRatio(Math.min(ayar.dpr || 1.75, devicePixelRatio));   // retina ekranda bile en çok 1.75×: GPU yükü yarıya iner
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  const sahne = new THREE.Scene();
  const env = ortam(renderer); sahne.environment = env.texture;
  let plan = null;
  if (PISMIS[id]) {
    try { plan = await pismisYukle(sahne, id); }
    catch (e) { console.warn('Pişmiş maket yüklenemedi, yordamsal maket çiziliyor:', e); sahne.clear(); }
  }
  if (plan) {
    // ışık Blender'da hesaplandı: anlık ışık ve gölge yok (pozlama ?poz= ile denenebilir)
    // AgX: Blender'daki görünüme yakın, doygunluğu bastırılmış film tonu (deneme: ?ton=aces&poz=)
    const q = new URLSearchParams(location.search);
    renderer.toneMapping = q.get('ton') === 'aces' ? THREE.ACESFilmicToneMapping : THREE.AgXToneMapping;
    renderer.toneMappingExposure = +(q.get('poz') || (q.get('ton') === 'aces' ? .8 : 1.35));
  } else {
    await ON_YUKLE[id]?.(); plan = PLANLAR[id](sahne);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    sahne.add(new THREE.HemisphereLight(0xfff1dd, 0x5a4636, .75));
    const gunes = new THREE.DirectionalLight(0xffeedd, 1.9);
    gunes.position.set(4, 9, 5); gunes.castShadow = true; gunes.shadow.mapSize.set(2048, 2048);
    const [bx0, bx1, , , bz0, bz1] = plan.kutu, gy = Math.max(6.5, Math.hypot(bx1 - bx0, bz1 - bz0) / 2);   // büyük yerleşkede gölge kamerası da büyür
    if (gy > 6.5) { gunes.position.multiplyScalar(gy / 4); gunes.shadow.mapSize.set(4096, 4096); }
    Object.assign(gunes.shadow.camera, { left: -gy, right: gy, top: gy, bottom: -gy, near: 1, far: Math.max(30, gy * 5) }); gunes.shadow.bias = -.0005; gunes.shadow.normalBias = .02;
    sahne.add(gunes);
    const bahceIsik = new THREE.DirectionalLight(0xdff0c8, .45); bahceIsik.position.set(.3, 3, -9); sahne.add(bahceIsik);
  }
  // pencere portalı: dış bahçe yalnız pencere açıklığının içinden çizilir (şablon arabelleği);
  // böylece kesik duvarların üstünden ya da yandan bakınca odanın dışında yeşillik görünmez
  if (plan.bahce && plan.pencere) {
    const [px0, px1, py1, pz] = plan.pencere;
    const pm = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp });
    const portal = new THREE.Mesh(new THREE.PlaneGeometry(px1 - px0, py1), pm); portal.position.set((px0 + px1) / 2, py1 / 2, pz); portal.renderOrder = -10;
    plan.bahce.add(portal); portal.position.sub(plan.bahce.getWorldPosition(new THREE.Vector3()));
    plan.bahce.traverse(o => {
      if (!o.isMesh || o === portal) return; o.renderOrder = 10;
      for (const m of [].concat(o.material)) Object.assign(m, { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp });
    });
  }
  // her dış duvara kendi kesme düzlemi (malzemeler duvar başına kopyalanır; aynı malzemeyi kullanan eşyalar etkilenmesin)
  renderer.localClippingEnabled = true;
  for (const dv of plan.duvarlar) {
    dv.duzlem = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e4);
    for (const grup of [dv.duvar, dv.ekli]) grup?.traverse(o => {
      if (!o.isMesh) return;
      o.material = Array.isArray(o.material) ? o.material.map(m => Object.assign(m.clone(), { clippingPlanes: [dv.duzlem] })) : Object.assign(o.material.clone(), { clippingPlanes: [dv.duzlem] });
    });
  }
  // bu arada daha yeni bir maket istendiyse (Sultanahmet/Kapadokya geçişi, dil değişimi) sahneye hiç dokunmadan çekil
  if (ayar.gecerli && !ayar.gecerli()) { env.dispose(); renderer.dispose(); return null; }
  el.innerHTML = ''; el.appendChild(renderer.domElement);
  const kam = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 100);
  const ISO = Math.atan(1 / Math.SQRT2); // 35.26°
  // maket her dönüş açısında çerçeveye tam sığar: en kötü açıdaki genişlik/yükseklik baştan hesaplanır
  const [kx0, kx1, ky0, ky1, kz0, kz1] = plan.kutu, YR = Math.hypot((kx1 - kx0) / 2, (kz1 - kz0) / 2);
  const GEN = 2 * YR, YUK = (ky1 - ky0) * Math.cos(ISO) + 2 * YR * Math.sin(ISO), PAY = 1.07;
  const taban = new THREE.Vector3((kx0 + kx1) / 2, (ky0 + ky1) / 2, (kz0 + kz1) / 2), odak = taban.clone(), odakHedef = taban.clone();
  const [SX, SZ] = plan.sinir || [2.5, 3.5];
  let yaw = Math.PI / 4 + .12, hedefYaw = yaw, merkez = yaw, son = performance.now(), dokunma = -1e9, gorunur = true, raf = 0, bosBas = 0;
  // maketin sekiz köşesi: dinamik çerçevede o anki açıdaki gerçek izdüşüm genişliği/yüksekliği hesaplanır
  const KOSE = []; for (const x of [kx0, kx1]) for (const y of [ky0, ky1]) for (const z of [kz0, kz1]) KOSE.push([x - taban.x, y - taban.y, z - taban.z]);
  const izdusum = yw => {
    const cy = Math.cos(yw), sy = Math.sin(yw), si = Math.sin(ISO), ci = Math.cos(ISO); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const [x, y, z] of KOSE) { const u = x * cy - z * sy, v = -x * sy * si + y * ci - z * cy * si; x0 = Math.min(x0, u); x1 = Math.max(x1, u); y0 = Math.min(y0, v); y1 = Math.max(y1, v); }
    return { gen: x1 - x0, yuk: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  };
  if (ayar.dinamik && el.clientWidth / Math.max(1, el.clientHeight) < .9) {   // dikey ekran: maketin uzun kenarı derinliğe dönsün (daha büyük görünür)
    const olcu = yw => { const f = izdusum(yw); return Math.max(f.yuk, f.gen / (el.clientWidth / el.clientHeight)); };
    if (olcu(yaw + Math.PI / 2) < olcu(yaw) * .94) yaw = hedefYaw = merkez = yaw + Math.PI / 2;
  }
  let zoom = 1, hedefZoom = 1;
  const T = (tr, en, ar) => [tr, en, ar][dil] ?? tr;
  const UZ = Math.max(30, YR * 1.5); kam.far = UZ * 2.6; kam.updateProjectionMatrix();   // büyük maket (yerleşke) kameranın kesme düzlemlerine sığsın
  const yerlestir = () => {
    const d = UZ;
    kam.position.set(odak.x + Math.sin(yaw) * Math.cos(ISO) * d, odak.y + Math.sin(ISO) * d, odak.z + Math.cos(yaw) * Math.cos(ISO) * d);
    kam.lookAt(odak);
  };
  const cerceve = () => {
    // sagaKaydir: geniş ekranda maket sağa kayar (sol tarafta başlık yazısı var)
    // dinamik: o anki açıdaki gerçek izdüşüme sığar (döndükçe yumuşakça büyür/küçülür); değilse en kötü açıya göre sabit
    const w = el.clientWidth, h = el.clientHeight, a = w / h, kay = a > 1.25 ? (ayar.sagaKaydir || 0) : 0;
    const f = ayar.dinamik ? izdusum(yaw) : { gen: GEN, yuk: YUK, cx: 0, cy: 0 }, P = ayar.dinamik ? (ayar.pay || 1.08) : PAY;
    const s = Math.max(f.yuk, f.gen / (a * (1 - 2 * kay))) * P, ox = kay * s * a;
    // çerçeve merkezi yakınlaşmaya bölünür: hedef nokta her yakınlıkta ekranın aynı yerinde (sağa kaydırılmış görünür alanın ortasında) kalır
    const cx0 = (f.cx - ox) / zoom, cy0 = f.cy / zoom;
    kam.left = cx0 - s * a / 2; kam.right = cx0 + s * a / 2; kam.top = cy0 + s / 2; kam.bottom = cy0 - s / 2; kam.updateProjectionMatrix();
  };
  const boyutla = () => { renderer.setSize(el.clientWidth, el.clientHeight, false); cerceve(); };
  // duvarlar: kameranın bulunduğu taraftaki dış duvarlar alçalır, karşıdakiler yükselir
  const duvarla = (dt) => {
    let oynuyor = false;
    for (const dv of plan.duvarlar) {
      const hedef = dv.n[0] * Math.sin(yaw) + dv.n[1] * Math.cos(yaw) > -.18 ? 1 : 0;
      dv.k += (hedef - dv.k) * (dt < 0 ? 1 : Math.min(1, dt * 7));
      // kesme düzlemi: duvar ve üstündeki eşyalar bu yüksekliğin üstünde çizilmez; siyah kapak kesime oturur
      const kes = plan.kes ?? .62, ty = plan.tavan ?? 2.85, cy = kes + (ty + .06 - kes) * dv.k;
      dv.duzlem.constant = dv.k > .99 ? 1e4 : cy;
      dv.kap.visible = dv.k < .99; dv.kap.position.y = cy - kes;
      if (Math.abs(hedef - dv.k) > 1e-3) oynuyor = true;
    }
    // pencere dışındaki bahçe yalnız pencereye önden/yarı yandan bakarken görünür (yoksa odanın dışına taşmış gibi durur)
    if (plan.bahce) plan.bahce.visible = Math.cos(yaw) > .28 && (plan.duvarlar.find(d => d.ad === 'arka')?.k ?? 1) > .55;
    return oynuyor;
  };

  /* yakınlaştırma: imlecin / iki parmağın altındaki nokta yerinde kalır; uzaklaştıkça oda ortaya döner */
  const isin = new THREE.Raycaster(), duzlem = new THREE.Plane(new THREE.Vector3(0, 1, 0), -taban.y), nokta = new THREE.Vector3();
  const zeminde = (cx, cy) => {
    const r = el.getBoundingClientRect();
    isin.setFromCamera(new THREE.Vector2((cx - r.left) / r.width * 2 - 1, 1 - (cy - r.top) / r.height * 2), kam);
    return isin.ray.intersectPlane(duzlem, nokta) ? nokta.clone() : null;
  };
  const sinirla = v => { v.x = Math.max(-SX, Math.min(SX, v.x)); v.z = Math.max(-SZ, Math.min(SZ, v.z)); v.y = Math.max(ky0, Math.min(ky1, v.y)); return v; };   // y: seçilen yerin kendi yüksekliği (giriş zeminde, çatı yukarıda)
  const zoomla = (carpan, cx, cy) => {
    const z0 = hedefZoom, z1 = Math.max(1, Math.min(plan.zoomMax || 4, z0 * carpan));
    if (Math.abs(z1 - z0) < 1e-4) return;
    if (z1 > z0) { const P = cx == null ? null : zeminde(cx, cy); if (P) odakHedef.sub(P).multiplyScalar(z0 / z1).add(P); }
    else odakHedef.sub(taban).multiplyScalar(z0 > 1 ? (z1 - 1) / (z0 - 1) : 0).add(taban);
    sinirla(odakHedef); hedefZoom = z1; dokunma = performance.now();
  };

  /* noktalar: yalnız numara görünür, dokununca yazı açılır ve maket o eşyaya yaklaşır */
  const DUV = Object.fromEntries(plan.duvarlar.map(d => [d.ad, d]));
  let acik = null;
  const etiketKapat = () => { if (!acik) return; acik.d.classList.remove('acik'); acik.b.setAttribute('aria-expanded', 'false'); acik = null; ayar.secim?.(-1); };
  const lbl = plan.etiketler.map((e, i) => {
    const metin = e.t[dil] ?? e.t[0], d = document.createElement('div'), b = document.createElement('button'), sp = document.createElement('span');
    d.className = 'iso__lbl'; b.type = 'button'; b.className = 'iso__no'; b.textContent = i + 1; b.setAttribute('aria-label', metin); b.setAttribute('aria-expanded', 'false');
    sp.textContent = metin; d.append(b, sp); el.appendChild(d);
    const o = { e, d, b, sp, v: new THREE.Vector3(...e.p) };
    b.addEventListener('click', ev => {
      ev.stopPropagation(); const ac = acik !== o; etiketKapat(); if (!ac) return;
      acik = o; d.classList.add('acik'); b.setAttribute('aria-expanded', 'true'); ayar.secim?.(i);
      sinirla(odakHedef.set(o.v.x, o.v.y, o.v.z)); hedefZoom = Math.max(hedefZoom, plan.odakZoom || 1.9); dokunma = performance.now();
    });
    sp.addEventListener('click', ev => { ev.stopPropagation(); etiketKapat(); });
    return o;
  });
  const etiketle = () => {
    const w = el.clientWidth, h = el.clientHeight, dolu = [];
    for (const { e, v, d, sp } of acik ? [acik, ...lbl.filter(x => x !== acik)] : lbl) {
      const p = v.clone().project(kam), px = (p.x + 1) / 2 * w, py = (1 - p.y) / 2 * h;
      // yazı sağa sığarsa sağa, yoksa sola; iki yana da sığmazsa (dar ekran) noktanın altında ortalanır
      const ac = d.classList.contains('acik'), sw = ac ? sp.offsetWidth : 0, bw = 22 + (ac ? sw + 8 : 0);
      const sag = px - 11 + bw <= w - 8, solaSigar = px + 11 - bw >= 8, sol = !sag && solaSigar, alt = ac && !sag && !solaSigar;
      d.classList.toggle('sol', sol); d.classList.toggle('alt', alt);
      const sx = alt ? Math.max(8, Math.min(w - 8 - sw, px - sw / 2)) - px : 0;
      if (alt) sp.style.setProperty('--x', `${sx.toFixed(1)}px`);
      d.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px)`;
      // duvarıyla gizlenen, kadrajdan çıkan ya da açık/öndeki bir noktayla çakışan nokta o açıda gösterilmez
      const k = alt ? [px + sx, py - 13, px + sx + sw, py + 20 + sp.offsetHeight] : sol ? [px - bw + 11, py - 13, px + 11, py + 13] : [px - 11, py - 13, px + bw - 11, py + 13];
      const gizli = (e.duvar && DUV[e.duvar].k < .55) || px < 4 || px > w - 4 || py < 4 || py > h - 4 || dolu.some(o => o[0] < k[2] && k[0] < o[2] && o[1] < k[3] && k[1] < o[3]);
      if (!gizli) dolu.push(k);
      d.style.visibility = gizli ? 'hidden' : '';
    }
  };

  /* yakınlaştır / uzaklaştır / sıfırla düğmeleri */
  const kont = document.createElement('div'); kont.className = 'iso__kont';
  const dug = (sinif, ad, yol, fn) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = sinif; b.title = ad; b.setAttribute('aria-label', ad);
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${yol}"/></svg>`;
    b.addEventListener('click', e => { e.stopPropagation(); fn(); }); kont.appendChild(b);
  };
  dug('', T('Yakınlaştır', 'Zoom in', 'تكبير'), 'M12 5v14M5 12h14', () => zoomla(1.45));
  dug('', T('Uzaklaştır', 'Zoom out', 'تصغير'), 'M5 12h14', () => zoomla(1 / 1.45));
  dug('', T('Sola çevir', 'Turn left', 'تدوير لليسار'), 'M8.5 7.5H4.5v-4M4.8 7.3A8 8 0 1 1 4 12', () => { hedefYaw += Math.PI / 4; merkez = hedefYaw; dokunma = performance.now(); });
  dug('', T('Sağa çevir', 'Turn right', 'تدوير لليمين'), 'M15.5 7.5h4v-4M19.2 7.3A8 8 0 1 0 20 12', () => { hedefYaw -= Math.PI / 4; merkez = hedefYaw; dokunma = performance.now(); });
  dug('iso__sifir', T('Görünümü sıfırla', 'Reset view', 'إعادة ضبط العرض'), 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4', () => { hedefZoom = 1; odakHedef.copy(taban); etiketKapat(); });
  el.appendChild(kont);

  /* tek parmak / fare: döndür · iki parmak: yakınlaştır · tekerlek (maket etkinken ya da Ctrl ile) · çift tık */
  const parmak = new Map(); let suruk = null, kistir = 0, bas = null;
  // yakınlaşmışken sürüklemek gezdirir: ekrandaki kayma zemin düzleminde odağı taşır
  const kaydir = (dx, dy) => {
    const u = (kam.right - kam.left) / kam.zoom / el.clientWidth, sy = Math.sin(yaw), cy = Math.cos(yaw), d = Math.sin(ISO);
    odakHedef.x += -cy * dx * u - sy * dy * u / d;
    odakHedef.z += sy * dx * u - cy * dy * u / d;
    sinirla(odakHedef); dokunma = performance.now();
  };
  const arayuz = e => e.target.closest('.iso__lbl, .iso__kont');
  el.addEventListener('pointerdown', e => {
    if (arayuz(e)) return;
    parmak.set(e.pointerId, { x: e.clientX, y: e.clientY }); el.setPointerCapture(e.pointerId); dokunma = performance.now();
    if (e.pointerType === 'mouse') el.focus({ preventScroll: true });   // klavye kısayolları için odak (sayfa kaymasın)
    if (parmak.size === 1) { suruk = { x: e.clientX, y: hedefYaw, lx: e.clientX, ly: e.clientY, cevir: e.button === 2 || e.shiftKey }; bas = { x: e.clientX, y: e.clientY }; el.classList.add('is-drag'); }
    else if (parmak.size === 2) { if (suruk) merkez = hedefYaw; suruk = null; bas = null; const [a, b] = [...parmak.values()]; kistir = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  el.addEventListener('pointermove', e => {
    if (!parmak.has(e.pointerId)) return;
    parmak.set(e.pointerId, { x: e.clientX, y: e.clientY }); dokunma = performance.now();
    if (kistir && parmak.size === 2) { const [a, b] = [...parmak.values()], d = Math.hypot(a.x - b.x, a.y - b.y); zoomla(d / kistir, (a.x + b.x) / 2, (a.y + b.y) / 2); kistir = d; }
    else if (suruk) {
      if (hedefZoom > 1.02 && !suruk.cevir) kaydir(e.clientX - suruk.lx, e.clientY - suruk.ly);  // yakınken: gez
      else hedefYaw = suruk.y - (e.clientX - suruk.x) * .007; // uzakken (ya da sağ tık / Shift): çevir
      suruk.lx = e.clientX; suruk.ly = e.clientY;
    }
  });
  const birak = e => {
    if (!parmak.has(e.pointerId)) return;
    if (bas && e.type === 'pointerup' && Math.hypot(e.clientX - bas.x, e.clientY - bas.y) < 6) etiketKapat(); // boş yere dokunma açık yazıyı kapatır
    parmak.delete(e.pointerId);
    if (suruk) merkez = hedefYaw; suruk = null; bas = null;
    if (parmak.size < 2) kistir = 0;
    if (!parmak.size) el.classList.remove('is-drag');
  };
  el.addEventListener('pointerup', birak); el.addEventListener('pointercancel', birak);
  // tekerlek: odadaki maket üzerinde hep yakınlaştırır; sayfa başındaki büyük maket (tekerlekCtrl) yalnız Ctrl/⌘ ile — yoksa sayfa kayar
  if (!ayar.tekerlekCtrl) el.setAttribute('data-lenis-prevent', '');
  let etkin = false, ipZaman = 0;
  const ip = document.createElement('div'); ip.className = 'iso__ip'; ip.setAttribute('aria-hidden', 'true');
  ip.textContent = T('Yakınlaştırmak için maketin üstüne bir kez tıklayın ya da Ctrl + tekerlek', 'Click the model once to zoom with the wheel, or use Ctrl + wheel', 'انقر على المجسّم مرة للتكبير بالعجلة، أو استخدم Ctrl مع العجلة');
  el.appendChild(ip);
  if (ayar.tekerlekCtrl) {
    el.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') { etkin = true; el.classList.add('is-etkin'); el.setAttribute('data-lenis-prevent', ''); ip.classList.remove('gor'); } });
    el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !parmak.size) { etkin = false; el.classList.remove('is-etkin'); el.removeAttribute('data-lenis-prevent'); } });
  }
  el.addEventListener('wheel', e => {
    if (ayar.tekerlekCtrl && !etkin && !(e.ctrlKey || e.metaKey)) {   // sayfa kaymaya devam eder; ipucu kısa süre görünür
      ip.classList.add('gor'); clearTimeout(ipZaman); ipZaman = setTimeout(() => ip.classList.remove('gor'), 1600); return;
    }
    e.preventDefault(); e.stopPropagation(); zoomla(Math.exp(-e.deltaY * .0016), e.clientX, e.clientY);
  }, { passive: false });
  // klavye: ← → çevir (yakınken kaydır), ↑ ↓ kaydır, + − yakınlaş, 0 / Esc sıfırla, 1–9 yere git
  el.tabIndex = 0;
  el.addEventListener('keydown', e => {
    const k = e.key, adim = 70;
    if (k === '+' || k === '=') zoomla(1.35);
    else if (k === '-' || k === '_') zoomla(1 / 1.35);
    else if (k === '0' || k === 'Escape') { hedefZoom = 1; odakHedef.copy(taban); etiketKapat(); }
    else if (/^[1-9]$/.test(k) && lbl[+k - 1]) lbl[+k - 1].b.click();
    else if ((k === 'ArrowLeft' || k === 'ArrowRight') && hedefZoom <= 1.02) { hedefYaw += (k === 'ArrowLeft' ? 1 : -1) * Math.PI / 8; merkez = hedefYaw; }
    else if (k.startsWith('Arrow')) kaydir(k === 'ArrowLeft' ? adim : k === 'ArrowRight' ? -adim : 0, k === 'ArrowUp' ? adim : k === 'ArrowDown' ? -adim : 0);
    else return;
    e.preventDefault(); dokunma = performance.now(); uyandir();
  });
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('dblclick', e => { if (!arayuz(e)) zoomla(1.7, e.clientX, e.clientY); });

  const io = new IntersectionObserver(es => { gorunur = es[0].isIntersecting; if (gorunur && !raf) { son = performance.now(); raf = requestAnimationFrame(dongu); } }, { threshold: .05 });
  io.observe(el);
  // çizim yalnız bir şey değişirken döner (sürükleme, yakınlaşma, duvar hareketi); durunca GPU boşta kalır
  function dongu(t) {
    raf = 0; if (!gorunur) return;
    const dt = Math.min(.05, (t - son) / 1000); son = t;
    const donuyor = Math.abs(hedefYaw - yaw) > 1e-4;
    yaw += (hedefYaw - yaw) * Math.min(1, dt * 4);
    if (donuyor && ayar.dinamik) cerceve();
    const zk = Math.min(1, dt * 8);
    if (Math.abs(hedefZoom - zoom) > 1e-4) { zoom += (hedefZoom - zoom) * zk; kam.zoom = zoom; cerceve(); }
    odak.lerp(odakHedef, zk);
    el.classList.toggle('is-zoom', hedefZoom > 1.02 || !!acik);
    yerlestir(); const duvarOynuyor = duvarla(dt); renderer.render(sahne, kam); etiketle();
    const devam = suruk || kistir || duvarOynuyor || Math.abs(hedefYaw - yaw) > 2e-4 || Math.abs(hedefZoom - zoom) > 2e-4 || odak.distanceTo(odakHedef) > 2e-4;
    if (devam) raf = requestAnimationFrame(dongu);
  }
  const uyandir = () => { if (!raf && gorunur) { son = performance.now(); raf = requestAnimationFrame(dongu); } };
  for (const olay of ['pointerdown', 'pointermove', 'wheel', 'click', 'dblclick', 'keydown']) el.addEventListener(olay, uyandir, { capture: true, passive: true });
  const ro = new ResizeObserver(() => { boyutla(); yerlestir(); renderer.render(sahne, kam); etiketle(); });
  ro.observe(el);
  boyutla(); yerlestir(); duvarla(-1); raf = requestAnimationFrame(dongu);
  return {
    etiketler: plan.etiketler.map(e => e.t[dil] ?? e.t[0]),
    git(i) { const o = lbl[i]; if (!o) return; if (acik === o) { sinirla(odakHedef.set(o.v.x, o.v.y, o.v.z)); hedefZoom = Math.max(hedefZoom, plan.odakZoom || 1.9); dokunma = performance.now(); } else o.b.click(); uyandir(); },
    sifirla() { hedefZoom = 1; odakHedef.copy(taban); etiketKapat(); uyandir(); },
    kapat() {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); clearTimeout(ipZaman);
      sahne.traverse(o => { o.geometry?.dispose(); [].concat(o.material || []).forEach(m => { for (const k of ['map', 'lightMap', 'bumpMap', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'alphaMap']) m[k]?.dispose(); m.dispose(); }); });
      DOKU.forEach(t => t.dispose()); env.dispose(); renderer.dispose(); if (renderer.domElement.parentNode === el) el.innerHTML = '';   // sahne başka bir maketin olduysa onu silme el.classList.remove('is-zoom', 'is-drag');
    }
  };
}
