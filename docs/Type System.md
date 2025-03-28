# Traits

Traits are interfaces that are composed entirely of functions & associated types. They can be generic. Traits must declare 0 or more required methods or associated types that a class must implement or otherwise specify, and they may also declare 0 or more extra methods that are implemented by the trait. For instance, a trait for testing value equality (as opposed to reference equality) may declare a required method that tests for equality, and then may implement an extra method that tests for non-equality.

A trait that declares 0 required methods & associated types as well as 0 extra methods is considered a guarantee trait, which functions as a hint to programmers & tools like the compiler that certain assumptions or optimizations can be made safely. For instance, a Sized guarantee trait can guarantee to the compiler that all objects marked with this trait have a size that is compile-time known. As another example, one may declare a guarantee trait that the equality method provided by the class’s partial equality trait fulfills the definition of a strict equality, allowing all instances of this class to be compared by value to one another without issue.
# Built-In Types
## Values

### Int

Integral types can be signed or unsigned, and can have a size of 8, 16, 32, or 64 bits.
These types can be represented as `u8`, `i8`, `u16`, `i16`, `u32`, `i32`, `u64`, and `i64`.

An arbitrary precision integral type can be specified as `Uint` or `Int`.
### Boolean

The boolean data type, `bool`, can be considered a special case of `u8`, as that is how a boolean would be stored under the hood, unless we would want to implement bit fields or packed booleans. A `bool` can hold the values `true` or `false`.

`Boolean` could also possibly be used to create logic with more than two possible states.
### Real

Real types can exist as either 32 (single-precision) or 64 (double-precision) bits and are represented as `r32` and `r64`.

An arbitrary precision real type can be expressed as `Real`.

### Decimal

Decimal types can exist as either 32 or 64 bits and are represented as `d32` and `d64`.

An arbitrary precision decimal type can be expressed as `Decimal`.
### Complex

Complex types, similarly to real types, can exist as 32 or 64 bits and are represented as `c32` and `c64`. The size in this instance is referring to the size of either portion of the complex number. The true storage size will instead be double that, as a complex type is two consecutive real types under the hood.

An arbitrary precision complex type can be expressed as `Complex`.
## References

Calvin has two reference types: references (`T&`), which will always be valid, and `Maybe<T>` (`T?`), which can hold `null`. Both are implemented as pointers under the hood. 
## Enums

An enumerated type, or `enum`, provides a closed set of named constants that are scoped to the name of the enum. The underlying data type of an enum can be specified by the programmer, and defaults to `u8`. An enum can take strings as the underlying data type for easier printing.
## Unions

Calvin provides tagged unions as a data type. Tagged unions will require either a programmer defined enum to be specified, or will create a hidden enum under the hood to handle the options. If there is no enum provided, the types provided in the options must be distinct from each other (there is no such constraint when the programmer provides an enum). Accessing a member of a tagged union will require an exhaustive match of the enum/types.
## Objects

Objects are defined through a `type nameOfObject = { ...` declaration. An object type can hold any number of member variables and functions declared in the definition. An object can also implement any number of traits specified by its definition.
## Strings

Strings, declared as `string`, are printable. 
## Tuples

Tuples, unlike other collections, can hold multiple different types, but the exact composition is locked at compile-time.
## Slices

Slices can be used as a read-only window to an iterable or indexable type.
## Errors

Errors are also a type. Errors are not thrown, but instead returned as values.
## Utility Types

- `Maybe<T>`: The full syntax for a nullable reference. Has `T?` as syntactic sugar
- `Result<T, E: Error>`: Holds either a returned `T` or an error `E`.
## Collections

- `Map<K, V>`: Uses unique keys of type `K` for values of type `V`
- `Set<T>`: A unique set of values of type `T`
- `List<T>`: A linked list of type `T`
- `Queue<T>`: A queue of type `T`
- `Stack<T>`: A stack of type `T`
- `Vec<S: const Int, T>`: A constant size array of type `T`
## Others

`unknown` and `never` are at the top and bottom of the type hierarchy, respectively
