"use strict";

//Handles the changing of users passwords
var passChange = function passChange(e) {
  e.preventDefault(); //Hiding the sidebar message which may have popped up

  $("#terryMessage").animate({
    width: 'hide'
  }, 350); //Error checks
  //Making sure all values are filled in

  if ($("#pass").val() == '' || $("#pass2").val() == '' || $("#currentPass").val() == '') {
    showMessage("Hey, make sure you fill out all fields!");
    return false;
  } //Checking if the new passwords match each other


  if ($("#pass").val() !== $("#pass2").val()) {
    showMessage("Woah, those new passwords don't match!");
    return false;
  } //Sending the request to the router to change the password


  sendAjax('POST', $("#changePassForm").attr("action"), $("#changePassForm").serialize(), function (result) {
    //Displaying the results
    showMessage(result.message);
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
  return false;
}; //Used to send a request to activate premium for the user


var activatePremium = function activatePremium(e) {
  e.preventDefault();
  sendAjax('POST', $("#premCardForm").attr("action"), $("#premCardForm").serialize(), function (result) {
    //Goes back to the account page upon completion
    showAccount(); //Writing out a success message

    showMessage(result.message, "good");
  });
}; //Sending a request to cancel the premium membership


var cancelPremium = function cancelPremium(e) {
  e.preventDefault();
  sendAjax('POST', "/cancelPremium", $("#csrf").serialize(), function (result) {
    //Returning to the account page
    showAccount(); //Writing out a success message

    showMessage(result.message, "wait");
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
}; //Gets a csrf token and then displays the page with information about the premium membership


var showPremium = function showPremium(e) {
  var csrf = "".concat(e.target._csrf.value);
  ReactDOM.render(React.createElement(PremiumInfo, {
    csrf: csrf
  }), document.querySelector("#content"));
}; //Gets a csrf token and then displays the account page


var showAccount = function showAccount() {
  sendAjax('GET', '/getToken', null, function (result) {
    sendAjax('GET', '/getMyAccount', null, function (data) {
      ReactDOM.render(React.createElement(AccountInfo, {
        account: data.account,
        csrf: result.csrfToken
      }), document.querySelector("#content"));
    });
  });
}; //Gets a csrf token and then displays the page with information about cancelling the premiuum membership


var showCancelPremium = function showCancelPremium(e) {
  var csrf = "".concat(e.target._csrf.value);
  ReactDOM.render(React.createElement(CancelPremium, {
    csrf: csrf
  }), document.querySelector("#content"));
};

var showDeleteAccount = function showDeleteAccount(e) {
  var csrf = "".concat(e.target._csrf.value);
  ReactDOM.render(React.createElement(DeleteInfo, {
    csrf: csrf
  }), document.querySelector("#content"));
};

var deleteAccount = function deleteAccount(e) {
  e.preventDefault(); // create variables to make this slightly more readable

  var id = "#" + e.target.id;
  sendAjax('POST', $(id).attr("action"), $(id).serialize(), redirect, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
  return false;
}; //Returns the content for the page regarding cancelling premium


var CancelPremium = function CancelPremium(props) {
  return React.createElement("div", {
    className: "content-box"
  }, React.createElement("button", {
    className: "back pointer",
    onClick: showAccount
  }, "Go back"), React.createElement("div", {
    className: "center-content"
  }, React.createElement("h1", null, "Woah there!"), React.createElement("h2", null, "Are you really sure you want to cancel your premium membership?")), React.createElement("br", null), React.createElement("h3", null, "If you cancel your subscription, you'll lose:"), React.createElement("ul", null, React.createElement("li", null, "Ad-free browsing"), React.createElement("li", null, "An icon next to your name across the site")), React.createElement("h3", null, "If you're really sure, click below to cancel your subscription."), React.createElement("p", {
    className: "center-content"
  }, "(Changes will take effect at the end of your subscription cycle)"), React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    id: "csrf",
    value: props.csrf
  }), React.createElement("button", {
    className: "formSubmit pointer premium-button",
    onClick: cancelPremium
  }, "Cancel Subscription"));
}; //Returns the content for the page regarding the premium membership


var PremiumInfo = function PremiumInfo(props) {
  return React.createElement("div", {
    className: "content-box"
  }, React.createElement("button", {
    className: "back pointer",
    onClick: showAccount
  }, "Go Back"), React.createElement("h1", {
    className: "center-content"
  }, "Get Hut Prime\u2122 today!"), React.createElement("br", null), React.createElement("h3", null, "Benefits of Prime:"), React.createElement("ul", null, React.createElement("li", null, "Remove ads"), React.createElement("li", null, "Get a \u2B50 icon next to your name across the site"), React.createElement("li", null, "Help us continue providing updates to ReplayHut!")), React.createElement("br", null), React.createElement("h3", null, "If you want to help, get Prime for only $3.99 a month!"), React.createElement("br", null), React.createElement("form", {
    id: "premCardForm",
    name: "premCardForm",
    onSubmit: activatePremium,
    action: "/activatePremium",
    method: "POST"
  }, React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    className: "fake-input",
    id: "name",
    type: "text",
    name: "name",
    placeholder: "Name on Card",
    disabled: true
  }), React.createElement("label", {
    className: "input-label",
    htmlFor: "name"
  }, "Name on Card: ")), React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    className: "fake-input",
    id: "cardNum",
    type: "text",
    name: "cardNum",
    placeholder: "Card Number",
    disabled: true
  }), React.createElement("label", {
    className: "input-label",
    htmlFor: "cardNum"
  }, "Card Number: ")), React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    className: "fake-input",
    id: "cvv",
    type: "text",
    name: "cvv",
    placeholder: "CVV",
    disabled: true
  }), React.createElement("label", {
    className: "input-label help",
    title: "The CVV code is also known as \"the wacky numbers on the back\".",
    htmlFor: "cvv"
  }, "CVV: ")), React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), React.createElement("input", {
    className: "formSubmit premium-button",
    type: "submit",
    value: "Activate Premium"
  })));
};

