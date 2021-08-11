const { ipcRenderer } = require("electron");
ipcRenderer.on("message", function (event, data) {
  var message = document.getElementById("messages");
  if (typeof data === "string") {
      message.innerText = data;
  } else {
        var progressBar = document.getElementById("innerBar");
        var progressText = document.getElementById("innerText");
        message = 'Download Speed:' + data.bytesPerSecond;
        progressBar.style.width = data.percent + '%';
        progressText = `${data.percent}% ${data.transferred} / ${data.total}`;
  }
});
