import { readFileSync } from 'fs';

/**
 * ダブリング (Binary Lifting) を用いた LCA クラス
 */
class LCA {
  /**
   * @param {number} n - 頂点数
   * @param {number[][]} tree - 隣接リスト表現の木
   * @param {number} root - 根の頂点番号 (デフォルト 1)
   */
  constructor(n, tree, root = 1) {
    this.n = n;
    this.tree = tree;
    this.logN = Math.floor(Math.log2(n)) + 1;

    // parent[k][v] = 頂点 v の 2^k 個上の親
    this.parent = Array.from({ length: this.logN }, () => new Array(n + 1).fill(0));
    this.depth = new Array(n + 1).fill(0);

    this._bfs(root);
    this._initDoubling();
  }

  // BFS で各頂点の「深さ(depth)」と「1つ上の親(2^0個上)」を記録
  _bfs(root) {
    const queue = [root];
    let head = 0;
    this.depth[root] = 0;

    const visited = new Array(this.n + 1).fill(false);
    visited[root] = true;

    while (head < queue.length) {
      const u = queue[head++];
      for (const v of this.tree[u]) {
        if (!visited[v]) {
          visited[v] = true;
          this.depth[v] = this.depth[u] + 1;
          this.parent[0][v] = u; // 1つ上の親をセット
          queue.push(v);
        }
      }
    }
  }

  // ダブリングテーブルの構築: parent[k+1][v] = parent[k][parent[k][v]]
  _initDoubling() {
    for (let k = 0; k < this.logN - 1; k++) {
      for (let v = 1; v <= this.n; v++) {
        if (this.parent[k][v] === 0) {
          this.parent[k + 1][v] = 0;
        } else {
          this.parent[k + 1][v] = this.parent[k][this.parent[k][v]];
        }
      }
    }
  }

  /**
   * 2つの頂点 u, v の最小共通祖先 (LCA) を求める (O(log N))
   */
  getLCA(u, v) {
    // 深い方を u に固定
    if (this.depth[u] < this.depth[v]) {
      [u, v] = [v, u];
    }

    // 1. 深さを揃える (2の冪乗ステップで一気にジャンプ)
    for (let k = this.logN - 1; k >= 0; k--) {
      if ((this.depth[u] - this.depth[v]) >= (1 << k)) {
        u = this.parent[k][u];
      }
    }

    if (u === v) return u;

    // 2. LCA の直前まで同時に遡る
    for (let k = this.logN - 1; k >= 0; k--) {
      if (this.parent[k][u] !== this.parent[k][v]) {
        u = this.parent[k][u];
        v = this.parent[k][v];
      }
    }

    return this.parent[0][u];
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, q] = input[0].trim().split(/\s+/).map(Number);
  const tree = Array.from({ length: n + 1 }, () => []);

  // 辺情報のロード (N - 1 本)
  for (let i = 0; i < n - 1; i++) {
    const line = input[1 + i];
    if (!line) break;
    const [u, v] = line.trim().split(/\s+/).map(Number);
    tree[u].push(v);
    tree[v].push(u);
  }

  const lca = new LCA(n, tree, 1);
  const results = [];

  // クエリのロード (Q 個)
  for (let i = 0; i < q; i++) {
    const line = input[n + i];
    if (!line) break;
    const [u, v] = line.trim().split(/\s+/).map(Number);
    results.push(lca.getLCA(u, v));
  }

  console.log(results.join('\n'));
}

main();