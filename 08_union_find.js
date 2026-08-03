import { readFileSync } from 'fs';

/**
 * Union-Find (Disjoint Set Union) クラス
 * 経路圧縮 (Path Compression) と ランク付け (Union by Rank) を実装
 */
class UnionFind {
  constructor(n) {
    // parent[i] は要素 i の親要素。初期状態は自分が根
    this.parent = Array.from({ length: n + 1 }, (_, i) => i);
    // 木の深さ(ランク)を記録
    this.rank = new Array(n + 1).fill(0);
  }

  /**
   * 要素 x が属する木の「根 (代表元)」を検索 (経路圧縮付き)
   */
  find(x) {
    if (this.parent[x] === x) {
      return x;
    }
    // 根を探すついでに、経由した全ノードの親を直接「根」に張り替える (経路圧縮)
    this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  /**
   * 要素 x と要素 y の属するグループを統合
   */
  unite(x, y) {
    let rootX = this.find(x);
    let rootY = this.find(y);

    if (rootX === rootY) return false; // 既に同じグループ

    // ランクが高い方に低い方をぶら下げる (Union by Rank)
    if (this.rank[rootX] < this.rank[rootY]) {
      [rootX, rootY] = [rootY, rootX];
    }

    this.parent[rootY] = rootX;
    if (this.rank[rootX] === this.rank[rootY]) {
      this.rank[rootX]++;
    }

    return true;
  }

  /**
   * 要素 x と要素 y が同じグループに属しているか判定
   */
  same(x, y) {
    return this.find(x) === this.find(y);
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, q] = input[0].trim().split(/\s+/).map(Number);
  const uf = new UnionFind(n);

  const results = [];

  for (let i = 0; i < q; i++) {
    const line = input[1 + i];
    if (!line) break;
    const [type, u, v] = line.trim().split(/\s+/).map(Number);

    if (type === 0) {
      uf.unite(u, v);
    } else if (type === 1) {
      results.push(uf.same(u, v) ? 1 : 0);
    }
  }

  console.log(results.join('\n'));
}

main();