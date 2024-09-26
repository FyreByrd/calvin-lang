%skeleton "lalr1.cc" // -*- C++ -*-
%require "3.5.1"
%header

%define api.token.raw

%define api.token.constructor
%define api.value.type variant
%define parse.assert

%code requires {
    #include <string>
    #include "cmpx.h"
    class driver;
}

%param { driver& drv }

%locations

%define parse.trace
%define parse.error detailed
%define parse.lac full

%code {
    #include "driver.h"
}

%define api.token.prefix {TOK_}
%token
    PLUS MINUS
    STAR SLASH MOD
    TILDE AMP PIPE CARET
    LSHIFT RSHIFT ASHIFT
    EQU
    PL_EQU MIN_EQU
    ST_EQU SL_EQU MD_EQU
    TL_EQU AM_EQU PI_EQU CR_EQU
    LS_EQU RS_EQU AS_EQU NC_EQU
    NOT AND OR
    EE NE GE LE LT GT
    CONST AUTO NULL STATIC
    UNION VAR
    LBRACE RBRACE
    LPAREN RPAREN
    LBRACK RBRACK
    SEMI RETURN QUE BANG N_COAL
    COLON COMMA DOT
    PUBLIC PRIVATE PROTECTED
    THIS EXTENDS IMPLEMENTS
    EXPORT IMPORT FROM AS
    IF ELIF ELSE
    SWITCH CASE DEFAULT
    BREAK CONTINUE
    FOR WHILE DO IN
;

%token <bool> BOOL
%token <char> CHAR
%token <double> REAL
%token <long> INT
%token <cmpx*> CMPX
%token <std::string> TYPE
%token <std::string> ID
%token <std::string> CLASS
%token <std::string> INTER
%token <std::string> STRING
%token <std::string> ENUM
%token <std::string> TYPEDEF

%printer { yyo << $$; } <*>;

%%
%start program;

program: 
    prog_list
    | /*support null*/;
prog_list:
    prog_stmt
    | prog_list prog_stmt;
prog_stmt:
    import
    | EXPORT def
    | def;
import:
    IMPORT STRING AS ID SEMI
    | IMPORT imp_list FROM STRING SEMI;
imp_list:
    imp_alias
    | imp_list COMMA imp_alias;
imp_alias:
    ID
    | ID AS ID;
def:
    func_def
    | inter_def
    | class_def
    | enum_def
    | type_def;
func_def: 
    func_prot scoped_body;
func_prot:
    type_sig ID func_sig const;
func_sig:
    LPAREN RPAREN
    | LPAREN decl_list RPAREN;
scoped_body:
    LBRACE RBRACE
    | LBRACE stmt_list RBRACE;
func_call:
    ID LPAREN RPAREN
    | ID LPAREN expr_list RPAREN;
expr_list:
    expr
    | expr_list COMMA expr;
decl_list:
    decl
    | decl_list COMMA decl;
decl_list_semi:
    decl
    | decl_list_semi SEMI decl;
extd:
    EXTENDS scope ID;
impl:
    IMPLEMENTS impl_list;
impl_list:
    ID 
    | impl_list COMMA ID;
inter_def:
    INTER inter_body
    | INTER extd inter_body;
inter_body:
    LBRACE RBRACE
    | LBRACE inter_list RBRACE;
inter_list:
    func_prot SEMI
    | inter_list func_prot SEMI;
class_def:
    CLASS class_ex class_body;
class_ex:
    extd
    | impl
    | extd COMMA impl;
class_body:
    LBRACE RBRACE
    | LBRACE class_list RBRACE;
class_list:
    class_mem
    | class_list class_mem;
class_mem:
    decl
    | func_def;
enum_def:
    ENUM enum_body
    | ENUM COLON TYPE enum_body;
enum_body:
    LBRACE enum_list RBRACE;
enum_list:
    enum_stmt
    | enum_list COMMA enum_stmt;
enum_stmt:
    ID
    | ID EQU cnst;
type_def:
    TYPEDEF EQU type_isct type_body SEMI;
