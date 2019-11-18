// NotFoundData to be rendered
const NotFoundData = function(props) {
    checkPremium();
    return (
        <div id="content">
            <img id="hut" src="/assets/img/hut_orig.png" alt="Hut" />
            <div className="content-box center-content">
                <h3>404 - Page Not Found</h3>
            </div>
        </div>
    );
};

// render notfounddata with react
const setup = function(csrf) {   
    ReactDOM.render(
        <NotFoundData csrf={csrf} />, document.querySelector("#content")
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