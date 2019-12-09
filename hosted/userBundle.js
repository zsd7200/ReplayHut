"use strict";

// UserList to be rendered
var UserList = function UserList(props) {
  console.log(props);
  checkPremium(); //If no users have been made (Should not happen becuase need to be logged in), show error

  if (props.users.length === 0) {
    return React.createElement("div", {
      className: "userList"
    }, React.createElement("h3", {
      className: "noUsers"
    }, "No users found"));
  } //Code for sorting taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort


  props.users.sort(function (a, b) {
    return b.timesFavorited - a.timesFavorited;
  }); //Displaying each user

  var userNodes = props.users.map(function (user) {
    if (user.premiumStatus === false) {
      return React.createElement("div", {
        className: "user"
      }, React.createElement("h4", {
        className: "userName"
      }, "Username: ", user.username), React.createElement("h4", {
        className: "clipsMade"
      }, "Clips Posted: ", user.createdClips), React.createElement("h4", {
        className: "timesFavorited"
      }, "Clip Popularity: ", user.timesFavorited, " Favorites"));
    } else {
      return React.createElement("div", {
        className: "user"
      }, React.createElement("h4", {
        className: "userName"
      }, "Username: ", user.username, " ", React.createElement("span", {
        className: "float-right"
      }, "\u2B50")), React.createElement("h4", {
        className: "clipsMade"
      }, "Clips Posted: ", user.createdClips), React.createElement("h4", {
        className: "timesFavorited"
      }, "Clip Popularity: ", user.timesFavorited, " Favorites"));
    }
  });
  return React.createElement("div", {
    className: "content"
  }, React.createElement("h2", {
    id: "user-leaderboard",
    className: "center-content"
  }, "Clip Leaderboard"), React.createElement("div", {
    className: "userList"
  }, userNodes));
}; // sendAjax request to render UserList


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