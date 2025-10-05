const updateCollectionRequest = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.updateCollectionRequest(payload);
    }

    return response;
}

const renameFileAndRequest = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.renameFileAndRequest(payload);
    }

    return response;
}

export { updateCollectionRequest, renameFileAndRequest }
