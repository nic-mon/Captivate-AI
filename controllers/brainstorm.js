/**********************************************************************
 * Creates the Brainstorm Dialog, which asks the user to enter
 *     a theme and some bullet points.
 *
 **********************************************************************/

function templateDialog() {
    var html = HtmlService.createTemplateFromFile('views/open_brainstorm')
        .evaluate();
    SlidesApp.getUi()
        .showModelessDialog(html, 'Brainstorm');
}

// function addSlide() {
//     var presentation = SlidesApp.getActivePresentation();
//     presentation.insertSlide(0);
// }