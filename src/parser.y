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
    CONST STATIC AUTO
    UNION VAR
    LBRACE RBRACE
    LPAREN RPAREN
    LBRACK RBRACK
    QUE BANG N_COAL
    COLON COMMA DOT SEMI
    PUBLIC PRIVATE PROTECTED THIS 
    EXTENDS IMPLEMENTS
    EXPORT IMPORT FROM AS
    IF ELIF ELSE
    SWITCH CASE DEFAULT
    BREAK CONTINUE RETURN 
    FOR WHILE DO IN
    TRY CATCH FINALLY THROW
    NULL GLOBAL
;

%token <bool>           BOOL
%token <char>           CHAR
%token <double>         REAL
%token <long>           INT
%token <cmpx*>          CMPX
%token <std::string>    TYPE
%token <std::string>    ID
%token <std::string>    CLASS
%token <std::string>    INTER
%token <std::string>    STRING
%token <std::string>    ENUM
%token <std::string>    TYPEDEF

%printer { yyo << $$; } <*>;

%%
%start optional_list_program_statement;
/* PROGRAM */
optional_list_program_statement: 
    list_program_statement
    |;
list_program_statement:
    program_statement
    | list_program_statement program_statement;
program_statement:
    import_statement
    | EXPORT definition
    | definition;
/* IMPORTS */
import_statement:
    IMPORT STRING AS ID SEMI
    | IMPORT list_import_member FROM STRING SEMI;
list_import_member:
    import_member
    | list_import_member COMMA import_member;
import_member:
    ID
    | ID AS ID;
/* DEFINITIONS */
definition:
    function_definition
    | interface_definition
    | class_definition
    | enum_definition
    | typedef_definition;
generic_body:
    LBRACE RBRACE
    | LBRACE list_statement RBRACE;
optional_type:
    COLON TYPE
    |;
/* FUNCTION */
function_definition: 
    function_signature generic_body;
function_signature:
    type_signature ID function_parameters optional_const;
function_parameters:
    LPAREN RPAREN
    | LPAREN list_declaration RPAREN;
function_call:
    ID LPAREN RPAREN
    | ID LPAREN list_expression RPAREN;
/* EXTENDS/IMPLEMENTS */
extends:
    EXTENDS optional_scope ID;
implements:
    IMPLEMENTS list_implements_members;
list_implements_members:
    ID 
    | list_implements_members COMMA ID;
/* INTERFACE */
interface_definition:
    INTER interface_body
    | INTER extends interface_body;
interface_body:
    LBRACE RBRACE
    | LBRACE list_interface_member RBRACE;
list_interface_member:
    function_signature SEMI
    | list_interface_member function_signature SEMI;
/* CLASS */
class_definition:
    CLASS class_extends class_body;
class_extends:
    extends
    | implements
    | extends COMMA implements;
class_body:
    LBRACE RBRACE
    | LBRACE list_class_member RBRACE;
list_class_member:
    class_member
    | list_class_member class_member;
class_member:
    optional_scope optional_static declaration
    | optional_scope optional_static function_definition;
/* ENUM */
enum_definition:
    ENUM optional_type enum_body;
enum_body:
    LBRACE list_enum_member RBRACE;
list_enum_member:
    enum_member
    | list_enum_member COMMA enum_member;
enum_member:
    ID
    | ID EQU constant;
/* TYPEDEF */
typedef_definition:
    TYPEDEF EQU optional_typedef_extends typedef_body SEMI;
optional_typedef_extends:
    EXTENDS list_type
    |;
list_type:
    TYPE
    | list_type COMMA TYPE;
typedef_body:
    type_signature
    | union
    | variant
    | LBRACE list_declaration_semi RBRACE;
/* UNION */
union:
    UNION LBRACE list_declaration_semi RBRACE;
/* VARIANT */
variant:
    VAR optional_type LBRACE list_variant_member RBRACE;
list_variant_member:
    variant_member
    | list_variant_member variant_member;
variant_member:
    CASE ID COLON declaration SEMI;
/* STATEMENT */
list_statement: 
    statement 
    | list_statement statement;
