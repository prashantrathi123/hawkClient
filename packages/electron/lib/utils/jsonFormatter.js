const yaml = require('js-yaml');

const requestJsonKeyOrder = [
    "id",
    "method",
    "url",
    "urlContent",
    "bodyType",
    "body",
    "headers",
    "auth",
    "script",
    "variables",
    "validation",
    "apiCalls"
];

const requestFieldsToSpace = new Set(["method", "url", "urlContent", "body"]);

// Function to reorder keys and format JSON
const formatJSON = (data, order, excludeKeys = new Set([])) => {
    const sortedData = {};

    // Add fields in the given order first
    order.forEach((key) => {
        if (data.hasOwnProperty(key)) {
            sortedData[key] = data[key];
        }
    });

    // Add remaining fields that are not in the order at the end
    Object.keys(data).forEach((key) => {
        if (!sortedData.hasOwnProperty(key)) {
            sortedData[key] = data[key];
        }
    });

    const formattedJSON = JSON.stringify(sortedData, null, "\t").replace(
        /,\n\t"([^"]+)":/g,
        (match, key) => excludeKeys.has(key) ? match : `,\n\n\n\t"${key}":`
    );

    return formattedJSON;
};

const collectionJsonKeyOrder = [
    "id",
    "version",
    "description",
    "auth",
    "script",
    "collectionVariables"
];

const collectionFieldsToAvoidSpace = new Set(["version", "description"]);

function replaceTabsInStrings(obj) {
    if (typeof obj === "string") {
        return obj.replace(/\t/g, "    "); // Replace tabs with spaces
    } else if (Array.isArray(obj)) {
        return obj.map(replaceTabsInStrings);
    } else if (typeof obj === "object" && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, replaceTabsInStrings(value)])
        );
    }
    return obj;
}

function convertJsonToYaml(jsonData) {
    try {
        if (jsonData.docs) {
            jsonData.docs = Array.isArray(jsonData.docs)
                ? jsonData.docs.join('\n')
                : (jsonData.docs || '')
        }
        if (jsonData.script && jsonData.script.preRequest) {
            jsonData.script.preRequest = Array.isArray(jsonData?.script.preRequest)
                ? jsonData.script.preRequest.join('\n')
                : (jsonData.script.preRequest || '')
        }
        if (jsonData.script && jsonData.script.postResponse) {
            jsonData.script.postResponse = Array.isArray(jsonData?.script.postResponse)
                ? jsonData.script.postResponse.join('\n')
                : (jsonData.script.postResponse || '')
        }
        let formjsonData = replaceTabsInStrings(jsonData)

        let yamlString = yaml.dump(formjsonData, {
            lineWidth: -1, // Prevent wrapping
            noArrayIndent: true, // Keep clean formatting
        });

        let excludeKeys = requestFieldsToSpace;
        // Ensure every root key is separated by a blank line
        // yamlString = yamlString.replace(/^(\w+:)/gm, (match, key) => excludeKeys.has(key) ? match : `\n\n${key}`);

        // more accurate version see if it needs to be enabled
        yamlString = yamlString.replace(/^([a-zA-Z0-9_-]+):/gm, (match, key) =>
            excludeKeys.has(key) ? match : `\n\n${match}`
        );

        return yamlString.trim(); // Trim to remove leading/trailing newlines

    } catch (e) {
        console.error("Error converting JSON to YAML:", e);
        return null;
    }
}

function convertYamlToJson(yamlString) {
    try {
        return yaml.load(yamlString);
    } catch (e) {
        console.error("Error converting YAML to JSON:", e);
        return null;
    }
}

function replaceJsonWithYamlExtension(requestFilePath) {
    return requestFilePath.replace(/\.json$/, ".yaml");
}

function replaceYamlWithJsonExtension(requestFilePath) {
    return requestFilePath.replace(/\.yaml$/i, ".json"); // Case-insensitive replacement
}

// Function to reorder keys and format JSON
const reOrderJSONObject = (data, order) => {
    const sortedData = {};

    // Add fields in the given order first
    order.forEach((key) => {
        if (data.hasOwnProperty(key)) {
            sortedData[key] = data[key];
        }
    });

    // Add remaining fields that are not in the order at the end
    Object.keys(data).forEach((key) => {
        if (!sortedData.hasOwnProperty(key)) {
            sortedData[key] = data[key];
        }
    });

    return sortedData;
};

function getFileNameWithoutExtension(fileName) {

    // Find the last index of the dot
    const lastDotIndex = fileName.lastIndexOf('.');

    // If there's no dot, return the fileName as is
    if (lastDotIndex === -1) {
        return fileName;
    }

    // Return the substring from the start to the last dot index
    return fileName.substring(0, lastDotIndex);
}

module.exports = {
    formatJSON,
    requestJsonKeyOrder,
    requestFieldsToSpace,
    collectionJsonKeyOrder,
    collectionFieldsToAvoidSpace,
    convertJsonToYaml,
    convertYamlToJson,
    replaceJsonWithYamlExtension,
    replaceYamlWithJsonExtension,
    reOrderJSONObject,
    getFileNameWithoutExtension
}