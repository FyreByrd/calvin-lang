import { type CstNode, CstParser, type ParserMethod } from 'chevrotain';
import * as Tokens from './lexer.ts';

export class CalvinParser extends CstParser {
  constructor() {
    super(Tokens.allTokens);
    this.performSelfAnalysis();
  }

  public file: ParserMethod<[], CstNode> = this.RULE('file', () => {
    this.MANY(() => this.SUBRULE(this.statement));
  });

  private statement = this.RULE('statement', () => {
    this.OR([
      {
        ALT: () => {
          this.OPTION(() =>
            this.OR1([
              {
                ALT: () => {
                  this.CONSUME(Tokens.LET);
                  this.SUBRULE(this.declaration);
                },
              },
              {
                ALT: () => this.CONSUME(Tokens.BREAK),
              },
              {
                ALT: () => this.CONSUME(Tokens.CONTINUE),
              },
              {
                ALT: () => {
                  this.CONSUME(Tokens.RETURN);
                  this.OPTION2(() => this.SUBRULE(this.expression));
                },
              },
              {
                ALT: () => this.SUBRULE2(this.expression),
              },
            ]),
          );
          this.CONSUME(Tokens.SEMI);
        },
      },
      {
        ALT: () => {
          this.CONSUME(Tokens.IF);

          this.SUBRULE1(this.ifPredBody);

          this.MANY(() => {
            this.CONSUME(Tokens.ELIF);
            this.SUBRULE2(this.ifPredBody);
          });

          this.OPTION1(() => {
            this.CONSUME(Tokens.ELSE);
            this.SUBRULE3(this.body);
          });
        },
      },
      {
        ALT: () => {
          this.OPTION3(() => {
            this.CONSUME(Tokens.DO);
            this.SUBRULE4(this.body);
          });

          this.CONSUME(Tokens.WHILE);
          this.SUBRULE3(this.expression);
          this.OR2([
            {
              ALT: () => {
                this.CONSUME2(Tokens.SEMI);
              },
            },
            {
              ALT: () => this.SUBRULE5(this.body),
            },
          ]);

          this.OPTION4(() => {
            this.CONSUME(Tokens.FINALLY);
            this.SUBRULE6(this.body);
          });
        },
      },
      {
        ALT: () => this.SUBRULE(this.body),
      },
    ]);
  });

  private ifPredBody = this.RULE('ifPredBody', () => {
    this.CONSUME(Tokens.LPAREN);
    this.OR([
      {
        ALT: () => {
          this.CONSUME(Tokens.LET);
          this.SUBRULE(this.declaration);
        },
      },
      {
        ALT: () => this.SUBRULE(this.expression),
      },
    ]);
    this.CONSUME(Tokens.RPAREN);

    this.SUBRULE(this.body);
  });

  private body = this.RULE('body', () => {
    this.CONSUME(Tokens.LCURLY);
    this.MANY(() => this.SUBRULE(this.statement));
    this.CONSUME(Tokens.RCURLY);
  });

  private declaration = this.RULE('declaration', () => {
    this.CONSUME(Tokens.ID);
    this.OPTION(() => {
      this.CONSUME(Tokens.COLON);
      this.SUBRULE(this.type);
    });
    this.OPTION1(() => {
      this.CONSUME(Tokens.EQU);
      this.SUBRULE(this.expression);
    });
  });

  private expression = this.RULE('expression', () => {
    this.SUBRULE(this.chainValue);
    this.OR([
      {
        ALT: () => this.CONSUME(Tokens.PostFix),
      },
      {
        ALT: () => {
          this.OPTION(() => {
            this.OR2([
              {
                ALT: () => this.CONSUME(Tokens.CmpAsgn),
              },
              {
                ALT: () => this.CONSUME(Tokens.BinOp),
              },
            ]);
            this.SUBRULE(this.expression);
            // TODO reorder based on precedence
          });
        },
      },
    ]);
  });

  private chainValue = this.RULE('chainValue', () => {
    this.SUBRULE(this.value);
    this.MANY(() => {
      this.SUBRULE(this.indexOrSlice);
    });
  });

  private indexOrSlice = this.RULE('indexOrSlice', () => {
    this.CONSUME(Tokens.LBRACK);
    // This allows for expressions of the form arr[] to be syntactically valid
    // I don't like it, but I guess this can be handled on the semantic level???
    // This was the best way I could fix the common lookahead prefix error
    this.OPTION(() => this.SUBRULE(this.expression));
    this.OPTION1(() => {
      this.CONSUME(Tokens.COLON);
      this.OPTION2(() => this.SUBRULE1(this.expression));
      this.OPTION3(() => {
        this.CONSUME1(Tokens.COLON);
        this.SUBRULE2(this.expression);
      });
    });
    this.CONSUME(Tokens.RBRACK);
  });

  private value = this.RULE('value', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(Tokens.UnOp);
          this.SUBRULE1(this.chainValue);
        },
      },
      {
        ALT: () => this.SUBRULE(this.constant),
      },
      {
        ALT: () => this.CONSUME(Tokens.ID),
      },
      {
        ALT: () => {
          this.CONSUME(Tokens.LPAREN);
          this.SUBRULE(this.expression);
          this.CONSUME(Tokens.RPAREN);
        },
      },
    ]);
  });

  private constant = this.RULE('constant', () =>
    this.OR([
      ...Tokens.literals.map((t) => ({ ALT: () => this.CONSUME(t) })),
      {
        ALT: () => {
          this.CONSUME(Tokens.LBRACK);
          this.MANY_SEP({
            SEP: Tokens.COMMA,
            DEF: () => this.SUBRULE(this.expression),
          });
          this.CONSUME(Tokens.RBRACK);
        },
      },
    ]),
  );

  private type = this.RULE('type', () => {
    this.CONSUME(Tokens.BASIC_TYPE);
    this.MANY(() => {
      this.SUBRULE(this.arrayType);
    });
  });

  private arrayType = this.RULE('arrayType', () => {
    this.CONSUME(Tokens.LBRACK);
    this.OPTION(() => this.CONSUME(Tokens.INT));
    this.CONSUME(Tokens.RBRACK);
  });
}

export const parser: CalvinParser = new CalvinParser();
export const BaseCstVisitor: ReturnType<typeof parser.getBaseCstVisitorConstructor> =
  parser.getBaseCstVisitorConstructor();
export const BaseCstVisitorWithDefaults: ReturnType<
  typeof parser.getBaseCstVisitorConstructorWithDefaults
> = parser.getBaseCstVisitorConstructorWithDefaults();
