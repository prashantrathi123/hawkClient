const https = require('https');
const http = require('http');
const fs = require('fs');
const { attachDigestInterceptor } = require('../utils/digestInterceptor');

/**
 * Make a request using Axios with optional client certificate handling.
 *
 * @param {Object} requestConfig - The Axios request configuration.
 * @param {Object} [requestConfig.clientCert] - The client certificate settings.
 * @param {string} [requestConfig.clientCert.certPath] - The path to the client certificate.
 * @param {string} [requestConfig.clientCert.keyPath] - The path to the client key.
 * @param {string} [requestConfig.clientCert.caPath] - The path to the CA certificate.
 * @param {string} [requestConfig.clientCert.pfxPath] - The path to the pfx certificate.
 * @param {string} [requestConfig.clientCert.isVerifyTLS] - isVerifyTLS flag.
 * @param {string} [requestConfig.clientCert.passphrase] - The passphrase for the client key.
 * @returns {Object} The axiosConfig.
 */

function getAxiosConfig(requestConfig, axiosInstance) {
  const { clientCert, digestAuth, ntlmAuth, ...axiosConfig } = requestConfig;

  let httpsAgent;
  let httpAgent;

  let httpsAgentOptions = {
    rejectUnauthorized: false,
    keepAlive: true
  };

  if (clientCert && clientCert.isVerifyTLS) {
    httpsAgentOptions.rejectUnauthorized = true;
  }

  // Configure HTTPS agent with client certificate if provided
  if (clientCert && ((clientCert.certPath && clientCert.keyPath) || clientCert.pfxPath || clientCert.caPath)) {

    if (clientCert.type === 'cert' && clientCert.certPath && clientCert.keyPath) {
      httpsAgentOptions.cert = fs.readFileSync(clientCert.certPath);
      httpsAgentOptions.key = fs.readFileSync(clientCert.keyPath);
    } else if (clientCert.type === 'pfx' && clientCert.pfxPath) {
      httpsAgentOptions.pfx = fs.readFileSync(clientCert.pfxPath);
    }

    if (clientCert.caPath) {
      httpsAgentOptions.ca = fs.readFileSync(clientCert.caPath);
    }

    if (clientCert.passphrase) {
      httpsAgentOptions.passphrase = clientCert.passphrase;
    }
  }

  httpsAgent = new https.Agent(httpsAgentOptions);
  httpAgent = new http.Agent(httpsAgentOptions);

  if (httpsAgent && httpAgent) {
    axiosConfig.httpsAgent = httpsAgent;
    axiosConfig.httpAgent = httpAgent;
  }

  // Attach digest interceptor if needed
  if (digestAuth && axiosInstance) {
    attachDigestInterceptor(axiosInstance, digestAuth);
  }

  // ✅ NTLM handling
  if (ntlmAuth && ntlmAuth.username && ntlmAuth.password) {
    axiosConfig.ntlm = {
      username: ntlmAuth.username,
      password: ntlmAuth.password,
      domain: ntlmAuth.domain || '',
    }
  }

  return axiosConfig;
}

module.exports = {
  getAxiosConfig
}
