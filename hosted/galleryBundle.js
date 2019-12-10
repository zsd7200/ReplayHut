"use strict";

var ytWidth = 430;
var ytHeight = 242;
var numClips = 0;
var favesOnly = false; //Format date for use in displaying on the clip

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
}; //Show the clips in the gallery


var showClips = function showClips(csrf) {
  // get account data so the username and favorites can be passed in
  sendAjax('GET', '/getMyAccount', null, function (accdata) {
    // Retrieving the clips
    sendAjax('GET', '/getClips', null, function (clipdata) {
      ReactDOM.render(React.createElement(ClipList, {
        clips: clipdata.clips,
        userfaves: accdata.account.favorites,
        user: accdata.account.username,
        csrf: csrf,
        use: "gallery"
      }), document.querySelector("#clips"));
    }, function (xhr, status, error) {
      var messageObj = JSON.parse(xhr.responseText);
      showMessage(messageObj.error);
    });
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
}; //Show the playlists on the playlists page


var showPlaylists = function showPlaylists(csrf) {
  // get account data so the username can be used
  sendAjax('GET', '/getMyAccount', null, function (accdata) {
    // Retrieving the playlists so they can be shown
    sendAjax('GET', '/getPlaylists', null, function (playlistData) {
      ReactDOM.render(React.createElement(PlaylistList, {
        playlists: playlistData.playlists,
        listCount: accdata.account.numPlaylists,
        user: accdata.account.username,
        csrf: csrf
      }), document.querySelector("#playlists"));
    }, function (xhr, status, error) {
      var messageObj = JSON.parse(xhr.responseText);
      showMessage(messageObj.error);
    });
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
}; //Showing the page to create a playlist for the first time, no clip 


var showCreatePlaylist = function showCreatePlaylist(csrf) {
  ReactDOM.render(React.createElement(PlaylistForm, {
    csrf: csrf
  }), document.querySelector("#playlists"));
}; //Used to display a specific playlist


var displayPlaylist = function displayPlaylist(e) {
  e.preventDefault(); //Temporary variable to be used

  var curList = e.target.listID.value; // get account data so the username and favorites can be passed in

  sendAjax('GET', '/getMyAccount', null, function (accdata) {
    // Retrieving the clips so they can be displayed
    sendAjax('GET', '/getClips', null, function (clipdata) {
      //Retrieving the playlists to be used in displaying the correct clips
      sendAjax('GET', '/getPlaylists', null, function (playlistData) {
        ReactDOM.render(React.createElement(ClipList, {
          clips: clipdata.clips,
          userfaves: accdata.account.favorites,
          user: accdata.account.username,
          userPlaylists: accdata.account.savedPlaylists,
          currentList: curList,
          playlists: playlistData.playlists,
          use: "playlist"
        }), document.querySelector("#playlists"));
      }, function (xhr, status, error) {
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
      });
    }, function (xhr, status, error) {
      var messageObj = JSON.parse(xhr.responseText);
      showMessage(messageObj.error);
    });
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
}; //Displaying the area which allows the user to add or remove a clip from a playlist


var showAddPlaylist = function showAddPlaylist(e) {
  e.preventDefault(); //Temporary variables to be used later

  var csrf = e.target._csrf.value;
  var id = e.target.clipID.value; // get account data so the username can be used 

  sendAjax('GET', '/getMyAccount', null, function (accdata) {
    // Getting the clips to be checked against
    sendAjax('GET', '/getClips', null, function (clipdata) {
      //Getting the playlists so they can be added to
      sendAjax('GET', '/getPlaylists', null, function (playlistData) {
        ReactDOM.render(React.createElement(PlaylistAddDisplay, {
          playlists: playlistData.playlists,
          csrf: csrf,
          clipID: id,
          user: accdata.account.username,
          clips: clipdata.clips
        }), document.querySelector("#clips"));
        document.querySelector("#search").innerHTML = "";
      }, function (xhr, status, error) {
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
      });
    }, function (xhr, status, error) {
      var messageObj = JSON.parse(xhr.responseText);
      showMessage(messageObj.error);
    });
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
}; //Creating a new playlist


var createPlaylist = function createPlaylist(e) {
  e.preventDefault();
  $("#terryMessage").animate({
    width: 'hide'
  }, 350); //Making sure the fields are filled out

  if ($("#clipTitle").val() == '') {
    showMessage("Hey! Make sure you fill out all the fields!");
    return false;
  }

  var csrf = e.target._csrf.value; //Sending the request to add the playlist

  sendAjax('POST', $("#createForm").attr("action"), $("#createForm").serialize(), function (result) {
    showMessage(result.message);
    setup(csrf);
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
}; //Adding a clip to a playlist


var addToPlaylist = function addToPlaylist(e) {
  e.preventDefault(); //Storing temporary values to be changed and sent

  var playlistValue = $("#playlistDropList").val();
  var title = e.target.title;
  var playlistid = e.target.playlistID;
  var csrf = e.target._csrf.value; //If a new playlist is not going to be created

  if (playlistValue !== 'newList') {
    //Changing the value that is going to be sent
    title.value = playlistValue; //Getting the account to get the id of the playlist selected

    sendAjax('GET', '/getMyAccount', null, function (accdata) {
      //Looping through the saved playlists on the account to check which playlist is being sent
      for (var i = 0; i < accdata.account.savedPlaylists.length; i++) {
        //If the title of the playlist is the same as the current one, save the ID
        if (accdata.account.savedPlaylists[i].title = playlistValue) playlistid.value = accdata.account.savedPlaylists[i].id;
      } //Send the request


      sendAjax('POST', '/addToPlaylist', $("#submitAddPlaylist").serialize(), function (result) {
        showMessage(result.message);
        setup(csrf);
      }, function (xhr, status, error) {
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
      });
    }, function (xhr, status, error) {
      var messageObj = JSON.parse(xhr.responseText);
      showMessage(messageObj.error);
    });
  } //If a new playlist is being created, render the page for it
  else {
      ReactDOM.render(React.createElement(PlaylistForm, {
        csrf: e.target._csrf.value,
        clipID: e.target.clipID.value
      }), document.querySelector("#clips"));
    }
}; //Removing a clip from a playlist


var removeFromPlaylist = function removeFromPlaylist(e) {
  e.preventDefault(); //Temporary variables to be changed and sent

  var playlistValue = $("#playlistDropList").val();
  var title = e.target.title;
  var playlistid = e.target.playlistID;
  var csrf = e.target._csrf.value;
  title.value = playlistValue; //Getting the account to check for the specific playlist

  sendAjax('GET', '/getMyAccount', null, function (accdata) {
    for (var i = 0; i < accdata.account.savedPlaylists.length; i++) {
      if (accdata.account.savedPlaylists[i].title = playlistValue) playlistid.value = accdata.account.savedPlaylists[i].id;
    }

    sendAjax('POST', '/removeFromPlaylist', $("#submitRemPlaylist").serialize(), function (result) {
      showMessage(result.message);
      setup(csrf);
    }, function (xhr, status, error) {
      var messageObj = JSON.parse(xhr.responseText);
      showMessage(messageObj.error);
    });
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
}; // Form for creating a new playlist


var PlaylistForm = function PlaylistForm(props) {
  checkPremium();

  if (!props.clipID) {
    return React.createElement("div", {
      className: "content-box"
    }, React.createElement("form", {
      id: "backForm",
      onSubmit: showAddPlaylist,
      name: "backForm"
    }, React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), React.createElement("input", {
      className: "back pointer",
      type: "submit",
      value: "Go back"
    })), React.createElement("form", {
      id: "createForm",
      onSubmit: createPlaylist,
      name: "createForm",
      action: "/createPlaylist",
      method: "POST",
      classname: "createForm"
    }, React.createElement("h3", {
      id: "requiredHeader"
    }, "Name your new playlist: "), React.createElement("div", {
      className: "input-item"
    }, React.createElement("input", {
      id: "clipTitle",
      type: "text",
      name: "title",
      placeholder: "Playlist Title"
    }), React.createElement("br", null), React.createElement("label", {
      className: "input-label",
      htmlFor: "title"
    }, "Playlist Title: ")), React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), React.createElement("input", {
      className: "formSubmit",
      type: "submit",
      value: "Submit Clip"
    })));
  } else {
    return React.createElement("div", {
      className: "content-box"
    }, React.createElement("form", {
      id: "backForm",
      onSubmit: showAddPlaylist,
      name: "backForm"
    }, React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), React.createElement("input", {
      type: "hidden",
      name: "clipID",
      value: props.clipID
    }), React.createElement("input", {
      className: "back pointer",
      type: "submit",
      value: "Go back"
    })), React.createElement("form", {
      id: "createForm",
      onSubmit: createPlaylist,
      name: "createForm",
      action: "/createPlaylist",
      method: "POST",
      classname: "createForm"
    }, React.createElement("h3", {
      id: "requiredHeader"
    }, "Name your new playlist: "), React.createElement("div", {
      className: "input-item"
    }, React.createElement("input", {
      id: "clipTitle",
      type: "text",
      name: "title",
      placeholder: "Playlist Title"
    }), React.createElement("br", null), React.createElement("label", {
      className: "input-label",
      htmlFor: "title"
    }, "Playlist Title: ")), React.createElement("input", {
      type: "hidden",
      name: "clipID",
      value: props.clipID
    }), React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), React.createElement("input", {
      className: "formSubmit",
      type: "submit",
      value: "Submit Clip"
    })));
  }
}; // List of playlists


var PlaylistList = function PlaylistList(props) {
  checkPremium(); //If there are no playlists on the user's account, display that there are none

  if (props.listCount === 0) {
    return React.createElement("div", {
      className: "loader-container"
    }, React.createElement("h3", null, "No playlists found!"), React.createElement("button", {
      onClick: function onClick() {
        return showCreatePlaylist(props.csrf);
      }
    }, "Make one now!"));
  } //Variable to increment the number of playlists being shown


  var playlistCount = 0; //Making elements to show the playlists

  var listNodes = props.playlists.map(function (list) {
    //Making sure that the playlist is made by the current user
    var userCheck = false;
    if (props.user === list.creatorUN) userCheck = true;

    if (userCheck) {
      playlistCount++;
      return React.createElement("div", {
        className: "playlist"
      }, React.createElement("h4", {
        className: "playlist-title"
      }, React.createElement("u", null, list.title)), React.createElement("h3", {
        classname: "playlistClipCount"
      }, "Number of clips: ", list.numEntries), React.createElement("form", {
        id: "showList" + playlistCount,
        onSubmit: displayPlaylist,
        name: "showList",
        className: "showList"
      }, React.createElement("input", {
        type: "hidden",
        name: "_csrf",
        value: props.csrf
      }), React.createElement("input", {
        name: "listID",
        type: "hidden",
        value: list.id
      }), React.createElement("input", {
        className: "formSubmit",
        type: "submit",
        value: "Go to Playlist"
      })));
    }
  });
  return React.createElement("div", {
    className: "playlistList"
  }, listNodes);
}; // Displaying the ability to add or remove a clip from playlists


var PlaylistAddDisplay = function PlaylistAddDisplay(props) {
  //Storing the current playlists from a clip
  var thisClipPlaylists; // Finding the current clip's list of playlists

  for (var i = 0; i < props.clips.length; i++) {
    if (props.clips[i].id === props.clipID) thisClipPlaylists = props.clips[i].inPlaylists;
  } //Getting the options for playlists to be added to
  //Cannot be ones that it is already in


  var listAddNodes = props.playlists.map(function (list) {
    var showLists = true;

    if (thisClipPlaylists.length !== 0) {
      //Checking if the current clip is in the array of playlists the clip is in
      for (var _i = 0; _i < thisClipPlaylists.length; _i++) {
        if (thisClipPlaylists[_i] === list.id) if (list.creatorUN === props.user) showLists = false;
      }
    }

    if (showLists) return React.createElement("option", {
      value: list.title
    }, list.title);
  }); //Setting up the list of playlists that can be rmeoved

  var listRemNodes = "";

  if (thisClipPlaylists.length !== 0) {
    //Getting options to be removed from
    //Will only show up if the clip is in any playlists
    listRemNodes = props.playlists.map(function (list) {
      for (var _i2 = 0; _i2 < thisClipPlaylists.length; _i2++) {
        if (thisClipPlaylists[_i2] === list.id) if (list.creatorUN === props.user) return React.createElement("option", {
          value: list.title
        }, list.title);
      }
    });
  }

  var playlistAddDrop = React.createElement("div", {
    className: "content-box"
  }, React.createElement("div", {
    className: "input-item"
  }, React.createElement("select", {
    id: "playlistDropList"
  }, React.createElement("option", {
    value: "newList"
  }, "Create new Playlist"), listAddNodes), React.createElement("label", {
    className: "input-label",
    htmlFor: "playlistDropList"
  }, "Select Playlist to Add to: ")), React.createElement("form", {
    id: "submitAddPlaylist",
    onSubmit: addToPlaylist,
    name: "playAddForm"
  }, React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), React.createElement("input", {
    name: "clipID",
    type: "hidden",
    value: props.clipID
  }), React.createElement("input", {
    name: "title",
    type: "hidden",
    value: ""
  }), React.createElement("input", {
    name: "playlistID",
    type: "hidden",
    value: ""
  }), React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Add to Playlist"
  })));
  var playlistRemDrop = "";

  if (listRemNodes != "") {
    playlistRemDrop = React.createElement("div", {
      className: "content-box"
    }, React.createElement("div", {
      className: "input-item"
    }, React.createElement("select", {
      id: "playlistDropList"
    }, listRemNodes), React.createElement("label", {
      className: "input-label",
      htmlFor: "playlistDropList"
    }, "Select Playlist to Remove from: ")), React.createElement("form", {
      id: "submitRemPlaylist",
      onSubmit: removeFromPlaylist,
      name: "playRemForm"
    }, React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), React.createElement("input", {
      name: "clipID",
      type: "hidden",
      value: props.clipID
    }), React.createElement("input", {
      name: "title",
      type: "hidden",
      value: ""
    }), React.createElement("input", {
      name: "playlistID",
      type: "hidden",
      value: ""
    }), React.createElement("input", {
      className: "formSubmit",
      type: "submit",
      value: "Remove from Playlist"
    })));
  }

  return React.createElement("div", {
    id: "playlistAdd"
  }, playlistAddDrop, playlistRemDrop);
};

var ClipList = function ClipList(props) {
  numClips = 0;
  var thisList;
  checkPremium();
  props.userfaves = remDeletedFavorites(props.clips, props.userfaves); // Getting the values from the input fields

  var userSearch = $("#userSearch").val();
  var gameSearch = $("#gameSearch").val();
  var charSearch = $("#charSearch").val();

  if (props.use === "gallery") {
    // If no clip have been made, show error
    if (props.clips.length === 0 || props.userfaves.length === 0 && favesOnly === true) {
      return React.createElement("div", {
        className: "loader-container"
      }, React.createElement("h3", null, "No clips found!"));
    } // Trimming the values


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
      // Code for sorting by date from: https://stackoverflow.com/questions/10123953/how-to-sort-an-array-by-a-date-property
      props.clips.sort(function (a, b) {
        return new Date(b.postDate) - new Date(a.postDate);
      });
    } else if (searchParams == 'alphabeticalDown') {
      //Code for sorting alphabetically from: https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
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
      //Code for sorting alphabetically from: https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
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
    }
  } //If showing the playlist, load in other things
  else {
      //Find what the current plaulist is based on id
      for (var i = 0; i < props.playlists.length; i++) {
        if (props.playlists[i].id == props.currentList) thisList = props.playlists[i];
      } //If there are no clips in the playlist, don't show anything


      if (thisList.clips.length === 0) {
        return React.createElement("div", {
          className: "loader-container"
        }, React.createElement("h3", null, "Playlist is empty!"));
      }
    } // set faveStatus of all the clips


  for (var _i3 = 0; _i3 < props.userfaves.length; _i3++) {
    for (var j = 0; j < props.clips.length; j++) {
      if (props.userfaves[_i3] === props.clips[j].id) {
        props.clips[j].faveStatus = true;
        break;
      }
    }
  } // set current user to the active user


  for (var _i4 = 0; _i4 < props.clips.length; _i4++) {
    props.clips[_i4].currUser = props.user;
  } // Displaying each clip


  var clipNodes = props.clips.map(function (clip) {
    // Checks to see if a clip should be posted based on search parameters 
    var userCheck = true;
    var gameCheck = true;
    var charCheck = true;
    var playlistCheck = false;

    if (props.use === 'gallery') {
      // Check if the search field is empty
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
      }
    } else {
      for (var _i5 = 0; _i5 < thisList.clips.length; _i5++) {
        if (thisList.clips[_i5] === clip.id) playlistCheck = true;
      }
    }

    var clipCheck = false;

    if (props.use === 'gallery') {
      if (userCheck && gameCheck && charCheck) {
        clipCheck = true; // increment numclips for every clip so every fav/rem/delete form has a unique ID

        numClips++;
      }
    } else {
      if (playlistCheck) clipCheck = true;
    } // If all the checks pass, display that clip


    if (clipCheck) {
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
              } else if (favesOnly === false) {
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
              } else if (favesOnly === false) {
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
            } else if (favesOnly === false) {
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
            } else if (favesOnly === false) {
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
              } else if (favesOnly === false) {
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
              } else if (favesOnly === false) {
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
            } else if (favesOnly === false) {
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
            } else if (favesOnly === false) {
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
              } else if (favesOnly === false) {
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
              } else if (favesOnly === false) {
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
            } else if (favesOnly === false) {
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
            } else if (favesOnly === false) {
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
              } else if (favesOnly === false) {
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
              } else if (favesOnly === false) {
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
                  id: "playAddForm" + numClips,
                  onSubmit: showAddPlaylist,
                  name: "playAddForm",
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
                  title: "Add to/Remove from Playlist"
                }, React.createElement("i", {
                  className: "fas fa-list-ul playlist-icon"
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
            } else if (favesOnly === false) {
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
            } else if (favesOnly === false) {
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
                id: "playAddForm" + numClips,
                onSubmit: showAddPlaylist,
                name: "playAddForm",
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
                title: "Add to/Remove from Playlist"
              }, React.createElement("i", {
                className: "fas fa-list-ul playlist-icon"
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
      }
    }
  });

  if (numClips === 0) {
    return React.createElement("div", {
      className: "clipList"
    }, React.createElement("h3", {
      className: "no-clips"
    }, "No clips found!"));
  }

  return React.createElement("div", {
    className: "clipList"
  }, clipNodes);
};

var SearchBar = function SearchBar(props) {
  return React.createElement("div", null, React.createElement("div", {
    id: "gallery-button-container"
  }, React.createElement("button", {
    type: "button",
    className: "fa-button",
    onClick: toggleSearch,
    title: "Toggle Search"
  }, React.createElement("i", {
    className: "fas fa-search"
  })), React.createElement("button", {
    type: "button",
    className: "fa-button",
    onClick: function onClick() {
      return toggleFavorites(props.csrf);
    },
    title: "Toggle Favorites"
  }, React.createElement("i", {
    className: "fas fa-heart fave"
  }))), React.createElement("div", {
    className: "collapse",
    id: "searchCollapse"
  }, React.createElement("div", {
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
    placeholder: "Marth, Zelda"
  }), React.createElement("label", {
    className: "input-label help",
    title: "Seperate characters by commas!",
    htmlFor: "charSearch"
  }, "Characters: ")), React.createElement("div", {
    className: "input-item"
  }, React.createElement("select", {
    id: "sortList"
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
  }, "Number of Favorites (Lowest first)")), React.createElement("label", {
    className: "input-label",
    htmlFor: "sortList"
  }, "Order By: ")), React.createElement("button", {
    className: "formSubmit",
    onClick: function onClick() {
      return showClips(props.csrf);
    }
  }, "Search"))));
}; // remove deleted clips from favorites


