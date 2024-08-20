# Script

Functions available in the script are as follows:

## Pre Request Script

- `hc.request.getBody()`
- `hc.request.getUrl()`
- `hc.request.setUrl(urlValue)`
- `hc.request.getHeaders()`
- `hc.request.getBodyType()`
- `hc.request.setHeader(key, value)`


## Post Response Script

- `hc.response.getBody()`
- `hc.response.getStatus()`
- `hc.response.getStatusText()`
- `hc.response.getHeaders()`
- `hc.response.getTimeTaken()`
- `hc.setCollectionVariable(key, value)`
- `hc.test(description, () => {})`

### Example for Test

```javascript
hc.test("should match expected value", () => {
  const body = hc.response.getBody();
  expect(body.value[0].name).to.equal("ram");
});
```
<img width="1728" alt="test-script" src="https://github.com/user-attachments/assets/8d8b57d0-bb1d-4855-9535-5260000598f3">

<img width="1171" alt="Screenshot 2024-08-19 at 7 49 43 PM" src="https://github.com/user-attachments/assets/857a3320-2eef-4fbf-8a66-ca1e98419960">

### Example for Script Import and File Explorer

#### Write a script using inbuilt file explorer that can be import in request/Collection pre or post request/collection script

<img width="1728" alt="file explorer" src="https://github.com/user-attachments/assets/332ed756-19ec-4199-b6d8-512201087e26">

#### Import the script in reques/collection as shown below

<img width="1728" alt="script result" src="https://github.com/user-attachments/assets/17ecf64c-93c6-42c2-8f1b-6c113eb5b478">

### Node Modules
node_modules available by default for both pre request and post response script
- axios
- lodash
- chai
- node-fetch
- http
- https
- url

externalt node modlues can be imported in script from collection path if installed in collection folder and have package.json file.
