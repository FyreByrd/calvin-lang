import { assert, assertEquals, assertGreater } from '@std/assert';
import type {
  BodyCstChildren,
  ConstantCstChildren,
  DeclarationCstChildren,
  ExpressionCstChildren,
  FileCstChildren,
  IfPredBodyCstChildren,
  StatementCstChildren,
  StatementCstNode,
  TypeCstChildren,
  ValueCstChildren,
} from '@/generated/cst-types.ts';

export type ValidationFunction =
  | typeof file
  | typeof statement
  | typeof ifPredBody
  | typeof declaration
  | typeof body
  | typeof expression
  | typeof value
  | typeof constant
  | typeof type;

export function file(node: FileCstChildren, args?: Statement[] | null) {
  if (args?.length) {
    assert(node.statement);
  }
  if (args === null) {
    assert(!node.statement?.length);
  }
  if (node.statement && args !== null) {
    statement_list(node.statement, args);
  }
}

function statement_list(statements: StatementCstNode[], args?: Statement[]) {
  if (args) {
    assertEquals(statements.length, args.length);
  } else {
    assertGreater(statements.length, 0);
  }
  for (let i = 0; i < statements.length; i++) {
    statement(statements[i].children, args?.[i]);
  }
}

type BodyStatement = ['body', Body | undefined];
type IfStatement = [
  'if',
  // 0 = if, 1-n = elif
  (IfPredBody | false | undefined)[] | undefined,
  Body | false | undefined, // else
];
type WhileStatement = [
  'while',
  Body | false | undefined, // do
  Expression | undefined, // while
  Body | false | undefined, // while-body
  Body | false | undefined, // finally-body
];

type Statement =
  | ['declaration', Declaration | undefined]
  | ['break']
  | ['continue']
  | ['return', Expression | false | undefined]
  | IfStatement
  | WhileStatement
  | BodyStatement
  | ['expression', Expression | undefined]
  | false;
export function statement(stmt: StatementCstChildren, args?: Statement) {
  if (args === false) {
    assertEquals(Object.keys(stmt).length, 1);
    assert(stmt.SEMI);
  } else if (stmt.LET && stmt.declaration) {
    if (args) {
      assertEquals(args[0], 'declaration');
    }
    declaration(stmt.declaration[0].children, (args?.[1] as Declaration) || undefined);
  } else if (stmt.BREAK) {
    if (args) {
      assertEquals(args[0], 'break');
    }
    assertEquals(stmt.BREAK[0].image, 'break');
  } else if (stmt.CONTINUE) {
    if (args) {
      assertEquals(args[0], 'continue');
    }
    assertEquals(stmt.CONTINUE[0].image, 'continue');
  } else if (stmt.RETURN) {
    if (args) {
      assertEquals(args[0], 'return');
    }
    assertEquals(stmt.RETURN[0].image, 'return');
    assert(args?.[1] === undefined || (args[1] ? stmt.expression : !stmt.expression));
    if (stmt.expression) {
      assertEquals(stmt.expression.length, 1);
      expression(stmt.expression[0].children, (args?.[1] as Expression) || undefined);
    }
  } else if (stmt.IF && stmt.ifPredBody) {
    if (args) {
      assertEquals(args[0], 'if');
    }
    const [_, p, e] = args ?? [];
    let bodyCount = 0;
    const predBody = stmt.ifPredBody;
    // biome-ignore lint/complexity/useOptionalChain: p could be false without being nullish
    if (p && p.length) {
      assertEquals(predBody.length, p.length);
    }
    ifPredBody(predBody[bodyCount++].children, (p && (p[0] as IfPredBody)) || undefined);
    if (stmt.ELIF) {
      stmt.ELIF.forEach(() => {
        ifPredBody(predBody[bodyCount].children, (p && (p[bodyCount] as IfPredBody)) || undefined);
        bodyCount++;
      });
    }
    assert(e === undefined || (e ? stmt.body : !stmt.body));
    if (stmt.ELSE && stmt.body) {
      body(stmt.body[0].children, e as Body);
    }
  } else if (stmt.WHILE && stmt.expression) {
    if (args) {
      assertEquals(args[0], 'while');
    }
    const [_, d, we, wb, f] = args || [];
    let bodyCount = 0;
    assert(d === undefined || (d ? stmt.DO : !stmt.DO));
    if (stmt.DO) {
      assert(stmt.body);
      assert(stmt.body[bodyCount]);
      body(stmt.body[bodyCount++].children, d as Body);
    }
    expression(stmt.expression[0].children, we as Expression);
    assert(wb === undefined || (wb ? !stmt.SEMI : stmt.SEMI));
    if (!stmt.SEMI) {
      assert(stmt.body);
      assert(stmt.body[bodyCount]);
      body(stmt.body[bodyCount++].children, wb as Body);
    }
    assert(f === undefined || (f ? stmt.FINALLY : !stmt.FINALLY));
    if (stmt.FINALLY) {
      assert(stmt.body);
      assert(stmt.body[bodyCount]);
      body(stmt.body[bodyCount++].children, f as Body);
    }
  } else if (stmt.body) {
    if (args) {
      assertEquals(args[0], 'body');
    }
    body(stmt.body[0].children, args?.[1] as Body);
  } else if (stmt.expression) {
    if (args) {
      assertEquals(args[0], 'expression');
    }
    expression(stmt.expression[0].children, args?.[1] as Expression);
  } else if (stmt.SEMI) {
    assert(!args);
  } else {
    throw new Error(`Validation: unhandled statement type!\n${JSON.stringify(stmt, null, 2)}`);
  }
}