var DeleteInfo = function DeleteInfo(props) {
  return React.createElement("div", {
    className: "content-box"
  }, React.createElement("button", {
    className: "back pointer",
    onClick: showAccount
  }, "Go Back"), React.createElement("div", {
    className: "center-content"
  }, React.createElement("h1", null, "Woah there!"), React.createElement("h2", null, "Are you really sure you want to delete your whole account?")), React.createElement("br", null), React.createElement("h1", null, "THIS CANNOT BE UNDONE!"), React.createElement("h3", null, "Once your account is deleted, you will lost all information within it - this includes your premium status and number of clips made."), React.createElement("h3", null, "Your clips will remain on the site - it is advised that you delete your clips before deleting your account if you do not wish them to stay."), React.createElement("br", null), React.createElement("h3", null, "If you are sure you want to do this, please input your password below, and click the button."), React.createElement("br", null), React.createElement("form", {
    id: "delAccountForm",
    name: "delAccountForm",
    onSubmit: deleteAccount,
    action: "/deleteAccount",
    method: "POST"
  }, React.createElement("div", {
    className: "input-item"
  }, React.createElement("input", {
    id: "currentPass",
    type: "password",
    name: "currentPass",
    placeholder: "Current password"
  }), React.createElement("label", {
    className: "input-label",
    htmlFor: "currentPass"
  }, "Current Password: ")), React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), React.createElement("input", {
    className: "formSubmit premium-button",
    type: "submit",
    value: "Delete Account"
  })));
}; //Returns the page with the account information


