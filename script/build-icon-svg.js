const fs = require("fs");
const path = require("path");

(async () => {
  const preferences = require("../data/Preferences.json");
  const icons = require("../data/Icons.json");
  const prefix = preferences.imagePref.prefix;
  const classSelector = preferences.imagePref.classSelector.replace('.', '');
  const defaultColor = `rgb(${preferences.imagePref.color
    .toString(16)
    .match(/\w\w/gi)
    .map((color) => parseInt(color, 16))
    .join(",")})`;
  const cssSrc = path.join(__dirname, "..", "templates", "style-svg.css");
  // const jsSrc = path.join(__dirname, "..", "templates", "svgxuse.js");
  const cssDist = path.join(__dirname, '..', 'dist', 'icon-svg.css');
  // const jsDist = path.join(__dirname, '..', 'dist', 'svgxuse.js');
  const svgDest = path.join(__dirname, '..', 'dist', 'svg');
  const svgTpl = fs.readFileSync(
    path.join(__dirname, "..", "templates", "svg.tpl"),
    "utf8"
  );
  function generateSVG(iconData, color="rgb(0, 0, 0)") {
    const { name, grid, paths } = iconData;
    const svgPaths = paths.map(path => `<path d="${path}" fill="${color}" />`).join('\n');
    let svgContent = svgTpl.replace(/_viewBox/gi, iconData.grid);
    svgContent = svgContent.replace(/_title/gi, iconData.name);
    svgContent = svgContent.replace('<!--paths-->', svgPaths);
    return svgContent.trim();
  }

  function generateSVGSymbols(icons) {
    const symbols = icons.map(icon => {
      const { name, grid, paths } = icon;
      const svgPaths = paths.map(path => `<path d="${path}"></path>`).join('');
      
      return `
    <symbol id="tm-svg-${name}" viewBox="0 0 ${grid} ${grid}">
      ${svgPaths}
    </symbol>`;
    }).join('\n');
  
    return `
  <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
  ${symbols}
  </defs>
  </svg>`.trim();
  
  }
  const svgDemoCSSSrc = path.join(__dirname, '..', 'css', 'icon-svg-demo.css');
  const svgDemoCSSDist = path.join(__dirname, '..', 'dist', 'demo-files', 'icon-svg-demo.css');
  const svgDemoTplPath = path.join(__dirname, '..', 'templates', 'icon-svg-demo.tpl');
  const svgDemoHTMLDest = path.join(__dirname, '..', 'dist', 'icon-svg-demo.html');
  const generatedDat = new Date();
  const _generatedDate = `${generatedDat.getFullYear()}-${generatedDat.getMonth() + 1}-${generatedDat.getDate()}`;

  let iconGroupBySize = {};
  let svgDemoTpl = fs.readFileSync(svgDemoTplPath, 'utf8');
  
  fs.copyFileSync(cssSrc, cssDist);
  // fs.copyFileSync(jsSrc, jsDist);
  fs.copyFileSync(svgDemoCSSSrc, svgDemoCSSDist);

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
    fs.writeFileSync(targetPath, generateSVG(icon, defaultColor));
    if (!iconGroupBySize[icon.grid]) iconGroupBySize[icon.grid] = [];
    iconGroupBySize[icon.grid].push(`<div class="glyph fs1"><div class="clearfix pbs"><svg class="${classSelector} ${prefix}${icon.name}"><use xlink:href="#${prefix}${icon.name}"></use></svg><span class="name"> ${prefix}${icon.name}</span></div></div>`);
  });
  svgDemoTpl = svgDemoTpl.replace('_symbol', generateSVGSymbols(icons));
  svgDemoTpl = svgDemoTpl.replace('_generatedDate', _generatedDate);
  svgDemoTpl = svgDemoTpl.replace('_iconSets', Object.keys(iconGroupBySize).map((size) => {
    iconGroupBySize[size].unshift(`<div class="clearfix svg-container ptl"><h1 class="grid-size mvm mtn fgc1">Grid Size: ${size} px</h1>`);
    iconGroupBySize[size].push('</div>');
    return iconGroupBySize[size].join('');
  }).join('\n'));

  fs.writeFileSync(svgDemoHTMLDest, svgDemoTpl, 'utf8');

  console.log('SVG files built successfully.');
})();

