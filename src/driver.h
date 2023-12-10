#pragma once
#include <stack>
#include "parser.tab.hh"

# define YY_DECL yy::parser::symbol_type yylex (driver& drv)

YY_DECL;

class driver {
private:
    // The name of the file being parsed.
    std::string s_file;
public:
    driver ()
    : trace_parsing (false), trace_scanning (false) {}

    const std::string& file() const { return s_file; }

    void set_file(std::string fname) { s_file = fname; }

    int result;
    // Whether to generate scanner debug traces.
    bool trace_scanning;
    // Whether to generate parser debug traces.
    bool trace_parsing;
    // The token's location used by the scanner.
    yy::location location;

    // Run the parser on file F.  Return 0 on success.
    int parse (const std::string &f) {
        s_file = f;
        location.initialize (&s_file);
        scan_begin ();
        yy::parser parse (*this);
        parse.set_debug_level (trace_parsing);
        int res = parse ();
        scan_end ();
        return res;
    }

    // Handling the scanner.
    void scan_begin ();
    void scan_end ();
    
};
