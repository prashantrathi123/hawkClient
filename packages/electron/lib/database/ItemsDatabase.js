
const path = require('path');
const fs = require("fs")
const WriteFile = require("../../writeFile")
const { getWorkSpaces } = require("./WorkSpacesDatabase");
const cloneDeep = require('lodash/cloneDeep');
const { getCollectionsConfig } = require("./CollectionsConfigDatabase");
const { requestJsonKeyOrder, convertJsonToYaml, convertYamlToJson, replaceJsonWithYamlExtension, replaceYamlWithJsonExtension, reOrderJSONObject } = require("../utils/jsonFormatter")

function getFileNameWithoutExtension(fileName) {

  // Find the last index of the dot
  const lastDotIndex = fileName.lastIndexOf('.');

  // If there's no dot, return the fileName as is
  if (lastDotIndex === -1) {
    return fileName;
  }

  // Return the substring from the start to the last dot index
  return fileName.substring(0, lastDotIndex);
}

const readItems = (directoryPath, readFileContent = false) => {
  const items = {};
  const folders = getExistingFolders(directoryPath);

  for (const folder of folders) {
    const collectionFolderPath = path.join(directoryPath, folder);
    const itemFilePath = path.join(collectionFolderPath, 'item.json');

    let item = {};

    if (fs.existsSync(itemFilePath) && folder != "node_modules") {
      let tempItem = JSON.parse(fs.readFileSync(itemFilePath, 'utf8'));
      if (typeof tempItem === 'object' && tempItem !== null) {
        tempItem.name = (getFileNameWithoutExtension(folder))
        item = tempItem
      } else {
        continue;
      }
    } else if (fs.existsSync(replaceJsonWithYamlExtension(itemFilePath)) && folder != "node_modules") {
      let tempItem = convertYamlToJson(fs.readFileSync(replaceJsonWithYamlExtension(itemFilePath), 'utf8'))
      if (typeof tempItem === 'object' && tempItem !== null) {
        tempItem.name = (getFileNameWithoutExtension(folder))
        item = tempItem
      } else {
        continue;
      }
    } else {
      continue;
    }

    const requestFolderPath = path.join(collectionFolderPath)
    if (fs.existsSync(requestFolderPath)) {
      item.requests = readRequests(requestFolderPath);
    }

    item.items = readItems(path.join(collectionFolderPath), readFileContent);
    items[item.id] = item;
  }

  return items;
};

const readRequests = (directoryPath) => {
  const requests = [];
  const files = getExistingFiles(directoryPath);

  for (const file of files) {
    const requestFilePath = path.join(directoryPath, file);

    if (fs.existsSync(requestFilePath)) {
      if (file !== 'collection.json' && path.extname(file) === '.json' && file !== 'item.json') {
        try {
          let req = JSON.parse(fs.readFileSync(requestFilePath, 'utf8'))
          if (typeof req === 'object' && req !== null) {
            if (typeof req.id == 'string') {
              req.name = (getFileNameWithoutExtension(file))
              requests.push(req);
            }
          }
        } catch (error) {
          console.log("error in request json parse", error)
        }
      } else if (file !== 'collection.yaml' && path.extname(file) === '.yaml' && file !== 'item.yaml' && file !== 'swagger.yaml') {
        var jsonrequestFilePath = replaceYamlWithJsonExtension(requestFilePath)

        if (!fs.existsSync(jsonrequestFilePath)) {
          try {
            let req = convertYamlToJson(fs.readFileSync(requestFilePath, 'utf8'))
            if (typeof req === 'object' && req !== null) {
              if (typeof req.id == 'string') {
                req.name = (getFileNameWithoutExtension(file))
                requests.push(req);
              }
            }
          } catch (error) {
            console.log("error in request json parse", error)
          }
        }

      }
    }

  }

  return requests;
};

const readCollectionData = (directoryPath, readFileContent = false) => {
  const collections = {};

  const collectionFolders = getExistingFolders(directoryPath);
  // traverse each folder and parse all the folders and them to collection response object
  for (const folder of collectionFolders) {
    const collectionFolderPath = path.join(directoryPath, folder);
    const collectionFilePath = path.join(collectionFolderPath, 'collection.json');

    let collection = {};

    if (fs.existsSync(collectionFilePath) && folder != "node_modules") {
      try {
        let tempCollection = JSON.parse(fs.readFileSync(collectionFilePath, 'utf8'));
        if (typeof tempCollection === 'object' && tempCollection !== null) {
          tempCollection.name = folder
          collection = tempCollection
        }
      } catch (error) {
        continue;
      }
    } else {
      continue;
    }

    const requestFolderPath = path.join(collectionFolderPath)
    if (fs.existsSync(requestFolderPath)) {
      collection.requests = readRequests(requestFolderPath);
    }

    collection.items = readItems(path.join(collectionFolderPath), readFileContent);
    collection.location = collectionFolderPath;

    collections[collection.id] = collection;
  }

  return collections;
};

