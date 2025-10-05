const path = require('path');
const fs = require("fs")
const { getCollectionsConfig } = require("../database/CollectionsConfigDatabase");
const { getWorkSpaces } = require("../database/WorkSpacesDatabase")

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

const getExistingFiles = (directoryPath) => {
    // Get the list of existing files
    const existingFiles = fs.readdirSync(directoryPath).filter(file => {
        return fs.statSync(path.join(directoryPath, file)).isFile();
    });
    return existingFiles;
};

const getDirectoryPath = (workspace, collectionId) => {
    let workSpaceConfig = getWorkSpaces()
    let directoryPath = ""
    for (let i = 0; i < workSpaceConfig.workspaces.length; i++) {
        if (workSpaceConfig.workspaces[i].name == workspace) {
            directoryPath = workSpaceConfig.workspaces[i].path + "/collections"
        }
    }
    let collectionConfig = getCollectionsConfig()
    for (let i = 0; i < collectionConfig.collectionsConfig.length; i++) {
        if (collectionConfig.collectionsConfig[i].workspace == workspace && collectionConfig.collectionsConfig[i].id == collectionId) {
            directoryPath = collectionConfig.collectionsConfig[i].path
        }
    }
    return directoryPath
}

const getRequestLocation = (collectionId, workspace, directoryPath, path, apiTesterCollectionJson) => {
    let namePath = calculateNamePath(apiTesterCollectionJson[collectionId], path, [], 0, path.length)
    let namePathString = ""
    for (let i = 0; i < namePath.length; i++) {
        namePathString += "/"+ namePath[i].name
    }

    let calculatedDirectoryPath = getDirectoryPath(workspace, collectionId)
    if (path.length == 0 && directoryPath && directoryPath !== "") {
        calculatedDirectoryPath = directoryPath
    } else if (path.length == 0) {
        calculatedDirectoryPath += "/" + apiTesterCollectionJson[collectionId].name
    } else {
        calculatedDirectoryPath += "/" + apiTesterCollectionJson[collectionId].name
    }
    let itemLocation = calculatedDirectoryPath + namePathString
    return itemLocation
}

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
    getExistingFiles,
    getDirectoryPath,
    getRequestLocation,
    getFileNameWithoutExtension
};