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

### Node Modules
node_modules available by default for both pre request and post response script
- axios
- lodash
- chai
- node-fetch
- http
- https
- url

node modlues can be imported in script from collection path if installed in collection folder and have package.json file