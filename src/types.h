#pragma once
#include <memory>
#include <string>
#include "debug.h"
#include "utils.h"

typedef enum DataClass {
    NO_CLASS    = 0,
    INTEGRAL    = 1,
    REAL        = 2,
    COMPLEX     = 3,
    OBJECT      = 4
} DataClass;

typedef enum {
    BOOL, CHAR, U8, I8,
    U16, I16,
    U32, I32, R32, X32,
    U64, I64, R64, X64,
    VOID,
    LIST
} DataType;

class meta {
private:
    DataType data_type;
    DataClass data_class;
    std::string type_name;
    std::shared_ptr<meta> c_meta;
    int t_size;
    std::shared_ptr<meta> addChild(DataType dt, std::string ts) {
        if (dt == LIST) {
            int i = ts.rfind("[");
            int j = ts.rfind("]");
            if (j != i+1)
                t_size = std::stoi(ts.substr(i+1, j-i-1));
            return std::make_shared<meta>(ts.substr(0, i));
        }
        return nullptr;
    }
public:
    meta(DataType dataType, std::string typeName, std::shared_ptr<meta> c_meta = nullptr) {
        data_type = dataType;
        data_class = meta::dataClass(dataType);
        type_name = typeName;
        //if (!c_meta) debug::log() << "Initialized with nullptr" << std::endl;
        this->c_meta = c_meta;
        t_size = meta::size(dataType);
    }
    meta(std::string typeString) {
        data_type = typeFromString(typeString);
        /*if (data_type == STRUCT || data_type == CLASS) 
            type_name = typeString.substr(0, typeString.length() - 2);
        else*/ 
        type_name = typeString;
        data_class = meta::dataClass(data_type);
        t_size = 0;
        c_meta = addChild(data_type, typeString);
        t_size = meta::size(data_type);
    }
    meta(std::shared_ptr<meta> c_meta) {
        data_type = LIST;
        data_class = meta::dataClass(LIST);
        type_name = c_meta->name();
        type_name += "[]";
        this->c_meta = c_meta;
        t_size = meta::size(data_type);
    }
    inline DataType type() const { return data_type; }
    inline std::string name() const { return type_name; }
    inline std::shared_ptr<meta> child() const { return c_meta; }
    inline DataClass dataClass() const { return data_class; }
    inline int size() const { return t_size; }

    inline void setChild(std::shared_ptr<meta> child) { c_meta = child; }
    inline void setSize(int sz) { t_size = sz; }

    static std::string string(DataType type) {
        switch (type) {
            case BOOL:  return "bool";
            case CHAR:  return "char";
            case U8:    return "u8";
            case I8:    return "i8";
            case U16:   return "u16";
            case I16:   return "i16";
            case U32:   return "u32";
            case I32:   return "i32";
            case R32:   return "r32";
            case X32:   return "x32";
            case U64:   return "u64";
            case I64:   return "i64";
            case R64:   return "r64";
            case X64:   return "x64";
            case VOID:  return "void";
            case LIST:  return "list";
        }
    }
    static DataType typeFromString(std::string s) {
        if (s.back() == ']')    return LIST;
        else if (s == "bool")   return BOOL;
        else if (s == "char")   return CHAR;
        else if (s == "u8")     return U8;
        else if (s == "i8")     return I8;
        else if (s == "u16")    return U16;
        else if (s == "i16")    return I16;
        else if (s == "u32")    return U32;
        else if (s == "i32")    return I32;
        else if (s == "r32")    return R32;
        else if (s == "x32")    return X32;
        else if (s == "u64")    return U64;
        else if (s == "i64")    return I64;
        else if (s == "r64")    return R64;
        else if (s == "x64")    return X64;
        else if (s == "void")   return VOID;
        else return VOID;
    }
    static DataClass dataClass(DataType type) {
        switch(type) {
            case BOOL:
            case CHAR:
            case U8:
            case I8:
            case U16:
            case I16:
            case U32:
            case I32:
            case U64:
            case I64:
                return INTEGRAL;
            case R32:
            case R64:
                return REAL;
            case X32:
            case X64:
                return COMPLEX;
            case VOID:
                return NO_CLASS;
            default:
                return OBJECT;
        }
    }
    static int size(DataType type) {
        switch (type) {
            case BOOL:
            case CHAR:
            case U8:
            case I8:
                return 1;
            case U16:
            case I16:
                return 2;
            case U32:
            case I32:
            case R32:
                return 4;
            case X32:
            case U64:
            case I64:
            case R64:
                return 8;
            case X64:
                return 16;
            default:
                return 0;
        }
    }

    std::string short_string() {
        switch (data_type) {
            case BOOL:  return "b";
            case CHAR:  return "c";
            case U8:    return "u8";
            case I8:    return "i8";
            case U16:   return "u16";
            case I16:   return "i16";
            case U32:   return "u32";
            case I32:   return "i32";
            case R32:   return "r32";
            case X32:   return "x32";
            case U64:   return "u64";
            case I64:   return "i64";
            case R64:   return "r64";
            case X64:   return "x64";
            case VOID:  return "v";
            case LIST:  return child()->short_string() + "l";
        }
    }
    std::string to_string() {
        if (type() == LIST) {
            return child()->to_string() + "[" + std::to_string(size()) + "]";
        }
        /*
        else if (type() == POINTER){
            return child()->to_string() + "*";
        }
        else if (type() == CLASS)
            return name() + "()";
        else if (type() == STRUCT)
            return name() + "{}";*/
        else return string(type());
    }
    void print(std::ostream& out, size_t indent = 0, std::string pre = "") const {
        out << utils::prefix("\t", indent) << pre;
        //debug::log() << "meta print!" << std::endl;
        //debug::log() << "asdlfjk222" << std::endl;
        //debug::log() << meta::string(type()) << std::endl;
        //debug::log() << "asdlfjk" << std::endl;
        if (type() == LIST) {
            //debug::log() << "meta array!" << std::endl;
            if (child())
                child()->print(out, indent, pre);
            else out << "list";
            out << "[" << size() << "]";
        }/*
        else if (type() == POINTER){
            child()->print(out, indent, pre);
            out << "*";
        }
        else if (type() == CLASS)
            out << name() + "()";
        else if (type() == STRUCT)
            out << name() + "{}";*/
        else out << meta::string(type());
    }

    friend bool operator==(const meta& l, const meta& r) {
        bool t = l.type() == r.type();
        if (t && (l.type() == LIST /*|| l.type() == POINTER*/))
            return *l.child() == *r.child();
        /*
        if (t && (l.type() == STRUCT || l.type() == CLASS))
            return l.name() == r.name();*/
        return t;
    }
    friend bool operator!=(const meta& l, const meta& r) { return !(l == r); }
    friend std::ostream& operator<<(std::ostream& o, const meta& m) {
        m.print(o);
        return o;
    }
    static bool canCast(std::shared_ptr<meta> to, std::shared_ptr<meta> from) {
        return 
            from->dataClass() != OBJECT
            && to->dataClass() != OBJECT 
            && from->dataClass() <= to->dataClass() 
            && meta::size(from->type()) <= meta::size(to->type());
    }
};
