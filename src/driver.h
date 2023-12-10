#pragma once
#include <stack>
#include "parser.tab.hh"
#include "table.h"

# define YY_DECL yy::parser::symbol_type yylex (driver& drv)

YY_DECL;

class driver {
private:
    // The name of the file being parsed.
    std::string s_file;
    // code stack
    std::shared_ptr<std::stack<std::shared_ptr<node>>> s_code;
    // data stack
    std::shared_ptr<list> l_data;
    // global table
    std::shared_ptr<table> t_globals;
    // current table
    std::shared_ptr<table> t_current;
public:
    driver ()
    : trace_parsing (false), trace_scanning (false) {
        s_code = std::make_shared<std::stack<std::shared_ptr<node>>>();
        l_data = std::make_shared<list>();
        t_globals = std::make_shared<table>();
        new_scope();
    }

    std::shared_ptr<std::stack<std::shared_ptr<node>>> code() const { return s_code; }
    std::shared_ptr<list> data() const { return l_data; }
    std::shared_ptr<table> globals() const { return t_globals; }
    std::shared_ptr<table> current() const { return t_current; }
    const std::string& file() const { return s_file; }

    void setCurrent(std::shared_ptr<table> newTable) {
        if (t_current->size() > 0)
            t_globals->merge(t_current);
        t_current = newTable;
    }
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
    // create new table
    void new_scope() {
        t_current = std::make_shared<table>(t_globals);
    }
    // merge current to global and create new current
    void merge() {
        t_globals->merge(t_current);
        new_scope();
    }
    // Handling the scanner.
    void scan_begin ();
    void scan_end ();
    
};
