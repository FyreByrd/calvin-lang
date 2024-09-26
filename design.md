# What Calvin will look/function like

## Comments

Comment Styles:

```c
//comment

/* 
    comment 
*/
```

## Types and Operators

### Types

Calvin supports 14 different basic types, and arrays and references of those types. Many of those 14 types are aliases for another type or are different sizes of another type. At its core, Calvin supports integral data types, and floating-point data types.

#### Table of Types

|Size (bytes)|Integral|Real|Complex|
|----|----|----|----|
|1|`bool`, `char`, `u8`, `i8`|||
|2|`u16`, `i16`|||
|4|`u32`, `i32`|`r32`|`x32`|
|8|`u64`, `i64`|`r64`|`x64`|

Notes:

- `i` is for signed integers
- `u` is for unsigned integers
- values are never implicitly cast
- a reference cast will treat a variable as the cast type without any other type conversion

#### Other Type Keywords

- `const`: the modified variable is constant
- `var`: the type of the variable is inferred by the compiler

### Operators

| Precedence | Operator           | Description                                                | Associativity |
| ---------- | ------------------ | ---------------------------------------------------------- | ------------- |
| 1          | *`type`*`()`       | cast                                                       | left-to-right |
|            | *`type`*`&()`      | reference cast                                             |               |
|            | *`func`*`()`       | function call                                              |               |
|            | *`arr`*`[]`        | subscript                                                  |               |
|            | `.` `?.`           | member access and optional chaining                        |               |
| 2          | `not` `~`          | logical not and bitwise not                                | right-to-left |
|            | `sizeof`           | size of                                                    |               |
| 3          | `a*b` `a/b` `a%b`  | multiplication, division, and remainder                    | left-to-right |
| 4          | `a+b` `a-b`        | addition and subtraction                                   |               |
| 5          | `<<` `>>` `>>>`    | bitwise left-shift and right-shift, arithmetic right-shift |               |
| 6          | `<` `>` `<=` `>=`  | relational operators                                       |               |
| 7          | `==` `!=`          | equality operators                                         |               |
| 8          | `a&b`              | bitwise and                                                |               |
| 9          | `a^b`              | bitwise xor                                                |               |
| 10         | `a\|b`             | bitwise or                                                 |               |
| 11         | `and`              | logical and                                                |               |
| 12         | `or`               | logical or                                                 |               |
| 13         | `??`               | null coalescing                                            |               |
| 14         | `a?b:c`            | ternary conditional                                        | right-to-left |
|            | `=`                | assignment                                                 |               |
|            | `+=` `-=`          | compound assignment                                        |               |
|            | `*=` `/=` `%=`     |                                                            |               |
|            | `<<=` `>>=` `>>>=` |                                                            |               |
|            | `&=` `\|=` `^=`    |                                                            |               |
|            | `??=`              |                                                            |               |
| 15         | `,`                | comma                                                      | left-to-right |
