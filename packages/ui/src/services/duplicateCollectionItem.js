const duplicateCollectionItem = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.duplicateCollectionItem(payload);
    }

    return response;
}

const renameCollectionItem = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.renameCollectionItem(payload);
    }

    return response;
}

const updateCollectionContent = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.updateCollectionContent(payload);
    }

    return response;
}

const linkCollection = async (payload) => {
    let response;
    try {
        if (typeof electron !== 'undefined') {
            response = await electron.handler.linkCollection(payload);
        }
    } catch (error) {
        console.log(error)
        return { error: true, errorDescription: "unexpected error" };
    }

    return response;
}

const importPostmanCollection = async (payload) => {
    let response;
    try {
        if (typeof electron !== 'undefined') {
            response = await electron.handler.importPostmanCollection(payload);
        }
    } catch (error) {
        console.log(error)
        return { error: true, errorDescription: "unexpected error" };
    }

    return response;
}

const exportPostmanCollection = async (payload) => {
    let response;
    try {
        if (typeof electron !== 'undefined') {
            response = await electron.handler.exportPostmanCollection(payload);
        }
    } catch (error) {
        console.log(error)
        return { error: true, errorDescription: "unexpected error" };
    }

    return response;
}

const getCollectionByName = async (payload) => {
    let response;
    try {
        if (typeof electron !== 'undefined') {
            response = await electron.handler.getCollectionByName(payload);
        }
    } catch (error) {
        console.log(error)
        return { error: true, errorDescription: "unexpected error" };
    }

    return response;
}

const updateFolderContent = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.updateFolderContent(payload);
    }

    return response;
}

export {
    duplicateCollectionItem,
    renameCollectionItem,
    updateCollectionContent,
    linkCollection,
    importPostmanCollection,
    exportPostmanCollection,
    getCollectionByName,
    updateFolderContent
}
