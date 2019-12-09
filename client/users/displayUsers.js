// UserList to be rendered
const UserList = function(props) 
{
    console.log(props);
    checkPremium();
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
    props.users.sort(function(a,b) {return b.timesFavorited-a.timesFavorited});
    
    //Displaying each user
    const userNodes = props.users.map(function(user){
        if(user.premiumStatus === false) {
            return(
                <div className="user">
                    <h4 className="userName">Username: {user.username}</h4>
                    <h4 className="clipsMade">Clips Posted: {user.createdClips}</h4>
                    <h4 className="timesFavorited">Clip Popularity: {user.timesFavorited} Favorites</h4>
                </div>
            );
        } else {
            return(
                <div className="user">
                    <h4 className="userName">Username: {user.username} <span className="float-right">⭐</span></h4>
                    <h4 className="clipsMade">Clips Posted: {user.createdClips}</h4>
                    <h4 className="timesFavorited">Clip Popularity: {user.timesFavorited} Favorites</h4>
                </div>
            );
        }
    });

    return(
        <div className="content">
        <h2 id="user-leaderboard" className="center-content">Clip Leaderboard</h2>
            <div className="userList">
                {userNodes}
            </div>
        </div>
    )
}

// sendAjax request to render UserList
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