// function to replace {{key}} with actual value in variables array
const replacePlaceholders = (inputString, variables) => {
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

// function to calculate variables giving high precedence to highPrecedencVariables in case of conflict with lowPrecedencVariables
// variables that will be used to replace placholder {{}} with variables values if placholder key matches with variable key
const createVariablesValuesBasisPrecedence = (highPrecedencVariables, lowPrecedencVariables) => {
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

const getPlaceholdersReplacedAuth = (auth, variablesValues) => {
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
    } else if (tempAuth.authType === 'digest') {
        tempAuth.digest = {
            username: replacePlaceholders(tempAuth.digest?.username || '', variablesValues),
            password: replacePlaceholders(tempAuth.digest?.password || '', variablesValues),
        }
    } else if (tempAuth.authType === 'ntlm') {
        tempAuth.ntlm = {
            username: replacePlaceholders(tempAuth.ntlm?.username || '', variablesValues),
            password: replacePlaceholders(tempAuth.ntlm?.password || '', variablesValues),
            domain: replacePlaceholders(tempAuth.ntlm?.domain || '', variablesValues),
        }
    }

    return tempAuth;
}

const getPlaceholdersReplacedBody = (bodyType, body, variablesValues) => {
    let tempBody = body?.[bodyType] || ''
    switch (bodyType) {
        case 'json': {
            return replacePlaceholders(body?.[bodyType] ?? '', variablesValues);
        }
        case 'xml': {
            return replacePlaceholders(body?.[bodyType] ?? '', variablesValues);
        }
        case 'text': {
            return replacePlaceholders(body?.[bodyType] ?? '', variablesValues);
        }
        case 'form-urlencoded': {
            let formUrlEncodedBody = [];
            body?.[bodyType]?.map((formUrlEncodedBodyVal, index) => {
                formUrlEncodedBody.push({ ...formUrlEncodedBodyVal, key: `${replacePlaceholders(formUrlEncodedBodyVal.key, variablesValues)}`, value: replacePlaceholders(formUrlEncodedBodyVal.value, variablesValues) })
            })
            return formUrlEncodedBody
        }
        case 'form-data': {
            let multipartformBody = [];
            body?.[bodyType]?.map((multipartformBodyVal, index) => {
                multipartformBody.push({ ...multipartformBodyVal, key: `${replacePlaceholders(multipartformBodyVal.key, variablesValues)}`, value: multipartformBodyVal.type == 'text' ? replacePlaceholders(multipartformBodyVal.value, variablesValues) : multipartformBodyVal.value })
            })
            return multipartformBody
        }
        case 'graphql': {
            return { query: body?.[bodyType]?.query || '', variables: replacePlaceholders(body?.[bodyType]?.variables || '', variablesValues) };
        }
        default:
            return tempBody
    }
}

// Function to replace placeholders in an object (headers)
const updateHeaders = (headers, variables) => {
    let updatedHeaders = {};

    // Iterate over each header key and value
    for (let [key, value] of Object.entries(headers)) {
        // Replace placeholders in both key and value
        let updatedKey = replacePlaceholders(key, variables);
        let updatedValue = replacePlaceholders(value, variables);

        // Update the headers object with the replaced values
        updatedHeaders[updatedKey] = updatedValue;
    }

    return updatedHeaders;
};

const prepareAPIRequest = (request, variablesValues) => {
    let headers = {};
    variablesValues = createVariablesValuesBasisPrecedence(request.variables?.preRequest || [], variablesValues)
    headers = updateHeaders(request.headers, variablesValues)
    const parsedRequest = {
        method: request.method,
        url: replacePlaceholders(request.url, variablesValues),
        body: request.body?.[request.bodyType] ? getPlaceholdersReplacedBody(request.bodyType, request.body, variablesValues) : null,
        headers: headers,
        bodyType: request.bodyType,
        auth: getPlaceholdersReplacedAuth(request.auth, variablesValues)
    }
    return parsedRequest
}

function getClientCertificate(targetUrl, clientCertificates) {
    let { hostname, port } = new URL(targetUrl);
    // console.log("hostname", hostname, targetUrl)

    if (port) {
        hostname = hostname + ":" + port
    }
    // console.log("hostname", hostname, targetUrl)
    return (
        clientCertificates.find((cert) => hostname.endsWith(cert.host)) || null
    );
}

// see if matchDomain can be used in place of getClientCertificate
function matchDomain(requestUrl, allowedDomains) {
    let { hostname, port } = new URL(requestUrl);

    if (port) {
        hostname = hostname + ":" + port;
    }

    return allowedDomains.some((domain) => {
        const hostRegex = new RegExp('^' + domain.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        return hostRegex.test(hostname);
    });
}

// function to calculate variables giving high precedence to envVariable in case of conflict with global variable
// variables that will be used to replace placholder {{}} with variables values if placholder key matches with variable key
const createVariablesValues = (envVariables, globalVariables, collectionVariables) => {
    let variablesValues = [];

    // Retrieve the selected environment's variables
    let selectedEnvVariables = envVariables || [];

    // Filter the selected environment variables to include only those that are checked
    selectedEnvVariables = selectedEnvVariables.filter(variable => variable.isChecked);

    // Filter the global variables to include only those that are checked
    let checkedGlobalVariables = globalVariables.filter(variable => variable.isChecked);

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

module.exports = {
    prepareAPIRequest,
    createVariablesValuesBasisPrecedence,
    getPlaceholdersReplacedAuth,
    getClientCertificate,
    createVariablesValues,
    replacePlaceholders
};