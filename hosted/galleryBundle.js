"use strict";

var ytWidth = 436;
var ytHeight = 245;

var formatDate = function formatDate(date) {
  // save a new date based on UTC date
  var localDate = new Date(date); // create variables to modify for 12-hour clock

  var hour = 0;
  var amPm = "AM"; // 12-hour clock check

  if (localDate.getHours() + 1 > 12) {
    hour = localDate.getHours() - 12;
    amPm = "PM";
  } // create variables for modifying minutes/seconds


  var minute = localDate.getMinutes();
  var second = localDate.getSeconds();

  if (minute < 10) {
    minute = "0" + minute;
  }

  if (second < 10) {
    second = "0" + second;
  } // create a new string based on localDate data and 12-hour clock modifications


  var newDate = localDate.getMonth() + 1 + "/" + localDate.getDate() + "/" + localDate.getFullYear() + " "; // date

  newDate += hour + ":" + minute + ":" + second + " " + amPm; // time

  return newDate;
};

var ClipList = function ClipList(props) {
  // If no clip have been made, show error
  if (props.clips.length === 0) {
    return React.createElement("div", {
      className: "noClips"
    }, React.createElement("h3", null, "No clips found!"));
  } // Displaying each clip


  var clipNodes = props.clips.map(function (clip) {
    if (clip.character1 !== '') {
      if (clip.character2 !== '') {
        return React.createElement("div", {
          className: "clip"
        }, React.createElement("h3", {
          className: "clip-title"
        }, "Title: ", clip.title, React.createElement("h5", {
          className: "creator"
        }, "Creator: ", clip.creatorUN)), React.createElement("h5", {
          className: "game"
        }, "Game: ", clip.game), React.createElement("h5", {
          className: "description"
        }, "Description: ", clip.description), React.createElement("h5", {
          className: "char1"
        }, "Character 1: ", clip.character1), React.createElement("h5", {
          className: "char2"
        }, "Character 2: ", clip.character2), React.createElement("h5", {
          className: "post-date"
        }, "Posted: ", formatDate(clip.postDate)), React.createElement("iframe", {
          width: ytWidth,
          height: ytHeight,
          src: clip.youtube,
          frameBorder: "0",
          allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
          allowFullScreen: true
        }));
      } else {
        return React.createElement("div", {
          className: "clip"
        }, React.createElement("h3", {
          className: "clip-title"
        }, "Title: ", clip.title, React.createElement("h5", {
          className: "creator"
        }, "Creator: ", clip.creatorUN)), React.createElement("h5", {
          className: "game"
        }, "Game: ", clip.game), React.createElement("h5", {
          className: "description"
        }, "Description: ", clip.description), React.createElement("h5", {
          className: "char1"
        }, "Character 1: ", clip.character1), React.createElement("h5", {
          className: "post-date"
        }, "Posted: ", formatDate(clip.postDate)), React.createElement("iframe", {
          width: ytWidth,
          height: ytHeight,
          src: clip.youtube,
          frameBorder: "0",
          allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
          allowFullScreen: true
        }), "                    ");
      }
    } else if (clip.character2 !== '') {
      return React.createElement("div", {
        className: "clip"
      }, React.createElement("h3", {
        className: "clip-title"
      }, "Title: ", clip.title, React.createElement("h5", {
        className: "creator"
      }, "Creator: ", clip.creatorUN)), React.createElement("h5", {
        className: "game"
      }, "Game: ", clip.game), React.createElement("h5", {
        className: "description"
      }, "Description: ", clip.description), React.createElement("h5", {
        className: "char2"
      }, "Character 2: ", clip.character2), React.createElement("h5", {
        className: "post-date"
      }, "Posted: ", formatDate(clip.postDate)), React.createElement("iframe", {
        width: ytWidth,
        height: ytHeight,
        src: clip.youtube,
        frameBorder: "0",
        allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
        allowFullScreen: true
      }));
    } else {
      return React.createElement("div", {
        className: "clip"
      }, React.createElement("h3", {
        className: "clip-title"
      }, "Title: ", clip.title, React.createElement("h5", {
        className: "creator"
      }, "Creator: ", clip.creatorUN)), React.createElement("h5", {
        className: "game"
      }, "Game: ", clip.game), React.createElement("h5", {
        className: "description"
      }, "Description: ", clip.description), React.createElement("h5", {
        className: "post-date"
      }, "Posted: ", formatDate(clip.postDate)), React.createElement("iframe", {
        width: ytWidth,
        height: ytHeight,
        src: clip.youtube,
        frameBorder: "0",
        allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
        allowFullScreen: true
      }));
    }
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
    }), document.querySelector("#clips"));
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    handleError(messageObj.error);
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