// checks for issues with logging in, then sends ajax request if everything is good
const handleLogin = (e) => {
    e.preventDefault();
    
    $("#terryMessage").animate({width:'hide'}, 350);
    
    if($("#user").val() == '' || $("#pass").val() == '') {
        showMessage("HEY! Username or password is empty!");
        return false;
    }
    
    console.log($("input[name-_csrf]").val());
    
    sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect, (xhr, status, error) =>{
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
    });
    
    return false;
};

// checks for issues with signing up, then sends ajax request if everything is good
const handleSignup = (e) => {
    e.preventDefault();
    
    $("#terryMessage").animate({width:'hide'}, 350);
    
    if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
        showMessage("HEY! All fields are required!");
        return false;
    }
    
    if($("#pass").val() !== $("#pass2").val()) {
        showMessage("HEY! Passwords do not match!");
        return false;
    }
    
    sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect, (xhr, status, error) =>{
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
    });
    
    return false;
};

// LoginWindow to be rendered
const LoginWindow = (props) => {
    return (
    <div id="content">
        <img id="hut" src="/assets/img/hut_orig.png" alt="Hut" />
        <form id="loginForm" name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="mainForm"
        >
        <label htmlFor="username">Username: </label>
        <input id="user" type="text" name="username" placeholder="username"/>
        <label htmlFor="pass">Password: </label>
        <input id="pass" type="password" name ="pass" placeholder="password"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit" type="submit" value="Sign In"/>
        
        </form>
    </div>
    );
};

// SignupWindow to be rendered
const SignupWindow = (props) => {
    return (
    <div id="content">
        <img id="hut" src="/assets/img/hut_orig.png" alt="Hut" />
        <form id="signupForm" 
            name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
        >
        <label htmlFor="username">Username: </label>
        <input id="user" type="text" name="username" placeholder="username"/>
        <label htmlFor="pass">Password: </label>
        <input id="pass" type="password" name ="pass" placeholder="password"/>
        <label htmlFor="pass2">Password: </label>
        <input id="pass2" type="password" name ="pass2" placeholder="retype password"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit" type="submit" value="Sign Up"/>
        
        </form>
    </div>
    );
};

// modify current-page and render loginwindow
const createLoginWindow = (csrf) => {
    $("#loginButton").attr('class', 'current-page');
    $("#signupButton").attr('class', '');
    ReactDOM.render(
        <LoginWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

// modify current-page and render signupwindow
const createSignupWindow = (csrf) => {
    $("#loginButton").attr('class', '');
    $("#signupButton").attr('class', 'current-page');
    ReactDOM.render(
        <SignupWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

// add event listeners to buttons to have them create the correct window
const setup = (csrf) => {
    const loginButton = document.querySelector("#loginButton");
    const signupButton = document.querySelector("#signupButton");
    
    signupButton.addEventListener("click", (e) => {
        e.preventDefault();
        createSignupWindow(csrf);
        return false;
    });
    
    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        createLoginWindow(csrf);
        return false;
    });
    
    createLoginWindow(csrf);
};

// get csrf token
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});