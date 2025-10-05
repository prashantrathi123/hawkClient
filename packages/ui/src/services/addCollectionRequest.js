const addCollectionRequest = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.addCollectionRequest(payload);
    } else {
        return {}
    }

    return response;
}

export { addCollectionRequest }
