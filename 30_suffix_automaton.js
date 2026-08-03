import { readFileSync } from 'fs';

/**
 * Suffix Automaton (接尾辞オートマトン) の状態ノード
 */
class State {
  constructor(len = 0, link = -1) {
    this.len = len;   // この状態が表す部分文字列の最大長
    this.link = link; // Suffix Link (別の状態へのリンク)
    this.next = {};   // 遷移マップ (文字 -> 次の状態ID)
  }
}

/**
 * Suffix Automaton (SAM) クラス
 * 文字列の全部分文字列構造を O(N) の時空間で保持する極限のデータ構造
 */
class SuffixAutomaton {
  constructor() {
    this.st = [new State(0, -1)]; // st[0] は初期状態 (空文字列)
    this.last = 0;               // 直前に追加された状態のID
  }

  /**
   * 文字 c を 1 文字追加して SAM をオンライン構築 (O(N))
   */
  extend(c) {
    const cur = this.st.length;
    this.st.push(new State(this.st[this.last].len + 1));

    let p = this.last;
    while (p !== -1 && !this.st[p].next[c]) {
      this.st[p].next[c] = cur;
      p = this.st[p].link;
    }

    if (p === -1) {
      this.st[cur].link = 0;
    } else {
      const q = this.st[p].next[c];
      if (this.st[p].len + 1 === this.st[q].len) {
        this.st[cur].link = q;
      } else {
        // 状態の分割 (Clone)
        const clone = this.st.length;
        const cloneState = new State(this.st[p].len + 1, this.st[q].link);
        cloneState.next = { ...this.st[q].next };
        this.st.push(cloneState);

        while (p !== -1 && this.st[p].next[c] === q) {
          this.st[p].next[c] = clone;
          p = this.st[p].link;
        }

        this.st[q].link = clone;
        this.st[cur].link = clone;
      }
    }

    this.last = cur;
  }

  /**
   * 相異なる部分文字列の総数を計算 (O(N))
   * 各状態 u が表す文字列数は (len[u] - len[link[u]])
   */
  countDistinctSubstrings() {
    let total = 0n;
    for (let i = 1; i < this.st.length; i++) {
      const u = this.st[i];
      const linkLen = u.link === -1 ? 0 : this.st[u.link].len;
      total += BigInt(u.len - linkLen);
    }
    return total;
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim();
  if (!input) return;

  const sam = new SuffixAutomaton();
  // 1文字ずつオンライン追加 (全体の計算量 O(N))
  for (let i = 0; i < input.length; i++) {
    sam.extend(input[i]);
  }

  const totalDistinct = sam.countDistinctSubstrings();
  console.log(totalDistinct.toString());
}

main();