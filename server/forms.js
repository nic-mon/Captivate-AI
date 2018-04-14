/* 
 * Function to process Form input from the client side.
 */
function processForm(formObject) {
  Logger.log("I am here!!! Process away!");
  console.log("I am here!!! Process away!");
  var formBlob = formObject.myFile;
  var driveFile = DriveApp.createFile(formBlob);
  return driveFile.getUrl();
}

/* 
 * Function to process Form input from the client side.
 */
// repeated func here, caused errors
// function processBrainstormUsingForm(formObject) {
//   Logger.log("I am here!!! Process away!");
//   console.log("I am here!!! Process away!");
//   // blob will be encoded as a string
//   var formBlob = formObject.brainstorm;
//   var keywords = analyzeText(formBlob);
//   return keywords;
// }