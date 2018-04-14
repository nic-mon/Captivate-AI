/**
 * Search for images via Google Custom Search API
 *   Consult https://developers.google.com/custom-search/json-api/v1/reference/cse/list#parameters
 *   for more documentation.
 *   Also, see https://cse.google.com/cse/all to setup custom search engine.
 */
function searchImages(query) {
    // To analyze entities in a document, make a POST request
    // to the documents:analyzeEntities REST method and provide the appropriate request body
    Logger.log(query);
    if (query != undefined) {
        var apiKey = 'AIzaSyAD-Q4-s1oCXfxD10ehRBAlbyXhHnEKbHY';
        var cx = '011637484580602688820:y07erb4vrt0';
        var requestUrl =
            'https://www.googleapis.com/customsearch/v1?key=' + apiKey
            + '&cx=' + cx + '&q=' + query + '&searchType=image';

        // store response from the API
        var response = UrlFetchApp.fetch(requestUrl);

        // return JSON of extracted entities
        var json_images = JSON.parse(response);

        Logger.log(json_images);

        // parse JSON into string topics
        var image_url = extract_images_from(json_images);
        Logger.log(image_url);

        //showSidebar();
        return image_url;
    }
    else {
        Logger.log("There were undefined objects found instead of the keyword query." +
            " This is after the NLP API returns.");
    }

}


/**
 * Extracts images from a JSON file format and packages them
 * as an element before returning.
 *
 */
function extract_images_from(json_images) {
    Logger.log(json_images);
    Logger.log("json parsing after image API returns a response");
    //var image_url = json_images.items[0].link;
    if (json_images.items != undefined) {
        var image_url = json_images.items[0].link;
        Logger.log(image_url);
        return image_url;
    }
    else {
        return '';
    }

}