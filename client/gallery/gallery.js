const ytWidth = 430;
const ytHeight = 242;

let numClips = 0;
let favesOnly = false;

//Format date for use in displaying on the clip
const formatDate = (date) => {
    // save a new date based on UTC date
    const localDate = new Date(date);
    
    // create variables to modify for 12-hour clock
    let hour = 0;
    let amPm = "AM";
    
    // 12-hour clock check
    if(localDate.getHours() + 1 > 12) {
        hour = localDate.getHours() - 12;
        amPm = "PM";
    }
    
    // create variables for modifying minutes/seconds
    let minute = localDate.getMinutes();
    let second = localDate.getSeconds();
    
    if(minute < 10) {
        minute = "0" + minute;
    }
    
    if(second < 10) {
        second = "0" + second;
    }
    
    // create a new string based on localDate data and 12-hour clock modifications
    let newDate = (localDate.getMonth() + 1) + "/" + localDate.getDate() + "/" + localDate.getFullYear() + " ";      // date
    newDate += hour + ":" + minute + ":" + second + " " + amPm;                         // time
    return newDate;
};

//Show the clips in the gallery
const showClips = (csrf) =>{
    
    // get account data so the username and favorites can be passed in
    sendAjax('GET', '/getMyAccount', null, (accdata) => {
        // Retrieving the clips
        sendAjax('GET', '/getClips', null, (clipdata) => {
            ReactDOM.render(<ClipList clips={clipdata.clips} userfaves={accdata.account.favorites} user={accdata.account.username} csrf={csrf} use="gallery" />, document.querySelector("#clips"));
        },
        (xhr, status, error) =>{
            var messageObj = JSON.parse(xhr.responseText);
            showMessage(messageObj.error);
        });
    },
    (xhr, status, error) =>{
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
    });
};

//Show the playlists on the playlists page
const showPlaylists = (csrf) =>{
    // get account data so the username can be used
    sendAjax('GET', '/getMyAccount', null, (accdata) => {
        // Retrieving the playlists so they can be shown
        sendAjax('GET', '/getPlaylists', null, (playlistData) => {
            ReactDOM.render(<PlaylistList playlists={playlistData.playlists} listCount={accdata.account.numPlaylists} user={accdata.account.username} csrf={csrf}  />, document.querySelector("#playlists"));
        },
        (xhr, status, error) =>{
            var messageObj = JSON.parse(xhr.responseText);
            showMessage(messageObj.error);
        });
    },
    (xhr, status, error) =>{
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
    });
}

//Showing the page to create a playlist for the first time, no clip 
const showCreatePlaylist = (csrf) =>{
    ReactDOM.render(<PlaylistForm csrf={csrf} />, document.querySelector("#playlists"));
};

//Used to display a specific playlist
const displayPlaylist = (e) =>{
    e.preventDefault();

    //Temporary variable to be used
    let curList = e.target.listID.value;
    // get account data so the username and favorites can be passed in
    sendAjax('GET', '/getMyAccount', null, (accdata) => {
        // Retrieving the clips so they can be displayed
        sendAjax('GET', '/getClips', null, (clipdata) => {
            //Retrieving the playlists to be used in displaying the correct clips
            sendAjax('GET', '/getPlaylists', null, (playlistData) => {
                ReactDOM.render(<ClipList clips={clipdata.clips} userfaves={accdata.account.favorites} user={accdata.account.username} userPlaylists={accdata.account.savedPlaylists} currentList={curList} playlists={playlistData.playlists} use="playlist" />, document.querySelector("#playlists"));
            },
            (xhr, status, error) =>{
                var messageObj = JSON.parse(xhr.responseText);
                showMessage(messageObj.error);
            });
        },
        (xhr, status, error) =>{
            var messageObj = JSON.parse(xhr.responseText);
            showMessage(messageObj.error);
        });
    },
    (xhr, status, error) =>{
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
    });
}

