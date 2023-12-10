#pragma once
#include <iomanip>
#include "types.h"

class symbol {
private:
    std::string s_name;
    std::string s_type;
    int s_loc;
    int s_size;
    int s_lookupc;
    std::shared_ptr<meta> s_meta;
public:
    symbol(std::string name, std::string type, std::shared_ptr<meta> meta) {
        debug::log() << name << " " << type << " ";
        meta->print(debug::log());
        debug::log() << std::endl;
        s_name = name;
        s_type = type;
        s_meta = meta;
        s_loc = -1;
        s_size = s_lookupc = 0;
        //s_meta->print(debug::log());
        //type_meta()->print(debug::log());
    }
    symbol(std::string name, std::shared_ptr<meta> meta) : symbol(name, meta->to_string(), meta) {}
    
    inline std::string name() const { return s_name; }
    inline std::string type() const { return s_type; }
    inline int location() const { return s_loc; }
    inline int size() const { return s_size; }
    inline int lookupc() const { return s_lookupc; }
    inline std::shared_ptr<meta> type_meta() const { return s_meta; }

    inline void setLocation(int loc) { s_loc = loc; }
    inline void setSize(int sz) { s_size = sz; }

    //increment lookup count
    inline void inclc() { s_lookupc++; }

    friend bool operator==(const symbol& l, const std::string& s) {
        return l.name() == s;
    }
    friend bool operator==(const std::string& s, const symbol& r) {
        return r == s;
    }
    friend bool operator==(const symbol& l, const symbol& r) {
        return l == r.name();
    }
    friend bool operator!=(const symbol& l, const symbol& r) {return l != r;}
    friend bool operator!=(const symbol& l, const std::string& s) {
        return l.name() != s;
    }
    friend bool operator!=(const std::string& s, const symbol& r) {
        return r != s;
    }

    virtual void print(std::ostream& out, size_t indent = 0, std::string pre = "") const {
        out << utils::prefix("\t", indent) + pre;
        out << "NAME: " << std::left << std::setw(10) << name();
        out << " TYPE: " << std::left  << std::setw(10) << type();
        out << " LOC: " << std::left  << std::setw(5) << std::to_string(location());
        out << " SIZE: " << std::to_string(size());
        out << " META: ";
        if (!type_meta()) debug::log() << "null meta!" << std::endl;
        type_meta()->print(out);
        out << std::endl;
    }
};
