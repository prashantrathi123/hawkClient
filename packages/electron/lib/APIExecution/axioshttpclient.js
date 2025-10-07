const axios = require('axios');
const { URL } = require('url');
const querystring = require('querystring');
const FormData = require('form-data');
const fs = require('fs');
const { signRequest } = require('../utils/awsV4Auth')
const { getAxiosConfig } = require("./axiosConfig")
const { getClientCertificate } = require("../utils/prepareAPIRequest");
const { NtlmClient } = require('axios-ntlm');

function convertFormUrlencodedArrayToObject(array) {
  return array.reduce((obj, item) => {
    if (item.isChecked) {
      obj[item.key] = item.value;
    }
    return obj;
  }, {});
}

function parseCookies(setCookieHeader) {
  return setCookieHeader.map(cookieString => {
    const cookie = {};
    const parts = cookieString.split(';').map(part => part.trim());
    const [name, value] = parts[0].split('=');
    cookie.Name = name;
    cookie.Value = value;

    parts.slice(1).forEach(part => {
      const [key, val] = part.split('=');
      switch (key.toLowerCase()) {
        case 'domain':
          cookie.Domain = val;
          break;
        case 'path':
          cookie.Path = val;
          break;
        case 'expires':
          cookie.Expires = val;
          break;
        case 'httponly':
          cookie.HttpOnly = true;
          break;
        case 'secure':
          cookie.Secure = true;
          break;
      }
    });

    return cookie;
  });
}


function convertResponseDataToString(data, contentType) {
  if (typeof data === 'string') {
    return data;
  } else if (data instanceof Buffer) {
    try {
      if (contentType && (contentType.includes('image') || contentType.includes('application/octet-stream') || contentType.includes('application/pdf'))) {
        return data;
      }
      return data.toString('utf-8');
    } catch (error) {
      return data.toString('utf-8');
    }
  } else if (typeof data === 'object') {
    return JSON.stringify(data, null, 2);
  } else {
    return String(data);
  }
}