//Displaying the area which allows the user to add or remove a clip from a playlist
const showAddPlaylist = (e) =>{
    e.preventDefault();
    
    //Temporary variables to be used later
    let csrf = e.target._csrf.value;
    let id = e.target.clipID.value;
    // get account data so the username can be used 
    sendAjax('GET', '/getMyAccount', null, (accdata) => {
        // Getting the clips to be checked against
        sendAjax('GET', '/getClips', null, (clipdata) => {
            //Getting the playlists so they can be added to
            sendAjax('GET', '/getPlaylists', null, (playlistData) => {
                ReactDOM.render(<PlaylistAddDisplay playlists={playlistData.playlists} csrf={csrf} clipID={id} user={accdata.account.username} clips={clipdata.clips} />, document.querySelector("#clips"));
                document.querySelector("#search").innerHTML = "";
            },
            (xhr, status, error) =>{
                var messageObj = JSON.parse(xhr.responseText);
                showMessage(messageObj.error);
            });
        },
        (xhr, status, error) =>{
            var messageObj = JSON.parse(xhr.responseText);
            showMessage(messageObj.error);
        });

    },
    (xhr, status, error) =>{
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
    });
};

//Creating a new playlist
const createPlaylist = (e) =>{
    e.preventDefault();
    $("#terryMessage").animate({width:'hide'}, 350);

    //Making sure the fields are filled out
    if($("#clipTitle").val() == '') {
        showMessage("Hey! Make sure you fill out all the fields!");
        return false;
    }
    let csrf = e.target._csrf.value;

    //Sending the request to add the playlist
    sendAjax('POST', $("#createForm").attr("action"), $("#createForm").serialize(), (result)=>{showMessage(result.message);
        setup(csrf);}, 
    (xhr, status, error) =>{var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);});
}
//Adding a clip to a playlist
const addToPlaylist = (e) =>{
    e.preventDefault();

    //Storing temporary values to be changed and sent
    let playlistValue = $("#playlistDropList").val();
    let title = e.target.title;
    let playlistid = e.target.playlistID;
    let csrf = e.target._csrf.value;

    //If a new playlist is not going to be created
    if(playlistValue !== 'newList')
    {
        //Changing the value that is going to be sent
        title.value = playlistValue;
        //Getting the account to get the id of the playlist selected
        sendAjax('GET', '/getMyAccount', null, (accdata) => {

            //Looping through the saved playlists on the account to check which playlist is being sent
            for (let i = 0; i < accdata.account.savedPlaylists.length; i++) 
            {
                //If the title of the playlist is the same as the current one, save the ID
                if(accdata.account.savedPlaylists[i].title = playlistValue)
                    playlistid.value = accdata.account.savedPlaylists[i].id;
            }
            //Send the request
            sendAjax('POST', '/addToPlaylist', $("#submitAddPlaylist").serialize(), (result) => {
                showMessage(result.message)
                setup(csrf);
            },
            (xhr, status, error) =>{
                var messageObj = JSON.parse(xhr.responseText);
                showMessage(messageObj.error);
            });
        },
        (xhr, status, error) =>{
            var messageObj = JSON.parse(xhr.responseText);
            showMessage(messageObj.error);
        });
    
    }
    //If a new playlist is being created, render the page for it
    else
    {
        ReactDOM.render(<PlaylistForm csrf={e.target._csrf.value} clipID={e.target.clipID.value} />,document.querySelector("#clips"));
    }
};

//Removing a clip from a playlist
const removeFromPlaylist = (e) =>{
    e.preventDefault();

    //Temporary variables to be changed and sent
    let playlistValue = $("#playlistDropList").val();
    let title = e.target.title;
    let playlistid = e.target.playlistID;
    let csrf = e.target._csrf.value;
    title.value = playlistValue;

    //Getting the account to check for the specific playlist
    sendAjax('GET', '/getMyAccount', null, (accdata) => {
        for (let i = 0; i < accdata.account.savedPlaylists.length; i++) 
        {
            if(accdata.account.savedPlaylists[i].title = playlistValue)
                playlistid.value = accdata.account.savedPlaylists[i].id;
        }
        sendAjax('POST', '/removeFromPlaylist', $("#submitRemPlaylist").serialize(), (result) => {
            showMessage(result.message)
            setup(csrf);
        },
        (xhr, status, error) =>{
            var messageObj = JSON.parse(xhr.responseText);
            showMessage(messageObj.error);
        });
    },
    (xhr, status, error) =>{
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
    });
};

