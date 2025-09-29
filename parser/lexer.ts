import { Lexer, createToken } from 'chevrotain';

export const STRING = createToken({
  name: 'STRING',
  // "a\"a" or 'b\'b'
  pattern: /("(\\"|[^"])*")|('(\\'|[^'])*')/
});
export const BOOL = createToken({ name: 'BOOL', pattern: /true|false/ });
const digits = /0|[1-9]([\d_]+\d|\d)?/;
const base10 = RegExp(`(\\+|-)?(${digits.source})`);
const base16 = /0x([0-9a-fA-F][0-9a-fA-F_]*[0-9a-fA-F]|[0-9a-fA-F])/;
const base8 = /0o([0-7][0-7_]*[0-7]|[0-7])/;
const base2 = /0b([01][01_]*[01]|[01])/;
export const INT = createToken({
  name: 'INT',
  pattern: RegExp(`(${base10.source})|(${base16.source})|(${base8.source})|(${base2.source})`)
});
const real = RegExp(`((\\+|-)?((${digits.source})\\.\\d+|inf)|NaN)`);
export const CMPX = createToken({
  name: 'CMPX',
  pattern: RegExp(`(${real.source}(\\+|-))?${real.source}(i|j|I|J)`)
});
export const REAL = createToken({ name: 'REAL', pattern: real });
export const ID = createToken({ name: 'ID', pattern: /[a-zA-Z_][a-zA-Z_\d]*/ });
export const EQU = createToken({ name: 'EQU', pattern: '=' });
export const SEMI = createToken({ name: 'SEMI', pattern: ';' });
const WS = createToken({
  name: 'WS',
  pattern: /\s+/,
  group: Lexer.SKIPPED
});

// note we are placing WhiteSpace first as it is very common thus it will speed up the lexer.
export const allTokens = [WS, STRING, BOOL, CMPX, REAL, INT, ID, EQU, SEMI];

export const CalvinLexer = new Lexer(allTokens);
