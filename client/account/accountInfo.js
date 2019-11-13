const ListOutAccount = function(props)
{
    return(
        <div classname="accountArea">
            <h1>Hello {props.account.username}!</h1>
            <p>You've made {props.account.createdClips} Clips</p>
            <h3>Change password</h3>
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name ="pass" placeholder="password"/>
            <label htmlFor="pass2">Password: </label>
            <input id="pass2" type="password" name ="pass2" placeholder="retype password"/>
            <br />
            <button>Sign up for Prime!</button>
        </div>
    )
}

const setup = function()
{
    sendAjax('GET', '/getMyAccount', null, (data) =>{
        ReactDOM.render(<ListOutAccount account={data.account} />, document.querySelector("#accountArea"));
    });
}

$(document).ready(function() {
    setup();
});