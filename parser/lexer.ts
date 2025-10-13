import { Lexer, createToken } from 'chevrotain';

/* Value Tokens */
export const STRING = createToken({
  name: 'STRING',
  // "a\"a" or 'b\'b'
  pattern: /("(\\"|[^"])*")|('(\\'|[^'])*')/
});
export const BOOL = createToken({ name: 'BOOL', pattern: /true|false/ });
const digits = /0|[1-9]([\d_]+\d|\d)?/;
export const INT = createToken({
  name: 'INT',
  pattern: RegExp(`(\\+|-)?(${digits.source})`)
});
const base16 = /0x([0-9a-fA-F][0-9a-fA-F_]*[0-9a-fA-F]|[0-9a-fA-F])/;
const base8 = /0o([0-7][0-7_]*[0-7]|[0-7])/;
const base2 = /0b([01][01_]*[01]|[01])/;
export const BIN = createToken({
  name: 'BIN',
  pattern: RegExp(`(${base16.source})|(${base8.source})|(${base2.source})`)
});
const real = RegExp(`((\\+|-)?((${digits.source})\\.\\d+|inf)|NaN)`);
export const CMPX = createToken({
  name: 'CMPX',
  pattern: RegExp(`(${real.source}(\\+|-))?${real.source}(i|j|I|J)`)
});
export const REAL = createToken({ name: 'REAL', pattern: real });
export const ID = createToken({ name: 'ID', pattern: /[a-zA-Z_][a-zA-Z_\d]*/ });
/* Type Tokens */
export const BASIC_TYPE = createToken({
  name: 'BASIC_TYPE',
  pattern: /bool|(i|u|b)(8|16|32|64)|(r|x)(32|64)|string/
});
/* Binary Operator Tokens */
// Logical
export const EE = createToken({ name: 'EE', pattern: '==' });
export const NE = createToken({ name: 'NE', pattern: '!=' });
export const GE = createToken({ name: 'GE', pattern: '>=' });
export const LE = createToken({ name: 'LE', pattern: '<=' });
export const LT = createToken({ name: 'LT', pattern: '<' });
export const GT = createToken({ name: 'GT', pattern: '>' });
export const AND = createToken({ name: 'AND', pattern: 'and' });
export const OR = createToken({ name: 'OR', pattern: 'or' });
export const IN = createToken({ name: 'IN', pattern: 'in' });
// Arithmetic
export const PLUS = createToken({ name: 'PLUS', pattern: '+' });
export const MINUS = createToken({ name: 'MINUS', pattern: '-' });
export const STAR = createToken({ name: 'STAR', pattern: '*' });
export const SLASH = createToken({ name: 'SLASH', pattern: '/' });
export const MOD = createToken({ name: 'MOD', pattern: '%' });
// Bitwise
export const TILDE = createToken({ name: 'TILDE', pattern: '~' });
export const AMP = createToken({ name: 'AMP', pattern: '&' });
export const PIPE = createToken({ name: 'PIPE', pattern: '|' });
export const CARET = createToken({ name: 'CARET', pattern: '^' });
export const LSHIFT = createToken({ name: 'LSHIFT', pattern: '<<' });
export const RSHIFT = createToken({ name: 'RSHIFT', pattern: '>>' });
export const ASHIFT = createToken({ name: 'ASHIFT', pattern: '>>>' });
// Miscellaneous
export const N_COAL = createToken({ name: 'N_COAL', pattern: '??' });
export const EQU = createToken({ name: 'EQU', pattern: '=' });
export const binopTokens = [
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
  IN
];
/* Compound Assignment Tokens */
export const PL_EQU = createToken({ name: 'PL_EQU', pattern: '+=' });
export const MIN_EQU = createToken({ name: 'MIN_EQU', pattern: '-=' });
export const ST_EQU = createToken({ name: 'ST_EQU', pattern: '*=' });
export const SL_EQU = createToken({ name: 'SL_EQU', pattern: '/=' });
export const MD_EQU = createToken({ name: 'MD_EQU', pattern: '%=' });
export const TL_EQU = createToken({ name: 'TL_EQU', pattern: '~=' });
export const AM_EQU = createToken({ name: 'AM_EQU', pattern: '&=' });
export const PI_EQU = createToken({ name: 'PI_EQU', pattern: '|=' });
export const CR_EQU = createToken({ name: 'CR_EQU', pattern: '^=' });
export const LS_EQU = createToken({ name: 'LS_EQU', pattern: '<<=' });
export const RS_EQU = createToken({ name: 'RS_EQU', pattern: '>>=' });
export const AS_EQU = createToken({ name: 'AS_EQU', pattern: '>>>=' });
export const NC_EQU = createToken({ name: 'NC_EQU', pattern: '??=' });
export const compAssgnTokens = [
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
  NC_EQU
];
/* Unary Operator Tokens */
export const NOT = createToken({ name: 'NOT', pattern: 'not' });
export const INC = createToken({ name: 'INC', pattern: '++' });
export const DEC = createToken({ name: 'DEC', pattern: '--' });
export const postfixUnopTokens = [INC, DEC];
export const unopTokens = [NOT, ...postfixUnopTokens];
/* Other Tokens */
export const LPAREN = createToken({ name: 'LPAREN', pattern: '(' });
export const RPAREN = createToken({ name: 'RPAREN', pattern: ')' });
export const LCURLY = createToken({ name: 'LCURLY', pattern: '{' });
export const RCURLY = createToken({ name: 'RCURLY', pattern: '}' });
export const SEMI = createToken({ name: 'SEMI', pattern: ';' });
export const COLON = createToken({ name: 'COLON', pattern: ':' });
/* Keywords */
export const LET = createToken({ name: 'LET', pattern: 'let' });
// Selection
export const IF = createToken({ name: 'IF', pattern: 'if' });
export const ELIF = createToken({ name: 'ELIF', pattern: 'elif' });
export const ELSE = createToken({ name: 'ELSE', pattern: 'else' });
const keywords = [LET, IF, ELIF, ELSE];
/* Ignored Tokens */
const WS = createToken({
  name: 'WS',
  pattern: /\s+/,
  group: Lexer.SKIPPED
});
const LCOMNT = createToken({
  name: 'LCOMNT',
  pattern: /\/\/[^\n]*/,
  group: Lexer.SKIPPED
});
const MCOMNT = createToken({
  name: 'MCOMNT',
  pattern: /\/\*([^*]|(\*+[^*/]))*\*+\//,
  group: Lexer.SKIPPED
});

const ERROR = createToken({ name: 'LEFTOVER', pattern: /./ });

// note we are placing WhiteSpace first as it is very common thus it will speed up the lexer.
export const allTokens = [
  LCOMNT,
  WS,
  MCOMNT,
  STRING,
  BOOL,
  CMPX,
  REAL,
  INT,
  BIN,
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
  ERROR
];

export const CalvinLexer = new Lexer(allTokens);
