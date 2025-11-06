
const path = require('path');
const fs = require("fs")
const WriteFile = require("../../writeFile")
const { updateUUId } = require('./CollectionRequest');
const { v4: uuidv4 } = require("uuid");
const { getAllCollectionData, createItemsV2, createRequestFileV2, readItems, readRequests } = require("../database/ItemsDatabase");
const { updateCollectionsConfig, getCollectionsConfig } = require("../database/CollectionsConfigDatabase");
const { getWorkSpaces } = require("../database/WorkSpacesDatabase")
const cloneDeep = require('lodash/cloneDeep');
let { window } = require("../constants/constants");
const { convertPostmanToHawkClient } = require("../utils/postmanToHawkClient");
const { hawkClientToPostman } = require("../utils/hawkClientToPostman");
const { formatJSON, collectionFieldsToAvoidSpace, collectionJsonKeyOrder, replaceJsonWithYamlExtension, convertJsonToYaml, convertYamlToJson, requestJsonKeyOrder, reOrderJSONObject } = require("../utils/jsonFormatter")

// deleteCollectionItem - function to delete collection item
const deleteCollectionItem = async (request) => {
    console.log("inside deleteCollectionItem", request)
    const { collectionId, workspace } = request
    let apiTesterCollectionJson = getAllCollectionData(workspace);
    let itemLocation = getItemLocation(collectionId, workspace, "", request.path, apiTesterCollectionJson)
    let existingFolders = getExistingFolders(itemLocation)

    // remove collection folder from remote directory
    if (request.path.length == 0) {
        const folder = `${apiTesterCollectionJson[request.collectionId].name}`;

        let collectionsConfigStruct = getCollectionsConfig()
        let collectionsConfig = collectionsConfigStruct.collectionsConfig
        // delete collection folder from remote path
        let folderpath = collectionsConfig.filter(item => item.id === request.collectionId)
        if (folderpath.length > 0) {
            try {
                const folderPath = path.join(folderpath[0].path, folder);
                fs.rmdirSync(folderPath, { recursive: true });
            } catch (error) {
                console.log("Failed to delete", error)
            }
            // remove entry from collectionsConfig
            let tempcollectionsConfig = collectionsConfig.filter(item => item.id !== request.collectionId)
            updateCollectionsConfig({
                collectionsConfig: tempcollectionsConfig
            })
        } else {
            // delete collection folder from workspace collections folder
            for (const folder of existingFolders) {
                const itemFilePath = path.join(itemLocation, folder, "collection.json");
                const itemFolder = path.join(itemLocation, folder);
                try {
                    let item = JSON.parse(fs.readFileSync(itemFilePath, 'utf8'))
                    if (typeof item === 'object' && item !== null) {
                        if (item.id == collectionId) {

                            try {
                                fs.rmdirSync(itemFolder, { recursive: true });
                            } catch (error) {
                                console.log("Failed to delete collection folder", error)
                            }
                        }
                    }
                } catch (error) {
                    console.log("error in collection json parse", error)
                }
            }
        }

    } else {
        // delete item folder from collections folder
        for (const folder of existingFolders) {
            let itemFilePath = path.join(itemLocation, folder, "item.json");
            const itemFolder = path.join(itemLocation, folder);
            try {
                let item
                if (fs.existsSync(itemFilePath)) {
                    item = JSON.parse(fs.readFileSync(itemFilePath, 'utf8'))
                } else {
                    itemFilePath = path.join(itemLocation, folder, "item.yaml");
                    item = convertYamlToJson(fs.readFileSync(itemFilePath, 'utf8'))
                }
                if (typeof item === 'object' && item !== null) {
                    if (item.id == request.path[request.path.length - 1]) {

                        try {
                            fs.rmdirSync(itemFolder, { recursive: true });
                        } catch (error) {
                            console.log("Failed to delete item folder", error)
                        }
                    }
                }
            } catch (error) {
                console.log("error in item json parse", error)
            }
        }

    }

    apiTesterCollectionJson = getAllCollectionData(workspace);

    return apiTesterCollectionJson;
}

