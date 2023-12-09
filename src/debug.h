#pragma once
#include <iostream>

class NullBuffer : public std::streambuf {
public:
    int overflow(int c) { return c; }
};

class NullStream : public std::ostream {
private:
    NullBuffer nb;
public:
    NullStream() : std::ostream(&nb) {}
};

class debug {
private:
    static std::ostream* log_stream;
    static std::ostream* com_stream;
    static NullStream null_stream;
public:
    //print debug messages
    static std::ostream& log(bool enable=true) { 
        return enable? *log_stream : null_stream; }
    //print errors
    static std::ostream& err() { return std::cerr; }
    //print comments to output file
    static std::ostream& com() { return *com_stream; }
    //null stream
    static NullStream& nil() { return null_stream; }
    
    static void setLogStream(std::ostream& stream) { log_stream = &stream; }
    static void setComStream(std::ostream& stream) { com_stream = &stream; }
    
    static void* exit(std::ostream& stream) { stream << std::endl; std::exit(1);}
};
