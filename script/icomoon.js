const style = `.glyph { padding-left: 10px; padding-right: 54px; }.glyph.unit.not-ready { background: #fff; }.w-main .sep-right.selected .btn4 { width: 30%; }.deploy-button { width: 40% !important; margin-left: 46px; background: #3c5875; color: #fff; }.overlay.hide { display:none; }.overlayWindow { top: 20%; padding-top: 4.5em; }.overlayWindow h3 { position: absolute; top: 0; left: 0; margin: 0.4em 1.2em; }.action-buttons { text-align: right; position: relative; bottom: -20px; }.overlayWindow button { height: 32px;}.overlayWindow .deploy-button { margin-left: 12px; width: 120px !important; }`;
$(`<style>${style}</style>`).appendTo('head');
let $window = $(window), $document = $(document);
var $dplMdl,
  $dplMdlWindow,
  $dplMdlClose,
  $dplMdlCancel,
  $dplMdlDeploy,
  $dplMdlContent,
  $dplButton;
$dplMdl = $('<div class="overlay hide"></div>').append(
  $dplMdlWindow = $('<div class="overlayWindow overlayWindow-large m2-size3of4 m1-size4of5"><h3>Deploy Icons</h3></div>')
    .append(
      $dplMdlClose = $('<button class="absl pan pat top-right btn5 hoverE-icon"><i class="icon-close fs3 mvn lh1" data-icon2=""></i><span class="visuallyhidden">Close</span></button>')
        .add($dplMdlContent = $('<div class="deploy-content"></div>'))
        .add(
          $('<div class="action-buttons"></div>').append(
            $dplMdlCancel = $('<button class="btn4">Cancel</button>').add($dplMdlDeploy = $('<button class="btn4 deploy-button">Deploy now!</button>'))
          )
        )
    )
).appendTo('body');
const dplMdlShow = (e) => $dplMdl.removeClass('hide');
const dplMdlHide = (e) => $dplMdl.addClass('hide');
const appendDeployIcon = (callback) => {
  let tab = $('.w-main span.sep-right.selected');
  tab.length === 0 ? setTimeout(() => { appendDeployIcon(callback); }, 100) : tab.append($dplButton = $('<button class="btn4 deploy-button"><span>Deploy Icons</span></button>')) && callback();
}
const setDeployState = () => {
  getIndexedDB((data) => {
    let selectedCont = parseInt($('.w-main a[href="#/select"] .m1-hidden').text().match(/[\d]+/gi)[0], 10);
    let total = data.iconSets.reduce((acc, set) => acc + set.selection.length, 0);
    let enable = { disabled: false, title: null };
    let disable = { disabled: true, title: 'You can not deploy icons to the Style Portal until whole icons are seleted!' };
    selectedCont !== total ? $dplButton.attr(disable) : $dplButton.attr(enable);
  });
}
const disableResetButon = () => $('[ng-click="visiblePanels.reset = true"]').attr('disabled', true);
const initialHackSite = () => setDeployState() && disableResetButon();
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
}
const omit = (obj, keys) => Object.keys(obj).filter((key) => keys.indexOf(key) < 0).reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {});
$document
  .on('click', '#pref', () => $('mi-number[model="fontPref.metadata.minorVersion"] input').attr('disabled', true))
  .on('click', '[ng-click="removeGlyph(glyph)"]', () => setDeployState())
  .on('click', '.sep-right .deploy-button', (e) => {
    dplMdlShow();
    $.ajax({
      url: 'http://10.1.149.160:8001/api/icons/info',
      dataType: 'json'
    })
    .done((info) => {
      let oPreferences = info.preferences;
      let oIcons = info.icons.reduce((acc, icon) => {
        acc[icon.code] = icon;
        return acc;
      }, {});
      getIndexedDB((data) => {
        let $wording = $('<p></p>');
        let cIcons = data.iconSets.reduce((acc, set) => {
          set.selection.forEach((icon, index) => {
            icon.code = (icon.code).toString(16);
            acc[icon.code] = Object.assign(icon, set.icons[index]);
          })
          return acc;
        }, {});
        let modifiedIcons = [];
        let newIcons = Object.keys(cIcons).reduce((acc, key) => {
          if (Object.keys(oIcons).indexOf(key) === -1) acc.push(cIcons[key]);
          return acc;
        }, []);
        let removedIcons = Object.keys(oIcons).reduce((acc, key) => {
          if (Object.keys(cIcons).indexOf(key) === -1) acc.push(oIcons[key]);
          return acc;
        }, []);
        if (!newIcons.length && !removedIcons.length && !modifiedIcons.length ) {
          $dplMdlDeploy.attr('disabled', true);
          $wording.append('You haven\'t changed anything yet!');
        } else {
          $dplMdlDeploy.attr('disabled', false);
          let latestMjVersion = oPreferences.fontPref ? oPreferences.fontPref.metadata.majorVersion : data.preferences.fontPref.metadata.majorVersion;
          let latestMiVersion = oPreferences.fontPref ? (oPreferences.fontPref.metadata.minorVersion + 1) : data.preferences.fontPref.metadata.minorVersion;
          let contents = [];
          if (newIcons.length > 0) contents.push('create <strong>' + newIcons.length + '</strong> icon(s)');
          if (removedIcons.length > 0) contents.push('remove <strong>' + removedIcons.length + '</strong> icon(s)');
          if (modifiedIcons.length > 0) contents.push('modify <strong>' + modifiedIcons.length + '</strong> icon(s)');
          $wording
            .append('You will ')
            .append(contents.length === 3 ? contents.map((item, index) => { return index === 2 ? 'and ' + item : item; } ).join(', ') : contents.join(' and '))
            .append(' to the Trend Micro Font version- ' + latestMjVersion + '. <input id="deployMiVersion" style="width: 30px;" value="' + latestMiVersion + '">. Are you sure to deploy icons now?');
        }
        $dplMdlContent.text('').append($wording);
      });
    });
  });
