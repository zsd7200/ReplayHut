//Handles the changing of users passwords
const passChange = (e) =>{
    e.preventDefault();
    
    //Hiding the sidebar message which may have popped up
    $("#terryMessage").animate({width:'hide'}, 350);

    //Error checks
    //Making sure all values are filled in
    if( $("#pass").val() == '' || $("#pass2").val() == '' || $("#currentPass").val() == '') {
        showMessage("Hey, make sure you fill out all fields!");
        return false;
    }

    //Checking if the new passwords match each other
    if($("#pass").val() !== $("#pass2").val()) {
        showMessage("Woah, those new passwords don't match!");
        return false;
    }
    
    //Sending the request to the router to change the password
    sendAjax('POST', $("#changePassForm").attr("action"), $("#changePassForm").serialize(),
    (result)=>{
        //Displaying the results
        showMessage(result.message);
    }, 
    (xhr, status, error) =>{
        //Catching an error in filling out the form
        if(error === 'Unauthorized')
        showMessage("Current password is not correct");
    });
    
    return false;
};

//Used to send a request to activate premium for the user
const activatePremium = (e) =>{
    e.preventDefault();
    sendAjax('POST', $("#premCardForm").attr("action"), $("#premCardForm").serialize(), (result) => {
        //Goes back to the account page upon completion
        showAccount();
        //Writing out a success message
        showMessage(result.message, "good")}
    );
};

//Sending a request to cancel the premium membership
const cancelPremium = (e) =>{
    e.preventDefault();

    sendAjax('POST', "/cancelPremium", $("#csrf").serialize(), (result) => {
        //Returning to the account page
        showAccount();
        
        //Writing out a success message
        showMessage(result.message, "wait")},
    (xhr, status, error) =>{var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);}
    );
}

//Gets a csrf token and then displays the page with information about the premium membership
const showPremium = () =>{
    sendAjax('GET', '/getToken', null, (result) => {
        ReactDOM.render(<PremiumInfo csrf={result.csrfToken} />, document.querySelector("#content"));
    });
};

//Gets a csrf token and then displays the account page
const showAccount = () =>{
    sendAjax('GET', '/getToken', null, (result) => {
        sendAjax('GET', '/getMyAccount', null, (data) =>{
            ReactDOM.render(<AccountInfo account={data.account} csrf={result.csrfToken} />, document.querySelector("#content"));
        });
    });
};

//Gets a csrf token and then displays the page with information about cancelling the premiuum membership
const showCancelPremium = () =>{
    sendAjax('GET', '/getToken', null, (result) => {
        ReactDOM.render(<CancelPremium csrf={result.csrfToken} />, document.querySelector("#content"));
    });
};

//Returns the content for the page regarding cancelling premium
const CancelPremium = function(props) 
{
    return(
        <div className="content-box">
            <button className="back pointer" onClick={showAccount}>Go back</button>
            <div className="center-content">
                <h1>Woah there!</h1>
                <h2>Are you really sure you want to cancel your premium membership?</h2>
            </div><br />
            <h3>If you cancel your subscription, you'll lose:</h3>
            <ul>
                <li>Ad-free browsing</li>
                <li>An icon next to your name across the site</li>
            </ul>
            <h3>If you're really sure, click below to cancel your subscription.</h3>
            <p className="center-content">(Changes will take effect at the end of your subscription cycle)</p>
            <input type="hidden" name="_csrf" id="csrf" value={props.csrf} />
            <button className="formSubmit pointer premium-button" onClick={cancelPremium}>Cancel Subscription</button>
        </div>
    )
};

