#include "debug.h"

NullStream debug::null_stream;
std::ostream* debug::log_stream = &debug::null_stream;
std::ostream* debug::com_stream = &debug::null_stream;