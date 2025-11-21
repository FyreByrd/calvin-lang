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
    assert(node.statement, `File: expected 1+ statements but received ${node.statement?.length}`);
  }
  if (args === null) {
    assert(
      !node.statement?.length,
      `File: expected 0 statements but received ${node.statement?.length}`,
    );
  }
  if (node.statement && args !== null) {
    statement_list(node.statement, args);
  }
}

function statement_list(statements: StatementCstNode[], args?: Statement[]) {
  if (args) {
    assertEquals(
      statements.length,
      args.length,
      `Statement List: expected ${args.length} statements but received ${statements.length}`,
    );
  } else {
    assertGreater(
      statements.length,
      0,
      `Statement List: expected 1+ statements but received ${statements.length}`,
    );
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
    assert(
      Object.keys(stmt).length === 1 && stmt.SEMI,
      `Statement: expected SEMI but received ${Object.keys(stmt)}`,
    );
  } else if (stmt.LET && stmt.declaration) {
    if (args) {
      assertEquals(
        args[0],
        'declaration',
        `Statement: expected ${args[0]} but received declaration`,
      );
    }
    declaration(stmt.declaration[0].children, (args?.[1] as Declaration) || undefined);
  } else if (stmt.BREAK) {
    if (args) {
      assertEquals(args[0], 'break', `Statement: expected ${args[0]} but received break`);
    }
    assertEquals(stmt.BREAK[0].image, 'break');
  } else if (stmt.CONTINUE) {
    if (args) {
      assertEquals(args[0], 'continue', `Statement: expected ${args[0]} but received continue`);
    }
    assertEquals(stmt.CONTINUE[0].image, 'continue');
  } else if (stmt.RETURN) {
    if (args) {
      assertEquals(args[0], 'return', `Statement: expected ${args[0]} but received return`);
    }
    assertEquals(stmt.RETURN[0].image, 'return');
    assert(
      args?.[1] === undefined || (args[1] ? stmt.expression : !stmt.expression),
      `Statement > return: expected ${!!args?.[1]} but received ${!!stmt.expression}`,
    );
    if (stmt.expression) {
      assertEquals(stmt.expression.length, 1);
      expression(stmt.expression[0].children, (args?.[1] as Expression) || undefined);
    }
  } else if (stmt.IF && stmt.ifPredBody) {
    if (args) {
      assertEquals(args[0], 'if', `Statement: expected ${args[0]} but received if`);
    }
    const [_, p, e] = args ?? [];
    let bodyCount = 0;
    const predBody = stmt.ifPredBody;
    // biome-ignore lint/complexity/useOptionalChain: p could be false without being nullish
    if (p && p.length) {
      assertEquals(
        predBody.length,
        p.length,
        `Statement: expected ${p.length} if-preds but received ${predBody.length}`,
      );
    }
    ifPredBody(predBody[bodyCount++].children, (p && (p[0] as IfPredBody)) || undefined);
    if (stmt.ELIF) {
      stmt.ELIF.forEach(() => {
        ifPredBody(predBody[bodyCount].children, (p && (p[bodyCount] as IfPredBody)) || undefined);
        bodyCount++;
      });
    }
    assert(
      e === undefined || (e ? stmt.body : !stmt.body),
      `Statement > else: expected ${!!e} but received ${!!stmt.body}`,
    );
    if (stmt.ELSE && stmt.body) {
      body(stmt.body[0].children, e as Body);
    }
  } else if (stmt.WHILE && stmt.expression) {
    if (args) {
      assertEquals(args[0], 'while', `Statement: expected ${args[0]} but received while`);
    }
    const [_, d, we, wb, f] = args || [];
    let bodyCount = 0;
    assert(
      d === undefined || (d ? stmt.DO : !stmt.DO),
      `Statement > do: expected ${!!d} but received ${!!stmt.DO}`,
    );
    if (stmt.DO) {
      assert(
        stmt.body?.[bodyCount],
        `Statement > do: expected body but received ${stmt.body?.[bodyCount]}`,
      );
      body(stmt.body[bodyCount++].children, d as Body);
    }
    expression(stmt.expression[0].children, we as Expression);
    assert(
      wb === undefined || (wb ? !stmt.SEMI : stmt.SEMI),
      `Statement > while: expected ${!!wb} but received ${!stmt.SEMI}`,
    );
    if (!stmt.SEMI) {
      assert(
        stmt.body?.[bodyCount],
        `Statement > while: expected body but received ${stmt.body?.[bodyCount]}`,
      );
      body(stmt.body[bodyCount++].children, wb as Body);
    }
    assert(
      f === undefined || (f ? stmt.FINALLY : !stmt.FINALLY),
      `Statement > finally: expected ${!!f} but received ${!!stmt.FINALLY}`,
    );
    if (stmt.FINALLY) {
      assert(
        stmt.body?.[bodyCount],
        `Statement > finally: expected body but received ${stmt.body?.[bodyCount]}`,
      );
      body(stmt.body[bodyCount++].children, f as Body);
    }
  } else if (stmt.body) {
    if (args) {
      assertEquals(args[0], 'body', `Statement: expected ${args[0]} but received body`);
    }
    body(stmt.body[0].children, args?.[1] as Body);
  } else if (stmt.expression) {
    if (args) {
      assertEquals(args[0], 'expression', `Statement: expected ${args[0]} but received expression`);
    }
    expression(stmt.expression[0].children, args?.[1] as Expression);
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
      assertEquals(
        args[0],
        'declaration',
        `IfPredBody: expected ${args[0]} but received declaration`,
      );
    }
    declaration(predBody.declaration[0].children, args?.[1] as Declaration | undefined);
  } else if (predBody.expression) {
    if (args) {
      assertEquals(
        args[0],
        'expression',
        `IfPredBody: expected ${args[0]} but received expression`,
      );
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
    assertEquals(
      decl.ID[0].image,
      id,
      `Declaration: expected ${id} but received ${decl.ID[0].image}`,
    );
  } else {
    assertGreater(decl.ID[0].image.length, 0);
  }
  assert(
    t === undefined || (t ? decl.type : !decl.type),
    `Declaration > type: expected ${!!t} but received ${!!decl.type}`,
  );
  if (decl.type) {
    assertEquals(decl.type.length, 1);
    type(decl.type[0].children, t || undefined);
  }
  assert(
    e === undefined || (e ? decl.expression : !decl.expression),
    `Declaration > expression: expected ${!!e} but received ${!!decl.expression}`,
  );
  if (decl.expression) {
    assertEquals(decl.expression.length, 1);
    expression(decl.expression[0].children, e || undefined);
  }
}

