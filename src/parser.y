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
    CONST VAR NULL STATIC
    LBRACE RBRACE
    LPAREN RPAREN
    SEMI RETURN QUE COLON N_COAL
    COMMA
    PUBLIC PRIVATE PROTECTED
    EXTENDS IMPLEMENTS
    EXPORT IMPORT FROM AS
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
    | class_def;
func_def: 
    func_prot func_body;
func_prot:
    type_sig ID func_sig;
func_sig:
    LPAREN RPAREN
    | LPAREN par_list RPAREN;
func_body:
    LBRACE RBRACE
    | LBRACE stmt_list RBRACE;
par_list:
    func_par
    | par_list COMMA;
func_par:
    type_sig ID;
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
stmt_list: 
    stmt 
    | stmt_list stmt;
stmt: 
    decl SEMI
    | expr SEMI
    | mass SEMI
    | RETURN expr SEMI;
type_sig: 
    scope stat const type;
type:
    TYPE 
    | VAR;
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
    | type_sig ID EQU expr;
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
    | LPAREN expr RPAREN;
cnst:
    BOOL 
    | CHAR 
    | REAL 
    | INT 
    | CMPX
    | NULL;

%%

void yy::parser::error (const location_type& l, const std::string& m) {
    std::cerr << l << ": " << m << '\n';
}