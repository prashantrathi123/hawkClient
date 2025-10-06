const path = require('path');
const fs = require("fs")
const WriteFile = require("../../writeFile")
const { getWorkSpaces } = require("../database/WorkSpacesDatabase");
const { formatJSON } = require("../utils/jsonFormatter")


const getCertificates = async (request) => {
    const { workspace } = request;
    let workSpaceData = getWorkSpaces();

    if (workspace == "none") {
        return {};
    }

    const workspacePath = workSpaceData.workspaces.find(ws => ws.name === workspace)?.path || null;
    if (workspacePath == null) {
        return {}
    }
    let folderName = path.join(workspacePath, '/certificates')


    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }

    const filePath = path.join(folderName, "certificates.json");
    let response = {
        caCertificate: {
            isEnabled: false,
            caPath: ""
        },
        clientCertificates: []
    }

    if (fs.existsSync(filePath)) {
        try {
            let certifcts = JSON.parse(fs.readFileSync(filePath, 'utf8'))
            if (typeof certifcts === 'object' && certifcts !== null) {
                response = certifcts
            }
        } catch (error) {
            console.log("getCertificates:Service- error in json parse", error)
        }
    } else {
        const keyOrder = ["caCertificate", "clientCertificates"]
        const requestFieldsToSpace = new Set([]);
        const formattedJSON = formatJSON(response, keyOrder, requestFieldsToSpace);
        WriteFile.WriteFile(filePath, formattedJSON);
    }

    return response;
}

const addCertificates = async (request) => {
    const { workspace, caCertificate, clientCertificates } = request;
    let workSpaceData = getWorkSpaces();

    if (workspace == "none") {
        return {};
    }

    const workspacePath = workSpaceData.workspaces.find(ws => ws.name === workspace)?.path || null;
    if (workspacePath == null) {
        return {}
    }
    let folderName = path.join(workspacePath, '/certificates')


    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }

    const filePath = path.join(folderName, "certificates.json");

    const keyOrder = ["caCertificate", "clientCertificates"]
    const requestFieldsToSpace = new Set([]);

    let certificatesJson = {
        caCertificate: caCertificate || {
            isEnabled: false,
            caPath: ""
        },
        clientCertificates: clientCertificates || []
    }

    const formattedJSON = formatJSON(certificatesJson, keyOrder, requestFieldsToSpace);
    WriteFile.WriteFile(filePath, formattedJSON);

    return certificatesJson;
}

module.exports = {
    getCertificates,
    addCertificates
}