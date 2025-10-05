
const path = require('path');
const fs = require("fs")
const WriteFile = require("../../writeFile")
const { v4: uuidv4 } = require("uuid");
const { getAllCollectionData } = require("../database/ItemsDatabase");
const cloneDeep = require('lodash/cloneDeep');
const { getExistingFiles, getDirectoryPath, getRequestLocation } = require("../utils/utils")
const { formatJSON, requestFieldsToSpace, requestJsonKeyOrder, convertJsonToYaml, replaceJsonWithYamlExtension, reOrderJSONObject, convertYamlToJson } = require("../utils/jsonFormatter")


const updateCollectionRequest = async (request) => {
    const { workspace } = request
    let apiTesterCollectionJson = getAllCollectionData(workspace);
    const collectionId = request.collectionName


    let reuestItemLocation = getRequestLocation(collectionId, workspace, "", request.path, apiTesterCollectionJson)
    let existingFiles = getExistingFiles(reuestItemLocation)
    // console.log("existingFiles", existingFiles)
    const requestFilePath = reuestItemLocation + "/" + request.request.name + ".json";

    // check if file name already exists for json
    if (existingFiles.map(f => f.toLowerCase()).includes(request.request.name.toLowerCase() + ".json")) {
        let filerq = {}
        // check if rename is executed or not
        if (fs.existsSync(requestFilePath)) {
            if (path.extname(request.request.name + ".json") === '.json') {
                try {
                    let req = JSON.parse(fs.readFileSync(requestFilePath, 'utf8'))
                    if (typeof req === 'object' && req !== null) {
                        filerq = req
                    }
                } catch (error) {
                    console.log("error in request json parse", error)
                }
            }
        }
        if (request.request.id != filerq.id) {
            return {
                error: true,
                errorDescription: "file name already exist"
            }
        }
    }

    // check if file name already exists for yaml
    if (existingFiles.map(f => f.toLowerCase()).includes(request.request.name.toLowerCase() + ".yaml")) {
        let filerq = {}
        // check if rename is executed or not
        if (fs.existsSync(replaceJsonWithYamlExtension(requestFilePath))) {
            if (path.extname(request.request.name + ".yaml") === '.yaml') {
                try {
                    let req = convertYamlToJson(fs.readFileSync(replaceJsonWithYamlExtension(requestFilePath), 'utf8'))
                    if (typeof req === 'object' && req !== null) {
                        filerq = req
                    }
                } catch (error) {
                    console.log("error in request json parse", error)
                }
            }
        }
        if (request.request.id != filerq.id) {
            return {
                error: true,
                errorDescription: "file name already exist"
            }
        }
    }

    // rename file
    for (const file of existingFiles) {
        const oldFilePath = path.join(reuestItemLocation, file);
        const newFilePath = path.join(reuestItemLocation, request.request.name + ".json");
        try {
            if (oldFilePath.endsWith('.json')) {
                let req = JSON.parse(fs.readFileSync(oldFilePath, 'utf8'))
                if (typeof req === 'object' && req !== null) {
                    if (req.id == request.request.id) {
                        try {
                            fs.renameSync(oldFilePath, newFilePath);
                        } catch (error) {
                            console.log("Failed to rename req file", error)
                        }
                    }
                }
            } else if (oldFilePath.endsWith('.yaml')) {
                let req = convertYamlToJson(fs.readFileSync(oldFilePath, 'utf8'))
                if (typeof req === 'object' && req !== null) {
                    if (req.id == request.request.id) {
                        try {
                            fs.renameSync(replaceJsonWithYamlExtension(oldFilePath), replaceJsonWithYamlExtension(newFilePath));
                        } catch (error) {
                            console.log("Failed to rename req file", error)
                        }
                    }
                }
            }

        } catch (error) {
            console.log("error in request json parse", error)
        }
    }
    let tempRequest = cloneDeep(request.request)
    delete tempRequest.name
    if (tempRequest.validation) {
        delete tempRequest.assert
    }

    if (fs.existsSync(requestFilePath)) {
        fs.unlinkSync(requestFilePath);
    }

    // write to a yaml file
    let reOrderJson = reOrderJSONObject(tempRequest, requestJsonKeyOrder)
    var formateYaml = convertJsonToYaml(reOrderJson)
    WriteFile.WriteFile(replaceJsonWithYamlExtension(requestFilePath), formateYaml);

    apiTesterCollectionJson = getAllCollectionData(workspace);

    return apiTesterCollectionJson
}

