/* global iconData */
const syncRequest = require('sync-request');
const sync = require('child_process').spawnSync;
const urlRegex = require('url-regex');

module.exports = function () {
  const grunt = this;
  const iconRootSrc = iconData.iconRootSrc;
  const iconRootDest = iconData.iconRootDest;
  const preferences = iconData.preferences;
  const icons = iconData.icons;
  const cssSrc = 'https://i.icomoon.io/public/e85d3b8953/TMIcons/style.css';
  const cssDest = `${iconRootDest}/icon-font.css`;
  const fontDest = `${iconRootDest}/fonts`;
  const demoHTMLSrc = `${iconRootSrc}/templates/icon-font-demo.tpl`;
  const demoHTMLDest = `${iconRootDest}/icon-font-demo.html`;
  const demoCSSSrc = `${iconRootSrc}/css/icon-font-demo.css`;
  const demoCSSDest = `${iconRootDest}/demo-files/icon-font-demo.css`;
  const demoJSSrc = `${iconRootSrc}/script/icon-font-demo.js`;
  const demoJSDest = `${iconRootDest}/demo-files/icon-font-demo.js`;
  const prefix = preferences.fontPref.prefix;
  const selector = preferences.fontPref.classSelector.replace('.', '');
  const _fontName = preferences.fontPref.metadata.fontFamily;
  const _glyphsCount = iconData.icons.length;
  const _gridSize = preferences.gridSize;

  let demoHTML = grunt.file.read(demoHTMLSrc);
  let cssRes = syncRequest('GET', cssSrc);
  let css = cssRes.getBody('utf8');
  let fontPaths = css.match(urlRegex()).map((path) => path.replace(/\'\);?/gi, ""));
  let firstIconCode;
  let replaceData = { _fontName, _glyphsCount, _gridSize };

  grunt.file.mkdir(fontDest);

  demoHTML = demoHTML.replace(new RegExp(Object.keys(replaceData).join("|"),"gi"), (matched) => replaceData[matched]);
  icons.forEach((icon, index) => {
    if (index === 0) firstIconCode = icon.code;
    demoHTML = demoHTML.replace('<!--Icons repeater-->', `
      <div class="glyph fs1">
        <div class="clearfix bshadow0 pbs">
            <span class="${selector} ${prefix}${icon.name}">
            </span>
            <span class="mls">${prefix}${icon.name}</span>
        </div>
        <fieldset class="fs0 size1of1 clearfix hidden-false">
            <input type="text" readonly value="${icon.code}" class="unit" />
        </fieldset>
      </div>
      <!--Icons repeater-->
    `);
  });
  demoHTML = demoHTML.replace('<!--Script placeholder-->', `
    <script>
      var testText = document.getElementById('testText');
      document.getElementById('testDrive').className = '${selector}';
      testText.value = '&#x${firstIconCode}';
      testText.dispatchEvent(new Event('change'));
    </script>
  `);

  grunt.file.copy(demoCSSSrc, demoCSSDest);
  grunt.file.copy(demoJSSrc, demoJSDest);
  grunt.file.write(demoHTMLDest, demoHTML);
  fontPaths.forEach(function(fontPath) {
    let fontFullName = fontPath.split('/').pop();
    css = css.replace(fontPath, `fonts/${fontFullName}`);
    sync('wget', [fontPath, '-O', fontFullName.split('?')[0]], { cwd: fontDest});
  });
  grunt.file.write(cssDest, css);
};