const { app, BrowserWindow } = require('electron')
const { ipcMain, Notification, shell } = require('electron');
const path = require('path');
const fs = require("fs")
let executeAPI = require('./lib/APIExecution/index')
const CollectionRequestService = require('./lib/service/CollectionRequest');
const CollectionItemService = require('./lib/service/CollectionItemService');
const VariablesService = require('./lib/service/VariablesService');
const HttpSnippetService = require('./lib/service/HttpSnippetService');
const CertificatesService = require('./lib/service/CertificatesService');
const { v4: uuidv4 } = require("uuid");
const { fork, exec } = require('child_process');
const { getAllCollectionData } = require("./lib/database/ItemsDatabase");
const { GetWorkSpaces, AddWorkSpaces } = require("./lib/service/WorkSpacesService")
const { dialog } = require('electron');
const { watchFolders } = require("./lib/watcher/watcher")

const SettingsService = require('./lib/service/SettingsService');
const { setContentSecurityPolicy } = require('electron-util');
let { win, window } = require("./lib/constants/constants");
const { replaceJsonWithYamlExtension } = require("./lib/utils/jsonFormatter");
const { checkForUpdates } = require("./lib/service/UpdatesService");

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "connect-src * 'unsafe-inline'",
  "font-src 'self' https:",
  "img-src 'self' blob: data: http: https:",
  "media-src 'self' blob: data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "worker-src 'self' blob: *",
  "frame-src data:"
];

setContentSecurityPolicy(contentSecurityPolicy.join(';') + ';');
let isInitializing = true;
let serverProcess;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'HawkClient'
  })
  window.win = win

  win.loadFile(path.join(__dirname, './public/index.html'));

  // 🔹 Fix: Ensure external links open in the default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  watchFolders(win, () => isInitializing);

  win.on('closed', function () {
    win = null;
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  // Open the DevTools.
  // win.webContents.openDevTools()
}

ipcMain.on('notify', (_, message) => {
  console.log("there", message)
})

// API creator function
ipcMain.handle('getAPICollectionsMain', (_, req) => {
  console.log("inside get API collections")
  return {};
})

// API tester handler functions
ipcMain.handle('GET-api-collections', (_, req) => {
  console.log("inside get APITester collections")
  let selectedWorkSpace = req;
  let apiTesterCollectionJson = getAllCollectionData(selectedWorkSpace);
  return apiTesterCollectionJson;
})

ipcMain.handle('executeAPI', async (_, request) => {
  let response = await executeAPI.executeAPI(request)
  return response;
})

ipcMain.handle('updateCollectionRequest', (_, request) => {
  response = CollectionRequestService.updateCollectionRequest(request)
  return response;
})

ipcMain.handle('deleteCollectionItem', (_, request) => {
  const response = CollectionItemService.deleteCollectionItem(request);
  return response;
})

ipcMain.handle('duplicateCollectionItem', (_, request) => {
  const response = CollectionItemService.duplicateCollectionItem(request);
  return response;
})

ipcMain.handle('addCollectionItem', (_, request) => {
  const response = CollectionItemService.addCollectionItem(request);
  return response;
})

ipcMain.handle('linkCollection', (_, request) => {
  const response = CollectionItemService.linkCollection(request);
  return response;
})

ipcMain.handle('renameCollectionItem', (_, request) => {
  const response = CollectionItemService.renameCollectionItem(request);
  return response;
})

ipcMain.handle('updateCollectionContent', (_, request) => {
  const response = CollectionItemService.updateCollectionContent(request);
  return response;
})

ipcMain.handle('updateFolderContent', (_, request) => {
  const response = CollectionItemService.updateFolderContent(request);
  return response;
})

ipcMain.handle('deleteCollectionRequest', (_, request) => {
  const response = CollectionRequestService.deleteCollectionRequest(request);
  return response;
})

ipcMain.handle('duplicateCollectionRequest', (_, request) => {
  const response = CollectionRequestService.duplicateCollectionRequest(request);
  return response;
})

ipcMain.handle('addCollectionRequest', (_, request) => {
  const response = CollectionRequestService.addCollectionRequest(request);
  return response;
})

ipcMain.handle('getGlobalVariables', (_, request) => {
  const response = VariablesService.GetGlobalVariables(request);
  return response;
})

ipcMain.handle('addGlobalVariables', (_, request) => {
  const response = VariablesService.AddGlobalVariables(request);
  return response;
})

ipcMain.handle('getEnvVariables', (_, request) => {
  const response = VariablesService.GetEnvVariables(request);
  return response;
})

ipcMain.handle('updateEnvVariables', (_, request) => {
  const response = VariablesService.UpdateEnvVariables(request);
  return response;
})

ipcMain.handle('addEnvVariables', (_, request) => {
  const response = VariablesService.AddEnvVariables(request);
  return response;
})

ipcMain.handle('deleteEnvVariables', (_, request) => {
  const response = VariablesService.DeleteEnvVariables(request);
  return response;
})

ipcMain.handle('duplicateEnvVariables', (_, request) => {
  const response = VariablesService.DuplicateEnvVariables(request);
  return response;
})

ipcMain.handle('getHttpSnippet', (_, request) => {
  const response = HttpSnippetService.GetHttpSnippet(request);
  return response;
})

ipcMain.handle('getWorkSpaces', (_, request) => {
  const response = GetWorkSpaces(request);
  return response;
})

ipcMain.handle('addWorkSpaces', (_, request) => {
  const response = AddWorkSpaces(request);
  return response;
})

ipcMain.handle('browseDirectory', async (event) => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });
  return result.filePaths;
});

