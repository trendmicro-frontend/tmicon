const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const _sortBy = require('lodash.sortby');

const svgVewBoxStart = 'viewBox="';
const svgVewBoxEnd = '">';
const DEFAULT_VIEWBOX = '0 0 16 16';
const ICONMMON_VIEWBOX = '0 0 1060 1060';
const svgPathStart = 'd="';
const svgPathEnd = '"></path>';
const dataFromSvgFile = {};
const dataParsedFromApi = {};
const svgFolder = path.resolve(__dirname, '../dist/svg');
const preferencesDataPath = path.resolve(__dirname, '../data/Preferences.json');
const IconsDataPath = path.resolve(__dirname, '../data/Icons.json');
const outputIndexPath = path.resolve(__dirname, '../src/icons/index.js');
const outputIconsFolder = path.resolve(__dirname, '../src/icons');
const outputIconsetsPath = path.resolve(__dirname, '../src/iconsets/index.js');
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
  dataFromSvgFile[file.split('.svg')[0].toLowerCase()] = { paths, viewBox };
});

if (count > 0) {
  console.log('Incorrect viewBox count', count);
}

const reference = fs.readFileSync(preferencesDataPath,  'utf-8');
const referenceData = JSON.parse(reference);
const _majorVersion = referenceData.fontPref.metadata.majorVersion;
const _minorVersion = referenceData.fontPref.metadata.minorVersion;

const icons = fs.readFileSync(IconsDataPath,  'utf-8');
const iconsData = JSON.parse(icons);
dataParsedFromApi.icons = iconsData
  .sort(function(a, b) {
    var nameA = a.name.toLowerCase() // ignore upper and lowercase
    var nameB = b.name.toLowerCase(); // ignore upper and lowercase
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
    name: name.toLowerCase(),
    new: majorVersion === _majorVersion && minorVersion === _minorVersion,
    paths
  }));

{ // icons
  const icons = dataParsedFromApi.icons.map(icon => {
    const iconData = {
      ...icon,
      paths: dataFromSvgFile[icon.name].paths,
      viewBox: dataFromSvgFile[icon.name].viewBox
    };
    const ejsTemp = [
      '/* AUTO-GENERATED FILE. DO NOT MODIFY. */',
      `const icon = <%- JSON.stringify(iconData, null, 2) %>;`,
      '',
      'export default icon;',
    ].join('\n');
    const iconContext = {
      iconData
    };
    const iconContent = ejs.render(ejsTemp, iconContext);
    fs.writeFileSync(path.resolve(outputIconsFolder, `${icon.name}.js`), iconContent, 'utf8');
    return iconData;
  });
  const ejsTemplate = [
    '/* AUTO-GENERATED FILE. DO NOT MODIFY. */',
    `const icons = <%- JSON.stringify(icons, null, 2) %>;`,
    '',
    'export default icons;',
  ].join('\n');
  const context = {
    icons,
  };
  const content = ejs.render(ejsTemplate, context);
  fs.writeFileSync(outputIndexPath, content, 'utf8');
}

{ // iconsets
  const iconsets = _sortBy(require('../data/Iconsets.json'), ['id']);
  const ejsTemplate = [
    '/* AUTO-GENERATED FILE. DO NOT MODIFY. */',
    `const iconsets = <%- JSON.stringify(iconsets, null, 2) %>;`,
    '',
    'export default iconsets;',
  ].join('\n');
  const context = {
    iconsets,
  };
  const content = ejs.render(ejsTemplate, context);
  fs.writeFileSync(outputIconsetsPath, content, 'utf8');
}
