let constants = require('../constants/constants')
let axioshttpClient = require("./axioshttpclient")
const { evaluateValidations } = require("../utils/validationUtil");
const { prepareAPIRequest, getPlaceholdersReplacedAuth, createVariablesValuesBasisPrecedence, createVariablesValues } = require("../utils/prepareAPIRequest");

function toBasicAuth(clientId, clientSecret) {
  try {
    const credentials = `${clientId}:${clientSecret}`;
    const base64Credentials = btoa(credentials);
    return `Basic ${base64Credentials}`;
  } catch (error) {
    return `Basic `;
  }
}

const removeNonSerializable = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(removeNonSerializable);
  }

  if (typeof obj === 'object') {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (typeof value !== 'function') {
        newObj[key] = removeNonSerializable(value);
      }
    });
    return newObj;
  }

  return obj;
};

const executeAPI = async (request) => {
  try {
    // console.log("Request", request);
    let method = request.method;

    let variablesValues = createVariablesValues(request?.envVariables || [], request?.globalVariables || [], request?.collectionVariables || []);

    variablesValues = createVariablesValuesBasisPrecedence([...request.variables?.preRequest || []], variablesValues);
    let placeHoldersReplacedRequest = prepareAPIRequest(request, variablesValues);

    let url = placeHoldersReplacedRequest.url
    let requestBody = placeHoldersReplacedRequest.body
    let headers = placeHoldersReplacedRequest.headers
    let auth = placeHoldersReplacedRequest.auth

    let bodyType = request.bodyType

    request.variablesExcludingRequestVar = createVariablesValues(request?.envVariables || [], request?.globalVariables || [], request?.collectionVariables || []);
    let collectionAuth = getPlaceholdersReplacedAuth(request.collectionAuth, request.variablesExcludingRequestVar);
    let validation = request.validation


    if (auth.authType == 'basic') {
      let username = auth.basic?.username ?? '';
      let password = auth.basic?.password ?? '';
      headers['Authorization'] = toBasicAuth(username, password)
    } else if (auth.authType == 'bearer') {
      let token = auth.bearer?.[0]?.value || '';
      headers['Authorization'] = `Bearer ${token}`
    } else if (auth.authType == 'inherit') {
      // in case of inherit fetch auth from collection
      if (collectionAuth.authType == 'basic') {
        let username = collectionAuth.basic?.username ?? '';
        let password = collectionAuth.basic?.password ?? '';
        headers['Authorization'] = toBasicAuth(username, password)
      } else if (collectionAuth.authType == 'bearer') {
        let token = collectionAuth.bearer?.[0]?.value || '';
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    let certificates = request.certificates

    let response = await axioshttpClient.makeHttpCall(url ? url : '', method, requestBody, headers, bodyType ? bodyType : 'json', auth, collectionAuth, certificates)
      .then(resp => {
        return resp;
      }).catch(error => {
        throw error
      });

    let filteredResponse = {
      status: response.status,
      body: response.data,
      statusText: response.statusText,
      headers: response.headers,
      cookies: response.cookies,
      timeTaken: response.timeTaken,
      responseSizeKB: response.responseSizeKB,
    }

    // process validations on response
    let validationsResults = [];
    try {
      validationsResults = evaluateValidations({ response: { ...filteredResponse } }, validation || []);
    } catch (error) {
      console.error("error while running the validations on response", error);
    }

    filteredResponse.postScriptResponse = {
      request,
      validationsResults
    }
    filteredResponse = removeNonSerializable(filteredResponse)

    return filteredResponse
  } catch (error) {
    return { body: `{"error": "${error.message}"}`, timeTaken: "0ms", responseSizeKB: "0 KB", logs: [], statusText: '', postScriptResponse: { logs: [], validationsResults: [], request: {} }, headers: {}, cookies: [] }
  }
}

module.exports.executeAPI = executeAPI;
