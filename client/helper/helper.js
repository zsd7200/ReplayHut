// show error message
const showMessage = (message, terry = "bad") => {
    
    // switch terry pic based on param
    switch(terry) {
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
    }
    
    // change message
    $("#innerMessage").text(message);
    $("#terryMessage").animate({width:'toggle'}, 350);
    
    // disappear terry after 4s
    setTimeout(() => {
        $("#terryMessage").animate({width:'hide'}, 350);
    }, 4000);
};

// redirect user to a page
const redirect = (response) => {
    $("#terryMessage").animate({width:'hide'}, 350);
    window.location = response.redirect;
};

// checks for premium and hides ads if necessary
const checkPremium = () => {
    sendAjax('GET', '/getMyAccount', null, (data) =>{
        if(data.account.premiumStatus === true) {
            $(".ad-sidebar").hide();
        } else {
            $(".ad-sidebar").show();
        }
    });  
};

// send ajax request
const sendAjax = (type, action, data, success, error) => {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: error,/*function(xhr, status, error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);}*/
        
    });
};