const updateUUId = (collection, id) => {
    // Create a deep copy of the collection to avoid mutating the original
    const tempCollection = cloneDeep(collection);

    // Update the IDs in the requests
    for (let i = 0; i < tempCollection.requests.length; i++) {
        tempCollection.requests[i].id = uuidv4();
    }

    // Initialize the new items object
    const newItems = {};

    // Iterate over the items and update their IDs
    for (const [key, item] of Object.entries(tempCollection.items)) {
        const newId = uuidv4();
        newItems[newId] = updateUUId(item, newId);  // Recursively update nested items
    }

    // Replace the old items with the new items
    tempCollection.items = newItems;

    // Set the new id for the collection
    tempCollection.id = id;

    return tempCollection;
};

const deleteCollectionRequest = async (request) => {

    const { collectionId, requestId, workspace } = request
    let apiTesterCollectionJson = getAllCollectionData(workspace);
    let reuestItemLocation = getRequestLocation(collectionId, workspace, "", request.path, apiTesterCollectionJson)
    let existingFiles = getExistingFiles(reuestItemLocation)

    for (const file of existingFiles) {
        const filePath = path.join(reuestItemLocation, file);

        try {
            if (filePath.endsWith('.json')) {
                let req = JSON.parse(fs.readFileSync(filePath, 'utf8'))
                if (typeof req === 'object' && req !== null) {
                    if (req.id == requestId) {

                        try {
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath);
                            }
                            if (fs.existsSync(replaceJsonWithYamlExtension(filePath))) {
                                fs.unlinkSync(replaceJsonWithYamlExtension(filePath));
                            }
                        } catch (error) {
                            console.log("Failed to delete req file", error)
                        }
                    }
                }
            } else if (filePath.endsWith('.yaml')) {
                let req = convertYamlToJson(fs.readFileSync(filePath, 'utf8'))
                if (typeof req === 'object' && req !== null) {
                    if (req.id == requestId) {
                        try {
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath);
                            }
                            if (fs.existsSync(replaceJsonWithYamlExtension(filePath))) {
                                fs.unlinkSync(replaceJsonWithYamlExtension(filePath));
                            }
                        } catch (error) {
                            console.log("Failed to delete req file", error)
                        }
                    }
                }
            }
        } catch (error) {
            console.log("error in request json parse", error)
        }
    }
    apiTesterCollectionJson = getAllCollectionData(workspace);
    return apiTesterCollectionJson;
}

