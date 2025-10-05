const deleteCollectionRequest = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.deleteCollectionRequest(payload);
    }

    return response;
}

export { deleteCollectionRequest }
