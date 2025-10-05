const aws4 = require('aws4');

// Function to sign the request using aws4
const signRequest = ({ method, url, data, service, region, accessKeyId, secretAccessKey, sessionToken, contentType }) => {
  const { host, pathname, search } = new URL(url);

  const opts = {
    host,
    path: pathname + search,
    method,
    body: data,
    service,
    region,
    headers: {
      'Content-Type': contentType //'application/json'
    }
  };

  aws4.sign(opts, {
    accessKeyId,
    secretAccessKey,
    sessionToken
  });

  return {
    headers: opts.headers
  };
}
module.exports = {
  signRequest
};
