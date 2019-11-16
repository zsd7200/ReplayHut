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
    

    sendAjax('POST', $("#changePassForm").attr("action"), $("#changePassForm").serialize(),(result)=>{handleError(result.message);}, (xhr, status, error) =>{
        if(error === 'Unauthorized')
            handleError("Current password is not correct");
    });
    
    return false;
};

const ListOutAccount = function(props)
{
    return(
        <div classname="accountArea">
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
            <button>Sign up for Prime!</button>
        </div>
    )
}

const setup = function(csrf)
{
    sendAjax('GET', '/getMyAccount', null, (data) =>{
        ReactDOM.render(<ListOutAccount account={data.account} csrf={csrf} />, document.querySelector("#accountArea"));
    });
}

const getToken = () =>{
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});