// Form for creating a new playlist
const PlaylistForm = function(props)
{
    checkPremium();
    
    if(!props.clipID)
    {
        return(
            <div className="content-box">
                <form id="backForm" onSubmit={showAddPlaylist} name="backForm">
                    <input type="hidden" name="_csrf" value={props.csrf}/>
                    <input className="back pointer" type="submit" value="Go back"/>
                </form>
                
                <form id="createForm" onSubmit={createPlaylist} name="createForm" action="/createPlaylist" method="POST" classname="createForm">
                    <h3 id="requiredHeader">Name your new playlist: </h3>
                    
                    <div className="input-item">
                        <input id="clipTitle" type="text" name="title" placeholder="Playlist Title"/><br />
                        <label className="input-label" htmlFor="title">Playlist Title: </label>
                    </div>
                    
                    <input type="hidden" name="_csrf" value={props.csrf}/>
                    <input className="formSubmit" type="submit" value="Submit Clip"/>
                </form>
            </div>
        );
    }
    else
    {
        return(
            <div className="content-box">
                <form id="backForm" onSubmit={showAddPlaylist} name="backForm">
                    <input type="hidden" name="_csrf" value={props.csrf}/>
                    <input type="hidden" name="clipID" value={props.clipID} />
                    <input className="back pointer" type="submit" value="Go back"/>
                </form>
                
                <form id="createForm" onSubmit={createPlaylist} name="createForm" action="/createPlaylist" method="POST" classname="createForm">
                    <h3 id="requiredHeader">Name your new playlist: </h3>
                    
                    <div className="input-item">
                        <input id="clipTitle" type="text" name="title" placeholder="Playlist Title"/><br />
                        <label className="input-label" htmlFor="title">Playlist Title: </label>
                    </div>
                    
                    <input type="hidden" name="clipID" value={props.clipID} />
                    <input type="hidden" name="_csrf" value={props.csrf}/>
                    <input className="formSubmit" type="submit" value="Submit Clip"/>
                </form>
            </div>
        );
    }
}

// List of playlists
const PlaylistList = function(props)
{
    checkPremium();
    
    //If there are no playlists on the user's account, display that there are none
    if(props.listCount === 0)
    {
        return(
            <div className="loader-container">
                <h3>No playlists found!</h3>
                <button onClick={() => showCreatePlaylist(props.csrf)}>Make one now!</button>
            </div>
        )
    }
    //Variable to increment the number of playlists being shown
    let playlistCount = 0; 

    //Making elements to show the playlists
    const listNodes =  props.playlists.map(function(list){
        //Making sure that the playlist is made by the current user
        let userCheck = false;
        if(props.user === list.creatorUN)
            userCheck = true;
        
        if(userCheck)
        {   playlistCount++;
            return(
            <div className="playlist">
                <h4 className="playlist-title"><u>{list.title}</u></h4>
                <h3 classname="playlistClipCount">Number of clips: {list.numEntries}</h3>
                <form id={"showList" + playlistCount} onSubmit={displayPlaylist} name="showList" className="showList">
                    <input type="hidden" name="_csrf" value={props.csrf}/>
                    <input name="listID" type="hidden" value={list.id}/>
                    <input className="formSubmit" type="submit" value="Go to Playlist"/>
                </form>
            </div>
            )
            
        }
    })
    return(
        <div className="playlistList">
            {listNodes}
        </div>
    );
}