const calculateNamePath = (object, path, namePath, index, n) => {
    if (index == n - 1) {
        let namePathA = [...namePath, { path: path[index], name: object.items[`${path[index]}`]["name"] }]

        return namePathA
    }
    if (n == 0) {
        let namePathA = []
        return namePathA
    }
    let namePathA = [...calculateNamePath(object.items[`${path[index]}`], path, namePath, index + 1, n)]
    namePathA = [{ path: path[index], name: object.items[`${path[index]}`]["name"] }, ...namePathA]
    return namePathA
}

const getDirectoryPath = (workspace, collectionId, isDisableConfigPath = false) => {
    let workSpaceConfig = getWorkSpaces()
    let directoryPath = ""
    for (let i = 0; i < workSpaceConfig.workspaces.length; i++) {
        if (workSpaceConfig.workspaces[i].name == workspace) {
            directoryPath = workSpaceConfig.workspaces[i].path + "/collections"
        }
    }
    if (!isDisableConfigPath) {
        let collectionConfig = getCollectionsConfig()
        for (let i = 0; i < collectionConfig.collectionsConfig.length; i++) {
            if (collectionConfig.collectionsConfig[i].workspace == workspace && collectionConfig.collectionsConfig[i].id == collectionId) {
                directoryPath = collectionConfig.collectionsConfig[i].path
            }
        }
    }
    return directoryPath
}

const getExistingFolders = (directoryPath) => {
    // Get the list of existing collection folders
    const existingFolders = fs.readdirSync(directoryPath).filter(folder => {
        return fs.statSync(path.join(directoryPath, folder)).isDirectory();
    });
    return existingFolders
}

const getItemLocation = (collectionId, workspace, directoryPath, path, apiTesterCollectionJson, isDisableConfigPath = false) => {
    let namePath = calculateNamePath(apiTesterCollectionJson[collectionId], path, [], 0, path.length)
    let namePathString = ""
    for (let i = 0; i < namePath.length - 1; i++) {
        namePathString += "/" + namePath[i].name
    }

    let calculatedDirectoryPath = getDirectoryPath(workspace, collectionId, isDisableConfigPath)
    if (path.length == 0 && directoryPath && directoryPath !== "") {
        calculatedDirectoryPath = directoryPath
    } else if (path.length == 0 && !directoryPath && !(directoryPath !== "")) {
        calculatedDirectoryPath = calculatedDirectoryPath
    } else {
        calculatedDirectoryPath += "/" + apiTesterCollectionJson[collectionId].name
    }
    let itemLocation = calculatedDirectoryPath + namePathString
    return itemLocation
}

// getItemLocationV2 - function to get directory for add item to check if name already exists, this function run 
// for namePath.length instead of namePath.length -1
const getItemLocationV2 = (collectionId, workspace, directoryPath, path, apiTesterCollectionJson) => {
    let namePath = calculateNamePath(apiTesterCollectionJson[collectionId], path, [], 0, path.length)
    let namePathString = ""
    for (let i = 0; i < namePath.length; i++) {
        namePathString += "/" + namePath[i].name
    }

    let calculatedDirectoryPath = getDirectoryPath(workspace, collectionId)
    if (path.length == 0 && directoryPath && directoryPath !== "") {
        calculatedDirectoryPath = directoryPath
    } else if (path.length == 0 && !directoryPath && !(directoryPath !== "") && (collectionId == "" || collectionId == null)) {
        calculatedDirectoryPath = calculatedDirectoryPath
    } else {
        calculatedDirectoryPath += "/" + apiTesterCollectionJson[collectionId].name
    }
    let itemLocation = calculatedDirectoryPath + namePathString
    return itemLocation
}

