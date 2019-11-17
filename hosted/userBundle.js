"use strict";

var UserList = function UserList(props) {
  //If no users have been made (Should not happen becuase need to be logged in), show error
  if (props.users.length === 0) {
    return React.createElement("div", {
      className: "userList"
    }, React.createElement("h3", {
      className: "noUsers"
    }, "No users found"));
  } //Code for sorting taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort


  props.users.sort(function (a, b) {
    return b.createdClips - a.createdClips;
  }); //Displaying each user

  var userNodes = props.users.map(function (user) {
    return React.createElement("div", {
      className: "user"
    }, React.createElement("h3", {
      className: "userName"
    }, "Username: ", user.username), React.createElement("h3", {
      className: "clipsMade"
    }, "Clips Posted: ", user.createdClips));
  });
  return React.createElement("div", {
    className: "userList"
  }, userNodes);
};

var setup = function setup() {
  //Retrieving the accounts
  sendAjax('GET', '/getAccounts', null, function (data) {
    ReactDOM.render(React.createElement(UserList, {
      users: data.users
    }), document.querySelector("#userList"));
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
};

$(document).ready(function () {
  setup();
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