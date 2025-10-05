// digestInterceptor.js
const crypto = require('crypto');
const { URL } = require('url');

function isStrPresent(str) {
  return str && str.trim() !== '' && str.trim() !== 'undefined';
}

function stripQuotes(str) {
  return str.replace(/"/g, '');
}

function splitAuthHeaderKeyValue(str) {
  const indexOfEqual = str.indexOf('=');
  const key = str.substring(0, indexOfEqual).trim();
  const value = str.substring(indexOfEqual + 1);
  return [key, value];
}

function containsDigestHeader(response) {
  const authHeader = response?.headers?.['www-authenticate'];
  return authHeader ? authHeader.trim().toLowerCase().startsWith('digest') : false;
}

function containsAuthorizationHeader(originalRequest) {
  return Boolean(
    originalRequest.headers['Authorization'] ||
    originalRequest.headers['authorization']
  );
}

function md5(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

/**
 * Attach Digest Auth interceptor to Axios instance
 * @param {*} axiosInstance - Axios instance
 * @param {*} digestConfig - { username, password }
 */
function attachDigestInterceptor(axiosInstance, digestConfig) {
  const { username, password } = digestConfig || {};
  if (!isStrPresent(username) || !isStrPresent(password)) return;

  axiosInstance.interceptors.response.use(
    res => res,
    error => {
      const originalRequest = error.config;

      if (originalRequest._retry) return Promise.reject(error);
      originalRequest._retry = true;

      if (
        error.response?.status === 401 &&
        containsDigestHeader(error.response) &&
        !containsAuthorizationHeader(originalRequest)
      ) {
        const authHeader = error.response.headers['www-authenticate'];

        const authDetails = authHeader
          .split(',')
          .map(pair => splitAuthHeaderKeyValue(pair).map(stripQuotes))
          .reduce((acc, [key, value]) => {
            const normalizedKey = key.toLowerCase().replace(/^digest\s+/, '');
            acc[normalizedKey] = value;
            return acc;
          }, {});

        if (!authDetails.realm || !authDetails.nonce) {
          return Promise.reject(error);
        }

        const uri = new URL(originalRequest.url).pathname;
        const method = originalRequest.method.toUpperCase();
        const nc = '00000001';
        const cnonce = crypto.randomBytes(16).toString('hex');
        const algorithm = (authDetails.algorithm || 'MD5').toUpperCase();

        if (algorithm !== 'MD5') {
          return Promise.reject(new Error(`Unsupported algorithm: ${algorithm}`));
        }

        const HA1 = md5(`${username}:${authDetails.realm}:${password}`);
        const HA2 = md5(`${method}:${uri}`);
        const responseHash = md5(`${HA1}:${authDetails.nonce}:${nc}:${cnonce}:auth:${HA2}`);

        const headerFields = [
          `username="${username}"`,
          `realm="${authDetails.realm}"`,
          `nonce="${authDetails.nonce}"`,
          `uri="${uri}"`,
          `qop="auth"`,
          `nc="${nc}"`,
          `cnonce="${cnonce}"`,
          `response="${responseHash}"`,
          `algorithm="MD5"`
        ];

        if (authDetails.opaque) {
          headerFields.push(`opaque="${authDetails.opaque}"`);
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Digest ${headerFields.join(', ')}`;

        return axiosInstance(originalRequest);
      }

      return Promise.reject(error);
    }
  );
}

module.exports = { attachDigestInterceptor };
