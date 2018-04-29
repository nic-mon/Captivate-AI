/**********************************************************************
 * Creates the Template Dialog, which houses the generated template
 *     based on the user survey.
 *
 **********************************************************************/

function createTemplate() {
    var html = HtmlService.createTemplateFromFile('views/create_template')
        .evaluate();
    SlidesApp.getUi()
        .showModelessDialog(html, 'A few questions to help you get started');
}
