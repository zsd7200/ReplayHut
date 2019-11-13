"use strict";

var InfoData = function InfoData(props) {
  $("#domoMessage").animate({
    width: 'toggle'
  }, 350);
  return React.createElement("div", {
    className: "about"
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

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#domoMessage").animate({
    width: 'toggle'
  }, 350);
};

var redirect = function redirect(response) {
  $("#domoMessage").animate({
    width: 'hide'
  }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};