const duplicateCollectionItem = async (request) => {
    console.log("inside duplicateCollectionItem")
    const { collectionId, name, description, directoryPath, workspace } = request

    let apiTesterCollectionJson = getAllCollectionData(workspace, true);

    // check if folder name already exists
    let itemLocation = getItemLocation(collectionId, workspace, directoryPath, request.path, apiTesterCollectionJson, request.path.length == 0 ? true : false)
    let existingFolders = getExistingFolders(itemLocation)
    if (existingFolders.map(f => f.toLowerCase()).includes(name.toLowerCase())) {
        return {
            error: true,
            errorDescription: "name already exist"
        }
    }

    try {
        if (request.path.length == 0) { // duplicate collection
            let tempCollectionId = uuidv4();

            let collection = updateUUId(apiTesterCollectionJson[collectionId], tempCollectionId)
            collection.name = name

            let collectionsConfigStruct = getCollectionsConfig()
            let collectionsConfig = collectionsConfigStruct.collectionsConfig
            if (directoryPath && directoryPath !== "") { // set directory path for remote collection duplicate
                itemLocation = directoryPath
                collectionsConfig = [...collectionsConfig, { id: tempCollectionId, path: directoryPath, workspace: workspace }]
                updateCollectionsConfig({
                    collectionsConfig: collectionsConfig
                })
            }
            const collectionFolderPath = path.join(itemLocation, name);

            if (!fs.existsSync(collectionFolderPath)) {
                fs.mkdirSync(collectionFolderPath, { recursive: true });
            }
            const requestsPath = path.join(collectionFolderPath);

            createRequestFileV2(requestsPath, collection.requests)
            createItemsV2(collectionFolderPath, collection.items || {});

            let tempCol = cloneDeep(collection)
            delete tempCol.items
            delete tempCol.name
            delete tempCol.requests
            delete tempCol.openAPIDoc
            delete tempCol.files
            delete tempCol.location
            tempCol.id = tempCollectionId
            try {
                const collectionFilePath = path.join(collectionFolderPath, 'collection.json');

                const formattedJSON = formatJSON(tempCol, collectionJsonKeyOrder, collectionFieldsToAvoidSpace);
                WriteFile.WriteFile(collectionFilePath, formattedJSON);

            } catch (error) {
                console.log("error while creating collection file", error)
            }
        } else { // to duplicate folders in a collection
            let tempCollectionId = uuidv4();

            for (const folder of existingFolders) {
                let itemFilePath = path.join(itemLocation, folder, "item.json");
                const itemFolder = path.join(itemLocation, folder);
                try {
                    let item
                    if (fs.existsSync(itemFilePath)) {
                        item = JSON.parse(fs.readFileSync(itemFilePath, 'utf8'))
                    } else {
                        itemFilePath = path.join(itemLocation, folder, "item.yaml");
                        item = convertYamlToJson(fs.readFileSync(itemFilePath, 'utf8'))
                    }
                    if (typeof item === 'object' && item !== null) {
                        if (item.id == request.path[request.path.length - 1]) {

                            let items = readItems(path.join(itemFolder))
                            let requests = readRequests(path.join(itemFolder))
                            let collection = {
                                ...item,
                                name: name,
                                items: items,
                                requests: requests,
                                id: tempCollectionId,
                            }
                            collection = updateUUId(collection, tempCollectionId)

                            const collectionFolderPath = path.join(itemLocation, name);
                            if (!fs.existsSync(collectionFolderPath)) {
                                fs.mkdirSync(collectionFolderPath, { recursive: true });
                            }
                            const requestsPath = path.join(collectionFolderPath);
                            createRequestFileV2(requestsPath, collection.requests)
                            createItemsV2(collectionFolderPath, collection.items || {});

                            let tempCol = cloneDeep(collection)
                            delete tempCol.items
                            delete tempCol.name
                            delete tempCol.requests
                            delete tempCol.openAPIDoc
                            delete tempCol.files
                            delete tempCol.location
                            tempCol.id = tempCollectionId
                            try {
                                const collectionFilePath = path.join(collectionFolderPath, 'item.json');
                                let reOrderJson = reOrderJSONObject(tempCol, requestJsonKeyOrder)
                                const formatedYaml = convertJsonToYaml(reOrderJson)
                                WriteFile.WriteFile(replaceJsonWithYamlExtension(collectionFilePath), formatedYaml);
                            } catch (error) {
                                console.log("error while creating folder file", error)
                            }
                        }
                    }
                } catch (error) {
                    console.log("error in item json parse", error)
                }
            }
        }
    } catch (error) {
        console.log("error in request json parse", error)
    }
    apiTesterCollectionJson = getAllCollectionData(workspace);

    return apiTesterCollectionJson;
}

const getItemLocationForCollectionFolders = (collectionId, workspace, directoryPath, path, apiTesterCollectionJson) => {
    let namePath = calculateNamePath(apiTesterCollectionJson[collectionId], path, [], 0, path.length)
    let namePathString = ""
    for (let i = 0; i < namePath.length; i++) {
        namePathString += "/" + namePath[i].name
    }

    let calculatedDirectoryPath = getDirectoryPath(workspace, collectionId)
    if (path.length == 0 && directoryPath && directoryPath !== "") {
        calculatedDirectoryPath = directoryPath + "/" + apiTesterCollectionJson[collectionId].name
    } else {
        calculatedDirectoryPath += "/" + apiTesterCollectionJson[collectionId].name
    }
    let itemLocation = calculatedDirectoryPath + namePathString

    return itemLocation
}