type Body = Statement[] | null;
export function body<T extends Body>(node: BodyCstChildren, args?: T) {
  assertEquals(node.LCURLY?.at(0)?.image, '{', 'Body: missing {');
  if (args?.length) {
    assert(node.statement, `Body: expected 1+ statements but received ${node.statement?.length}`);
  }
  if (args === null) {
    assert(
      !node.statement?.length,
      `Body: expected 0 statements but received ${node.statement?.length}`,
    );
  }
  if (node.statement && args !== null) {
    statement_list(node.statement, args);
  }
  assertEquals(node.RCURLY?.at(0)?.image, '}', 'Body: missing }');
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
  assert(
    op === undefined || (op ? expr.BinOp : !expr.BinOp),
    `Expression > BinOp: expected ${!!op} but received ${!!expr.BinOp}`,
  );
  if (expr.BinOp) {
    assertEquals(expr.BinOp.length, 1);
    if (op) {
      assertEquals(
        expr.BinOp[0].image,
        op,
        `Expression > BinOp: expected ${op} but received ${expr.BinOp[0].image}`,
      );
    } else {
      assertGreater(expr.BinOp[0].image.length, 0);
    }
  }
  assert(expr.value?.at(0)?.children);
  value(expr.value[0].children, val);
  assert(
    pf === undefined || (pf ? expr.PostFix : !expr.PostFix),
    `Expression > PostFix: expected ${!!pf} but received ${!!expr.PostFix}`,
  );
  if (expr.PostFix) {
    assertEquals(expr.PostFix.length, 1);
    if (pf) {
      assertEquals(
        expr.PostFix[0].image,
        pf,
        `Expression > PostFix: expected ${pf} but received ${expr.PostFix[0].image}`,
      );
    } else {
      assertGreater(expr.PostFix[0].image.length, 0);
    }
  }
  assert(
    rhs === undefined || (rhs ? expr.expression : !expr.expression),
    `Expression > rhs: expected ${!!rhs} but received ${!!expr.expression}`,
  );
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
      assertEquals(args[0], 'nested', `Value: expected ${args[0]} but received nested`);
    }
    assertEquals(val.LPAREN?.at(0)?.image, '(', 'Value: missing (');
    expression(val.expression[0].children, args?.at(1) as Expression);
    assertEquals(val.RPAREN?.at(0)?.image, ')', 'Value: missing )');
  } else if (val.constant) {
    if (args) {
      assertEquals(args[0], 'constant', `Value: expected ${args[0]} but received constant`);
    }
    constant(val.constant[0].children, args?.at(1) as Constant);
  } else if (val.ID) {
    assertEquals(val.ID.length, 1);
    if (args) {
      assertEquals(args[0], 'id', `Value: expected ${args[0]} but received id`);
    }
    if (args?.[1]) {
      assertEquals(
        val.ID[0].image,
        args[1],
        `Value > id: expected ${args[1]} but received ${val.ID[0].image}`,
      );
    } else {
      assertGreater(val.ID[0].image.length, 0);
    }
  } else if (val.value) {
    assertEquals(
      val.UnOp?.length,
      1,
      `Value > prefix: expected 1 prefix but received ${val.UnOp?.length}`,
    );
    if (args) {
      assertEquals(args[0], 'prefix', `Value: expected ${args[0]} but received prefix`);
    }
    if (args?.[1]) {
      assertEquals(
        val.UnOp?.[0].image,
        args[1],
        `Value prefix: expected ${args[1]} but received ${val.UnOp?.[0].image}`,
      );
    } else {
      assertGreater(val.UnOp?.[0].image.length, 0);
    }
    value(val.value[0].children, args?.at(2) as T);
  } else {
    throw new Error(`Validation: unhandled value type!\n${JSON.stringify(val, null, 2)}`);
  }
}

