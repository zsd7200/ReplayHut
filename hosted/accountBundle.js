"use strict";

var passChange = function passChange(e) {
  e.preventDefault();
  $("#terryMessage").animate({
    width: 'hide'
  }, 350);

  if ($("#pass").val() == '' || $("#pass2").val() == '' || $("#currentPass").val() == '') {
    handleError("Hey, make sure you fill out all fields!");
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("Woah, those new passwords don't match!");
    return false;
  }

  sendAjax('POST', $("#changePassForm").attr("action"), $("#changePassForm").serialize(), function (result) {
    $("#pass").val() == '';
    $("#pass2").val() == '';
    $("#currentPass").val() == '';
    handleError(result.message);
  }, function (xhr, status, error) {
    if (error === 'Unauthorized') handleError("Current password is not correct");
  });
  return false;
};

var activatePremium = function activatePremium(e) {
  e.preventDefault();
  sendAjax('POST', $("#premCardForm").attr("action"), $("#premCardForm").serialize(), function (result) {
    showAccount();
    handleError(result.message);
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

var PremiumInfo = function PremiumInfo(props) {
  return React.createElement("div", {
    classname: "content"
  }, React.createElement("h1", null, " Get Amazarn Prime today!"), React.createElement("h3", null, "Benefits of premium:"), React.createElement("ul", null, React.createElement("li", null, "Remove ads"), React.createElement("li", null, "Get an icon next to your name across the site"), React.createElement("li", null, "Help us continue providing updates to ReplayHut!")), React.createElement("h3", null, "If you want to help, get premium for just $3.99 a month!"), React.createElement("br", null), React.createElement("form", {
    id: "premCardForm",
    name: "premCardForm",
    onSubmit: activatePremium,
    action: "/activatePremium",
    method: "POST"
  }, React.createElement("label", {
    htmlFor: "name"
  }, "Name on Card: "), React.createElement("input", {
    id: "name",
    type: "text",
    name: "name",
    placeholder: "Name on Card",
    disabled: true
  }), React.createElement("label", {
    htmlFor: "cardNum"
  }, "Card Number: "), React.createElement("input", {
    id: "cardNum",
    type: "text",
    name: "cardNum",
    placeholder: "Card Number",
    disabled: true
  }), React.createElement("label", {
    htmlFor: "cvv"
  }, "Wacky numbers on the back: "), React.createElement("input", {
    id: "cvv",
    type: "text",
    name: "cvv",
    placeholder: "CVV",
    disabled: true
  }), React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Activate Premium"
  })));
};

var AccountInfo = function AccountInfo(props) {
  if (props.account.premiumStatus === false) {
    return React.createElement("div", {
      className: "content-box"
    }, React.createElement("div", {
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
    })), React.createElement("br", null), React.createElement("button", {
      onClick: showPremium
    }, "Sign up for Prime!"));
  } else {
    return React.createElement("div", {
      className: "content-box"
    }, React.createElement("div", {
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
    })), React.createElement("br", null), React.createElement("button", {
      disabled: true
    }, "Sign up for Prime!"));
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

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#terryMessage").animate({
    width: 'toggle'
  }, 350);
};

var redirect = function redirect(response) {
  $("#terryMessage").animate({
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