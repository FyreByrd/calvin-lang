#pragma once
#include "table.h"

class func: virtual public symbol {
private:
    std::shared_ptr<table> t_symbols;
    std::shared_ptr<list> l_parms;
    std::shared_ptr<list> l_body;
    std::shared_ptr<list> l_epilogue;
    std::shared_ptr<table> t_strings;
    static std::shared_ptr<func> findVariadic(std::string sig, std::shared_ptr<table> scope) {
        //check for variadic variant
        std::shared_ptr<func> ret = nullptr;
        int l = sig.find(".");
        std::string name = sig.substr(0, l);
        if (l < sig.length()) {
            std::shared_ptr<std::vector<int>> results = scope->queryPrefix(name);
            for (int i = 0; i < results->size(); i++) {
                std::string result = scope->at(results->at(i))->name();
                if (result.back() == 'E') {
                    if (name.substr(0, result.length()-1) == result.substr(0, result.length()-1)) {
                        std::shared_ptr<symbol> s = scope->at(results->at(i));
                        ret = std::dynamic_pointer_cast<func>(s);
                        break;
                    }
                }
            }
        }
        return ret;
    }
public:
    func(std::string name, std::shared_ptr<meta> type, std::shared_ptr<list> parms) 
    : symbol(func::signature(name, parms), type) {
        t_symbols = std::make_shared<table>();
        l_parms = parms;
        //debug::log() << "here1" << std::endl;
        l_body = std::make_shared<list>();
        l_epilogue = std::make_shared<list>();
        //debug::log() << "here2" << std::endl;
        t_strings = std::make_shared<table>(this->name(), nullptr);
        //debug::log() << symbol::name() << std::endl;
    }

    std::shared_ptr<table> symbols() const { return t_symbols; }
    std::shared_ptr<list> parms() const { return l_parms; }
    std::shared_ptr<list> body() const { return l_body; }
    std::shared_ptr<list> epilogue() const { return l_epilogue; }
    std::shared_ptr<table> strings() const { return t_strings; }

    void addBody(std::shared_ptr<list> body) {
        for (int i = 0; i < body->length(); i++) {
            std::shared_ptr<expr> e = std::dynamic_pointer_cast<expr>(body->at(i));
            if (e && type_meta()->type() != VOID && e->etype() == RET) {
                if (*type_meta() != *e->type_meta())
                    e->setRight(std::make_shared<expr>(CAST,
                        std::make_shared<type_node>(type_meta()), e->right()));
            }
        }
        l_body = body;
    }
    void addSymbols(std::shared_ptr<table> symbols) {
        t_symbols = symbols;
    }

    virtual void print(std::ostream& out, size_t indent = 0, std::string pre = "") const {
        symbol::print(out, indent, pre);
        symbols()->print(out, indent+1, pre);
        out << std::endl;
        parms()->print(out, indent+1, pre);
        out << std::endl;
        body()->print(out, indent+1, pre);
        out << std::endl;
        epilogue()->print(out, indent+1, pre);
        out << std::endl;
        strings()->print(out, indent+1, pre);
        out << std::endl;
    }

    int stringConstant(std::string s) {
        int i = t_strings->index(s);
        if (i < 0) i = t_strings->create(s, "string");
        return i;
    }

    static std::string signature(std::string name, std::shared_ptr<list> parms) {
        std::string ret = name;

        debug::log() << "signature: " << std::endl;
        parms->print(debug::log(), 1);
        debug::log() << "start: " << ret << std::endl;

        if (parms->length() > 0) {
            for (int i = 0; i < parms->length(); i++) {
                ret += "." + parms->at(i)->type_meta()->short_string();
                debug::log() << "\t" << ret << std::endl;
            }
        }
        else ret += "." + meta::string(VOID);

        debug::log() << "end: " << ret << std::endl;

        //debug::log() << "sig: " << ret << std::endl;

        return ret;
    }

    static std::shared_ptr<func> find(std::shared_ptr<expr> fe, std::shared_ptr<table> definedScope) {
        if (fe->etype() != CALL) {
            debug::err() << "Error: ";
            fe->print(debug::err());
            debug::exit(debug::err() << " is not a function!");
        }
        std::shared_ptr<table> scope = definedScope;
        //scope->print(debug::log());
        //debug::log() << std::endl;
        std::string sig = std::dynamic_pointer_cast<ID>(fe->left())->name();
        std::shared_ptr<symbol> sym = scope->find(sig);
        
        if (!sym) sym = findVariadic(sig, scope);
        if (!sym && scope->scope() == PRIVATE) {
            scope = scope->parent();
            sym = scope->find(sig);
        }
        if (!sym) sym = findVariadic(sig, scope);
        if (!sym) debug::exit(debug::err() << "Error: function " << sig << " is not defined!");
        return std::dynamic_pointer_cast<func>(sym);
    }

    /*bool isMember() {
        if (symbols()->size() > 0) {
            auto s = symbols()->at(0);
            auto tm = meta(s->type());
            return (
                s->name() == "this"
                && tm.type() == POINTER && tm.child() 
                && tm.child()->type() == CLASS);
        }
        return false;
    }*/

    int variadicIndex() {
        std::string sig = name();
        debug::log() << "vi: " << sig << std::endl;
        int startParms = sig.find(".") + 1;
        debug::log() << "sp: " << startParms << std::endl;
        if (startParms < sig.length()) {
            int vi = 0;
            for (int i = startParms; i && i < sig.length(); i++) {
                debug::log() << sig << std::endl;
                debug::log() << "i: " << i << " " << sig[i] << " " << sig.length() << std::endl;
                if (sig[i] == 'e') return vi;
                else {
                    vi++;
                    i = sig.find(".", i);
                    if (i == sig.npos)
                        break;
                }
            }
        }
        return 0;
    }
};