type Constant = [keyof ConstantCstChildren, string];
export function constant(c: ConstantCstChildren, args?: Constant) {
  assert(
    c.BIN || c.BOOL || c.CMPX || c.INT || c.REAL || c.STRING,
    `Constant: unexpected literal type ${Object.keys(c)}`,
  );
  assertEquals(
    Object.keys(c).length,
    1,
    `Constant: expected 1 literal but received ${Object.keys(c).length}`,
  );
  if (args?.[0]) {
    assertEquals(
      c[args[0]]?.length,
      1,
      `Constant: expected ${args[0]} but received ${Object.keys(c)}`,
    );
    if (args[1]) {
      const literal = c[args[0]]?.[0]?.image;
      assertEquals(literal, args[1], `Constant: expected ${args[1]} but received ${literal}`);
    }
  } else {
    assertEquals(Object.values(c)[0].length, 1);
    assertGreater(Object.values(c)[0][0].image.length, 0);
  }
}

type Type = string;
export function type(t: TypeCstChildren, args?: Type) {
  assertEquals(
    t.BASIC_TYPE?.length,
    1,
    `Type: expected 1 type but received ${t.BASIC_TYPE?.length}`,
  );
  if (args) {
    assertEquals(
      t.BASIC_TYPE[0].image,
      args,
      `Type: expected ${args} but received ${t.BASIC_TYPE[0].image}`,
    );
  } else {
    assertGreater(t.BASIC_TYPE[0].image.length, 0);
  }
}
