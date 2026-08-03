import { readFileSync } from 'fs';

/**
 * Bitmask DP (ビット動的計画法) を用いて巡回セールスマン問題 (TSP) を解く
 * @param {number} n - 都市の数
 * @param {number[][]} dist - 隣接行列 (dist[u][v] = u から v への移動コスト)
 * @returns {number} 最小巡回コスト
 */
function solveTSP(n, dist) {
  const ALL_VISITED = (1 << n) - 1; // すべての都市を訪問した状態 (二進数で 11...1)

  // dp[mask][u] = 訪問済み都市の集合が mask で、現在都市 u にいるときの最小コスト
  const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(Infinity));

  // スタート地点: 都市 0 から出発すると固定 (mask = 1 << 0 = 1, 現在地 0)
  dp[1][0] = 0;

  // 全訪問状態集合 (mask) を小さな集合から順に更新
  for (let mask = 1; mask < (1 << n); mask++) {
    for (let u = 0; u < n; u++) {
      if (dp[mask][u] === Infinity) continue;
      // 現在地 u が現在の mask に含まれていない場合は無視
      if (!(mask & (1 << u))) continue;

      // 次に訪れる都市 v を探索
      for (let v = 0; v < n; v++) {
        // すでに訪問済みの都市 v はスキップ
        if (mask & (1 << v)) continue;

        const nextMask = mask | (1 << v); // ビット OR で都市 v を訪問済みに更新
        const nextCost = dp[mask][u] + dist[u][v];

        if (nextCost < dp[nextMask][v]) {
          dp[nextMask][v] = nextCost;
        }
      }
    }
  }

  // すべての都市を訪問済み (ALL_VISITED) から、スタート地点 (都市 0) に戻る最小コストを特定
  let minTotalCost = Infinity;
  for (let u = 0; u < n; u++) {
    if (dp[ALL_VISITED][u] !== Infinity) {
      minTotalCost = Math.min(minTotalCost, dp[ALL_VISITED][u] + dist[u][0]);
    }
  }

  return minTotalCost;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const n = Number(input[0].trim());
  const dist = [];

  for (let i = 0; i < n; i++) {
    const line = input[1 + i];
    if (!line) break;
    dist.push(line.trim().split(/\s+/).map(Number));
  }

  const result = solveTSP(n, dist);
  console.log(result);
}

main();