// Modules to control application life and create native browser window
const {app, BrowserWindow, Tray, Menu} = require('electron');
const { ipcMain } = require('electron/main');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const path = require('path');

// global variables
const assetsPath = app.isPackaged ? path.join(process.resourcesPath, "assets") : "assets";
const ICON_PATH = path.join(assetsPath, '16x16.png');
let tray = null;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: ICON_PATH,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  mainWindow.loadURL(`file://${__dirname}/index.html#v${app.getVersion()}`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.webContents.on('did-finish-load', () => {
    /// then close the loading screen window and show the main window
    if (loadingScreen) {
      loadingScreen.close();
    }
    mainWindow.show();
  });
}

app.whenReady().then(() => {

  console.warn(`App version: ${app.getVersion()}`);

  tray = new Tray(ICON_PATH);

  const template = [
    {
      label: 'Hello World APP',
      icon: ICON_PATH,
      enabled: false
    }, 
    { type: 'separator' },
    {
      label: 'Check for updates',
      click: () => {
        console.log("Update...")
      }
    },
    {
      label: 'Abobut us',
      click: () => {
        console.log("Abobut us...");
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Hello App',
      click: () => {
        app.quit();
      } 
    }
  ]
    
  const contextMenu = Menu.buildFromTemplate(template);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);

  createLoadingScreen();
  
  autoUpdater.checkForUpdatesAndNotify();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createLoadingScreen();
      setTimeout(() => {
        createWindow();
      }, 2000);
    }
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

let loadingScreen;


function sendStatusToWindow(text) {
  log.info(text);
  loadingScreen.webContents.send('message', text);
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('STARTING...');
  createWindow(); 
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  // progressObj.bytesPerSecond
  // progressObj.percent
  // progressObj.transferred
  // progressObj.total
  sendStatusToWindow(progressObj);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
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
        preload: path.join(__dirname, 'updater.js')
      },
    })
  );
  loadingScreen.setResizable(false);
  loadingScreen.loadURL(
    'file://' + __dirname + '/loading/loading.html'
  );
  loadingScreen.on('closed', () => (loadingScreen = null));
  loadingScreen.webContents.on('did-finish-load', () => {
    loadingScreen.show();   
    
    // Dev mode only
    if (!app.isPackaged)
      createWindow();
  });
};

