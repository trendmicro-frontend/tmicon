const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const _sortBy = require('lodash.sortby');
const { size } = require('lodash');


const DEFAULT_VIEWBOX = '0 0 16 16';
const DEFAULT_WIDTH = '16';
const DEFAULT_HEIGHT = '16';
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

const transformKebabCaseToCapitalizedCamelCase = (str) => {
  return str
    .split('-')
    .map((part) => {
      if (part === part.toUpperCase()) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
};

function extractSVGAttributes(svgString) {
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
  const widthMatch = svgString.match(/width="([^"]+)"/);
  const heightMatch = svgString.match(/height="([^"]+)"/);

  return {
    viewBox: viewBoxMatch ? viewBoxMatch[1] : null,
    width: widthMatch ? widthMatch[1] : null,
    height: heightMatch ? heightMatch[1] : null
  };
}
fs.readdirSync(svgFolder).forEach(file => {
  var svgContent = fs.readFileSync(`${svgFolder}/${file}`,  'utf-8');
  if (svgContent.indexOf('<svg') >= 0) {
    const size = extractSVGAttributes(svgContent);
    if (size.viewBox !== DEFAULT_VIEWBOX || size.width !== DEFAULT_WIDTH || size.height !== DEFAULT_HEIGHT ) {
      console.log(file);
      count += 1
    }
    dataFromSvgFile[file.split('.svg')[0].toLowerCase()] = { svg: svgContent, viewBox: size.viewBox };
  }
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
  .map(({ name, majorVersion, minorVersion, iconset, svg}) => {
    return {
      iconset,
      name,
      new: majorVersion === _majorVersion && minorVersion === _minorVersion,
      svg
    };
  });

{ // icons
  const icons = dataParsedFromApi.icons.map(icon => {
    const iconData = {
      ...icon,
      svg: dataFromSvgFile[icon.name.toLowerCase()].svg,
      viewBox: dataFromSvgFile[icon.name.toLowerCase()].viewBox
    };
    const ejsTemp = [
      '// AUTO-GENERATED FILE. DO NOT MODIFY.',
      '',
      `const icon = <%- JSON.stringify(iconData, null, 2) %>;`,
      '',
      'export default icon;',
    ].join('\n');
    const iconContext = {
      iconData
    };
    const iconContent = ejs.render(ejsTemp, iconContext);
    fs.writeFileSync(path.resolve(outputIconsFolder, `${icon.name.toLowerCase()}.js`), iconContent, 'utf8');
    return iconData;
  });
  const ejsTemplate = [
    '// AUTO-GENERATED FILE. DO NOT MODIFY.',
    '',
    ...icons.map(icon => `import ${transformKebabCaseToCapitalizedCamelCase(icon.name)}Icon from './${icon.name.toLowerCase()}';`),
    '',
    'const icons = [',
    ...icons.map(icon => `  ${transformKebabCaseToCapitalizedCamelCase(icon.name)}Icon,`),
    '];',
    '',
    'export {',
    '  icons,',
    ...icons.map(icon => `  ${transformKebabCaseToCapitalizedCamelCase(icon.name)}Icon,`),
    '};',
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
    '// AUTO-GENERATED FILE. DO NOT MODIFY.',
    '',
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
