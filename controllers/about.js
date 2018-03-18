/**************************************************************************
 * Description of the Product and Instructions of Use.
 *  Contains product usage, company info, Links for Education (Learn More),
 *   and Report a Problem section.
 **************************************************************************/

function openDialog() {
  var html = HtmlService.createTemplateFromFile('views/about')
    .evaluate();
  SlidesApp.getUi()
    .showModalDialog(html, 'About Captivate-AI');
}