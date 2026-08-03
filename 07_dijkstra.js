import { readFileSync } from 'fs';

/**
 * 最小ヒープ (Priority Queue) クラスの実装
 */
class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this._up(this.heap.length - 1);
  }

  pop() {
    if (this.size() === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.size() > 0) {
      this.heap[0] = bottom;
      this._down(0);
    }
    return top;
  }

  size() {
    return this.heap.length;
  }

  _up(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.heap[p][0] <= this.heap[i][0]) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  _down(i) {
    const len = this.heap.length;
    while (2 * i + 1 < len) {
      let left = 2 * i + 1;
      let right = 2 * i + 2;
      let best = left;
      if (right < len && this.heap[right][0] < this.heap[left][0]) {
        best = right;
      }
      if (this.heap[i][0] <= this.heap[best][0]) break;
      [this.heap[i], this.heap[best]] = [this.heap[best], this.heap[i]];
      i = best;
    }
  }
}

/**
 * ダイクストラ法を用いて最短経路コストを計算する
 */
function solveDijkstra(n, m, edges) {
  // 隣接リストの構築 (1-indexed)
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of edges) {
    graph[u].push({ to: v, cost: w });
  }

  const dist = new Array(n + 1).fill(Infinity);
  dist[1] = 0;

  const pq = new MinHeap();
  pq.push([0, 1]); // [現在の最短コスト, 頂点番号]

  while (pq.size() > 0) {
    const [d, u] = pq.pop();

    // 既に記録されているコストより大きい古い情報はスキップ
    if (d > dist[u]) continue;

    for (const edge of graph[u]) {
      const { to, cost } = edge;
      if (dist[u] + cost < dist[to]) {
        dist[to] = dist[u] + cost;
        pq.push([dist[to], to]);
      }
    }
  }

  const result = [];
  for (let i = 1; i <= n; i++) {
    result.push(dist[i] === Infinity ? -1 : dist[i]);
  }
  return result;
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

  const results = solveDijkstra(n, m, edges);
  console.log(results.join('\n'));
}

main();