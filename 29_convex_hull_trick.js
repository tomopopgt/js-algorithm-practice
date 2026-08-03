import { readFileSync } from 'fs';

/**
 * 直線 y = m * x + c を表すクラス (BigInt 精度)
 */
class Line {
  constructor(m, c) {
    this.m = m; // 傾き
    this.c = c; // 切片
  }

  eval(x) {
    return this.m * x + this.c;
  }
}

/**
 * Convex Hull Trick (CHT) クラス
 * 傾き m が単調減少、クエリ x が単調増加のケースを O(1) amortized で処理
 */
class ConvexHullTrick {
  constructor() {
    this.deque = []; // 直線の Deque
    this.head = 0;
  }

  // 直線 l1, l2 の交点 x 座標と l2, l3 の交点 x 座標を比較し、l2 が不要か判定
  _isRedundant(l1, l2, l3) {
    // 交点 x(l1, l2) >= x(l2, l3) の場合に l2 は不要
    // (l2.c - l1.c) / (l1.m - l2.m) >= (l3.c - l2.c) / (l2.m - l3.m)
    // 整数範囲で判定するため外積形式に展開 (l1.m > l2.m > l3.m)
    return (l2.c - l1.c) * (l2.m - l3.m) >= (l3.c - l2.c) * (l1.m - l2.m);
  }

  /**
   * 直線 y = m * x + c を追加する (O(1) amortized)
   */
  addLine(m, c) {
    const newLine = new Line(m, c);

    while (this.deque.length - this.head >= 2) {
      const l1 = this.deque[this.deque.length - 2];
      const l2 = this.deque[this.deque.length - 1];
      if (this._isRedundant(l1, l2, newLine)) {
        this.deque.pop(); // 不要になった直線を末尾から除外
      } else {
        break;
      }
    }

    this.deque.push(newLine);
  }

  /**
   * 与えられた x に対する最小の y 値を取得する (O(1) amortized)
   */
  query(x) {
    while (this.deque.length - this.head >= 2) {
      const l1 = this.deque[this.head];
      const l2 = this.deque[this.head + 1];
      if (l1.eval(x) >= l2.eval(x)) {
        this.head++; // より小さな y を与える直線が現れたら先頭を捨てる
      } else {
        break;
      }
    }

    return this.deque[this.head].eval(x);
  }
}

function solve(n, c, h) {
  const dp = new Array(n).fill(0n);
  const cht = new ConvexHullTrick();

  // 足場 0 (1番目の足場): dp[0] = 0
  dp[0] = 0n;
  // 初期直線 L_0: m = -2 * h[0], c = dp[0] + h[0]^2
  cht.addLine(-2n * h[0], dp[0] + h[0] * h[0]);

  for (let i = 1; i < n; i++) {
    const x = h[i];
    // CHT により最小値 min_j (-2*h_j * h_i + dp[j] + h_j^2) を O(1) で取得
    const minY = cht.query(x);

    // dp[i] = h_i^2 + C + minY
    dp[i] = h[i] * h[i] + c + minY;

    // 新たな直線 L_i を追加
    cht.addLine(-2n * h[i], dp[i] + h[i] * h[i]);
  }

  return dp[n - 1];
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, c] = input[0].trim().split(/\s+/).map(BigInt);
  const h = input[1].trim().split(/\s+/).map(BigInt);

  const result = solve(Number(n), c, h);
  console.log(result.toString());
}

main();