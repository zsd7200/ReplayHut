const UserList = function(props) 
{
    //If no users have been made (Should not happen becuase need to be logged in), show error
    if(props.users.length === 0)
    {
        return(
            <div className="userList">
                <h3 className="noUsers">No users found</h3>
            </div>
        )
    }
    //Code for sorting taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    props.users.sort(function(a,b) {return b.createdClips-a.createdClips});
    
    //Displaying each user
    const userNodes = props.users.map(function(user){
        return(
            <div className="user">
                <h3 className="userName">Username: {user.username}</h3>
                <h3 className="clipsMade">Clips Posted: {user.createdClips}</h3>
            </div>
        );
    });

    return(
        <div className="userList">
            {userNodes}
        </div>
    )
}

const setup = function()
{
    //Retrieving the accounts
    sendAjax('GET', '/getAccounts', null, (data) =>{
        ReactDOM.render(<UserList users={data.users} />, document.querySelector("#userList"));

    },
    (xhr, status, error) =>{
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
    });
}

$(document).ready(function(){setup();});