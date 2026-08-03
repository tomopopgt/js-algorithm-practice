import { readFileSync } from 'fs';

/**
 * 区間加算 (Range Add) & 区間最小値 (Range Minimum Query) に対応した遅延評価セグメントツリー
 */
class LazySegmentTree {
  /**
   * @param {number[]} data - 初期データ配列
   */
  constructor(data) {
    this.n = data.length;
    this.size = 1;
    while (this.size < this.n) {
      this.size *= 2;
    }

    // tree[k]: ノード k の最小値
    this.tree = new Array(2 * this.size).fill(Infinity);
    // lazy[k]: ノード k に保留されている遅延加算値
    this.lazy = new Array(2 * this.size).fill(0);

    // 最下段 (葉ノード) にデータをセット
    for (let i = 0; i < this.n; i++) {
      this.tree[this.size + i] = data[i];
    }
    // ボトムアップに木を構築
    for (let i = this.size - 1; i > 0; i--) {
      this.tree[i] = Math.min(this.tree[2 * i], this.tree[2 * i + 1]);
    }
  }

  /**
   * ノード k に留まっている遅延更新情報を評価・伝播する (評価関数)
   */
  _eval(k) {
    if (this.lazy[k] !== 0) {
      this.tree[k] += this.lazy[k]; // 自身のノード値を更新
      if (k < this.size) {
        // 子ノードへ遅延値を引き継ぐ
        this.lazy[2 * k] += this.lazy[k];
        this.lazy[2 * k + 1] += this.lazy[k];
      }
      this.lazy[k] = 0; // 評価完了のためリセット
    }
  }

  /**
   * 半開区間 [a, b) に x を加算する (O(log N))
   */
  add(a, b, x, k = 1, l = 0, r = this.size) {
    this._eval(k);
    if (r <= a || b <= l) return; // 完全に区間外

    if (a <= l && r <= b) {
      // 完全に区間に包摂される場合、遅延値に書き込んで評価
      this.lazy[k] += x;
      this._eval(k);
      return;
    }

    const mid = Math.floor((l + r) / 2);
    this.add(a, b, x, 2 * k, l, mid);
    this.add(a, b, x, 2 * k + 1, mid, r);
    this.tree[k] = Math.min(this.tree[2 * k], this.tree[2 * k + 1]);
  }

  /**
   * 半開区間 [a, b) の最小値を求める (O(log N))
   */
  query(a, b, k = 1, l = 0, r = this.size) {
    this._eval(k);
    if (r <= a || b <= l) return Infinity; // 完全に区間外

    if (a <= l && r <= b) {
      return this.tree[k];
    }

    const mid = Math.floor((l + r) / 2);
    const vl = this.query(a, b, 2 * k, l, mid);
    const vr = this.query(a, b, 2 * k + 1, mid, r);
    return Math.min(vl, vr);
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, q] = input[0].trim().split(/\s+/).map(Number);
  const data = input[1].trim().split(/\s+/).map(Number);

  const lazySegTree = new LazySegmentTree(data);
  const results = [];

  for (let i = 0; i < q; i++) {
    const line = input[2 + i];
    if (!line) break;
    const tokens = line.trim().split(/\s+/).map(Number);

    if (tokens[0] === 0) {
      // 区間加算クエリ: 0 left right val
      const [, left, right, val] = tokens;
      lazySegTree.add(left, right, val);
    } else if (tokens[0] === 1) {
      // 区間最小値クエリ: 1 left right
      const [, left, right] = tokens;
      results.push(lazySegTree.query(left, right));
    }
  }

  console.log(results.join('\n'));
}

main();