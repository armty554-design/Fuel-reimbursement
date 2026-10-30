const sharp = require('sharp');
const fs = require('fs');

async function processTruck() {
  const inputBuf = fs.readFileSync('src/assets/sprinkle-truck.jpg');
  const { data, info } = await sharp(inputBuf).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const threshold = 245;

  // Flood fill from borders
  const isBg = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0, tail = 0;

  function isWhite(x, y) {
    const idx = (y * w + x) * 3;
    return data[idx] >= threshold && data[idx+1] >= threshold && data[idx+2] >= threshold;
  }

  for (let x = 0; x < w; x++) {
    if (isWhite(x, 0) && !isBg[0 * w + x]) { isBg[0 * w + x] = 1; queue[tail++] = 0 * w + x; }
    if (isWhite(x, h - 1) && !isBg[(h - 1) * w + x]) { isBg[(h - 1) * w + x] = 1; queue[tail++] = (h - 1) * w + x; }
  }
  for (let y = 0; y < h; y++) {
    if (isWhite(0, y) && !isBg[y * w + 0]) { isBg[y * w + 0] = 1; queue[tail++] = y * w + 0; }
    if (isWhite(w - 1, y) && !isBg[y * w + w - 1]) { isBg[y * w + w - 1] = 1; queue[tail++] = y * w + w - 1; }
  }

  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];

  while (head < tail) {
    const p = queue[head++];
    const cx = p % w;
    const cy = Math.floor(p / w);

    for (let i = 0; i < 4; i++) {
      const nx = cx + dx[i];
      const ny = cy + dy[i];
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const np = ny * w + nx;
        if (!isBg[np] && isWhite(nx, ny)) {
          isBg[np] = 1;
          queue[tail++] = np;
        }
      }
    }
  }

  // Create RGBA buffer
  const outData = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const srcIdx = p * 3;
      const dstIdx = p * 4;

      if (isBg[p]) {
        outData[dstIdx] = 0;
        outData[dstIdx+1] = 0;
        outData[dstIdx+2] = 0;
        outData[dstIdx+3] = 0;
      } else {
        const r = data[srcIdx];
        const g = data[srcIdx+1];
        const b = data[srcIdx+2];

        let isEdge = false;
        for (let i = 0; i < 4; i++) {
          const nx = x + dx[i];
          const ny = y + dy[i];
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && isBg[ny * w + nx]) {
            isEdge = true;
            break;
          }
        }

        if (isEdge) {
          const dist = 255 - Math.min(r, g, b);
          const alphaNorm = Math.min(1.0, Math.max(0.1, dist / 25.0));
          const alpha = Math.round(alphaNorm * 255);

          const unmatteR = Math.min(255, Math.max(0, Math.round((r - (1 - alphaNorm) * 255) / alphaNorm)));
          const unmatteG = Math.min(255, Math.max(0, Math.round((g - (1 - alphaNorm) * 255) / alphaNorm)));
          const unmatteB = Math.min(255, Math.max(0, Math.round((b - (1 - alphaNorm) * 255) / alphaNorm)));

          outData[dstIdx] = unmatteR;
          outData[dstIdx+1] = unmatteG;
          outData[dstIdx+2] = unmatteB;
          outData[dstIdx+3] = alpha;
        } else {
          outData[dstIdx] = r;
          outData[dstIdx+1] = g;
          outData[dstIdx+2] = b;
          outData[dstIdx+3] = 255;
        }
      }
    }
  }

  await sharp(outData, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .png({ quality: 100 })
    .toFile('src/assets/sprinkle-truck.png');

  fs.copyFileSync('src/assets/sprinkle-truck.png', 'public/assets/sprinkle-truck.png');
  console.log('Saved transparent truck to src/assets/sprinkle-truck.png & public/assets/sprinkle-truck.png');
}

async function processBottle() {
  const inputBuf = fs.readFileSync('src/assets/sprinkle-bottle.webp');
  const { data, info } = await sharp(inputBuf).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const threshold = 250;

  // Flood fill from borders
  const isBg = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0, tail = 0;

  function isWhite(x, y) {
    const idx = (y * w + x) * 3;
    return data[idx] >= threshold && data[idx+1] >= threshold && data[idx+2] >= threshold;
  }

  for (let x = 0; x < w; x++) {
    if (isWhite(x, 0) && !isBg[0 * w + x]) { isBg[0 * w + x] = 1; queue[tail++] = 0 * w + x; }
    if (isWhite(x, h - 1) && !isBg[(h - 1) * w + x]) { isBg[(h - 1) * w + x] = 1; queue[tail++] = (h - 1) * w + x; }
  }
  for (let y = 0; y < h; y++) {
    if (isWhite(0, y) && !isBg[y * w + 0]) { isBg[y * w + 0] = 1; queue[tail++] = y * w + 0; }
    if (isWhite(w - 1, y) && !isBg[y * w + w - 1]) { isBg[y * w + w - 1] = 1; queue[tail++] = y * w + w - 1; }
  }

  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];

  while (head < tail) {
    const p = queue[head++];
    const cx = p % w;
    const cy = Math.floor(p / w);

    for (let i = 0; i < 4; i++) {
      const nx = cx + dx[i];
      const ny = cy + dy[i];
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const np = ny * w + nx;
        if (!isBg[np] && isWhite(nx, ny)) {
          isBg[np] = 1;
          queue[tail++] = np;
        }
      }
    }
  }

  // Create RGBA buffer
  const outData = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const srcIdx = p * 3;
      const dstIdx = p * 4;

      if (isBg[p]) {
        outData[dstIdx] = 0;
        outData[dstIdx+1] = 0;
        outData[dstIdx+2] = 0;
        outData[dstIdx+3] = 0;
      } else {
        const r = data[srcIdx];
        const g = data[srcIdx+1];
        const b = data[srcIdx+2];

        let isEdge = false;
        for (let i = 0; i < 4; i++) {
          const nx = x + dx[i];
          const ny = y + dy[i];
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && isBg[ny * w + nx]) {
            isEdge = true;
            break;
          }
        }

        if (isEdge) {
          const dist = 255 - Math.min(r, g, b);
          const alphaNorm = Math.min(1.0, Math.max(0.1, dist / 25.0));
          const alpha = Math.round(alphaNorm * 255);

          const unmatteR = Math.min(255, Math.max(0, Math.round((r - (1 - alphaNorm) * 255) / alphaNorm)));
          const unmatteG = Math.min(255, Math.max(0, Math.round((g - (1 - alphaNorm) * 255) / alphaNorm)));
          const unmatteB = Math.min(255, Math.max(0, Math.round((b - (1 - alphaNorm) * 255) / alphaNorm)));

          outData[dstIdx] = unmatteR;
          outData[dstIdx+1] = unmatteG;
          outData[dstIdx+2] = unmatteB;
          outData[dstIdx+3] = alpha;
        } else {
          outData[dstIdx] = r;
          outData[dstIdx+1] = g;
          outData[dstIdx+2] = b;
          outData[dstIdx+3] = 255;
        }
      }
    }
  }

  // Save to transparent PNG
  await sharp(outData, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .png({ quality: 100 })
    .toFile('src/assets/sprinkle-bottle.png');

  fs.copyFileSync('src/assets/sprinkle-bottle.png', 'public/assets/sprinkle-bottle.png');
  console.log('Saved transparent bottle to src/assets/sprinkle-bottle.png & public/assets/sprinkle-bottle.png');
}

async function main() {
  await processTruck();
  await processBottle();
}
main();
