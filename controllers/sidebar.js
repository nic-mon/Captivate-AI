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

// checkers/counters built to work on one slide object

function check_for_inconsistancies(slide) {
  // checks for use of multiple fonts/sizes within one textbox
  // return True if there are inconsistancies in the slide
  // different fonts/sizes in different text boxes are ok
  texts = getElementTexts(slide.getPageElements());
  var flag = false;
  texts.forEach(function(text) {
      if(text.getTextStyle().getFontFamily() == null) {flag = true;}  // font family of textrange, null if multiple
      if(text.getTextStyle().getFontSize() == null) {flag = true;} // font size of textrange, null if multiple
  });
  return flag
}

function count_fonts_used(slide) {
  texts = getElementTexts(slide.getPageElements());
  var fonts = []
  texts.forEach(function(text) {
    fonts.push(text.getTextStyle().getFontFamily());  // font family of textrange, null if multiple
  });
  return fonts
}

function count_fontsizes_used(slide) {
  //count # fonts and sizes
  texts = getElementTexts(slide.getPageElements());
  var sizes = []
  texts.forEach(function(text) {
    sizes.push(text.getTextStyle().getFontSize());  // font family of textrange, null if multiple
  });
  return sizes
}

function count_text_lengths(slide) {
  texts = getElementTexts(slide.getPageElements());
  var lengths = []
  texts.forEach(function(text) {
    lengths.push(text.getLength()); 
  });
  return lengths
}

function count_imgs_sizes(slide) {
  imgs = slide.getImages();
  sizes = []
  imgs.forEach(function(img) {
    sizes.push([img.getHeight(), img.getWidth()])
  })
  return sizes
}



function get_data() {
  // data = [purpose_data, idea_data, fix_data]
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
