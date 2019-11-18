// InfoData to be rendered
const InfoData = function(props) {
    $("#terryMessage").animate({width:'toggle'}, 350);
    checkPremium();
    
    return (    
        <div className="content-box">
            <h3 id="title">Replay Hut</h3>
            <h5>modified by <a href="https://github.com/zsd7200">Zack Dunham</a> and <a href="https://github.com/tam8217">Tristan Marshall</a> from DomoMaker</h5>
        </div>
    );
};

// render infodata with react
const setup = function(csrf) {   
    ReactDOM.render(
        <InfoData csrf={csrf} />, document.querySelector("#content")
    );
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