var AccountInfo = function AccountInfo(props) {
  checkPremium();

  if (props.account.premiumStatus === false) {
    return React.createElement("div", {
      className: "content-box"
    }, React.createElement("p", null), React.createElement("div", {
      className: "center-content"
    }, React.createElement("h1", null, "Hello ", props.account.username, "!"), React.createElement("p", null, "You've made ", props.account.createdClips, " clips.")), React.createElement("h3", null, "Change Password:"), React.createElement("form", {
      id: "changePassForm",
      name: "changePassForm",
      onSubmit: passChange,
      action: "/changePassword",
      method: "POST"
    }, React.createElement("div", {
      className: "input-item"
    }, React.createElement("input", {
      id: "currentPass",
      type: "password",
      name: "currentPass",
      placeholder: "Current password"
    }), React.createElement("label", {
      className: "input-label",
      htmlFor: "currentPass"
    }, "Current Password: ")), React.createElement("div", {
      className: "input-item"
    }, React.createElement("input", {
      id: "pass",
      type: "password",
      name: "pass",
      placeholder: "New password"
    }), React.createElement("label", {
      className: "input-label",
      htmlFor: "pass"
    }, "New Password: ")), React.createElement("div", {
      className: "input-item"
    }, React.createElement("input", {
      id: "pass2",
      type: "password",
      name: "pass2",
      placeholder: "Retype password"
    }), React.createElement("label", {
      className: "input-label",
      htmlFor: "pass2"
    }, "Retype New Password: ")), React.createElement("br", null), React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), React.createElement("input", {
      className: "formSubmit",
      type: "submit",
      value: "Change Password"
    })), React.createElement("form", {
      id: "premForm",
      onSubmit: showPremium
    }, React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), React.createElement("input", {
      className: "formSubmit pointer premium-button",
      type: "submit",
      value: "Sign up for Prime!"
    })), React.createElement("form", {
      id: "delForm",
      onSubmit: showDeleteAccount
    }, React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), React.createElement("input", {
      className: "formSubmit pointer premium-button",
      type: "submit",
      value: "Delete Account?"
    })));
  } else {
    return React.createElement("div", {
      className: "content-box"
    }, React.createElement("p", {
      id: "premium-indicator"
    }, "\u2B50 Premium Member"), React.createElement("div", {
      className: "center-content"
    }, React.createElement("h1", null, "Hello ", props.account.username, "!"), React.createElement("p", null, "You've made ", props.account.createdClips, " clips.")), React.createElement("h3", null, "Change Password:"), React.createElement("form", {
      id: "changePassForm",
      name: "changePassForm",
      onSubmit: passChange,
      action: "/changePassword",
      method: "POST"
    }, React.createElement("div", {
      className: "input-item"
    }, React.createElement("input", {
      id: "currentPass",
      type: "password",
      name: "currentPass",
      placeholder: "Current password"
    }), React.createElement("label", {
      className: "input-label",
      htmlFor: "currentPass"
    }, "Current Password: ")), React.createElement("div", {
      className: "input-item"
    }, React.createElement("input", {
      id: "pass",
      type: "password",
      name: "pass",
      placeholder: "New password"
    }), React.createElement("label", {
      className: "input-label",
      htmlFor: "pass"
    }, "New Password: ")), React.createElement("div", {
      className: "input-item"
    }, React.createElement("input", {
      id: "pass2",
      type: "password",
      name: "pass2",
      placeholder: "Retype password"
    }), React.createElement("label", {
      className: "input-label",
      htmlFor: "pass2"
    }, "Retype New Password: ")), React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), React.createElement("input", {
      className: "formSubmit",
      type: "submit",
      value: "Change Password"
    })), React.createElement("form", {
      id: "premForm",
      onSubmit: showCancelPremium
    }, React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), React.createElement("input", {
      className: "formSubmit pointer premium-button",
      type: "submit",
      value: "Cancel Prime Membership"
    })), React.createElement("form", {
      id: "delForm",
      onSubmit: showDeleteAccount
    }, React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), React.createElement("input", {
      className: "formSubmit pointer premium-button",
      type: "submit",
      value: "Delete Account?"
    })));
  }
}; //Showing the account page upon loading


$(document).ready(function () {
  showAccount();
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