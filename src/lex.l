%{ /* -*- C++ -*- */
    #include <cerrno>
    #include <climits>
    #include <cstdlib>
    #include <cstring> // strerror
    #include <string>
    #include <string.h>
    #include "driver.h"
    #include "parser.tab.hh"
    #include "cmpx.h"
%}

%option nounput noinput batch debug

%{
    yy::parser::symbol_type make_CHAR(const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_BOOL(const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_CMPX(const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_REAL(const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_INT (const std::string &s, const yy::parser::location_type& loc);
    yy::parser::symbol_type make_HEX (const std::string &s, const yy::parser::location_type& loc);
%}

id      [a-zA-Z][a-zA-Z_0-9]*
int     0|(\+|-)?[1-9][0-9]*
hex     0x[0-9a-fA-F]+ 
blank   [ \t\r]
type    int|float|void|char|bool|long
char    '([^\\"]|\\.)'
real    ((\+|-)?([0-9]+\.[0-9]+|inf)|NaN)
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
{char}  return make_CHAR                (yytext, loc);
const   return yy::parser::make_CONST   (loc);
var     return yy::parser::make_VAR     (loc);
return  return yy::parser::make_RETURN  (loc);
{bool}  return make_BOOL                (yytext, loc);
{cmpx}  return make_CMPX                (yytext, loc);
{real}  return make_REAL                (yytext, loc);
{int}   return make_INT                 (yytext, loc);
{hex}   return make_HEX                 (yytext, loc);
{type}  return yy::parser::make_TYPE    (yytext, loc);
{id}    return yy::parser::make_ID      (yytext, loc);
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
"+="    return yy::parser::make_PL_EQU  (loc);
"-="    return yy::parser::make_MIN_EQU (loc);
"*="    return yy::parser::make_ST_EQU  (loc);
"/="    return yy::parser::make_SL_EQU  (loc);
"%="    return yy::parser::make_MD_EQU  (loc);
"~="    return yy::parser::make_TL_EQU  (loc);
"&="    return yy::parser::make_AM_EQU  (loc);
"|="    return yy::parser::make_PI_EQU  (loc);
"^="    return yy::parser::make_CAR_EQU (loc);
"<<="   return yy::parser::make_LS_EQU  (loc);
">>="   return yy::parser::make_RS_EQU  (loc);
">>>="  return yy::parser::make_AS_EQU  (loc);
"{"     return yy::parser::make_LBRACE  (loc);
"}"     return yy::parser::make_RBRACE  (loc);
"("     return yy::parser::make_LPAREN  (loc);
")"     return yy::parser::make_RPAREN  (loc);
";"     return yy::parser::make_SEMI    (loc);
.       { throw yy::parser::syntax_error(loc, "invalid character: " + std::string(yytext));}
<<EOF>> return yy::parser::make_YYEOF (loc);
%%

yy::parser::symbol_type make_CHAR(const std::string &s, const yy::parser::location_type& loc) {
    return yy::parser::make_CHAR(s.substr(1, s.length() - 1)[0], loc);
}

yy::parser::symbol_type make_BOOL(const std::string &s, const yy::parser::location_type& loc) {
    if (s == "true") return yy::parser::make_BOOL(true, loc);
    else return yy::parser::make_BOOL(false, loc);
}

yy::parser::symbol_type make_CMPX(const std::string &s, const yy::parser::location_type& loc) {
    int i = strcspn(s.c_str(), "+-"); // index of first + or -
    i = 1 + strcspn(s.c_str() + i + 1, "+-"); // index of second + or -
    if (i < s.length()) {
        double r = strtod(s.substr(0, i).c_str(), NULL);
        double m = strtod(s.substr(i, s.length() - i - 1).c_str(), NULL);
        return yy::parser::make_CMPX (new cmpx(r, m), loc);
    }
    else {
        double m = strtod(s.c_str(), NULL);
        return yy::parser::make_CMPX (new cmpx(0.0, m), loc);
    }
}

yy::parser::symbol_type make_REAL(const std::string &s, const yy::parser::location_type& loc) {
    errno = 0;
    double n = strtod(s.c_str(), NULL);
    return yy::parser::make_REAL (n, loc);
}

yy::parser::symbol_type make_INT (const std::string &s, const yy::parser::location_type& loc) {
    errno = 0;
    long n = strtol(s.c_str(), NULL, 10);
    if (! (INT_MIN <= n && n <= INT_MAX && errno != ERANGE))
        throw yy::parser::syntax_error (loc, "integer is out of range: " + s);
    return yy::parser::make_INT ((int) n, loc);
}

yy::parser::symbol_type make_HEX (const std::string &s, const yy::parser::location_type& loc) {
    errno = 0;
    long n = strtol(s.c_str(), NULL, 16);
    if (! (LONG_MIN <= n && n <= LONG_MAX && errno != ERANGE))
        throw yy::parser::syntax_error (loc, "long is out of range: " + s);
    return yy::parser::make_INT (n, loc);
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