statement: 
    declaration SEMI
    | expression SEMI
    | compound_assign SEMI
    | generic_body
    | SEMI
    /* SELECTION */
    | IF LPAREN expression RPAREN generic_body optional_if_suffix
    | SWITCH LPAREN value RPAREN LBRACE list_case_item RBRACE
    /* CONTROL FLOW */
    | BREAK SEMI
    | CONTINUE SEMI
    | BREAK INT SEMI
    | CONTINUE INT SEMI
    | RETURN expression SEMI
    /* LOOPS */
    | FOR LPAREN statement statement statement RPAREN generic_body optional_finally
    | FOR LPAREN declaration IN value RPAREN generic_body optional_finally
    | WHILE LPAREN expression RPAREN generic_body optional_finally
    | DO generic_body WHILE LPAREN expression RPAREN optional_while_generic_body optional_finally
    /* EXCEPTIONS */
    | THROW value SEMI
    | TRY generic_body try_suffix;
/* SELECTION */
optional_if_suffix:
    ELIF LPAREN expression RPAREN generic_body optional_if_suffix
    | ELSE generic_body
    |;
list_case_item:
    case_item
    | list_case_item case_item;
case_item:
    case_header
    | case_header list_statement;
case_header:
    CASE value COLON
    | DEFAULT COLON;
/* LOOPS */
optional_while_generic_body:
    generic_body
    | SEMI;
/* EXCEPTIONS */
try_suffix:
    list_catch
    | list_catch finally
    | finally;
list_catch:
    catch
    | list_catch catch;
catch:
    CATCH LPAREN declaration RPAREN generic_body;
optional_finally:
    finally
    |;
finally:
    FINALLY generic_body;
/* TYPES */
type_signature:
    TYPE type_suffix
    | CONST TYPE type_suffix
    | AUTO;
type_suffix:
    optional_reference_type optional_array_type;
optional_reference_type:
    AMP | QUE |;
optional_array_type:
    optional_array_type LBRACK RBRACK
    | optional_array_type LBRACK value RBRACK
    |;
optional_const:
    CONST 
    |; 
optional_static:
    STATIC
    |;
optional_scope:
    PUBLIC 
    | PROTECTED 
    | PRIVATE 
    |;
/* DECLARATIONS */
list_declaration:
    declaration
    | list_declaration COMMA declaration;
list_declaration_semi:
    declaration
    | list_declaration_semi SEMI declaration;
declaration: 
    type_signature ID
    | type_signature ID EQU expression
    | union
    | variant;
/* EXPRESSION */
list_expression:
    expression
    | list_expression COMMA expression;
optional_expression:
    expression
    |;
expression: 
    value PLUS expression 
    | value MINUS expression 
    | value STAR expression 
    | value SLASH expression 
    | value MOD expression 
    | value TILDE expression 
    | value AMP expression 
    | value PIPE expression 
    | value CARET expression 
    | value LSHIFT expression 
    | value RSHIFT expression 
    | value ASHIFT expression 
    | value EQU expression
    | NOT value
    | value AND expression
    | value OR expression
    | value EE expression
    | value NE expression
    | value GE expression
    | value LE expression
    | value LT expression
    | value GT expression
    | value N_COAL expression
    | value QUE expression COLON expression
    | value QUE COLON expression
    | LPAREN TYPE RPAREN expression
    | value AS TYPE
    | value;
compound_assign:
    value PL_EQU expression 
    | value MIN_EQU expression 
    | value ST_EQU expression 
    | value SL_EQU expression 
    | value MD_EQU expression 
    | value TL_EQU expression
    | value AM_EQU expression
    | value PI_EQU expression
    | value CR_EQU expression
    | value LS_EQU expression 
    | value RS_EQU expression 
    | value AS_EQU expression
    | value NC_EQU expression;
value:
    constant 
    | ID 
    | GLOBAL ID
    | THIS
    | TYPE DOT ID
    | TYPE DOT function_call
    | function_call
    | value optional_chain DOT ID
    | value optional_chain DOT function_call
    | value optional_chain LBRACK expression RBRACK
    | value optional_chain LBRACK slice RBRACK
    | LBRACE list_expression RBRACE
    | LPAREN expression RPAREN;
constant:
    BOOL 
    | CHAR 
    | REAL 
    | INT 
    | CMPX
    | NULL
    | STRING;
optional_chain:
    QUE
    | BANG
    |;
slice:
    optional_expression COLON optional_expression
    | optional_expression COLON optional_expression COLON expression;

%%

void yy::parser::error (const location_type& l, const std::string& m) {
    std::cerr << l << ": " << m << '\n';
}