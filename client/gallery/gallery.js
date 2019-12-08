const ytWidth = 430;
const ytHeight = 242;

let numClips = 0;

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

const showClips = (csrf, e) =>{
    
    sendAjax('GET', '/getMyAccount', null, (accdata) => {
        console.log(accdata);
        // Retrieving the clips
        sendAjax('GET', '/getClips', null, (clipdata) => {
            ReactDOM.render(<ClipList clips={clipdata.clips} userfaves={accdata.account.favorites} user={accdata.account.username} csrf={csrf} />, document.querySelector("#clips"));
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

const ClipList = function(props) 
{
    
    for(let i = 0; i < props.clips.length; i++) {
        props.clips[i].currUser = props.user;
    }
    console.log(props);
    checkPremium();
    numClips = 0;
    // If no clip have been made, show error
    if(props.clips.length === 0)
    {
        return(
            <div className="loader-container">
                <h3>No clips found!</h3>
            </div>
        )
    }
    // Getting the values from the input fields
    let userSearch = $("#userSearch").val();
    let gameSearch = $("#gameSearch").val();
    let charSearch = $("#charSearch").val();

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
    
    
    for(let i = 0; i < props.userfaves.length; i++) {
        for(let j = 0; j < props.clips.length; j++) {
            if(props.userfaves[i] === props.clips[j].id) {
                props.clips[j].faveStatus = true;
                break;
            }
        }
    }

    
    // Displaying each clip
    const clipNodes = props.clips.map(function(clip){
        // Checks to see if a clip should be posted based on search parameters 
        let userCheck = true;
        let gameCheck = true;
        let charCheck = true;
        
        console.log("Title: " + clip.title);
        console.log("Favorite?: " + clip.faveStatus);

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
        
        // increment numclips for every clip so every fav/rem/delete form has a unique ID
        numClips++;

        // If all the checks pass, display that clip
        if(userCheck && gameCheck && charCheck)
        {
            if(clip.creatorUN === clip.currUser) {
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
                                        <form id={"delForm" + numClips} onSubmit={makePost} name="delForm" action="/deleteClips" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else {
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
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
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
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else {
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
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
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
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else {
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
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
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
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else {
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
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
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
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else {
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
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
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
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else {
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
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                        </form>
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
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
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else {
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
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
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
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else {
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
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Delete Clip"><i className="fas fa-trash trash"></i></button>
                                    </form>
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
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
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else {
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
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
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
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else {
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
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
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
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else {
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
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
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
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else {
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
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
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
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else {
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
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
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
                                        <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
                                            <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                        </form>
                                    </div>
                                );
                            } else {
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
                                        <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                            <input type="hidden" name="_csrf" value={props.csrf}/>
                                            <input name="clipID" type="hidden" value={clip.id}/>
                                            <input name="_id" type="hidden" value={clip._id}/>
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
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else {
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
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
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
                                    <form id={"remForm" + numClips} onSubmit={makePost} name="remForm" action="/remFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
                                        <button className="fa-button" type="submit" title="Remove Favorite"><i className="fas fa-heart-broken un-fave"></i></button>
                                    </form>
                                </div>
                            );
                        } else {
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
                                    <form id={"favForm" + numClips} onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="clipForm">
                                        <input type="hidden" name="_csrf" value={props.csrf}/>
                                        <input name="clipID" type="hidden" value={clip.id}/>
                                        <input name="_id" type="hidden" value={clip._id}/>
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
    
    
    return(
        <div className="clipList">
            {clipNodes}
        </div>
    )
}

const SearchBar = function(props)
{
    return(
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
                <input id="charSearch" type="text" name="charSearch" placeholder="marth, zelda" />
                <label className="input-label help" title="Seperate characters by commas!" htmlFor="charSearch">Characters: </label>
            </div>

            <button className="formSubmit" onClick={() => showClips(props.csrf)}>Search</button>     

            <select id="sortList" onChange={() => showClips(props.csrf)}>
                <option value="oldest">Oldest First</option>
                <option value="newest">Newest First</option>
                <option value="alphabeticalDown">Alphabetical (A-Z)</option>
                <option value="alphabeticalUp">Alphabetical (Z-A)</option>
            </select>       
        </div>
    );
}

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
        console.log(xhr);
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
    });
    

    return false;
};

const setup = (csrf) => {   
    showClips(csrf);
    ReactDOM.render(<SearchBar csrf={csrf} />, document.querySelector("#search"));
}

// get csrf token
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});