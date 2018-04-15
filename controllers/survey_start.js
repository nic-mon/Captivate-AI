/**********************************************************************
 * Creates the sidebar, which houses central functionality in CapAI.
 *     sends data to the front end. get_data() reads from database
 *
 **********************************************************************/

function userSurvey() {
    var html = HtmlService.createTemplateFromFile('views/survey_start')
        .evaluate();
    SlidesApp.getUi()
        .showModalDialog(html, 'A few questions to help you get started');
}