type IfPredBody =
  | ['declaration', Declaration | undefined, Body | undefined]
  | ['expression', Expression | undefined, Body | undefined];
export function ifPredBody(predBody: IfPredBodyCstChildren, args?: IfPredBody) {
  if (predBody.LET && predBody.declaration) {
    if (args) {
      assertEquals(args[0], 'declaration');
    }
    declaration(predBody.declaration[0].children, args?.[1] as Declaration | undefined);
  } else if (predBody.expression) {
    if (args) {
      assertEquals(args[0], 'expression');
    }
    expression(predBody.expression[0].children, args?.[1] as Expression | undefined);
  } else {
    throw new Error(`Validation: unhandled ifPredBody type!\n${JSON.stringify(predBody, null, 2)}`);
  }

  body(predBody.body[0].children, args?.[2]);
}

type Declaration = [string | undefined, Type | false | undefined, Expression | false | undefined];
export function declaration(decl: DeclarationCstChildren, args?: Declaration) {
  const [id, t, e] = args ?? [];
  assertEquals(decl.ID.length, 1);
  if (id) {
    assertEquals(decl.ID[0].image, id);
  } else {
    assertGreater(decl.ID[0].image.length, 0);
  }
  assert(t === undefined || (t ? decl.type : !decl.type));
  if (decl.type) {
    assertEquals(decl.type.length, 1);
    type(decl.type[0].children, t || undefined);
  }
  assert(e === undefined || (e ? decl.expression : !decl.expression));
  if (decl.expression) {
    assertEquals(decl.expression.length, 1);
    expression(decl.expression[0].children, e || undefined);
  }
}

type Body = Statement[] | null;
export function body<T extends Body>(node: BodyCstChildren, args?: T) {
  assertEquals(node.LCURLY?.at(0)?.image, '{');
  if (args?.length) {
    assert(node.statement);
  }
  if (args === null) {
    assert(!node.statement?.length);
  }
  if (node.statement && args !== null) {
    statement_list(node.statement, args);
  }
  assertEquals(node.RCURLY?.at(0)?.image, '}');
}

