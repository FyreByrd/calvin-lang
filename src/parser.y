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
    TL_EQU AM_EQU PI_EQU CAR_EQU
    LS_EQU RS_EQU AS_EQU
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

program: func_def | /*support null*/;
func_def: TYPE ID LPAREN RPAREN LBRACE stmt RBRACE;
stmt: expr SEMI | RETURN expr SEMI;
expr: value PLUS expr | value;
value: INT;

%%

void yy::parser::error (const location_type& l, const std::string& m) {
  std::cerr << l << ": " << m << '\n';
}