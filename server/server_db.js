

function store_survey(aud, min, goal, gain, presID) {
    var url = 'http://73.92.201.171/store_survey?aud={}&min={}&goal={}&gain={}&presID={}'.format(aud,min,goal,gain,presID);

    var response = UrlFetchApp.fetch(url);

    return response.getContentText();
}

function get_survey(presID) {
    var url = 'http://73.92.201.171/get_survey?presID={}'.format(presID);

    var response = UrlFetchApp.fetch(url);

    return response.getContentText();
}

function store_brainstorm(word, presID) {
    var url = 'http://73.92.201.171/store_brainstorm?word={}&presID={}'.format(word,presID);

    var response = UrlFetchApp.fetch(url);

    return response.getContentText();
}

function get_brainstorm(presID) {
    var url = 'http://73.92.201.171/get_brainstorm?presID={}'.format(presID);

    var response = UrlFetchApp.fetch(url);

    return response.getContentText();
}