"use strict";

var ytWidth = 430;
var ytHeight = 242;
var numClips = 0;

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

var showClips = function showClips(csrf, e) {
  // get account data so the username and favorites can be passed in
  sendAjax('GET', '/getMyAccount', null, function (accdata) {
    // Retrieving the clips
    sendAjax('GET', '/getClips', null, function (clipdata) {
      ReactDOM.render(React.createElement(ClipList, {
        clips: clipdata.clips,
        userfaves: accdata.account.favorites,
        user: accdata.account.username,
        csrf: csrf
      }), document.querySelector("#clips"));
    }, function (xhr, status, error) {
      var messageObj = JSON.parse(xhr.responseText);
      showMessage(messageObj.error);
    });
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
};

var ClipList = function ClipList(props) {
  checkPremium();
  numClips = 0; // If no clip have been made, show error

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
  }

  var searchParams = $("#sortList").val();

  if (searchParams == 'newest') {
    //https://stackoverflow.com/questions/10123953/how-to-sort-an-array-by-a-date-property
    props.clips.sort(function (a, b) {
      return new Date(b.postDate) - new Date(a.postDate);
    });
  } else if (searchParams == 'alphabeticalDown') {
    //https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
    props.clips.sort(function (a, b) {
      if (a.title < b.title) {
        return -1;
      }

      if (a.title > b.title) {
        return 1;
      }

      return 0;
    });
  } else if (searchParams == 'alphabeticalUp') {
    //https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
    props.clips.sort(function (a, b) {
      if (a.title < b.title) {
        return 1;
      }

      if (a.title > b.title) {
        return -1;
      }

      return 0;
    });
  } else if (searchParams == 'faveDown') {
    //Code for sorting taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    props.clips.sort(function (a, b) {
      return b.numFavorites - a.numFavorites;
    });
  } else if (searchParams == 'faveUp') {
    //Code for sorting taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    props.clips.sort(function (a, b) {
      return a.numFavorites - b.numFavorites;
    });
  } // set faveStatus of all the clips


  for (var i = 0; i < props.userfaves.length; i++) {
    for (var j = 0; j < props.clips.length; j++) {
      if (props.userfaves[i] === props.clips[j].id) {
        props.clips[j].faveStatus = true;
        break;
      }
    }
  } // set current user to the active user


  for (var _i = 0; _i < props.clips.length; _i++) {
    props.clips[_i].currUser = props.user;
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
    } // increment numclips for every clip so every fav/rem/delete form has a unique ID


    numClips++; // If all the checks pass, display that clip

    if (userCheck && gameCheck && charCheck) {
      if (clip.creatorUN === clip.currUser) {
        if (clip.creatorPremStatus) {
          if (clip.character1 !== '') {
            if (clip.character2 !== '') {
              if (clip.faveStatus === true) {
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
                  id: "delForm" + numClips,
                  onSubmit: makePost,
                  name: "delForm",
                  action: "/deleteClips",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Delete Clip"
                }, React.createElement("i", {
                  className: "fas fa-trash trash"
                }))), React.createElement("form", {
                  id: "remForm" + numClips,
                  onSubmit: makePost,
                  name: "remForm",
                  action: "/remFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Remove Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart-broken un-fave"
                }))));
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
                  id: "delForm" + numClips,
                  onSubmit: makePost,
                  name: "delForm",
                  action: "/deleteClips",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Delete Clip"
                }, React.createElement("i", {
                  className: "fas fa-trash trash"
                }))), React.createElement("form", {
                  id: "favForm" + numClips,
                  onSubmit: makePost,
                  name: "favForm",
                  action: "/addFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Add Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart fave"
                }))));
              }
            } else {
              if (clip.faveStatus === true) {
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
                  id: "delForm" + numClips,
                  onSubmit: makePost,
                  name: "delForm",
                  action: "/deleteClips",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Delete Clip"
                }, React.createElement("i", {
                  className: "fas fa-trash trash"
                }))), React.createElement("form", {
                  id: "remForm" + numClips,
                  onSubmit: makePost,
                  name: "remForm",
                  action: "/remFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Remove Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart-broken un-fave"
                }))));
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
                  id: "delForm" + numClips,
                  onSubmit: makePost,
                  name: "delForm",
                  action: "/deleteClips",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Delete Clip"
                }, React.createElement("i", {
                  className: "fas fa-trash trash"
                }))), React.createElement("form", {
                  id: "favForm" + numClips,
                  onSubmit: makePost,
                  name: "favForm",
                  action: "/addFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Add Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart fave"
                }))));
              }
            }
          } else if (clip.character2 !== '') {
            if (clip.faveStatus === true) {
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
                id: "delForm" + numClips,
                onSubmit: makePost,
                name: "delForm",
                action: "/deleteClips",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Delete Clip"
              }, React.createElement("i", {
                className: "fas fa-trash trash"
              }))), React.createElement("form", {
                id: "remForm" + numClips,
                onSubmit: makePost,
                name: "remForm",
                action: "/remFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Remove Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart-broken un-fave"
              }))));
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
                id: "delForm" + numClips,
                onSubmit: makePost,
                name: "delForm",
                action: "/deleteClips",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Delete Clip"
              }, React.createElement("i", {
                className: "fas fa-trash trash"
              }))), React.createElement("form", {
                id: "favForm" + numClips,
                onSubmit: makePost,
                name: "favForm",
                action: "/addFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Add Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart fave"
              }))));
            }
          } else {
            if (clip.faveStatus === true) {
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
                id: "delForm" + numClips,
                onSubmit: makePost,
                name: "delForm",
                action: "/deleteClips",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "id",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Delete Clip"
              }, React.createElement("i", {
                className: "fas fa-trash trash"
              }))), React.createElement("form", {
                id: "remForm" + numClips,
                onSubmit: makePost,
                name: "remForm",
                action: "/remFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Remove Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart-broken un-fave"
              }))));
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
                id: "delForm" + numClips,
                onSubmit: makePost,
                name: "delForm",
                action: "/deleteClips",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "id",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Delete Clip"
              }, React.createElement("i", {
                className: "fas fa-trash trash"
              }))), React.createElement("form", {
                id: "favForm" + numClips,
                onSubmit: makePost,
                name: "favForm",
                action: "/addFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Add Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart fave"
              }))));
            }
          }
        } else {
          if (clip.character1 !== '') {
            if (clip.character2 !== '') {
              if (clip.faveStatus === true) {
                return React.createElement("div", {
                  className: "clip"
                }, React.createElement("h4", {
                  className: "clip-title"
                }, React.createElement("u", null, clip.title), React.createElement("span", {
                  className: "creator"
                }, "Creator: ", clip.creatorUN)), React.createElement("p", {
                  className: "game"
                }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
                  className: "game"
                }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                  id: "delForm" + numClips,
                  onSubmit: makePost,
                  name: "delForm",
                  action: "/deleteClips",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Delete Clip"
                }, React.createElement("i", {
                  className: "fas fa-trash trash"
                }))), React.createElement("form", {
                  id: "remForm" + numClips,
                  onSubmit: makePost,
                  name: "remForm",
                  action: "/remFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Remove Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart-broken un-fave"
                }))));
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
                  className: "game"
                }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                  id: "delForm" + numClips,
                  onSubmit: makePost,
                  name: "delForm",
                  action: "/deleteClips",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Delete Clip"
                }, React.createElement("i", {
                  className: "fas fa-trash trash"
                }))), React.createElement("form", {
                  id: "favForm" + numClips,
                  onSubmit: makePost,
                  name: "favForm",
                  action: "/addFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Add Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart fave"
                }))));
              }
            } else {
              if (clip.faveStatus === true) {
                return React.createElement("div", {
                  className: "clip"
                }, React.createElement("h4", {
                  className: "clip-title"
                }, React.createElement("u", null, clip.title), React.createElement("span", {
                  className: "creator"
                }, "Creator: ", clip.creatorUN)), React.createElement("p", {
                  className: "game"
                }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
                  className: "game"
                }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                  id: "delForm" + numClips,
                  onSubmit: makePost,
                  name: "delForm",
                  action: "/deleteClips",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Delete Clip"
                }, React.createElement("i", {
                  className: "fas fa-trash trash"
                }))), React.createElement("form", {
                  id: "remForm" + numClips,
                  onSubmit: makePost,
                  name: "remForm",
                  action: "/remFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Remove Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart-broken un-fave"
                }))));
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
                  className: "game"
                }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                  id: "delForm" + numClips,
                  onSubmit: makePost,
                  name: "delForm",
                  action: "/deleteClips",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Delete Clip"
                }, React.createElement("i", {
                  className: "fas fa-trash trash"
                }))), React.createElement("form", {
                  id: "favForm" + numClips,
                  onSubmit: makePost,
                  name: "favForm",
                  action: "/addFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Add Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart fave"
                }))));
              }
            }
          } else if (clip.character2 !== '') {
            if (clip.faveStatus === true) {
              return React.createElement("div", {
                className: "clip"
              }, React.createElement("h4", {
                className: "clip-title"
              }, React.createElement("u", null, clip.title), React.createElement("span", {
                className: "creator"
              }, "Creator: ", clip.creatorUN)), React.createElement("p", {
                className: "game"
              }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
                className: "game"
              }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                id: "delForm" + numClips,
                onSubmit: makePost,
                name: "delForm",
                action: "/deleteClips",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Delete Clip"
              }, React.createElement("i", {
                className: "fas fa-trash trash"
              }))), React.createElement("form", {
                id: "remForm" + numClips,
                onSubmit: makePost,
                name: "remForm",
                action: "/remFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Remove Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart-broken un-fave"
              }))));
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
                className: "game"
              }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                id: "delForm" + numClips,
                onSubmit: makePost,
                name: "delForm",
                action: "/deleteClips",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Delete Clip"
              }, React.createElement("i", {
                className: "fas fa-trash trash"
              }))), React.createElement("form", {
                id: "favForm" + numClips,
                onSubmit: makePost,
                name: "favForm",
                action: "/addFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Add Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart fave"
              }))));
            }
          } else {
            if (clip.faveStatus === true) {
              return React.createElement("div", {
                className: "clip"
              }, React.createElement("h4", {
                className: "clip-title"
              }, React.createElement("u", null, clip.title), React.createElement("span", {
                className: "creator"
              }, "Creator: ", clip.creatorUN)), React.createElement("p", {
                className: "game"
              }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
                className: "game"
              }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                id: "delForm" + numClips,
                onSubmit: makePost,
                name: "delForm",
                action: "/deleteClips",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Delete Clip"
              }, React.createElement("i", {
                className: "fas fa-trash trash"
              }))), React.createElement("form", {
                id: "remForm" + numClips,
                onSubmit: makePost,
                name: "remForm",
                action: "/remFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Remove Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart-broken un-fave"
              }))));
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
                className: "game"
              }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                id: "delForm" + numClips,
                onSubmit: makePost,
                name: "delForm",
                action: "/deleteClips",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Delete Clip"
              }, React.createElement("i", {
                className: "fas fa-trash trash"
              }))), React.createElement("form", {
                id: "favForm" + numClips,
                onSubmit: makePost,
                name: "favForm",
                action: "/addFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Add Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart fave"
              }))));
            }
          }
        }
      } else {
        if (clip.creatorPremStatus) {
          if (clip.character1 !== '') {
            if (clip.character2 !== '') {
              if (clip.faveStatus === true) {
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
                  id: "remForm" + numClips,
                  onSubmit: makePost,
                  name: "remForm",
                  action: "/remFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Remove Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart-broken un-fave"
                }))));
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
                  id: "favForm" + numClips,
                  onSubmit: makePost,
                  name: "favForm",
                  action: "/addFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Add Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart fave"
                }))));
              }
            } else {
              if (clip.faveStatus === true) {
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
                  id: "remForm" + numClips,
                  onSubmit: makePost,
                  name: "remForm",
                  action: "/remFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Remove Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart-broken un-fave"
                }))));
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
                  id: "favForm" + numClips,
                  onSubmit: makePost,
                  name: "favForm",
                  action: "/addFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Add Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart fave"
                }))));
              }
            }
          } else if (clip.character2 !== '') {
            if (clip.faveStatus === true) {
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
                id: "remForm" + numClips,
                onSubmit: makePost,
                name: "remForm",
                action: "/remFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Remove Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart-broken un-fave"
              }))));
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
                id: "favForm" + numClips,
                onSubmit: makePost,
                name: "favForm",
                action: "/addFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Add Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart fave"
              }))));
            }
          } else {
            if (clip.faveStatus === true) {
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
                id: "remForm" + numClips,
                onSubmit: makePost,
                name: "remForm",
                action: "/remFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Remove Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart-broken un-fave"
              }))));
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
                id: "favForm" + numClips,
                onSubmit: makePost,
                name: "favForm",
                action: "/addFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Add Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart fave"
              }))));
            }
          }
        } else {
          if (clip.character1 !== '') {
            if (clip.character2 !== '') {
              if (clip.faveStatus === true) {
                return React.createElement("div", {
                  className: "clip"
                }, React.createElement("h4", {
                  className: "clip-title"
                }, React.createElement("u", null, clip.title), React.createElement("span", {
                  className: "creator"
                }, "Creator: ", clip.creatorUN)), React.createElement("p", {
                  className: "game"
                }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
                  className: "game"
                }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                  id: "remForm" + numClips,
                  onSubmit: makePost,
                  name: "remForm",
                  action: "/remFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Remove Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart-broken un-fave"
                }))));
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
                  className: "game"
                }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                  id: "favForm" + numClips,
                  onSubmit: makePost,
                  name: "favForm",
                  action: "/addFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Add Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart fave"
                }))));
              }
            } else {
              if (clip.faveStatus === true) {
                return React.createElement("div", {
                  className: "clip"
                }, React.createElement("h4", {
                  className: "clip-title"
                }, React.createElement("u", null, clip.title), React.createElement("span", {
                  className: "creator"
                }, "Creator: ", clip.creatorUN)), React.createElement("p", {
                  className: "game"
                }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
                  className: "game"
                }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                  id: "remForm" + numClips,
                  onSubmit: makePost,
                  name: "remForm",
                  action: "/remFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Remove Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart-broken un-fave"
                }))));
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
                  className: "game"
                }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                  id: "favForm" + numClips,
                  onSubmit: makePost,
                  name: "favForm",
                  action: "/addFavorite",
                  method: "POST",
                  className: "clipForm"
                }, React.createElement("input", {
                  type: "hidden",
                  name: "_csrf",
                  value: props.csrf
                }), React.createElement("input", {
                  name: "clipID",
                  type: "hidden",
                  value: clip.id
                }), React.createElement("button", {
                  className: "fa-button",
                  type: "submit",
                  title: "Add Favorite"
                }, React.createElement("i", {
                  className: "fas fa-heart fave"
                }))));
              }
            }
          } else if (clip.character2 !== '') {
            if (clip.faveStatus === true) {
              return React.createElement("div", {
                className: "clip"
              }, React.createElement("h4", {
                className: "clip-title"
              }, React.createElement("u", null, clip.title), React.createElement("span", {
                className: "creator"
              }, "Creator: ", clip.creatorUN)), React.createElement("p", {
                className: "game"
              }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
                className: "game"
              }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                id: "remForm" + numClips,
                onSubmit: makePost,
                name: "remForm",
                action: "/remFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Remove Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart-broken un-fave"
              }))));
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
                className: "game"
              }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                id: "favForm" + numClips,
                onSubmit: makePost,
                name: "favForm",
                action: "/addFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Add Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart fave"
              }))));
            }
          } else {
            if (clip.faveStatus === true) {
              return React.createElement("div", {
                className: "clip"
              }, React.createElement("h4", {
                className: "clip-title"
              }, React.createElement("u", null, clip.title), React.createElement("span", {
                className: "creator"
              }, "Creator: ", clip.creatorUN)), React.createElement("p", {
                className: "game"
              }, React.createElement("b", null, "Game:"), " ", clip.game), React.createElement("p", {
                className: "game"
              }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                id: "remForm" + numClips,
                onSubmit: makePost,
                name: "remForm",
                action: "/remFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Remove Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart-broken un-fave"
              }))));
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
                className: "game"
              }, React.createElement("b", null, "Number of Favorites:"), " ", clip.numFavorites), React.createElement("p", {
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
                id: "favForm" + numClips,
                onSubmit: makePost,
                name: "favForm",
                action: "/addFavorite",
                method: "POST",
                className: "clipForm"
              }, React.createElement("input", {
                type: "hidden",
                name: "_csrf",
                value: props.csrf
              }), React.createElement("input", {
                name: "clipID",
                type: "hidden",
                value: clip.id
              }), React.createElement("button", {
                className: "fa-button",
                type: "submit",
                title: "Add Favorite"
              }, React.createElement("i", {
                className: "fas fa-heart fave"
              }))));
            }
          }
        }
      }
    }
  });
  return React.createElement("div", {
    className: "clipList"
  }, clipNodes);
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
    onClick: function onClick() {
      return showClips(props.csrf);
    }
  }, "Search"), React.createElement("select", {
    id: "sortList",
    onChange: function onChange() {
      return showClips(props.csrf);
    }
  }, React.createElement("option", {
    value: "oldest"
  }, "Oldest First"), React.createElement("option", {
    value: "newest"
  }, "Newest First"), React.createElement("option", {
    value: "alphabeticalDown"
  }, "Alphabetical (A-Z)"), React.createElement("option", {
    value: "alphabeticalUp"
  }, "Alphabetical (Z-A)"), React.createElement("option", {
    value: "faveDown"
  }, "Number of Favorites (Highest first)"), React.createElement("option", {
    value: "faveUp"
  }, "Number of Favorites (Lowest first)")));
}; // check for issues with post; send ajax request if everything is all good


var makePost = function makePost(e) {
  e.preventDefault();
  $("#terryMessage").animate({
    width: 'hide'
  }, 350); // create variables to make this slightly more readable

  var id = "#" + e.target.id;
  var csrf = "".concat(e.target._csrf.value); // e.target.id will be the ID of the form that called makePost in the first place

  sendAjax('POST', $(id).attr("action"), $(id).serialize(), function (result) {
    showMessage(result.message);
    showClips(csrf);
  }, function (xhr, status, error) {
    console.log(xhr);
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