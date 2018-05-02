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

// call to quotes api
function test_quotes_api() {
    var quotes = getQuotes("success");
    return quotes;
}

// Trigger to Refresh Data
function createTrigger() {
    ScriptApp.newTrigger('refreshData') // refreshData called in sidebar.js.html
        .timeBased()
        //.after(5000) // milliseconds
        .everyMinutes(10)
        .create();
}

function deleteTrigger() {
    // Authorization is required to use ScriptApp's Triggers
    var allTriggers = ScriptApp.getProjectTriggers();
    for (var i=0; i < allTriggers.length; i++) {
        ScriptApp.deleteTrigger();
    }
}

/*
 * Function to process Form input from the client side
 *  Has 2 function calls: 1 to NLP API and 1 to Image Search API
 */
function processBrainstormUsingForm(formObject) {
    Logger.log("In the brainstorm, processing the form.");
    // blob will be encoded as a string
    Logger.log(formObject);
    var formBlob = formObject.brainstorm;
    Logger.log(formBlob);
    // returns keywords
    var keywords = analyzeText(formBlob);
    Logger.log(keywords);
    //keywords = ["banana"];
    var urls = [];
    Logger.log("Sending keywords to image API.");
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
function get_fonts_used() {
  var fonts = [];
  var slides = SlidesApp.getActivePresentation().getSlides();
  slides.forEach(function(slide) {
    texts = getElementTexts(slide.getPageElements());
    texts.forEach(function(text) {
      if(text.getLength()>0) { fonts.push(text.getTextStyle().getFontFamily()); }
    });
  });
  return dedupe_arr(fonts).filter(function(val) { return val !== null; });
}

function get_fontsizes_used() {
  var fontsizes = [];
  var slides = SlidesApp.getActivePresentation().getSlides();
  slides.forEach(function(slide) {
    texts = getElementTexts(slide.getPageElements());
    texts.forEach(function(text) {
      if(text.getLength()>0) { fontsizes.push(text.getTextStyle().getFontSize()); }
    });
  });
  return dedupe_arr(fontsizes).filter(function(val) { return val !== null; });
}

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
  var total = 0;
  for(j=0; j < sizes.length; j++) {
      total = total + sizes[j][0]*sizes[j][1];
  }
  return total;
}

function count_img_size() {
    var slide = SlidesApp.getActivePresentation().getSelection().getCurrentPage().asSlide();
    var img_sizes = count_imgs_sizes(slide);
    return img_sizes;
}

// presentation / current slide checking fucnctions
//   (these use above functions)
function check_presentation() {
  var slides = SlidesApp.getActivePresentation().getSlides();
  var fonts = [];
  var fontsizes = [];
  var lengths = [];
  var img_areas = [];
  //for(i=0; i < slides.length; i++) {
  slides.forEach(function(slide, i) {
    //var results = check_texts(slide);
    texts = getElementTexts(slide.getPageElements());
    var slide_lengths = [];
    var slide_fonts = [];
    var slide_fontsizes = [];
    var slide_imgarea = count_imgs_sizes(slide);
    texts.forEach(function(text) {
      var length = text.getLength()
      if (length == 0) { return; }
      slide_lengths.push(length);
      slide_fonts.push(text.getTextStyle().getFontFamily());
      slide_fontsizes.push(text.getTextStyle().getFontSize());
    });
    fonts.push(slide_fonts);
    fontsizes.push(slide_fontsizes);
    lengths.push(slide_lengths);
    img_areas.push(slide_imgarea);
  });
  return generate_notifications(lengths, fonts, fontsizes, img_areas);
}

