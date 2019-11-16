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
    
    // create a new string based on localDate data and 12-hour clock modifications
    let newDate = (localDate.getMonth() + 1) + "/" + localDate.getDate() + "/" + localDate.getFullYear() + " ";      // date
    newDate += hour + ":" + localDate.getMinutes() + ":" + localDate.getSeconds() + " " + amPm;                         // time
    return newDate;
};

const ClipList = function(props) 
{
    
    // If no clip have been made, show error
    if(props.clips.length === 0)
    {
        return(
            <div className="noClips">
                <h3>No clips found!</h3>
            </div>
        )
    }
    
    // Displaying each clip
    const clipNodes = props.clips.map(function(clip){
        return(
            <div className="clip">
                <h3 className="clip-title">Title: {clip.title}
                    <h5 className="creator">Creator: {clip.creatorUN}</h5>
                </h3>
                <h5 className="char1">Character 1: {clip.character1}</h5>
                <h5 className="char2">Character 2: {clip.character2}</h5>
                <h5 className="description">Description: {clip.description}</h5>
                <h5 className="post-date">Posted: {formatDate(clip.postDate)}</h5>
                <iframe width="560" height="315" src={clip.youtube} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        );
    });
    
    return(
        <div className="clipList">
            {clipNodes}
        </div>
    )
}

const setup = function()
{   
    // Retrieving the accounts
    sendAjax('GET', '/getClips', null, (data) => {
        ReactDOM.render(<ClipList clips={data.clips} />, document.querySelector("#clips"));
    });
    (xhr, status, error) =>{
        var messageObj = JSON.parse(xhr.responseText);
        handleError(messageObj.error);
    });
}

$(document).ready(function(){setup();});