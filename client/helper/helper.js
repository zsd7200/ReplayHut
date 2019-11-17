const handleError = (message) => {
    $("#errorMessage").text(message);
    $("#terryMessage").animate({width:'toggle'}, 350);
};

const redirect = (response) => {
    $("#terryMessage").animate({width:'hide'}, 350);
    window.location = response.redirect;
};

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