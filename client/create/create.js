const makePost = (e) =>{
    e.preventDefault();
    $("#domoMessage").animate({width:'hide'}, 350);
    if($("#clipTitle").val() == '' || $("#clipDesc").val() == '') {
        handleError("Hey! Make sure you fill out all the fields!");
        return false;
    }

    sendAjax('POST', $("#createForm").attr("action"), $("#createForm").serialize());
    

    return false;
};

const CreateForm = (props) =>{
    return(
        <form id="createForm" onSubmit={makePost}name="createForm" action="/createClip" method="POST" classname="createForm">
            <label htmlFor="title">Clip Title: </label>
            <input id="clipTitle" type="text" name="title" placeholder="Clip Title"/>
            <h3 id="charHeader">Characters (optional)</h3>
            <label htmlFor="char1">Character 1: </label>
            <input id="char1" type="text" name ="char1" placeholder="Character 1"/>
            <label htmlFor="char2">Character 2: </label>
            <input id="char2" type="text" name ="char2" placeholder="Character 2"/>
            <label htmlFor="description">Description: </label>
            <input id="clipDesc" type="text" name="description" placeholder="Talk about your clip!"/>
            <input type="hidden" name="_csrf" value={props.csrf}/>
            <input className="clipSubmit" type="submit" value="Submit Clip"/>
        </form>
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