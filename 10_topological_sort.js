import { readFileSync } from 'fs';

/**
 * Kahn のアルゴリズムを用いてトポロジカルソートを行う
 * @param {number} n - タスク (頂点) の数
 * @param {number} m - 依存関係 (辺) の数
 * @param {[number, number][]} edges - [u, v] (u -> v の依存関係)
 * @returns {number[]} トポロジカル順序 (閉路がある場合は空配列)
 */
function solveTopologicalSort(n, m, edges) {
  const graph = Array.from({ length: n + 1 }, () => []);
  const inDegree = new Array(n + 1).fill(0);

  // 1. グラフの構築と各頂点の「入次数 (in-degree)」を計算
  for (const [u, v] of edges) {
    graph[u].push(v);
    inDegree[v]++;
  }

  // 2. 入次数が 0 (先行タスクがない) 頂点を初期キューに挿入
  const queue = [];
  let head = 0;
  for (let i = 1; i <= n; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  const result = [];

  // 3. BFS (幅優先探索) 的アプローチでソートを実行
  while (head < queue.length) {
    const u = queue[head++];
    result.push(u);

    // u を実行完了としたため、u から出ている接続先の入次数を 1 減らす
    for (const v of graph[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) {
        queue.push(v); // 依存関係がすべて解消されたらキューに追加
      }
    }
  }

  // 全頂点を処理できていなければ循環依存 (サイクル) が存在
  if (result.length !== n) {
    return [];
  }

  return result;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, m] = input[0].trim().split(/\s+/).map(Number);
  const edges = [];

  for (let i = 0; i < m; i++) {
    const line = input[1 + i];
    if (!line) break;
    const [u, v] = line.trim().split(/\s+/).map(Number);
    edges.push([u, v]);
  }

  const result = solveTopologicalSort(n, m, edges);
  if (result.length === 0) {
    console.log(-1);
  } else {
    console.log(result.join('\n'));
  }
}

main();