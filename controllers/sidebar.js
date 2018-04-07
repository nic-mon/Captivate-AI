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

// Prevent forms from submitting.
function submitBrainstorm(formObject) {
  google.script.run.withSuccessHandler(updateDiv).processBrainstormUsingForm(formObject);
}

//update div based on the results from the NLP API
function updateDiv(data) {
  var div = document.getElementById('output');
  div.innerHTML = data;
}

//update div based on results from images and NLP APIs
function updateDivWithImages(imgs) {
  for (var i = 0; i < imgs.length; i++) {
     // call images api and append a corresponding div
     // need jquery knowledge to resize these images
  }
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
  purpose_data = ['45', 'to pursuade', 'stakeholders'];
  fonts = ['Times New Roman', 'Athelas', 'Georgia'];
  quotes = ['"Don\'t cry because it\'s over, smile because it happened." -Dr. Seuss','"Two things are infinite: the universe and human stupidity; and I\'m not sure about the universe." -Albert Einstein'];
  //quotes = readQuotes();
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
