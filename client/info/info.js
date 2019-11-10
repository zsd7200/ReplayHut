const InfoData = function(props) {
    $("#domoMessage").animate({width:'toggle'}, 350);

    return (    
        <div className="about">
            <h3>DomoMaker</h3>
            <h4>created by <a href="https://github.com/renardchien">renardchien</a> and <a href="https://github.com/AustinWilloughby">AustinWilloughby</a></h4>
            <h5>modified by <a href="https://github.com/zsd7200">Zack Dunham</a> for DomoMaker-E</h5>
        </div>
    );
};

const setup = function(csrf) {   
    ReactDOM.render(
        <InfoData csrf={csrf} />, document.querySelector("#content")
    );
}

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});