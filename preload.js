// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const electron = require('electron');
const ipc = electron.ipcRenderer;
window.addEventListener('DOMContentLoaded', () => {
    ipc.send('app-version');
});

ipc.on('app-version', (event, data) => {
  console.log("get-version")
  const element = document.getElementById("package-version");
  element.innerText = `v${data}`;

})
