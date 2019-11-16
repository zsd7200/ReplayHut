"use strict";

var passChange = function passChange(e) {
  e.preventDefault();
  $("#domoMessage").animate({
    width: 'hide'
  }, 350);

  if ($("#pass").val() == '' || $("#pass2").val() == '' || $("#currentPass").val() == '') {
    handleError("Hey, make sure you fill out all fields!");
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("Woah, those new passwords don't match!");
    return false;
  }

  sendAjax('POST', $("#changePassForm").attr("action"), $("#changePassForm").serialize(), function (result) {
    handleError(result.message);
  }, function (xhr, status, error) {
    if (error === 'Unauthorized') handleError("Current password is not correct");
  });
  return false;
};

var ListOutAccount = function ListOutAccount(props) {
  return React.createElement("div", {
    classname: "accountArea"
  }, React.createElement("h1", null, "Hello ", props.account.username, "!"), React.createElement("p", null, "You've made ", props.account.createdClips, " Clips"), React.createElement("h3", null, "Change password"), React.createElement("form", {
    id: "changePassForm",
    name: "changePassForm",
    onSubmit: passChange,
    action: "/changePassword",
    method: "POST"
  }, React.createElement("label", {
    htmlFor: "currentPass"
  }, "New Password: "), React.createElement("input", {
    id: "currentPass",
    type: "password",
    name: "currentPass",
    placeholder: "Current password"
  }), React.createElement("label", {
    htmlFor: "pass"
  }, "New Password: "), React.createElement("input", {
    id: "pass",
    type: "password",
    name: "pass",
    placeholder: "New password"
  }), React.createElement("label", {
    htmlFor: "pass2"
  }, "Retype New Password: "), React.createElement("input", {
    id: "pass2",
    type: "password",
    name: "pass2",
    placeholder: "Retype password"
  }), React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Change Password"
  })), React.createElement("br", null), React.createElement("button", null, "Sign up for Prime!"));
};

var setup = function setup(csrf) {
  sendAjax('GET', '/getMyAccount', null, function (data) {
    ReactDOM.render(React.createElement(ListOutAccount, {
      account: data.account,
      csrf: csrf
    }), document.querySelector("#accountArea"));
  });
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