const readCollectionDataBycollectionFolderPath = (directoryPath, id, readFileContent = false) => {
  const collections = {};

  const collectionFolders = getExistingFolders(directoryPath);
  for (const folder of collectionFolders) {

    // fetch the collection file and check if id === collection.id, if so parse the collection else leave
    const collectionFolderPath = path.join(directoryPath, folder);
    const collectionFilePath = path.join(collectionFolderPath, 'collection.json');

    if (fs.existsSync(collectionFilePath) && folder != "node_modules") {
      try {

        let tempCollection = JSON.parse(fs.readFileSync(collectionFilePath, 'utf8'));

        if (typeof tempCollection === 'object' && tempCollection !== null) {

          // check if id === collection.id, if so parse the collection else leave
          if (id == tempCollection.id) {
            tempCollection.name = folder
            let collection = {};
            collection = tempCollection

            const requestFolderPath = path.join(collectionFolderPath)
            if (fs.existsSync(requestFolderPath)) {
              collection.requests = readRequests(requestFolderPath);
            }

            collection.items = readItems(path.join(collectionFolderPath), readFileContent);
            collection.location = collectionFolderPath;

            collections[id] = collection;
          }
        }
      } catch (error) {
        continue;
      }
    } else {
      continue;
    }

  }
  return collections;
};

// getAllCollectionData - function to get All collection data
const getAllCollectionData = (workspace = null, readFileContent = false) => {
  const workSpaceData = getWorkSpaces();
  let selectedWorkSpace = workSpaceData.selectedWorkSpace;
  if (workspace != null) {
    selectedWorkSpace = workspace
    console.log("workspace overwritten with value:", workspace)
  }
  if (selectedWorkSpace == "none") {
    return {};
  }

  const workspacePath = workSpaceData.workspaces.find(ws => ws.name === selectedWorkSpace)?.path;
  // todo /collections/APITesterCollection.json this is not required find out why its there and if not rquired delete this logic
  const apitesterCollectionJsonPath = path.join(workspacePath, '/collections/APITesterCollection.json');
  const APITesterCollectionFolderName = path.join(workspacePath, '/collections');
  let collectionsConfigsStruct = getCollectionsConfig();
  let collectionsConfigs = collectionsConfigsStruct.collectionsConfig

  if (!fs.existsSync(APITesterCollectionFolderName)) {
    fs.mkdirSync(APITesterCollectionFolderName);
  }

  if (!fs.existsSync(apitesterCollectionJsonPath)) {
    console.log("---getAllCollectionData--- APITesterCollection not found")
  } else {
    try {
      readCollectionData(APITesterCollectionFolderName, readFileContent)
    } catch (error) {
      console.log("error", error)
    }
  }
  let readColection = readCollectionData(APITesterCollectionFolderName, readFileContent);
  // read using readCollectionDataBycollectionFolderPath
  for (const collectionsConfig of collectionsConfigs) {
    if (collectionsConfig.workspace == selectedWorkSpace) {
      let tempred = readCollectionDataBycollectionFolderPath(collectionsConfig.path, collectionsConfig.id, readFileContent)
      readColection = { ...readColection, ...tempred }
    }
  }
  const apiTesterCollectionJson = readColection;
  return apiTesterCollectionJson
}

const getExistingFolders = (directoryPath) => {
  // Get the list of existing collection folders
  const existingFolders = fs.readdirSync(directoryPath).filter(folder => {
    return fs.statSync(path.join(directoryPath, folder)).isDirectory();
  });
  return existingFolders
}

const getExistingFiles = (directoryPath) => {
  // Get the list of existing files
  const existingFiles = fs.readdirSync(directoryPath).filter(file => {
    return fs.statSync(path.join(directoryPath, file)).isFile();
  });
  return existingFiles;
};

