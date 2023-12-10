%skeleton "lalr1.cc" // -*- C++ -*-
%require "3.5.1"
%header

%define api.token.raw

%define api.token.constructor
%define api.value.type variant
%define parse.assert

%code requires {
    # include <string>
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
    LS_EQU RS_EQU AS_EQU
    NOT AND OR
    EE NE GE LE LT GT
    CONST VAR
    LBRACE RBRACE
    LPAREN RPAREN
    SEMI RETURN
;

%token <bool> BOOL
%token <char> CHAR
%token <double> REAL
%token <long> INT
%token <cmpx*> CMPX
%token <std::string> TYPE
%token <std::string> ID

%printer { yyo << $$; } <*>;

%%
%start program;

program: 
    func_def 
    | /*support null*/;
func_def: 
    TYPE ID LPAREN RPAREN LBRACE stmt_list RBRACE;
stmt_list: 
    stmt 
    | stmt_list stmt;
stmt: 
    decl SEMI
    | expr SEMI
    | mass SEMI
    | RETURN expr SEMI;
type: 
    TYPE 
    | CONST TYPE 
    | VAR 
    | CONST VAR;
decl: 
    type ID
    | type ID EQU expr
    | type ID EQU cmp;
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
    | val;
mass:
    val PL_EQU expr 
    | val MIN_EQU expr 
    | val ST_EQU expr 
    | val SL_EQU expr 
    | val MD_EQU expr 
    | val TL_EQU expr 
    | val TL_EQU cmp
    | val AM_EQU expr
    | val AM_EQU cmp
    | val PI_EQU expr
    | val PI_EQU cmp
    | val CR_EQU expr
    | val CR_EQU cmp 
    | val LS_EQU expr 
    | val RS_EQU expr 
    | val AS_EQU expr;
val:
    cnst 
    | ID 
    | LPAREN expr RPAREN;
cnst:
    BOOL 
    | CHAR 
    | REAL 
    | INT 
    | CMPX;
cmp:
    NOT val
    | expr AND val
    | expr OR val
    | expr EE val
    | expr NE val
    | expr GE val
    | expr LE val
    | expr LT val
    | expr GT val;

%%

void yy::parser::error (const location_type& l, const std::string& m) {
    std::cerr << l << ": " << m << '\n';
}