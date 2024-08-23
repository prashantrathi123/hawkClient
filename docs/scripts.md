# Script

Functions available in the script are as follows:

## Pre Request Script

- `hc.request.getBody()`
- `hc.request.getUrl()`
- `hc.request.setUrl("urlValue")`
- `hc.request.getHeaders()`
- `hc.request.getBodyType()`
- `hc.request.setHeader("key", "value")`
- `hc.request.setJsonBody({})`
- `hc.request.setMethod('value')`
- `hc.request.getMethod()`


## Post Response Script

- `hc.response.getBody()`
- `hc.response.getStatus()`
- `hc.response.getStatusText()`
- `hc.response.getHeaders()`
- `hc.response.getTimeTaken()`
- `hc.setCollectionVariable("key", "value")`
- `hc.test("description", () => {})`

### Example for Test

```javascript
hc.test("should match expected value", () => {
  const body = hc.response.getBody();
  expect(body.value[0].name).to.equal("ram");
});
```
<img width="1728" alt="test-script" src="https://github.com/user-attachments/assets/8d8b57d0-bb1d-4855-9535-5260000598f3">

#### Response Body
<img width="1171" alt="Screenshot 2024-08-19 at 7 49 43 PM" src="https://github.com/user-attachments/assets/857a3320-2eef-4fbf-8a66-ca1e98419960">

### Example for Script Import and File Explorer

#### Write a script using inbuilt file explorer that can be imported in pre or post request/collection script

<img width="1728" alt="file explorer" src="https://github.com/user-attachments/assets/332ed756-19ec-4199-b6d8-512201087e26">

#### Import the script in request/collection as shown below

<img width="1728" alt="script result" src="https://github.com/user-attachments/assets/17ecf64c-93c6-42c2-8f1b-6c113eb5b478">

### Node Modules
Some node_modules are available by default for both pre and post request/collection script and can be accessed in script directly.
- axios
- lodash
- chai
- node-fetch
- http
- https
- url

#### Axios call example in script

<img width="1728" alt="axios call" src="https://github.com/user-attachments/assets/191bf6e1-2f47-46f9-948e-e90056cc09d5">

#### External node modules
External node modules can be imported in script from collection path if installed in collection folder and have package.json file.
