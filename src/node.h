#pragma once
#include "types.h"
#include <vector>

class node {
private:
    std::shared_ptr<meta> t_meta;
public:
    node(std::shared_ptr<meta> m) { 
        if (!m) debug::exit(debug::err() << "Null meta!");
        t_meta = m; }
    std::shared_ptr<meta> type_meta() const { return t_meta; }
    void setMeta(std::shared_ptr<meta> m) { t_meta = m; }

    virtual void print(std::ostream& out, size_t indent=0, std::string pre="") const {
        //debug::log() << "node print!" << std::endl;
        out << utils::prefix("\t", indent) << pre;
        //debug::log() << "node print2!" << std::endl;
        type_meta()->print(out);
    }
};

template <typename T>
class constant : virtual public node {
private:
    T t_value;
public:
    constant(T value, std::shared_ptr<meta> m) : node(m) { this->t_value = value; }
    virtual T value() const { return t_value; }
    virtual void setValue(T value) { this->t_value = value; }

    virtual void print(std::ostream& out, size_t indent=0, std::string pre="") const {
        node::print(out, indent, pre);
        out << " " << t_value;
    }
};

class string_constant: virtual public node {
private:
    std::string val;
    std::string escape(std::string s) {
        std::string ret = "";
        for (int i = 0; i < s.length(); i++) {
            if (s[i] == '\\')
                if (s[i+1] == '\\') {
                    ret += "\\\\";
                    i++; continue;
                }
                else
                    ret += "\\\\";
            else
                ret += s[i];
        }
        return ret;
    }
public:
    string_constant(std::string name) : node (std::make_shared<meta>("string")) {
        val = escape(name);
    }

    std::string value() const { return val; }

    void setValue(std::string val) {
        this->val = escape(val);
    }

    void print(std::ostream& out, size_t indent=0, std::string pre="") const {
        out << "\"" << val << "\"";
    }
};

class list: virtual public node {
private:
    std::vector<std::shared_ptr<node>> members;
public:
    list(std::shared_ptr<meta> type = std::make_shared<meta>(LIST, meta::string(LIST)))
     : node(type) { 
        members = std::vector<std::shared_ptr<node>>(); 
    }
    list(std::shared_ptr<node> first) : node(std::make_shared<meta>(first->type_meta())) {
        if (!first) debug::err() << "null first!" << std::endl;
        members.push_back(first);
    }
    
    size_t length() const { return members.size(); }

    int append(std::shared_ptr<node> node) { 
        if (!node) debug::err() << "null append!" << std::endl;
        members.push_back(node); 
        return members.size() - 1; 
    }
    void extend(std::shared_ptr<list> src) {
        for (auto e: src->members) {
            if (!e) debug::err() << "null extend!" << std::endl;
            members.push_back(e);
        }
        src->members.clear();
    }

    std::shared_ptr<node> at(size_t i) { return members.at(i); }

    void print(std::ostream& out, size_t indent=0, std::string pre="") const {
        //debug::log() << "here!" << std::endl;
        node::print(out, indent, pre);
        out << " : " << length() << "[" << std::endl;
        for (auto m: members) {
            m->print(out, indent+1, pre);
            out << std::endl;
        }
        if (length() <= 0) out << utils::prefix("\t", indent+1) << pre << "no members" << std::endl;
        out << utils::prefix("\t", indent) << pre << "]" << std::endl;
    }
};

class type_node: virtual public node {
public:
    type_node(std::shared_ptr<meta> type) : node(type) {
        if (!type) {
            debug::exit(debug::err() << "type_node must be created with a TypeMeta argument!");
        }
    }

    void print(std::ostream& out, size_t indent=0, std::string pre="") const {
        out << utils::prefix("\t", indent) << pre;
        node::print(out);
    }
};

class ID: virtual public node {
private:
    std::string id;
public:
    ID(std::string name, std::shared_ptr<meta> t) : node(t) {
        id = name;
    }
    std::string name() const { return id; }
    void setName(std::string name) { id = name; }

    void print(std::ostream& out, size_t indent=0, std::string pre="") const {
        out << utils::prefix("\t", indent) << pre << name();
    }
};

typedef enum {
    //arithmetic
    ADD, SUB, MUL, DIV, MOD,
    //bitwise
    BNOT, BAND, BOR, BXOR,
    //shift
    LSL, LSR, ASR,
    //assign
    EQU,
    //boolean
    LNOT, LAND, LOR,
    //comparison
    EE, NE, GE, LE, LT, GT,
    //cast
    CAST,
    //return
    RET,
    //function call
    CALL
} ExprType;

typedef enum {
    ARITH,
    BITS,
    ASSGN,
    COMP,
    PROC
} ExprClass;

