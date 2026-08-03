import { readFileSync } from 'fs';

const MOD = 1000000007n;

/**
 * 3x3 行列の乗算 (A * B % MOD)
 */
function multiply(A, B) {
  const C = [
    [0n, 0n, 0n],
    [0n, 0n, 0n],
    [0n, 0n, 0n]
  ];
  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      for (let j = 0; j < 3; j++) {
        C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % MOD;
      }
    }
  }
  return C;
}

/**
 * 繰り返し二乗法による行列の累乗 (A^exp % MOD) (O(K^3 log N))
 */
function power(A, exp) {
  // 3x3 単位行列 I
  let res = [
    [1n, 0n, 0n],
    [0n, 1n, 0n],
    [0n, 0n, 1n]
  ];
  let base = A;

  while (exp > 0n) {
    if (exp & 1n) {
      res = multiply(res, base);
    }
    base = multiply(base, base);
    exp >>= 1n;
  }
  return res;
}

/**
 * トリボナッチ数列の第 N 項 T_N % (10^9 + 7) を求める
 */
function solve(n) {
  if (n === 0n) return 0n;
  if (n === 1n) return 0n;
  if (n === 2n) return 1n;

  // 遷移行列 M
  const M = [
    [1n, 1n, 1n],
    [1n, 0n, 0n],
    [0n, 1n, 0n]
  ];

  // M^(N - 2) を計算
  const M_pow = power(M, n - 2n);

  // [T_N, T_{N-1}, T_{N-2}]^T = M^(N-2) * [T_2, T_1, T_0]^T
  // T_2 = 1, T_1 = 0, T_0 = 0 より、求める T_N は M_pow[0][0] * 1n
  const ans = (M_pow[0][0] * 1n + M_pow[0][1] * 0n + M_pow[0][2] * 0n) % MOD;
  return ans;
}

function main() {
  const input = readFileSync(0, 'utf-8').trim();
  if (!input) return;

  const n = BigInt(input);
  const result = solve(n);
  console.log(result.toString());
}

main();