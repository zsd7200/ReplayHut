"use strict";

var ClipList = function ClipList(props) {
  // If no clip have been made, show error
  if (props.clips.length === 0) {
    return React.createElement("div", {
      className: "clipList"
    }, React.createElement("h3", {
      className: "noClips"
    }, "No clips found!"));
  } // Displaying each clip


  var clipNodes = props.clips.map(function (clip) {
    return React.createElement("div", {
      className: "clip"
    }, React.createElement("h3", {
      className: "clip-title"
    }, "Title: ", clip.title), React.createElement("h5", {
      className: "char1"
    }, "Character 1: ", clip.character1), React.createElement("h5", {
      className: "char2"
    }, "Character 2: ", clip.character2), React.createElement("h5", {
      className: "creator"
    }, "Creator: ", clip.creator), React.createElement("h5", {
      className: "description"
    }, "Description: ", clip.description), React.createElement("h5", {
      className: "post-date"
    }, "Posted: ", clip.postDate));
  });
  return React.createElement("div", {
    className: "clipList"
  }, clipNodes);
};

var setup = function setup() {
  // Retrieving the accounts
  sendAjax('GET', '/getClips', null, function (data) {
    ReactDOM.render(React.createElement(ClipList, {
      clips: data.clips
    }), document.querySelector("#clipList"));
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