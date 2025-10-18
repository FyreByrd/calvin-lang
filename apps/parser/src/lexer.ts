import { createToken, Lexer } from 'chevrotain';

/* Value Tokens */
export const STRING = createToken({
  name: 'STRING',
  // "a\"a" or 'b\'b'
  pattern: /("(\\"|[^"])*")|('(\\'|[^'])*')/,
});
export const BOOL = createToken({ name: 'BOOL', pattern: /true|false/ });
const base16 = /0x([0-9a-fA-F][0-9a-fA-F_]*[0-9a-fA-F]|[0-9a-fA-F])/;
const base8 = /0o([0-7][0-7_]*[0-7]|[0-7])/;
const base2 = /0b([01][01_]*[01]|[01])/;
export const BIN = createToken({
  name: 'BIN',
  pattern: RegExp(`(${base16.source})|(${base8.source})|(${base2.source})`),
});
const digits = /0|[1-9]([\d_]+\d|\d)?/;
export const INT = createToken({
  name: 'INT',
  pattern: RegExp(`(\\+|-)?(${digits.source})`),
});
const real = RegExp(`((\\+|-)?((${digits.source})\\.\\d+|inf)|NaN)`);
export const CMPX = createToken({
  name: 'CMPX',
  pattern: RegExp(`(${real.source}(\\+|-))?${real.source}(i|j|I|J)`),
});
export const REAL = createToken({ name: 'REAL', pattern: real });
export const literals = [STRING, BOOL, BIN, INT, CMPX, REAL];
export const ID = createToken({ name: 'ID', pattern: /[a-zA-Z_][a-zA-Z_\d]*/ });
/* Type Tokens */
export const BASIC_TYPE = createToken({
  name: 'BASIC_TYPE',
  pattern: /bool|(i|u|b)(8|16|32|64)|(r|x)(32|64)|string/,
});
/* Binary Operator Tokens */
export const BinOp = createToken({ name: 'BinOp', pattern: Lexer.NA });
// Logical
export const EE = createToken({ name: 'EE', pattern: '==', categories: BinOp });
export const NE = createToken({ name: 'NE', pattern: '!=', categories: BinOp });
export const GE = createToken({ name: 'GE', pattern: '>=', categories: BinOp });
export const LE = createToken({ name: 'LE', pattern: '<=', categories: BinOp });
export const LT = createToken({ name: 'LT', pattern: '<', categories: BinOp });
export const GT = createToken({ name: 'GT', pattern: '>', categories: BinOp });
export const AND = createToken({ name: 'AND', pattern: 'and', longer_alt: ID, categories: BinOp });
export const OR = createToken({ name: 'OR', pattern: 'or', longer_alt: ID, categories: BinOp });
// Arithmetic
export const PLUS = createToken({ name: 'PLUS', pattern: '+', categories: BinOp });
export const MINUS = createToken({ name: 'MINUS', pattern: '-', categories: BinOp });
export const STAR = createToken({ name: 'STAR', pattern: '*', categories: BinOp });
export const SLASH = createToken({ name: 'SLASH', pattern: '/', categories: BinOp });
export const MOD = createToken({ name: 'MOD', pattern: '%', categories: BinOp });
// Bitwise
export const TILDE = createToken({ name: 'TILDE', pattern: '~', categories: BinOp });
export const AMP = createToken({ name: 'AMP', pattern: '&', categories: BinOp });
export const PIPE = createToken({ name: 'PIPE', pattern: '|', categories: BinOp });
export const CARET = createToken({ name: 'CARET', pattern: '^', categories: BinOp });
export const LSHIFT = createToken({ name: 'LSHIFT', pattern: '<<', categories: BinOp });
export const RSHIFT = createToken({ name: 'RSHIFT', pattern: '>>', categories: BinOp });
export const ASHIFT = createToken({ name: 'ASHIFT', pattern: '>>>', categories: BinOp });
// Miscellaneous
export const N_COAL = createToken({ name: 'N_COAL', pattern: '??', categories: BinOp });
export const EQU = createToken({ name: 'EQU', pattern: '=', categories: BinOp });
export const IN = createToken({ name: 'IN', pattern: 'in', longer_alt: ID, categories: BinOp });
export const binopTokens = [
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
export const CmpAsgn = createToken({ name: 'CmpAsgn', pattern: Lexer.NA });
export const PL_EQU = createToken({ name: 'PL_EQU', pattern: '+=', categories: CmpAsgn });
export const MIN_EQU = createToken({ name: 'MIN_EQU', pattern: '-=', categories: CmpAsgn });
export const ST_EQU = createToken({ name: 'ST_EQU', pattern: '*=', categories: CmpAsgn });
export const SL_EQU = createToken({ name: 'SL_EQU', pattern: '/=', categories: CmpAsgn });
export const MD_EQU = createToken({ name: 'MD_EQU', pattern: '%=', categories: CmpAsgn });
export const TL_EQU = createToken({ name: 'TL_EQU', pattern: '~=', categories: CmpAsgn });
export const AM_EQU = createToken({ name: 'AM_EQU', pattern: '&=', categories: CmpAsgn });
export const PI_EQU = createToken({ name: 'PI_EQU', pattern: '|=', categories: CmpAsgn });
export const CR_EQU = createToken({ name: 'CR_EQU', pattern: '^=', categories: CmpAsgn });
export const LS_EQU = createToken({ name: 'LS_EQU', pattern: '<<=', categories: CmpAsgn });
export const RS_EQU = createToken({ name: 'RS_EQU', pattern: '>>=', categories: CmpAsgn });
export const AS_EQU = createToken({ name: 'AS_EQU', pattern: '>>>=', categories: CmpAsgn });
export const NC_EQU = createToken({ name: 'NC_EQU', pattern: '??=', categories: CmpAsgn });
const compAssgnTokens = [
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
export const PostFix = createToken({ name: 'PostFix', pattern: Lexer.NA });
export const UnOp = createToken({ name: 'UnOp', pattern: Lexer.NA });
export const NOT = createToken({ name: 'NOT', pattern: 'not', longer_alt: ID, categories: UnOp });
export const INC = createToken({ name: 'INC', pattern: '++', categories: [PostFix, UnOp] });
export const DEC = createToken({ name: 'DEC', pattern: '--', categories: [PostFix, UnOp] });
const unopTokens = [PostFix, UnOp, NOT, INC, DEC];
/* Other Tokens */
export const LPAREN = createToken({ name: 'LPAREN', pattern: '(' });
export const RPAREN = createToken({ name: 'RPAREN', pattern: ')' });
export const LCURLY = createToken({ name: 'LCURLY', pattern: '{' });
export const RCURLY = createToken({ name: 'RCURLY', pattern: '}' });
export const SEMI = createToken({ name: 'SEMI', pattern: ';' });
export const COLON = createToken({ name: 'COLON', pattern: ':' });
/* Keywords */
export const LET = createToken({ name: 'LET', pattern: 'let', longer_alt: ID });
// Selection
export const IF = createToken({ name: 'IF', pattern: 'if', longer_alt: ID });
export const ELIF = createToken({ name: 'ELIF', pattern: 'elif', longer_alt: ID });
export const ELSE = createToken({ name: 'ELSE', pattern: 'else', longer_alt: ID });
// Loops
export const DO = createToken({ name: 'DO', pattern: 'do', longer_alt: ID });
export const WHILE = createToken({ name: 'WHILE', pattern: 'while', longer_alt: ID });
export const FINALLY = createToken({ name: 'FINALLY', pattern: 'finally', longer_alt: ID });
export const BREAK = createToken({ name: 'BREAK', pattern: 'break', longer_alt: ID });
export const CONTINUE = createToken({ name: 'CONTINUE', pattern: 'continue', longer_alt: ID });
export const RETURN = createToken({ name: 'RETURN', pattern: 'return', longer_alt: ID });
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
export const allTokens = [
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
  SEMI,
  COLON,
  ERROR,
];

export const CalvinLexer = new Lexer(allTokens);
