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
    #include "debug.h"
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
    COLON COMMA DOT SEMI USCORE
    PUBLIC PRIVATE PROTECTED
    THIS INIT
    EXTENDS IMPLEMENTS
    EXPORT IMPORT FROM AS
    IF ELIF ELSE
    SWITCH CASE DEFAULT
    BREAK CONTINUE RETURN 
    FOR WHILE DO IN
    TRY CATCH FINALLY THROW
    NULL GLOBAL
    USING
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
%token <std::string>    NAMESPACE

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
    | definition
    | USING namespace SEMI;
/* NAMESPACE */
namespace:
    TYPE
    | namespace DOT TYPE;
namespace_definition:
    NAMESPACE LBRACE list_namespace_member RBRACE;
list_namespace_member:
    namespace_member
    | list_namespace_member namespace_member;
namespace_member:
    optional_scope definition;
/* IMPORTS */
import_statement:
    IMPORT STRING AS ID SEMI
    | IMPORT STAR FROM STRING SEMI
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
    | typedef_definition
    | namespace_definition
    | declaration SEMI;
generic_body: // DONE
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
    | LPAREN list_function_parameters RPAREN;
list_function_parameters:
    declaration
    | USCORE
    | list_function_parameters COMMA declaration
    | list_function_parameters COMMA USCORE;
function_call:
    ID LPAREN optional_list_expression RPAREN;
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
    | optional_scope optional_static function_definition
    | INIT function_parameters generic_body;
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
    type_signature
    | list_type COMMA type_signature;
typedef_body:
    type_signature
    | union
    | variant
    | LBRACE list_declaration RBRACE;
/* UNION */
union:
    UNION LBRACE list_declaration RBRACE;
/* VARIANT */
variant:
    VAR optional_type LBRACE list_variant_member RBRACE;
list_variant_member:
    variant_member
    | list_variant_member variant_member;
variant_member:
    CASE ID COLON declaration SEMI;
/* STATEMENT */
list_statement: // DONE
    statement 
    | list_statement statement;
statement: // 12/18
    declaration SEMI // DONE
    | expression SEMI // DONE
    | compound_assign SEMI // DONE
    | generic_body // DONE
    | SEMI // DONE
    /* SELECTION */
    | IF LPAREN expression RPAREN generic_body optional_if_suffix // DONE
    | SWITCH LPAREN value RPAREN LBRACE list_case_item RBRACE // DONE
    /* CONTROL FLOW */
    | BREAK SEMI // DONE
    | CONTINUE SEMI // DONE
    | BREAK INT SEMI
    | CONTINUE INT SEMI
    | RETURN expression SEMI // DONE
    /* LOOPS */
    | FOR LPAREN statement statement statement RPAREN generic_body optional_finally
    | FOR LPAREN declaration_pure IN value RPAREN generic_body optional_finally
    | WHILE LPAREN expression RPAREN generic_body optional_finally // DONE
    | DO generic_body WHILE LPAREN expression RPAREN optional_while_generic_body optional_finally // DONE
    /* EXCEPTIONS */
    | THROW value SEMI
    | TRY generic_body try_suffix;
/* SELECTION */
optional_if_suffix: // DONE
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
optional_while_generic_body: // DONE
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
    CATCH LPAREN declaration_pure RPAREN generic_body;
optional_finally: // DONE
    finally
    |;
finally: // DONE
    FINALLY generic_body;
/* TYPES */
type_signature:
    namespace type_suffix
    | CONST namespace type_suffix
    | AUTO
    | CONST AUTO
    | type_signature LPAREN list_type RPAREN;
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
    | list_declaration SEMI declaration;
declaration_pure: // DONE
    type_signature ID;
declaration: // 2/4
    declaration_pure // DONE
    | type_signature ID EQU expression // DONE
    | union
    | variant;
/* EXPRESSION */
list_expression:
    expression
    | list_expression COMMA expression;
optional_expression:
    expression
    |;
optional_list_expression:
    list_expression
    |;
expression: // 27/32
    value PLUS expression // DONE 
    | value MINUS expression // DONE 
    | value STAR expression // DONE 
    | value SLASH expression // DONE 
    | value MOD expression // DONE 
    | value TILDE expression // DONE 
    | value AMP expression // DONE 
    | value PIPE expression // DONE 
    | value CARET expression // DONE 
    | value LSHIFT expression // DONE 
    | value RSHIFT expression // DONE 
    | value ASHIFT expression // DONE
    | value EQU expression // DONE
    | NOT value // DONE
    | PLUS PLUS value // DONE
    | MINUS MINUS value // DONE
    | value PLUS PLUS // DONE
    | value MINUS MINUS // DONE
    | value AND expression // DONE
    | value OR expression // DONE
    | value IN value // DONE
    | value NOT IN value
    | value EE expression // DONE
    | value NE expression // DONE
    | value GE expression // DONE
    | value LE expression // DONE
    | value LT expression // DONE
    | value GT expression // DONE
    | value N_COAL expression // DONE
    | value QUE expression COLON expression
    | value QUE COLON expression
    | value AS type_signature
    | type_signature function_parameters optional_const EQU GT generic_body
    | value; // DONE
compound_assign: // DONE
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
value: // 5/15
    constant // DONE
    | ID // DONE
    | GLOBAL ID
    | THIS
    | namespace DOT ID
    | namespace DOT function_call
    | namespace DOT INIT LPAREN optional_list_expression RPAREN
    | function_call
    | value optional_chain DOT ID
    | value optional_chain DOT function_call
    | value optional_chain LBRACK expression RBRACK // DONE
    | value optional_chain LBRACK slice RBRACK // DONE
    | LBRACE list_expression RBRACE
    | LPAREN expression RPAREN // DONE
    | type_signature LPAREN expression RPAREN;
constant: // DONE
    BOOL { debug::log(drv.trace_parsing) << std::endl << "Parser push boolean: " << $1 << std::endl << std::endl; }
    | CHAR { debug::log(drv.trace_parsing) << std::endl << "Parser push char: '" << $1 << "' (" << ((int) $1) << ")" << std::endl << std::endl; } 
    | REAL { debug::log(drv.trace_parsing) << std::endl << "Parser push real: " << $1 << std::endl << std::endl; } 
    | INT { debug::log(drv.trace_parsing) << std::endl << "Parser push long: " << $1 << std::endl << std::endl; } 
    /* Lexer isn't handling `a + bi` (but will take `a+bi`), but should be able to treat it as `a + 0+bi` with an implicit cast */
    | CMPX { debug::log(drv.trace_parsing) << std::endl << "Parser push cmpx: " << *($1) << std::endl << std::endl; }
    | NULL { debug::log(drv.trace_parsing) << std::endl << "Parser push null" << std::endl << std::endl; }
    | STRING { debug::log(drv.trace_parsing) << std::endl << "Parser push string: \"" << $1 << "\"" << std::endl << std::endl; };
optional_chain:
    QUE
    | BANG
    |;
slice: // DONE
    optional_expression COLON optional_expression
    | optional_expression COLON optional_expression COLON expression;

%%
