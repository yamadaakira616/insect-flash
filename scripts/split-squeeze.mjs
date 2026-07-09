// グリッド画像をセル単位に分割して public/assets/squeeze/ へ出力する一回きりのスクリプト
// 使い方: node scripts/split-squeeze.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'scripts/squeeze-src';
const OUT = 'public/assets/squeeze';

const JOBS = [
  { file: 'normal-1.png', cols: 6, rows: 4, outDir: 'normal', prefix: 'n', startIndex: 1 },
  { file: 'normal-2.png', cols: 6, rows: 4, outDir: 'normal', prefix: 'n', startIndex: 25 },
  { file: 'rare-1.png',   cols: 2, rows: 2, outDir: 'rare',   prefix: 'r', startIndex: 1 },
];

for (const job of JOBS) {
  const { width, height } = await sharp(path.join(SRC, job.file)).metadata();
  await mkdir(path.join(OUT, job.outDir), { recursive: true });
  let idx = job.startIndex;
  for (let row = 0; row < job.rows; row++) {
    for (let col = 0; col < job.cols; col++) {
      const left = Math.round((col * width) / job.cols);
      const top = Math.round((row * height) / job.rows);
      const w = Math.round(((col + 1) * width) / job.cols) - left;
      const h = Math.round(((row + 1) * height) / job.rows) - top;
      const name = `${job.prefix}${String(idx).padStart(2, '0')}.png`;
      await sharp(path.join(SRC, job.file))
        .extract({ left, top, width: w, height: h })
        .png()
        .toFile(path.join(OUT, job.outDir, name));
      idx++;
    }
  }
  console.log(`${job.file} → ${idx - job.startIndex} cells`);
}
