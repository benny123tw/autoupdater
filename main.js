// Modules to control application life and create native browser window
const {app, BrowserWindow, Tray, Menu} = require('electron')
const path = require('path');

// global variables
const assetsPath = app.isPackaged ? path.join(process.resourcesPath, "assets") : "assets";
const ICON_PATH = path.join(assetsPath, '16x16.png');
let tray = null;

function createWindow () {
  console.warn("create main window");


  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: ICON_PATH,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // mainWindow.loadURL(
  //   'file://' + __dirname + '/index.html'
  // );

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

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

  // setTimeout for debuging the loading screen 
  // "ppl don't care about the logo"
  // just speed up your application 
  // no need to show too much time for your logo
  setTimeout(() => {
    createWindow();
  }, 3000);

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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/// create a global var, wich will keep a reference to out loadingScreen window
//  when loading screen is shown then create main window window
//  when main screen is shown then close the loading screen
let loadingScreen;
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
      transparent: true
    })
  );
  loadingScreen.setResizable(false);
  loadingScreen.loadURL(
    'file://' + __dirname + '/loading/loading.html'
  );
  loadingScreen.on('closed', () => (loadingScreen = null));
  loadingScreen.webContents.on('did-finish-load', () => {
    loadingScreen.show();    
    // createWindow(); 
  });
};

