import { readFileSync } from 'fs';

/**
 * クラスカル法で使用する Union-Find クラス
 */
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n + 1 }, (_, i) => i);
    this.rank = new Array(n + 1).fill(0);
  }

  find(x) {
    if (this.parent[x] === x) return x;
    this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  unite(x, y) {
    let rootX = this.find(x);
    let rootY = this.find(y);

    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      [rootX, rootY] = [rootY, rootX];
    }

    this.parent[rootY] = rootX;
    if (this.rank[rootX] === this.rank[rootY]) {
      this.rank[rootX]++;
    }

    return true;
  }

  same(x, y) {
    return this.find(x) === this.find(y);
  }
}

/**
 * クラスカル法を用いて最小全域木 (MST) のコスト総和を計算する
 * @param {number} n - 頂点数
 * @param {number} m - 辺の数
 * @param {[number, number, number][]} edges - [u, v, weight] の配列
 * @returns {number} 最小コストの総和
 */
function solveKruskal(n, m, edges) {
  // 1. 辺のコスト(weight)が小さい順にソート (O(M log M))
  edges.sort((a, b) => a[2] - b[2]);

  const uf = new UnionFind(n);
  let totalCost = 0;
  let edgesCount = 0;

  // 2. コストが小さい辺から順に評価 (貪欲法)
  for (const [u, v, weight] of edges) {
    // すでに同じグループに属していなければ採用して結合
    if (uf.unite(u, v)) {
      totalCost += weight;
      edgesCount++;

      // 頂点数 N に対し、選んだ辺が N - 1 本になれば木が完成
      if (edgesCount === n - 1) break;
    }
  }

  return totalCost;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, m] = input[0].trim().split(/\s+/).map(Number);
  const edges = [];

  for (let i = 0; i < m; i++) {
    const line = input[1 + i];
    if (!line) break;
    const [u, v, w] = line.trim().split(/\s+/).map(Number);
    edges.push([u, v, w]);
  }

  const result = solveKruskal(n, m, edges);
  console.log(result);
}

main();