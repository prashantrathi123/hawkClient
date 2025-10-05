import { executeAPI } from "../services/executeAPI";
import { updateCollectionContent } from "../services/duplicateCollectionItem"
import cloneDeep from 'lodash/cloneDeep';
import { expect } from 'chai';
import { updateEnvVariables, addGlobalVariables } from "../services/variablesService";

const operatorValidation = (operator, actualValue, expectedValue) => {
    let pass = true;
    let error = "";
    try {
        switch (operator) {
            case 'isGreaterThan':
                expect(Number(actualValue)).to.be.greaterThan(Number(expectedValue));
                break;
            case 'isGreaterThenOrEqual':
                expect(Number(actualValue)).to.be.at.least(Number(expectedValue));
                break;
            case 'isEqualTo':  // handle the legacy "equal" operator
                expect(actualValue.toString()).to.equal(expectedValue);
                break;
            case 'isNotEqualTo':
                expect(actualValue.toString()).to.not.equal(expectedValue);
                break;
            case 'isLessThen':
                expect(Number(actualValue)).to.be.lessThan(Number(expectedValue));
                break;
            case 'isLessThenOrEqual':
                expect(Number(actualValue)).to.be.at.most(Number(expectedValue));
                break;
            case 'in':
                expect(expectedValue).to.include(actualValue);
                break;
            case 'notIn':
                expect(expectedValue).to.not.include(actualValue);
                break;
            case 'contains':
                expect(actualValue).to.include(expectedValue);
                break;
            case 'notContains':
                expect(actualValue).to.not.include(expectedValue);
                break;
            case 'startWith':
                if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
                    pass = actualValue.startsWith(expectedValue);
                    if (!pass) throw new Error(`${actualValue} does not start with ${expectedValue}`);
                } else {
                    throw new Error(`Both actualValue and expectedValue must be strings`);
                }
                break;
            case 'endWith':
                if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
                    pass = actualValue.endsWith(expectedValue);
                    if (!pass) throw new Error(`${actualValue} does not end with ${expectedValue}`);
                } else {
                    throw new Error(`Both actualValue and expectedValue must be strings`);
                }
                break;
            case 'matchesRegex':
                expect(actualValue).to.match(new RegExp(expectedValue));
                break;
            case 'notMatchesRegex':
                expect(actualValue).to.not.match(new RegExp(expectedValue));
                break;
            case 'between':
                const [min, max] = expectedValue.split(',').map(Number);
                expect(Number(actualValue)).to.be.within(min, max);
                break;
            case 'notBetween':
                const [minValue, maxValue] = expectedValue.split(',').map(Number);
                expect(Number(actualValue)).to.not.be.within(minValue, maxValue);
                break;
            case 'isEmpty':
                expect(actualValue.length).to.equal(0);
                break;
            case 'isUnDefined':
                expect(actualValue).to.be.undefined;
                break;
            case 'isNull':
                expect(actualValue).to.be.null;
                break;
            case 'isTrue':
                expect(actualValue).to.be.true;
                break;
            case 'isFalse':
                expect(actualValue).to.be.false;
                break;
            case 'isTypeOf':
                expect(typeof actualValue).to.equal(expectedValue);
                break;
            case 'isInstanceOf':
                expect(actualValue).to.be.instanceOf(global[expectedValue]);
                break;
            case 'isArray':
                expect(actualValue).to.be.an('array');
                break;
            case 'isObject':
                expect(actualValue).to.be.an('object').and.not.an('array').and.not.null;
                break;
            case 'isString':
                expect(actualValue).to.be.a('string');
                break;
            case 'isNumber':
                expect(actualValue).to.be.a('number');
                break;
            case 'isBoolean':
                expect(actualValue).to.be.a('boolean');
                break;
            case 'hasLength':
                expect(actualValue.length).to.equal(Number(expectedValue));
                break;
            default:
                pass = false;
                error = `Unknown operator: ${operator}`;
        }
    } catch (err) {
        pass = false;
        error = err.message;
    }

    return { pass, error };
}

export const evaluateAssertions = (response, asserts) => {
    let tempResponse = { ...response };
    const results = asserts.map(assert => {
        if (!assert.isChecked) {
            return { ...assert, result: 'unchecked' };
        }

        try {
            tempResponse.response.body = JSON.parse(tempResponse.response.body);
        } catch (error) {
            // console.log("error response.body")
        }
        const actualValue = getValueByPath(tempResponse, assert.assertVar);
        const expectedValue = assert.value;
        const operator = assert.operator;
        // console.log("actualValue", actualValue, "expectedValue", expectedValue);
        let { pass, error } = operatorValidation(operator, actualValue, expectedValue);

        return { ...assert, success: pass, error };
    });

    return results;
}

