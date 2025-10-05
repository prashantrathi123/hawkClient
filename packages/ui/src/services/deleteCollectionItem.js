const deleteCollectionItem = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.deleteCollectionItem(payload);
    }
    
    return response;
  }
  
  export { deleteCollectionItem }
  