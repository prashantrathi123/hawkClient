
const path = require('path');
const fs = require("fs")
const WriteFile = require("../../writeFile")
const constants = require('../constants/constants')
const workSpacesJsonPath = path.join(constants.WorkSpaceFolderPath, '/workspaces/workspaces.json');

// getWorkSpaces - function to get All workspaces data
const getWorkSpaces = () => {
    let folderName = path.join(constants.WorkSpaceFolderPath, '/workspaces')
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    if (!fs.existsSync(workSpacesJsonPath)) {
        updateWorkSpaces({
            workspaces: [],
            selectedWorkSpace: "none"
        })
    }
    let workSpacesJson = JSON.parse(fs.readFileSync(workSpacesJsonPath, 'utf8'));
    return workSpacesJson
}

const updateWorkSpaces = (workSpacesJson) => {
    let { workspaces, selectedWorkSpace } = workSpacesJson;
    let folderName = path.join(constants.WorkSpaceFolderPath, '/workspaces');

    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    let updatedWorkSpaceData = null;
    // Update empty paths
    workspaces = workspaces.map(workspace => {
        if (!workspace.path || workspace.path == "") {
            workspace.path = path.join(constants.WorkSpaceFolderPath, "../", workspace.name);
            if (!fs.existsSync(workspace.path)) {
                fs.mkdirSync(workspace.path);
                updatedWorkSpaceData = {
                    path: workspace.path,
                    workspace: workspace.name
                }
            }
        } 
        else {
            if (!fs.existsSync(path.join(workspace.path, workspace.name)) && !workspace.path.endsWith(workspace.name)) {
                workspace.path = path.join(workspace.path, workspace.name);
                fs.mkdirSync(workspace.path);
                updatedWorkSpaceData = {
                    path: workspace.path,
                    workspace: workspace.name
                }
            }
        }
        return workspace;
    });

    WriteFile.WriteFile(workSpacesJsonPath, JSON.stringify({ workspaces, selectedWorkSpace }, null, 2));
    return { workspaces, selectedWorkSpace, updatedWorkSpaceData };
};


module.exports = {
    getWorkSpaces,
    updateWorkSpaces
};
