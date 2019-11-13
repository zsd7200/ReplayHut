const ClipList = function(props) 
{
    
    // If no clip have been made, show error
    if(props.clips.length === 0)
    {
        return(
            <div className="clipList">
                <h3 className="noClips">No clips found!</h3>
            </div>
        )
    }
    
    // Displaying each clip
    const clipNodes = props.clips.map(function(clip){
        
        return(
            <div className="clip">
                <h3 className="clip-title">Title: {clip.title}</h3>
                <h5 className="char1">Character 1: {clip.character1}</h5>
                <h5 className="char2">Character 2: {clip.character2}</h5>
                <h5 className="creator">Creator: {clip.creatorUN}</h5>
                <h5 className="description">Description: {clip.description}</h5>
                <h5 className="post-date">Posted: {clip.postDate}</h5>
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
        ReactDOM.render(<ClipList clips={data.clips} />, document.querySelector("#clipList"));
    });
}

$(document).ready(function(){setup();});