const addCollectionItem = async (request) => {
    console.log("inside addCollectionItem", request)
    const { collectionId, name, description, directoryPath, workspace } = request

    let apiTesterCollectionJson = getAllCollectionData(workspace);

    // check if folder name already exists
    let itemLocation = getItemLocationV2(collectionId, workspace, "", request.path, apiTesterCollectionJson)
    let existingFolders = getExistingFolders(itemLocation)
    if (existingFolders.map(f => f.toLowerCase()).includes(name.toLowerCase())) {
        return {
            error: true,
            errorDescription: "name already exist"
        }
    }
    // add folder/collection basis itemlocation
    try {
        if (request.collectionId === null || request.collectionId === "") { // add collection
            let tempCollectionId = uuidv4();

            let collection = {
                version: "1.0.0",
                name: name,
                collectionVariables: [],
                description: description,
                items: {},
                requests: [],
                id: tempCollectionId,
                docs: [
                    "## 📝 README  ",
                    "",
                    "This is a default **README** file. Please edit this file to include relevant details about your collection.  ",
                    "",
                    "### 📌 Instructions  ",
                    "",
                    "- Add **collection details**, **API documentation**, and **usage guidelines**.  ",
                    "- Toggle **edit mode** to modify this file.  ",
                    "- Use **Markdown syntax** for formatting (e.g., headings, lists, tables, and code blocks).  ",
                    "",
                    "### 📂 Collection Overview  ",
                    "",
                    "- **Name:** _Enter collection name_  ",
                    "- **Author:** _Your name or team name_  ",
                    "- **Description:** _Provide a brief description_  ",
                    "- **Version:** _Specify version if applicable_  ",
                    "- **Last Updated:** _YYYY-MM-DD_  ",
                    "",
                    "### 🚀 Getting Started  ",
                    "",
                    "1. **Setup:** _Include setup instructions (if any)._  ",
                    "2. **Usage:** _Explain how to use this collection._  ",
                    "3. **Examples:** _Provide example requests or responses._  ",
                    "",
                    "### 📖 Additional Information  ",
                    "",
                    "- **Contributors:** _List contributors or collaborators._  ",
                    "- **Support:** _Provide links for support, issues, or documentation._  ",
                    "",
                    "---",
                    "",
                    "_Happy testing & collaboration!_ 🎉",
                    ""
                ]
            }

            let collectionsConfigStruct = getCollectionsConfig()
            let collectionsConfig = collectionsConfigStruct.collectionsConfig
            if (directoryPath && directoryPath !== "") { // set directory path for remote collection create 
                itemLocation = directoryPath
                collectionsConfig = [...collectionsConfig, { id: tempCollectionId, path: directoryPath, workspace: workspace }]
                updateCollectionsConfig({
                    collectionsConfig: collectionsConfig
                })
            }
            const collectionFolderPath = path.join(itemLocation, name);

            if (!fs.existsSync(collectionFolderPath)) {
                fs.mkdirSync(collectionFolderPath, { recursive: true });
            }
            const requestsPath = path.join(collectionFolderPath);

            createRequestFileV2(requestsPath, collection.requests)

            createItemsV2(collectionFolderPath, collection.items || {});

            let tempCol = cloneDeep(collection)
            delete tempCol.items
            delete tempCol.name
            delete tempCol.requests
            delete tempCol.openAPIDoc
            delete tempCol.files
            delete tempCol.location
            tempCol.id = tempCollectionId
            try {
                const collectionFilePath = path.join(collectionFolderPath, 'collection.json');

                const formattedJSON = formatJSON(tempCol, collectionJsonKeyOrder, collectionFieldsToAvoidSpace);
                WriteFile.WriteFile(collectionFilePath, formattedJSON);
            } catch (error) {
                console.log("error while creating collection file", error)
            }
        } else { // to add folders in a collection
            let tempCollectionId = uuidv4();

            let collection = {
                name: name,
                items: {},
                requests: [],
                id: tempCollectionId,
            }
            let itemLocationfolder = getItemLocationForCollectionFolders(collectionId, workspace, "", request.path, apiTesterCollectionJson)
            const collectionFolderPath = path.join(itemLocationfolder, name);
            if (!fs.existsSync(collectionFolderPath)) {
                fs.mkdirSync(collectionFolderPath, { recursive: true });
            }
            const requestsPath = path.join(collectionFolderPath);
            createRequestFileV2(requestsPath, collection.requests)
            createItemsV2(collectionFolderPath, collection.items || {});

            let tempCol = cloneDeep(collection)
            delete tempCol.items
            delete tempCol.name
            delete tempCol.requests
            delete tempCol.openAPIDoc
            delete tempCol.files
            delete tempCol.location
            tempCol.id = tempCollectionId
            try {
                const collectionFilePath = path.join(collectionFolderPath, 'item.json');
                
                let reOrderJson = reOrderJSONObject(tempCol, requestJsonKeyOrder)
                const formatedYaml = convertJsonToYaml(reOrderJson)
                
                WriteFile.WriteFile(replaceJsonWithYamlExtension(collectionFilePath), formatedYaml);

            } catch (error) {
                console.log("error while creating collection file", error)
            }
        }
    } catch (error) {
        console.log("error in request json parse", error)
    }
    apiTesterCollectionJson = getAllCollectionData(workspace);

    return apiTesterCollectionJson;
}