export const getValueByPath = (obj, path) => {
    try {
        // Check if path is a string
        if (typeof path !== 'string') {
            return path;
        }

        const result = path.split('.').reduce((acc, part) => {
            const match = part.match(/^(\w+)\[(\d+)\]$/);
            if (match) {
                const [, key, index] = match;
                return acc && acc[key] && acc[key][index];
            }
            return acc && acc[part];
        }, obj);
        return result !== undefined ? result : path; // Returns result if found, otherwise returns path string
    } catch (error) {
        return path
    }

}

// function to replace {{key}} with actual value in variables array
export const replacePlaceholders = (inputString, variables) => {
    // Filter the variables array to include only the checked variables
    let checkedVariables = variables.filter(variable => variable.isChecked);
    if (inputString == undefined) {
        inputString = ""
    }

    // Replace the placeholders in the input string
    let resultString = inputString.replace(/{{(.*?)}}/g, (match, key) => {
        const index = checkedVariables.findIndex(variable => variable.key === key);
        if (index !== -1) {
            const variable = checkedVariables[index];

            // Remove the variable from the checked list to avoid infinite loops
            checkedVariables = checkedVariables.filter((_, i) => i !== index);

            // Recursively replace placeholders in the variable's value
            return replacePlaceholders(variable.value, checkedVariables);
        }

        return match; // Return original match if no variable found
    });

    return resultString;
}

// function to calculate variables giving high precedence to envVariable in case of conflict with global variable
// variables that will be used to replace placholder {{}} with variables values if placholder key matches with variable key
export const createVariablesValues = (selectedEnv, envVariables, globalVariables, collectionVariables) => {
    let variablesValues = [];

    // Retrieve the selected environment's variables
    let selectedEnvVariables = envVariables[selectedEnv]?.values || [];

    // Filter the selected environment variables to include only those that are checked
    selectedEnvVariables = selectedEnvVariables.filter(variable => variable.isChecked);

    // Filter the global variables to include only those that are checked
    let checkedGlobalVariables = globalVariables.values.filter(variable => variable.isChecked);

    // Filter the collection variables to include only those that are checked
    let checkedCollectionVariables = collectionVariables.filter(variable => variable.isChecked);

    // Create a map for collection variables for quick lookup
    let collectionVariablesMap = new Map();
    checkedCollectionVariables.forEach(variable => {
        collectionVariablesMap.set(variable.key, variable);
    });

    // Create a map for selected environment variables for quick lookup
    let envVariablesMap = new Map();
    selectedEnvVariables.forEach(variable => {
        envVariablesMap.set(variable.key, variable);
    });

    // Create a map for global variables for quick lookup
    let globalVariablesMap = new Map();
    checkedGlobalVariables.forEach(variable => {
        globalVariablesMap.set(variable.key, variable);
    });

    // Merge variables, giving precedence to environment variables, then collection variables, then global variables

    // First, add environment variables
    selectedEnvVariables.forEach(envVariable => {
        envVariable.scope = 'ENV'
        variablesValues.push(envVariable);
    });

    // Add collection variables only if not present in environment variables
    checkedCollectionVariables.forEach(collectionVariable => {
        if (!envVariablesMap.has(collectionVariable.key)) {
            collectionVariable.scope = 'COLLECTION'
            variablesValues.push(collectionVariable);
        }
    });

    // Add global variables only if not present in environment or collection variables
    checkedGlobalVariables.forEach(globalVariable => {
        if (!collectionVariablesMap.has(globalVariable.key) && !envVariablesMap.has(globalVariable.key)) {
            globalVariable.scope = 'GLOBAL'
            variablesValues.push(globalVariable);
        }
    });

    return variablesValues;
};