class expr: virtual public node {
private:
    std::shared_ptr<node> left_arg;
    std::shared_ptr<node> right_arg;
    ExprType e_type;
    static void rotate(expr* e) {
        expr* er = dynamic_cast<expr*>(&(*(e->right_arg)));
        if (!er) return;
        ExprType et = e->e_type;
        std::shared_ptr<node> l = e->left_arg;
        e->right_arg = er->right_arg;
        e->e_type = er->e_type;
        e->left_arg = std::make_shared<expr>(et, l, er->left_arg);
    }
    std::shared_ptr<meta> eval() {
        std::shared_ptr<meta> ret;
        switch (eclass()) {
            case ARITH:
                if (std::shared_ptr<expr> e = std::dynamic_pointer_cast<expr>(right_arg)) {
                    if ((e_type == MUL || e_type == DIV || e_type == MOD) 
                        && (e->e_type == ADD || e->e_type == SUB)) {
                        rotate(this);
                    }
                }
                if (*(left_arg->type_meta()) != *(right_arg->type_meta())) {
                    if (meta::canCast(left_arg->type_meta(), right_arg->type_meta())) {
                        right_arg = std::make_shared<expr>(CAST, 
                            std::make_shared<type_node>(left_arg->type_meta()),
                            right_arg);
                    }
                    else if (meta::canCast(right_arg->type_meta(), left_arg->type_meta())) {
                        left_arg = std::make_shared<expr>(CAST, 
                            std::make_shared<type_node>(right_arg->type_meta()),
                            left_arg);
                    }
                    else debug::exit(debug::err() << "TypeError: Impossible to cast between "
                        << *left_arg->type_meta() << " and " << *right_arg->type_meta() << "!");
                }
                ret = left_arg->type_meta();
            case BITS:
                if (right_arg->type_meta()->dataClass() != INTEGRAL
                    || (left_arg && left_arg->type_meta()->dataClass() != INTEGRAL))
                    debug::exit(debug::err() << "TypeError: Bitwise operations are only valid for integral types!");
                if (left_arg) ret = left_arg->type_meta();
                else ret = right_arg->type_meta();
                break;
            case ASSGN:
                ret = left_arg->type_meta();
                if (right_arg) {
                    if (*left_arg->type_meta() != *right_arg->type_meta()) {
                        if (meta::canCast(left_arg->type_meta(), right_arg->type_meta()))
                            right_arg = std::make_shared<expr>(CAST, 
                                std::make_shared<type_node>(left_arg->type_meta()),
                                right_arg);
                        else debug::exit(debug::err() << "TypeError: Impossible to cast "
                            << *right_arg->type_meta() << " to " << *left_arg->type_meta() << "!");
                    }
                }
            case COMP:
                ret = std::make_shared<meta>("bool");
                break;
            case PROC:
                ret = left_arg->type_meta();
                break;
        }
        return ret;
    }
public:
    expr(ExprType etype, std::shared_ptr<node> left, std::shared_ptr<node> right) 
        : node(std::make_shared<meta>("int")) {
        left_arg = left;
        right_arg = right;
        e_type = etype;
        setMeta(eval());
    }
    std::shared_ptr<node> left() const { return left_arg; }
    std::shared_ptr<node> right() const { return right_arg; }
    ExprType etype() const { return e_type; }
    ExprClass eclass() const {
        if (e_type <= MOD) return ARITH;
        else if (e_type >= BNOT && e_type <= ASR) return BITS;
        else if (e_type == EQU) return ASSGN;
        else if (e_type >= EE && e_type <= GT) return COMP;
        else return PROC;
    }
    void setLeft(std::shared_ptr<node> left) { left_arg = left; setMeta(eval()); }
    void setRight(std::shared_ptr<node> right) { right_arg = right; setMeta(eval()); }
    void setType(ExprType type) { e_type = type; }
    static std::string string(ExprType et) {
        switch (et) {
            //arithmetic
            case ADD:   return "+";
            case SUB:   return "-";
            case MUL:   return "*";
            case DIV:   return "/";
            case MOD:   return "%";
            //bitwise
            case BNOT:  return "~";
            case BAND:  return "&";
            case BOR:   return "|";
            case BXOR:  return "^";
            //shift
            case LSL:   return "<<";
            case LSR:   return ">>";
            case ASR:   return ">>>";
            //assign
            case EQU:   return "=";
            //boolean
            case LNOT:  return "not";
            case LAND:  return "and";
            case LOR:   return "or";
            //comparison
            case EE:    return "==";
            case NE:    return "!=";
            case GE:    return ">=";
            case LE:    return "<=";
            case LT:    return "<";
            case GT:    return ">";
            //cast
            case CAST:  return "cast";
            case RET:   return "return";
            case CALL:  return "call";
        }
    }
    
    void print(std::ostream& out, size_t indent=0, std::string pre="") const {
        out << utils::prefix("\t", indent) << pre << "(";
        node::print(out);
        out << " " << expr::string(etype()) << std::endl;
        if (left()) {
            left()->print(out, indent+1, pre); 
            out << std::endl;
        }
        if (right()) {
            right()->print(out, indent+1, pre); 
            out << std::endl;
        }
        out << utils::prefix("\t", indent) << pre << ")";
    }
};

class declaration: virtual public node {
private:
    std::shared_ptr<meta> t_meta;
    std::shared_ptr<ID>   id;
public:
    declaration(std::shared_ptr<meta> type, std::shared_ptr<ID> name) : node(type) {
        t_meta = type;
        id = name;
    }
    declaration(std::shared_ptr<meta> type, std::string name) : node(type) {
        t_meta = type;
        id = std::make_shared<ID>(name, type);
    }
    std::shared_ptr<meta> type() const { return t_meta; }
    std::shared_ptr<ID> name() const { return id; } 

    void print(std::ostream& out, size_t indent=0, std::string pre="") const {
        type()->print(out, indent, pre);
        out << " ";
        name()->print(out);
    }
};