const renameCollectionItem = async (request) => {
    console.log("inside renameCollectionItem")
    const { collectionId, name, workspace } = request
    let apiTesterCollectionJson = getAllCollectionData(workspace);

    // check if folder name already exists
    let itemLocation = getItemLocation(collectionId, workspace, "", request.path, apiTesterCollectionJson)
    let existingFolders = getExistingFolders(itemLocation)
    
    if (existingFolders.map(f => f.toLowerCase()).includes(name.toLowerCase())) {
        return {
            error: true,
            errorDescription: "name already exist"
        }
    }

    
    for (const file of existingFolders) {
        const oldFilePath = path.join(itemLocation, file);
        const newFilePath = path.join(itemLocation, name);
        try {
            if (request.path.length == 0) { // rename collection
                let collectionJsonfilePath = path.join(oldFilePath, "collection.json")
                let collectionJson = JSON.parse(fs.readFileSync(collectionJsonfilePath, 'utf8'))
                if (collectionJson.id == collectionId) {
                    
                    try {
                        console.log("collection renamed")
                        fs.renameSync(oldFilePath, newFilePath);
                    } catch (error) {
                        fs.rmdirSync(oldFilePath, { recursive: true });
                        console.log("Failed to rename collection folder", error)
                    }
                }
            } else { // rename folder
                let collectionJsonfilePath = path.join(oldFilePath, "item.json")

                let collectionJson
                if (fs.existsSync(collectionJsonfilePath)) {
                    collectionJson = JSON.parse(fs.readFileSync(collectionJsonfilePath, 'utf8'))
                } else {
                    collectionJsonfilePath = path.join(oldFilePath, "item.yaml")
                    collectionJson = convertYamlToJson(fs.readFileSync(collectionJsonfilePath, 'utf8'))
                }

                
                if (collectionJson.id == request.path[request.path.length - 1]) {
                    
                    try {
                        console.log("item renamed")
                        fs.renameSync(oldFilePath, newFilePath);
                    } catch (error) {
                        fs.rmdirSync(oldFilePath, { recursive: true });
                        console.log("Failed to rename item folder", error)
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

const updateCollectionContent = async (request) => {
    console.log("inside updateCollectionContent")
    const { collectionId, workspace, collectionJson } = request
    let apiTesterCollectionJson = getAllCollectionData(workspace);
    let requestPath = []
    let name = collectionJson.name
    // get itemlocation/directoryPath of folder/item
    let itemLocation = getItemLocation(collectionId, workspace, "", requestPath, apiTesterCollectionJson)

    const collectionFolderPath = path.join(itemLocation, name);

    let tempCol = cloneDeep(collectionJson)
    delete tempCol.items
    delete tempCol.name
    delete tempCol.requests
    delete tempCol.openAPIDoc
    delete tempCol.files
    delete tempCol.location
    tempCol.id = collectionId
    try {
        const collectionFilePath = path.join(collectionFolderPath, 'collection.json');

        const formattedJSON = formatJSON(tempCol, collectionJsonKeyOrder, collectionFieldsToAvoidSpace);
        WriteFile.WriteFile(collectionFilePath, formattedJSON);

    } catch (error) {
        console.log("error while creating collection file", error)
    }

    apiTesterCollectionJson = getAllCollectionData(workspace);
    return apiTesterCollectionJson;
}

function checkCollectionLink(collectionConfig, workspace, tempCollectionId) {
    const collection = collectionConfig.find(item => item.id === tempCollectionId && item.workspace === workspace);

    if (collection) {
        return { error: true, errorDescription: "collection already linked" };
    }

    return { error: false };
}

const linkCollection = async (request) => {
    console.log("inside linkCollection")
    const { directoryPath, workspace } = request

    if (directoryPath == "") {
        return {
            error: true,
            errorDescription: "directoryPath cannot be empty"
        }
    }

    const collectionFilePath = path.join(directoryPath, "collection.json");

    if (!fs.existsSync(collectionFilePath)) {
        return {
            error: true,
            errorDescription: "collection.json does not exists"
        }
    }
    let tempCollectionId = ''
    try {
        let item = JSON.parse(fs.readFileSync(collectionFilePath, 'utf8'))
        if (typeof item === 'object' && item !== null) {
            if (typeof item.id == 'string') {
                tempCollectionId = item.id
            } else {
                return {
                    error: true,
                    errorDescription: "invalid collectionId file"
                }
            }
        } else {
            return {
                error: true,
                errorDescription: "invalid collection.json file"
            }
        }
    } catch (error) {
        return {
            error: true,
            errorDescription: "error while reading the collection.json file"
        }
    }

    let collectionsConfigStruct = getCollectionsConfig()
    let collectionsConfig = collectionsConfigStruct.collectionsConfig
    let isCollectionLinked = checkCollectionLink(collectionsConfig, workspace, tempCollectionId)
    
    if (isCollectionLinked.error == true) {
        return isCollectionLinked
    }
    if (directoryPath && directoryPath !== "") {
        // itemLocation = directoryPath
        const updatedPath = path.dirname(directoryPath);
        collectionsConfig = [...collectionsConfig, { id: tempCollectionId, path: updatedPath, workspace: workspace }]
        updateCollectionsConfig({
            collectionsConfig: collectionsConfig
        })

    }

    apiTesterCollectionJson = getAllCollectionData(workspace);
    return apiTesterCollectionJson;
}

const postmanCollectionToHawkCollectionItem = async (request) => {
    console.log("inside postmanCollectionToHawkCollectionItem")
    const { collectionId, name, description, directoryPath, workspace, postmanCollection, type } = request

    if (postmanCollection == null || typeof postmanCollection != 'object') {
        return {
            error: true,
            errorDescription: "Invalid postman collection json"
        }
    }

    let apiTesterCollectionJson = getAllCollectionData(workspace, true);

    // check if folder name already exists
    let itemLocation = getItemLocationV2(collectionId, workspace, "", request.path, apiTesterCollectionJson)
    let existingFolders = getExistingFolders(itemLocation)
    if (existingFolders.map(f => f.toLowerCase()).includes(name.toLowerCase())) {
        return {
            error: true,
            errorDescription: "name already exists"
        }
    }

    try {
        if (request.path.length == 0) { // duplicate collection
            let tempCollectionId = uuidv4();

            let derivedCollection = {}
            if (type == "postman") {
                derivedCollection = convertPostmanToHawkClient(postmanCollection)
            } else if (type == "hawkclient") {
                derivedCollection = postmanCollection;
            }
            
            let collection = updateUUId(derivedCollection, tempCollectionId)
            collection.name = name

            let collectionsConfigStruct = getCollectionsConfig()
            let collectionsConfig = collectionsConfigStruct.collectionsConfig
            if (directoryPath && directoryPath !== "") { // set directory path for remote collection duplicate
                itemLocation = directoryPath
                collectionsConfig = [...collectionsConfig, { id: tempCollectionId, path: directoryPath, workspace: workspace }]
                updateCollectionsConfig({
                    collectionsConfig: collectionsConfig
                })
            }
            const collectionFolderPath = path.join(itemLocation, name);

            if (!fs.existsSync(collectionFolderPath)) {
                fs.mkdirSync(collectionFolderPath, { recursive: true });
            }
            const requestsPath = path.join(collectionFolderPath);

            createRequestFileV2(requestsPath, collection.requests)
            createItemsV2(collectionFolderPath, collection.items || {});

            let tempCol = cloneDeep(collection)
            delete tempCol.items
            delete tempCol.name
            delete tempCol.requests
            delete tempCol.openAPIDoc
            delete tempCol.files
            delete tempCol.location
            tempCol.id = tempCollectionId
            try {
                const collectionFilePath = path.join(collectionFolderPath, 'collection.json');

                const formattedJSON = formatJSON(tempCol, collectionJsonKeyOrder, collectionFieldsToAvoidSpace);
                WriteFile.WriteFile(collectionFilePath, formattedJSON);

            } catch (error) {
                console.log("error while creating collection file", error)
            }
        } else { // to duplicate folders in a collection

        }
    } catch (error) {
        console.log("error in request json parse", error)
    }
    apiTesterCollectionJson = getAllCollectionData(workspace);


    return apiTesterCollectionJson;
}

const hawkClientToPostmanCollection = async (request) => {
    console.log("inside hawkClientToPostmanCollection", request)
    const { collectionId, workspace, name } = request
    let postmanCollection = {}

    let apiTesterCollectionJson = getAllCollectionData(workspace, true);

    try {
        postmanCollection = hawkClientToPostman(apiTesterCollectionJson[collectionId])
    } catch (error) {
        console.log("error in hawk collection json parse", error)
    }

    return postmanCollection;
}

const getCollectionByName = async (request) => {
    console.log("inside getCollectionByName")
    const { workspace, collectionName, includefiles, collectionId } = request;

    let apiTesterCollectionJson = getAllCollectionData(workspace, includefiles);
    if (collectionId) {
        return apiTesterCollectionJson[collectionId] || { error: true, errorDescription: "collection not found" };
    }
    const collection = Object.keys(apiTesterCollectionJson)
        .map(key => apiTesterCollectionJson[key]) // Get the object for each key
        .find(item => item.name === collectionName) || { error: true, errorDescription: "collection not found" }
    return collection;

}

const updateFolderContent = async (request) => {
    console.log("inside updateFolderContent")
    const { collectionId, workspace, folderJson, folderPathArray, folderId } = request
    let apiTesterCollectionJson = getAllCollectionData(workspace);
    let requestPath = folderPathArray || []
    let name = folderJson.name
    // get itemlocation/directoryPath of folder/item
    let itemLocation = getItemLocation(collectionId, workspace, "", requestPath, apiTesterCollectionJson)

    const collectionFolderPath = path.join(itemLocation, name);

    let tempCol = cloneDeep(folderJson)
    delete tempCol.items
    delete tempCol.name
    delete tempCol.requests
    delete tempCol.openAPIDoc
    delete tempCol.files
    delete tempCol.location
    tempCol.id = folderId
    try {
        const collectionFilePath = path.join(collectionFolderPath, 'item.json');

        if (fs.existsSync(collectionFilePath)) {
            fs.unlinkSync(collectionFilePath);
        }

        let reOrderJson = reOrderJSONObject(tempCol, requestJsonKeyOrder)
        const formatedYaml = convertJsonToYaml(reOrderJson)
        WriteFile.WriteFile(replaceJsonWithYamlExtension(collectionFilePath), formatedYaml);

    } catch (error) {
        console.log("error while creating folder file", error)
    }

    apiTesterCollectionJson = getAllCollectionData(workspace);
    return apiTesterCollectionJson;
}

module.exports.deleteCollectionItem = deleteCollectionItem;
module.exports.duplicateCollectionItem = duplicateCollectionItem;
module.exports.addCollectionItem = addCollectionItem;
module.exports.renameCollectionItem = renameCollectionItem;
module.exports.updateCollectionContent = updateCollectionContent;
module.exports.linkCollection = linkCollection;
module.exports.postmanCollectionToHawkCollectionItem = postmanCollectionToHawkCollectionItem;
module.exports.hawkClientToPostmanCollection = hawkClientToPostmanCollection;
module.exports.getCollectionByName = getCollectionByName;
module.exports.updateFolderContent = updateFolderContent;