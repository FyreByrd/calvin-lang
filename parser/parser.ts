import { CstParser, Lexer, createToken } from 'chevrotain';

const ID = createToken({ name: 'ID', pattern: /[a-zA-Z_][a-zA-Z_0-9]*/ });
const NUMBER = createToken({ name: 'NUMBER', pattern: /0|[1-9]([0-9_]+[0-9]|[0-9])?/ });
const EQU = createToken({ name: 'EQU', pattern: '=' });
const SEMI = createToken({ name: 'SEMI', pattern: ';' });
const WS = createToken({
  name: 'WS',
  pattern: /\s+/,
  group: Lexer.SKIPPED
});

// note we are placing WhiteSpace first as it is very common thus it will speed up the lexer.
const allTokens = [WS, ID, NUMBER, EQU, SEMI];

export const CalvinLexer = new Lexer(allTokens);

//@typescript-eslint
export class CalvinParser extends CstParser {
  public expression;
  public value;

  constructor() {
    super(allTokens);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const $ = this;

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
            $.CONSUME(NUMBER);
          }
        },
        {
          ALT: () => {
            $.CONSUME(ID);
          }
        }
      ]);
    });

    this.performSelfAnalysis();
  }
}
