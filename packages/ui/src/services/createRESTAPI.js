const createRESTAPI = async(payload) => {
    const response = await electron.handler.createRESTAPI(payload);
    return response;
}

export { createRESTAPI }