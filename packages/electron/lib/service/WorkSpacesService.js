const { getWorkSpaces, updateWorkSpaces } = require("../database/WorkSpacesDatabase");
let { win, window } = require("../constants/constants");
let { addWatcher } = require("../watcher/watcher")

// GetWorkSpaces - function to Get work spaces
const GetWorkSpaces = async (request) => {
    console.log("GetWorkSpaces() service")
    const workSpaces = getWorkSpaces();
    return workSpaces;
}

// AddWorkSpaces - function to Add work spaces
const AddWorkSpaces = async (request) => {
    console.log("AddWorkSpaces() service")
    let workSpaces = getWorkSpaces();
    workSpaces = { workspaces: request.workspaces, selectedWorkSpace: request.selectedWorkSpace };
    let { isLinkCollectionTriggered, workspacePath, workSpaceName } = request
    let resp = updateWorkSpaces(workSpaces);
    try {
        if (resp.updatedWorkSpaceData != null && typeof resp.updatedWorkSpaceData == 'object') {

            let item = {
                path: resp.updatedWorkSpaceData.path,
                workspace: resp.updatedWorkSpaceData.workspace
            }
            let isInitializing = false;
            addWatcher(item, window.win, () => isInitializing)
        }
        if (isLinkCollectionTriggered) {
            let item = {
                path: workspacePath,
                workspace: workSpaceName
            }
            let isInitializing = false;
            addWatcher(item, window.win, () => isInitializing)
        }
    } catch (error) {
        console.log("error while addwatcher in workspace create", error)
    }
    return workSpaces;
}

module.exports = {
    GetWorkSpaces,
    AddWorkSpaces
};