// Displaying the ability to add or remove a clip from playlists
const PlaylistAddDisplay = function(props)
{
    //Storing the current playlists from a clip
    let thisClipPlaylists;
    // Finding the current clip's list of playlists
    for (let i = 0; i < props.clips.length; i++) 
    {
        if(props.clips[i].id === props.clipID)
            thisClipPlaylists = props.clips[i].inPlaylists;    
    }

    //Getting the options for playlists to be added to
    //Cannot be ones that it is already in
    const listAddNodes = props.playlists.map(function(list)
    {
        let showLists = true;
        if(thisClipPlaylists.length !== 0)
        {
            //Checking if the current clip is in the array of playlists the clip is in
            for (let i = 0; i < thisClipPlaylists.length; i++) 
            {
                if(thisClipPlaylists[i] === list.id)
                    if(list.creatorUN === props.user)
                        showLists = false;
            }
        }
       
        if(showLists)
            return(<option value={list.title}>{list.title}</option>)
    });

    //Setting up the list of playlists that can be rmeoved
    let listRemNodes = "";

    if(thisClipPlaylists.length !== 0)
    {
        //Getting options to be removed from
        //Will only show up if the clip is in any playlists
        listRemNodes = props.playlists.map(function(list)
        {
            for (let i = 0; i < thisClipPlaylists.length; i++) 
            {
                if(thisClipPlaylists[i] === list.id)
                    if(list.creatorUN === props.user)
                        return(<option value={list.title}>{list.title}</option>)
            }
        });
    }
    let playlistAddDrop = 
    <div className="content-box">
        <div className="input-item">
            <select id="playlistDropList">
                <option value="newList">Create new Playlist</option>
                {listAddNodes}
            </select>
            <label className="input-label" htmlFor="playlistDropList">Select Playlist to Add to: </label>
        </div>        
        
        <form id="submitAddPlaylist" onSubmit={addToPlaylist} name="playAddForm">
            <input type="hidden" name="_csrf" value={props.csrf}/>
            <input name="clipID" type="hidden" value={props.clipID}/>
            <input name="title" type="hidden" value=""/>
            <input name="playlistID" type="hidden" value=""/>
            <input className="formSubmit" type="submit" value="Add to Playlist" />
        </form>
    </div>;
    let playlistRemDrop = "";
    if(listRemNodes != "")
    {
        playlistRemDrop =
        <div className="content-box">
            <div className="input-item">
                <select id="playlistDropList">
                    {listRemNodes}
                </select>
                <label className="input-label" htmlFor="playlistDropList">Select Playlist to Remove from: </label>
            </div>
        
            <form id="submitRemPlaylist" onSubmit={removeFromPlaylist} name="playRemForm">
                <input type="hidden" name="_csrf" value={props.csrf}/>
                <input name="clipID" type="hidden" value={props.clipID}/>
                <input name="title" type="hidden" value=""/>
                <input name="playlistID" type="hidden" value=""/>
                <input className="formSubmit" type="submit" value="Remove from Playlist" />
            </form>
        </div>;
    }

    return(
        <div id="playlistAdd">
            {playlistAddDrop}
            {playlistRemDrop}
        </div>
    )
}

