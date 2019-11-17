"use strict";

var InfoData = function InfoData(props) {
  $("#terryMessage").animate({
    width: 'toggle'
  }, 350);
  return React.createElement("div", {
    className: "content-box"
  }, React.createElement("h3", {
    id: "title"
  }, "Replay Hut"), React.createElement("h5", null, "modified by ", React.createElement("a", {
    href: "https://github.com/zsd7200"
  }, "Zack Dunham"), " and ", React.createElement("a", {
    href: "https://github.com/tam8217"
  }, "Tristan Marshall"), " from DomoMaker"));
};

var setup = function setup(csrf) {
  ReactDOM.render(React.createElement(InfoData, {
    csrf: csrf
  }), document.querySelector("#content"));
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});

var showMessage = function showMessage(message) {
  $("#innerMessage").text(message);
  $("#terryMessage").animate({
    width: 'toggle'
  }, 350);
};

var redirect = function redirect(response) {
  $("#terryMessage").animate({
    width: 'hide'
  }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success, error) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: error
    /*function(xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    handleError(messageObj.error);}*/

  });
};