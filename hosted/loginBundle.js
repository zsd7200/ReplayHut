"use strict";

// checks for issues with logging in, then sends ajax request if everything is good
var handleLogin = function handleLogin(e) {
  e.preventDefault();
  $("#terryMessage").animate({
    width: 'hide'
  }, 350);

  if ($("#user").val() == '' || $("#pass").val() == '') {
    showMessage("HEY! Username or password is empty!");
    return false;
  }

  console.log($("input[name-_csrf]").val());
  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
  return false;
}; // checks for issues with signing up, then sends ajax request if everything is good


var handleSignup = function handleSignup(e) {
  e.preventDefault();
  $("#terryMessage").animate({
    width: 'hide'
  }, 350);

  if ($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
    showMessage("HEY! All fields are required!");
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    showMessage("HEY! Passwords do not match!");
    return false;
  }

  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
  return false;
}; // LoginWindow to be rendered


var LoginWindow = function LoginWindow(props) {
  return React.createElement("div", {
    id: "content"
  }, React.createElement("img", {
    id: "hut",
    src: "/assets/img/hut_orig.png",
    alt: "Hut"
  }), React.createElement("form", {
    id: "loginForm",
    name: "loginForm",
    onSubmit: handleLogin,
    action: "/login",
    method: "POST",
    className: "mainForm"
  }, React.createElement("label", {
    htmlFor: "username"
  }, "Username: "), React.createElement("input", {
    id: "user",
    type: "text",
    name: "username",
    placeholder: "username"
  }), React.createElement("label", {
    htmlFor: "pass"
  }, "Password: "), React.createElement("input", {
    id: "pass",
    type: "password",
    name: "pass",
    placeholder: "password"
  }), React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Sign In"
  })));
}; // SignupWindow to be rendered


var SignupWindow = function SignupWindow(props) {
  return React.createElement("div", {
    id: "content"
  }, React.createElement("img", {
    id: "hut",
    src: "/assets/img/hut_orig.png",
    alt: "Hut"
  }), React.createElement("form", {
    id: "signupForm",
    name: "signupForm",
    onSubmit: handleSignup,
    action: "/signup",
    method: "POST",
    className: "mainForm"
  }, React.createElement("label", {
    htmlFor: "username"
  }, "Username: "), React.createElement("input", {
    id: "user",
    type: "text",
    name: "username",
    placeholder: "username"
  }), React.createElement("label", {
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
  }), React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Sign Up"
  })));
}; // modify current-page and render loginwindow


var createLoginWindow = function createLoginWindow(csrf) {
  $("#loginButton").attr('class', 'current-page');
  $("#signupButton").attr('class', '');
  ReactDOM.render(React.createElement(LoginWindow, {
    csrf: csrf
  }), document.querySelector("#content"));
}; // modify current-page and render signupwindow


var createSignupWindow = function createSignupWindow(csrf) {
  $("#loginButton").attr('class', '');
  $("#signupButton").attr('class', 'current-page');
  ReactDOM.render(React.createElement(SignupWindow, {
    csrf: csrf
  }), document.querySelector("#content"));
}; // add event listeners to buttons to have them create the correct window


var setup = function setup(csrf) {
  var loginButton = document.querySelector("#loginButton");
  var signupButton = document.querySelector("#signupButton");
  signupButton.addEventListener("click", function (e) {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });
  loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });
  createLoginWindow(csrf);
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