const passChange = (e) =>{
    e.preventDefault();
    $("#domoMessage").animate({width:'hide'}, 350);

    if( $("#pass").val() == '' || $("#pass2").val() == '' || $("#currentPass").val() == '') {
        handleError("Hey, make sure you fill out all fields!");
        return false;
    }

    if($("#pass").val() !== $("#pass2").val()) {
        handleError("Woah, those new passwords don't match!");
        return false;
    }
    

    sendAjax('POST', $("#changePassForm").attr("action"), $("#changePassForm").serialize(),
    (result)=>{
        $("#pass").val() == '';
        $("#pass2").val() == '';
        $("#currentPass").val() == ''; 
        handleError(result.message);
    }, 
    (xhr, status, error) =>{
        if(error === 'Unauthorized')
            handleError("Current password is not correct");
    });
    
    return false;
};

const activatePremium = (e) =>{
    e.preventDefault();
    sendAjax('POST', $("#premCardForm").attr("action"), $("#premCardForm").serialize(), (result) => {
        showAccount();
        handleError(result.message)}
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
}

const PremiumInfo = function(props)
{
    return(
        <div classname="content">
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
            <div classname="content">
                <h1>Hello {props.account.username}!</h1>
                <p>You've made {props.account.createdClips} Clips</p>
                <h3>Change password</h3>
                <form id="changePassForm" name="changePassForm" onSubmit={passChange} action="/changePassword" method="POST">
                    <label htmlFor="currentPass">New Password: </label>
                    <input id="currentPass" type="password" name ="currentPass" placeholder="Current password"/>
                    <label htmlFor="pass">New Password: </label>
                    <input id="pass" type="password" name ="pass" placeholder="New password"/>
                    <label htmlFor="pass2">Retype New Password: </label>
                    <input id="pass2" type="password" name ="pass2" placeholder="Retype password"/>
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
            <div classname="content">
                <h1>Hello {props.account.username}!</h1>
                <p>You've made {props.account.createdClips} Clips</p>
                <h3>Change password</h3>
                <form id="changePassForm" name="changePassForm" onSubmit={passChange} action="/changePassword" method="POST">
                    <label htmlFor="currentPass">New Password: </label>
                    <input id="currentPass" type="password" name ="currentPass" placeholder="Current password"/>
                    <label htmlFor="pass">New Password: </label>
                    <input id="pass" type="password" name ="pass" placeholder="New password"/>
                    <label htmlFor="pass2">Retype New Password: </label>
                    <input id="pass2" type="password" name ="pass2" placeholder="Retype password"/>
                    <input type="hidden" name="_csrf" value={props.csrf} />
                    <input className="formSubmit" type="submit" value="Change Password"/>
                </form>
                <br />
                <button disabled>Sign up for Prime!</button>
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