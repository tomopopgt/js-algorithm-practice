import { readFileSync } from 'fs';

/**
 * Edmonds-Karp アルゴリズムを用いた最大流クラス
 */
class MaxFlow {
  /**
   * @param {number} n - 頂点数
   */
  constructor(n) {
    this.n = n;
    // graph[u] = u から出る残余辺のリスト
    this.graph = Array.from({ length: n + 1 }, () => []);
  }

  /**
   * 有向辺 (u -> v, 容量 cap) を追加 (同時に容量 0 の逆辺も追加)
   */
  addEdge(u, v, cap) {
    const forwardIdx = this.graph[u].length;
    const backwardIdx = this.graph[v].length;

    // 順辺: 目的地 v, 初期容量 cap, 逆辺のインデックス
    this.graph[u].push({ to: v, cap: cap, rev: backwardIdx });
    // 逆辺: 目的地 u, 初期容量 0, 順辺のインデックス
    this.graph[v].push({ to: u, cap: 0, rev: forwardIdx });
  }

  /**
   * BFS で s から t への増加可能経路を探索する
   */
  _bfs(s, t, parentEdge) {
    const visited = new Array(this.n + 1).fill(false);
    const queue = [s];
    let head = 0;
    visited[s] = true;

    while (head < queue.length) {
      const u = queue[head++];
      if (u === t) break;

      for (let i = 0; i < this.graph[u].length; i++) {
        const edge = this.graph[u][i];
        if (!visited[edge.to] && edge.cap > 0) {
          visited[edge.to] = true;
          parentEdge[edge.to] = { from: u, edgeIdx: i };
          queue.push(edge.to);
        }
      }
    }

    return visited[t];
  }

  /**
   * ソース s からシンク t への最大流量を求める (O(V * E^2))
   */
  solve(s, t) {
    let maxFlow = 0;
    const parentEdge = new Array(this.n + 1).fill(null);

    // 増加可能経路が存在する限りループ
    while (this._bfs(s, t, parentEdge)) {
      // 1. パス上の最小残余容量 (ボトルネック) を特定
      let pathFlow = Infinity;
      for (let v = t; v !== s; v = parentEdge[v].from) {
        const { from, edgeIdx } = parentEdge[v];
        pathFlow = Math.min(pathFlow, this.graph[from][edgeIdx].cap);
      }

      // 2. パス上の容量を更新 (順辺は減らし、逆辺は増やす)
      for (let v = t; v !== s; v = parentEdge[v].from) {
        const { from, edgeIdx } = parentEdge[v];
        const edge = this.graph[from][edgeIdx];
        edge.cap -= pathFlow;
        this.graph[v][edge.rev].cap += pathFlow; // 押し戻し(逆流)可能性の確保
      }

      maxFlow += pathFlow;
    }

    return maxFlow;
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, m] = input[0].trim().split(/\s+/).map(Number);
  const flowNetwork = new MaxFlow(n);

  for (let i = 0; i < m; i++) {
    const line = input[1 + i];
    if (!line) break;
    const [u, v, cap] = line.trim().split(/\s+/).map(Number);
    flowNetwork.addEdge(u, v, cap);
  }

  // 頂点 1 (ソース) から 頂点 N (シンク) への最大流を計算
  const result = flowNetwork.solve(1, n);
  console.log(result);
}

main();