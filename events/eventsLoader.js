const log = require('electron-log');
const fs = require('fs');
const path = require('path');

log.info('This message send from Event');
const events = fs.readdirSync(__dirname).filter(filename => filename.endsWith('.js') && filename !== "eventsLoader.js");

log.info('Loading events javascript: ');
events.forEach((filename, index) => {
    require(path.join(__dirname, filename));
    log.info(`  ${index + 1}. %c${filename} ✅`, "color: cyan");
});
log.info('All events loaded!');

