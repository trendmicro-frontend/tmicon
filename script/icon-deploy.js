var main = () => !(window.$ && window.DeepDiff) ? setTimeout(() => main(), 20) : init();
var deployModal = `<div id="modal-deploy-icons" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-xs" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true" class="icon icon-modal-close"></span></button>
              <h3 class="modal-title">Deploy Icons Confirmation</h3>
            </div>
            <div class="modal-body body-xs">
              Are you shure you want to deploy all icons and preferences to the official site now?
            </div>
            <div class="modal-footer">
              <button id="deployBtn" type="button" class="btn btn-primary">Deploy Now!</button><button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </div>`;
var init = function () {
  var diff = DeepDiff.noConflict();
  var getReviewSiteIconInfo = new Promise((resolve, reject) => {
    $.ajax({
      url: 'http://style-portal.tw.trendnet.org:9001/api/icons/info',
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
      url: 'http://style-portal.tw.trendnet.org:8080/api/icons/info',
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
      var differents = diff(reviewSite, officialSite);
      
      if (differents && differents.length > 0) {
        reviewSite.isOfficial = true;
        var deployButton = $('<button class="btn btn-default" data-toggle="modal" data-target="#modal-deploy-icons">Deploy icons!</button>').appendTo($('header > .pull-right'));
        $(deployModal).appendTo('body');
        $('#deployBtn').on('click', function () {
          $.ajax({
            url: 'http://style-portal.tw.trendnet.org:8080/api/icons/deploy',
            method: 'post',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(reviewSite)
          })
          .done((data) => {
            console.log(data);
          })
          .fail((req, status, error) => {
            alert( "Something fail! Please contact administrator to solve this problem!" );
          });
        });
      }
    });
};
main();