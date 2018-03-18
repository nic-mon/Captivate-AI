/**
 * Analyze the input text via the Google Natural Language API
 *   Consult https://cloud.google.com/natural-language/docs/analyzing-entities#language-entities-string-protocol
 *   for more documentation.
 */
function analyzeText(text) {
  var apiEndpoint = 'documents:analyzeEntities';
  // To analyze entities in a document, make a POST request 
  // to the documents:analyzeEntities REST method and provide the appropriate request body
  var apiKey = 'AIzaSyANcMB3Js2TF0sxrBfB1q0i4qr_BNF2wpw';
  var requestUrl = [
    'https://language.googleapis.com/v1/' + apiEndpoint + '?key=',
    apiKey
  ].join('');
  
  data = {
    "document": {
      "language": "en-us",
      "type": "PLAIN_TEXT",
      "content": text
    },
    "encodingType": "UTF8"
  };
  
  // specific the POST request params
  var options = {
    method: "POST",
    contentType: "application/json",
    payload : JSON.stringify(data)
  };
  
  // store response from the API
  var response = UrlFetchApp.fetch(requestUrl, options);
  
  // return JSON of extracted entities
  var json_topics = JSON.parse(response);
  
  Logger.log(json_topics);
  
  // parse JSON into string topics
  var topics = getEntities(json_topics)
  Logger.log(topics);

  //showSidebar();
  return topics;
}

/**
 * Extract entities from JSON response
 */
function getEntities(json_topics) {
  var entities = json_topics.entities;
  var topics = [];
  for (var i = 0; i < entities.length; i++) {
    topics.push(entities[i].name);
  }
  return topics;
}