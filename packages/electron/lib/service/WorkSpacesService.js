const { getWorkSpaces, updateWorkSpaces } = require("../database/WorkSpacesDatabase");
let { win, window } = require("../constants/constants");

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

    let resp = updateWorkSpaces(workSpaces);

    return workSpaces;
}

module.exports = {
    GetWorkSpaces,
    AddWorkSpaces
};