const ClipList = function(props) 
{
    numClips = 0;
    let thisList;
    checkPremium();
    props.userfaves = remDeletedFavorites(props.clips, props.userfaves);
    // Getting the values from the input fields
    let userSearch = $("#userSearch").val();
    let gameSearch = $("#gameSearch").val();
    let charSearch = $("#charSearch").val();


    if(props.use === "gallery")
    {
        // If no clip have been made, show error
        if(props.clips.length === 0 || (props.userfaves.length === 0 && favesOnly === true))
        {
            return(
                <div className="loader-container">
                    <h3>No clips found!</h3>
                </div>
            )
        }
        
        // Trimming the values
        if(userSearch !== '')
        {
            userSearch = userSearch.trim();
        }
        if(gameSearch !== '')
        {
            gameSearch = gameSearch.toLowerCase();
            gameSearch = gameSearch.trim();
        }
        if(charSearch !== '')
        {
            // Make the character search into an array, split on commas
            charSearch = charSearch.split(',');

            // Trimming and making them lowercase
            for (let index = 0; index < charSearch.length; index++) 
            {
                charSearch[index] = charSearch[index].trim();
                charSearch[index] = charSearch[index].toLowerCase();
            }
        }
        
        let searchParams = $("#sortList").val();
        if(searchParams == 'newest')
        {
            //https://stackoverflow.com/questions/10123953/how-to-sort-an-array-by-a-date-property
            props.clips.sort(function(a,b){
                return new Date(b.postDate) - new Date(a.postDate);
            })
        }
        else if(searchParams == 'alphabeticalDown')
        {
            //https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
            props.clips.sort(function(a,b){
                if(a.title < b.title) { return -1; }
                if(a.title > b.title) { return 1; }
                return 0;
            })
        }
        else if(searchParams == 'alphabeticalUp')
        {
            //https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
            props.clips.sort(function(a,b){
                if(a.title < b.title) { return 1; }
                if(a.title > b.title) { return -1; }
                return 0;
            })
        }
        else if(searchParams == 'faveDown')
        {
            //Code for sorting taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            props.clips.sort(function(a,b) {return b.numFavorites-a.numFavorites});
        }
        else if(searchParams == 'faveUp')
        {
            //Code for sorting taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            props.clips.sort(function(a,b) {return a.numFavorites-b.numFavorites});
        }
    }
    //If showing the playlist, load in other things
    else
    {
        //Find what the current plaulist is based on id
        for (let i = 0; i < props.playlists.length; i++) 
        {
            if(props.playlists[i].id == props.currentList)
                thisList = props.playlists[i];
        }
        //If there are no clips in the playlist, don't show anything
        if(thisList.clips.length === 0)
        {
            return(
                <div className="loader-container">
                    <h3>Playlist is empty!</h3>
                </div>
            )
        }
    }
    
    // set faveStatus of all the clips
    for(let i = 0; i < props.userfaves.length; i++) {
        for(let j = 0; j < props.clips.length; j++) {
            if(props.userfaves[i] === props.clips[j].id) {
                props.clips[j].faveStatus = true;
                break;
            }
        }
    }
    
    // set current user to the active user
    for(let i = 0; i < props.clips.length; i++) {
        props.clips[i].currUser = props.user;
    }

    // Displaying each clip
    const clipNodes = props.clips.map(function(clip){

        // Checks to see if a clip should be posted based on search parameters 
        let userCheck = true;
        let gameCheck = true;
        let charCheck = true;
        let playlistCheck = false;

        if(props.use === 'gallery')
        {

            // Check if the search field is empty
            // If not empty, check against the search parameter
            if(userSearch !== '' && userSearch !== clip.creatorUN)
                userCheck = false;
            
            if(gameSearch !== '' && gameSearch !== clip.game.toLowerCase())
                gameCheck = false;

            if(charSearch !== '')
            {
                // Looping through the character search index to see if one of the characters matches the search term
                for (let index = 0; index < charSearch.length; index++) 
                {
                    let notFirst = true;
                    if(clip.character1 !== '')
                        if(charSearch[index] === clip.character1.toLowerCase())
                            notFirst = false;
                    
                    let notSecond = true;
                    if(clip.character2 !== '')
                        if(charSearch[index] === clip.character2.toLowerCase())
                            notFirst = false;

                    if(notFirst && notSecond)
                        charCheck = false;
                }
            }
        }
        else
        {
            for (let i = 0; i < thisList.clips.length; i++) {
                if(thisList.clips[i] === clip.id)
                    playlistCheck = true;
            }
        }

        let clipCheck = false;
        if(props.use === 'gallery')
        {

            if(userCheck && gameCheck && charCheck) {
                clipCheck = true;
            
            // increment numclips for every clip so every fav/rem/delete form has a unique ID
            numClips++;
            }
        }
        else
        {
            if(playlistCheck)
                clipCheck = true;
        }

        // If all the checks pass, display that clip
        if(clipCheck)
        {
            if(clip.creatorUN === clip.currUser) {
                if(clip.creatorPremStatus) {
                    if(clip.character1 !== '') {
                        if(clip.character2 !== '') {
                            if(clip.faveStatus === true) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else if(favesOnly === false) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                        </form>
                                    </div>
                                );
                            }
                        } else {
                            if(clip.faveStatus === true) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else if(favesOnly === false) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                        </form>
                                    </div>
                                );
                            }
                        }
                    } else if (clip.character2 !== ''){
                        if(clip.faveStatus === true) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else if(favesOnly === false) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                    </form>
                                </div>
                            );
                        }
                    } else {
                        if(clip.faveStatus === true) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="id" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else if(favesOnly === false) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="id" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                    </form>
                                </div>
                            );
                        }
                    }
                }
                else
                {
                    if(clip.character1 !== '') {
                        if(clip.character2 !== '') {
                            if(clip.faveStatus === true) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN}</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else if(favesOnly === false) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN}</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                        </form>
                                    </div>
                                );
                            }
                        } else {
                            if(clip.faveStatus === true) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN}</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else if(favesOnly === false) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN}</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                        </form>
                                    </div>
                                );
                            }
                        }
                    } else if (clip.character2 !== ''){
                        if(clip.faveStatus === true) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN}</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else if(favesOnly === false) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN}</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                    </form>
                                </div>
                            );
                        }
                    } else {
                        if(clip.faveStatus === true) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN}</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else if(favesOnly === false) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN}</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                    </form>
                                </div>
                            );
                        }
                    }
                }
            } else {
                if(clip.creatorPremStatus)
                {
                    if(clip.character1 !== '') {
                        if(clip.character2 !== '') {
                            if(clip.faveStatus === true) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else if(favesOnly === false) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                        </form>
                                    </div>
                                );
                            }
                        } else {
                            if(clip.faveStatus === true) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else if(favesOnly === false) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                        </form>
                                    </div>
                                );
                            }
                        }
                    } else if (clip.character2 !== ''){
                        if(clip.faveStatus === true) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else if(favesOnly === false) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                    </form>
                                </div>
                            );
                        }
                    } else {
                        if(clip.faveStatus === true) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else if(favesOnly === false) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN} ⭐</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                    </form>
                                </div>
                            );
                        }
                    }
                }
                else
                {
                    if(clip.character1 !== '') {
                        if(clip.character2 !== '') {
                            if(clip.faveStatus === true) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN}</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else if(favesOnly === false) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN}</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                        </form>
                                    </div>
                                );
                            }
                        } else {
                            if(clip.faveStatus === true) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN}</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else if(favesOnly === false) {
                                return(
                                    <div className="clip">
                                        <h4 className="clip-title"><u>{clip.title}</u>
                                            <span className="creator">Creator: {clip.creatorUN}</span>
                                        </h4>
                                        <p className="game"><b>Game:</b> {clip.game}</p>
                                        <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                        <p className="description"><b>Description:</b> {clip.description}</p>
                                        <p className="char1"><b>Character 1:</b> {clip.character1}</p>
                                        <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                        <iframe 
                                            width={ytWidth} 
                                            height={ytHeight} 
                                            src={clip.youtube} 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            >
                                        </iframe>
                                        <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                        </form>
                                    </div>
                                );
                            }
                        }
                    } else if (clip.character2 !== ''){
                        if(clip.faveStatus === true) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN}</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else if(favesOnly === false) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN}</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="char2"><b>Character 2:</b> {clip.character2}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                    </form>
                                </div>
                            );
                        }
                    } else {
                        if(clip.faveStatus === true) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN}</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else if(favesOnly === false) {
                            return(
                                <div className="clip">
                                    <h4 className="clip-title"><u>{clip.title}</u>
                                        <span className="creator">Creator: {clip.creatorUN}</span>
                                    </h4>
                                    <p className="game"><b>Game:</b> {clip.game}</p>
                                    <p className="game"><b>Number of Favorites:</b> {clip.numFavorites}</p>
                                    <p className="description"><b>Description:</b> {clip.description}</p>
                                    <p className="post-date"><b>Posted:</b> {formatDate(clip.postDate)}</p>
                                    <iframe 
                                        width={ytWidth} 
                                        height={ytHeight} 
                                        src={clip.youtube} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        >
                                    </iframe>
                                    <form id={"playAddForm" + numClips} onSubmit={showAddPlaylist} name="playAddForm" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add to/Remove from Playlist"><i className="fas fa-list-ul playlist-icon"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <button className="fa-button" type="submit" title="Add Favorite"><i className="fas fa-heart fave"></i></button>
                                    </form>
                                </div>
                            );
                        }
                    }
                }

            }
        }
    });
    
    if(numClips === 0) {
        return(
            <div className="clipList">
                <h3 className="no-clips">No clips found!</h3>
            </div>
        );
    }
    
    return(
        <div className="clipList">
            {clipNodes}
        </div>
    );
};


