
const path = require('path');
const fs = require("fs")
const WriteFile = require("../../writeFile")
const constants = require('../constants/constants')
const collectionsConfigJsonPath = path.join(constants.WorkSpaceFolderPath, '/linkedCollections/collectionsConfig.json');

// getCollectionsConfig - function to get All workspaces data
const getCollectionsConfig = () => {
    let folderName = path.join(constants.WorkSpaceFolderPath, '/linkedCollections')
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    if (!fs.existsSync(collectionsConfigJsonPath)) {
        updateCollectionsConfig({
            collectionsConfig: []
        })
    }
    let workSpacesJson = JSON.parse(fs.readFileSync(collectionsConfigJsonPath, 'utf8'));
    return workSpacesJson
}

// updateCollectionsConfig - function to update all workspaces data
const updateCollectionsConfig = (workSpacesJson) => {
    let folderName = path.join(constants.WorkSpaceFolderPath, '/linkedCollections')
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    if (!fs.existsSync(collectionsConfigJsonPath)) {
        WriteFile.WriteFile(collectionsConfigJsonPath, JSON.stringify({collectionsConfig: []}, null, 2))
    }
    WriteFile.WriteFile(collectionsConfigJsonPath, JSON.stringify(workSpacesJson, null, 2))
    return workSpacesJson
}

module.exports = {
    getCollectionsConfig,
    updateCollectionsConfig
};
