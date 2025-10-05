const browseDirectory = async () => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.browseDirectory({});
    } else {
        return {}
    }

    return response;
}

const saveFile = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.selectFolderAndSave(payload);
    }

    return response;
}

const revealInFolder = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.revealInFolder(payload);
    }

    return response;
}

export {
    browseDirectory,
    saveFile,
    revealInFolder
}
