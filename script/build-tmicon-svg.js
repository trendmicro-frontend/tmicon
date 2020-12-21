const fs = require('fs');
const ejs = require('ejs');
const svgVewBoxStart = 'viewBox="';
const svgVewBoxEnd = '">';
const DEFAULT_VIEWBOX = '0 0 16 16';
const ICONMMON_VIEWBOX = '0 0 1060 1060';
const svgPathStart = 'd="';
const svgPathEnd = '"></path>';
const dataFromSvgFile = {};
const dataParsedFromApi = {};
const svgFolder = './dist/svg';
// Create tmIconMap.js file for Tonic UI
const TEMPLATE = `/* eslint-disable */
// This file is auto generated.
const tmiconSVG = <%- JSON.stringify(ImportObj) %>;
export default tmiconSVG;`;
let count = 0;

fs.readdirSync(svgFolder).forEach(file => {
  var text = fs.readFileSync(`${svgFolder}/${file}`,  'utf-8');
  // console.log(text);
  var textByLine = text.split('\n')
  const viewBox = textByLine
    .filter(line => line.indexOf('<svg') >= 0)
    .reduce((acc, svg) => {
      const viewBox = svg
        .split(svgVewBoxStart)[1]
        .split(svgVewBoxEnd)[0]
      if (viewBox === DEFAULT_VIEWBOX) {
        return DEFAULT_VIEWBOX;
      } else {
        count = count + 1;
        return ICONMMON_VIEWBOX;
      }
    }
    , DEFAULT_VIEWBOX);
  const paths = textByLine
    .filter(line => line.indexOf('path') >= 0)
    .map(path => path
      .split(svgPathStart)[1]
      .split(svgPathEnd)[0]
    )
  // console.log(viewBox);
  dataFromSvgFile[file.split('.svg')[0]] = { paths, viewBox };
});

if (count > 0) {
  console.log('Incorrect viewBox count', count);
}

var reference = fs.readFileSync('./data/Preferences.json',  'utf-8');
const referenceData = JSON.parse(reference);
const _majorVersion = referenceData.fontPref.metadata.majorVersion;
const _minorVersion = referenceData.fontPref.metadata.minorVersion;

var icons = fs.readFileSync('./data/Icons.json',  'utf-8');
const iconsData = JSON.parse(icons);
dataParsedFromApi.icons = iconsData
  .sort(function(a, b) {
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // names must be equal
    return 0;
  })
  .map(({ name, majorVersion, minorVersion, iconset, code, paths}) => ({
    code,
    iconset,
    name,
    new: majorVersion === _majorVersion && minorVersion === _minorVersion,
    paths
  }));

var iconSet = fs.readFileSync('./data/Iconsets.json',  'utf-8');
const iconSetData = JSON.parse(iconSet);
dataParsedFromApi.iconsets = iconSetData.sort(function(a, b) {
  var nameA = a.id; // ignore upper and lowercase
  var nameB = b.id; // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  // names must be equal
  return 0;
});
// merge data here
const combinedIcons = dataParsedFromApi.icons.map(icon => {
  return {
    ...icon,
    paths: dataFromSvgFile[icon.name].paths,
    viewBox: dataFromSvgFile[icon.name].viewBox
  }
});
let output = ejs.render(TEMPLATE, {
  ImportObj: {
    ...dataParsedFromApi,
    icons: combinedIcons
  }
});
fs.writeFile('src/tmicon-svg.js', output, 'utf8', function (err) {
  if (err) {
      console.log('An error occured while writing JS Object to File.');
      return console.log(err);
  }
  console.log('JS file has been saved.');
});
