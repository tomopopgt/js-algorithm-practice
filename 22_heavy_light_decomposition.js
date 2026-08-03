import { readFileSync } from 'fs';

/**
 * 区間最大値用セグメントツリー
 */
class SegmentTree {
  constructor(n) {
    this.n = n;
    this.size = 1;
    while (this.size < n) this.size *= 2;
    this.tree = new Array(2 * this.size).fill(-Infinity);
  }

  update(index, value) {
    let pos = this.size + index;
    this.tree[pos] = value;
    while (pos > 1) {
      pos = Math.floor(pos / 2);
      this.tree[pos] = Math.max(this.tree[2 * pos], this.tree[2 * pos + 1]);
    }
  }

  query(left, right) {
    let maxVal = -Infinity;
    let l = this.size + left;
    let r = this.size + right;
    while (l < r) {
      if (l % 2 === 1) {
        maxVal = Math.max(maxVal, this.tree[l]);
        l++;
      }
      if (r % 2 === 1) {
        r--;
        maxVal = Math.max(maxVal, this.tree[r]);
      }
      l = Math.floor(l / 2);
      r = Math.floor(r / 2);
    }
    return maxVal;
  }
}

/**
 * Heavy-Light Decomposition (HLD) クラス
 */
class HLD {
  constructor(n, tree, weights, root = 1) {
    this.n = n;
    this.tree = tree;
    this.parent = new Array(n + 1).fill(0);
    this.depth = new Array(n + 1).fill(0);
    this.subSize = new Array(n + 1).fill(0);
    this.heavy = new Array(n + 1).fill(0);
    this.head = new Array(n + 1).fill(0);
    this.in = new Array(n + 1).fill(0);
    this.timer = 0;

    // 1. 部分木サイズ・深さ・Heavy Child (最も大きい子ノード) を計算
    this._dfs1(root, 0, 0);

    // 2. 木を分解して Heavy Path を 1 次元インデックス (in 配列) に割り当て
    this._dfs2(root, root);

    // 3. 割り当てた 1 次元配列上にセグメントツリーを構築
    this.segTree = new SegmentTree(n);
    for (let i = 1; i <= n; i++) {
      this.segTree.update(this.in[i], weights[i]);
    }
  }

  _dfs1(u, p, d) {
    this.parent[u] = p;
    this.depth[u] = d;
    this.subSize[u] = 1;
    let maxSub = 0;

    for (const v of this.tree[u]) {
      if (v !== p) {
        this._dfs1(v, u, d + 1);
        this.subSize[u] += this.subSize[v];
        if (this.subSize[v] > maxSub) {
          maxSub = this.subSize[v];
          this.heavy[u] = v; // 最もサイズの大きい子を記録
        }
      }
    }
  }

  _dfs2(u, h) {
    this.head[u] = h;
    this.in[u] = this.timer++;

    // Heavy Edge (重いパス) を優先して連続したインデックスを割り振る
    if (this.heavy[u] !== 0) {
      this._dfs2(this.heavy[u], h);
    }

    // Light Edge (軽いパス) の探索
    for (const v of this.tree[u]) {
      if (v !== this.parent[u] && v !== this.heavy[u]) {
        this._dfs2(v, v);
      }
    }
  }

  // ノード値の更新
  updateNode(u, val) {
    this.segTree.update(this.in[u], val);
  }

  // パス u - v 上の最大値クエリ (O(log^2 N))
  queryPath(u, v) {
    let maxVal = -Infinity;

    // 異なる Heavy Path に属している間、深さが深い方のパスを上に遡る
    while (this.head[u] !== this.head[v]) {
      if (this.depth[this.head[u]] < this.depth[this.head[v]]) {
        [u, v] = [v, u];
      }
      maxVal = Math.max(maxVal, this.segTree.query(this.in[this.head[u]], this.in[u] + 1));
      u = this.parent[this.head[u]];
    }

    // 同一 Heavy Path 上に来たら最後の区間クエリ
    if (this.depth[u] > this.depth[v]) {
      [u, v] = [v, u];
    }
    maxVal = Math.max(maxVal, this.segTree.query(this.in[u], this.in[v] + 1));

    return maxVal;
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, q] = input[0].trim().split(/\s+/).map(Number);
  const weights = [0, ...input[1].trim().split(/\s+/).map(Number)];

  const tree = Array.from({ length: n + 1 }, () => []);
  for (let i = 0; i < n - 1; i++) {
    const line = input[2 + i];
    if (!line) break;
    const [u, v] = line.trim().split(/\s+/).map(Number);
    tree[u].push(v);
    tree[v].push(u);
  }

  const hld = new HLD(n, tree, weights, 1);
  const results = [];

  for (let i = 0; i < q; i++) {
    const line = input[n + 1 + i];
    if (!line) break;
    const tokens = line.trim().split(/\s+/).map(Number);

    if (tokens[0] === 0) {
      // 0 node val
      const [, node, val] = tokens;
      hld.updateNode(node, val);
    } else if (tokens[0] === 1) {
      // 1 u v
      const [, u, v] = tokens;
      results.push(hld.queryPath(u, v));
    }
  }

  console.log(results.join('\n'));
}

main();