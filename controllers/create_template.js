/**********************************************************************
 * Creates the Template Dialog, which houses the generated template
 *     based on the user survey.
 *
 **********************************************************************/

function templateDialog() {
    var html = HtmlService.createTemplateFromFile('views/create_template')
        .evaluate();
    SlidesApp.getUi()
        .showModelessDialog(html, 'Generate Template');
}
