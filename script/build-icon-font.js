const path = require("path");
const fs = require("fs");
const request = require('sync-request');
const download = require('download');
const preferences = require("../data/Preferences.json");
const icons = require("../data/Icons.json");
const cssSrc = 'https://i.icomoon.io/public/a8317e20c1/TMIcons/style.css';
const cssDest = path.join(__dirname, '..', 'dist', 'icon-font.css');
const fontDest = path.join(__dirname, '..', 'dist', 'fonts');
const demoHTMLSrc = path.join(
  __dirname,
  "..",
  "templates",
  "icon-font-demo.tpl"
);
const demoHTMLDest = path.join(__dirname, "..", "dist", "icon-font-demo.html");
const demoCSSSrc = path.join(__dirname, "..", "css", "icon-font-demo.css");
const demoCSSDest = path.join(
  __dirname,
  "..",
  "dist",
  "demo-files",
  "icon-font-demo.css"
);
const demoJSSrc = path.join(__dirname, "..", "script", "icon-font-demo.js");
const demoJSDest = path.join(
  __dirname,
  "..",
  "dist",
  "demo-files",
  "icon-font-demo.js"
);
const prefix = preferences.fontPref.prefix;
const selector = preferences.fontPref.classSelector.replace(".", "");
const _fontName = preferences.fontPref.metadata.fontFamily;
const _glyphsCount = icons.length;
const _gridSize = preferences.gridSize;
const generatedDat = new Date();
const _generatedDate = `${generatedDat.getFullYear()}-${
  generatedDat.getMonth() + 1
}-${generatedDat.getDate()}`;

let demoHTML = fs.readFileSync(demoHTMLSrc, "utf-8");
let firstIconCode;
let replaceData = { _fontName, _glyphsCount, _gridSize, _generatedDate };

demoHTML = demoHTML.replace(
  new RegExp(Object.keys(replaceData).join("|"), "gi"),
  (matched) => replaceData[matched]
);
icons.forEach((icon, index) => {
  if (index === 0) firstIconCode = icon.code;
  demoHTML = demoHTML.replace(
    "<!--Icons repeater-->",
    `
    <div class="glyph fs1">
    <div class="clearfix bshadow0 pbs">
        <span class="${selector} ${prefix}${icon.name}">
        </span>
        <span class="mls">${prefix}${icon.name}</span>
        <span class="mls char-code">(&#x<span>${icon.code})</span></span>
    </div>
    </div>
    <!--Icons repeater-->`
  );
});
demoHTML = demoHTML.replace(
  "<!--Script placeholder-->",
  `
    <script>
      var testText = document.getElementById('testText');
      document.getElementById('testDrive').className = '${selector}';
      testText.value = '&#x${firstIconCode}';
      testText.dispatchEvent(new Event('change'));
    </script>
  `
);
fs.copyFileSync(demoCSSSrc, demoCSSDest);
fs.copyFileSync(demoJSSrc, demoJSDest);
fs.writeFileSync(demoHTMLDest, demoHTML, 'utf8');

const cssRes = request('GET', cssSrc);
const fontURLRegex = /url\(['"]?([^'")]*)['"]?\)/g;
const fontPaths = [];
let css = cssRes.getBody('utf8');

let match;
while ((match = fontURLRegex.exec(css)) !== null) {
  fontPaths.push(match[1]);
}

Promise.all(fontPaths.map((fontPath) => {
  let fontFullName = fontPath.split('/').pop();
  css = css.replace(fontPath, `fonts/${fontFullName}`);
  return download(fontPath, fontDest);
}))
.then((data) => {
  fs.writeFileSync(cssDest, css, 'utf8');
  console.log('Built icon fonts successfully.');
});