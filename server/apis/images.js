/**
 * Search for images via Google Custom Search API
 *   Consult https://developers.google.com/custom-search/json-api/v1/reference/cse/list#parameters
 *   for more documentation.
 *   Also, see https://cse.google.com/cse/all to setup custom search engine.
 */
function searchImages(query) {
  // To analyze entities in a document, make a POST request 
  // to the documents:analyzeEntities REST method and provide the appropriate request body
  var apiKey = 'AIzaSyANcMB3Js2TF0sxrBfB1q0i4qr_BNF2wpw';
  var cx = '011637484580602688820:y07erb4vrt0';
  var requestUrl = 
    'https://www.googleapis.com/customsearch/v1?key=' + apiKey 
    +'&cx=' + cx + '&q=' + query + '&searchType=image';
  
  // store response from the API
  var response = UrlFetchApp.fetch(requestUrl);
  
  // return JSON of extracted entities
  var json_images = JSON.parse(response);
  
  Logger.log(json_images);
  
  // parse JSON into string topics
  var image_url = extract_images_from(json_images)
  Logger.log(image_url);

  //showSidebar();
  return image_url;
}


/** 
 * Extracts images from a JSON file format and packages them
 * as an element before returning.
 *
 */
function extract_images_from(json_images) {
  var image_url = json_images.items[0].link;
	return image_url;
}