type Expression = Parameters<typeof expression>[1];
export function expression<
  T extends
    | [
        string | false | undefined, // operator
        Value | undefined,
        string | false | undefined, // postfix operator
        T | false | undefined,
      ]
    | undefined,
>(expr: ExpressionCstChildren, args?: T) {
  const [op, val, pf, rhs] = args ?? [];
  assert(op === undefined || (op ? expr.BinOp : !expr.BinOp));
  if (expr.BinOp) {
    assertEquals(expr.BinOp.length, 1);
    if (op) {
      assertEquals(expr.BinOp[0].image, op);
    } else {
      assertGreater(expr.BinOp[0].image.length, 0);
    }
  }
  assert(expr.value?.at(0)?.children);
  value(expr.value[0].children, val);
  assert(pf === undefined || (pf ? expr.PostFix : !expr.PostFix));
  if (expr.PostFix) {
    assertEquals(expr.PostFix.length, 1);
    if (pf) {
      assertEquals(expr.PostFix[0].image, pf);
    } else {
      assertGreater(expr.PostFix[0].image.length, 0);
    }
  }
  assert(rhs === undefined || (rhs ? expr.expression : !expr.expression));
  if (expr.expression) {
    assertEquals(expr.expression.length, 1);
    expression(expr.expression[0].children, rhs || undefined);
  }
}

type NestedValue = ['nested', Expression];

type Value = Parameters<typeof value>[1];
export function value<
  T extends
    | NestedValue
    | ['constant', Constant]
    | ['id', string | undefined]
    | ['prefix', string | undefined, T]
    | undefined,
>(val: ValueCstChildren, args?: T) {
  if (val.expression) {
    if (args) {
      assertEquals(args[0], 'nested');
    }
    assertEquals(val.LPAREN?.at(0)?.image, '(');
    expression(val.expression[0].children, args?.at(1) as Expression);
    assertEquals(val.RPAREN?.at(0)?.image, ')');
  } else if (val.constant) {
    if (args) {
      assertEquals(args[0], 'constant');
    }
    constant(val.constant[0].children, args?.at(1) as Constant);
  } else if (val.ID) {
    assertEquals(val.ID.length, 1);
    if (args) {
      assertEquals(args[0], 'id');
    }
    if (args?.[1]) {
      assertEquals(val.ID[0].image, args[1]);
    } else {
      assertGreater(val.ID[0].image.length, 0);
    }
  } else if (val.value) {
    assert(val.UnOp);
    assertEquals(val.UnOp.length, 1);
    if (args) {
      assertEquals(args[0], 'prefix');
    }
    if (args?.[1]) {
      assertEquals(val.UnOp[0].image, args[1]);
    } else {
      assertGreater(val.UnOp[0].image.length, 0);
    }
    value(val.value[0].children, args?.at(2) as T);
  } else {
    throw new Error(`Validation: unhandled value type!\n${JSON.stringify(val, null, 2)}`);
  }
}

type Constant = [keyof ConstantCstChildren, string];
export function constant(c: ConstantCstChildren, args?: Constant) {
  assert(c.BIN || c.BOOL || c.CMPX || c.INT || c.REAL || c.STRING);
  assertEquals(Object.values(c).length, 1);
  if (args?.at(0)) {
    assert(c[args[0]]);
    assertEquals(c[args[0]]?.length, 1);
    if (args.at(1)) {
      assertEquals(c[args[0]]?.[0]?.image, args[1]);
    }
  } else {
    assertEquals(Object.values(c)[0].length, 1);
    assertGreater(Object.values(c)[0][0].image.length, 0);
  }
}

type Type = [string];
export function type(t: TypeCstChildren, args?: Type) {
  assert(t.BASIC_TYPE);
  assertEquals(t.BASIC_TYPE.length, 1);
  if (args?.at(0)) {
    assertEquals(t.BASIC_TYPE[0].image, args[0]);
  } else {
    assertGreater(t.BASIC_TYPE[0].image.length, 0);
  }
}