const SearchBar = function(props)
{
    return(
        <div>
            <div id="gallery-button-container">
                <button type="button" className="fa-button" onClick={toggleSearch} title="Toggle Search"><i className="fas fa-search"></i></button>
                <button type="button" className="fa-button" onClick={() => toggleFavorites(props.csrf)} title="Toggle Favorites"><i className="fas fa-heart fave"></i></button>
            </div>
            
            <div className="collapse" id="searchCollapse">
                <div id="search" className="content-box">
                    <h5>Search: </h5>
                    
                    <div className="input-item">
                        <input id="userSearch" type="text" name="userSearch" placeholder="MKLeo" /><br />
                        <label className="input-label" htmlFor="userSearch">User: </label>
                    </div>
                    
                    <div className="input-item">
                        <input id="gameSearch" type="text" name="gameSearch" placeholder="Super Smash Bros. Ultimate" /><br />
                        <label className="input-label" htmlFor="gameSearch">Game: </label>
                    </div>
                    
                    <div className="input-item">
                        <input id="charSearch" type="text" name="charSearch" placeholder="Marth, Zelda" />
                        <label className="input-label help" title="Seperate characters by commas!" htmlFor="charSearch">Characters: </label>
                    </div>
                    
                    <div className="input-item">
                        <select id="sortList">
                            <option value="oldest">Oldest First</option>
                            <option value="newest">Newest First</option>
                            <option value="alphabeticalDown">Alphabetical (A-Z)</option>
                            <option value="alphabeticalUp">Alphabetical (Z-A)</option>
                            <option value="faveDown">Number of Favorites (Highest first)</option>
                            <option value="faveUp">Number of Favorites (Lowest first)</option>
                        </select>
                        <label className="input-label" htmlFor="sortList">Order By: </label>
                    </div>

                    <button className="formSubmit" onClick={() => showClips(props.csrf)}>Search</button>     
            
                </div>
            </div>
        </div>
    );
}

