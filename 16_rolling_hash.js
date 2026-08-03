import { readFileSync } from 'fs';

/**
 * ローリングハッシュ (Rolling Hash) クラス
 * BigInt を使用して 64bit 精度のオーバーフローなし安全計算を実現
 */
class RollingHash {
  /**
   * @param {string} str - 対象文字列
   * @param {bigint} base - 基数 (デフォルト 10007n)
   * @param {bigint} mod - 法 (デフォルト 1000000007n)
   */
  constructor(str, base = 10007n, mod = 1000000007n) {
    this.str = str;
    this.base = base;
    this.mod = mod;
    const n = str.length;

    // hash[i + 1] = 先頭 i 文字のハッシュ値
    this.hash = new Array(n + 1).fill(0n);
    // power[i] = base^i % mod
    this.power = new Array(n + 1).fill(1n);

    // 累積ハッシュ値と基数の累乗テーブルを前処理 (O(N))
    for (let i = 0; i < n; i++) {
      this.power[i + 1] = (this.power[i] * this.base) % this.mod;
      this.hash[i + 1] = (this.hash[i] * this.base + BigInt(str.charCodeAt(i))) % this.mod;
    }
  }

  /**
   * 半開区間 [left, right) の文字列のハッシュ値を O(1) で計算
   * @param {number} left - 開始インデックス
   * @param {number} right - 終了インデックス (含まず)
   * @returns {bigint} 区間ハッシュ値
   */
  get(left, right) {
    let res = (this.hash[right] - (this.hash[left] * this.power[right - left]) % this.mod) % this.mod;
    if (res < 0n) res += this.mod; // 負数の補正
    return res;
  }
}

/**
 * ローリングハッシュを用いてパターン P の出現位置を求める
 */
function solveRollingHash(text, pattern) {
  const n = text.length;
  const m = pattern.length;
  if (n < m) return [];

  const textHash = new RollingHash(text);
  const patternHash = new RollingHash(pattern);
  const targetHash = patternHash.get(0, m);

  const matches = [];

  // テキスト内を長さ M のウィンドウでスライドさせながら O(1) 判定
  for (let i = 0; i <= n - m; i++) {
    if (textHash.get(i, i + m) === targetHash) {
      matches.push(i);
    }
  }

  return matches;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const text = input[0].trim();
  const pattern = input[1] ? input[1].trim() : '';

  if (!pattern) return;

  const results = solveRollingHash(text, pattern);
  if (results.length > 0) {
    console.log(results.join('\n'));
  }
}

main();