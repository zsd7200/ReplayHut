"use strict";

var ytWidth = 430;
var ytHeight = 242;

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

var showClips = function showClips(csrf) {
  // Retrieving the clips
  sendAjax('GET', '/getClips', null, function (data) {
    ReactDOM.render(React.createElement(ClipList, {
      clips: data.clips,
      csrf: csrf
    }), document.querySelector("#clips"));
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
};

var ClipList = function ClipList(props) {
  checkPremium(); // If no clip have been made, show error

  if (props.clips.length === 0) {
    return React.createElement("div", {
      className: "loader-container"
    }, React.createElement("h3", null, "No clips found!"));
  } // Getting the values from the input fields


  var userSearch = $("#userSearch").val();
  var gameSearch = $("#gameSearch").val();
  var charSearch = $("#charSearch").val(); // Trimming the values

  if (userSearch !== '') {
    userSearch = userSearch.trim();
  }

  if (gameSearch !== '') {
    gameSearch = gameSearch.toLowerCase();
    gameSearch = gameSearch.trim();
  }

  if (charSearch !== '') {
    // Make the character search into an array, split on commas
    charSearch = charSearch.split(','); // Trimming and making them lowercase

    for (var index = 0; index < charSearch.length; index++) {
      charSearch[index] = charSearch[index].trim();
      charSearch[index] = charSearch[index].toLowerCase();
    }
  } // Displaying each clip


  var clipNodes = props.clips.map(function (clip) {
    // Checks to see if a clip should be posted based on search parameters 
    var userCheck = true;
    var gameCheck = true;
    var charCheck = true; // Check if the search field is empty
    // If not empty, check against the search parameter

    if (userSearch !== '' && userSearch !== clip.creatorUN) userCheck = false;
    if (gameSearch !== '' && gameSearch !== clip.game.toLowerCase()) gameCheck = false;

    if (charSearch !== '') {
      // Looping through the character search index to see if one of the characters matches the search term
      for (var _index = 0; _index < charSearch.length; _index++) {
        var notFirst = true;
        if (clip.character1 !== '') if (charSearch[_index] === clip.character1.toLowerCase()) notFirst = false;
        var notSecond = true;
        if (clip.character2 !== '') if (charSearch[_index] === clip.character2.toLowerCase()) notFirst = false;
        if (notFirst && notSecond) charCheck = false;
      }
    } // If all the checks pass, display that clip


    if (userCheck && gameCheck && charCheck) {
      if (clip.creatorPremStatus) {
        if (clip.character1 !== '') {
          if (clip.character2 !== '') {
            return React.createElement("div", {
              className: "clip"
            }, React.createElement("h4", {
              className: "clip-title"
            }, React.createElement("u", null, clip.title), React.createElement("span", {
              className: "creator"
            }, "Creator: ", clip.creatorUN, " \u2B50")), React.createElement("p", {
              className: "game"
            }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
              className: "description"
            }, React.createElement("b", null, "Description:"), " ", clip.description), React.createElement("p", {
              className: "char1"
            }, React.createElement("b", null, "Character 1:"), " ", clip.character1), React.createElement("p", {
              className: "char2"
            }, React.createElement("b", null, "Character 2:"), " ", clip.character2), React.createElement("p", {
              className: "post-date"
            }, React.createElement("b", null, "Posted:"), " ", formatDate(clip.postDate)), React.createElement("iframe", {
              width: ytWidth,
              height: ytHeight,
              src: clip.youtube,
              frameBorder: "0",
              allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
              allowFullScreen: true
            }), React.createElement("form", {
              id: "favForm",
              onSubmit: makePost,
              name: "favForm",
              action: "/addFavorite",
              method: "POST",
              className: "favForm"
            }, React.createElement("input", {
              type: "hidden",
              name: "_csrf",
              value: props.csrf
            }), React.createElement("input", {
              name: "title",
              type: "hidden",
              value: clip.title
            }), React.createElement("input", {
              className: "formSubmit",
              type: "submit",
              value: "Add Favorite"
            })), React.createElement("form", {
              id: "delForm",
              onSubmit: deleteClips,
              name: "delForm",
              action: "/deleteClips",
              method: "POST",
              className: "delForm"
            }, React.createElement("input", {
              type: "hidden",
              name: "_csrf",
              value: props.csrf
            }), React.createElement("input", {
              name: "_id",
              type: "hidden",
              value: clip._id
            }), React.createElement("input", {
              className: "formSubmit",
              type: "submit",
              value: "Delete Clip"
            })));
          } else {
            return React.createElement("div", {
              className: "clip"
            }, React.createElement("h4", {
              className: "clip-title"
            }, React.createElement("u", null, clip.title), React.createElement("span", {
              className: "creator"
            }, "Creator: ", clip.creatorUN, " \u2B50")), React.createElement("p", {
              className: "game"
            }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
              className: "description"
            }, React.createElement("b", null, "Description:"), " ", clip.description), React.createElement("p", {
              className: "char1"
            }, React.createElement("b", null, "Character 1:"), " ", clip.character1), React.createElement("p", {
              className: "post-date"
            }, React.createElement("b", null, "Posted:"), " ", formatDate(clip.postDate)), React.createElement("iframe", {
              width: ytWidth,
              height: ytHeight,
              src: clip.youtube,
              frameBorder: "0",
              allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
              allowFullScreen: true
            }), React.createElement("form", {
              id: "favForm",
              onSubmit: makePost,
              name: "favForm",
              action: "/addFavorite",
              method: "POST",
              className: "favForm"
            }, React.createElement("input", {
              type: "hidden",
              name: "_csrf",
              value: props.csrf
            }), React.createElement("input", {
              name: "title",
              type: "hidden",
              value: clip.title
            }), React.createElement("input", {
              className: "formSubmit",
              type: "submit",
              value: "Add Favorite"
            })), React.createElement("form", {
              id: "delForm",
              onSubmit: deleteClips,
              name: "delForm",
              action: "/deleteClips",
              method: "POST",
              className: "delForm"
            }, React.createElement("input", {
              type: "hidden",
              name: "_csrf",
              value: props.csrf
            }), React.createElement("input", {
              name: "_id",
              type: "hidden",
              value: clip._id
            }), React.createElement("input", {
              className: "formSubmit",
              type: "submit",
              value: "Delete Clip"
            })));
          }
        } else if (clip.character2 !== '') {
          return React.createElement("div", {
            className: "clip"
          }, React.createElement("h4", {
            className: "clip-title"
          }, React.createElement("u", null, clip.title), React.createElement("span", {
            className: "creator"
          }, "Creator: ", clip.creatorUN, " \u2B50")), React.createElement("p", {
            className: "game"
          }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
            className: "description"
          }, React.createElement("b", null, "Description:"), " ", clip.description), React.createElement("p", {
            className: "char2"
          }, React.createElement("b", null, "Character 2:"), " ", clip.character2), React.createElement("p", {
            className: "post-date"
          }, React.createElement("b", null, "Posted:"), " ", formatDate(clip.postDate)), React.createElement("iframe", {
            width: ytWidth,
            height: ytHeight,
            src: clip.youtube,
            frameBorder: "0",
            allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
            allowFullScreen: true
          }), React.createElement("form", {
            id: "favForm",
            onSubmit: makePost,
            name: "favForm",
            action: "/addFavorite",
            method: "POST",
            className: "favForm"
          }, React.createElement("input", {
            type: "hidden",
            name: "_csrf",
            value: props.csrf
          }), React.createElement("input", {
            name: "title",
            type: "hidden",
            value: clip.title
          }), React.createElement("input", {
            className: "formSubmit",
            type: "submit",
            value: "Add Favorite"
          })), React.createElement("form", {
            id: "delForm",
            onSubmit: deleteClips,
            name: "delForm",
            action: "/deleteClips",
            method: "POST",
            className: "delForm"
          }, React.createElement("input", {
            type: "hidden",
            name: "_csrf",
            value: props.csrf
          }), React.createElement("input", {
            name: "_id",
            type: "hidden",
            value: clip._id
          }), React.createElement("input", {
            className: "formSubmit",
            type: "submit",
            value: "Delete Clip"
          })));
        } else {
          return React.createElement("div", {
            className: "clip"
          }, React.createElement("h4", {
            className: "clip-title"
          }, React.createElement("u", null, clip.title), React.createElement("span", {
            className: "creator"
          }, "Creator: ", clip.creatorUN, " \u2B50")), React.createElement("p", {
            className: "game"
          }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
            className: "description"
          }, React.createElement("b", null, "Description:"), " ", clip.description), React.createElement("p", {
            className: "post-date"
          }, React.createElement("b", null, "Posted:"), " ", formatDate(clip.postDate)), React.createElement("iframe", {
            width: ytWidth,
            height: ytHeight,
            src: clip.youtube,
            frameBorder: "0",
            allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
            allowFullScreen: true
          }), React.createElement("form", {
            id: "favForm",
            onSubmit: makePost,
            name: "favForm",
            action: "/addFavorite",
            method: "POST",
            className: "favForm"
          }, React.createElement("input", {
            type: "hidden",
            name: "_csrf",
            value: props.csrf
          }), React.createElement("input", {
            name: "title",
            type: "hidden",
            value: clip.title
          }), React.createElement("input", {
            className: "formSubmit",
            type: "submit",
            value: "Add Favorite"
          })), React.createElement("form", {
            id: "delForm",
            onSubmit: deleteClips,
            name: "delForm",
            action: "/deleteClips",
            method: "POST",
            className: "delForm"
          }, React.createElement("input", {
            type: "hidden",
            name: "_csrf",
            value: props.csrf
          }), React.createElement("input", {
            name: "_id",
            type: "hidden",
            value: clip._id
          }), React.createElement("input", {
            className: "formSubmit",
            type: "submit",
            value: "Delete Clip"
          })));
        }
      } else {
        if (clip.character1 !== '') {
          if (clip.character2 !== '') {
            return React.createElement("div", {
              className: "clip"
            }, React.createElement("h4", {
              className: "clip-title"
            }, React.createElement("u", null, clip.title), React.createElement("span", {
              className: "creator"
            }, "Creator: ", clip.creatorUN)), React.createElement("p", {
              className: "game"
            }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
              className: "description"
            }, React.createElement("b", null, "Description:"), " ", clip.description), React.createElement("p", {
              className: "char1"
            }, React.createElement("b", null, "Character 1:"), " ", clip.character1), React.createElement("p", {
              className: "char2"
            }, React.createElement("b", null, "Character 2:"), " ", clip.character2), React.createElement("p", {
              className: "post-date"
            }, React.createElement("b", null, "Posted:"), " ", formatDate(clip.postDate)), React.createElement("iframe", {
              width: ytWidth,
              height: ytHeight,
              src: clip.youtube,
              frameBorder: "0",
              allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
              allowFullScreen: true
            }), React.createElement("form", {
              id: "favForm",
              onSubmit: makePost,
              name: "favForm",
              action: "/addFavorite",
              method: "POST",
              className: "favForm"
            }, React.createElement("input", {
              type: "hidden",
              name: "_csrf",
              value: props.csrf
            }), React.createElement("input", {
              name: "title",
              type: "hidden",
              value: clip.title
            }), React.createElement("input", {
              className: "formSubmit",
              type: "submit",
              value: "Add Favorite"
            })));
          } else {
            return React.createElement("div", {
              className: "clip"
            }, React.createElement("h4", {
              className: "clip-title"
            }, React.createElement("u", null, clip.title), React.createElement("span", {
              className: "creator"
            }, "Creator: ", clip.creatorUN)), React.createElement("p", {
              className: "game"
            }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
              className: "description"
            }, React.createElement("b", null, "Description:"), " ", clip.description), React.createElement("p", {
              className: "char1"
            }, React.createElement("b", null, "Character 1:"), " ", clip.character1), React.createElement("p", {
              className: "post-date"
            }, React.createElement("b", null, "Posted:"), " ", formatDate(clip.postDate)), React.createElement("iframe", {
              width: ytWidth,
              height: ytHeight,
              src: clip.youtube,
              frameBorder: "0",
              allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
              allowFullScreen: true
            }), React.createElement("form", {
              id: "favForm",
              onSubmit: makePost,
              name: "favForm",
              action: "/addFavorite",
              method: "POST",
              className: "favForm"
            }, React.createElement("input", {
              type: "hidden",
              name: "_csrf",
              value: props.csrf
            }), React.createElement("input", {
              name: "title",
              type: "hidden",
              value: clip.title
            }), React.createElement("input", {
              className: "formSubmit",
              type: "submit",
              value: "Add Favorite"
            })));
          }
        } else if (clip.character2 !== '') {
          return React.createElement("div", {
            className: "clip"
          }, React.createElement("h4", {
            className: "clip-title"
          }, React.createElement("u", null, clip.title), React.createElement("span", {
            className: "creator"
          }, "Creator: ", clip.creatorUN)), React.createElement("p", {
            className: "game"
          }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
            className: "description"
          }, React.createElement("b", null, "Description:"), " ", clip.description), React.createElement("p", {
            className: "char2"
          }, React.createElement("b", null, "Character 2:"), " ", clip.character2), React.createElement("p", {
            className: "post-date"
          }, React.createElement("b", null, "Posted:"), " ", formatDate(clip.postDate)), React.createElement("iframe", {
            width: ytWidth,
            height: ytHeight,
            src: clip.youtube,
            frameBorder: "0",
            allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
            allowFullScreen: true
          }), React.createElement("form", {
            id: "favForm",
            onSubmit: makePost,
            name: "favForm",
            action: "/addFavorite",
            method: "POST",
            className: "favForm"
          }, React.createElement("input", {
            type: "hidden",
            name: "_csrf",
            value: props.csrf
          }), React.createElement("input", {
            name: "title",
            type: "hidden",
            value: clip.title
          }), React.createElement("input", {
            className: "formSubmit",
            type: "submit",
            value: "Add Favorite"
          })), React.createElement("form", {
            id: "delForm",
            onSubmit: deleteClips,
            name: "delForm",
            action: "/deleteClips",
            method: "POST",
            className: "delForm"
          }, React.createElement("input", {
            type: "hidden",
            name: "_csrf",
            value: props.csrf
          }), React.createElement("input", {
            name: "_id",
            type: "hidden",
            value: clip._id
          }), React.createElement("input", {
            className: "formSubmit",
            type: "submit",
            value: "Delete Clip"
          })));
        } else {
          return React.createElement("div", {
            className: "clip"
          }, React.createElement("h4", {
            className: "clip-title"
          }, React.createElement("u", null, clip.title), React.createElement("span", {
            className: "creator"
          }, "Creator: ", clip.creatorUN)), React.createElement("p", {
            className: "game"
          }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
            className: "description"
          }, React.createElement("b", null, "Description:"), " ", clip.description), React.createElement("p", {
            className: "post-date"
          }, React.createElement("b", null, "Posted:"), " ", formatDate(clip.postDate)), React.createElement("iframe", {
            width: ytWidth,
            height: ytHeight,
            src: clip.youtube,
            frameBorder: "0",
            allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
            allowFullScreen: true
          }), React.createElement("form", {
            id: "favForm",
            onSubmit: makePost,
            name: "favForm",
            action: "/addFavorite",
            method: "POST",
            className: "favForm"
          }, React.createElement("input", {
            type: "hidden",
            name: "_csrf",
            value: props.csrf
          }), React.createElement("input", {
            name: "title",
            type: "hidden",
            value: clip.title
          }), React.createElement("input", {
            className: "formSubmit",
            type: "submit",
            value: "Add Favorite"
          })), React.createElement("form", {
            id: "delForm",
            onSubmit: deleteClips,
            name: "delForm",
            action: "/deleteClips",
            method: "POST",
            className: "delForm"
          }, React.createElement("input", {
            type: "hidden",
            name: "_csrf",
            value: props.csrf
          }), React.createElement("input", {
            name: "_id",
            type: "hidden",
            value: clip._id
          }), React.createElement("input", {
            className: "formSubmit",
            type: "submit",
            value: "Delete Clip"
          })));
        }
      }
    }
  });
  return React.createElement("div", {
    className: "clipList"
  }, clipNodes);
};

