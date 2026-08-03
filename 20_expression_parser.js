import { readFileSync } from 'fs';

/**
 * 再帰降下構文解析 (Recursive Descent Parser) クラス
 * 
 * 文法的定義 (BNF記法):
 *   Expr   = Term ( ('+' | '-') Term )*
 *   Term   = Factor ( ('*' | '/') Factor )*
 *   Factor = NUMBER | '(' Expr ')'
 */
class ExpressionParser {
  /**
   * @param {string} expression - 解析対象の数式文字列
   */
  constructor(expression) {
    this.tokens = this._tokenize(expression);
    this.pos = 0;
  }

  // 字句解析 (Tokenize): 文字列をトークンの配列に分解
  _tokenize(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
      const char = str[i];
      if (/\s/.test(char)) {
        i++;
        continue;
      }
      if (/[0-9]/.test(char)) {
        let numStr = '';
        while (i < str.length && /[0-9.]/.test(str[i])) {
          numStr += str[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: Number(numStr) });
      } else {
        tokens.push({ type: 'OPERATOR', value: char });
        i++;
      }
    }
    return tokens;
  }

  // 1. 式 (Expression) の解析: 足し算・引き算
  parseExpr() {
    let res = this.parseTerm();
    while (this.pos < this.tokens.length) {
      const token = this.tokens[this.pos];
      if (token.type === 'OPERATOR' && (token.value === '+' || token.value === '-')) {
        this.pos++;
        const right = this.parseTerm();
        if (token.value === '+') res += right;
        if (token.value === '-') res -= right;
      } else {
        break;
      }
    }
    return res;
  }

  // 2. 項 (Term) の解析: 掛け算・割り算
  parseTerm() {
    let res = this.parseFactor();
    while (this.pos < this.tokens.length) {
      const token = this.tokens[this.pos];
      if (token.type === 'OPERATOR' && (token.value === '*' || token.value === '/')) {
        this.pos++;
        const right = this.parseFactor();
        if (token.value === '*') res *= right;
        if (token.value === '/') res = Math.floor(res / right); // 整数除算
      } else {
        break;
      }
    }
    return res;
  }

  // 3. 因子 (Factor) の解析: 数値 または カッコ付き式
  parseFactor() {
    const token = this.tokens[this.pos];
    if (!token) throw new Error('Unexpected end of expression');

    if (token.type === 'NUMBER') {
      this.pos++;
      return token.value;
    }

    if (token.type === 'OPERATOR' && token.value === '(') {
      this.pos++; // '(' を消費
      const res = this.parseExpr(); // カッコの中身を再帰的に評価
      if (this.tokens[this.pos] && this.tokens[this.pos].value === ')') {
        this.pos++; // ')' を消費
      }
      return res;
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  /**
   * 解析を実行し計算結果を返す
   */
  evaluate() {
    return this.parseExpr();
  }
}

function main() {
  const input = readFileSync(0, 'utf-8').trim();
  if (!input) return;

  const parser = new ExpressionParser(input);
  const result = parser.evaluate();
  console.log(result);
}

main();