const fs = require("fs");
const path = require("path");
const svgGen = require('./svgGenerator');
const preferences = require("../data/Preferences.json");
const icons = require("../data/Icons.json");
const svgTpl = fs.readFileSync(
  path.join(__dirname, "..", "templates", "svg.tpl"),
  "utf8"
);
const targetDir = path.join(__dirname, '..', 'dist', 'svg');
const defaultColor = `rgb(${preferences.imagePref.color
  .toString(16)
  .match(/\w\w/gi)
  .map((color) => parseInt(color, 16))
  .join(",")})`;
const viewBox = preferences.fontPref.metrics.emSize;
const files = fs.readdirSync(targetDir);
files.forEach(file => {
  const filePath = path.join(targetDir, file);
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
  const targetPath = path.join(targetDir, `${icon.name}.svg`);
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
});
