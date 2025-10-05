const duplicateCollectionRequest = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.duplicateCollectionRequest(payload);
    }
    
    return response;
  }
  
  export { duplicateCollectionRequest }
  