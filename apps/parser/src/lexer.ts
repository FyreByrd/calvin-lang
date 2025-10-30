import { createToken, Lexer, type TokenType } from 'chevrotain';

/* Value Tokens */
export const STRING: TokenType = createToken({
  name: 'STRING',
  // "a\"a" or 'b\'b'
  pattern: /("(\\"|[^"])*")|('(\\'|[^'])*')/,
});
export const BOOL: TokenType = createToken({ name: 'BOOL', pattern: /true|false/ });
const base16 = /0x([0-9a-fA-F][0-9a-fA-F_]*[0-9a-fA-F]|[0-9a-fA-F])/;
const base8 = /0o([0-7][0-7_]*[0-7]|[0-7])/;
const base2 = /0b([01][01_]*[01]|[01])/;
export const BIN: TokenType = createToken({
  name: 'BIN',
  pattern: RegExp(`(${base16.source})|(${base8.source})|(${base2.source})`),
});
const digits = /0|[1-9]([\d_]+\d|\d)?/;
export const INT: TokenType = createToken({
  name: 'INT',
  pattern: RegExp(`(\\+|-)?(${digits.source})`),
});
const real = RegExp(`((\\+|-)?((${digits.source})\\.\\d+|inf)|NaN)`);
export const CMPX: TokenType = createToken({
  name: 'CMPX',
  pattern: RegExp(`(${real.source}(\\+|-))?${real.source}(i|j|I|J)`),
});
export const REAL: TokenType = createToken({ name: 'REAL', pattern: real });
export const literals: TokenType[] = [STRING, BOOL, BIN, CMPX, REAL, INT];
export const ID: TokenType = createToken({ name: 'ID', pattern: /[a-zA-Z_][a-zA-Z_\d]*/ });
/* Type Tokens */
export const BASIC_TYPE: TokenType = createToken({
  name: 'BASIC_TYPE',
  pattern: /bool|(i|u|b)(8|16|32|64)|(r|x)(32|64)|string/,
});
/* Binary Operator Tokens */
export const BinOp: TokenType = createToken({ name: 'BinOp', pattern: Lexer.NA });
// Logical
export const EE: TokenType = createToken({ name: 'EE', pattern: '==', categories: BinOp });
export const NE: TokenType = createToken({ name: 'NE', pattern: '!=', categories: BinOp });
export const GE: TokenType = createToken({ name: 'GE', pattern: '>=', categories: BinOp });
export const LE: TokenType = createToken({ name: 'LE', pattern: '<=', categories: BinOp });
export const LT: TokenType = createToken({ name: 'LT', pattern: '<', categories: BinOp });
export const GT: TokenType = createToken({ name: 'GT', pattern: '>', categories: BinOp });
export const AND: TokenType = createToken({
  name: 'AND',
  pattern: 'and',
  longer_alt: ID,
  categories: BinOp,
});
export const OR: TokenType = createToken({
  name: 'OR',
  pattern: 'or',
  longer_alt: ID,
  categories: BinOp,
});
// Arithmetic
export const PLUS: TokenType = createToken({ name: 'PLUS', pattern: '+', categories: BinOp });
export const MINUS: TokenType = createToken({ name: 'MINUS', pattern: '-', categories: BinOp });
export const STAR: TokenType = createToken({ name: 'STAR', pattern: '*', categories: BinOp });
export const SLASH: TokenType = createToken({ name: 'SLASH', pattern: '/', categories: BinOp });
export const MOD: TokenType = createToken({ name: 'MOD', pattern: '%', categories: BinOp });
// Bitwise
export const TILDE: TokenType = createToken({ name: 'TILDE', pattern: '~', categories: BinOp });
export const AMP: TokenType = createToken({ name: 'AMP', pattern: '&', categories: BinOp });
export const PIPE: TokenType = createToken({ name: 'PIPE', pattern: '|', categories: BinOp });
export const CARET: TokenType = createToken({ name: 'CARET', pattern: '^', categories: BinOp });
export const LSHIFT: TokenType = createToken({ name: 'LSHIFT', pattern: '<<', categories: BinOp });
export const RSHIFT: TokenType = createToken({ name: 'RSHIFT', pattern: '>>', categories: BinOp });
export const ASHIFT: TokenType = createToken({ name: 'ASHIFT', pattern: '>>>', categories: BinOp });
// Miscellaneous
export const N_COAL: TokenType = createToken({ name: 'N_COAL', pattern: '??', categories: BinOp });
export const EQU: TokenType = createToken({ name: 'EQU', pattern: '=', categories: BinOp });
export const IN: TokenType = createToken({
  name: 'IN',
  pattern: 'in',
  longer_alt: ID,
  categories: BinOp,
});
export const binopTokens: TokenType[] = [
  BinOp,
  N_COAL,
  EE,
  NE,
  GE,
  LE,
  LT,
  GT,
  PLUS,
  MINUS,
  STAR,
  SLASH,
  MOD,
  TILDE,
  AMP,
  PIPE,
  CARET,
  LSHIFT,
  RSHIFT,
  ASHIFT,
  EQU,
  AND,
  OR,
  IN,
];
/* Compound Assignment Tokens */
export const CmpAsgn: TokenType = createToken({ name: 'CmpAsgn', pattern: Lexer.NA });
export const PL_EQU: TokenType = createToken({
  name: 'PL_EQU',
  pattern: '+=',
  categories: CmpAsgn,
});
export const MIN_EQU: TokenType = createToken({
  name: 'MIN_EQU',
  pattern: '-=',
  categories: CmpAsgn,
});
export const ST_EQU: TokenType = createToken({
  name: 'ST_EQU',
  pattern: '*=',
  categories: CmpAsgn,
});
export const SL_EQU: TokenType = createToken({
  name: 'SL_EQU',
  pattern: '/=',
  categories: CmpAsgn,
});
export const MD_EQU: TokenType = createToken({
  name: 'MD_EQU',
  pattern: '%=',
  categories: CmpAsgn,
});
export const TL_EQU: TokenType = createToken({
  name: 'TL_EQU',
  pattern: '~=',
  categories: CmpAsgn,
});
export const AM_EQU: TokenType = createToken({
  name: 'AM_EQU',
  pattern: '&=',
  categories: CmpAsgn,
});
export const PI_EQU: TokenType = createToken({
  name: 'PI_EQU',
  pattern: '|=',
  categories: CmpAsgn,
});
export const CR_EQU: TokenType = createToken({
  name: 'CR_EQU',
  pattern: '^=',
  categories: CmpAsgn,
});
export const LS_EQU: TokenType = createToken({
  name: 'LS_EQU',
  pattern: '<<=',
  categories: CmpAsgn,
});
export const RS_EQU: TokenType = createToken({
  name: 'RS_EQU',
  pattern: '>>=',
  categories: CmpAsgn,
});
export const AS_EQU: TokenType = createToken({
  name: 'AS_EQU',
  pattern: '>>>=',
  categories: CmpAsgn,
});
export const NC_EQU: TokenType = createToken({
  name: 'NC_EQU',
  pattern: '??=',
  categories: CmpAsgn,
});
const compAssgnTokens: TokenType[] = [
  CmpAsgn,
  PL_EQU,
  MIN_EQU,
  ST_EQU,
  SL_EQU,
  MD_EQU,
  TL_EQU,
  AM_EQU,
  PI_EQU,
  CR_EQU,
  LS_EQU,
  RS_EQU,
  AS_EQU,
  NC_EQU,
];
/* Unary Operator Tokens */
export const PostFix: TokenType = createToken({ name: 'PostFix', pattern: Lexer.NA });
export const UnOp: TokenType = createToken({ name: 'UnOp', pattern: Lexer.NA });
export const NOT: TokenType = createToken({
  name: 'NOT',
  pattern: 'not',
  longer_alt: ID,
  categories: UnOp,
});
export const INC: TokenType = createToken({
  name: 'INC',
  pattern: '++',
  categories: [PostFix, UnOp],
});
export const DEC: TokenType = createToken({
  name: 'DEC',
  pattern: '--',
  categories: [PostFix, UnOp],
});
const unopTokens: TokenType[] = [PostFix, UnOp, NOT, INC, DEC];
/* Other Tokens */
export const LPAREN: TokenType = createToken({ name: 'LPAREN', pattern: '(' });
export const RPAREN: TokenType = createToken({ name: 'RPAREN', pattern: ')' });
export const LCURLY: TokenType = createToken({ name: 'LCURLY', pattern: '{' });
export const RCURLY: TokenType = createToken({ name: 'RCURLY', pattern: '}' });
export const LBRACK: TokenType = createToken({ name: 'LBRACK', pattern: '[' });
export const RBRACK: TokenType = createToken({ name: 'RBRACK', pattern: ']' });
export const SEMI: TokenType = createToken({ name: 'SEMI', pattern: ';' });
export const COLON: TokenType = createToken({ name: 'COLON', pattern: ':' });
/* Keywords */
export const LET: TokenType = createToken({ name: 'LET', pattern: 'let', longer_alt: ID });
// Selection
export const IF: TokenType = createToken({ name: 'IF', pattern: 'if', longer_alt: ID });
export const ELIF: TokenType = createToken({ name: 'ELIF', pattern: 'elif', longer_alt: ID });
export const ELSE: TokenType = createToken({ name: 'ELSE', pattern: 'else', longer_alt: ID });
// Loops
export const DO: TokenType = createToken({ name: 'DO', pattern: 'do', longer_alt: ID });
export const WHILE: TokenType = createToken({ name: 'WHILE', pattern: 'while', longer_alt: ID });
export const FINALLY: TokenType = createToken({
  name: 'FINALLY',
  pattern: 'finally',
  longer_alt: ID,
});
export const BREAK: TokenType = createToken({ name: 'BREAK', pattern: 'break', longer_alt: ID });
export const CONTINUE: TokenType = createToken({
  name: 'CONTINUE',
  pattern: 'continue',
  longer_alt: ID,
});
export const RETURN: TokenType = createToken({ name: 'RETURN', pattern: 'return', longer_alt: ID });
const keywords = [LET, IF, ELIF, ELSE, DO, WHILE, FINALLY, BREAK, CONTINUE, RETURN];
/* Ignored Tokens */
const WS = createToken({
  name: 'WS',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});
const LCOMNT = createToken({
  name: 'LCOMNT',
  pattern: /\/\/[^\n]*/,
  group: Lexer.SKIPPED,
});
const MCOMNT = createToken({
  name: 'MCOMNT',
  pattern: /\/\*([^*]|(\*+[^*/]))*\*+\//,
  group: Lexer.SKIPPED,
});

const ERROR = createToken({ name: 'LEFTOVER', pattern: /./ });

// note we are placing WhiteSpace first as it is very common thus it will speed up the lexer.
export const allTokens: TokenType[] = [
  LCOMNT,
  WS,
  MCOMNT,
  ...literals,
  ...unopTokens,
  ...compAssgnTokens,
  ...binopTokens,
  ...keywords,
  BASIC_TYPE,
  ID,
  LPAREN,
  RPAREN,
  LCURLY,
  RCURLY,
  LBRACK,
  RBRACK,
  SEMI,
  COLON,
  ERROR,
];

export const CalvinLexer: Lexer = new Lexer(allTokens);
