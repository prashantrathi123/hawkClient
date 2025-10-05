
const path = require('path');
const fs = require("fs")
const WriteFile = require("../../writeFile")
const { getWorkSpaces } = require("./WorkSpacesDatabase");
const { getExistingFiles, getFileNameWithoutExtension } = require("../utils/utils")
const { v4: uuidv4 } = require("uuid");

// getAllGlobalVariablesData - function to get All collection data
const getAllGlobalVariablesData = (workspace=null) => {
    const workSpaceData = getWorkSpaces()
    let selectedWorkSpace = workSpaceData.selectedWorkSpace
    if (workspace != null) {
        selectedWorkSpace = workspace
        console.log("workspace overwritten with value:", workspace)
    }
    if (selectedWorkSpace == "none") {
        return {
            id: "44fbfd20-8419-49e9-bde6-d5dce6bb02c5",
            name: "Global Environment",
            description: "Global desc",
            values: []
        }
    }
    const workspacePath = workSpaceData.workspaces.find(ws => ws.name === selectedWorkSpace)?.path;
    const globalVariablesfilePath = path.join(workspacePath, '/variables/globalVariable.json');

    let folderName = path.join(workspacePath, '/variables')


    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    if (!fs.existsSync(globalVariablesfilePath)) {
        updateGlobalVariablesData({
            id: "44fbfd20-8419-49e9-bde6-d5dce6bb02c5",
            name: "Global Environment",
            description: "Global desc",
            values: []
        }, selectedWorkSpace)
    }
    let globalVariablesJson = JSON.parse(fs.readFileSync(globalVariablesfilePath, 'utf8'));
    return globalVariablesJson
}

// updateGlobalVariablesData - function to update all collection data
const updateGlobalVariablesData = (globalVariablesJson, workspace=null) => {
    const workSpaceData = getWorkSpaces()
    let selectedWorkSpace = workSpaceData.selectedWorkSpace
    if (workspace != null) {
        selectedWorkSpace = workspace
        console.log("updateGlobalVariablesData: workspace overwritten with value:", workspace)
    }
    if (selectedWorkSpace == "none") {
        return {
            id: "44fbfd20-8419-49e9-bde6-d5dce6bb02c5",
            name: "Global Environment",
            description: "Global desc",
            values: []
        }
    }
    const workspacePath = workSpaceData.workspaces.find(ws => ws.name === selectedWorkSpace)?.path;
    const globalVariablesfilePath = path.join(workspacePath, '/variables/globalVariable.json');

    let folderName = path.join(workspacePath, '/variables')


    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    WriteFile.WriteFile(globalVariablesfilePath, JSON.stringify(globalVariablesJson, null, 2))
    return globalVariablesJson
}

const readEnvVariables = (directoryPath) => {
    const environments = {};
    const files = getExistingFiles(directoryPath);

    for (const file of files) {
        const requestFilePath = path.join(directoryPath, file);

        if (fs.existsSync(requestFilePath)) {
            if (file !== 'globalVariable.json' && path.extname(file) === '.json' && file !== 'envVariable.json') {
                try {
                    let env = JSON.parse(fs.readFileSync(requestFilePath, 'utf8'))
                    if (typeof env === 'object' && env !== null) {
                        env.name = (getFileNameWithoutExtension(file))
                        environments[env.id] = env
                    }
                } catch (error) {
                    console.log("error in request json parse", error)
                }
            }
        }

    }

    return environments;
};

// getAllEnvVariablesData - function to get All collection data
const getAllEnvVariablesData = (workspace = null) => {
    const workSpaceData = getWorkSpaces()
    let selectedWorkSpace = workSpaceData.selectedWorkSpace
    if (workspace != null) {
        selectedWorkSpace = workspace
        console.log("workspace overwritten with value:", workspace)
    }

    if (selectedWorkSpace == "none") {
        return {}
    }
    const workspacePath = workSpaceData.workspaces.find(ws => ws.name === selectedWorkSpace)?.path;

    let folderName = path.join(workspacePath, '/variables')


    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    let envVariablesJson = readEnvVariables(folderName);
    return envVariablesJson
}

// updateEnvVariablesData - function to update all collection data
const updateEnvVariablesData = (envVariablesJson, workspace=null) => {
    const workSpaceData = getWorkSpaces()
    let selectedWorkSpace = workSpaceData.selectedWorkSpace
    if (workspace != null) {
        selectedWorkSpace = workspace
        console.log("workspace overwritten with value:", workspace)
    }
    if (selectedWorkSpace == "none") {
        return {}
    }
    const workspacePath = workSpaceData.workspaces.find(ws => ws.name === selectedWorkSpace)?.path;
    const environmentVariablesfilePath = path.join(workspacePath, '/variables/envVariable.json');

    let folderNamePath = path.join(workspacePath, '/variables')


    if (!fs.existsSync(folderNamePath)) {
        fs.mkdirSync(folderNamePath);
    }
    for (const [key, env] of Object.entries(envVariablesJson)) {
        const fileName = `${env.name}`;
        const filePath = path.join(folderNamePath, `${fileName}.json`);
        try {
            env.id = key;
            WriteFile.WriteFile(filePath, JSON.stringify(env, null, 2));
        } catch (error) {
            console.log("error while creating env file", error)
        }
    }
    WriteFile.WriteFile(environmentVariablesfilePath, JSON.stringify(envVariablesJson, null, 2))
    return envVariablesJson
}

