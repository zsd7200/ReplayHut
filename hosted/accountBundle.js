"use strict";

var ListOutAccount = function ListOutAccount(props) {
  console.log(props);
  return React.createElement("div", {
    classname: "accountArea"
  }, React.createElement("h1", null, "Hello ", props.account.username, "!"), React.createElement("p", null, "You've made ", props.account.createdClips, " Clips"), React.createElement("h3", null, "Change password"), React.createElement("label", {
    htmlFor: "pass"
  }, "Password: "), React.createElement("input", {
    id: "pass",
    type: "password",
    name: "pass",
    placeholder: "password"
  }), React.createElement("label", {
    htmlFor: "pass2"
  }, "Password: "), React.createElement("input", {
    id: "pass2",
    type: "password",
    name: "pass2",
    placeholder: "retype password"
  }), React.createElement("br", null), React.createElement("button", null, "Sign up for Prime!"));
};

var setup = function setup() {
  sendAjax('GET', '/getMyAccount', null, function (data) {
    ReactDOM.render(React.createElement(ListOutAccount, {
      account: data.account
    }), document.querySelector("#accountArea"));
  });
};

$(document).ready(function () {
  setup();
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