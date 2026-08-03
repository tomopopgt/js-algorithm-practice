import { readFileSync } from 'fs';

/**
 * 積載量が P のとき、K 台以内のトラックで順番通りに積み込めるか判定する (O(N))
 * @param {number[]} weights - 荷物の重量配列
 * @param {number} k - トラックの最大台数
 * @param {number} p - 試行する積載量
 * @returns {boolean}
 */
function canLoad(weights, k, p) {
  let trucksNeeded = 1;
  let currentLoad = 0;

  for (const w of weights) {
    // 1個の荷物が P を超えている場合は積載不可能
    if (w > p) return false;

    if (currentLoad + w > p) {
      trucksNeeded++;
      currentLoad = w;
    } else {
      currentLoad += w;
    }
  }

  return trucksNeeded <= k;
}

/**
 * 答えの二分探索を用いて最小の積載量 P を求める
 * @param {number[]} weights - 荷物の重量配列
 * @param {number} k - トラックの最大台数
 * @returns {number}
 */
function solveBinarySearch(weights, k) {
  // 二分探索の範囲設定
  // left: 荷物の最大重量 (最低でもこれ以上の積載量が必要)
  // right: すべての荷物の合計重量 (1台で全積載する場合)
  let left = Math.max(...weights);
  let right = weights.reduce((acc, cur) => acc + cur, 0);
  let ans = right;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (canLoad(weights, k, mid)) {
      ans = mid; // 条件を満たすので、さらに小さい値を求めて左側を探索
      right = mid - 1;
    } else {
      left = mid + 1; // 条件を満たさないので、右側 (より大きい値) を探索
    }
  }

  return ans;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, k] = input[0].trim().split(/\s+/).map(Number);
  const weights = input[1].trim().split(/\s+/).map(Number);

  const result = solveBinarySearch(weights, k);
  console.log(result);
}

main();