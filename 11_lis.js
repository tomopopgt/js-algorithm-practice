import { readFileSync } from 'fs';

/**
 * 二分探索を用いて O(N log N) で LIS (最長増加部分列) の長さを求める
 * @param {number[]} array - 数列
 * @returns {number} 最長増加部分列の長さ
 */
function solveLIS(array) {
  if (array.length === 0) return 0;

  // dp[i] = 長さ (i + 1) の増加部分列の末尾の最小値
  const dp = [];

  for (const x of array) {
    // dp 配列内で x 以上の最小の要素のインデックスを二分探索 (Lower Bound)
    let left = 0;
    let right = dp.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (dp[mid] >= x) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }

    // x 以上の要素が見つからなければ、新しい長さとして末尾に追加
    if (left === dp.length) {
      dp.push(x);
    } else {
      // 見つかった場合は、より小さな値 x で更新 (以降の拡張可能性を高める)
      dp[left] = x;
    }
  }

  return dp.length;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const n = Number(input[0].trim());
  const array = input[1].trim().split(/\s+/).map(Number);

  const result = solveLIS(array);
  console.log(result);
}

main();