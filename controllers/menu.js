/********************************************************************************
 * Creates the top menu for the Captivate AI App.
 *   It has routes to the sidebar, a brainstorming area, and an about dialog.
 *   
 *   A fourth section asks the user to answer a series of questions. The answers
 *   to those questions get logged in a database and populated in the sidebar.
 ********************************************************************************/


/*
 * Things to do when the user installs the add-on.
 */
function onInstall(e) {
  onOpen(e);
}

/*
 * Creation of the top menu.
 */
function onOpen(e) {
  var ui = SlidesApp.getUi();
    ui.createMenu('Captivate AI')
    .addItem('Start here', 'userSurvey')
    .addSeparator()
    .addItem('In-slide Suggestions', 'showSidebar')
    .addSeparator()
    // .addItem('Brainstorm', 'askQuestions')
    // .addSeparator()
    .addItem('About CaptivateAI', 'openDialog')
    .addSeparator()
    .addItem('Create Template', 'createTemplate')
    .addToUi();
}
