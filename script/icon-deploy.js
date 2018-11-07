var main = () => !(window.$ && window.DeepDiff) ? setTimeout(() => main(), 20) : init();
var deployModal = `<div id="modal-deploy-icons" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-xs" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button id="deployModalCanel" type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true" class="icon icon-modal-close"></span></button>
              <h3 class="modal-title">Deploy Icons Confirmation</h3>
            </div>
            <div class="modal-body body-xs">
              Are you sure you want to deploy all icons and preferences to the official site now?
            </div>
            <div class="modal-footer">
              <button id="deployBtn" type="button" class="btn btn-primary">Deploy Now!</button><button id="deployCancel" type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </div>`;

var init = function () {
  var $loader = $('<span class="loader loader-small"></span>');
  var openOfficialSite = $('<a href="https://style-portal.tw.trendnet.org/#/styles/minimalism/latest/1811bd76-57b6-4fb9-930f-b6899313fa41" target="_blank">Open Review Site!</a>');
  var diff = DeepDiff.noConflict();
  var getReviewSiteIconInfo = new Promise((resolve, reject) => {
    $.ajax({
      url: 'https://style-portal.tw.trendnet.org:9004/api/icons/info',
      dataType: 'json'
    })
    .done((info) => {
      resolve(info); 
    })
    .fail(function( jqXHR, textStatus ) {
      reject(textStatus);
    });
  });
  var getOfficalSiteIconInfo = new Promise((resolve, reject) => {
    $.ajax({
      url: 'https://style-portal.tw.trendnet.org/api/icons/info',
      dataType: 'json'
    })
    .done((info) => {
      resolve(info); 
    })
    .fail(function( jqXHR, textStatus ) {
      reject(textStatus);
    });
  });
  Promise
    .all([getReviewSiteIconInfo, getOfficalSiteIconInfo])
    .then(function(infos) {
      
      var reviewSite = infos[0];
      var officialSite = infos[1];
      if (reviewSite.preferences) delete reviewSite.preferences.fontPref.metadata.date;
      if (officialSite.preferences) delete officialSite.preferences.fontPref.metadata.date;
      
      var differents = diff(reviewSite, officialSite);
      
      if (differents && differents.length > 0) {
        reviewSite.isOfficial = true;
        var deployButton = $('<button class="btn btn-primary" data-toggle="modal" data-target="#modal-deploy-icons">Deploy icons!</button>');
        var timer = setInterval(function () {
          var buttonGroup = $('header > div');
          if (buttonGroup.length > 0) {
            deployButton.appendTo(buttonGroup);
            clearInterval(timer);
          }
        }, 300);
        
        $(deployModal).appendTo('body');
        
        var deployNow = $('#deployBtn').on('click', function () {
          var $deployCancel = $('#deployCancel');
          var $deployModalCanel = $('#deployModalCanel');
          deployNow.prepend($loader).add($deployCancel).add($deployModalCanel).attr('disabled', true);
          
          $.ajax({
            url: 'https://style-portal.tw.trendnet.org/api/icons/deploy',
            method: 'post',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(reviewSite)
          })
          .done((data) => {
            $loader.remove();
            deployNow.add(deployCancel).add(deployModalCanel).attr('disabled', false);
            setTimeout(function () {
              $deployCancel.trigger('click');
              openOfficialSite[0].click();
              openOfficialSite.remove();
              document.location.reload();
            }, 2000);
          })
          .fail((req, status, error) => {
            alert( "Something fail! Please contact administrator to solve this problem!" );
          });
        });
      }
    });
};
main();