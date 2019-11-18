"use strict";

var makePost = function makePost(e) {
  e.preventDefault();
  $("#terryMessage").animate({
    width: 'hide'
  }, 350);

  if ($("#clipTitle").val() == '' || $("#clipDesc").val() == '') {
    showMessage("Hey! Make sure you fill out all the fields!");
    return false;
  }

  sendAjax('POST', $("#createForm").attr("action"), $("#createForm").serialize(), function (result) {
    showMessage(result.message);
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
  return false;
};

var CreateForm = function CreateForm(props) {
  return React.createElement("div", {
    className: "content-box"
  }, React.createElement("form", {
    id: "createForm",
    onSubmit: makePost,
    name: "createForm",
    action: "/createClip",
    method: "POST",
    classname: "createForm"
  }, React.createElement("h3", {
    id: "requiredHeader"
  }, "Basic Clip Info (required): "), React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    id: "clipTitle",
    type: "text",
    name: "title",
    placeholder: "Clip Title"
  }), React.createElement("br", null), React.createElement("label", {
    className: "input-label",
    htmlFor: "title"
  }, "Clip Title: ")), React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    id: "game",
    type: "text",
    name: "game",
    placeholder: "Dragon Ball: FighterZ"
  }), React.createElement("br", null), React.createElement("label", {
    className: "input-label",
    htmlFor: "game"
  }, "Game: ")), React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    id: "clipDesc",
    type: "text",
    name: "description",
    placeholder: "Talk about your clip!"
  }), React.createElement("br", null), React.createElement("label", {
    className: "input-label",
    htmlFor: "description"
  }, "Description: ")), React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    id: "youtube",
    type: "text",
    name: "youtube",
    placeholder: "https://www.youtube.com/watch?v=lkbhsxLdiM8"
  }), React.createElement("br", null), React.createElement("label", {
    className: "input-label",
    htmlFor: "youtube"
  }, "YouTube Link: ")), React.createElement("br", null), React.createElement("h3", {
    id: "charHeader"
  }, "Characters (optional): "), React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    id: "char1",
    type: "text",
    name: "char1",
    placeholder: "Character 1"
  }), React.createElement("br", null), React.createElement("label", {
    className: "input-label",
    htmlFor: "char1"
  }, "Character 1: ")), React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    id: "char2",
    type: "text",
    name: "char2",
    placeholder: "Character 2"
  }), React.createElement("br", null), React.createElement("label", {
    className: "input-label",
    htmlFor: "char2"
  }, "Character 2: ")), React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Submit Clip"
  })));
};

var setup = function setup(csrf) {
  ReactDOM.render(React.createElement(CreateForm, {
    csrf: csrf
  }), document.querySelector("#createArea"));
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

var hideAds = function hideAds(premiumStatus) {
  if (premiumStatus === true) {
    $(".ad-sidebar").hide();
  } else {
    $(".ad-sidebar").show();
  }
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