// addEnvVariable - function to add a new env
const addEnvVariable = (payload, workspace=null) => {
    const { name, description, values } = payload
    const workSpaceData = getWorkSpaces()
    let selectedWorkSpace = workSpaceData.selectedWorkSpace
    if (workspace != null) {
        selectedWorkSpace = workspace
        console.log("workspace overwritten with value:", workspace)
    }
    if (selectedWorkSpace == "none") {
        return {}
    }
    const workspacePath = workSpaceData.workspaces.find(ws => ws.name === selectedWorkSpace)?.path;

    let folderNamePath = path.join(workspacePath, '/variables')


    if (!fs.existsSync(folderNamePath)) {
        fs.mkdirSync(folderNamePath);
    }
    let existingFiles = getExistingFiles(folderNamePath)

    const fileName = `${name}.json`;
    if (existingFiles.map(f => f.toLowerCase()).includes(fileName.toLowerCase()) || fileName.toLowerCase() == "global.json") {
        return {
            error: true,
            errorDescription: "duplicate environment not allowed"
        }
    }
    const env = {
        id: uuidv4(),
        description: "",
        values: []
    }

    const filePath = path.join(folderNamePath, fileName);
    try {
        WriteFile.WriteFile(filePath, JSON.stringify(env, null, 2));
    } catch (error) {
        console.log("error while creating env file", error)
    }
    let envVariablesJson = getAllEnvVariablesData(selectedWorkSpace)
    return envVariablesJson
}

// addEnvVariable - function to add a new env
const deleteEnvVariable = (payload, workspace=null) => {
    const { name, description, values } = payload
    const workSpaceData = getWorkSpaces()
    let selectedWorkSpace = workSpaceData.selectedWorkSpace
    if (workspace != null) {
        selectedWorkSpace = workspace
        console.log("workspace overwritten with value:", workspace)
    }
    if (selectedWorkSpace == "none") {
        return {}
    }
    const workspacePath = workSpaceData.workspaces.find(ws => ws.name === selectedWorkSpace)?.path;

    let folderNamePath = path.join(workspacePath, '/variables')


    if (!fs.existsSync(folderNamePath)) {
        fs.mkdirSync(folderNamePath);
    }
    const fileName = `${name}.json`;

    const filePath = path.join(folderNamePath, fileName);
    try {
        fs.unlinkSync(filePath);
    } catch (error) {
        console.log("Failed to delete env file", error)
    }
    let envVariablesJson = getAllEnvVariablesData(selectedWorkSpace)
    return envVariablesJson
}

// updateEnvVariable - function to update an env by name
const updateEnvVariable = (payload, workspace=null) => {
    const { name, description, values } = payload
    const workSpaceData = getWorkSpaces()
    let selectedWorkSpace = workSpaceData.selectedWorkSpace
    if (workspace != null) {
        selectedWorkSpace = workspace
        console.log("workspace overwritten with value:", workspace)
    }
    if (selectedWorkSpace == "none") {
        return {}
    }
    const workspacePath = workSpaceData.workspaces.find(ws => ws.name === selectedWorkSpace)?.path;

    let folderNamePath = path.join(workspacePath, '/variables')


    if (!fs.existsSync(folderNamePath)) {
        fs.mkdirSync(folderNamePath);
    }

    const fileName = `${name}.json`;

    const filePath = path.join(folderNamePath, fileName);
    if (fs.existsSync(filePath)) {

        let env = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        if (typeof env === 'object' && env !== null) {
            env.values = values
            try {
                WriteFile.WriteFile(filePath, JSON.stringify(env, null, 2));
            } catch (error) {
                console.log("error while updating env file", error)
            }
        }
    }

    let envVariablesJson = getAllEnvVariablesData(selectedWorkSpace)
    return envVariablesJson
}

// importEnvVariables - function to Import Variables
const importEnvVariables = (payload) => {
    const { name, description, values, workspace } = payload
    const workSpaceData = getWorkSpaces()
    if (workspace == "none" || workspace == null) {
        return {}
    }
    const workspacePath = workSpaceData.workspaces.find(ws => ws.name === workspace)?.path;

    let folderNamePath = path.join(workspacePath, '/variables')


    if (!fs.existsSync(folderNamePath)) {
        fs.mkdirSync(folderNamePath);
    }
    let existingFiles = getExistingFiles(folderNamePath)
    const fileName = `${name}.json`;
    if (existingFiles.map(f => f.toLowerCase()).includes(fileName.toLowerCase()) || fileName.toLowerCase() == "global.json") {
        return {
            error: true,
            errorDescription: "duplicate environment not allowed"
        }
    }
    const env = {
        id: uuidv4(),
        description: description,
        values: values
    }

    const filePath = path.join(folderNamePath, fileName);
    try {
        WriteFile.WriteFile(filePath, JSON.stringify(env, null, 2));
    } catch (error) {
        console.log("error while importing env file", error)
    }
    let envVariablesJson = getAllEnvVariablesData(workspace)
    return envVariablesJson
}

module.exports = {
    getAllGlobalVariablesData,
    updateGlobalVariablesData,
    getAllEnvVariablesData,
    updateEnvVariablesData,
    addEnvVariable,
    deleteEnvVariable,
    updateEnvVariable,
    importEnvVariables,
    readEnvVariables
};
