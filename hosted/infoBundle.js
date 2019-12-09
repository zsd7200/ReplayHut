"use strict";

// InfoData to be rendered
var InfoData = function InfoData(props) {
  $("#terryMessage").animate({
    width: 'toggle'
  }, 350);
  checkPremium();
  return React.createElement("div", {
    className: "content-box"
  }, React.createElement("h3", {
    id: "title"
  }, "Replay Hut"), React.createElement("h5", null, "modified by ", React.createElement("a", {
    href: "https://github.com/zsd7200"
  }, "Zack Dunham"), " and ", React.createElement("a", {
    href: "https://github.com/tam8217"
  }, "Tristan Marshall"), " from DomoMaker"));
}; // render infodata with react


var setup = function setup(csrf) {
  ReactDOM.render(React.createElement(InfoData, {
    csrf: csrf
  }), document.querySelector("#content"));
}; // get csrf token


var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
}); // terry bool gets modified in showMessage to stop any weirdness with
// a lot of messages being activated at once

var firstTerry = true; // show error message

var showMessage = function showMessage(message) {
  var terry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "bad";
  // hide terry first
  $("#terryMessage").animate({
    width: 'hide'
  }, 0); // switch terry pic based on param

  switch (terry) {
    case "bad":
      $("#terry").attr("src", "/assets/img/terry_bad.png");
      break;

    case "good":
      $("#terry").attr("src", "/assets/img/terry_good.png");
      break;

    case "wait":
      $("#terry").attr("src", "/assets/img/terry_wait.png");
      break;

    default:
      $("#terry").attr("src", "/assets/img/terry_bad.png");
      break;
  } // change message


  $("#innerMessage").text(message);
  $("#terryMessage").animate({
    width: 'toggle'
  }, 350); // disappear terry after 4s only if firstTerry is active
  // this prevents multiple setTimeout functions running at the same
  // time, which causes weirdness

  if (firstTerry === true) {
    setTimeout(function () {
      $("#terryMessage").animate({
        width: 'hide'
      }, 350);
      firstTerry = true;
    }, 4000);
  } // set firstTerry to false


  firstTerry = false;
}; // redirect user to a page


var redirect = function redirect(response) {
  $("#terryMessage").animate({
    width: 'hide'
  }, 350);
  window.location = response.redirect;
}; // checks for premium and hides ads if necessary


var checkPremium = function checkPremium() {
  sendAjax('GET', '/getMyAccount', null, function (data) {
    if (data.account.premiumStatus === true) {
      $(".ad-sidebar").hide();
    } else {
      $(".ad-sidebar").show();
    }
  });
}; // send ajax request


var sendAjax = function sendAjax(type, action, data, success, error) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: error
  });
};