function convertPostmanToCustomStructure(postmanCollection) {
    const collectionStructure = {
        id: generateUUID(),  // Generate a UUID for the collection
        version: postmanCollection?.info?.version || '1.0.0',
        description: postmanCollection?.info?.description || '',
        name: sanitizeFileName(postmanCollection?.info?.name || "Unnamed Collection"),
        collectionVariables: [],
        requests: [],
        files: [],
        openAPIDoc: "",
        items: {}
    };

    // Process collection-level scripts (pre-request and test)
    if (postmanCollection.event && postmanCollection.event.length > 0) {
        collectionStructure.script = {
            preRequest: postmanCollection.event?.find(e => e.listen === 'prerequest')?.script.exec.join('\n') || '',
            postResponse: postmanCollection.event?.find(e => e.listen === 'test')?.script.exec.join('\n') || ''
        }
    }

    if (postmanCollection.auth) {
        collectionStructure.auth = convertAuth(postmanCollection.auth);
        if (collectionStructure.auth.authType == "inherit") {
            collectionStructure.auth.authType = "none"
        }
    }

    // Process collection-level variables
    if (postmanCollection.variable && postmanCollection.variable.length > 0) {
        collectionStructure.collectionVariables = postmanCollection.variable.map(variable => ({
            key: variable.key,
            value: variable.value,
            type: "text",
            isChecked: variable.disabled === undefined || variable.disabled === false
        }));
    }

    // Initial call to process the Postman collection items
    processItems(postmanCollection.item, collectionStructure);

    return collectionStructure;
}

// Helper function to process items recursively
function processItems(items, parentStructure) {
    items.forEach(item => {
        // Handle if the item is a folder (has sub-items) or a request
        if (item.item) {
            // Process Folder
            const folderId = generateUUID();
            const folder = {
                id: folderId,
                name: item.name,
                requests: [],
                items: {}
            };

            // Recursively process the folder's items
            processItems(item.item, folder);
            parentStructure.items[folderId] = folder; // Add folder to the collection structure
        } else {
            // Process Single Request
            const request = convertRequest(item);
            parentStructure.requests.push(request); // Add request to the parent structure
        }
    });
}

