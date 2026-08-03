import { readFileSync } from 'fs';

/**
 * SCC (強連結成分分解) クラス
 */
class SCC {
  constructor(n) {
    this.n = n;
    this.graph = Array.from({ length: n }, () => []);
    this.revGraph = Array.from({ length: n }, () => []);
  }

  addEdge(u, v) {
    this.graph[u].push(v);
    this.revGraph[v].push(u);
  }

  _dfs1(u, visited, order) {
    visited[u] = true;
    for (const v of this.graph[u]) {
      if (!visited[v]) this._dfs1(v, visited, order);
    }
    order.push(u);
  }

  _dfs2(u, visited, compId, id) {
    visited[u] = true;
    compId[u] = id;
    for (const v of this.revGraph[u]) {
      if (!visited[v]) this._dfs2(v, visited, compId, id);
    }
  }

  decompose() {
    const visited = new Array(this.n).fill(false);
    const order = [];
    for (let i = 0; i < this.n; i++) {
      if (!visited[i]) this._dfs1(i, visited, order);
    }

    visited.fill(false);
    const compId = new Array(this.n).fill(0);
    let group = 0;
    while (order.length > 0) {
      const u = order.pop();
      if (!visited[u]) {
        this._dfs2(u, visited, compId, group);
        group++;
      }
    }
    return compId; // compId[u] は頂点 u が属する強連結成分のグループID
  }
}

/**
 * 2-SAT ソルバー
 */
class TwoSAT {
  constructor(n) {
    this.n = n;
    // 変数 x_i (1-indexed) に対し:
    // 頂点 2*(i-1)   : x_i が True
    // 頂点 2*(i-1)+1 : x_i が False (NOT x_i)
    this.scc = new SCC(2 * n);
  }

  // 命題リテラル (x や -x) を 0-indexed の頂点インデックスに変換
  _nodeIndex(literal) {
    if (literal > 0) {
      return 2 * (literal - 1);
    } else {
      return 2 * (-literal - 1) + 1;
    }
  }

  // 否定リテラルの頂点インデックスを取得
  _notNodeIndex(literal) {
    if (literal > 0) {
      return 2 * (literal - 1) + 1;
    } else {
      return 2 * (-literal - 1);
    }
  }

  /**
   * 条件 (u OR v) を追加する
   */
  addClause(u, v) {
    // (u OR v) <=> (NOT u => v) AND (NOT v => u)
    const uNode = this._nodeIndex(u);
    const notUNode = this._notNodeIndex(u);
    const vNode = this._nodeIndex(v);
    const notVNode = this._notNodeIndex(v);

    this.scc.addEdge(notUNode, vNode);
    this.scc.addEdge(notVNode, uNode);
  }

  /**
   * 充足可能性を判定し、解を割り当てる
   */
  solve() {
    const compId = this.scc.decompose();
    const answer = new Array(this.n);

    for (let i = 0; i < this.n; i++) {
      const trueNode = 2 * i;
      const falseNode = 2 * i + 1;

      // x_i と NOT x_i が同じ強連結成分に含まれる場合、矛盾 (充足不能)
      if (compId[trueNode] === compId[falseNode]) {
        return { possible: false, answer: [] };
      }

      // トポロジカル順序が後になる方 (compId が大きい方) に True を割り当てる
      answer[i] = compId[trueNode] > compId[falseNode] ? 1 : 0;
    }

    return { possible: true, answer };
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const [n, m] = input[0].trim().split(/\s+/).map(Number);
  const solver = new TwoSAT(n);

  for (let i = 0; i < m; i++) {
    const line = input[1 + i];
    if (!line) break;
    const [u, v] = line.trim().split(/\s+/).map(Number);
    solver.addClause(u, v);
  }

  const { possible, answer } = solver.solve();

  if (!possible) {
    console.log('IMPOSSIBLE');
  } else {
    console.log('POSSIBLE');
    console.log(answer.join('\n'));
  }
}

main();