var remDeletedFavorites = function remDeletedFavorites(clips, userfaves) {
  // empty array to store indexes
  var indexesToDelete = []; // loop through user favorites

  for (var i = 0; i < userfaves.length; i++) {
    // create a new doesExist every loop
    var doesExist = false; // loop through clips, if doesExist = true, break out of loop

    for (var j = 0; j < clips.length; j++) {
      if (userfaves[i] === clips[j].id) {
        doesExist = true;
        break;
      }
    } // if doesExist = false, add index to indexesToDelete


    if (doesExist === false) {
      indexesToDelete.unshift(i);
    }
  } // loop through indexesToDelete if it has a length of 1+ and remove ids from userFaves


  if (indexesToDelete.length > 0) {
    for (var _i6 = 0; _i6 < indexesToDelete.length; _i6++) {
      userfaves.splice(indexesToDelete[_i6], 1);
    }
  } // return userfaves


  return userfaves;
}; // toggle if the user is viewing only their favorites


var toggleFavorites = function toggleFavorites(csrf) {
  // change favesOnly
  favesOnly = !favesOnly; // show a message

  if (favesOnly === true) {
    showMessage("Now showing only favorited clips! Okay!", "good");
  } else {
    showMessage("Hey! Now showing all clips!", "good");
  } // show clips


  showClips(csrf);
}; // toggling in-line doesn't work, so this is required


var toggleSearch = function toggleSearch(e) {
  $("#searchCollapse").collapse('toggle'); // toggles the search box
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
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
  return false;
};

var setup = function setup(csrf) {
  var searchCheck = document.querySelector("#search");

  if (searchCheck != null) {
    showClips(csrf);
    ReactDOM.render(React.createElement(SearchBar, {
      csrf: csrf
    }), document.querySelector("#search"));
  } else {
    showPlaylists(csrf);
  }
}; // get csrf token


var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function (props) {
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