export const getPlaceholdersReplacedBody = (bodyType, body, variablesValues) => {
    let tempBody = body[bodyType]
    switch (bodyType) {
        case 'json': {
            return replacePlaceholders(body[bodyType], variablesValues);
        }
        case 'xml': {
            return replacePlaceholders(body[bodyType], variablesValues);
        }
        case 'text': {
            return replacePlaceholders(body[bodyType], variablesValues);
        }
        case 'form-urlencoded': {
            let formUrlEncodedBody = [];
            body[bodyType].map((formUrlEncodedBodyVal, index) => {
                formUrlEncodedBody.push({ ...formUrlEncodedBodyVal, key: `${replacePlaceholders(formUrlEncodedBodyVal.key, variablesValues)}`, value: replacePlaceholders(formUrlEncodedBodyVal.value, variablesValues) })
            })
            return formUrlEncodedBody
        }
        case 'form-data': {
            let multipartformBody = [];
            body[bodyType].map((multipartformBodyVal, index) => {
                multipartformBody.push({ ...multipartformBodyVal, key: `${replacePlaceholders(multipartformBodyVal.key, variablesValues)}`, value: multipartformBodyVal.type == 'text' ? replacePlaceholders(multipartformBodyVal.value, variablesValues) : multipartformBodyVal.value })
            })
            return multipartformBody
        }
        case 'graphql': {
            return { query: body[bodyType]?.query || '', variables: replacePlaceholders(body[bodyType]?.variables || '', variablesValues) };
        }
        default:
            return tempBody
    }
}

export const convertToHar = (requestInput, variablesValues) => {
    variablesValues = createVariablesValuesBasisPrecedence([...requestInput?.variables?.preRequest || []], variablesValues);
    const harRequest = {
        method: requestInput.method,
        url: replacePlaceholders(requestInput.url, variablesValues),
        headers: [],
        queryString: [],
        postData: {},
        headersSize: -1,
        bodySize: -1
    };

    // Convert headers
    requestInput.headers?.forEach(header => {
        if (header.isChecked) {
            harRequest.headers.push({
                name: header.key,
                value: replacePlaceholders(header.value, variablesValues)
            });
        }
    });

    // Convert query parameters
    requestInput.urlContent?.query?.forEach(param => {
        if (param.isChecked) {
            harRequest.queryString.push({
                name: param.key,
                value: replacePlaceholders(param.value, variablesValues)
            });
        }
    });

    // Convert postData
    const bodyType = requestInput.bodyType;
    if (bodyType && requestInput.body) {
        // harRequest.postData.mimeType = `application/${bodyType == 'form-urlencoded' ? 'x-www-form-urlencoded' : bodyType}`;
        if (bodyType === 'json') {
            harRequest.postData.mimeType = 'application/json'
            harRequest.postData.text = replacePlaceholders(requestInput.body.json, variablesValues);
        } else if (bodyType === 'xml') {
            harRequest.postData.mimeType = 'application/xml'
            harRequest.postData.text = replacePlaceholders(requestInput.body.xml, variablesValues);
        } else if (bodyType === 'text') {
            harRequest.postData.mimeType = 'text/plain'
            harRequest.postData.text = replacePlaceholders(requestInput.body.text, variablesValues);
        } else if (bodyType === 'form-data') {
            harRequest.postData = harRequest.postData || {}; // Ensure postData is initialized
            harRequest.postData.mimeType = 'multipart/form-data';

            harRequest.postData.params = requestInput.body['form-data']?.reduce((params, param) => {
                if (param.type === "file") {
                    param.value.forEach(filePath => {
                        params.push({
                            name: param.key,
                            value: filePath, // This should be the file path or file content depending on the requirement
                            contentType: param.type
                        });
                    });
                } else {
                    params.push({
                        name: param.key,
                        value: replacePlaceholders(param.value, variablesValues),
                        contentType: param.type
                    });
                }
                return params;
            }, []) || [];
            // }
        } else if (bodyType === 'form-urlencoded') {
            harRequest.postData.mimeType = 'application/x-www-form-urlencoded'
            harRequest.postData.params = requestInput.body['form-urlencoded']?.map(param => ({
                name: param.key,
                value: replacePlaceholders(param.value, variablesValues),
                contentType: param.type
            })) || [];
        } else if (bodyType === 'graphql') {
            harRequest.postData.mimeType = 'application/json'
            try {
                let query = requestInput.body.graphql?.query || ""
                let variables = requestInput.body.graphql?.variables || ""
                variables = replacePlaceholders(variables, variablesValues)
                let parsedVariable = {}
                try {
                    parsedVariable = JSON.parse(variables)
                } catch (error) {

                }
                let tempvalgp = {
                    query: query,
                    variables: parsedVariable
                }
                harRequest.postData.text = JSON.stringify(tempvalgp);
            } catch (error) {

            }
        } else {
            harRequest.postData.mimeType = 'application/json'
        }
    } else {
        harRequest.postData.mimeType = 'application/json'
    }

    // Add auth headers if basic auth is used
    if (requestInput.auth && requestInput.auth?.authType === 'basic' && requestInput.auth?.basic) {
        let username = requestInput.auth?.basic?.username || '';
        let password = requestInput.auth?.basic?.password || '';
        username = replacePlaceholders(username, variablesValues);
        password = replacePlaceholders(password, variablesValues);
        const encodedAuth = btoa(`${username}:${password}`);
        harRequest.headers.push({
            name: 'Authorization',
            value: `Basic ${encodedAuth}`
        });
    }

    // Add auth headers if bearer token is used
    if (requestInput.auth && requestInput.auth.authType === 'bearer') {
        let token = requestInput.auth.bearer?.find(item => item.key === 'token')?.value || '';
        token = replacePlaceholders(token, variablesValues)
        harRequest.headers.push({
            name: 'Authorization',
            value: `Bearer ${token}`
        });
    }

    return harRequest;
}

