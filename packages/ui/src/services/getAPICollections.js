const getAPICollections = async() => {
    const response = await electron.handler.getAPICollections();
    return response;
}

export { getAPICollections }