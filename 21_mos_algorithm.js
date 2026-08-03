import { readFileSync } from 'fs';

/**
 * Mo's Algorithm を用いて区間内の相異なる要素の種類数を求める
 * @param {number} n - 配列の長さ
 * @param {number} q - クエリ数
 * @param {number[]} array - 配列
 * @param {number[][]} queries - クエリのリスト [[l, r], ...]
 * @returns {number[]} 各クエリに対する解答の配列
 */
function solveMosAlgorithm(n, q, array, queries) {
  const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));

  // 各クエリに元のインデックスと所属するブロック番号を付与
  const formattedQueries = queries.map((q, index) => ({
    left: q[0],
    right: q[1],
    id: index,
    block: Math.floor(q[0] / blockSize)
  }));

  // Mo's Algorithm のソート条件:
  // 1. ブロック番号昇順
  // 2. 同一ブロック内では right 昇順 (偶数ブロックと奇数ブロックで順序を反転すると定数倍高速化)
  formattedQueries.sort((a, b) => {
    if (a.block !== b.block) {
      return a.block - b.block;
    }
    return (a.block % 2 === 0) ? (a.right - b.right) : (b.right - a.right);
  });

  const freq = new Map(); // 出現頻度マップ
  let uniqueCount = 0;

  // ポインタ追加処理
  function add(val) {
    const count = freq.get(val) || 0;
    if (count === 0) uniqueCount++;
    freq.set(val, count + 1);
  }

  // ポインタ削除処理
  function remove(val) {
    const count = freq.get(val);
    if (count === 1) uniqueCount--;
    freq.set(val, count - 1);
  }

  let curL = 0;
  let curR = 0;
  const ans = new Array(q);

  // ポインタ curL, curR を伸縮させながら全クエリを処理
  for (const q of formattedQueries) {
    const { left, right, id } = q;

    while (curL > left) {
      curL--;
      add(array[curL]);
    }
    while (curR < right) {
      add(array[curR]);
      curR++;
    }
    while (curL < left) {
      remove(array[curL]);
      curL++;
    }
    while (curR > right) {
      curR--;
      remove(array[curR]);
    }

    ans[id] = uniqueCount;
  }

  return ans;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, q] = input[0].trim().split(/\s+/).map(Number);
  const array = input[1].trim().split(/\s+/).map(Number);
  const queries = [];

  for (let i = 0; i < q; i++) {
    const line = input[2 + i];
    if (!line) break;
    queries.push(line.trim().split(/\s+/).map(Number));
  }

  const results = solveMosAlgorithm(n, q, array, queries);
  console.log(results.join('\n'));
}

main();