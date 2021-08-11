const { ipcRenderer } = require("electron");
ipcRenderer.on("message", function (event, data) {
  var message = document.getElementById("messages");
  if (typeof data === "string") {
      message.innerText = data;
  } else {
        var progressBar = document.getElementById("innerBar");
        var innerText = document.getElementById("innerText");
        message.innerText = 'Download Speed:' + formatBytes(data.bytesPerSecond);
        progressBar.style.width = data.percent + '%';
        innerText.innerText = `${data.percent.toFixed(1)}% ${formatBytes(data.transferred)} / ${formatBytes(data.total)}`; 
  }
});

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