ipcMain.handle('selectFolderAndSave', async (event, data) => {
  const { content, defaultFileName } = data;

  // Open "Save As" dialog to allow the user to specify the directory and file name
  const { filePath } = await dialog.showSaveDialog({
    title: 'Save JSON File',
    defaultPath: defaultFileName, // Set default file name
    filters: [
      { name: 'JSON Files', extensions: ['json'] }
    ]
  });

  if (filePath) {
    // Save the file to the specified location
    fs.writeFile(filePath, content, 'utf-8', (err) => {
      if (err) {
        console.error('Failed to save the file:', err);
      } else {
        console.log('File saved successfully:', filePath);
      }
    });
  }
});

ipcMain.handle('importPostmanCollection', async (_, request) => {
  console.log("inside importPostmanCollection")
  let response = CollectionItemService.postmanCollectionToHawkCollectionItem(request);
  return response;
})

ipcMain.handle('importPostmanEnvVariables', async (_, request) => {
  console.log("inside importPostmanEnvVariables")
  let response = VariablesService.ImportPostmanEnvVariables(request);
  return response;
})

ipcMain.handle('exportPostmanCollection', async (_, request) => {
  console.log("inside exportPostmanCollection")
  let response = CollectionItemService.hawkClientToPostmanCollection(request);
  return response;
})

ipcMain.handle('getCollectionByName', async (_, request) => {
  console.log("inside getCollectionByName")
  let response = CollectionItemService.getCollectionByName(request);
  return response;
})

ipcMain.handle('getCertificates', async (_, request) => {
  console.log("inside GetCertificates")
  let response = CertificatesService.getCertificates(request);
  return response;
})

ipcMain.handle('addCertificates', async (_, request) => {
  console.log("inside AddCertificates")
  let response = CertificatesService.addCertificates(request);
  return response;
})

ipcMain.handle('renameFileAndRequest', async (_, request) => {
  console.log("inside renameFileAndRequest")
  let response = CollectionRequestService.renameFileAndRequest(request);
  return response;
})

ipcMain.handle('getSettings', async (_, request) => {
  console.log("inside getSettings")
  let response = SettingsService.GetSettings(request);
  return response;
})

ipcMain.handle('saveSettings', async (_, request) => {
  console.log("inside saveSettings")
  let response = SettingsService.SaveSettings(request);
  return response;
})

ipcMain.handle('checkForUpdates', async (_, request) => {
  console.log("inside checkForUpdates")
  let response = checkForUpdates(request);
  return response;
})

ipcMain.handle('revealInFolder', async (_, request) => {
  try {
    let { filePath } = request;
    if (!filePath) {
      throw new Error('File path is required.');
    }

    let resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(resolvedPath)) {
      // throw new Error('The specified file does not exist.');
      resolvedPath = replaceJsonWithYamlExtension(resolvedPath)
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new Error('The specified file does not exist.');
    }

    console.log(process.platform, "process.platform")

    switch (process.platform) {
      case 'darwin': // macOS
        shell.showItemInFolder(resolvedPath);
        break;
      case 'win32': // Windows
        shell.showItemInFolder(resolvedPath);
        break;
      case 'linux': // Linux
        exec(`xdg-open "${resolvedPath}"`);
        break;
      default:
        throw new Error('Unsupported platform.');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in reveal-in-finder:', error);
    return { success: false, errorDescription: error.message };
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  createWindow();

  setTimeout(() => {
    isInitializing = false;
  }, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM'); // Gracefully stop the server process on app quit
  }
});
