const sharp = require("sharp");
const fs = require('fs');
const path = require('path');
const svgFolder = path.join(__dirname, '..', 'dist', 'svg');
const pngFolder = path.join(__dirname, '..', 'dist', 'png');
const files = fs.readdirSync(svgFolder);
const failedFiles = [];
const convertFiles = files.map(svgFile => {
  const svgFilePath = path.join(svgFolder, svgFile);
  const pngFileName = path.basename(svgFile, '.svg') + '.png';
  const pngFilePath = path.join(pngFolder, pngFileName);
  return sharp(svgFilePath)
    .png()
    .toFile(pngFilePath)
    .catch(err => {
      failedFiles.push(svgFile);
    });
});

Promise.all(convertFiles)
  .then(() => {
    if (failedFiles.length === 0) {
      console.log('All SVG files converted successfully.');
    } else {
        console.error('Some SVG files failed to convert:', failedFiles);
    }
  })
  .catch(err => {
    console.error('Error in file conversion process:', err);
  });
