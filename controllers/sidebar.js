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
// more efficient counters (used)
function check_texts(slide) {
  texts = getElementTexts(slide.getPageElements());
  var results = [];
  for(i=0; i < texts.length; i++) {
    var result = {};
    result.font = texts[i].getTextStyle().getFontFamily();
    result.fontsize = texts[i].getTextStyle().getFontSize();
    result.textlength = texts[i].getLength();
    results.push(result);
  }
  return results
}

function count_imgs_sizes(slide) {
  imgs = slide.getImages();
  sizes = [];
  for(i=0; i < imgs.length; i++) {
    sizes.push([imgs[i].getHeight(), imgs[i].getWidth()]);
  }
  return sizes
}

// presentation / current slide checking fucnctions
//   (these use above functions)

function check_presentation() {
  var notifications = [];
  var slides = SlidesApp.getActivePresentation().getSlides();
  var font_inconsistancies = [];
  var fontsize_inconsistancies = [];
  var fonts = [];
  var fontsizes = [];
  // var lengths = [];
  // var img_areas = [];
  for(i=0; i < slides.length; i++) {
    var results = check_texts(slides[i]);
    var img_sizes = count_imgs_sizes(slides[i]);
    var slide_fonts = [];
    var slide_fontsizes = [];
    var slide_textlengths = [];
    for(j=0; j < results.length; j++) {
      if (results[j].font == null) { font_inconsistancies.push(i); }
      else { slide_fonts.push(results[j].font); }
      if (results[j].fontsize == null) { font_inconsistancies.push(i); }
      else { slide_fontsizes.push(results[j].fontsize); }
      slide_textlengths.push(results[j].textlength);
    }
    // more than 2 fonts or fontsizes on one slide notification
    if (slide_fonts.length > 2 ) { notifications.push('You are using '+slide_fonts.length+' fonts on slide '+(i+1)+'.  Consider using one or two max.'); }
    if (slide_fontsizes.length > 2 ) { notifications.push('You are using '+slide_fontsizes.length+' fontsizes on slide '+(i+1)+'.  Consider using one or two max.'); }

    // word to img ratio notification
    var total_textarea = get_total_text_area(slide_textlengths, slide_fontsizes);
    var total_imgarea = get_total_img_area(img_sizes);
    if (total_imgarea > 0 &&  total_textarea/total_imgarea > 3) { notifications.push('You have too much text on slide '+(i+1)+'.  Consider replacing some text with images using our tool.'); }

    fonts.push(slide_fonts);
    fontsizes.push(slide_fontsizes);
  }
  if (font_inconsistancies.length > 0) {notifications.push(get_inc_notification_string(font_inconsistancies, 'font'));}
  if (fontsize_inconsistancies.length > 0) {notifications.push(get_inc_notification_string(fontsize_inconsistancies, 'fontsize'));}
  var fonts_used = dedupe_arr(fonts.flatten());
  var fontsizes_used = dedup_arr(fontsizes.flatten());
  if (fonts_used.length > 2) {notifications.push('You are using '+fonts_used.length+' different fonts in your presentation.  Consider using one or two max.');}
  if (fontsizes_used.length > 2) {notifications.push('You are using '+fontsizes_used.length+' different fontsizes in your presentation.  Consider using one or two max.');}
  return notifications
}

// not used
function check_cur_slide() {
  var cur_slide = SlidesApp.getActivePresentation().getSelection().getCurrentPage().asSlide();
  var results = check_texts(cur_slide);
  var img_sizes = count_imgs_sizes(cur_slide);
  var notifications = [];

}

// helpers 
function get_total_img_area(img_sizes) {
  var total = 0;
  for(i=0; i < img_sizes.length; i++) {
    total = total + img_sizes[i][0]*img_sizes[i][1];
  }
  return total
}

function get_total_text_area(textlengths, fontsizes) {
  var total_textarea = 0;
  for(i = 0; i < textlengths.length; i++) {
    total_textarea += fontsizes[i] * textlengths[i];
  }
  return total_textarea
}

function get_inc_notification_string(arr, type) {
  var text = 'You have inconsistancies in ' + type + ' within slide';
  if(arr.length > 1) { text += "s"; }
  for(i=0; i < arr.length-1; i++) {
    text += ' '+arr[i]+',';
  }
  text += ' '+arr[arr.length-1]+'. Consider using one or two ' + type + 's max.';
  return text
}

// dedup array of strings ... maybe not efficient as can be
function dedupe_arr(arr) {
  var unique = [];
  for(i=0; i < arr.length; i++) {
    if(unique.indexOf(arr[i]) === -1) unique.push(arr[i]);
  }
  return unique
}

////////////////////
//  Individual Counter functions (not used)
////////////////////
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
///////////////////////

// update functions
function first_update() {

}

function get_ideas() { 
  quotes = readQuotes();
  fonts = ['Times New Roman', 'Athelas', 'Georgia'];
  idea_data = [fonts, quotes];
  return idea_data;
}

function get_purpose() {
  var purpose_data = ['45', 'to pursuade', 'stakeholders'];
  return purpose_data
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
