import { CstParser, Lexer, createToken } from 'chevrotain';

const STRING = createToken({
  name: 'STRING',
  // "a\"a" or 'b\'b'
  pattern: /("(\\"|[^"])*")|('(\\'|[^'])*')/
});
const BOOL = createToken({ name: 'BOOL', pattern: /true|false/ });
const digits = /0|[1-9]([\d_]+\d|\d)?/;
const base10 = RegExp(`(\\+|-)?(${digits.source})`);
const base16 = /0x([0-9a-fA-F][0-9a-fA-F_]*[0-9a-fA-F]|[0-9a-fA-F])/;
const base8 = /0o([0-7][0-7_]*[0-7]|[0-7])/;
const base2 = /0b([01][01_]*[01]|[01])/;
const INT = createToken({
  name: 'INT',
  pattern: RegExp(`(${base10.source})|(${base16.source})|(${base8.source})|(${base2.source})`)
});
const real = RegExp(`((\\+|-)?((${digits.source})\\.\\d+|inf)|NaN)`);
const CMPX = createToken({
  name: 'CMPX',
  pattern: RegExp(`(${real.source}(\\+|-))?${real.source}(i|j|I|J)`)
});
const REAL = createToken({ name: 'REAL', pattern: real });
const ID = createToken({ name: 'ID', pattern: /[a-zA-Z_][a-zA-Z_\d]*/ });
const EQU = createToken({ name: 'EQU', pattern: '=' });
const SEMI = createToken({ name: 'SEMI', pattern: ';' });
const WS = createToken({
  name: 'WS',
  pattern: /\s+/,
  group: Lexer.SKIPPED
});

// note we are placing WhiteSpace first as it is very common thus it will speed up the lexer.
const allTokens = [WS, STRING, BOOL, CMPX, REAL, INT, ID, EQU, SEMI];

export const CalvinLexer = new Lexer(allTokens);

//@typescript-eslint
export class CalvinParser extends CstParser {
  public readonly file;
  private readonly expression;
  private readonly value;
  private readonly constant;

  constructor() {
    super(allTokens);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const $ = this;

    this.file = $.RULE('file', () => {
      $.MANY(() => {
        $.SUBRULE($.expression);
      });
    });

    this.expression = $.RULE('expression', () => {
      $.CONSUME(ID);
      $.CONSUME(EQU);
      $.SUBRULE($.value);
      $.CONSUME(SEMI);
    });

    this.value = $.RULE('value', () => {
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.constant);
          }
        },
        {
          ALT: () => {
            $.CONSUME(ID);
          }
        }
      ]);
    });

    this.constant = $.RULE('constant', () => {
      $.OR([
        {
          ALT: () => {
            $.CONSUME(BOOL);
          }
        },
        {
          ALT: () => {
            $.CONSUME(CMPX);
          }
        },
        {
          ALT: () => {
            $.CONSUME(REAL);
          }
        },
        {
          ALT: () => {
            $.CONSUME(INT);
          }
        },
        {
          ALT: () => {
            $.CONSUME(STRING);
          }
        }
      ]);
    });

    this.performSelfAnalysis();
  }
}
