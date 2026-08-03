import { readFileSync } from 'fs';

/**
 * 2次元ベクトル / 点を表す構造体
 */
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/**
 * ベクトルの外積 (Cross Product) を計算: (p2 - p1) x (p3 - p1)
 * 返り値 > 0: 反時計回り (左折)
 * 返り値 < 0: 時計回り (右折)
 * 返り値 = 0: 一直線上に並んでいる
 */
function crossProduct(p1, p2, p3) {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

/**
 * Andrew's Monotone Chain アルゴリズムを用いて凸包を求める (O(N log N))
 * @param {Point[]} points - 点の配列
 * @returns {Point[]} 反時計回りに並んだ凸包の頂点リスト
 */
function solveConvexHull(points) {
  const n = points.length;
  if (n <= 2) return points;

  // 1. X 座標の昇順 (X が等しければ Y 座標の昇順) でソート (O(N log N))
  points.sort((a, b) => (a.x !== b.x ? a.x - b.x : a.y - b.y));

  const hull = [];

  // 2. 下側輪郭 (Lower Hull) の構築
  for (let i = 0; i < n; i++) {
    while (
      hull.length >= 2 &&
      crossProduct(hull[hull.length - 2], hull[hull.length - 1], points[i]) <= 0
    ) {
      hull.pop(); // 右折または一直線になる場合は直前の点を除外
    }
    hull.push(points[i]);
  }

  // 3. 上側輪郭 (Upper Hull) の構築
  const lowerHullSize = hull.length;
  for (let i = n - 2; i >= 0; i--) {
    while (
      hull.length > lowerHullSize &&
      crossProduct(hull[hull.length - 2], hull[hull.length - 1], points[i]) <= 0
    ) {
      hull.pop();
    }
    hull.push(points[i]);
  }

  // 最後の点は始点と重複するため削除
  hull.pop();

  return hull;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const n = Number(input[0].trim());
  const points = [];

  for (let i = 0; i < n; i++) {
    const line = input[1 + i];
    if (!line) break;
    const [x, y] = line.trim().split(/\s+/).map(Number);
    points.push(new Point(x, y));
  }

  const hull = solveConvexHull(points);

  for (const pt of hull) {
    console.log(`${pt.x} ${pt.y}`);
  }
}

main();