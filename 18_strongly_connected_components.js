import { readFileSync } from 'fs';

/**
 * Kosaraju のアルゴリズムを用いた強連結成分分解 (SCC) クラス
 */
class SCC {
  /**
   * @param {number} n - 頂点数
   */
  constructor(n) {
    this.n = n;
    this.graph = Array.from({ length: n + 1 }, () => []);
    this.revGraph = Array.from({ length: n + 1 }, () => []); // 辺の向きを逆にしたグラフ
  }

  /**
   * 有向辺 (u -> v) の追加
   */
  addEdge(u, v) {
    this.graph[u].push(v);
    this.revGraph[v].push(u); // 逆向きの辺も記録
  }

  // 1回目の DFS: 帰りがけ順 (Post-order) の帰還順序を記録
  _dfs1(u, visited, order) {
    visited[u] = true;
    for (const v of this.graph[u]) {
      if (!visited[v]) {
        this._dfs1(v, visited, order);
      }
    }
    order.push(u); // 帰りがけに記録
  }

  // 2回目の DFS: 逆向きグラフ上で到達可能な頂点を集める
  _dfs2(u, visited, component) {
    visited[u] = true;
    component.push(u);
    for (const v of this.revGraph[u]) {
      if (!visited[v]) {
        this._dfs2(v, visited, component);
      }
    }
  }

  /**
   * 強連結成分分解を実行する (O(V + E))
   * @returns {number[][]} 分解された強連結成分のリスト
   */
  decompose() {
    const visited = new Array(this.n + 1).fill(false);
    const order = [];

    // 1. 全頂点に対して DFS を行い、帰りがけ順を取得
    for (let i = 1; i <= this.n; i++) {
      if (!visited[i]) {
        this._dfs1(i, visited, order);
      }
    }

    // 2. 帰りがけ順の逆順 (順番が遅かった順) に、逆向きグラフで DFS
    visited.fill(false);
    const components = [];

    while (order.length > 0) {
      const u = order.pop();
      if (!visited[u]) {
        const component = [];
        this._dfs2(u, visited, component);
        component.sort((a, b) => a - b); // 見やすさのためにソート
        components.push(component);
      }
    }

    return components;
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, m] = input[0].trim().split(/\s+/).map(Number);
  const scc = new SCC(n);

  for (let i = 0; i < m; i++) {
    const line = input[1 + i];
    if (!line) break;
    const [u, v] = line.trim().split(/\s+/).map(Number);
    scc.addEdge(u, v);
  }

  const components = scc.decompose();

  // トポロジカルソート順（上流から下流）に並べ替えて出力
  console.log(components.length);
  for (const comp of components) {
    console.log(comp.join(' '));
  }
}

main();