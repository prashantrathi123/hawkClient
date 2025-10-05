const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  handler: {
    getAPICollections: async () => {
      let response = await ipcRenderer.invoke("getAPICollectionsMain", null).then((result) => {
        return result;
      });
      return response;
    },
    // API tester functions calls
    getAPITesterCollections: async (selectedWorkSpace) => {
      let response = await ipcRenderer.invoke("GET-api-collections", selectedWorkSpace).then((result) => {
        return result;
      });
      return response;
    },
    executeAPI: async (request) => {
      let response = await ipcRenderer.invoke("executeAPI", request).then((result) => {
        return result;
      });
      return response;
    },
    updateCollectionRequest: async (request) => {
      let response = await ipcRenderer.invoke("updateCollectionRequest", request).then((result) => {
        return result;
      });
      return response;
    },
    deleteCollectionItem: async (request) => {
      let response = await ipcRenderer.invoke("deleteCollectionItem", request).then((result) => {
        return result;
      });
      return response;
    },
    duplicateCollectionItem: async (request) => {
      let response = await ipcRenderer.invoke("duplicateCollectionItem", request).then((result) => {
        return result;
      });
      return response;
    },
    addCollectionItem: async (request) => {
      let response = await ipcRenderer.invoke("addCollectionItem", request).then((result) => {
        return result;
      });
      return response;
    },
    linkCollection: async (request) => {
      let response = await ipcRenderer.invoke("linkCollection", request).then((result) => {
        return result;
      });
      return response;
    },
    renameCollectionItem: async (request) => {
      let response = await ipcRenderer.invoke("renameCollectionItem", request).then((result) => {
        return result;
      });
      return response;
    },
    updateCollectionContent: async (request) => {
      let response = await ipcRenderer.invoke("updateCollectionContent", request).then((result) => {
        return result;
      });
      return response;
    },
    updateFolderContent: async (request) => {
      let response = await ipcRenderer.invoke("updateFolderContent", request).then((result) => {
        return result;
      });
      return response;
    },
    deleteCollectionRequest: async (request) => {
      let response = await ipcRenderer.invoke("deleteCollectionRequest", request).then((result) => {
        return result;
      });
      return response;
    },
    duplicateCollectionRequest: async (request) => {
      let response = await ipcRenderer.invoke("duplicateCollectionRequest", request).then((result) => {
        return result;
      });
      return response;
    },
    addCollectionRequest: async (request) => {
      let response = await ipcRenderer.invoke("addCollectionRequest", request).then((result) => {
        return result;
      });
      return response;
    },
    renameFileAndRequest: async (request) => {
      let response = await ipcRenderer.invoke("renameFileAndRequest", request).then((result) => {
        return result;
      });
      return response;
    },
    getGlobalVariables: async (request) => {
      let response = await ipcRenderer.invoke("getGlobalVariables", request).then((result) => {
        return result;
      });
      return response;
    },
    addGlobalVariables: async (request) => {
      let response = await ipcRenderer.invoke("addGlobalVariables", request).then((result) => {
        return result;
      });
      return response;
    },
    getEnvVariables: async (request) => {
      let response = await ipcRenderer.invoke("getEnvVariables", request).then((result) => {
        return result;
      });
      return response;
    },
    updateEnvVariables: async (request) => {
      let response = await ipcRenderer.invoke("updateEnvVariables", request).then((result) => {
        return result;
      });
      return response;
    },
    addEnvVariables: async (request) => {
      let response = await ipcRenderer.invoke("addEnvVariables", request).then((result) => {
        return result;
      });
      return response;
    },
    deleteEnvVariables: async (request) => {
      let response = await ipcRenderer.invoke("deleteEnvVariables", request).then((result) => {
        return result;
      });
      return response;
    },
    duplicateEnvVariables: async (request) => {
      let response = await ipcRenderer.invoke("duplicateEnvVariables", request).then((result) => {
        return result;
      });
      return response;
    },
    getHttpSnippet: async (request) => {
      let response = await ipcRenderer.invoke("getHttpSnippet", request).then((result) => {
        return result;
      });
      return response;
    },
    getWorkSpaces: async (request) => {
      let response = await ipcRenderer.invoke("getWorkSpaces", request).then((result) => {
        return result;
      });
      return response;
    },
    addWorkSpaces: async (request) => {
      let response = await ipcRenderer.invoke("addWorkSpaces", request).then((result) => {
        return result;
      });
      return response;
    },
    browseDirectory: async () => {
      const result = await ipcRenderer.invoke('browseDirectory');
      return result;
    },
    importPostmanCollection: async (request) => {
      let response = await ipcRenderer.invoke("importPostmanCollection", request).then((result) => {
        return result;
      });
      return response;
    },
    importPostmanEnvVariables: async (request) => {
      let response = await ipcRenderer.invoke("importPostmanEnvVariables", request).then((result) => {
        return result;
      });
      return response;
    },
    exportPostmanCollection: async (request) => {
      let response = await ipcRenderer.invoke("exportPostmanCollection", request).then((result) => {
        return result;
      });
      return response;
    },
    getCollectionByName: async (request) => {
      let response = await ipcRenderer.invoke("getCollectionByName", request).then((result) => {
        return result;
      });
      return response;
    },
    getCertificates: async (request) => {
      let response = await ipcRenderer.invoke("getCertificates", request).then((result) => {
        return result;
      });
      return response;
    },
    addCertificates: async (request) => {
      let response = await ipcRenderer.invoke("addCertificates", request).then((result) => {
        return result;
      });
      return response;
    },
    getSettings: async (request) => {
      let response = await ipcRenderer.invoke("getSettings", request).then((result) => {
        return result;
      });
      return response;
    },
    saveSettings: async (request) => {
      let response = await ipcRenderer.invoke("saveSettings", request).then((result) => {
        return result;
      });
      return response;
    },
    checkForUpdates: async (request) => {
      let response = await ipcRenderer.invoke("checkForUpdates", request).then((result) => {
        return result;
      });
      return response;
    },
    revealInFolder: async (request) => {
      let response = await ipcRenderer.invoke("revealInFolder", request).then((result) => {
        return result;
      });
      return response;
    },
    selectFolderAndSave: async (request) => {
      const result = await ipcRenderer.invoke('selectFolderAndSave', request);
      return result;
    },
    onNotification: (callback) => {
      ipcRenderer.on('notification', callback)
      return () => ipcRenderer.removeListener("notification", callback);
    },
    updateCollectionsNotification: (callback) => {
      ipcRenderer.on('updateCollectionsNotification', callback)
      return () => ipcRenderer.on('updateCollectionsNotification', callback)
    },
    updateEnvNotification: (callback) => {
      ipcRenderer.on('updateEnvNotification', callback)
      return () => ipcRenderer.on('updateEnvNotification', callback)
    },
  }
})