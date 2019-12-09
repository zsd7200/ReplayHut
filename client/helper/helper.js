// terry bool gets modified in showMessage to stop any weirdness with
// a lot of messages being activated at once
let firstTerry = true;

// show error message
const showMessage = (message, terry = "bad") => {
    
    // hide terry first
    $("#terryMessage").animate({width:'hide'}, 0);
    
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
    
    // disappear terry after 4s only if firstTerry is active
    // this prevents multiple setTimeout functions running at the same
    // time, which causes weirdness
    if(firstTerry === true) {
        setTimeout(() => {
            $("#terryMessage").animate({width:'hide'}, 350);
            firstTerry = true;
        }, 4000);
    }
    
    // set firstTerry to false
    firstTerry = false;
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
        error: error,
    });
};