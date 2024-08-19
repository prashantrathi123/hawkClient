# Variables

## Pre Request

The `Pre Request variables` accept a key and a value. These variables are specific to the request only.

## Post Response

The `Post Response variables` accept a key and a value. These variables are set at the collection level, which can be used by other requests within that collection.

### Value in Post Response

In `Post Response`, the value has access to the `Response` object. The available fields in the response are:

- `response.body`
- `response.status`
- `response.statusText`
- `response.headers`
<img width="1728" alt="variables" src="https://github.com/user-attachments/assets/637880e9-6805-402c-8474-dcc453d4faaa">
