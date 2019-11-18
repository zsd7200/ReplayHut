"use strict";

var passChange = function passChange(e) {
  e.preventDefault();
  $("#terryMessage").animate({
    width: 'hide'
  }, 350);

  if ($("#pass").val() == '' || $("#pass2").val() == '' || $("#currentPass").val() == '') {
    showMessage("Hey, make sure you fill out all fields!");
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    showMessage("Woah, those new passwords don't match!");
    return false;
  }

  sendAjax('POST', $("#changePassForm").attr("action"), $("#changePassForm").serialize(), function (result) {
    $("#pass").val() == '';
    $("#pass2").val() == '';
    $("#currentPass").val() == '';
    showMessage(result.message);
  }, function (xhr, status, error) {
    if (error === 'Unauthorized') showMessage("Current password is not correct");
  });
  return false;
};

var activatePremium = function activatePremium(e) {
  e.preventDefault();
  sendAjax('POST', $("#premCardForm").attr("action"), $("#premCardForm").serialize(), function (result) {
    showAccount();
    showMessage(result.message, "good");
  });
};

var cancelPremium = function cancelPremium(e) {
  e.preventDefault();
  sendAjax('POST', "/cancelPremium", $("#csrf").serialize(), function (result) {
    showAccount();
    showMessage(result.message, "wait");
  }, function (xhr, status, error) {
    var messageObj = JSON.parse(xhr.responseText);
    showMessage(messageObj.error);
  });
};

var showPremium = function showPremium() {
  sendAjax('GET', '/getToken', null, function (result) {
    ReactDOM.render(React.createElement(PremiumInfo, {
      csrf: result.csrfToken
    }), document.querySelector("#content"));
  });
};

var showAccount = function showAccount() {
  sendAjax('GET', '/getToken', null, function (result) {
    sendAjax('GET', '/getMyAccount', null, function (data) {
      ReactDOM.render(React.createElement(AccountInfo, {
        account: data.account,
        csrf: result.csrfToken
      }), document.querySelector("#content"));
    });
  });
};

var showCancelPremium = function showCancelPremium() {
  sendAjax('GET', '/getToken', null, function (result) {
    ReactDOM.render(React.createElement(CancelPremium, {
      csrf: result.csrfToken
    }), document.querySelector("#content"));
  });
};

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
};

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

var AccountInfo = function AccountInfo(props) {
  hideAds(props.account.premiumStatus);

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
    })), React.createElement("button", {
      className: "formSubmit pointer premium-button",
      onClick: showPremium
    }, "Sign up for Prime!"));
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
    })), React.createElement("button", {
      className: "formSubmit pointer premium-button",
      onClick: showCancelPremium
    }, "Cancel Premium"));
  }
};
/*const setup = function(csrf)
{
    sendAjax('GET', '/getMyAccount', null, (data) =>{
        ReactDOM.render(<AccountInfo account={data.account} csrf={csrf} />, document.querySelector("#content"));
    });
}

const getToken = () =>{
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};
*/


$(document).ready(function () {
  //getToken();
  showAccount();
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