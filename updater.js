const { ipcRenderer } = require("electron");
ipcRenderer.on("message", function (event, data) {
  var message = document.getElementById("messages");
  if (typeof data === "string") {
      message.innerText = data;
  } else {
        var progressBar = document.getElementById("innerBar");
        var innerText = document.getElementById("innerText");
        message.innerText = 'Download Speed:' + data.bytesPerSecond;
        progressBar.style.width = data.percent + '%';
        innerText.innerText = `${data.percent.toFixed(1)}% ${data.transferred.toFixed(2)} / ${data.total.toFixed(2)}`; 
  }
});
