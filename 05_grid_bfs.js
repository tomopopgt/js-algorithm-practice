import { readFileSync } from 'fs';

/**
 * 幅優先探索 (BFS) を用いてグリッド上の最短歩数を求める
 * @param {number} h - 縦のサイズ
 * @param {number} w - 横のサイズ
 * @param {string[]} grid - 迷路データ
 * @returns {number} 最短歩数 (到達不可の場合は -1)
 */
function solveBFS(h, w, grid) {
  let startX = -1, startY = -1;
  let goalX = -1, goalY = -1;

  // スタートとゴールの座標を特定
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (grid[r][c] === 'S') {
        startX = r;
        startY = c;
      } else if (grid[r][c] === 'G') {
        goalX = r;
        goalY = c;
      }
    }
  }

  // 訪問状態と距離を記録する 2次元配列 (-1 で初期化)
  const dist = Array.from({ length: h }, () => new Array(w).fill(-1));
  dist[startX][startY] = 0;

  // キュー構造の最適化: shift() による O(N) 遅延を避けるため head インデックスで管理
  const queue = [[startX, startY]];
  let head = 0;

  // 上下左右の移動ベクトル
  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];

  while (head < queue.length) {
    const [r, c] = queue[head++];

    if (r === goalX && c === goalY) {
      return dist[r][c];
    }

    for (let i = 0; i < 4; i++) {
      const nr = r + dr[i];
      const nc = c + dc[i];

      // グリッド範囲内 かつ 壁ではなく 未訪問 であるか確認
      if (nr >= 0 && nr < h && nc >= 0 && nc < w) {
        if (grid[nr][nc] !== '#' && dist[nr][nc] === -1) {
          dist[nr][nc] = dist[r][c] + 1;
          queue.push([nr, nc]);
        }
      }
    }
  }

  return -1; // ゴールに到達できない場合
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [h, w] = input[0].trim().split(/\s+/).map(Number);
  const grid = [];
  for (let i = 0; i < h; i++) {
    grid.push(input[1 + i].trim());
  }

  const result = solveBFS(h, w, grid);
  console.log(result);
}

main();