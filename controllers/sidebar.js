/**********************************************************************
 * Creates the sidebar, which houses central functionality in CapAI.
 *     sends data to the front end. get_data() reads from database
 *
 **********************************************************************/

function showSidebar() {
  var ui = HtmlService
      .createTemplateFromFile('views/sidebar')
      .evaluate()
      .setTitle('Captivate AI');
  SlidesApp.getUi().showSidebar(ui);
}

/*
 * Brainstorm form submission
 */


/*
 * Function to process Form input from the client side
 *  Has 2 function calls: 1 to NLP API and 1 to Image Search API
 */
function processBrainstormUsingForm(formObject) {
    Logger.log("I am here!!! Process away!");
    // blob will be encoded as a string
    Logger.log(formObject);
    var formBlob = formObject.brainstorm;
    Logger.log(formBlob);
    // returns keywords
    var keywords = analyzeText(formBlob);
    Logger.log(keywords);
    //keywords = ["banana"];
    var urls = [];
    Logger.log("I am here again!!!");
    keywords.forEach(function(query) {
        Logger.log(query);
        var result = searchImages(query);
        urls.push(result);
    });
    Logger.log(urls);
    return urls;
    //return "https://picjumbo.com/wp-content/uploads/fresh-bananas-on-glossy-table-and-red-background_free_stock_photos_picjumbo_DSC08378.jpg";
}


/// my functions below

function doGet(request) {
  var data = get_counts();
  var result = {
    n_words: data[0],
    n_imgs: data[1]
  };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function word_to_img() {
  var slide = SlidesApp.getActivePresentation().getSlides()[0];
  texts = getElementTexts(slide.getPageElements());
  var text = '';
  for (var x = 0; x < texts.length; ++x) {
    text = text.concat(texts[x].asString());
  }
  num_words = text.split(" ").length;
  num_imgs = slide.getImages().length;
  return [num_words, num_imgs];
}

function get_data() {
  // data = [purpose_data, idea_data, fix_data]
  //  top_toolbar = readPurpose();
  purpose_data = ['45', 'to pursuade', 'stakeholders'];
  fonts = ['Times New Roman', 'Athelas', 'Georgia'];
  //quotes = ['"Don\'t cry because it\'s over, smile because it happened." -Dr. Seuss','"Two things are infinite: the universe and human stupidity; and I\'m not sure about the universe." -Albert Einstein'];
  quotes = readQuotes();
  idea_data = [fonts, quotes];
  fix_data = ['The information on this slide seems redundant. Consider deleting the slide from your presentation.',
              'There is too much text on this slide. Consider selecting a picture you would like to replace it with',
              'It seems like some of the elements could be aligned better.  Consider fixing it to have a successul presentation.'];
  
  return [purpose_data, idea_data, fix_data]
}

function get_notifications() {
  data = word_to_img();
  num_words = data[0];
  num_img = data[1];
  if(num_img == 0 && num_words >=25) {
    
  }
}

// getters
  
// get functions 
function get_masters() {
  return SlidesApp.getActivePresentation().getMasters();
}

function get_layouts() {
  return SlidesApp.getActivePresentation().getLayouts();
}

function get_slides() {
  return SlidesApp.getActivePresentation().getSlides();
}

function get_current_page() {
    return SlidesApp.getActivePresentation().getSelection().getCurrentPage();
}

function insert_image(imgSrc, left, right, width, height) {
    var page = SlidesApp.getActivePresentation().getSelection().getCurrentPage();
    page.insertImage(imgSrc, left, right, width, height);
}

function get_page_elements() {
  elements = [];
  slides = SlidesApp.getActivePresentation().getSlides();
  for(i=0; i < slides.length; i++) {
    elements = elements.concat(slides[i].getPageElements());
  }
  return elements
}

function onEdit(e){
  
}

/* onClick function
  Sets the font from the font buttons on the UI.
    Behavior: Appends this function when the user clicks
    a font.
 */
function setFont(font) {
  var slides = SlidesApp.getActivePresentation().getSlides();
  slides.forEach(function(slide) {
    texts = getElementTexts(slide.getPageElements());
    texts.forEach(function(text) {
      text.getTextStyle().setFontFamily(font);
    });
  });
}

/**
 * Recursively gets child text elements a list of elements.
 * @param {PageElement[]} elements The elements to get text from.
 * @return {Text[]} An array of text elements.
 */
function getElementTexts(elements) {
    var texts = [];
    elements.forEach(function(element) {
        switch (element.getPageElementType()) {
            case SlidesApp.PageElementType.GROUP:
                element.asGroup().getChildren().forEach(function(child) {
                    texts = texts.concat(getElementTexts(child));
                });
                break;
            case SlidesApp.PageElementType.TABLE:
                var table = element.asTable();
                for (var y = 0; y < table.getNumColumns(); ++y) {
                    for (var x = 0; x < table.getNumRows(); ++x) {
                        texts.push(table.getCell(x, y).getText());
                    }
                }
                break;
            case SlidesApp.PageElementType.SHAPE:
                texts.push(element.asShape().getText());
                break;
        }
    });
    return texts;
}
