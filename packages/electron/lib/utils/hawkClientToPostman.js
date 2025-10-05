function convertCustomStructureToPostman(collectionStructure) {
    console.log("collectionStructure", collectionStructure)
    const postmanCollection = {
        info: {
            name: collectionStructure.name,
            description: collectionStructure.description,
            version: collectionStructure.version,
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: [],
        variable: [],
        event: []
    };

    // Add collection-level scripts (pre-request and test)
    if (collectionStructure.script) {
        if (collectionStructure.script.preRequest) {
            const scriptContent = Array.isArray(collectionStructure.script.preRequest) ? collectionStructure.script.preRequest : collectionStructure.script.preRequest.split('\n');
            postmanCollection.event.push({
                listen: 'prerequest',
                script: { exec: scriptContent }
            });
        }
        if (collectionStructure.script.postResponse) {
            const scriptContent = Array.isArray(collectionStructure.script.postResponse) ? collectionStructure.script.postResponse : collectionStructure.script.postResponse.split('\n');
            postmanCollection.event.push({
                listen: 'test',
                script: { exec: scriptContent }
            });
        }
    }

    // Add collection-level auth
    if (collectionStructure.auth) {
        postmanCollection.auth = reverseConvertAuth(collectionStructure.auth);
    }

    // Add collection variables
    if (collectionStructure.collectionVariables && collectionStructure.collectionVariables.length > 0) {
        postmanCollection.variable = collectionStructure.collectionVariables.map(variable => ({
            key: variable.key,
            value: variable.value,
            disabled: !variable.isChecked
        }));
    }

    // Process the items (folders) and requests
    reverseProcessItemsAndRequests(collectionStructure.items, collectionStructure.requests, postmanCollection);

    return postmanCollection;
}

function reverseProcessItemsAndRequests(items, requests, parentStructure) {
    // Process folders (items) first
    if (items && Object.keys(items).length > 0) {
        Object.values(items).forEach(item => {
            const folder = {
                name: item.name,
                item: []
            };

            // Recursively process sub-items in the folder
            reverseProcessItemsAndRequests(item.items, item.requests, folder);
            parentStructure.item.push(folder);
        });
    }

    // Process requests (if available) within the current structure
    if (requests && requests.length > 0) {
        requests.forEach(request => {
            const postmanRequest = reverseConvertRequest(request);
            parentStructure.item.push(postmanRequest);
        });
    }
}

function reverseConvertRequest(request) {
    return {
        name: request.name,
        request: {
            method: request.method,
            url: reverseConvertPostmanUrl(request.url, request?.urlContent?.query || []),
            header: reverseConvertHeaders(request.headers),
            body: reverseConvertBody(request.bodyType, request.body),
            auth: reverseConvertAuth(request.auth)
        },
        event: [
            {
                listen: 'prerequest',
                script: {
                    exec: Array.isArray(request.script?.preRequest)
                        ? request.script.preRequest
                        : typeof request.script?.preRequest === 'string'
                            ? request.script.preRequest.split('\n')
                            : []
                }
            },
            {
                listen: 'test',
                script: {
                    exec: Array.isArray(request.script?.postResponse)
                        ? request.script.postResponse
                        : typeof request.script?.postResponse === 'string'
                            ? request.script.postResponse.split('\n')
                            : []
                }
            }
        ]
    };
}

function reverseConvertPostmanUrl(rawUrl, queryParams) {
    try {
        // Check if the URL contains variable-like placeholders (e.g., {{token_api_host}})
        if (rawUrl.includes('{{')) {
            // Split the raw URL into parts based on '/'
            const [hostPart, ...pathParts] = rawUrl.split('/').filter(Boolean); // filter to remove any empty elements

            // Return the URL structure for a variable-based host
            return {
                raw: rawUrl,
                host: [hostPart], // Host is expected to be a variable here
                path: pathParts,  // Remaining parts are path segments
                // query: reverseConvertQueryParams(queryParams || [])
            };
        } else {
            // For full URL handling (without placeholders)
            const url = new URL(rawUrl);

            // Parse host and protocol
            const host = url.hostname.split('.');
            const protocol = url.protocol.replace(':', '');  // Remove the colon from protocol

            // Parse path segments
            const path = url.pathname.split('/').filter(Boolean);  // Remove any empty segments caused by leading/trailing slashes

            // Process query parameters
            const query = reverseConvertQueryParams(queryParams || []);

            return {
                raw: rawUrl,
                protocol: protocol,
                host: host,
                path: path,
                query: query,
                port: url.port ? url.port : undefined  // Optional port field
            };
        }
    } catch (error) {
        // console.error('Invalid URL:', rawUrl, error);
        return {
            raw: rawUrl,
            // query: reverseConvertQueryParams(queryParams || [])
        };  // Return the raw URL if parsing fails
    }
}


function reverseConvertHeaders(headers) {
    return headers && headers?.map(header => ({
        key: header.key,
        value: header.value
    })) || [];
}

function reverseConvertBody(bodyType, body) {
    switch (bodyType) {
        case 'json':
            return {
                mode: 'raw',
                raw: body?.json,
                options: { raw: { language: 'json' } }
            };
        case 'xml':
            return {
                mode: 'raw',
                raw: body?.xml,
                options: { raw: { language: 'xml' } }
            };
        case 'text':
            return {
                mode: 'raw',
                raw: body?.text,
                options: { raw: { language: 'text' } }
            };
        case 'form-data':
            return {
                mode: 'formdata',
                formdata: body?.['form-data']?.map(item => ({
                    key: item.key,
                    value: item.value,
                    type: item.type,
                    disabled: !item.isChecked
                })) || []
            };
        case 'form-urlencoded':
            return {
                mode: 'urlencoded',
                urlencoded: body?.['form-urlencoded']?.map(item => ({
                    key: item.key,
                    value: item.value,
                    disabled: !item.isChecked
                })) || []
            };
        case 'graphql':
            return {
                mode: 'graphql',
                graphql: {
                    query: body?.graphql?.query,
                    variables: body?.graphql?.variables
                }
            };
        default:
            return {};
    }
}

function reverseConvertAuth(auth) {
    switch (auth?.authType) {
        case 'bearer':
            return {
                type: 'bearer',
                bearer: [
                    {
                        key: 'token',
                        value: auth?.bearer?.[0]?.value
                    }
                ]
            };
        case 'basic':
            return {
                type: 'basic',
                basic: [
                    { key: 'username', value: auth?.basic?.username },
                    { key: 'password', value: auth?.basic?.password }
                ]
            };
        case 'awsV4':
            return {
                type: 'awsv4',
                awsv4: [
                    { key: 'accessKey', value: auth?.awsV4?.accessKey },
                    { key: 'secretKey', value: auth?.awsV4?.secretKey },
                    { key: 'region', value: auth?.awsV4?.region },
                    { key: 'service', value: auth?.awsV4?.service },
                    { key: 'sessionToken', value: auth?.awsV4?.sessionToken }
                ]
            };
        default:
            return {};
    }
}

function reverseConvertQueryParams(queryParams) {
    return queryParams && queryParams?.map(param => ({
        key: param.key,
        value: param.value
    })) || [];
}

module.exports = {
    hawkClientToPostman: convertCustomStructureToPostman
};
