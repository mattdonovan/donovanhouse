import { CanvasTexture, SRGBColorSpace } from "three";
import { PAGE_ASPECT } from "./Book.jsx";

const NAVY = "#1f2b3b";
const ORANGE = "#f2540b";
const PAPER = "#f7f4ef";

const W = 1024;
const H = Math.round(W / PAGE_ASPECT);

let fontsReady;
function loadFonts() {
  fontsReady ??= Promise.all([
    document.fonts.load('900 80px "Montserrat"'),
    document.fonts.load('600 24px "Montserrat"'),
    document.fonts.load('500 24px "Montserrat"'),
    document.fonts.load('80px "Allison"'),
  ]).catch(() => {});
  return fontsReady;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Draw `img` (cropped to normalized [x, y, w, h]) so it fills the box, like CSS object-fit: cover.
function drawCover(ctx, img, crop, bx, by, bw, bh) {
  const [cx, cy, cw, ch] = crop ?? [0, 0, 1, 1];
  let sx = cx * img.width, sy = cy * img.height, sw = cw * img.width, sh = ch * img.height;
  const boxAspect = bw / bh;
  if (sw / sh > boxAspect) {
    const nw = sh * boxAspect;
    sx += (sw - nw) / 2;
    sw = nw;
  } else {
    const nh = sw / boxAspect;
    sy += (sh - nh) / 2;
    sh = nh;
  }
  ctx.drawImage(img, sx, sy, sw, sh, bx, by, bw, bh);
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  lines.push(line);
  return lines;
}

function spaced(ctx, text, x, y, spacing) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

function toTexture(canvas) {
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export async function makeCoverTexture(project) {
  await loadFonts();
  const img = project.cover?.src ? await loadImage(project.cover.src) : null;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  const M = 56;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Masthead
  ctx.fillStyle = NAVY;
  ctx.font = '900 34px "Montserrat"';
  ctx.textBaseline = "alphabetic";
  spaced(ctx, "DONOVAN HOUSE", M, 82, 6);
  ctx.font = '600 20px "Montserrat"';
  ctx.textAlign = "right";
  ctx.fillText(`NO. ${project.number}  ·  ${project.term.toUpperCase()}`, W - M, 80);
  ctx.textAlign = "left";
  ctx.fillRect(M, 104, W - 2 * M, 3);

  // Image well
  const iy = 128;
  const ih = H - iy - 300;
  if (img) {
    drawCover(ctx, img, project.cover.crop, M, iy, W - 2 * M, ih);
  } else {
    ctx.fillStyle = NAVY;
    ctx.fillRect(M, iy, W - 2 * M, ih);
    ctx.fillStyle = ORANGE;
    ctx.font = '140px "Allison"';
    ctx.textAlign = "center";
    ctx.fillText("Coming soon", W / 2, iy + ih / 2 + 40);
    ctx.textAlign = "left";
  }

  // Title block
  ctx.fillStyle = NAVY;
  let size = 76;
  ctx.font = `900 ${size}px "Montserrat"`;
  let lines = wrap(ctx, project.shortTitle ?? project.title, W - 2 * M);
  if (lines.length > 2) {
    size = 60;
    ctx.font = `900 ${size}px "Montserrat"`;
    lines = wrap(ctx, project.shortTitle ?? project.title, W - 2 * M);
  }
  let ty = iy + ih + 26 + size;
  for (const l of lines.slice(0, 2)) {
    ctx.fillText(l, M - 4, ty);
    ty += size * 0.98;
  }
  ctx.fillStyle = ORANGE;
  ctx.font = '84px "Allison"';
  ctx.textAlign = "right";
  ctx.fillText("Kristin Donovan", W - M, H - 52);
  ctx.textAlign = "left";
  ctx.fillStyle = NAVY;
  ctx.font = '500 22px "Montserrat"';
  ctx.fillText(project.course, M, H - 58);

  return toTexture(c);
}

export async function makeBackCoverTexture() {
  await loadFonts();
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PAPER;
  ctx.textAlign = "center";
  ctx.font = '900 150px "Montserrat"';
  ctx.fillText("portfolio", W / 2, H / 2 - 20);
  ctx.fillStyle = ORANGE;
  ctx.font = '120px "Allison"';
  ctx.fillText("Kristin Donovan", W / 2 + 120, H / 2 + 90);
  ctx.fillStyle = PAPER;
  ctx.font = '500 26px "Montserrat"';
  ctx.fillText("donovanhouse@outlook.com", W / 2, H - 90);
  return toTexture(c);
}

// Final spread for the shelf flip-through: title on the left page, a big
// "Open project" call to action on the right page. Same 16:9 shape as a slide.
export async function makeEndCardTexture(project) {
  await loadFonts();
  const SW = W * 2;
  const c = document.createElement("canvas");
  c.width = SW;
  c.height = H;
  const ctx = c.getContext("2d");
  const M = 72;

  // Left page: paper, project details
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = NAVY;
  ctx.font = '600 24px "Montserrat"';
  spaced(ctx, `NO. ${project.number}  ·  ${project.term.toUpperCase()}`, M, 120, 3);
  ctx.font = '900 76px "Montserrat"';
  let y = 230;
  for (const l of wrap(ctx, project.title, W - 2 * M).slice(0, 3)) {
    ctx.fillText(l, M - 3, y);
    y += 78;
  }
  ctx.font = '600 28px "Montserrat"';
  ctx.fillText(project.course, M, y + 20);
  const n = project.spreads.length;
  ctx.fillStyle = "#5d6470";
  ctx.font = '500 26px "Montserrat"';
  ctx.fillText(n ? `${n} spread${n === 1 ? "" : "s"} inside` : "Pages coming soon", M, y + 70);
  ctx.fillStyle = ORANGE;
  ctx.font = '96px "Allison"';
  ctx.fillText("Kristin Donovan", M, H - 90);

  // Right page: navy call to action
  ctx.fillStyle = NAVY;
  ctx.fillRect(W, 0, W, H);
  ctx.fillStyle = PAPER;
  ctx.font = '900 150px "Montserrat"';
  ctx.fillText("Open", W + M, H / 2 - 40);
  ctx.fillText("project", W + M, H / 2 + 110);
  ctx.fillStyle = ORANGE;
  ctx.font = '900 150px "Montserrat"';
  ctx.fillText("→", W + M, H / 2 + 280);
  ctx.fillStyle = PAPER;
  ctx.font = '500 24px "Montserrat"';
  ctx.fillText("Click to read", W + M, H - 90);

  return toTexture(c);
}
