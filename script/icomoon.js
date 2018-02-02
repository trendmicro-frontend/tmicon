const main = () => !window.$ ? setTimeout(() => main(), 20) : init();
const PROJECT_KEY = 1511252817024;
var init = () => {
  const style = `
    @keyframes spinner {
      0% {
        transform: rotate(0deg);
      }
      
      100% {
        transform: rotate(360deg);
      }
    }
    .glyph { padding-left: 10px; padding-right: 10px; margin-right: 10px; min-width: 220px; }
    .glyph.unit.not-ready { background: #fff; }
    [ng-click="editGlyph(glyph)"] {
      pointer-events: none;
    }
    .glyph:hover .glyph-button {
      display: none;
    }
    .loader {
      display: inline-block;
      margin: 0 auto;
      position: relative;
      text-indent: -9999em;
      vertical-align: top;
      border: 2px solid rgba(0, 0, 0, 0.2);
      border-left-color: rgba(0, 0, 0, 0.8);
      transform: translateZ(0);
      animation: spinner 1s infinite linear;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
    .deploy-button .loader {
      border-color: rgba(255, 255, 255, 0.4);
      border-left-color: #fff;    
    }
    .set .miFileZone + h1 > label { pointer-events: none; }
    .w-main .sep-right.selected .btn4 { width: 30%; }
    .deploy-button { width: 40% !important; margin-left: 46px; background: #3c5875; color: #fff; }
    .overlay.hide { display:none; }
    .overlayWindow { top: 20%; padding-top: 4.5em; }
    .overlayWindow h3 { position: absolute; top: 0; left: 0; margin: 0.4em 1.2em; }
    .action-buttons { text-align: right; position: relative; bottom: -20px; }
    .overlayWindow button { height: 32px;}
    .overlayWindow .deploy-button { margin-left: 12px; width: auto !important; line-height: 20px; }
    .unit.size1of2 { width: 100%; }
    .unitRight.size1of2, [ng-click="showUniCharts(glyph)"] { display: none !important; }
    .dropdown {
      display: inline-block;
    }
    .dropdown-menu {
      position: absolute;
      background: #fff;
      z-index: 2;
      padding: 12px;
      border-radius: 4px;
      margin: 0;
      border: 1px solid;
      list-style: none;
      display: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
    .dropdown.open .dropdown-menu {
      display: block;
    }
    .caret {
      display: inline-block;
      width: 0;
      height: 0;
      vertical-align: middle;
      border-top: 4px dashed #666666;
      border-top: 4px solid \9;
      border-right: 4px solid transparent;
      border-left: 4px solid transparent;
    }
    button:hover .caret {
      border-top: 4px dashed #ffffff;
    }
    .input-checkbox {
      -webkit-appearance: checkbox;
      box-shadow: none;
      margin-right: 8px;
    }
  `;
  $(`<style>${style}</style>`).appendTo('head');
  let $window = $(window), $document = $(document);
  let $loader = $('<span class="loader loader-small"></span>');
  let XHR = window.XMLHttpRequest;
  let _XMLHttpRequest = window.XMLHttpRequest = function () {
    let xhr = new XHR();
    let url;
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XHR.HEADERS_RECEIVED) {
          url = xhr.responseURL;
          !_XMLHttpRequest.reqs[url] ? _XMLHttpRequest.reqs[url] = [xhr] : _XMLHttpRequest.reqs[url].push(xhr);
        }
        if(xhr.readyState === XHR.DONE && xhr.status === 200) {
          _XMLHttpRequest.reqs[url].splice(_XMLHttpRequest.reqs[url].indexOf(xhr), 1);
          if (_XMLHttpRequest.reqs[url].length === 0) $document.trigger(`complete:${url}`);
        }
    };
    return xhr;
  };
  window.XMLHttpRequest.reqs = {};
  window.XMLHttpRequest.listen = (type, url, callback) => $document.on(`${type}:${url}`, callback);
  var $dplMdl,
    $dplMdlWindow,
    $dplMdlClose,
    $dplMdlCancel,
    $dplMdlDeploy,
    $dplMdlContent,
    $dplButton = $('<button class="btn4 deploy-button"><span>Deploy Icons</span></button>');

  $dplMdl = $('<div class="overlay hide"></div>').append(
    $dplMdlWindow = $('<div class="overlayWindow overlayWindow-large m2-size3of4 m1-size4of5"><h3>Deploy Icons</h3></div>')
      .append(
        ($dplMdlClose = $('<button class="absl pan pat top-right btn5 hoverE-icon"><i class="icon-close fs3 mvn lh1" data-icon2=""></i><span class="visuallyhidden">Close</span></button>'))
          .add($dplMdlContent = $('<div class="deploy-content"></div>'))
          .add(
            $('<div class="action-buttons"></div>').append(
              ($dplMdlCancel = $('<button class="btn4">Cancel</button>')).add($dplMdlDeploy = $('<button class="btn4 deploy-button">Deploy now!</button>'))
            )
          )
      )
  ).appendTo('body');
  
  const array2object = function (array, key) {
    var object = {};

    array.forEach(function (item, index) {
      if (key) {
        object[item[key]] = item;
      }

      else {
        object[index] = item;
      }
    });

    return object;
  }
  const dplMdlShow = (e) => $dplMdl.removeClass('hide');
  const dplMdlHide = (e) => $dplMdl.addClass('hide');
  const appendDeployIcon = (callback) => {
    getIndexedDB(function (data) {
      if (data.metadata.created !== PROJECT_KEY) return;

    let tab = $('.w-main span.sep-right.selected');
    tab.length === 0 ? setTimeout(() => { appendDeployIcon(callback); }, 100) : tab.append($dplButton.attr('disabled', true)) && callback();
    });
  }
  const setDeployState = () => {
    return getIndexedDB((data) => {
      let selectedCont = parseInt($('.bar-btm .w-main').children().eq(1).find('.m1-hidden').text().match(/[\d]+/gi)[0], 10);
      let total = data.iconSets.reduce((acc, set) => acc + set.selection.length, 0);
      let enable = { disabled: false, title: null };
      let disable = { disabled: true, title: 'You can not deploy icons to the Style Portal until whole icons are seleted!' };
      selectedCont !== total ? $dplButton.attr(disable) : $dplButton.attr(enable);
    }),
    true;
  };
  const disableButon = () => $('#pref, [ng-click="visiblePanels.reset = true"], [ng-click="visiblePanels.fontPref = true"]').attr('disabled', true);
  const initialHackSite = () => setDeployState() && disableButon();
  const getIndexedDB = (callback) => {
    let request = indexedDB.open("IDBWrapper-storage");
    request.onerror = (event) => {
      alert("Browser IndexedDB function is not enabled?!");
    };
    request.onsuccess = (event) => {
      let db = event.target.result;
      let transaction = db.transaction('storage', IDBTransaction.READ_ONLY);
      let currentStorage = transaction.objectStore('storage');
      let currentStorageRequest = currentStorage.get("currentProject");
      currentStorageRequest.onsuccess = (event) => {
        let storageRequest = currentStorage.get(currentStorageRequest.result.obj);
        storageRequest.onsuccess = (event) => {
          callback(storageRequest.result.obj);
        }
      };
    };
  };
  const omit = (obj, keys) => Object.keys(obj).filter((key) => keys.indexOf(key) < 0).reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {});
  $document
    .on('click', '[ng-click="removeGlyph(glyph)"]', () => setDeployState())
    .on('click', '.sep-right .deploy-button', (e) => {
      dplMdlShow();
      var themesDeffered = $.ajax({
        url: 'http://style-portal.tw.trendnet.org:9003/api/themes',
        dataType: 'json'
      });
      var iconsDeffered = $.ajax({
        url: 'http://style-portal.tw.trendnet.org:9003/api/icons/info',
        dataType: 'json'
      });
      $.when(themesDeffered, iconsDeffered)
        .done(function (themeInfo, iconsInfo) {
          let oThemes = array2object(themeInfo[0], 'id');
          let oPreferences = iconsInfo[0].preferences;
          let oIcons = iconsInfo[0].icons.reduce((acc, icon) => {
            acc[icon.code] = icon;
            return acc;
          }, {});
          getIndexedDB((data) => {
            let $wording = $('<p></p>');
            let cIcons = data.iconSets.reduce((acc, set) => {
              set.selection.forEach((icon, index) => {
                icon.code = (icon.code).toString(16);
                icon.iconset = set.id;
                acc[icon.code] = Object.assign(icon, set.icons[index]);
              })
              return acc;
            }, {});
            let modifiedIcons = [];
            let newIcons = Object.keys(cIcons).reduce((acc, key) => {
              var oIcon = oIcons[key];
              var cIcon = cIcons[key];
  
              if (Object.keys(oIcons).indexOf(key) === -1) {
                acc.push(cIcon);
              } else {
                cIcon.tags = cIcon.tags.filter((x) => x !== '');
                if (oIcon.iconset !== cIcon.iconset ||
                    oIcon.name !== cIcon.name ||
                    oIcon.order !== cIcon.order ||
                    oIcon.tags
                      .filter(x => cIcon.tags.indexOf(x) === -1)
                      .concat(cIcon.tags.filter(x => oIcon.tags.indexOf(x) == -1)).length > 0 ||
                    oIcon.paths
                      .filter(x => cIcon.paths.indexOf(x) === -1)
                      .concat(cIcon.paths.filter(x => oIcon.paths.indexOf(x) == -1)).length > 0
                ) {
                  modifiedIcons.push(cIcon);
                }
              }
              return acc;
            }, []);
            let removedIcons = Object.keys(oIcons).reduce((acc, key) => {
              if (Object.keys(cIcons).indexOf(key) === -1) acc.push(oIcons[key]);
              return acc;
            }, []);
            if (!newIcons.length && !removedIcons.length && !modifiedIcons.length ) {
              $dplMdlDeploy.hide();
              $wording.append('You haven\'t changed anything yet!');
            } else {
              $dplMdlDeploy.show().attr('disabled', false);
              let latestMjVersion = oPreferences.fontPref ? oPreferences.fontPref.metadata.majorVersion : data.preferences.fontPref.metadata.majorVersion;
              let latestMiVersion = oPreferences.fontPref ? (oPreferences.fontPref.metadata.minorVersion + 1) : data.preferences.fontPref.metadata.minorVersion;
              let contents = [];
              let applyThemes = oPreferences.fontPref.metadata.applyThemes;
              
              if (newIcons.length > 0) contents.push('create <strong>' + newIcons.length + '</strong> new icon(s)');
              if (removedIcons.length > 0) contents.push('remove <strong>' + removedIcons.length + '</strong> icon(s)');
              if (modifiedIcons.length > 0) contents.push('modify <strong>' + modifiedIcons.length + '</strong> icon(s)');
              $wording
                .append('You will ')
                .append(contents.length === 3 ? contents.map((item, index) => { return index === 2 ? 'and ' + item : item; } ).join(', ') : contents.join(' and '))
                .append(' to the Trend Micro Font version- ' + latestMjVersion + '. <input id="deployMiVersion" style="width: 30px;" value="' + latestMiVersion + '"> and apply them with ')
                .append(`<div id="theme-dropdown" class="dropdown">
                  <button class="btn btn4 dropdown-toggle" type="button">
                    Theme(s) <span class="caret"></span>
                  </button>
                  <ul id="themeList" class="dropdown-menu">
                  ${Object.keys(oThemes).map(function(theme) {
                    return `
                    <li>
                      <sapn class="checkbox">
                        <input id="theme_${theme}" type="checkbox" class="input-checkbox" value="${theme}" ${applyThemes.indexOf(theme) > -1 ? 'checked': ''}>
                        <label for="theme_${theme}">${oThemes[theme].name}</label>
                      </sapn>
                    </li>
                    `
                  }).join('')}
                  
                  </ul>
                </div>`);
            }
            $dplMdlContent.text('').append($wording);
          });
        });
    })
    .on('focus', '[contenteditable]', function() {
      var $this = $(this);
      $this.data('before', $this.html());
      return $this;
    })
    .on('blur', '[contenteditable]', function() {
        var $this = $(this);
        if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
        }
        return $this;
    })
    .on('mousedown', 'mi-box', (e) => {
      if ($('[class*="embossed"]').is(`[ng-click="mode = 'delete'"]`) === true) {
        $dplButton.attr('disabled', true);
      }
      if ($('[class*="embossed"]').is(`[ng-click="mode = 'move'"]`) === true) {
        $dplButton.attr('disabled', true);
      }
    })
    .on('change', `
        .glyph input,
        [contenteditable],
        [ng-model="metadata.name"],
        [ng-model="metadata.designer"],
        [ng-click="moveSet(set, -1)"],
        [ng-click="moveSet(set, 1)"],
        [ng-click="selectAllNone($index, true)"],
        [ng-click="selectAllNone($index, false)"],
        [ng-click="copySelectionToSet($index, true)"],
        [ng-click="removeSet($index)"]
      `, (e) => {
        $dplButton.attr('disabled', true);
      }
    )
    .on('click', '.dropdown button', function (e) {
      if ($('#themeList').is(':visible')) {
        $('#theme-dropdown').removeClass('open');
      } else {
        $('#theme-dropdown').addClass('open');
      }
    })
    window.XMLHttpRequest.listen('complete', 'https://i.icomoon.io/storesession', () => {
      setDeployState();
      if ($loader.is(':visible')) {
        deploy();
      }
    });
    window.XMLHttpRequest.listen('complete', 'https://i.icomoon.io/getsessiontime', () => {
      if ($loader.is(':visible')) {
        deploy();
      }
    });
  $dplMdlClose.add($dplMdlCancel).on('click', dplMdlHide);
  
  var isDeploying = false;
  function deploy() {

    if (isDeploying) return;

    isDeploying = true;
    $('.bar-btm .w-main .sep-right')[0].click();
    let $deployMiVersion = $('#deployMiVersion');
    getIndexedDB((data) => {
      let $pref = $('#pref');
      $pref.attr('disabled', false).trigger('click');
      let $closePref = $('button[ng-click="visiblePanels.fontPref = false"]');
      let userMiNumber = parseInt($deployMiVersion.val(), 10);
      let $miNumber = $('mi-number[model="fontPref.metadata.minorVersion"] input').val(userMiNumber);
      angular.element($miNumber[0]).triggerHandler('change');
      angular.element($closePref[0]).triggerHandler('click');
      $pref.add($dplMdlDeploy).attr('disabled', true);
      data.preferences.fontPref.metadata.minorVersion = userMiNumber;
      let icons = [];
      let iconsets = data.iconSets.map((iconset) => {
        iconset.icons.forEach((icon, index) => {
          let iconData = Object.assign(
            omit(icon, ['colorPermutations', 'isMulticolor', 'isMulticolor2']),
            omit(iconset.selection[index], ['id', 'prevSize', 'tempChar', 'codes']),
            { iconset: iconset.id }
          )
          iconData.code = iconData.code.toString(16);
          iconData.tags = iconData.tags.filter((x) => x !== '');
          icons.push(iconData);
        });
        return {
          id: iconset.id,
          name: iconset.metadata.name
        }
      });
      
      let applyThemes = [];
      $('#themeList').find('.input-checkbox:checked').each(function (index, checkbox) {
        applyThemes.push(checkbox.value);
      });
      data.preferences.fontPref.metadata.applyThemes = applyThemes;
      let preferences = Object.assign({
        gridSize: data.preferences.gridSize,
        fontPref: data.preferences.fontPref,
        imagePref: data.preferences.imagePref
      }, omit(data.metadata, ['lastOpened']));

      $deployMiVersion.add($dplMdlCancel).add($dplMdlClose).attr('disabled', true);
      $.ajax({
        url: 'http://style-portal.tw.trendnet.org:9003/api/icons/deploy',
        method: 'post',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
          preferences,
          iconsets,
          icons
        })
      })
      .done((data) => {
        $loader.remove();
        $deployMiVersion.add($dplMdlCancel).add($dplMdlClose).attr('disabled', false);  
        $dplMdlContent.children().append('<span class="fs6-fixed ff0 mls fgc4"><i class="mrs icon-check fgc-success"></i>Deployed!</span>');
        var openStylePortal = $('<a href="http://style-portal.tw.trendnet.org:9003/#/styles/minimalism/latest/1811bd76-57b6-4fb9-930f-b6899313fa41" target="_blank">Open Review Site!</a>');
        $('body').append(openStylePortal);
        isDeploying = false;
        setTimeout(function () {
          openStylePortal[0].click();
          openStylePortal.remove();
          document.location.href = 'https://icomoon.io/app/#/select/font';
        }, 2000);
        
      })
      .fail((req, status, error) => {
        alert( "Something fail!" );
      });
    });
  }
  $dplMdlDeploy.on('click', () => {
    $dplMdlDeploy.prepend($loader);
    let $deployMiVersion = $('#deployMiVersion');
    $('.sep-right .deploy-button').closest('.w-main').find('.sep-left')[0].click();
  });
  $window
    .on('hashchange', (e) => {
      let _location = document.location.hash;
      if (_location === '#/select/font') appendDeployIcon(initialHackSite);
    })
    .on("keyup", (e) => {
      if (e.which == 27) dplMdlHide();
    });
  $window.trigger('hashchange');
}
main();