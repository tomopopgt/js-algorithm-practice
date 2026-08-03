import { readFileSync } from 'fs';

/**
 * 複素数 (Complex Number) クラスの実装
 */
class Complex {
  constructor(re = 0, im = 0) {
    this.re = re;
    this.im = im;
  }

  add(other) {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other) {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other) {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }
}

/**
 * Cooley-Tukey アルゴリズムによる非再帰・インプレース高速フーリエ変換 (FFT)
 * @param {Complex[]} a - 複素数配列
 * @param {boolean} invert - 逆変換 (IFFT) の場合 true
 */
function fft(a, invert) {
  const n = a.length;

  // 1. Bit-reversal permutation (ビット反転置換)
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  // 2. バタフライ演算 (Cooley-Tukey FFT)
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (2 * Math.PI / len) * (invert ? -1 : 1);
    const wlen = new Complex(Math.cos(ang), Math.sin(ang));

    for (let i = 0; i < n; i += len) {
      let w = new Complex(1, 0);
      for (let j = 0; j < len / 2; j++) {
        const u = a[i + j];
        const v = a[i + j + len / 2].mul(w);

        a[i + j] = u.add(v);
        a[i + j + len / 2] = u.sub(v);

        w = w.mul(wlen);
      }
    }
  }

  // 3. 逆変換 (IFFT) 時の N での除算
  if (invert) {
    for (let i = 0; i < n; i++) {
      a[i].re /= n;
      a[i].im /= n;
    }
  }
}

/**
 * FFT を用いて O(N log N) で畳み込み (多項式乗算) を計算する
 */
function multiply(a, b) {
  let n = 1;
  while (n < a.length + b.length) {
    n <<= 1; // 2 の冪乗サイズに拡張
  }

  const fa = Array.from({ length: n }, (_, i) => new Complex(a[i] || 0, 0));
  const fb = Array.from({ length: n }, (_, i) => new Complex(b[i] || 0, 0));

  // 時間領域 -> 周波数領域へ変換 (FFT)
  fft(fa, false);
  fft(fb, false);

  // 周波数領域での要素ごとの掛け算 (点値積: O(N))
  for (let i = 0; i < n; i++) {
    fa[i] = fa[i].mul(fb[i]);
  }

  // 周波数領域 -> 時間領域へ逆変換 (IFFT)
  fft(fa, true);

  const resultLength = a.length + b.length - 1;
  const res = new Array(resultLength);
  for (let i = 0; i < resultLength; i++) {
    res[i] = Math.round(fa[i].re);
  }

  return res;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim().split('\n');
  if (input.length === 0 || input[0] === '') return;

  const n = Number(input[0].trim());
  const a = input[1].trim().split(/\s+/).map(Number);
  const b = input[2].trim().split(/\s+/).map(Number);

  const result = multiply(a, b);
  console.log(result.join('\n'));
}

main();