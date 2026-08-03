import { readFileSync } from 'fs';

/**
 * 優先度付きキュー (Min-Priority Queue)
 */
class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  push(element) {
    this.heap.push(element);
    this._up(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._down(0);
    }
    return top;
  }

  _up(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.heap[p].cost <= this.heap[i].cost) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  _down(i) {
    const len = this.heap.length;
    while (2 * i + 1 < len) {
      let left = 2 * i + 1;
      let right = 2 * i + 2;
      let smallest = i;
      if (this.heap[left].cost < this.heap[smallest].cost) smallest = left;
      if (right < len && this.heap[right].cost < this.heap[smallest].cost) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}

/**
 * 最小費用流 (Primal-Dual 法) クラス
 */
class MinCostFlow {
  constructor(n) {
    this.n = n;
    this.graph = Array.from({ length: n + 1 }, () => []);
    this.h = new Array(n + 1).fill(0); // ポテンシャル
    this.dist = new Array(n + 1).fill(Infinity);
    this.prevv = new Array(n + 1).fill(0);
    this.preve = new Array(n + 1).fill(0);
  }

  addEdge(from, to, cap, cost) {
    const forwardIdx = this.graph[from].length;
    const backwardIdx = this.graph[to].length;

    // 順辺: 目的地, 容量, コスト, 逆辺インデックス
    this.graph[from].push({ to, cap, cost, rev: backwardIdx });
    // 逆辺: 目的地, 初期容量0, マイナスコスト, 順辺インデックス
    this.graph[to].push({ to: from, cap: 0, cost: -cost, rev: forwardIdx });
  }

  /**
   * s から t へ流量 f を流す最小費用を計算 (O(F * E log V))
   */
  solve(s, t, f) {
    let res = 0;
    this.h.fill(0); // 初期ポテンシャル

    while (f > 0) {
      const pq = new PriorityQueue();
      this.dist.fill(Infinity);
      this.dist[s] = 0;
      pq.push({ v: s, cost: 0 });

      // ダイクストラ法で最小コスト経路を探索
      while (pq.heap.length > 0) {
        const { v, cost } = pq.pop();
        if (this.dist[v] < cost) continue;

        for (let i = 0; i < this.graph[v].length; i++) {
          const edge = this.graph[v][i];
          // ポテンシャルを用いて負のコストを非負に補正: cost + h[v] - h[edge.to]
          if (edge.cap > 0) {
            const newCost = this.dist[v] + edge.cost + this.h[v] - this.h[edge.to];
            if (this.dist[edge.to] > newCost) {
              this.dist[edge.to] = newCost;
              this.prevv[edge.to] = v;
              this.preve[edge.to] = i;
              pq.push({ v: edge.to, cost: this.dist[edge.to] });
            }
          }
        }
      }

      // 流量 f を流し切る前に到達不能になった場合
      if (this.dist[t] === Infinity) {
        return -1;
      }

      // ポテンシャルの更新
      for (let v = 1; v <= this.n; v++) {
        this.h[v] += this.dist[v];
      }

      // 最短経路に流せる最大流量 d を特定
      let d = f;
      for (let v = t; v !== s; v = this.prevv[v]) {
        d = Math.min(d, this.graph[this.prevv[v]][this.preve[v]].cap);
      }

      f -= d;
      res += d * this.h[t];

      // 順辺の容量を減らし、逆辺の容量を増やす
      for (let v = t; v !== s; v = this.prevv[v]) {
        const edge = this.graph[this.prevv[v]][this.preve[v]];
        edge.cap -= d;
        this.graph[v][edge.rev].cap += d;
      }
    }

    return res;
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, m, f] = input[0].trim().split(/\s+/).map(Number);
  const mcf = new MinCostFlow(n);

  for (let i = 0; i < m; i++) {
    const line = input[1 + i];
    if (!line) break;
    const [u, v, cap, cost] = line.trim().split(/\s+/).map(Number);
    mcf.addEdge(u, v, cap, cost);
  }

  const result = mcf.solve(1, n, f);
  console.log(result);
}

main();