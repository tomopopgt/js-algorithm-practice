import { readFileSync } from 'fs';

/**
 * 0/1 ナップサック問題を DP (動的計画法) で解く
 * @param {number} n - 品物の数
 * @param {number} w - リュックの容量
 * @param {[number, number][]} items - [重さ, 価値] の配列
 * @returns {number} 最大価値
 */
function solveKnapsack(n, w, items) {
  // dp[j] = 容量 j のときに達成できる最大価値
  // 1次元配列に空間節約して保持
  const dp = new Array(w + 1).fill(0);

  for (let i = 0; i < n; i++) {
    const [weight, value] = items[i];

    // 同じ品物を重複して使用しないため、配列を後ろ (容量 W) から逆順に更新
    for (let j = w; j >= weight; j--) {
      dp[j] = Math.max(dp[j], dp[j - weight] + value);
    }
  }

  return dp[w];
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, w] = input[0].trim().split(/\s+/).map(Number);
  const items = [];

  for (let i = 0; i < n; i++) {
    const line = input[1 + i];
    if (!line) break;
    const [weight, value] = line.trim().split(/\s+/).map(Number);
    items.push([weight, value]);
  }

  const result = solveKnapsack(n, w, items);
  console.log(result);
}

main();