function generate_notifications(lengths, fonts, fontsizes, img_areas) {
  var notifications = [];
  var slide_fixes = [];
  var num_slides = lengths.length;

  for(i=0; i < num_slides; i++) {
    var slide_lengths = dedupe_arr([].concat.apply([],lengths[i])).filter(function(val) { return val !== null; });
    var slide_fonts = dedupe_arr([].concat.apply([],fonts[i])).filter(function(val) { return val !== null; });
    var slide_fontsizes = dedupe_arr([].concat.apply([],fontsizes[i])).filter(function(val) { return val !== null; });
    var slide_imgarea= img_areas[i];
    var num_texts = slide_lengths.length;
    if (slide_fonts.length > 2) {
      // more than 2 fonts on slide
      notifications.push('You are using '+slide_fonts.length +' fonts on slide '+(i+1)+'.  Consider using one or two max.');
      slide_fixes.push(i);
    }
    if (slide_fontsizes.length > 2) {
      // more than 2 fontsizes on slide
      notifications.push('You are using '+slide_fontsizes.length +' fontsizes on slide '+(i+1)+'.  Consider using one or two max.');
      slide_fixes.push(i);
    }
    var total_textarea = get_total_text_area(slide_lengths, slide_fontsizes);
    if (total_textarea > 10000) {
      // too much text
      notifications.push('You have too much text on slide '+(i+1)+'.  Consider replacing some text with images using our tool.');
      slide_fixes.push(i);
    }
    // text to image ratio?? 
  }
  // var total_lengths = dedupe_arr([].concat.apply([],lengths[i])).filter(x => x);
  var total_fonts = dedupe_arr([].concat.apply([],fonts)).filter(function(val) { return val !== null; });
  var total_fontsizes = dedupe_arr([].concat.apply([],fontsizes)).filter(function(val) { return val !== null; });
  if (total_fonts.length > 2) {
    // more than 2 fonts in pres
    notifications.push('You are using '+total_fonts.length+' different fonts in your presentation.  Consider using one or two max.');
  }
  if (total_fontsizes.length > 2) {
    // more than 2 fontsizes in pres
    notifications.push('You are using '+total_fontsizes.length+' different fontsizes in your presentation.  Consider using one or two max.');
  }
  var num_bad_slides = dedupe_arr(slide_fixes).length;
  return [notifications, total_fonts, total_fontsizes, num_bad_slides, num_slides]
}

// old function below
function _check_presentation() {
  var notifications = [];
  var slides = SlidesApp.getActivePresentation().getSlides();
  var num_slides = slides.length
  var font_inconsistancies = [];
  var fontsize_inconsistancies = [];
  var fonts = [];
  var fontsizes = [];
  var bad_slides = [];
  // var lengths = [];
  // var img_areas = [];
  //for(i=0; i < slides.length; i++) {
    slides.forEach(function(slide, i) {
    //var results = check_texts(slide);
    var results = count_fonts_used(slide);
    var fontsizes_results = count_fontsizes_used(slide);
    var textlengths_results = count_text_lengths(slide);
    // I changed the image size func to just calculate total area immediately
    var img_sizes = count_imgs_sizes(slide);
    var slide_fonts = [];
    var slide_fontsizes = [];
    var slide_textlengths = [];
    // results.forEach(function(result) {
    //   if (result.font == null) { font_inconsistancies.push(i); }
    //   else { slide_fonts.push(result.font); }
    //   if (result.fontsize == null) { font_inconsistancies.push(i); }
    //   else { slide_fontsizes.push(result.fontsize); }
    //   slide_textlengths.push(result.textlength);
    // });
    // more than 2 fonts or fontsizes on one slide notification
        var fonts_per_slide = results.length;
        var fontsizes_per_slide = fontsizes_results.length;
    if (fonts_per_slide > 2 ) {
      notifications.push('You are using '+fonts_per_slide +' fonts on slide '+(i+1)+'.  Consider using one or two max.');
      bad_slides.push(i);
      }

    // word to img ratio notification
    //var total_textarea = get_total_text_area(slide_textlengths, slide_fontsizes);
    var total_textarea = get_total_text_area(textlengths_results, fontsizes_results);
    //var total_imgarea = get_total_img_area(img_sizes);
    var total_imgarea = img_sizes;//get_total_img_area(img_sizes);
    //if (total_imgarea >= 0 &&  total_textarea/total_imgarea > 3) { notifications.push('You have too much text on slide '+(i+1)+'.  Consider replacing some text with images using our tool.'); }
    if (total_textarea > 10000) {
      notifications.push('You have too much text on slide '+(i+1)+'.  Consider replacing some text with images using our tool.');
      bad_slides.push(i);
    }
    if (fontsizes_per_slide > 2 ) {
      notifications.push('You are using '+fontsizes_per_slide+' fontsizes on slide '+(i+1)+'.  Consider using one or two max.');
      bad_slides.push(i);
    }

    //fonts.push(slide_fonts);
    //fontsizes.push(slide_fontsizes);
    fonts.push(results);
    fontsizes.push(fontsizes_results)
  });
  //if (font_inconsistancies.length > 0) {notifications.push(get_inc_notification_string(font_inconsistancies, 'font'));}
  if (fontsize_inconsistancies.length > 0) {notifications.push(get_inc_notification_string(fontsize_inconsistancies, 'fontsize'));}
  var fonts_used = dedupe_arr([].concat.apply([], fonts));
  var fontsizes_used = dedupe_arr([].concat.apply([],fontsizes));
    //var fonts_used = dedupe_arr(fonts.flatten());
    //var fontsizes_used = dedupe_arr(fontsizes.flatten());
    // again subtract 1 to eliminate the undefined font
    var total_fonts = fonts_used.length;
    var total_fontsizes = fontsizes_used.length;
  if (total_fonts > 2) {notifications.push('You are using '+total_fonts+' different fonts in your presentation.  Consider using one or two max.');}
  if (total_fontsizes > 2) {notifications.push('You are using '+total_fontsizes+' different fontsizes in your presentation.  Consider using one or two max.');}
  var num_bad_slides = dedupe_arr(bad_slides).length;
  return [notifications, num_bad_slides, num_slides]
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
    total_textarea = total_textarea + fontsizes[i] * textlengths[i];
  }
  return total_textarea
}

