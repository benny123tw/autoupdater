// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

window.addEventListener("DOMContentLoaded", () => {
  const element = document.getElementById("package-version");
  element.innerText = window.location.hash.substring(1);

  // const saveFileBtn = document.getElementById("save-file");
  // saveFileBtn.onclick = () => {
  //   ipcRenderer.send("open-save-dialog");
  // }

  // const openFileBtn = document.getElementById("open-file");
  // openFileBtn.onclick = () => {
  //   ipcRenderer.send("open-file-dialog");
  // }

  // const textArea = document.getElementById("text-area");
  // const clipboard = document.getElementById('clipboard');
  // clipboard.onclick = () => {
  //   ipcRenderer.send("clipboard-copy", textArea.value);
  // }

  // Buttons
  const startBtn = document.querySelector("#startBtn");
  const stopBtn = document.querySelector("#stopBtn");
  const videoSelectBtn = document.querySelector("#videoSelectBtn");

  startBtn.onclick = (e) => {
    mediaRecorder.start();
    startBtn.classList.add("is-danger");
    startBtn.innerText = "Recording";
  };

  stopBtn.onclick = (e) => {
    mediaRecorder.stop();
    startBtn.classList.remove("is-danger");
    startBtn.innerText = "Start";
  };

  videoSelectBtn.onclick = (e) => {
    ipcRenderer.send("get-video-source");
  };
});

const { ipcRenderer } = require("electron");
const fs = require("fs");
// Global state
let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];

ipcRenderer.on("selected-file", (event, data) => {
  const textArea = document.getElementById("text-area");
  const result = fs.readFileSync(data.filePaths[0], {
    encoding: "utf8",
    flag: "r+",
  });
  textArea.value = result.toString();
});

ipcRenderer.on("saved-file", (event, data) => {
  const textArea = document.getElementById("text-area");
  console.log(data);
  if (!data.canceled)
    var result = fs.writeFile(
      data.filePath.endsWith(".txt") ? data.filePath : data.path + ".txt",
      textArea.value,
      { encoding: "utf8" },
      (err) => {
        if (err) throw err;

        return true;
      }
    );
  console.log(result);
});

ipcRenderer.on("clipboard-copy", (event, data) => {});

ipcRenderer.on("stream-handler", async (event, mainSource) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: mainSource.id,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720,
        },
      },
    });

    const video = document.querySelector("video");
    video.srcObject = stream;
    video.onloadedmetadata = (e) => video.play();

    // Create the Media Recorder
    const options = { mimeType: "video/webm; codecs=vp9" };
    mediaRecorder = new MediaRecorder(stream, options);

    // Register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
  } catch (error) {
    log.error(error);
  }
});

// Captures all recorded chunks
function handleDataAvailable(e) {
  console.log('video data available');
  recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  ipcRenderer.send('record-save-dialog', buffer);

}
