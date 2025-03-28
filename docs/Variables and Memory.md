# Mutability

All non-value variables are immutable by default. If a value-type variable is meant to be immutable, it should be modified with the keyword `const`.
# Storage Classes

All data is either local, static/global, dynamically allocated, or a compile time constant.
# Allocators

Any code that needs dynamically allocated memory must explicitly request it from an allocator and must explicitly request that the allocator free it. Several different types of allocators will be provided out of the box, as well as the capability for a programmer to define their own.

# Scope

Code can access variables from its own scope and from any scope above it.