#pragma once
#include "derived-symbols.h"

class generator {
private:
    std::shared_ptr<table> t_symbols;
    std::shared_ptr<list> l_data;
    std::ostream* out_file;
public:
    generator(std::shared_ptr<table> symbols, std::shared_ptr<list> data, std::ostream& out) {
        t_symbols = symbols;
        l_data = data;
        out_file = &out;
    }
    std::shared_ptr<table> symbols() const { return t_symbols; }
    std::shared_ptr<list> data() const { return l_data; }
    std::ostream& out() const { return *out_file; }

    virtual void generate() const { out() << "; base generator" <<std::endl;}
    static void updateTable(std::shared_ptr<generator> gen, std::shared_ptr<table> t) {
        if (t->updated()) return;
        t->update();
        for (int i = 0; i < t->size(); i++) {
            std::shared_ptr<symbol> s = t->at(i);
            if (auto fs = std::dynamic_pointer_cast<func>(s)) {
                updateTable(gen, fs->symbols());
                fs->setSize(fs->type_meta()->size());
            }
            else {
                s->setSize(s->type_meta()->size());
            }
            if (i == 0) s->setLocation(s->size());
            else s->setLocation(t->at(i-1)->location() + s->size());
        }
    }
};

class default_generator: virtual public generator {
public:
    default_generator(std::shared_ptr<table> symbols, 
        std::shared_ptr<list> data, std::ostream& out
    ) : generator(symbols, data, out) {}

    virtual void generate() const {
        out() << ";Default Generator:" << std::endl << std::endl;
        out() << ";Global Symbols:" << std::endl;
        symbols()->print(out(), 0, ";");
        out() << std::endl << std::endl;
        out() << ";Data:" << std::endl;
        data()->print(out(), 0, ";");
        out() << std::endl;
    }
};