function toBasicAuth(clientId, clientSecret) {
    const credentials = `${clientId}:${clientSecret}`;
    const base64Credentials = btoa(credentials);
    return `Basic ${base64Credentials}`;
}

// function to calculate variables giving high precedence to highPrecedencVariables in case of conflict with lowPrecedencVariables
// variables that will be used to replace placholder {{}} with variables values if placholder key matches with variable key
export const createVariablesValuesBasisPrecedence = (highPrecedencVariables, lowPrecedencVariables) => {
    let variablesValues = [];

    // Retrieve the highPrecedenc variables
    let checkedHighPrecedencVariables = highPrecedencVariables || [];

    // Filter the selected highPrecedencVariables to include only those that are checked
    checkedHighPrecedencVariables = checkedHighPrecedencVariables.filter(variable => variable.isChecked);

    // Filter the lowPrecedencVariables to include only those that are checked
    let checkedLowPrecedencVariables = lowPrecedencVariables.filter(variable => variable.isChecked);

    // Create a map for highPrecedencVariables variables for quick lookup
    let highPrecedencVariablesMap = new Map();
    checkedHighPrecedencVariables.forEach(variable => {
        highPrecedencVariablesMap.set(variable.key, variable);
    });

    // Create a map for global variables for quick lookup
    let globalVariablesMap = new Map();
    checkedLowPrecedencVariables.forEach(variable => {
        globalVariablesMap.set(variable.key, variable);
    });

    checkedHighPrecedencVariables.forEach(variable => {
        variablesValues.push(variable);
    });

    checkedLowPrecedencVariables.forEach(globalVariable => {
        if (!highPrecedencVariablesMap.has(globalVariable.key)) {
            variablesValues.push(globalVariable);
        }
    });

    return variablesValues;
};

export const getPlaceholdersReplacedAuth = (auth, variablesValues) => {
    // Clone the auth object to avoid mutating the original
    let tempAuth = { ...auth };

    if (tempAuth.authType === 'basic') {
        tempAuth.basic = {
            username: replacePlaceholders(tempAuth.basic?.username || '', variablesValues),
            password: replacePlaceholders(tempAuth.basic?.password || '', variablesValues)
        }
    } else if (tempAuth.authType === 'bearer') {
        tempAuth.bearer = tempAuth.bearer?.map(item => ({
            ...item,
            value: replacePlaceholders(item.value, variablesValues)
        })) || [];
    } else if (tempAuth.authType === 'awsV4') {
        tempAuth.awsV4 = {
            accessKey: replacePlaceholders(tempAuth.awsV4?.accessKey || '', variablesValues),
            secretKey: replacePlaceholders(tempAuth.awsV4?.secretKey || '', variablesValues),
            region: replacePlaceholders(tempAuth.awsV4?.region || '', variablesValues),
            service: replacePlaceholders(tempAuth.awsV4?.service || '', variablesValues),
            sessionToken: replacePlaceholders(tempAuth.awsV4?.sessionToken || '', variablesValues),
        }
    }

    return tempAuth;
}

export const prepareAPIRequest = (request, variablesValues) => {
    let headers = {};
    // console.log("preRequestVariables", request.variables?.preRequest)
    variablesValues = createVariablesValuesBasisPrecedence(request.variables?.preRequest || [], variablesValues)
    // console.log("variablesValues", variablesValues)
    request.headers.map((reqHeader, index) => {
        if (reqHeader.isChecked) {
            headers[`${replacePlaceholders(reqHeader.key, variablesValues)}`] = replacePlaceholders(reqHeader.value, variablesValues)
        }
    })
    const parsedRequest = {
        method: request.method,
        url: replacePlaceholders(request.url, variablesValues),
        body: request.body[request.bodyType] ? getPlaceholdersReplacedBody(request.bodyType, request.body, variablesValues) : null,
        headers: headers,
        bodyType: request.bodyType,
        auth: getPlaceholdersReplacedAuth(request.auth, variablesValues)
    }
    return parsedRequest
}

