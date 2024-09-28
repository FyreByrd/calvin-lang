#include "cmpx.h"

std::ostream& operator<<(std::ostream& o, const cmpx& c) {
    return o << c.r << (c.i >= 0.0? "+": "") << c.i << 'i';
}