//Returns the content for the page regarding the premium membership
const PremiumInfo = function(props)
{
    return(
        <div className="content-box">
            <button className="back pointer" onClick={showAccount}>Go Back</button>
            <h1 className="center-content">Get Hut Prime™ today!</h1>
            <br />
            
            <h3>Benefits of Prime:</h3>
            <ul>
                <li>Remove ads</li>
                <li>Get a ⭐ icon next to your name across the site</li>
                <li>Help us continue providing updates to ReplayHut!</li>
            </ul>
            <br />
            <h3>If you want to help, get Prime for only $3.99 a month!</h3>
            <br />
            <form id="premCardForm" name="premCardForm" onSubmit={activatePremium} action="/activatePremium" method="POST">
                <div className="input-item">
                    <input className="fake-input" id="name" type="text" name="name" placeholder="Name on Card" disabled/>
                    <label className="input-label" htmlFor="name">Name on Card: </label>
                </div>
                
                <div className="input-item">
                    <input className="fake-input" id="cardNum" type="text" name="cardNum" placeholder="Card Number" disabled/>
                    <label className="input-label" htmlFor="cardNum">Card Number: </label>
                </div>
                
                <div className="input-item">
                    <input className="fake-input" id="cvv" type="text" name="cvv" placeholder="CVV" disabled/>
                    <label className="input-label help" title='The CVV code is also known as "the wacky numbers on the back".' htmlFor="cvv">CVV: </label>
                </div>
                
                <input type="hidden" name="_csrf" value={props.csrf} />
                <input className="formSubmit premium-button" type="submit" value="Activate Premium"/>
            </form>
        </div>
    )
}

//Returns the page with the account information
const AccountInfo = function(props)
{
    checkPremium();
    if(props.account.premiumStatus === false)
    {
        return(
            <div className="content-box">
                <p></p>
            
                <div className="center-content">
                    <h1>Hello {props.account.username}!</h1>
                    <p>You've made {props.account.createdClips} clips.</p>
                </div>
                <h3>Change Password:</h3>
                <form id="changePassForm" name="changePassForm" onSubmit={passChange} action="/changePassword" method="POST">
                    
                    <div className="input-item">
                        <input id="currentPass" type="password" name ="currentPass" placeholder="Current password"/>
                        <label className="input-label" htmlFor="currentPass">Current Password: </label>
                    </div>
                    
                    <div className="input-item">
                        <input id="pass" type="password" name ="pass" placeholder="New password"/>
                        <label className="input-label" htmlFor="pass">New Password: </label>
                    </div>
                    
                    <div className="input-item">
                        <input id="pass2" type="password" name ="pass2" placeholder="Retype password"/>
                        <label className="input-label" htmlFor="pass2">Retype New Password: </label>
                    </div>
                    
                    <br />
                    
                    <input type="hidden" name="_csrf" value={props.csrf} />
                    <input className="formSubmit" type="submit" value="Change Password"/>
                </form>
                <button className="formSubmit pointer premium-button" onClick={showPremium}>Sign up for Prime!</button>
            </div>
        )
    }
    else
    {
        return(
            <div className="content-box">
                <p id="premium-indicator">⭐ Premium Member</p>
                
                <div className="center-content">
                    <h1>Hello {props.account.username}!</h1>
                    <p>You've made {props.account.createdClips} clips.</p>
                </div>
                <h3>Change Password:</h3>
                <form id="changePassForm" name="changePassForm" onSubmit={passChange} action="/changePassword" method="POST">
                    
                    <div className="input-item">
                        <input id="currentPass" type="password" name ="currentPass" placeholder="Current password"/>
                        <label className="input-label" htmlFor="currentPass">Current Password: </label>
                    </div>
                    
                    <div className="input-item">
                        <input id="pass" type="password" name ="pass" placeholder="New password"/>
                        <label className="input-label" htmlFor="pass">New Password: </label>
                    </div>
                    
                    <div className="input-item">
                        <input id="pass2" type="password" name ="pass2" placeholder="Retype password"/>
                        <label className="input-label" htmlFor="pass2">Retype New Password: </label>
                    </div>
                    
                    <input type="hidden" name="_csrf" value={props.csrf} />
                    <input className="formSubmit" type="submit" value="Change Password"/>
                </form>
                <button className="formSubmit pointer premium-button" onClick={showCancelPremium}>Cancel Premium</button>
            </div>
        )
    }
}

//Showing the account page upon loading
$(document).ready(function() {
    showAccount();
});