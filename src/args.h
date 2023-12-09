#pragma once
#include <algorithm>
#include <string>
#include <vector>
#include <array>
#include <memory>
#include <iomanip>
#include <string.h>
#include "debug.h"

typedef struct arg {
    std::string key;
    std::string value;
} arg;

typedef struct expect {
    std::string arg;
    bool option;
    std::string msg;
} expect;

void printExpects(std::vector<expect*> expects, std::vector<std::string*> orphans) {
    for (int i = 0; i < orphans.size(); i++) {
        std::cout << "[" << *orphans[i] << "]";
    }
    std::cout << std::endl << std::endl;
    for (int i = 0; i < expects.size(); i++) {
        std::cout  << "\t" << std::left << std::setw(30);
        if (expects[i]->arg.length() > 1) 
            std::cout << "--" + expects[i]->arg + (expects[i]->option ? "=[option] " : " ");
        else std::cout << "-" + expects[i]->arg + (expects[i]->option ? " [option] " : " ");
        std::cout << expects[i]->msg << std::endl << std::endl;
    }
    std::cout << std::endl;
}

/*
Argument option types:
string          (orphan)
-char           (exists)
-char string    (option)
--string        (exists)
--string=string (option)
*/
class args {
private:
    std::vector <arg> v_args;
    std::vector <std::string> v_orphans;
    expect* searchExpects(std::string val, std::vector<expect*> expects) {
        for (int i = 0; i < expects.size(); i++) {
            if (expects[i]->arg == val) return expects[i];
        }
        return nullptr;
    }
    std::string empty_string;
public:
    args (int &argc, char **argv, std::vector<expect*> expects){
        expect* e;
        empty_string = std::string("");
        for (int i=1; i < argc; ++i) {
            if (argv[i][0] == '-') {
                if (argv[i][1] == '-') {//multi character arguments
                    int l = strcspn(argv[i], "=");
                    std::string arg = std::string(argv[i]).substr(2, l-2);
                    e = searchExpects(arg, expects);
                    if (!e) debug::exit(debug::err()
                        << "ArgParseError: unexpected argument " << argv[i] << "!" << std::endl
                    );
                    if (!e->option) {
                        if (l == strlen(argv[i])) v_args.push_back({arg, empty_string});
                        else {
                            std::string opt = std::string(argv[i]).substr(l+1);
                            debug::exit(debug::err() <<
                            "Error: argument " << std::string(argv[i]).substr(0, l) <<
                            "received unexpected option '"<< opt
                            << "' !" << std::endl);}
                    }
                    else {
                        if (l+1 < std::string(argv[i]).length()) {
                            std::string opt = std::string(argv[i]).substr(l+1);
                            v_args.push_back({arg, opt});
                        }
                        else debug::exit(debug::err() <<
                            "Error: argument " << std::string(argv[i]).substr(0, l) <<
                            " requires an option!" << std::endl);
                    }
                }
                else { //single character arguments
                    int j = 1;
                    while (argv[i][j] != 0 && j > 0) {
                        std::string s = std::string(1, argv[i][j]);
                        e = searchExpects(s, expects);

                        if (!e) debug::exit(debug::err()
                            << "ArgParseError: unexpected argument -" << s << "!" << std::endl
                        );

                        if (!e->option) v_args.push_back({s, empty_string});
                        else if (i+1 < argc && argv[i][j+1] == 0) {
                            v_args.push_back({s, argv[i+1]});
                            i++;
                            j = -1;
                        }
                        else debug::exit(debug::err() 
                            << "ArgParseError: argument -" << s << " expects an option!" << std::endl);
                        j++;
                    }
                }
            }
            else {
                v_orphans.push_back(argv[i]);
            }
        }
    }
    const std::string& option(const std::string &option) const{
        for (int i = 0; i < v_args.size(); i++)
            if (v_args[i].key == option) return v_args[i].value;
        return empty_string;
    }
    bool exists(const std::string &option) const {
        for (int i = 0; i < v_args.size(); i++)
            if (v_args.at(i).key == option) return true;
        return false;
    }
    const std::string& orphan(int pos) {
        if (v_orphans.size() > pos)
            return v_orphans.at(pos);
        else return empty_string;
    }
    void print(std::ostream& o = std::cout) const {
        o << "Orphans: " << v_orphans.size() << std::endl;
        for (int i = 0; i < v_orphans.size(); i++)
            o << i << ": " << v_orphans[i] << std::endl;
        o << std::endl;
        o << "Arguments: " << v_args.size() << std::endl;
        for (int i = 0; i < v_args.size(); i++)
            o << v_args[i].key << ": " << v_args[i].value << std::endl;
        o << std::endl;
    }
    friend std::ostream& operator<<(std::ostream&, const args&);
};
std::ostream& operator<<(std::ostream& o, const args& a) {
    a.print(o);
    return o;
}