function sanitizeFileName(fileName) {
    // Define a regex that matches invalid characters for most operating systems.
    const invalidChars = /[\/\\?%*:|"<>]/g;
    if (fileName && typeof fileName == 'string') {
        // Replace invalid characters with an empty string or you can replace with an underscore if needed
        return fileName.replace(invalidChars, '_');
    }
    return "Unnamed Request"
}

function convertRequest(postmanRequest) {
    const request = {
        id: generateUUID(),  // Generate a UUID for each request
        name: sanitizeFileName(postmanRequest?.name || "Unnamed Request"),
        method: postmanRequest.request.method,
        url: postmanRequest.request?.url?.raw || '',
        bodyType: getBodyType(postmanRequest.request.body),  // Determine body type
        headers: convertHeaders(postmanRequest.request.header),
        body: convertBody(postmanRequest),
        auth: convertAuth(postmanRequest.request.auth),
        variables: {
            preRequest: [],
            postResponse: []
        },
        apiCalls: {
            preRequest: [],
            postResponse: []
        },
        urlContent: {
            query: convertQueryParams(postmanRequest.request?.url?.query || null)
        },
        validation: [],  // Add validation logic if available
        script: {
            preRequest: postmanRequest.event?.find(e => e.listen === 'prerequest')?.script.exec.join('\n') || '',
            postResponse: postmanRequest.event?.find(e => e.listen === 'test')?.script.exec.join('\n') || ''
        }
    };

    return request;
}

// Helper functions
function generateUUID() {
    // Simulate a UUID generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function convertHeaders(headers) {
    return headers.map(header => ({
        isChecked: true,
        key: header.key,
        value: header.value,
        type: 'text'
    }));
}

function convertBody(postmanRequest) {
    const body = postmanRequest.request.body || {};

    const mode = body.mode || ''; // Determine the mode of the body

    // Handle raw body, if mode is 'raw'
    let rawContent = {
        json: '',
        xml: '',
        text: ''
    };
    if (mode === 'raw') {
        const language = body.options?.raw?.language || 'text'; // Extract the language option
        if (language === 'json') {
            rawContent.json = body.raw || ''; // Treat as JSON body
        } else if (language === 'xml') {
            rawContent.xml = body.raw || ''; // Treat as XML body
        } else {
            rawContent.text = body.raw || ''; // Treat as plain text body
        }
    }

    return {
        json: rawContent.json || body.json || '', // Handle JSON (raw) body
        xml: rawContent.xml || body.xml || '', // Handle XML body
        text: rawContent.text || body.text || '', // Handle plain text body
        'form-data': body['formdata'] ? body['formdata'].map(item => ({
            isChecked: item.disabled ? false : true, // In Postman, `disabled` indicates unchecked
            key: item.key,
            value: item.type === 'file'
                ? Array.isArray(item.src) ? item.src : [item.src] // Handle single and multiple file inputs
                : item.value || '', // Handle text values
            type: item.type
        })) : [],
        'form-urlencoded': body['urlencoded'] ? body['urlencoded'].map(item => ({
            isChecked: item.disabled ? false : true,
            key: item.key,
            value: item.value || '', // Handle urlencoded values
            type: item.type
        })) : [],
        graphql: body.graphql ? convertGraphQLBody(body.graphql) : {}
    };
}

function convertGraphQLBody(graphql) {
    return {
        query: graphql.query || '',
        variables: graphql.variables || ''
    };
}

function convertAuth(auth) {
    if (!auth || !auth.type) {
        return {
            authType: 'none',
            basic: { username: '', password: '' },
            bearer: [],
            awsV4: { accessKey: '', secretKey: '', region: '', service: '', sessionToken: '' }
        };
    }

    switch (auth.type) {
        case 'bearer':
            const bearerToken = auth.bearer.find(token => token.key === 'token');
            return {
                authType: 'bearer',
                basic: { username: '', password: '' }, // No need for basic when bearer auth is used
                bearer: [
                    {
                        key: 'token',
                        value: bearerToken ? bearerToken.value : '', // Extract the token value
                        type: bearerToken ? bearerToken.type : 'string' // Token is usually a string
                    }
                ],
                awsV4: { accessKey: '', secretKey: '', region: '', service: '', sessionToken: '' }
            };

        case 'basic':
            let basicAuth = { username: '', password: '' }
            basicAuth = auth.basic?.reduce((acc, curr) => {
                if (curr.key === 'username') {
                    acc.username = curr.value || '';
                } else if (curr.key === 'password') {
                    acc.password = curr.value || '';
                }
                return acc;
            }, { username: '', password: '' }) || { username: '', password: '' };

            return {
                authType: 'basic',
                basic: basicAuth,
                bearer: [], // No bearer tokens in basic auth
                awsV4: { accessKey: '', secretKey: '', region: '', service: '', sessionToken: '' }
            };

        case 'awsv4':
            const awsV4Auth = {
                accessKey: '',
                secretKey: '',
                region: '',
                service: '',
                sessionToken: ''
            };

            // Map awsv4 keys
            auth.awsv4?.forEach(item => {
                if (item.key === 'accessKey') {
                    awsV4Auth.accessKey = item.value || '';
                } else if (item.key === 'secretKey') {
                    awsV4Auth.secretKey = item.value || '';
                } else if (item.key === 'region') {
                    awsV4Auth.region = item.value || '';
                } else if (item.key === 'service') {
                    awsV4Auth.service = item.value || '';
                } else if (item.key === 'sessionToken') {
                    awsV4Auth.sessionToken = item.value || '';
                }
            });

            return {
                authType: 'awsV4',
                basic: { username: '', password: '' }, // No need for basic when awsV4 is used
                bearer: [], // No bearer token for awsV4
                awsV4: awsV4Auth
            };

        case "inherit":
            return {
                authType: 'inherit',
                basic: { username: '', password: '' },
                bearer: [],
                awsV4: { accessKey: '', secretKey: '', region: '', service: '', sessionToken: '' }
            };

        default:
            return {
                authType: 'none',
                basic: { username: '', password: '' },
                bearer: [],
                awsV4: { accessKey: '', secretKey: '', region: '', service: '', sessionToken: '' }
            };
    }
}

function getBodyType(body) {
    if (!body || !body.mode) return 'noBody'; // Return 'noBody' if no body is provided

    switch (body.mode) {
        case 'graphql':
            return 'graphql';
        case 'raw': {
            const language = body.options?.raw?.language || 'text'; // Determine the raw body language
            switch (language) {
                case 'json':
                    return 'json'; // JSON if the language is JSON
                case 'xml':
                    return 'xml'; // XML if the language is XML
                default:
                    return 'text'; // Default to text if no other specific language is found
            }
        }
        case 'formdata':
            return 'form-data';
        case 'urlencoded':
            return 'form-urlencoded';
        case 'none':
            return 'noBody';
        default:
            return 'noBody'; // Default to 'noBody' if no specific body type is found
    }
}

function convertQueryParams(queryParams) {
    if (!queryParams) return [];
    return queryParams.map(param => ({
        isChecked: true,
        key: param.key,
        value: param.value,
        type: 'text'
    }));
}

module.exports = {
    convertPostmanToHawkClient: convertPostmanToCustomStructure
}