const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const { getWorkSpaces } = require("../database/WorkSpacesDatabase");
const { getCollectionsConfig } = require("../database/CollectionsConfigDatabase");
const { getAllCollectionData } = require('../database/ItemsDatabase');
const { convertYamlToJson } = require("../utils/jsonFormatter");
const { readEnvVariables } = require("../database/VariablesDatabase");

function findCollectionsJson(filePath) {
  // to do handle this for othher files as well
  if (path.basename(filePath) === 'collection.json') {
    return filePath;
  }

  let currentDir = path.dirname(filePath);

  while (currentDir !== path.dirname(currentDir)) {
    const collectionsJsonPath = path.join(currentDir, 'collection.json');

    if (fs.existsSync(collectionsJsonPath)) {
      return collectionsJsonPath;
    }

    currentDir = path.dirname(currentDir);
  }

  // If not found, return null or an appropriate message
  return null;
}


function getFileName(filePath) {
  return path.basename(filePath);
}


function getRelativeSubPath(fullPath, subPath) {
  if (!subPath) {
    return null;
  }

  const subPathDir = path.dirname(subPath);
  const fullPathDir = path.dirname(fullPath);

  const relativePath = path.relative(subPathDir, fullPathDir);

  // Adding the last folder of subPath to the start of the relative path
  const lastFolder = path.basename(subPathDir);
  const fullRelativePath = path.join(lastFolder, relativePath);

  return fullRelativePath;
}

function getCollectionAndRequestId(window, workspace, filePath, event) {
  let collectionId = null;
  let requestId = null;
  let fileName = null;
  let relativePath = null;
  let fileData = null;
  let isEnvChange = false;
  let isCertificateChange = false;
  let isYamlFormatRequest = false;
  let yamlToJsonConvertedData = null;
  let isFolderChange = false;

  let currentDir = path.dirname(filePath);
  if (currentDir.endsWith(path.join(workspace + "/variables"))) {
    isEnvChange = true
  }
  if (currentDir.endsWith(path.join(workspace + "/certificates"))) {
    isCertificateChange = true
  }

  const collectionJsonPath = findCollectionsJson(filePath)


  fileName = getFileName(filePath)
  relativePath = getRelativeSubPath(filePath, collectionJsonPath)

  if (fs.existsSync(collectionJsonPath)) {
    try {
      const collectionData = JSON.parse(fs.readFileSync(collectionJsonPath, 'utf-8'));
      collectionId = collectionData.id;
    } catch (error) {
      // return { collectionId, requestId, fileName, relativePath };
    }
  }

  if (fs.existsSync(filePath) && (filePath.endsWith('item.json') || filePath.endsWith('item.yaml'))) {
    isFolderChange = true;
  }

  if (fs.existsSync(filePath) && filePath.endsWith('json') && !filePath.endsWith('collections.json')) {
    try {
      const requestData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (requestData.id) {
        requestId = requestData.id;
      }
    } catch (error) {
      // return { collectionId, requestId, fileName, relativePath };
    }
  }

  if (fs.existsSync(filePath) && filePath.endsWith('yaml') && !filePath.endsWith('collections.yaml') && !filePath.endsWith('swagger.yaml')) {
    try {
      const requestData = convertYamlToJson(fs.readFileSync(filePath, 'utf-8'));
      if (requestData.id) {
        requestId = requestData.id;
        isYamlFormatRequest = true;
        yamlToJsonConvertedData = requestData;
      }
    } catch (error) {
      // return { collectionId, requestId, fileName, relativePath };
    }
  }

  if (fs.existsSync(filePath)) {
    const fileDataVal = fs.readFileSync(filePath, 'utf-8');
    fileData = fileDataVal
  }

  if (window && !window.isDestroyed()) {
    let collectionJson = getAllCollectionData(workspace);
    window.webContents.send('notification', { workspace, collectionId, requestId, fileName, relativePath, fileData, event, isEnvChange, isCertificateChange, isYamlFormatRequest, yamlToJsonConvertedData, isFolderChange });
    // Add condition if isCertificateChange don't trigger updateCollectionsNotification
    window.webContents.send('updateCollectionsNotification', { workspace, collectionJson: collectionJson });

    if (isEnvChange == true) {
      let envfolderName = currentDir;
      let envVariablesJson = {}
      try {
        envVariablesJson = readEnvVariables(envfolderName)
      } catch (error) {
        console.log("error in json parse", error)
      }

      window.webContents.send('updateEnvNotification', { workspace, envVariablesJson: envVariablesJson });
    }
  }

  return { collectionId, requestId, fileName, relativePath };
}

function watchFolders(win, isInitializingGetter) {
  const workspacesConfig = getWorkSpaces();
  const workspaces = workspacesConfig.workspaces;

  const collectionsConfig = getCollectionsConfig();
  const collectionsCfg = collectionsConfig.collectionsConfig;

  const pathsToWatch = new Set();

  workspaces.forEach((workspace) => {
    pathsToWatch.add({ path: workspace.path, workspace: workspace.name });
  });

  collectionsCfg.forEach((collection) => {
    pathsToWatch.add({ path: collection.path, workspace: collection.workspace });
  });

  pathsToWatch.forEach((item) => {
    addWatcher(item, win, isInitializingGetter);
  });

  console.log(`Watching paths: ${Array.from(pathsToWatch).join(', ')}`);
}

const addWatcher = (item, win, isInitializingGetter) => {
  const watcher = chokidar.watch(item.path, {
    ignoreInitial: false,
    ignored: /(^|[\/\\])\..|node_modules/, // ignore dotfiles and node_modules folder
    persistent: true,
    usePolling: item.path.startsWith('\\\\'), // Enable polling based on the current path
    interval: 100, // Optional: adjust the polling interval if needed
    ignorePermissionErrors: true,
    awaitWriteFinish: {
      stabilityThreshold: 80,
      pollInterval: 10,
    },
    depth: 20,
  });

  // Additional watcher event handling logic here
  watcher
    .on('add', (filePath) => {
      if (!isInitializingGetter()) {
        const { collectionId, requestId, fileName, relativePath } = getCollectionAndRequestId(win, item.workspace, filePath, "Add_FILE");
        console.log(`Added File: ${fileName} RelativePath: ${relativePath} workspace: ${item.workspace} CollectionId: ${collectionId}, requestId: ${requestId}`);
      }
    })
    .on('change', (filePath) => {
      if (!isInitializingGetter()) {
        const { collectionId, requestId, fileName, relativePath } = getCollectionAndRequestId(win, item.workspace, filePath, "CHANGE_FILE");
        console.log(`Changed File: ${fileName} RelativePath: ${relativePath} workspace: ${item.workspace} CollectionId: ${collectionId}, requestId: ${requestId}`);
      }
    })
    .on('unlink', (filePath) => {
      if (!isInitializingGetter()) {
        const { collectionId, requestId, fileName, relativePath } = getCollectionAndRequestId(win, item.workspace, filePath, "DELETE_FILE");
        console.log(`Removed File: ${fileName} RelativePath: ${relativePath} workspace: ${item.workspace} CollectionId: ${collectionId}, requestId: ${requestId}`);
      }
    })
    .on('error', (error) => console.log(`Watcher error: ${error}`));

}

module.exports = {
  watchFolders,
  addWatcher,
};
