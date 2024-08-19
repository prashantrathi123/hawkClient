# Validations

## Post Response

The `Post Response validation` accepts a variable, an operator, and a value, and performs the validation based on the provided operator and value.

### Variable

In `Post Response validation`, the variable has access to the `Response` object. The available fields in the response are:

- `response.body`
- `response.status`
- `response.statusText`
- `response.headers`

### Operator

In `Post Response`, the operator can be one of the following:

- `isGreaterThan`
- `isGreaterThenOrEqual`
- `isEqualTo`
- `isNotEqualTo`
- `isLessThen`
- `isLessThenOrEqual`
- `in`
- `notIn`
- `contains`
- `notContains`
- `startWith`
- `endWith`
- `matchesRegex`
- `between`
- `isEmpty`
- `isUnDefined`
- `isNull`
- `isTrue`
- `isFalse`
- `isTypeOf`
- `isInstanceOf`
- `isArray`
- `isObject`
- `isString`
- `isNumber`
- `isBoolean`
- `hasLength`
