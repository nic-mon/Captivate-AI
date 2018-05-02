/**********************************************************************
 * Creates the Brainstorm Dialog, which asks the user to enter
 *     a theme and some bullet points.
 *
 **********************************************************************/

function openBrainstorm() {
    var html = HtmlService.createTemplateFromFile('views/open_brainstorm')
        .evaluate();
    SlidesApp.getUi()
        .showModelessDialog(html, 'What do you plan to talk about?');
}

/*
 * Function to process Form input from the client side
 *  using the start dialog. Then it returns the keywords
 */
function brainstormToKeywords(formObject) {
    Logger.log("In the brainstorm, processing the form.");
    // blob will be encoded as a string
    Logger.log(formObject);
    var formBlob = formObject.brainstorm;
    Logger.log(formBlob);
    // returns keywords
    var keywords = analyzeText(formBlob);
    return keywords;
}
