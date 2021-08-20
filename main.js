if (process.platform === "win32") process.stdout.isTTY = true; // for windows terminal print color Style

// Modules to control application life and create native browser window
require("./events/eventsLoader"); // Import

const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  clipboard,
  desktopCapturer,
} = require("electron");
const chalk = require("chalk");
const log = require("electron-log");
const { autoUpdater } = require("electron-updater");
const { ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
// const { checkForUpdates } = require('./checkforupdate');

// global variables
const assetsPath = app.isPackaged
  ? path.join(process.resourcesPath, "assets")
  : "assets";
const ICON_PATH = path.join(assetsPath, "16x16.png");
let tray = null;

// log
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";

log.info("App Starting...");
log.info(
  `${chalk.cyan(`Platform: ${chalk.bgRedBright(`${process.platform}`)}`)}`
);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: ICON_PATH,
    // frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html#v${app.getVersion()}`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.webContents.on("did-finish-load", () => {
    /// then close the loading screen window and show the main window
    if (loadingScreen) {
      loadingScreen.close();
    }
    mainWindow.show();

    desktopCapturer
      .getSources({ types: ["window", "screen"] })
      .then(async (sources) => {
        for (const source of sources) {
          if (source.name === "autoupdater") {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                  mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: source.id,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720,
                  },
                },
              });
              handleStream(stream);
            } catch (e) {
              handleError(e);
            }
            return;
          }
        }
      });
  });
}

app.whenReady().then(() => {
  log.info(
    `${chalk.cyan(`App version: ${chalk.bgRedBright(`${app.getVersion()}`)}`)}`
  );

  tray = new Tray(ICON_PATH);

  const template = [
    {
      label: "Hello World APP",
      icon: ICON_PATH,
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Check for updates",
      click: () => {
        console.log("Update...");
      },
    },
    {
      label: "Abobut us",
      click: () => {
        console.log("Abobut us...");
      },
    },
    { type: "separator" },
    {
      label: "Quit Hello App",
      click: () => {
        app.quit();
      },
    },
  ];

  const contextMenu = Menu.buildFromTemplate(template);
  tray.setToolTip("This is my application.");
  tray.setContextMenu(contextMenu);

  createLoadingScreen();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createLoadingScreen();
      setTimeout(() => {
        createWindow();
      }, 5000);
    }
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

let loadingScreen;

function sendStatusToWindow(text) {
  log.info(`${chalk.greenBright(`${text}`)}`);
  loadingScreen.webContents.send("message", text);
}

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for update...");
});
autoUpdater.on("update-available", (info) => {
  sendStatusToWindow("Update available.");
});
autoUpdater.on("update-not-available", (info) => {
  sendStatusToWindow("STARTING...");
  createWindow();
});
autoUpdater.on("error", (error) => {
  dialog.showErrorBox(
    "Error: ",
    error == null ? "unknown" : (error.stack || error).toString()
  );
});
autoUpdater.on("download-progress", (progressObj) => {
  // progressObj.bytesPerSecond
  // progressObj.percent
  // progressObj.transferred
  // progressObj.total
  sendStatusToWindow(progressObj);
});
autoUpdater.on("update-downloaded", (info) => {
  sendStatusToWindow("Update downloaded");
  autoUpdater.quitAndInstall();
});

const createLoadingScreen = () => {
  /// create a browser window
  loadingScreen = new BrowserWindow(
    Object.assign({
      /// define width and height for the window
      width: 300, // default 300
      height: 350, // default 350
      icon: ICON_PATH,
      /// remove the window frame, so it will become a frameless window
      frame: false,
      /// and set the transparency, to remove any window background color
      transparent: true,
      webPreferences: {
        preload: path.join(__dirname, "updater.js"),
      },
    })
  );
  loadingScreen.setResizable(false);
  loadingScreen.loadURL("file://" + __dirname + "/loading/loading.html");
  loadingScreen.on("closed", () => (loadingScreen = null));
  loadingScreen.webContents.on("did-finish-load", () => {
    loadingScreen.show();
    // checkForUpdates();
    autoUpdater.checkForUpdates();
  });
};

ipcMain.on("open-file-dialog", async (event) => {
  const data = await dialog.showOpenDialog({
    properties: undefined,
    defaultPath: process.cwd(),
    filters: [
      { name: "Text", extensions: ["txt"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  event.sender.send("selected-file", data);
});

ipcMain.on("open-save-dialog", async (event) => {
  const data = await dialog.showSaveDialog({
    title: "SAVE FILE LA",
    defaultPath: process.cwd(),
    buttonLabel: "CONFIRM",
    filters: [{ name: "All Files", extensions: ["*"] }],
    message: "message to display above text fields.",
    nameFieldLabel: "infront of the filename text fileds.",
    showsTagField: true,
    properties: [
      "showHiddenFiles",
      "createDirectory",
      "treatPackageAsDirectory",
      "showOverwriteConfirmation",
      "dontAddToRecent",
    ],
    securityScopedBookmarks: true,
  });
  console.log(data);
  event.sender.send("saved-file", data);
});

ipcMain.on("record-save-dialog", async (event, data) => {
  const result = await dialog.showSaveDialog({
    title: "Save Record",
    defaultPath: process.cwd(),
    buttonLabel: "Save video",
    filters: [
      { name: "Movie", extensions: ["webm", "mp4"] },
      { name: "All Files", extensions: ["*"] },
    ],
    message: "message to display above text fields.",
    nameFieldLabel: "infront of the filename text fileds.",
    showsTagField: true,
    properties: [
      "showHiddenFiles",
      "createDirectory",
      "treatPackageAsDirectory",
      "showOverwriteConfirmation",
      "dontAddToRecent",
    ],
    securityScopedBookmarks: true,
  });

  if (!result.canceled)
    fs.writeFile(result.filePath, data, (err) => {
      if (err) throw err;

      log.info("%cSave successfully!", "color: green");
    });
  else log.error("%cSave failed!", "color: red");
});

ipcMain.on("clipboard-copy", (event, data) => {
  const authorInfo = `This text is copy from ${app.name}. 
  For more information, please visit ${app.name}.com`;
  const clipboardText = data + "\n\n\n\n\n" + authorInfo;
  clipboard.writeText(clipboardText);
  log.info(`text copied to clipboard: %c${data}`, "color: cyan");
});