// remove deleted clips from favorites
const remDeletedFavorites = (clips, userfaves) => {
    // empty array to store indexes
    let indexesToDelete = [];
    
    // loop through user favorites
    for(let i = 0; i < userfaves.length; i++) {
        // create a new doesExist every loop
        let doesExist = false;
        
        // loop through clips, if doesExist = true, break out of loop
        for(let j = 0; j < clips.length; j++) {
            if(userfaves[i] === clips[j].id) {
                doesExist = true;
                break;
            }
        }
        
        // if doesExist = false, add index to indexesToDelete
        if (doesExist === false) {
            indexesToDelete.unshift(i);
        }
    }
    
    // loop through indexesToDelete if it has a length of 1+ and remove ids from userFaves
    if(indexesToDelete.length > 0) {
        for(let i = 0; i < indexesToDelete.length; i++) {
            userfaves.splice(indexesToDelete[i], 1);
        }
    }
    
    // return userfaves
    return userfaves;
};

// toggle if the user is viewing only their favorites
const toggleFavorites = (csrf) => {
    // change favesOnly
    favesOnly = !favesOnly;
    
    // show a message
    if(favesOnly === true) {
        showMessage("Now showing only favorited clips! Okay!", "good");
    } else {
        showMessage("Hey! Now showing all clips!", "good");
    }
    
    // show clips
    showClips(csrf);
};

// toggling in-line doesn't work, so this is required
const toggleSearch = (e) => {
    $("#searchCollapse").collapse('toggle'); // toggles the search box
};

// check for issues with post; send ajax request if everything is all good
const makePost = (e) =>{
    e.preventDefault();
    $("#terryMessage").animate({width:'hide'}, 350);
    
    // create variables to make this slightly more readable
    const id = "#" + e.target.id;
    const csrf = `${e.target._csrf.value}`;

    // e.target.id will be the ID of the form that called makePost in the first place
    sendAjax('POST', $(id).attr("action"), $(id).serialize(), (result) => {
        showMessage(result.message);
        showClips(csrf);
    }, 
    (xhr, status, error) =>{
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
    });
    

    return false;
};

const setup = (csrf) => {   
    let searchCheck = document.querySelector("#search");
    if(searchCheck != null)
    {
        showClips(csrf);
        ReactDOM.render(<SearchBar csrf={csrf} />, document.querySelector("#search"));
    }
    else
    {
        showPlaylists(csrf);
    }
};

// get csrf token
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function(props) {
    getToken();
});