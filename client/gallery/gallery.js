const ytWidth = 430;
const ytHeight = 242;

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

const showClips = (csrf) =>{
    // Retrieving the clips
    sendAjax('GET', '/getClips', null, (data) => {
        ReactDOM.render(<ClipList clips={data.clips} csrf={csrf} />, document.querySelector("#clips"));
    },
    (xhr, status, error) =>{
        var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);
    });
};

const ClipList = function(props) 
{
    checkPremium();
    
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
    
    // Displaying each clip
    const clipNodes = props.clips.map(function(clip){
        // Checks to see if a clip should be posted based on search parameters 
        let userCheck = true;
        let gameCheck = true;
        let charCheck = true;

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

        // If all the checks pass, display that clip
        if(userCheck && gameCheck && charCheck)
        {
            if(clip.creatorPremStatus)
            {
                if(clip.character1 !== '') {
                    if(clip.character2 !== '') {
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
                                <form id="favForm" onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="favForm">
                                    <input type="hidden" name="_csrf" value={props.csrf}/>
                                    <input name="title" type="hidden" value={clip.title}/>
                                    <input className="formSubmit" type="submit" value="Add Favorite"/>
                                </form>
                                <form id="delForm" onSubmit={deleteClips} name="delForm" action="/deleteClips" method="POST" className="delForm">
                                    <input type="hidden" name="_csrf" value={props.csrf}/>
                                    <input name="_id" type="hidden" value={clip._id}/>
                                    <input className="formSubmit" type="submit" value="Delete Clip"/>
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
                                <form id="favForm" onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="favForm">
                                    <input type="hidden" name="_csrf" value={props.csrf}/>
                                    <input name="title" type="hidden" value={clip.title}/>
                                    <input className="formSubmit" type="submit" value="Add Favorite"/>
                                </form>
                                <form id="delForm" onSubmit={deleteClips} name="delForm" action="/deleteClips" method="POST" className="delForm">
                                    <input type="hidden" name="_csrf" value={props.csrf}/>
                                    <input name="_id" type="hidden" value={clip._id}/>
                                    <input className="formSubmit" type="submit" value="Delete Clip"/>
                                </form>
                            </div>
                        );
                    }
                } else if (clip.character2 !== ''){
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
                            <form id="favForm" onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="favForm">
                                <input type="hidden" name="_csrf" value={props.csrf}/>
                                <input name="title" type="hidden" value={clip.title}/>
                                <input className="formSubmit" type="submit" value="Add Favorite"/>
                            </form>
                            <form id="delForm" onSubmit={deleteClips} name="delForm" action="/deleteClips" method="POST" className="delForm">
                                    <input type="hidden" name="_csrf" value={props.csrf}/>
                                    <input name="_id" type="hidden" value={clip._id}/>
                                    <input className="formSubmit" type="submit" value="Delete Clip"/>
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
                            <form id="favForm" onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="favForm">
                                <input type="hidden" name="_csrf" value={props.csrf}/>
                                <input name="title" type="hidden" value={clip.title}/>
                                <input className="formSubmit" type="submit" value="Add Favorite"/>
                            </form>
                            <form id="delForm" onSubmit={deleteClips} name="delForm" action="/deleteClips" method="POST" className="delForm">
                                    <input type="hidden" name="_csrf" value={props.csrf}/>
                                    <input name="_id" type="hidden" value={clip._id}/>
                                    <input className="formSubmit" type="submit" value="Delete Clip"/>
                                </form>
                        </div>
                    );
                }
            }
            else
            {
                if(clip.character1 !== '') {
                    if(clip.character2 !== '') {
                        return(
                            <div className="clip">
                                <h4 className="clip-title"><u>{clip.title}</u>
                                    <span className="creator">Creator: {clip.creatorUN}</span>
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
                                <form id="favForm" onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="favForm">
                                    <input type="hidden" name="_csrf" value={props.csrf}/>
                                    <input name="title" type="hidden" value={clip.title}/>
                                    <input className="formSubmit" type="submit" value="Add Favorite"/>
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
                                <form id="favForm" onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="favForm">
                                    <input type="hidden" name="_csrf" value={props.csrf}/>
                                    <input name="title" type="hidden" value={clip.title}/>
                                    <input className="formSubmit" type="submit" value="Add Favorite"/>
                                </form>
                            </div>
                        );
                    }
                } else if (clip.character2 !== ''){
                    return(
                        <div className="clip">
                            <h4 className="clip-title"><u>{clip.title}</u>
                                <span className="creator">Creator: {clip.creatorUN}</span>
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
                            <form id="favForm" onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="favForm">
                                <input type="hidden" name="_csrf" value={props.csrf}/>
                                <input name="title" type="hidden" value={clip.title}/>
                                <input className="formSubmit" type="submit" value="Add Favorite"/>
                            </form>
                            <form id="delForm" onSubmit={deleteClips} name="delForm" action="/deleteClips" method="POST" className="delForm">
                                    <input type="hidden" name="_csrf" value={props.csrf}/>
                                    <input name="_id" type="hidden" value={clip._id}/>
                                    <input className="formSubmit" type="submit" value="Delete Clip"/>
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
                            <form id="favForm" onSubmit={makePost} name="favForm" action="/addFavorite" method="POST" className="favForm">
                                <input type="hidden" name="_csrf" value={props.csrf}/>
                                <input name="title" type="hidden" value={clip.title}/>
                                <input className="formSubmit" type="submit" value="Add Favorite"/>
                            </form>
                            <form id="delForm" onSubmit={deleteClips} name="delForm" action="/deleteClips" method="POST" className="delForm">
                                    <input type="hidden" name="_csrf" value={props.csrf}/>
                                    <input name="_id" type="hidden" value={clip._id}/>
                                    <input className="formSubmit" type="submit" value="Delete Clip"/>
                                </form>
                        </div>
                    );
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

const deleteClips = () =>{
    e.preventDefault();
    $("#terryMessage").animate({width:'hide'}, 350);

    sendAjax('POST', $("#delForm").attr("action"), $("#delForm").serialize(), (result)=>
    {
        showMessage(result.message);
        sendAjax('GET', '/getToken', null, (result) => {
            showClips(result.csrfToken);
        })
    }, 
    (xhr, status, error) =>{var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);});
    

    return false;
};

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

            <button className="formSubmit" onClick={showClips}>Search</button>

            <button className="formSubmit" onClick={deleteClips}>Delete Clip</button>
            
        </div>
    );
}

// check for issues with post; send ajax request if everything is all good
const makePost = (e) =>{
    e.preventDefault();
    $("#terryMessage").animate({width:'hide'}, 350);

    sendAjax('POST', $("#favForm").attr("action"), $("#favForm").serialize(), (result)=>{showMessage(result.message);}, 
    (xhr, status, error) =>{var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);});
    

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