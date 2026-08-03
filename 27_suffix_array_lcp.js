import { readFileSync } from 'fs';

/**
 * Manber-Myers 法 (ダブリング) による Suffix Array の構築 (O(N log^2 N))
 * @param {string} s - 対象文字列
 * @returns {number[]} Suffix Array (各 Suffix の開始インデックス)
 */
function constructSuffixArray(s) {
  const n = s.length;
  const sa = new Array(n);
  let rank = new Array(n);
  let tmp = new Array(n);

  for (let i = 0; i < n; i++) {
    sa[i] = i;
    rank[i] = s.charCodeAt(i);
  }

  // 長さ k のソート結果を利用して長さ 2k のソートを行う (ダブリング)
  for (let k = 1; k < n; k <<= 1) {
    const compare = (i, j) => {
      if (rank[i] !== rank[j]) return rank[i] - rank[j];
      const ri = i + k < n ? rank[i + k] : -1;
      const rj = j + k < n ? rank[j + k] : -1;
      return ri - rj;
    };

    sa.sort(compare);

    tmp[sa[0]] = 0;
    for (let i = 1; i < n; i++) {
      tmp[sa[i]] = tmp[sa[i - 1]] + (compare(sa[i - 1], sa[i]) < 0 ? 1 : 0);
    }
    for (let i = 0; i < n; i++) {
      rank[i] = tmp[i];
    }
  }

  return sa;
}

/**
 * Kasai のアルゴリズムによる LCP Array (最長共通接頭辞配列) の構築 (O(N))
 * @param {string} s - 対象文字列
 * @param {number[]} sa - 構築済み Suffix Array
 * @returns {number[]} LCP Array (サイズ N - 1)
 */
function constructLCPArray(s, sa) {
  const n = s.length;
  const rank = new Array(n);
  for (let i = 0; i < n; i++) {
    rank[sa[i]] = i;
  }

  const lcp = new Array(n - 1).fill(0);
  let h = 0; // 共通接頭辞の長さ

  for (let i = 0; i < n; i++) {
    if (rank[i] > 0) {
      const j = sa[rank[i] - 1]; // SA 上で直前に位置する Suffix の開始位置
      while (i + h < n && j + h < n && s[i + h] === s[j + h]) {
        h++;
      }
      lcp[rank[i] - 1] = h;
      if (h > 0) h--; // 1文字進んでも LCP の長さは高々 1 しか減らない性質を利用
    }
  }

  return lcp;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const s = input[0].trim();
  const sa = constructSuffixArray(s);
  const lcp = constructLCPArray(s, sa);

  console.log(sa.join(' '));
  console.log(lcp.join(' '));
}

main();