// function to calculate all variables(checked and unchecked) giving high precedence to highPrecedencVariables in case of conflict with lowPrecedencVariables
// variables that will be used to replace placholder {{}} with variables values if placholder key matches with variable key
export const createALlVariablesValuesBasisPrecedence = (highPrecedencVariables, lowPrecedencVariables) => {
    let variablesValues = [];

    // Retrieve the highPrecedenc variables
    let checkedHighPrecedencVariables = [...highPrecedencVariables] || [];

    // Filter the selected highPrecedencVariables to include only those that are checked
    checkedHighPrecedencVariables = checkedHighPrecedencVariables

    // Filter the lowPrecedencVariables to include only those that are checked
    let checkedLowPrecedencVariables = [...lowPrecedencVariables]

    // Create a map for highPrecedencVariables variables for quick lookup
    let highPrecedencVariablesMap = new Map();
    checkedHighPrecedencVariables.forEach(variable => {
        highPrecedencVariablesMap.set(variable.key, variable);
    });

    checkedHighPrecedencVariables.forEach(variable => {
        variablesValues.push(variable);
    });

    checkedLowPrecedencVariables.forEach(lowpreced => {
        if (!highPrecedencVariablesMap.has(lowpreced.key)) {
            variablesValues.push(lowpreced);
        }
    });

    return variablesValues;
};

