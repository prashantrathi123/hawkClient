const path = require('path');
const os = require('os');
const fs = require('fs');
const { v4: uuidv4 } = require("uuid");
let win;
const window = {
  win: null
}

let documentsPath;

if (process.platform === 'win32') {
  // Windows
  documentsPath = path.join(os.homedir(), 'Documents');
} else if (process.platform === 'darwin') {
  // macOS
  documentsPath = path.join(os.homedir(), 'Documents');
} else if (process.platform === 'linux') {
  // Linux
  documentsPath = path.join(os.homedir(), 'Documents');
} else {
  throw new Error('Unsupported platform');
}
const APP__FOLDER_NAME = 'hawkClient'
let WorkSpaceFolderPath = path.join(documentsPath, `${APP__FOLDER_NAME}/hawkConfig`);

// Check if the hawkConfig folder exists, if not, create it
if (!fs.existsSync(WorkSpaceFolderPath)) {
  fs.mkdirSync(WorkSpaceFolderPath, { recursive: true });
  console.log(`Created folder: ${WorkSpaceFolderPath}`);
} else {
  console.log(`Folder already exists: ${WorkSpaceFolderPath}`);
}

// check if appData folder Exists or not
let appFolder = path.join(WorkSpaceFolderPath, '/appData')
if (!fs.existsSync(appFolder)) {
  fs.mkdirSync(appFolder, { recursive: true });
  console.log(`Created appData folder: ${appFolder}`);
} else {
  console.log(`appData Folder already exists: ${appFolder}`);
}

let WriteFile = (path, content) => {
    fs.writeFileSync(path, content, (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to AppData File.");
    })
}

// check if appData file Exists or not
let appDataFilePath = path.join(WorkSpaceFolderPath, '/appData/appData.json')
if (!fs.existsSync(appDataFilePath)) {
  WriteFile(appDataFilePath, JSON.stringify({ appuid: uuidv4() }, null, 2));
}

const BackendServerDomain = "http://localhost:3000"
let mockRoutes = {};
const APP_API_PATH = 'hawkClient'
const Version = '1.11.1'

module.exports = {
  BackendServerDomain,
  mockRoutes,
  WorkSpaceFolderPath,
  APP_API_PATH,
  win,
  window,
  Version
}