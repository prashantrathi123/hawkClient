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
- `contains`
- `notContains`
- `startWith`
- `endWith`
- `matchesRegex`
- `between`
- `notBetween`
- `isEmpty`
- `isUnDefined`
- `isNull`
- `isTrue`
- `isFalse`
- `isTypeOf`
- `isArray`
- `isObject`
- `isString`
- `isNumber`
- `isBoolean`
- `hasLength`

<img width="1728" alt="validations" src="https://github.com/user-attachments/assets/27c72221-25a9-48fe-a351-fb1f5e04fc3c">

