const fs = require("fs");
const path = require("path");
const request = require('sync-request');
const svgGen = require('./svgGenerator');
const preferences = require("../data/Preferences.json");
const icons = require("../data/Icons.json");
const prefix = preferences.imagePref.prefix;
const classSelector = preferences.imagePref.classSelector.replace('.', '');
const defaultColor = `rgb(${preferences.imagePref.color
  .toString(16)
  .match(/\w\w/gi)
  .map((color) => parseInt(color, 16))
  .join(",")})`;

const cssSrc = 'https://i.icomoon.io/public/a8317e20c1/TMIcons/style-svg.css';
const JSRes = 'https://i.icomoon.io/public/a8317e20c1/TMIcons/svgxuse.js';
const cssDist = path.join(__dirname, '..', 'dist', 'icon-svg.css');
const jsDist = path.join(__dirname, '..', 'dist', 'svgxuse.js');
const svgDest = path.join(__dirname, '..', 'dist', 'svg');
const svgTpl = fs.readFileSync(
  path.join(__dirname, "..", "templates", "svg.tpl"),
  "utf8"
);

const svgDemoCSSSrc = path.join(__dirname, '..', 'css', 'icon-svg-demo.css');
const svgDemoCSSDist = path.join(__dirname, '..', 'dist', 'demo-files', 'icon-svg-demo.css');
const svgDemoTplPath = path.join(__dirname, '..', 'templates', 'icon-svg-demo.tpl');
const svgDemoHTMLDest = path.join(__dirname, '..', 'dist', 'icon-svg-demo.html');
const svgDefsDest = path.join(__dirname, '..', 'dist', 'symbol-defs.svg');
const viewBox = preferences.fontPref.metrics.emSize;
const generatedDat = new Date();
const _generatedDate = `${generatedDat.getFullYear()}-${generatedDat.getMonth() + 1}-${generatedDat.getDate()}`;

let iconGroupBySize = {};
let css = request('GET', cssSrc).getBody('utf8');
let js = request('GET', JSRes).getBody('utf8');
const SVGregex = /var\s+fallback\s*=\s*"([^"]+\.svg[^"]*)"/;
const match = SVGregex.exec(js);
const svgUrl = match[1];
const svgDefs = request('GET', svgUrl).getBody('utf8');
let svgDemoTpl = fs.readFileSync(svgDemoTplPath, 'utf8');

fs.copyFileSync(svgDemoCSSSrc, svgDemoCSSDist);
fs.writeFileSync(svgDefsDest, svgDefs, 'utf8');
fs.writeFileSync(cssDist, css, 'utf8');
fs.writeFileSync(jsDist, js, 'utf8');

const files = fs.readdirSync(svgDest);
files.forEach(file => {
  const filePath = path.join(svgDest, file);
  if (fs.lstatSync(filePath).isFile()) {
    fs.unlinkSync(filePath);
  }
});

icons.sort(function (a, b) {
  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;
  return 0;
});

icons.forEach((icon) => {
  const targetPath = path.join(svgDest, `${icon.name.toLowerCase()}.svg`);
  icon.width = icon.height = icon.grid;
  icon.svgPath = svgGen(icon.paths);
  const scale = icon.height / viewBox;
  icon.scaledPath = icon.svgPath.scale(scale);
  icon.scaledPathData = icon.scaledPath.getPathData(true);

  let svgContent = svgTpl.replace(/_viewBox/gi, icon.grid);
  let paths = [];
  svgContent = svgContent.replace(/_title/gi, icon.name);
  icon.paths.forEach((path, pathIndex) => {
    let attr = Object.assign({ fill: defaultColor }, icon.attrs[pathIndex]);
    let genAttrs = [];
    Object.keys(attr).forEach((key) => genAttrs.push(`${key}="${attr[key]}"`));
    paths.push(`<path ${genAttrs.join(' ')} d="${icon.scaledPathData[pathIndex]}"></path>`);
  });
  svgContent = svgContent.replace('<!--paths-->', paths.join('\n  '));
  fs.writeFileSync(targetPath, svgContent);
  if (!iconGroupBySize[icon.grid]) iconGroupBySize[icon.grid] = [];
  iconGroupBySize[icon.grid].push(`<div class="glyph fs1"><div class="clearfix pbs"><svg class="${classSelector} ${prefix}${icon.name}"><use xlink:href="#${prefix}${icon.name}"></use></svg><span class="name"> ${prefix}${icon.name}</span></div></div>`);
});

svgDemoTpl = svgDemoTpl.replace('_symbol', svgDefs);
svgDemoTpl = svgDemoTpl.replace('_generatedDate', _generatedDate);
svgDemoTpl = svgDemoTpl.replace('_iconSets', Object.keys(iconGroupBySize).map((size) => {
  iconGroupBySize[size].unshift(`<div class="clearfix svg-container ptl"><h1 class="grid-size mvm mtn fgc1">Grid Size: ${size} px</h1>`);
  iconGroupBySize[size].push('</div>');
  return iconGroupBySize[size].join('');
}).join('\n'));

fs.writeFileSync(svgDemoHTMLDest, svgDemoTpl, 'utf8');

console.log('SVG files built successfully.');