$dplMdlClose.add($dplMdlCancel).on('click', dplMdlHide);
$dplMdlDeploy.on('click', () => {
  getIndexedDB((data) => {
    $('#pref').trigger('click');
    let $closePref = $('button[ng-click="visiblePanels.fontPref = false"]');
    let userMiNumber = parseInt($('#deployMiVersion').val(), 10);
    let $miNumber = $('mi-number[model="fontPref.metadata.minorVersion"] input').val(userMiNumber);
    angular.element($miNumber[0]).triggerHandler('change');
    angular.element($closePref[0]).triggerHandler('click');
    data.preferences.fontPref.metadata.minorVersion = userMiNumber;
    let icons = [];
    let iconSets = data.iconSets.map((iconset) => {
      iconset.icons.forEach((icon, index) => {
        let iconData = Object.assign(
          omit(icon, ['attrs', 'colorPermutations', 'grid', 'isMulticolor', 'isMulticolor2']),
          omit(iconset.selection[index], ['id', 'prevSize', 'tempChar', 'codes']),
          { iconset: iconset.id }
        )
        iconData.code = iconData.code.toString(16);
        icons.push(iconData);
      });
      return {
        id: iconset.id,
        name: iconset.metadata.name
      }
    });
    let preferences = Object.assign({
      fontPref: data.preferences.fontPref,
      imagePref: data.preferences.imagePref
    }, omit(data.metadata, ['lastOpened']));

    $.ajax({
      url: 'http://10.1.149.160:8001/api/icons/preferences',
      method: 'post',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(preferences)
    })
    .done(() => {
      return $.ajax({
        url: 'http://10.1.149.160:8001/api/icons/iconsets',
        method: 'post',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(iconSets)
      })
    })
    .done(() => {
      return $.ajax({
        url: 'http://10.1.149.160:8001/api/icons',
        method: 'post',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(icons)
      })
    })
    .done((data) => {
      console.log(data);
    })
    .fail((req, status, error) => {
      alert( "Something fail!" );
    });
  });
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