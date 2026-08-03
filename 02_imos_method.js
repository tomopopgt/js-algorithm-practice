import { readFileSync } from 'fs';

/**
 * いもす法 (Imos Method) を用いて最大同時重複数を計算する
 * @param {[number, number][]} intervals - [開始時刻, 終了時刻] の配列
 * @returns {number} 最大同時重複数
 */
function solveImos(intervals) {
  if (intervals.length === 0) return 0;

  // 最大時刻を特定してテーブルサイズを決定
  let maxTime = 0;
  for (const [start, end] of intervals) {
    if (end > maxTime) maxTime = end;
  }

  // 階差配列 (いもすテーブル) を初期化
  const table = new Array(maxTime + 2).fill(0);

  // 加算クエリの記録 (始点 +1, 終点 -1)
  for (const [start, end] of intervals) {
    table[start] += 1;
    table[end] -= 1;
  }

  // 累積和をとって各時刻の同時開催数を復元し、最大値を追跡
  let maxConcurrent = 0;
  let current = 0;

  for (let t = 0; t <= maxTime; t++) {
    current += table[t];
    if (current > maxConcurrent) {
      maxConcurrent = current;
    }
  }

  return maxConcurrent;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const n = Number(input[0].trim());
  const intervals = [];

  for (let i = 0; i < n; i++) {
    const line = input[1 + i];
    if (!line) break;
    const [start, end] = line.trim().split(/\s+/).map(Number);
    intervals.push([start, end]);
  }

  const result = solveImos(intervals);
  console.log(result);
}

main();