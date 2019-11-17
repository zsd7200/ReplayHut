const makePost = (e) =>{
    e.preventDefault();
    $("#terryMessage").animate({width:'hide'}, 350);
    if($("#clipTitle").val() == '' || $("#clipDesc").val() == '') {
        showMessage("Hey! Make sure you fill out all the fields!");
        return false;
    }

    sendAjax('POST', $("#createForm").attr("action"), $("#createForm").serialize(), (result)=>{showMessage(result.message);}, 
    (xhr, status, error) =>{var messageObj = JSON.parse(xhr.responseText);
        showMessage(messageObj.error);});
    

    return false;
};

const CreateForm = (props) =>{
    return(
    <div className="content-box">
        <form id="createForm" onSubmit={makePost}name="createForm" action="/createClip" method="POST" classname="createForm">
            <h3 id="requiredHeader">Basic Clip Info (required): </h3>
            
            <div className="input-item">
                <input id="clipTitle" type="text" name="title" placeholder="Clip Title"/><br />
                <label className="input-label" htmlFor="title">Clip Title: </label>
            </div>
            
            <div className="input-item">
                <input id="game" type="text" name="game" placeholder="Dragon Ball: FighterZ"/><br />
                <label className="input-label" htmlFor="game">Game: </label>
            </div>
            
            <div className="input-item">
                <input id="clipDesc" type="text" name="description" placeholder="Talk about your clip!"/><br />
                <label className="input-label" htmlFor="description">Description: </label>
            </div>
            
            <div className="input-item">
                <input id="youtube" type="text" name="youtube" placeholder="https://www.youtube.com/watch?v=lkbhsxLdiM8"/><br />
                <label className="input-label" htmlFor="youtube">YouTube Link: </label>
            </div>

            <h3 id="charHeader">Characters (optional): </h3>
            
            <div className="input-item">
                <input id="char1" type="text" name ="char1" placeholder="Character 1"/><br />
                <label className="input-label" htmlFor="char1">Character 1: </label>
            </div>
            
            <div className="input-item">
                <input id="char2" type="text" name ="char2" placeholder="Character 2"/><br />
                <label className="input-label" htmlFor="char2">Character 2: </label>
            </div>

            <input type="hidden" name="_csrf" value={props.csrf}/>
            <input className="clipSubmit" type="submit" value="Submit Clip"/>
        </form>
    </div>
    );
}

const setup = function(csrf)
{
    ReactDOM.render( <CreateForm csrf={csrf} />, document.querySelector("#createArea"));
}

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});