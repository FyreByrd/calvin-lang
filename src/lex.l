%{ /* -*- C++ -*- */
    #include <cerrno>
    #include <climits>
    #include <cstdlib>
    #include <cstring> // strerror
    #include <string>
    #include <string.h>
    #include <set>
    #include <map>
    #include "driver.h"
    #include "parser.tab.hh"
    #include "cmpx.h"
%}

%option nounput noinput batch debug

%{
    yy::parser::symbol_type make_CHAR   (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_STRING (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_BOOL   (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_CMPX   (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_REAL   (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_INT    (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_HEX    (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_OCT    (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_BIN    (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_CLASS  (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_INTER  (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_ENUM   (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_TYPE   (const std::string &s, const yy::parser::location_type& loc);

    std::set<std::string> classes;
    std::set<std::string> inters;
    std::set<std::string> enums;
    std::set<std::string> types;
%}

id      [a-zA-Z][a-zA-Z_0-9]*
dig     [1-9]([0-9_]+[0-9]|[0-9])|[0-9]
int     (\+|-)?{dig}
hex     0x[0-9a-fA-F_]+ 
oct     0o[0-7_]+
bin     0b[0-1_]+
blank   [ \t\r]
type    char|bool|(i|u)(8|16|32|64)|(r|x)(32|64)|string
char    '([^\\"]|\\.)'
string  \"([^\\"]|\\.)*\"
real    ((\+|-)?({dig}\.[0-9]+|inf)|NaN)
cmpx    ({real}(\+|-))?{real}(i|j|I)
bool    true|false
comnt   \/\/[^\n]*
mcomnt  \/\*([^*]|(\*+[^*/]))*\*+\/

%{
    # define YY_USER_ACTION  loc.columns (yyleng);
%}

%%

%{
    yy::location& loc = drv.location;
    loc.step ();
%}

{comnt}     /*ignore comments*/;
{blank}+    loc.step();
\n+         loc.lines (yyleng); loc.step ();
{mcomnt}    /*ignore comments*/;
{string}    return make_STRING  (yytext, loc);
{char}  return make_CHAR                (yytext, loc);
const   return yy::parser::make_CONST   (loc);
static  return yy::parser::make_STATIC  (loc);
auto    return yy::parser::make_AUTO    (loc);
union   return yy::parser::make_UNION   (loc);
var     return yy::parser::make_VAR     (loc);
null    return yy::parser::make_NULL    (loc);
return  return yy::parser::make_RETURN  (loc);
not     return yy::parser::make_NOT     (loc);
and     return yy::parser::make_AND     (loc);
or      return yy::parser::make_OR      (loc);
"class "{id}    return make_CLASS       (yytext, loc);
this    return yy::parser::make_THIS    (loc);
public      return yy::parser::make_PUBLIC  (loc);
private     return yy::parser::make_PRIVATE     (loc);
protected   return yy::parser::make_PROTECTED   (loc);
extends     return yy::parser::make_EXTENDS     (loc);
"interface "{id}        return make_INTER   (yytext, loc);
implements  return yy::parser::make_IMPLEMENTS  (loc);
export  return yy::parser::make_EXPORT  (loc);
import  return yy::parser::make_IMPORT  (loc);
from    return yy::parser::make_FROM    (loc);
as      return yy::parser::make_AS      (loc);
"enum "{id} return make_ENUM    (yytext, loc);
"type "{id} return make_TYPE    (yytext, loc);
if      return yy::parser::make_IF      (loc);
elif    return yy::parser::make_ELIF    (loc);
else    return yy::parser::make_ELSE    (loc);
switch  return yy::parser::make_SWITCH  (loc);
case    return yy::parser::make_CASE    (loc);
default return yy::parser::make_DEFAULT (loc);
break   return yy::parser::make_BREAK   (loc);
continue    return yy::parser::make_CONTINUE    (loc);
for     return yy::parser::make_FOR     (loc);
while   return yy::parser::make_WHILE   (loc);
do      return yy::parser::make_DO      (loc);
{bool}  return make_BOOL                (yytext, loc);
{cmpx}  return make_CMPX                (yytext, loc);
{real}  return make_REAL                (yytext, loc);
{hex}   return make_HEX                 (yytext, loc);
{oct}   return make_OCT                 (yytext, loc);
{bin}   return make_BIN                 (yytext, loc);
{int}   return make_INT                 (yytext, loc);
{type}  return yy::parser::make_TYPE    (yytext, loc);
{id}    return yy::parser::make_ID      (yytext, loc);
"+="    return yy::parser::make_PL_EQU  (loc);
"-="    return yy::parser::make_MIN_EQU (loc);
"*="    return yy::parser::make_ST_EQU  (loc);
"/="    return yy::parser::make_SL_EQU  (loc);
"%="    return yy::parser::make_MD_EQU  (loc);
"~="    return yy::parser::make_TL_EQU  (loc);
"&="    return yy::parser::make_AM_EQU  (loc);
"|="    return yy::parser::make_PI_EQU  (loc);
"^="    return yy::parser::make_CR_EQU  (loc);
"<<="   return yy::parser::make_LS_EQU  (loc);
">>="   return yy::parser::make_RS_EQU  (loc);
">>>="  return yy::parser::make_AS_EQU  (loc);
"??="   return yy::parser::make_NC_EQU  (loc);
"=="    return yy::parser::make_EE      (loc);
"!="    return yy::parser::make_NE      (loc);
">="    return yy::parser::make_GE      (loc);
"<="    return yy::parser::make_LE      (loc);
"<"     return yy::parser::make_LT      (loc);
">"     return yy::parser::make_GT      (loc);
"+"     return yy::parser::make_PLUS    (loc);
"-"     return yy::parser::make_MINUS   (loc);
"*"     return yy::parser::make_STAR    (loc);
"/"     return yy::parser::make_SLASH   (loc);
"%"     return yy::parser::make_MOD     (loc);
"~"     return yy::parser::make_TILDE   (loc);
"&"     return yy::parser::make_AMP     (loc);
"|"     return yy::parser::make_PIPE    (loc);
"^"     return yy::parser::make_CARET   (loc);
"<<"    return yy::parser::make_LSHIFT  (loc);
">>"    return yy::parser::make_RSHIFT  (loc);
">>>"   return yy::parser::make_ASHIFT  (loc);
"="     return yy::parser::make_EQU     (loc);
"{"     return yy::parser::make_LBRACE  (loc);
"}"     return yy::parser::make_RBRACE  (loc);
"("     return yy::parser::make_LPAREN  (loc);
")"     return yy::parser::make_RPAREN  (loc);
"["     return yy::parser::make_LBRACK  (loc);
"]"     return yy::parser::make_RBRACK  (loc);
";"     return yy::parser::make_SEMI    (loc);
"?"     return yy::parser::make_QUE     (loc);
"!"     return yy::parser::make_BANG    (loc);
":"     return yy::parser::make_COLON   (loc);
"??"    return yy::parser::make_N_COAL  (loc);
","     return yy::parser::make_COMMA   (loc);
"."     return yy::parser::make_DOT     (loc);
.       { throw yy::parser::syntax_error(loc, "invalid character: " + std::string(yytext));}
<<EOF>> return yy::parser::make_YYEOF (loc);
%%

yy::parser::symbol_type make_CHAR(const std::string &s, const yy::parser::location_type& loc) {
    return yy::parser::make_CHAR(s.substr(1, s.length() - 1)[0], loc);
}

yy::parser::symbol_type make_STRING(const std::string &s, const yy::parser::location_type& loc) {
    return yy::parser::make_STRING(s.substr(1, s.length() - 1), loc);
}

yy::parser::symbol_type make_BOOL(const std::string &s, const yy::parser::location_type& loc) {
    if (s == "true") return yy::parser::make_BOOL(true, loc);
    else return yy::parser::make_BOOL(false, loc);
}

std::string filterUnderscores(const std::string& to) {
    std::string final;
    for(std::string::const_iterator it = to.begin(); it != to.end(); ++it) {
        if(*it != '_') {
            final += *it;
        }
    }
    return final;
}

yy::parser::symbol_type make_CMPX(const std::string &s, const yy::parser::location_type& loc) {
    std::string f = filterUnderscores(s);
    int i = strcspn(f.c_str(), "+-"); // index of first + or -
    i = 1 + strcspn(f.c_str() + i + 1, "+-"); // index of second + or -
    if (i < s.length()) {
        double r = strtod(f.substr(0, i).c_str(), NULL);
        double m = strtod(f.substr(i, s.length() - i - 1).c_str(), NULL);
        return yy::parser::make_CMPX (new cmpx(r, m), loc);
    }
    else {
        double m = strtod(f.c_str(), NULL);
        return yy::parser::make_CMPX (new cmpx(0.0, m), loc);
    }
}

yy::parser::symbol_type make_REAL(const std::string &s, const yy::parser::location_type& loc) {
    std::string f = filterUnderscores(s);
    double n = strtod(f.c_str(), NULL);
    return yy::parser::make_REAL (n, loc);
}

yy::parser::symbol_type make_INT (const std::string &s, const yy::parser::location_type& loc) {
    std::string f = filterUnderscores(s);
    long n = strtol(f.c_str(), NULL, 10);
    if (! (LONG_MIN <= n && n <= LONG_MAX && errno != ERANGE))
        throw yy::parser::syntax_error (loc, "long is out of range: " + s);
    return yy::parser::make_INT ((int) n, loc);
}

yy::parser::symbol_type make_HEX (const std::string &s, const yy::parser::location_type& loc) {
    std::string f = filterUnderscores(s);
    long n = strtol(f.c_str(), NULL, 16);
    if (! (LONG_MIN <= n && n <= LONG_MAX && errno != ERANGE))
        throw yy::parser::syntax_error (loc, "long is out of range: " + s);
    return yy::parser::make_INT (n, loc);
}

yy::parser::symbol_type make_OCT (const std::string &s, const yy::parser::location_type& loc) {
    std::string f = filterUnderscores(s);
    long n = strtol(f.c_str(), NULL, 8);
    if (! (LONG_MIN <= n && n <= LONG_MAX && errno != ERANGE))
        throw yy::parser::syntax_error (loc, "long is out of range: " + s);
    return yy::parser::make_INT (n, loc);
}

yy::parser::symbol_type make_BIN (const std::string &s, const yy::parser::location_type& loc) {
    std::string f = filterUnderscores(s);
    long n = strtol(f.c_str(), NULL, 2);
    if (! (LONG_MIN <= n && n <= LONG_MAX && errno != ERANGE))
        throw yy::parser::syntax_error (loc, "long is out of range: " + s);
    return yy::parser::make_INT (n, loc);
}

yy::parser::symbol_type make_CLASS(const std::string& s, const yy::parser::location_type& loc) {
    int i = s.find(" ");
    std::string name = s.substr(i+1);
    if (classes.count(name)) throw yy::parser::syntax_error (loc, "redefinition of class: " + name);
    if (inters.count(name)) throw yy::parser::syntax_error (loc, "redefinition of interface: " + name);
    if (enums.count(name)) throw yy::parser::syntax_error (loc, "redefinition of enum: " + name);
    if (types.count(name)) throw yy::parser::syntax_error (loc, "redefinition of type: " + name);
    
    classes.insert(name);
    return yy::parser::make_CLASS(name, loc);
}

yy::parser::symbol_type make_INTER(const std::string& s, const yy::parser::location_type& loc) {
    int i = s.find(" ");
    std::string name = s.substr(i+1);
    if (classes.count(name)) throw yy::parser::syntax_error (loc, "redefinition of class: " + name);
    if (inters.count(name)) throw yy::parser::syntax_error (loc, "redefinition of interface: " + name);
    if (enums.count(name)) throw yy::parser::syntax_error (loc, "redefinition of enum: " + name);
    if (types.count(name)) throw yy::parser::syntax_error (loc, "redefinition of type: " + name);
    
    inters.insert(name);
    return yy::parser::make_INTER(name, loc);
}

yy::parser::symbol_type make_ENUM(const std::string& s, const yy::parser::location_type& loc) {
    int i = s.find(" ");
    std::string name = s.substr(i+1);
    if (classes.count(name)) throw yy::parser::syntax_error (loc, "redefinition of class: " + name);
    if (inters.count(name)) throw yy::parser::syntax_error (loc, "redefinition of interface: " + name);
    if (enums.count(name)) throw yy::parser::syntax_error (loc, "redefinition of enum: " + name);
    if (types.count(name)) throw yy::parser::syntax_error (loc, "redefinition of type: " + name);
    
    enums.insert(name);
    return yy::parser::make_ENUM(name, loc);
}

yy::parser::symbol_type make_TYPE(const std::string& s, const yy::parser::location_type& loc) {
    int i = s.find(" ");
    std::string name = s.substr(i+1);
    if (classes.count(name)) throw yy::parser::syntax_error (loc, "redefinition of class: " + name);
    if (inters.count(name)) throw yy::parser::syntax_error (loc, "redefinition of interface: " + name);
    if (enums.count(name)) throw yy::parser::syntax_error (loc, "redefinition of enum: " + name);
    if (types.count(name)) throw yy::parser::syntax_error (loc, "redefinition of type: " + name);
    
    types.insert(name);
    return yy::parser::make_TYPEDEF(name, loc);
}

void driver::scan_begin () {
    yy_flex_debug = trace_scanning;
    if (s_file.empty() || s_file == "-")
        yyin = stdin;
    else if (!(yyin = fopen (s_file.c_str(), "r"))) {
        std::cerr << "cannot open " << s_file << ": " << strerror (errno) << '\n';
        exit (EXIT_FAILURE);
    }
}

void driver::scan_end () {
    fclose (yyin);
}

int yywrap() { return 1; }