export const customLog = (type, arg) => {
    switch (type) {
        case "log":
            console.log(arg)
            break;
        case "error":
            console.error(arg)
            break;
        case "info":
            console.info(arg)
            break;
        case "warn":
            console.warn(arg)
            break;
        case "debug":
            console.debug(arg)
            break;
        case "default":
            console.log(arg)
            break;
    }
}
export const handleExecute = async (request, variablesValues, collectionId, apiCollection, workspace, signal, globalVariables, envVariables, selectedEnv, certificates = {}) => {
    let clonedRequest = cloneDeep(request);
    let clonedCollectionAuth = cloneDeep(apiCollection[collectionId].auth);
    let clonedVariables = cloneDeep(variablesValues);

    variablesValues = createVariablesValuesBasisPrecedence([...clonedRequest.variables?.preRequest || []], variablesValues);

    const apiRequest = {
        ...clonedRequest,
        method: clonedRequest.method,
        url: clonedRequest.url,
        headers: clonedRequest.headers,
        auth: clonedRequest.auth,
        bodyType: clonedRequest.bodyType,
        body: clonedRequest.body,
        urlContent: clonedRequest.urlContent,
        variables: clonedRequest.variables
    };

    let headers = {};
    apiRequest.headers?.map((reqHeader, index) => {
        if (reqHeader.isChecked) {
            headers[`${reqHeader.key}`] = reqHeader.value
        }
    })
    let requesta = {
        id: apiRequest.id,
        method: apiRequest.method,
        url: apiRequest.url,
        body: apiRequest.body,
        headers: headers,
        bodyType: apiRequest.bodyType,
        auth: apiRequest.auth
    }

    requesta.collectionAuth = clonedCollectionAuth;
    requesta.variablesExcludingRequestVar = clonedVariables;
    requesta.variablesValues = variablesValues;
    requesta.variables = clonedRequest.variables;
    requesta.collectionId = collectionId
    requesta.workspace = workspace
    requesta.collectionName = apiCollection[collectionId].name
    requesta.validation = clonedRequest?.validation || clonedRequest?.assert || []
    requesta.certificates = certificates
    requesta.globalVariables = globalVariables || []
    requesta.envVariables = envVariables || []
    requesta.collectionVariables = apiCollection[collectionId]?.collectionVariables || []
    requesta.collectionObject = apiCollection[collectionId]

    const resp = await executeAPI({ payload: requesta, signal })


    const postScriptResult = resp.postScriptResponse

    // update request basis postScriptResult.request
    clonedRequest = postScriptResult.request

    // update collection variable basis request postResponse variable
    let val = apiCollection[collectionId];

    const tempResponse = { response: { ...resp } };
    try {
        tempResponse.response.body = JSON.parse(tempResponse.response.body);
    } catch (error) {
        // Handle error
    }

    let tempReqVarPostResp = [...(clonedRequest?.variables?.postResponse || [])].filter(item => item.isChecked);



    for (let k = 0; k < tempReqVarPostResp.length; k++) {
        // fixed the string extra quote added issue
        const value = getValueByPath(tempResponse, tempReqVarPostResp[k].value);
        tempReqVarPostResp[k].value = typeof value === 'string' ? value : JSON.stringify(value) || '';
    }
    const collectionScopeVars = tempReqVarPostResp.filter(item => item.scope !== "Global" && item.scope !== "Env" && item.isChecked === true);

    const unTypedCollectionVar = cloneDeep(clonedRequest?.collectionVariables || val?.collectionVariables || [])
    for (let k = 0; k < unTypedCollectionVar.length; k++) {
        // fixed the string extra quote added issue
        const value = unTypedCollectionVar[k].value;
        unTypedCollectionVar[k].value = typeof value === 'string' ? value : JSON.stringify(value) || '';
    }
    const collectionVar = createALlVariablesValuesBasisPrecedence(collectionScopeVars, unTypedCollectionVar);

    val[`collectionVariables`] = collectionVar;
    const collection = {
        collectionId: collectionId,
        collectionJson: val,
        workspace: workspace
    }
    // check if this call require always or if tempReqVarPostResp is not empty
    let collectionResp = await updateCollectionContent(collection)


    const envScopeVars = tempReqVarPostResp.filter(item => item.scope === "Env" && item.isChecked === true);

    let envVariablesResp = {}
    if (selectedEnv != "none") {
        let envVar = cloneDeep(clonedRequest?.envVariables || envVariables || []);
        for (let k = 0; k < envVar.length; k++) {
            // fixed the string extra quote added issue
            const value = envVar[k].value;
            envVar[k].value = typeof value === 'string' ? value : JSON.stringify(value) || '';
        }

        envScopeVars.forEach(newVar => {
            const existingIndex = envVar.findIndex(env => env.key === newVar.key);

            if (existingIndex !== -1) {
                // Replace existing value
                envVar[existingIndex] = newVar;
            } else {
                // Append if no conflict
                envVar.push(newVar);
            }
        });

        envVariablesResp = await updateEnvVariables({ values: envVar, name: selectedEnv, workspace: workspace })
    }

    const globalScopeVars = tempReqVarPostResp.filter(item => item.scope === "Global" && item.isChecked === true);
    let globalVar = cloneDeep(clonedRequest?.globalVariables || globalVariables || []);
    for (let k = 0; k < globalVar.length; k++) {
        // fixed the string extra quote added issue
        const value = globalVar[k].value;
        globalVar[k].value = typeof value === 'string' ? value : JSON.stringify(value) || '';
    }
    globalScopeVars.forEach(newVar => {
        const existingIndex = globalVar.findIndex(env => env.key === newVar.key);

        if (existingIndex !== -1) {
            // Replace existing value
            globalVar[existingIndex] = newVar;
        } else {
            // Append if no conflict
            globalVar.push(newVar);
        }
    });

    let globalVariablesResp = await addGlobalVariables({ values: globalVar, workspace: workspace })


    return {
        assertResults: postScriptResult?.validationsResults || [],
        collectionResponse: collectionResp,
        apiResponse: resp,
        collectionVar: collectionVar,
        testResults: postScriptResult?.testResults || [],
        globalVariables: globalVariablesResp,
        envVariables: envVariablesResp
    }
}

export const extractRequests = (data) => {
    // Initialize an array to hold all requests
    let allRequests = [];

    // Add the main requests array to allRequests
    if (Array.isArray(data.requests)) {
        allRequests = [...data.requests];
    }

    // Helper function to recursively extract requests from nested items
    function extractFromItems(items) {
        for (const itemKey in items) {
            if (items[itemKey].requests && Array.isArray(items[itemKey].requests)) {
                allRequests = [...allRequests, ...items[itemKey].requests];
            }
            if (items[itemKey].items) {
                extractFromItems(items[itemKey].items);
            }
        }
    }

    // Start the recursive extraction from the top-level items
    if (data.items) {
        extractFromItems(data.items);
    }

    return allRequests;
}

export const validateAPICall = (condition, variable, operator, value, parameterObject = {}) => {

    if (condition == "ALWAYS") {
        return true
    } else {
        const actualValue = getValueByPath(parameterObject, variable || "");
        let expectedValue = value;
        let { pass, error } = operatorValidation(operator, actualValue, expectedValue);
        return pass
    }
}