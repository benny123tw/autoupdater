// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const electron = require('electron');
window.addEventListener('DOMContentLoaded', () => {
  const element = document.getElementById("package-version");
  element.innerText = window.location.hash.substring(1);
});