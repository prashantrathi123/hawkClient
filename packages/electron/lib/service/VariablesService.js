
const path = require('path');
const fs = require("fs")
const {
    getAllGlobalVariablesData,
    updateGlobalVariablesData,
    getAllEnvVariablesData,
    addEnvVariable,
    deleteEnvVariable,
    updateEnvVariable,
    importEnvVariables,
} = require("../database/VariablesDatabase");

// GetGlobalVariables - function to Get Global Variables
const GetGlobalVariables = async (request) => {
    console.log("GetGlobalVariables() service")
    const { workspace } = request
    const globalVariables = getAllGlobalVariablesData(workspace);
    return globalVariables;
}

// AddGlobalVariables - function to Add Global Variables
const AddGlobalVariables = async (request) => {
    console.log("AddGlobalVariables() service")
    const { workspace } = request
    let globalVariables = getAllGlobalVariablesData(workspace);
    globalVariables.values = request.values;
    globalVariables = updateGlobalVariablesData(globalVariables, workspace);
    return globalVariables;
}

// GetEnvVariables - function to Get Env Variables
const GetEnvVariables = async (request) => {
    console.log("GetEnvVariables() service")
    const { workspace } = request
    const envVariable = getAllEnvVariablesData(workspace);
    return envVariable;
}

// UpdateEnvVariables - function to update Env Variables
const UpdateEnvVariables = async (request) => {
    console.log("UpdateEnvVariables() service")
    const { workspace } = request
    let envVariable = updateEnvVariable(request, workspace)
    return envVariable;
}

// AddEnvVariables - function to add Env Variables
const AddEnvVariables = async (request) => {
    console.log("AddEnvVariables() service")
    const { workspace } = request
    let envVariable = addEnvVariable(request, workspace)
    return envVariable;
}

// DeleteEnvVariables - function to delete Env Variables
const DeleteEnvVariables = async (request) => {
    console.log("DeleteEnvVariables() service")
    const { workspace } = request
    let envVariable = deleteEnvVariable(request, workspace)
    return envVariable;
}

function convertPostmanEnvValues(values) {
    return values.map(variable => ({
        isChecked: variable.enabled, // Use 'enabled' for isChecked
        key: variable.key,           // Keep the key as is
        value: variable.value,       // Keep the value as is
        type: "text"                 // Set type as "text" for all
    }));
}

// ImportPostmanEnvVariables - function to add Env Variables
const ImportPostmanEnvVariables = async (request) => {
    console.log("ImportPostmanEnvVariables() service")
    let { name, description, postmanEnvVariables, workspace } = request;
    if (postmanEnvVariables == null || typeof postmanEnvVariables != 'object') {
        return {
            error: true,
            errorDescription: "Invalid postman environment json"
        }
    }
    const convertedValues = convertPostmanEnvValues(postmanEnvVariables?.values || []);
    let values = convertedValues;
    let envVariable = importEnvVariables({ name, description, values, workspace })
    return envVariable;
}

const DuplicateEnvVariables = (request) => {
    console.log("inside DuplicateEnvVariables() service")
    const { name, description, values, workspace } = request
    let envVariable = importEnvVariables({ name, description, values, workspace })
    return envVariable;
}

module.exports = {
    GetGlobalVariables,
    AddGlobalVariables,
    GetEnvVariables,
    UpdateEnvVariables,
    AddEnvVariables,
    DeleteEnvVariables,
    ImportPostmanEnvVariables,
    DuplicateEnvVariables
};