async function makeHttpCall(url, method = 'GET', data = null, headers = {}, bodyType = 'json', auth, collectionAuth, certificates, redirectCount = 0) {
  const startTime = Date.now(); // Start timing
  try {
    const urlObj = new URL(url);
    const form = new FormData();
    let requestData = null;
    if (data) {
      if (bodyType === 'json') {
        requestData = data; // Assuming data is a JSON string
        // headers['Content-Type'] = 'application/json';
      } else if (bodyType === 'form-urlencoded') {
        let formdata = convertFormUrlencodedArrayToObject(data);
        requestData = querystring.stringify(formdata);
        // headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (bodyType === 'form-data') {
        // Append data to the form
        data.forEach(item => {
          if (item.type === 'file' && item.isChecked) {
            item.value.forEach(file => {
              form.append(item.key, fs.createReadStream(file));
            });
            // form.append(item.key, fs.createReadStream(item.value[0]));
          } else if (item.type === 'text' && item.isChecked) {
            form.append(item.key, item.value);
          }
        });
        headers = { ...headers, ...form.getHeaders() };
        requestData = form;
      } else if (bodyType === 'file') {
        requestData = fs.createReadStream(data.src); // Assuming data is a Buffer or Uint8Array
        // headers['Content-Type'] = 'application/octet-stream';
      } else if (bodyType === 'graphql') {
        let parsedVariable = {}
        try {
          parsedVariable = JSON.parse(data.variables)
        } catch (error) {
          console.log("error in variable parsing", error)
        }
        data.variables = parsedVariable
        requestData = data
        console.log('graphql request data', requestData)
        // headers['Content-Type'] = 'application/json';
      } else if (bodyType === 'xml') {
        requestData = data; // Assuming data is an XML string
        // headers['Content-Type'] = 'application/xml';
      } else if (bodyType === 'text') {
        requestData = data; // Assuming data is a plain text string
        // headers['Content-Type'] = 'text/plain';
      } else if (bodyType === 'noBody') {
        requestData = null;
      }
    }

    if (auth.authType === 'awsV4') {
      let awsV4Req = auth.awsV4
      let hed = signRequest({
        url: url,
        method: method,
        data: requestData,
        service: awsV4Req.service,
        region: awsV4Req.region,
        accessKeyId: awsV4Req.accessKey,
        secretAccessKey: awsV4Req.secretKey,
        sessionToken: awsV4Req.sessionToken,
        contentType: 'application/json'
      })
      headers = { ...headers, ...hed.headers }
    } else if (auth.authType == 'inherit') {
      // in case of inherit fetch auth from collection
      if (collectionAuth.authType === 'awsV4') {
        let awsV4Req = collectionAuth.awsV4
        let hed = signRequest({
          url: url,
          method: method,
          data: requestData,
          service: awsV4Req.service,
          region: awsV4Req.region,
          accessKeyId: awsV4Req.accessKey,
          secretAccessKey: awsV4Req.secretKey,
          sessionToken: awsV4Req.sessionToken,
          contentType: 'application/json'
        })
        headers = { ...headers, ...hed.headers }
      }
    }

    let digestAuth = null
    if (auth.authType === 'digest') {
      digestAuth = auth.digest
    } else if (auth.authType == 'inherit') {
      if (collectionAuth.authType === 'digest') {
        digestAuth = collectionAuth.digest
      }
    }

    let ntlmAuth = null
    if (auth.authType === 'ntlm') {
      ntlmAuth = auth.ntlm
    } else if (auth.authType == 'inherit') {
      if (collectionAuth.authType === 'ntlm') {
        ntlmAuth = collectionAuth.ntlm
      }
    }

    var clientCert = getClientCertificate(url, certificates?.clientCertificates || []);

    if (certificates?.caCertificate?.isEnabled && certificates?.caCertificate?.caPath) {
      if (clientCert == null) {
        clientCert = {}
      }
      clientCert.caPath = certificates.caCertificate.caPath
    }

    if (clientCert == null) {
      clientCert = {
        isVerifyTLS: certificates?.isVerifyTLS
      }
    } else {
      clientCert.isVerifyTLS = certificates?.isVerifyTLS
    }

    const requestSettings = {
      url: url,
      method: method,
      headers: headers,
      data: requestData,
      maxRedirects: 20,
      validateStatus: (status) => {
        return status >= 200 && status < 300; // default
      },
      responseType: 'arraybuffer',
      clientCert: clientCert,
      digestAuth: digestAuth,
      ntlmAuth: ntlmAuth
    };
    let axiosInstance = axios.create();
    const axiosConfig = getAxiosConfig(requestSettings, axiosInstance)

    if (axiosConfig.ntlm) {

      axiosInstance = NtlmClient({
        username: ntlmAuth.username,
        password: ntlmAuth.password,
        domain: ntlmAuth.domain || '',
        workstation: ntlmAuth.workstation || ''
      }, axiosInstance.defaults);

      delete axiosConfig.ntlm
    }
    delete axiosConfig.digestAuth
    delete axiosConfig.clientCert

    const response = await axiosInstance(axiosConfig);

    const setCookieHeader = response.headers['set-cookie'];
    const cookies = setCookieHeader ? parseCookies(setCookieHeader) : [];
    const endTime = Date.now(); // End timing
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: convertResponseDataToString(response.data, response.headers['content-type']),
      cookies: cookies,
      timeTaken: endTime - startTime + 'ms',
      responseSizeKB: `${(Buffer.byteLength(response.data) / 1024).toFixed(2)} KB`
    };
  } catch (error) {
    let actualError = error;
    let errorMessage = error.message;

    if (Array.isArray(error.errors) && error.errors.length > 0) {
      const firstErr = error.errors[0]; // simplified — pick the first one
      actualError = firstErr || error;
      errorMessage = firstErr?.message || error.message;
    }

    const response = actualError.response;
    const endTime = Date.now(); // End timing
    return {
      status: response ? response.status : 500,
      statusText: response ? response.statusText : 'Internal Server Error',
      headers: response ? response.headers : {},
      data: response ? convertResponseDataToString(response.data) : errorMessage,
      cookies: [],
      timeTaken: endTime - startTime + 'ms',
      responseSizeKB: '0 KB'
    };
  }
}

module.exports.makeHttpCall = makeHttpCall;
