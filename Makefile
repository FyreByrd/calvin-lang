.PHONY: all lex parse compiler clean

all: lex parse compiler

SF = src

lex:
	flex -o ${SF}/lex.yy.cc ${SF}/lex.l

parse:
	bison -d -v ${SF}/parser.y -o ${SF}/parser.tab.cc

files := ${SF}/utils.cpp ${SF}/debug.cpp ${SF}/cal-compiler.cpp ${SF}/lex.yy.cc ${SF}/parser.tab.cc

compiler:
	clang++ ${files} -o calc

clean:
	rm -f calc
	rm -f ${SF}/parser.tab.cc
	rm -f ${SF}/parser.tab.hh
	rm -f ${SF}/location.hh
	rm -f ${SF}/lex.yy.cc
	rm -f ${SF}/parser.output
