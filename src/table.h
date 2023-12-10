#pragma once
#include <iostream>
#include <iomanip>
#include <string>
#include <memory>
#include <vector>
#include "debug.h"
#include "types.h"
#include "node.h"
#include <string.h>
#include "symbol.h"

typedef enum ScopeAccess {
    GLOBAL,
    PUBLIC,
    PROTECTED,
    PRIVATE
} ScopeAccess;

typedef enum ScopeType {
    PROGRAM_SCOPE,
    FUNCTION_SCOPE,
    CLASS_SCOPE
} ScopeType;

class table {
private:
    std::vector<std::shared_ptr<symbol>> symbols;
    std::shared_ptr<table> parent_table;
    ScopeType scope_type;
    ScopeAccess sa_type;
    std::string o_name;
    bool updated_size;
    std::shared_ptr<symbol> removeAt(int i) {
        std::shared_ptr<symbol> ret = symbols[i];
        symbols[i] = symbols.back();
        symbols.pop_back();
        return ret;
    }
public:
    table(std::shared_ptr<table> parent = nullptr) {
        symbols = std::vector<std::shared_ptr<symbol>>();
        parent_table = parent;
        scope_type = PROGRAM_SCOPE;
        sa_type = GLOBAL;
        o_name = "[No Owner]";
    }
    table(std::string owner, std::shared_ptr<table> parent) {
        symbols = std::vector<std::shared_ptr<symbol>>();
        parent_table = parent;
        scope_type = PROGRAM_SCOPE;
        sa_type = GLOBAL;
        o_name = owner;
    }
    table(std::string owner, std::shared_ptr<table> parent, ScopeType scope, ScopeAccess access) {
        symbols = std::vector<std::shared_ptr<symbol>>();
        parent_table = parent;
        scope_type = scope;
        sa_type = access;
        o_name = owner;
    }

    inline int size() const { return symbols.size(); }
    inline std::shared_ptr<table> parent() const { return parent_table; }
    inline ScopeType type() const { return scope_type; }
    inline ScopeAccess scope() const { return sa_type; }
    inline std::string owner() const { return o_name; }
    inline bool updated() const { return updated_size; }
    
    inline void update() { updated_size = true; }
    inline void setOwner(std::string name) { o_name = name; }

    int insert(std::shared_ptr<symbol> symbol) {
        //debug::log() << "Inserting in " << owner() << ":" << std::endl;
        //symbol->print(debug::log()); 
        //debug::log() << std::endl;
        int i = 0;
        for(; i < size(); i++)
            if (*at(i) == *symbol) {
                std::cerr << "Error: duplicate symbol: " << symbol->name() << "!" << std::endl;
                exit(1);
            }
        symbols.push_back(symbol);
        //debug::log() << "Inserted in " << owner() << ":" << std::endl;
        //symbols.at(size() - 1)->print(debug::log()); 
        //debug::log() << std::endl;
        return size() - 1;
    }
    int create(std::string name, std::string type) {
        return insert(std::make_shared<symbol>(
            name, type, std::make_shared<meta>(type)));
    }
    int index(std::string name) const {
        for (int i = 0; i < size(); i++)
            if (*symbols[i] == name) {
                symbols[i]->inclc();
                return i;
            }
        return -1;
    }
    std::shared_ptr<symbol> at(int i) {
        return symbols[i];
    }
    std::shared_ptr<symbol> last() {
        return symbols.back();
    }

    int space() const {
        int sum = 0;
        for (auto s: symbols)
            sum += s->size();
        return sum;
    }

    std::shared_ptr<symbol> find(std::string name) const {
        int i = index(name);
        if (i >= 0) return symbols.at(i);
        else return nullptr;
    }
    std::shared_ptr<symbol> remove(std::string name) {
        int i = index(name);
        if (i < 0) return nullptr;
        return removeAt(i);
    }
    std::shared_ptr<std::vector<int>> queryPrefix(std::string pre) const {
        std::shared_ptr<std::vector<int>> results = std::make_shared<std::vector<int>>(std::vector<int>());
        for (int i = 0; i < size(); i++) {
            if (strncmp(symbols[i]->name().c_str(), pre.c_str(), pre.length()) == 0) {
                results->push_back(i);
            }
        }
        return results;
    }
    
    bool merge(std::shared_ptr<table> src) {
        if (!src) return true;
        if (updated() || src->updated()) return false;
        //debug::log() << "merge ";
        //src->print(debug::log());
        //debug::log() << "into ";
        //print(debug::log());
        for (int i = 0; i < src->size(); i++)
            insert(src->removeAt(i));
        return true;
    }
    bool copy(std::shared_ptr<table> src) {
        if (!src) return true;
        if (updated() || src->updated()) return false;
        for (int i = 0; i < src->size(); i++)
            insert(src->at(i));
        return true;
    }

    static std::shared_ptr<table> scope(std::shared_ptr<table> start, std::string name,
        ScopeType stopAtScope=PROGRAM_SCOPE, ScopeAccess stopAtAccess=GLOBAL) {
        //start->print(debug::log());
        //debug::log() << std::endl;
        int i = start->index(name);
        if (i >= 0) return start;
        else if (
            //x -> y = !x | y
            start->type() != stopAtScope
            && start->scope() != stopAtAccess
            && start->parent()) 
            return table::scope(start->parent(), name, stopAtScope, stopAtAccess);
        else {
            debug::exit(debug::err() << "Error: symbol '" << name << "' does not exist in reachable scope!" << std::endl);
        }
        return nullptr;
    }
    static std::shared_ptr<table> top(std::shared_ptr<table> start) {
        std::shared_ptr<table> ret = start;
        while(ret->parent_table)
            ret = ret->parent_table;
        return ret;
    }
    static std::string string(ScopeAccess sa) {
        switch(sa) {
            case GLOBAL:    return "Global";
            case PUBLIC:    return "Public";
            case PROTECTED: return "Protected";
            case PRIVATE:   return "Private";
        }
    }
    static std::string string(ScopeType so) {
        switch (so) {
            case PROGRAM_SCOPE:     return "Program";
            case FUNCTION_SCOPE:    return "Function";
            case CLASS_SCOPE:       return "Class";
        }
    }
    bool classTable() {
        return type() == CLASS_SCOPE && 
            (scope() == PUBLIC || scope() == PRIVATE);
    }

    const std::shared_ptr<symbol> operator[](size_t i) const { return symbols.at(i); }
    
    void print(std::ostream& out, size_t indent = 0, std::string pre = "") const {
        out << utils::prefix("\t", indent) + pre;
        out << "Owner: " << owner() << " | ";
        out << "Scope: " << table::string(type()); 
        out << " " << table::string(scope());
        if (size() <= 0) { out << " | [No Symbols]" << std::endl; return; }
        else out << std::endl;
        for (int i = 0; i < symbols.size(); i++) {
            symbols.at(i)->print(out, indent, pre);
        }
    }
};