function test_textarea() {
    var slide = SlidesApp.getActivePresentation().getSelection().getCurrentPage().asSlide();
    var textlengths = count_text_lengths(slide);
    var fontsizes = count_fontsizes_used(slide);
    var textarea = get_total_text_area(textlengths, fontsizes);
    return textarea;
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
  var fonts = [];
  var numArial = 0;
  texts.forEach(function(text) {
    fonts.push(text.getTextStyle().getFontFamily());  // font family of textrange, null if multiple
    if (text.getTextStyle().getFontFamily() == 'Arial') {
        numArial++;
    }
  });
  // protect against counting 'Arial' as a font, if it's associated with an image
  // check how many times 'Arial' appears as a font
  if (numArial == 1) {
      fonts = dedupe_arr([].concat.apply([], fonts));
      remove(fonts,'Arial');
  }
  else if (numArial > 1){
      fonts = dedupe_arr([].concat.apply([], fonts));
  }
  else {
      fonts = dedupe_arr([].concat.apply([], fonts));
  }
  return fonts;
}

function remove(array, element) {
    const index = array.indexOf(element);

    if (index !== -1) {
        array.splice(index, 1);
    }
}

function count_fonts() {
    var slide = SlidesApp.getActivePresentation().getSelection().getCurrentPage().asSlide();
    var fonts = count_fonts_used(slide);
    return fonts;
}

function count_fontsizes_used(slide) {
  //count # fonts and sizes
  texts = getElementTexts(slide.getPageElements());
  var sizes = [];
  texts.forEach(function(text) {
    sizes.push(text.getTextStyle().getFontSize());  // font family of textrange, null if multiple
  });
  sizes = dedupe_arr([].concat.apply([], sizes));
  return sizes
}

function count_fontsizes() {
    var slide = SlidesApp.getActivePresentation().getSelection().getCurrentPage().asSlide();
    var sizes = count_fontsizes_used(slide);
    return sizes;
}

function count_text_lengths(slide) {
  texts = getElementTexts(slide.getPageElements());
  var lengths = [];
  texts.forEach(function(text) {
    lengths.push(text.getLength()); 
  });
  return lengths;
}

function count_textlength() {
    var slide = SlidesApp.getActivePresentation().getSelection().getCurrentPage().asSlide();
    var lengths = count_text_lengths(slide);
    return lengths;
}

///////////////////////


function get_fonts() { 
  fonts = ['Times New Roman', 'Athelas', 'Georgia'];
  return fonts;
}

function get_quotes() {
  quotes = test_quotes_api().split('|');
  return [quotes[1], quotes[2]];

}

function get_purpose() {
  var purpose_data = ['45', 'to persuade', 'stakeholders'];
  return purpose_data
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
                    texts = texts.concat(getElementTexts([child]));
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