type_isct:
    EXTENDS type_list
    |;
type_list:
    type
    | type_list COMMA type;
type_body:
    type
    | unions
    | LBRACE type_blist RBRACE;
unions:
    UNION LBRACE decl_list_semi RBRACE
    | VAR opt_id var_type LBRACE var_list RBRACE;
opt_id:
    ID
    |;
var_type:
    COLON ID
    |;
var_list:
    var_mem
    | var_list var_mem;
var_mem:
    CASE ID COLON decl SEMI;
type_blist:
    decl SEMI
    | type_blist decl SEMI;
stmt_list: 
    stmt 
    | stmt_list stmt;
stmt: 
    decl SEMI
    | expr SEMI
    | mass SEMI
    | RETURN expr SEMI
    | scoped_body
    | IF LPAREN expr RPAREN stmt if_opt
    | SWITCH LPAREN val RPAREN LBRACE case_list RBRACE
    | BREAK SEMI
    | CONTINUE SEMI
    | BREAK INT SEMI
    | CONTINUE INT SEMI
    | FOR LPAREN stmt stmt stmt RPAREN stmt
    | FOR LPAREN decl IN val RPAREN stmt
    | WHILE LPAREN expr RPAREN stmt
    | DO stmt WHILE LPAREN expr RPAREN stmt
    | SEMI;
if_opt:
    ELIF LPAREN expr RPAREN stmt if_opt
    | ELSE stmt;
case_list:
    case_item
    | case_list case_item;
case_item:
    case_head
    | case_head stmt_list;
case_head:
    CASE val COLON
    | DEFAULT COLON;
type_sig: 
    scope stat const type;
type:
    TYPE type_suff
    | AUTO;
type_suff:
    type_ref type_null type_arr;
type_ref:
    AMP |;
type_null:
    QUE |;
type_arr:
    type_arr LBRACK RBRACK
    | type_arr LBRACK val RBRACK
    | ;
const:
    CONST 
    |; 
stat:
    STATIC
    |;
scope:
    PUBLIC 
    | PROTECTED 
    | PRIVATE 
    |;
decl: 
    type_sig ID
    | type_sig ID EQU expr
    | unions;
expr: 
    val PLUS expr 
    | val MINUS expr 
    | val STAR expr 
    | val SLASH expr 
    | val MOD expr 
    | val TILDE expr 
    | val AMP expr 
    | val PIPE expr 
    | val CARET expr 
    | val LSHIFT expr 
    | val RSHIFT expr 
    | val ASHIFT expr 
    | val EQU expr
    | NOT val
    | val AND expr
    | val OR expr
    | val EE expr
    | val NE expr
    | val GE expr
    | val LE expr
    | val LT expr
    | val GT expr
    | val N_COAL expr
    | val QUE expr COLON expr
    | val QUE COLON expr
    | LPAREN TYPE RPAREN expr
    | val AS TYPE
    | val;
mass:
    val PL_EQU expr 
    | val MIN_EQU expr 
    | val ST_EQU expr 
    | val SL_EQU expr 
    | val MD_EQU expr 
    | val TL_EQU expr
    | val AM_EQU expr
    | val PI_EQU expr
    | val CR_EQU expr
    | val LS_EQU expr 
    | val RS_EQU expr 
    | val AS_EQU expr
    | val NC_EQU expr;
val:
    cnst 
    | ID 
    | THIS
    | func_call
    | val DOT opt_chain ID
    | val opt_chain LBRACK expr RBRACK
    | val opt_chain LBRACK slice RBRACK
    | LBRACE expr_list RBRACE
    | LPAREN expr RPAREN;
slice:
    opt_expr COLON opt_expr
    | opt_expr COLON opt_expr COLON expr;
opt_expr:
    expr
    |;
opt_chain:
    QUE
    | BANG
    |;
cnst:
    BOOL 
    | CHAR 
    | REAL 
    | INT 
    | CMPX
    | NULL
    | STRING;

%%

void yy::parser::error (const location_type& l, const std::string& m) {
    std::cerr << l << ": " << m << '\n';
}