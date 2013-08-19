/**
 * Initialize jQuery UI and Gallery Plugin elements
 */

$(document).ready(function() {
    // Initialize status message effects
    $("#g-action-status li").gallery_show_message();

    // Initialize dialogs
    $(".g-dialog-link").gallery_dialog();

    // Initialize short forms
    $(".g-short-form").gallery_short_form();

    // Photo/Item item view
    if ($("#g-photo,#g-movie").length) {
        $(this).find(".g-dialog-link").gallery_dialog();
        $(this).find(".g-ajax-link").gallery_ajax();
    }
});
