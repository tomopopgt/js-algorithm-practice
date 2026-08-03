import { readFileSync } from 'fs';

/**
 * Aho-Corasick オートマトンのノード構造
 */
class Node {
  constructor() {
    this.children = {}; // 文字 -> ノード
    this.fail = null;   // 失敗リンク (Failure Link)
    this.output = [];   // マッチするパターンのリスト
  }
}

/**
 * Aho-Corasick 多パターン文字列検索クラス
 */
class AhoCorasick {
  constructor() {
    this.root = new Node();
  }

  /**
   * Trie 木にパターンを追加
   */
  addPattern(pattern) {
    let curr = this.root;
    for (const char of pattern) {
      if (!curr.children[char]) {
        curr.children[char] = new Node();
      }
      curr = curr.children[char];
    }
    curr.output.push(pattern);
  }

  /**
   * BFS (幅優先探索) で失敗リンク (Failure Link) と出力リンクを構築
   */
  build() {
    const queue = [];

    // 根の直下ノードの失敗リンクはすべて根を指す
    for (const char in this.root.children) {
      const child = this.root.children[char];
      child.fail = this.root;
      queue.push(child);
    }

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++];

      for (const char in curr.children) {
        const child = curr.children[char];
        let fallback = curr.fail;

        // 一致する遷移が見つかるまで失敗リンクをたどる
        while (fallback !== null && !fallback.children[char]) {
          fallback = fallback.fail;
        }

        child.fail = fallback ? fallback.children[char] : this.root;
        // 失敗リンク先の出力情報も合成 (部分一致パターンの拾い上げ)
        child.output = child.output.concat(child.fail.output);
        queue.push(child);
      }
    }
  }

  /**
   * テキスト内から全パターンを一次元走査で同時検索 (O(|T|))
   */
  search(text) {
    let curr = this.root;
    const matches = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      while (curr !== null && !curr.children[char]) {
        curr = curr.fail;
      }

      if (curr === null) {
        curr = this.root;
        continue;
      }

      curr = curr.children[char];

      // マッチしたパターンを記録
      for (const pattern of curr.output) {
        const startIndex = i - pattern.length + 1;
        matches.push({ index: startIndex, pattern });
      }
    }

    return matches;
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const text = input[0].trim();
  const k = Number(input[1].trim());
  const ac = new AhoCorasick();

  for (let i = 0; i < k; i++) {
    const pattern = input[2 + i];
    if (pattern) ac.addPattern(pattern.trim());
  }

  ac.build();
  const results = ac.search(text);

  for (const match of results) {
    console.log(`${match.index} ${match.pattern}`);
  }
}

main();