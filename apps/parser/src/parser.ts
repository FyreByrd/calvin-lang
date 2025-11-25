import { type CstNode, CstParser, type ParserMethod } from 'chevrotain';
import * as Tokens from './lexer.ts';

export class EncodeParser extends CstParser {
  constructor() {
    super(Tokens.allTokens);
    this.performSelfAnalysis();
  }

  public file: ParserMethod<[], CstNode> = this.RULE('file', () => {
    this.MANY(() => this.SUBRULE(this.statement));
  });

  public statement: ParserMethod<[], CstNode> = this.RULE('statement', () => {
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
          this.CONSUME(Tokens.LPAREN);
          this.SUBRULE3(this.expression);
          this.CONSUME(Tokens.RPAREN);
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

  public ifPredBody: ParserMethod<[], CstNode> = this.RULE('ifPredBody', () => {
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

  public body: ParserMethod<[], CstNode> = this.RULE('body', () => {
    this.CONSUME(Tokens.LCURLY);
    this.MANY(() => this.SUBRULE(this.statement));
    this.CONSUME(Tokens.RCURLY);
  });

  public declaration: ParserMethod<[], CstNode> = this.RULE('declaration', () => {
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

  public expression: ParserMethod<[], CstNode> = this.RULE('expression', () => {
    this.SUBRULE(this.value);
    this.OPTION(() => this.CONSUME(Tokens.PostFix));

    this.OPTION1(() => {
      this.CONSUME(Tokens.BinOp); // Compound assignment is categorized as a Binary operation by the lexer now
      this.SUBRULE(this.expression);
    });
  });

  public value: ParserMethod<[], CstNode> = this.RULE('value', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(Tokens.UnOp);
          this.SUBRULE1(this.value);
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

  public constant: ParserMethod<[], CstNode> = this.RULE('constant', () =>
    this.OR(Tokens.literals.map((t) => ({ ALT: () => this.CONSUME(t) }))),
  );

  public type: ParserMethod<[], CstNode> = this.RULE('type', () => this.CONSUME(Tokens.BASIC_TYPE));
}

export type EncodeRule = {
  [Property in keyof EncodeParser]: EncodeParser[Property] extends ParserMethod<[], CstNode>
    ? Property
    : never;
}[keyof EncodeParser];

export const parser: EncodeParser = new EncodeParser();
export const BaseCstVisitor: ReturnType<typeof parser.getBaseCstVisitorConstructor> =
  parser.getBaseCstVisitorConstructor();
export const BaseCstVisitorWithDefaults: ReturnType<
  typeof parser.getBaseCstVisitorConstructorWithDefaults
> = parser.getBaseCstVisitorConstructorWithDefaults();
