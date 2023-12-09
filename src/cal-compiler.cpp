#include <fstream>
#include "driver.h"
#include "args.h"

const std::string VERSION = "v0.0.1";
const int MENU_SIZE = 18;
const int MAX_P_ARGS = 1;

expect menu[MENU_SIZE] = {
    {"h", false,    "print this message"},
    {"v", false,    "version"},
    {"o", true,     "name of file to output to (default is cal.out.s)"},
    {"t", true,     "target architecture (default is local)"},
    {"p", false,    "trace parsing"},
    {"s", false,    "trace scanning"},
    {"d", false,    "print debug messages"},
    {"c", false,    "put comments into generated assembly"},
    {"n", false,    "don't generate assembly"},
    {"help",            false,  "same as -h"},
    {"version",         false,  "same as -v"},
    {"output-file",     true,   "same as -o"},
    {"target",          true,   "same as -t"},
    {"trace-parse",     false,  "same as -p"},
    {"trace-scan",      false,  "same as -s"},
    {"debug",           false,  "same as -d"},
    {"comment",         false,  "same as -c"},
    {"no-gen",          false,  "same as -n"}
};

std::string position_args[MAX_P_ARGS] = {
    "source-file"
};

void print_version() {
    std::cout << "Calvin Compiler " << VERSION << std::endl;
}

void print_help_menu(std::vector<expect*> menu, std::vector<std::string*> orphans) {
    print_version();
    std::cout << std::endl << "\tcalc ";
    printExpects(menu, orphans);
}

int main(int argc, char *argv[]) {
    std::vector<expect*> options = std::vector<expect*>();
    std::vector<std::string*> p_args = std::vector<std::string*>();
    for (int i = 0; i < MENU_SIZE; i++) options.push_back(&menu[i]);
    for (int i = 0; i < MAX_P_ARGS; i++) p_args.push_back(&position_args[i]);

    args cl_args(argc, argv, options);

    //std::cout << "arguments provided: " << std::endl << cl_args << std::endl << std::endl;

    if (cl_args.exists("h") || cl_args.exists("help")) { print_help_menu(options, p_args); return 0; }
    if (cl_args.exists("v") || cl_args.exists("version")) { print_version(); return 0; }

    int res = 0;

    driver drv;
    if (cl_args.exists("p") || cl_args.exists("trace-parse")) drv.trace_parsing = true;
    if (cl_args.exists("s") || cl_args.exists("trace-scan")) drv.trace_scanning = true;

    if(cl_args.exists("d") || cl_args.exists("debug")) 
        debug::setLogStream(std::cerr);

    std::string input_name;
    if(cl_args.orphan(0).empty()) input_name = "-";
    else input_name = cl_args.orphan(0); 

    debug::log() << std::endl << "Parsing . . ." << std::endl << std::endl;

    res = drv.parse(input_name);

    if (res != 0) return res;

    if (cl_args.exists("n") ||cl_args.exists("no-gen")) return 0;

    std::string output_name;
    if (cl_args.exists("o")) output_name = cl_args.option("o");
    else if (cl_args.exists("output-file")) output_name = cl_args.option("output-file");
    else output_name = "cal.out.s";

    std::ofstream out;
    out.open(output_name, std::ofstream::out | std::ofstream::trunc);

    if(!out) debug::exit(debug::err() << "Error opening file " << output_name << "!" << std::endl);

    if (cl_args.exists("c") || cl_args.exists("comment")) 
        debug::setComStream(out);

    // generate here

    out.close();

    return res;
}