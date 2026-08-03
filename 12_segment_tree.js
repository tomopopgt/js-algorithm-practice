import { readFileSync } from 'fs';

/**
 * 区間最小値クエリ (Range Minimum Query: RMQ) を処理する Segment Tree
 */
class SegmentTree {
  /**
   * @param {number[]} data - 初期データの配列
   */
  constructor(data) {
    this.n = data.length;
    // 木のサイズを 2 のべき乗サイズに拡張 (最下段の葉の数を確保)
    this.size = 1;
    while (this.size < this.n) {
      this.size *= 2;
    }

    // ノード数を 2 * size で確保し、初期値を Infinity で埋める
    this.tree = new Array(2 * this.size).fill(Infinity);

    // 葉ノードに初期データをセット
    for (let i = 0; i < this.n; i++) {
      this.tree[this.size + i] = data[i];
    }

    // 葉から親方向へボトムアップに最小値を構築
    for (let i = this.size - 1; i > 0; i--) {
      this.tree[i] = Math.min(this.tree[2 * i], this.tree[2 * i + 1]);
    }
  }

  /**
   * index 番目の要素を value に更新する (O(log N))
   * @param {number} index - 更新対象のインデックス (0-indexed)
   * @param {number} value - 新しい値
   */
  update(index, value) {
    let pos = this.size + index;
    this.tree[pos] = value;

    // 親ノードへ遡りながら値を再計算
    while (pos > 1) {
      pos = Math.floor(pos / 2);
      this.tree[pos] = Math.min(this.tree[2 * pos], this.tree[2 * pos + 1]);
    }
  }

  /**
   * 半開区間 [left, right) の最小値を求める (O(log N))
   * @param {number} left - 区間の左端 (0-indexed)
   * @param {number} right - 区間の右端 (半開区間のため含まない)
   * @returns {number} 区間内の最小値
   */
  query(left, right) {
    let minVal = Infinity;
    let l = this.size + left;
    let r = this.size + right;

    while (l < r) {
      // 左端が右子ノードなら、そのノードの値を採用して右へずらす
      if (l % 2 === 1) {
        minVal = Math.min(minVal, this.tree[l]);
        l++;
      }
      // 右端が右子ノードなら、左子ノードの値を採用する
      if (r % 2 === 1) {
        r--;
        minVal = Math.min(minVal, this.tree[r]);
      }
      // 親ノードへ移動
      l = Math.floor(l / 2);
      r = Math.floor(r / 2);
    }

    return minVal;
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, q] = input[0].trim().split(/\s+/).map(Number);
  const data = input[1].trim().split(/\s+/).map(Number);

  const segTree = new SegmentTree(data);
  const results = [];

  for (let i = 0; i < q; i++) {
    const line = input[2 + i];
    if (!line) break;
    const [type, arg1, arg2] = line.trim().split(/\s+/).map(Number);

    if (type === 0) {
      // update クエリ: arg1 = pos, arg2 = val
      segTree.update(arg1, arg2);
    } else if (type === 1) {
      // query クエリ: arg1 = left, arg2 = right
      results.push(segTree.query(arg1, arg2));
    }
  }

  console.log(results.join('\n'));
}

main();