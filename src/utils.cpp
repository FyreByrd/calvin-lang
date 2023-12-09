#include <string>
#include <sstream>
#include "utils.h"

std::string utils::prefix(const std::string& pre, size_t times) {
    std::stringstream out;
    while (times--) 
        out << pre;
    return out.str();
}