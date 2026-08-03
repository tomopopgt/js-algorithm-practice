import { readFileSync } from 'fs';

/**
 * しゃくとり法 (Two Pointers) を用いて合計が K 以上となる最短連続部分配列の長さを求める
 * @param {number[]} array - 正の整数の配列
 * @param {number} target - 目標値 K
 * @returns {number} 最短の長さ (存在しない場合は 0)
 */
function minSubarrayLen(array, target) {
  const n = array.length;
  let minLen = Infinity;
  let currentSum = 0;
  let left = 0;

  // 右端のポインタ right を 1 つずつ進める
  for (let right = 0; right < n; right++) {
    currentSum += array[right];

    // 合計が target 以上である限り、左端 left を縮めて最小長さを更新する
    while (currentSum >= target) {
      const len = right - left + 1;
      if (len < minLen) {
        minLen = len;
      }
      currentSum -= array[left];
      left++;
    }
  }

  return minLen === Infinity ? 0 : minLen;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, k] = input[0].trim().split(/\s+/).map(Number);
  const array = input[1].trim().split(/\s+/).map(Number);

  const result = minSubarrayLen(array, k);
  console.log(result);
}

main();