const duplicateCollectionRequest = (request) => {
    const { collectionId, name, requestId, workspace } = request
    let apiTesterCollectionJson = getAllCollectionData(workspace);

    // check if file name already exists
    let reuestItemLocation = getRequestLocation(collectionId, workspace, "", request.path, apiTesterCollectionJson)
    let existingFiles = getExistingFiles(reuestItemLocation)
    const requestFilePath = reuestItemLocation + "/" + name + ".json";
    if (existingFiles.map(f => f.toLowerCase()).includes(name.toLowerCase() + ".json")) {
        return {
            error: true,
            errorDescription: "file name already exist"
        }
    }
    if (existingFiles.map(f => f.toLowerCase()).includes(name.toLowerCase() + ".yaml")) {
        return {
            error: true,
            errorDescription: "file name already exist"
        }
    }

    for (const file of existingFiles) {
        const filePath = path.join(reuestItemLocation, file);
        try {
            if (filePath.endsWith('.json')) {

                let req = JSON.parse(fs.readFileSync(filePath, 'utf8'))
                if (typeof req === 'object' && req !== null) {
                    let tempReq = cloneDeep(req)
                    tempReq.id = uuidv4()
                    delete tempReq.name
                    if (req.id == requestId) {

                        // write to a yaml file
                        let reOrderJson = reOrderJSONObject(tempReq, requestJsonKeyOrder)
                        var formateYaml = convertJsonToYaml(reOrderJson)
                        WriteFile.WriteFile(replaceJsonWithYamlExtension(requestFilePath), formateYaml);
                    }
                }
            } else if (filePath.endsWith('.yaml')) {
                let req = convertYamlToJson(fs.readFileSync(filePath, 'utf8'))
                if (typeof req === 'object' && req !== null) {
                    let tempReq = cloneDeep(req)
                    tempReq.id = uuidv4()
                    delete tempReq.name
                    if (req.id == requestId) {

                        // write to a yaml file
                        let reOrderJson = reOrderJSONObject(tempReq, requestJsonKeyOrder)
                        var formateYaml = convertJsonToYaml(reOrderJson)
                        WriteFile.WriteFile(replaceJsonWithYamlExtension(requestFilePath), formateYaml);
                    }
                }
            }
        } catch (error) {
            console.log("error in request json parse", error)
        }
    }
    apiTesterCollectionJson = getAllCollectionData(workspace);
    return apiTesterCollectionJson;
}

const addCollectionRequest = async (request) => {
    const { collectionId, path, name, workspace, type } = request
    let apiTesterCollectionJson = getAllCollectionData(workspace);

    // check if file name already exists
    let reuestItemLocation = getRequestLocation(collectionId, workspace, "", path, apiTesterCollectionJson)
    let existingFiles = getExistingFiles(reuestItemLocation)
    const requestFilePath = reuestItemLocation + "/" + name + ".json";
    if (existingFiles.map(f => f.toLowerCase()).includes(name.toLowerCase() + ".json")) {
        return {
            error: true,
            errorDescription: "file name already exist"
        }
    }
    if (existingFiles.map(f => f.toLowerCase()).includes(name.toLowerCase() + ".yaml")) {
        return {
            error: true,
            errorDescription: "file name already exist"
        }
    }
    let tempReq = {
        "id": uuidv4(),
        type: type || "http",
        "method": "GET",
        "url": "http://localhost:3000/new-request",
        "bodyType": "noBody",
        "auth": {
            "authType": 'none'
        },
        "urlContent": {
            "query": []
        }
    }


    // write to a yaml file
    let reOrderJson = reOrderJSONObject(tempReq, requestJsonKeyOrder)
    var formateYaml = convertJsonToYaml(reOrderJson)
    WriteFile.WriteFile(replaceJsonWithYamlExtension(requestFilePath), formateYaml);

    apiTesterCollectionJson = getAllCollectionData(workspace);

    return apiTesterCollectionJson;
}

const renameFileAndRequest = async (request) => {
    const { fileFolderPath, currentFileName, newFileName, workspace } = request

    let existingFiles = getExistingFiles(fileFolderPath)
    const oldFilePath = fileFolderPath + "/" + currentFileName;
    const newFilePath = fileFolderPath + "/" + newFileName;

    if (existingFiles.map(f => f.toLowerCase()).includes(newFileName.toLowerCase())) {
        return {
            error: true,
            errorDescription: "file name already exist"
        }
    }

    if (fs.existsSync(oldFilePath)) {
        fs.renameSync(oldFilePath, newFilePath);
    }
    if (fs.existsSync(replaceJsonWithYamlExtension(oldFilePath))) {
        fs.renameSync(replaceJsonWithYamlExtension(oldFilePath), replaceJsonWithYamlExtension(newFilePath));
    }

    let apiTesterCollectionJson = getAllCollectionData(workspace);

    return apiTesterCollectionJson;
}

module.exports.updateCollectionRequest = updateCollectionRequest;
module.exports.deleteCollectionRequest = deleteCollectionRequest;
module.exports.duplicateCollectionRequest = duplicateCollectionRequest;
module.exports.addCollectionRequest = addCollectionRequest;
module.exports.updateUUId = updateUUId;
module.exports.renameFileAndRequest = renameFileAndRequest;