const createRequestFile = (requestsPath, requestJson) => {
  if (!fs.existsSync(requestsPath)) {
    fs.mkdirSync(requestsPath, { recursive: true });
  }
  try {

    let existingRequestFiles = getExistingFiles(requestsPath);
    const newFiles = [];

    for (const request of requestJson) {
      const requestName = `${request.name}`;

      const requestsFileName = path.join(requestsPath, `${requestName}.json`);
      newFiles.push(`${requestName}.json`);

      try {
        let tempRequest = cloneDeep(request)
        delete tempRequest.name
        if (tempRequest.validation) {
          delete tempRequest.assert
        }

        // write to a yaml file
        let reOrderJson = reOrderJSONObject(tempRequest, requestJsonKeyOrder)
        var formateYaml = convertJsonToYaml(reOrderJson)
        WriteFile.WriteFile(replaceJsonWithYamlExtension(requestsFileName), formateYaml);
      } catch (error) {
        console.log("error while creating request file", error)
      }
    }
    // Delete files that are no longer needed
    for (const file of existingRequestFiles) {
      if (!newFiles.map(f => f.toLowerCase()).includes(file.toLowerCase())) {
        const filePath = path.join(requestsPath, file);
        try {
          if (file.toLowerCase() !== "requests.json") {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.log("Failed to delete req file", error)
        }
      }
    }

  } catch (error) {
    console.log("error while creating requests file", error)
  }
}

const createItems = (directoryPath, itemsJson) => {

  let APITesterCollectionFolderName = path.join(directoryPath)


  if (!fs.existsSync(APITesterCollectionFolderName)) {
    fs.mkdirSync(APITesterCollectionFolderName, { recursive: true });
  }

  let existingFolders = getExistingFolders(APITesterCollectionFolderName);
  const newFolders = [];

  for (const [key, collection] of Object.entries(itemsJson)) {
    const collectionFolderName = `${collection.name}`;
    const collectionFolderPath = path.join(directoryPath, collectionFolderName);

    if (!fs.existsSync(collectionFolderPath)) {
      fs.mkdirSync(collectionFolderPath, { recursive: true });
    }
    const requestsPath = path.join(collectionFolderPath);
    newFolders.push(collectionFolderName);

    createRequestFile(requestsPath, collection.requests)
    createItems(collectionFolderPath, collection.items || {});

    let tempCol = cloneDeep(collection)
    delete tempCol.items
    delete tempCol.requests
    tempCol.id = key
    try {
      const collectionFilePath = path.join(collectionFolderPath, 'item.json');
      let reOrderJson = reOrderJSONObject(tempCol, requestJsonKeyOrder)
      const formatedYaml = convertJsonToYaml(reOrderJson)
      WriteFile.WriteFile(replaceJsonWithYamlExtension(collectionFilePath), formatedYaml);
    } catch (error) {
      console.log("error while creating item file", error)
    }
    // check if this needs to be moved out of for loop
    // Delete folders that are no longer needed
    for (const folder of existingFolders) {
      if (!newFolders.map(f => f.toLowerCase()).includes(folder.toLowerCase())) {
        const folderPath = path.join(APITesterCollectionFolderName, folder);
        try {
          fs.rmdirSync(folderPath, { recursive: true });
        } catch (error) {
          console.log("Failed to delete existing item", error)
        }
      }
    }
  }
}

// createItemsV2 - to avoid deletion of root folders/collections V2 functions are created.
const createItemsV2 = (directoryPath, itemsJson) => {

  let APITesterCollectionFolderName = path.join(directoryPath)


  if (!fs.existsSync(APITesterCollectionFolderName)) {
    fs.mkdirSync(APITesterCollectionFolderName, { recursive: true });
  }

  for (const [key, collection] of Object.entries(itemsJson)) {
    const collectionFolderName = `${collection.name}`;
    const collectionFolderPath = path.join(directoryPath, collectionFolderName);

    if (!fs.existsSync(collectionFolderPath)) {
      fs.mkdirSync(collectionFolderPath, { recursive: true });
    }
    const requestsPath = path.join(collectionFolderPath);

    createRequestFile(requestsPath, collection.requests)

    createItems(collectionFolderPath, collection.items || {});

    let tempCol = cloneDeep(collection)
    delete tempCol.items
    delete tempCol.requests
    tempCol.id = key
    try {
      const collectionFilePath = path.join(collectionFolderPath, 'item.json');
      let reOrderJson = reOrderJSONObject(tempCol, requestJsonKeyOrder)
      const formatedYaml = convertJsonToYaml(reOrderJson)
      WriteFile.WriteFile(replaceJsonWithYamlExtension(collectionFilePath), formatedYaml);
    } catch (error) {
      console.log("error while creating item file", error)
    }
  }
}

// createRequestFileV2 - to avoid deletion of root folders/collections V2 functions are created.
const createRequestFileV2 = (requestsPath, requestJson) => {
  if (!fs.existsSync(requestsPath)) {
    fs.mkdirSync(requestsPath, { recursive: true });
  }
  try {
    for (const request of requestJson) {
      const requestName = `${request.name}`;

      const requestsFileName = path.join(requestsPath, `${requestName}.json`);

      try {
        let tempRequest = cloneDeep(request)
        delete tempRequest.name
        if (tempRequest.validation) {
          delete tempRequest.assert
        }

        // write to a yaml file
        let reOrderJson = reOrderJSONObject(tempRequest, requestJsonKeyOrder)
        var formateYaml = convertJsonToYaml(reOrderJson)
        WriteFile.WriteFile(replaceJsonWithYamlExtension(requestsFileName), formateYaml);

      } catch (error) {
        console.log("error while creating request file", error)
      }
    }

  } catch (error) {
    console.log("error while creating requests file", error)
  }
}

module.exports = {
  getAllCollectionData,
  createItemsV2,
  createRequestFileV2,
  readItems,
  readRequests,
};
