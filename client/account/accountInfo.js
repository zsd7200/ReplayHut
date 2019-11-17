const passChange = (e) =>{
    e.preventDefault();
    $("#terryMessage").animate({width:'hide'}, 350);

    if( $("#pass").val() == '' || $("#pass2").val() == '' || $("#currentPass").val() == '') {
        showMessage("Hey, make sure you fill out all fields!");
        return false;
    }

    if($("#pass").val() !== $("#pass2").val()) {
        showMessage("Woah, those new passwords don't match!");
        return false;
    }
    

    sendAjax('POST', $("#changePassForm").attr("action"), $("#changePassForm").serialize(),
    (result)=>{
        $("#pass").val() == '';
        $("#pass2").val() == '';
        $("#currentPass").val() == ''; 
        showMessage(result.message);
    }, 
    (xhr, status, error) =>{
        if(error === 'Unauthorized')
        showMessage("Current password is not correct");
    });
    
    return false;
};

const activatePremium = (e) =>{
    e.preventDefault();
    sendAjax('POST', $("#premCardForm").attr("action"), $("#premCardForm").serialize(), (result) => {
        showAccount();
        showMessage(result.message)}
    );
}

const cancelPremium = (e) =>{
    e.preventDefault();

    sendAjax('POST', "/cancelPremium", $("#csrf").serialize(), (result) => {
        showAccount();
        showMessage(result.message)},
    (xhr, status, error) =>{var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);}
    );
}
const showPremium = () =>{
    sendAjax('GET', '/getToken', null, (result) => {
        ReactDOM.render(<PremiumInfo csrf={result.csrfToken} />, document.querySelector("#content"));
    });
};

const showAccount = () =>{
    sendAjax('GET', '/getToken', null, (result) => {
        sendAjax('GET', '/getMyAccount', null, (data) =>{
            ReactDOM.render(<AccountInfo account={data.account} csrf={result.csrfToken} />, document.querySelector("#content"));
        });
    });
};

const showCancelPremium = () =>{
    sendAjax('GET', '/getToken', null, (result) => {
        ReactDOM.render(<CancelPremium csrf={result.csrfToken} />, document.querySelector("#content"));
    });
};

const CancelPremium = function(props) 
{
    return(
        <div classname="content">
            <button oncClick={showAccount}>Go back</button>
            <h1>Woah there!</h1>
            <h2>Are you really sure you want to cancel your premium membership?</h2>
            <h3>If you cancel your subscription, you'll lose:</h3>
            <ul>
                <li>Ad-free browsing</li>
                <li>An icon next to your name across the site</li>
            </ul>
            <h3>If you're really sure, click below to cancel your subscription.</h3>
            <p>(Changes will take effect at the end of your subscription cycle)</p>
            <input type="hidden" name="_csrf" id="csrf" value={props.csrf} />
            <button onClick={cancelPremium}>Cancel Subscription</button>
        </div>
    )
}
const PremiumInfo = function(props)
{
    return(
        <div classname="content">
            <button onClick={showAccount}>Go Back</button>
            <h1> Get Amazarn Prime today!</h1>
            <h3>Benefits of premium:</h3>
            <ul>
                <li>Remove ads</li>
                <li>Get an icon next to your name across the site</li>
                <li>Help us continue providing updates to ReplayHut!</li>
            </ul>
            <h3>If you want to help, get premium for just $3.99 a month!</h3>
            <br />
            <form id="premCardForm" name="premCardForm" onSubmit={activatePremium} action="/activatePremium" method="POST">
                <label htmlFor="name">Name on Card: </label>
                <input id="name" type="text" name="name" placeholder="Name on Card" disabled/>
                <label htmlFor="cardNum">Card Number: </label>
                <input id="cardNum" type="text" name="cardNum" placeholder="Card Number" disabled/>
                <label htmlFor="cvv">Wacky numbers on the back: </label>
                <input id="cvv" type="text" name="cvv" placeholder="CVV" disabled/>
                <input type="hidden" name="_csrf" value={props.csrf} />
                <input className="formSubmit" type="submit" value="Activate Premium"/>
            </form>
        </div>
    )
}

const AccountInfo = function(props)
{
    if(props.account.premiumStatus === false)
    {
        return(
            <div className="content-box">
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
                <br />
                <button onClick={showPremium}>Sign up for Prime!</button>
            </div>
        )
    }
    else
    {
        return(
            <div className="content-box">
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
                <br />
                <button disabled>Sign up for Prime!</button>
                <button onClick={showCancelPremium}>Cancel Premium</button>
            </div>
        )
    }
}

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
$(document).ready(function() {
    //getToken();
    showAccount();
});