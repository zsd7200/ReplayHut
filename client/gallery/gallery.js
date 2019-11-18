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

const showClips = () =>{
    // Retrieving the clips
    sendAjax('GET', '/getClips', null, (data) => {
        ReactDOM.render(<ClipList clips={data.clips} />, document.querySelector("#clips"));
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
    let userSearch = $("#userSearch").val();
    let gameSearch = $("#gameSearch").val();
    let charSearch = $("#charSearch").val();

    if(gameSearch !== '')
    {
        gameSearch = gameSearch.toLowerCase();
        gameSearch = gameSearch.trim();
    }
    if(charSearch !== '')
    {
        charSearch = charSearch.split(',');
        for (let index = 0; index < charSearch.length; index++) 
        {
            charSearch[index] = charSearch[index].trim();
            charSearch[index] = charSearch[index].toLowerCase();
        }
    }
    
    // Displaying each clip
    const clipNodes = props.clips.map(function(clip){
        let userCheck = true;
        let gameCheck = true;
        let charCheck = true;

        if(userSearch !== '' && userSearch !== clip.creatorUN)
            userCheck = false;
        
        if(gameSearch !== '' && gameSearch !== clip.game.toLowerCase())
            gameCheck = false;

        if(charSearch !== '')
        {
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
                                </iframe>                    </div>
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
                                </iframe>                    </div>
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
        </div>
    );
}

const setup = function()
{   
    showClips();

    ReactDOM.render(<SearchBar />, document.querySelector("#search"));
}

$(document).ready(function(){setup();});