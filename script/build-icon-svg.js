const fs = require("fs");
const path = require("path");

(async () => {
  const preferences = require("../data/Preferences.json");
  const icons = require("../data/Icons.json");
  const iconsets = require("../data/Iconsets.json");
  const prefix = preferences.imagePref.prefix;
  const classSelector = preferences.imagePref.classSelector.replace('.', '');
  const defaultColor = `rgb(${preferences.imagePref.color
    .toString(16)
    .match(/\w\w/gi)
    .map((color) => parseInt(color, 16))
    .join(",")})`;
  const cssSrc = path.join(__dirname, "..", "templates", "style-svg.css");
  const cssDist = path.join(__dirname, '..', 'dist', 'icon-svg.css');
  const svgDest = path.join(__dirname, '..', 'dist', 'svg');

  function changeSVGFillColor(svgString, newColor) {
    // 顏色轉換邏輯保持不變
    let r, g, b, a;
    if (newColor.startsWith('#')) {
      r = parseInt(newColor.slice(1, 3), 16);
      g = parseInt(newColor.slice(3, 5), 16);
      b = parseInt(newColor.slice(5, 7), 16);
      a = newColor.length > 7 ? parseInt(newColor.slice(7, 9), 16) / 255 : 1;
    } else {
      const match = newColor.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/);
      if (match) {
        [, r, g, b, a = '1'] = match;
        [r, g, b] = [r, g, b].map(Number);
        a = parseFloat(a);
      } else {
        throw new Error('Invalid color format');
      }
    }
  
    // 替換整個 SVG 中的填充顏色和透明度
    const modifiedSVG = svgString
      .replace(/fill="[^"]*"/g, `fill="rgb(${r}, ${g}, ${b})"`)
      .replace(/fill-opacity="[^"]*"/g, `fill-opacity="${a.toFixed(2)}"`);
  
    return modifiedSVG;
  }

  function generateSVGSymbols(icons) {
    const symbols = icons.map(icon => {
      const { name, svg, grid } = icon;
      
      // 使用 grid 屬性設置 viewBox
      const viewBox = `0 0 ${grid} ${grid}`;
  
      // 提取 SVG 內容（排除 <svg> 開始和結束標籤）
      const contentMatch = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
      const svgContent = contentMatch ? contentMatch[1].trim() : '';
  
      return `
    <symbol id="tm-svg-${name}" viewBox="${viewBox}">
      ${svgContent}
    </symbol>`;
    }).join('\n');
  
    return `
  <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
  ${symbols}
  </defs>
  </svg>`.trim();
  };
  
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
  
  icons.forEach((icon) => {
    const targetPath = path.join(svgDest, `${icon.name.toLowerCase()}.svg`);
    icon.grid = Math.round(icon.grid);
    const svgContent = changeSVGFillColor(icon.svg, defaultColor);
    icon.svg = changeSVGFillColor(svgContent, 'rgba(255, 255, 255, 1)');
    fs.writeFileSync(targetPath, svgContent);
    
    const iconset = iconsets.find(set => set.id === icon.iconset);
    if (!iconGroupBySize[icon.grid]) iconGroupBySize[icon.grid] = {};
    if (!iconGroupBySize[icon.grid][iconset.name]) iconGroupBySize[icon.grid][iconset.name] = [];
    const iconsetArray = iconGroupBySize[icon.grid][iconset.name];
    iconsetArray.push(`<div class="glyph fs1"><div class="clearfix pbs"><svg class="${classSelector} ${prefix}${icon.name}"><use xlink:href="#${prefix}${icon.name}"></use></svg><span class="name">${icon.name}</span></div></div>`);
  });
  svgDemoTpl = svgDemoTpl.replace('_symbol', generateSVGSymbols(icons));
  svgDemoTpl = svgDemoTpl.replace('_generatedDate', _generatedDate);
  svgDemoTpl = svgDemoTpl.replace('_iconSets', Object.keys(iconGroupBySize).map((size) => {
    const sizeContent = [];
    sizeContent.push(`<div class="clearfix svg-container ptl"><h2 class="grid-size mvm mtn fgc1">Grid Size: ${size} px</h1>`);
    Object.keys(iconGroupBySize[size]).forEach(cate => {
      sizeContent.push(`<div class="svg-category">`);
      sizeContent.push(`  <h3>${cate}</h2>`);
      sizeContent.push(`  <div class="cate-container">`);
      sizeContent.push(iconGroupBySize[size][cate].join('\n'));
      sizeContent.push(`  </div>`);
      sizeContent.push(`</div>`);
    });
    return sizeContent.join('');
  }).join('\n'));

  fs.writeFileSync(svgDemoHTMLDest, svgDemoTpl, 'utf8');

  console.log('SVG files built successfully.');
})();