var deleteClips = function deleteClips() {
  e.preventDefault();
  $("#terryMessage").animate({
    width: 'hide'
  }, 350);
  sendAjax('POST', $("#delForm").attr("action"), $("#delForm").serialize(), function (result) {
    showMessage(result.message);
    sendAjax('GET', '/getToken', null, function (result) {
      showClips(result.csrfToken);
    });
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
  return false;
};

var SearchBar = function SearchBar(props) {
  return React.createElement("div", {
    id: "search",
    className: "content-box"
  }, React.createElement("h5", null, "Search: "), React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    id: "userSearch",
    type: "text",
    name: "userSearch",
    placeholder: "MKLeo"
  }), React.createElement("br", null), React.createElement("label", {
    className: "input-label",
    htmlFor: "userSearch"
  }, "User: ")), React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    id: "gameSearch",
    type: "text",
    name: "gameSearch",
    placeholder: "Super Smash Bros. Ultimate"
  }), React.createElement("br", null), React.createElement("label", {
    className: "input-label",
    htmlFor: "gameSearch"
  }, "Game: ")), React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    id: "charSearch",
    type: "text",
    name: "charSearch",
    placeholder: "marth, zelda"
  }), React.createElement("label", {
    className: "input-label help",
    title: "Seperate characters by commas!",
    htmlFor: "charSearch"
  }, "Characters: ")), React.createElement("button", {
    className: "formSubmit",
    onClick: showClips
  }, "Search"), React.createElement("button", {
    className: "formSubmit",
    onClick: deleteClips
  }, "Delete Clip"));
}; // check for issues with post; send ajax request if everything is all good


var makePost = function makePost(e) {
  e.preventDefault();
  $("#terryMessage").animate({
    width: 'hide'
  }, 350);
  sendAjax('POST', $("#favForm").attr("action"), $("#favForm").serialize(), function (result) {
    showMessage(result.message);
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
  return false;
};

var setup = function setup(csrf) {
  showClips(csrf);
  ReactDOM.render(React.createElement(SearchBar, {
    csrf: csrf
  }), document.querySelector("#search"));
}; // get csrf token


var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
}); // show error message

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