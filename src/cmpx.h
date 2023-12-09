#pragma once
#include <iostream>

class cmpx {
public:
    double r;
    double i;
    friend std::ostream& operator<<(std::ostream&, const cmpx&);
    cmpx(double r, double i) { this->r = r; this->i = i; }
};