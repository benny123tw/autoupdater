const { desktopCapturer, ipcMain, Menu } = require("electron");
const log = require("electron-log");

ipcMain.on("get-video-source", async (event, data) => {
  let inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });

  inputSources = inputSources.map((c, i) => {
    const obj = {};
    obj.name = c.name;
    obj.id = c.id;
    obj.display_id = c.display_id;
    return obj;
  });

  log.info(inputSources);

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => {
      return {
        label: source.name,
        click: () => event.sender.send('stream-handler', source),
      };
    })
  );

  videoOptionsMenu.popup();
});
