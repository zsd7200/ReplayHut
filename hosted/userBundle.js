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
  });
  var count = 0; //Displaying each user

  var userNodes = props.users.map(function (user) {
    count++;
    console.log(count);
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
  var terry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "bad";

  // switch terry pic based on param
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
  }, 350); // disappear terry after 4s

  setTimeout(function () {
    $("#terryMessage").animate({
      width: 'hide'
    }, 350);
  }, 4000);
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