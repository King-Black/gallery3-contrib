<?php defined("SYSPATH") or die("No direct script access.") ?>
<script type="text/javascript" src="<?= url::file("lib/swfobject.js") ?>"></script>
<script type="text/javascript" src="<?= url::file("lib/uploadify/jquery.uploadify.min.js") ?>"></script>
<script type="text/javascript" src="<?= url::file("themes/sobriety/js/sobriety.uploadify.js") ?>"></script>
<script type="text/javascript">
  /* Commit: 76a7ad3161be0994d7ba98e9dff9b317b2430bb3
     Date: Sat Apr 23 10:07:32 2011 -0700 */
  var allBytesTotal = 0;
  var allBytesTotal_offset = 0;
  var MSG_CALCULATING = <?= t('Calculating...')->for_js() ?>;
  var MSG_UPLOADED_COUNT_OF_TOTAL = <?= t('Uploaded: __COUNT__ of __TOTAL__')->for_js() ?>;
  var MSG_UPLOADING_FILE = <?= t('Uploading: __FILE__')->for_js() ?>;
  var MSG_UPLOAD_RATE = <?= t('Upload rate: __RATE__')->for_js() ?>;
  var MSG_UPLOAD_ETA = <?= t('Estimated time remaining: __ETA__')->for_js() ?>;
  var MSG_X_HOUR = <?= t('__X__ hour')->for_js() ?>;
  var MSG_X_HOURS = <?= t('__X__ hours')->for_js() ?>;
  var MSG_X_MINUTE = <?= t('__X__ minute')->for_js() ?>;
  var MSG_X_MINUTES = <?= t('__X__ minutes')->for_js() ?>;
  var MSG_X_SECOND = <?= t('__X__ second')->for_js() ?>;
  var MSG_X_SECONDS = <?= t('__X__ seconds')->for_js() ?>;
  <? $flash_minimum_version = "9.0.24" ?>
  var success_count = 0;
  var error_count = 0;
  var updating = 0;
  $("#g-add-photos-canvas").ready(function () {
    var update_status = function() {
      if (updating) {
        // poor man's mutex
        setTimeout(function() { update_status(); }, 500);
      }
      updating = 1;
      $.get("<?= url::site("uploader/status/_S/_E") ?>"
            .replace("_S", success_count).replace("_E", error_count),
          function(data) {
            $("#g-add-photos-status-message").html(data);
            updating = 0;
          });
    };

    if (swfobject.hasFlashPlayerVersion("<?= $flash_minimum_version ?>")) {
      $("#g-uploadify").uploadify({
        width: 1000,
        height: 1000,
        uploader: "<?= url::file("lib/uploadify/uploadify.swf") ?>",
        script: "<?= url::site("uploader/add_photo/{$album->id}") ?>",
        scriptData: <?= json_encode($script_data) ?>,
        fileExt: "*.gif;*.jpg;*.jpeg;*.png;*.GIF;*.JPG;*.JPEG;*.PNG<? if ($movies_allowed): ?>;*.flv;*.mp4;*.m4v;*.FLV;*.MP4;*.M4V<? endif ?>",
        fileDesc: <?= t("Photos and movies")->for_js() ?>,
        cancelImg: "<?= url::file("lib/uploadify/cancel.png") ?>",
        simUploadLimit: <?= $simultaneous_upload_limit ?>,
        sizeLimit: <?= $size_limit_bytes ?>,
        wmode: "transparent",
        hideButton: true, /* should be true */
        auto: true,
        multi: true,

        onSelectOnce: sobriety_uploadify_onSelectOnce,
        onProgress: sobriety_uploadify_onProgress,
        onAllComplete: sobriety_uploadify_onAllComplete,
        onComplete: sobriety_uploadify_onComplete,
        onClearQueue: sobriety_uploadify_onClearQueue,
        onError: sobriety_uploadify_onError,
      });
    } else {
      $(".requires-flash").hide();
      $(".no-flash").show();
    }
  });
</script>

<div class="requires-flash">
  <? if ($suhosin_session_encrypt || (identity::active_user()->admin && !$movies_allowed)): ?>
  <div class="g-message-block g-info">
    <? if ($suhosin_session_encrypt): ?>
    <p class="g-error">
      <?= t("Error: your server is configured to use the <a href=\"%encrypt_url\"><code>suhosin.session.encrypt</code></a> setting from <a href=\"%suhosin_url\">Suhosin</a>.  You must disable this setting to upload photos.",
          array("encrypt_url" => "http://www.hardened-php.net/suhosin/configuration.html#suhosin.session.encrypt",
      "suhosin_url" => "http://www.hardened-php.net/suhosin/")) ?>
    </p>
    <? endif ?>

    <? if (identity::active_user()->admin && !$movies_allowed): ?>
    <p class="g-warning">
      <?= t("Can't find <i>ffmpeg</i> on your system. Movie uploading disabled. <a href=\"%help_url\">Help!</a>", array("help_url" => "http://codex.gallery2.org/Gallery3:FAQ#Why_does_it_say_I.27m_missing_ffmpeg.3F")) ?>
    </p>
    <? endif ?>
  </div>
  <? endif ?>

  <div>
    <ul class="g-breadcrumbs">
      <? foreach ($album->parents() as $i => $parent): ?>
      <li<? if ($i == 0) print " class=\"g-first\"" ?>> <?= html::clean($parent->title) ?> </li>
      <? endforeach ?>
      <li class="g-active"> <?= html::purify($album->title) ?> </li>
    </ul>
  </div>

  <div id="g-add-photos-canvas">
    <button id="g-add-photos-button" class="g-button ui-state-default ui-corner-all" href="#"><?= t("Select photos (%size max per file)...", array("size" => $size_limit)) ?></button>
    <span id="g-uploadify"></span>
  </div>
  <div id="g-add-photos-status">
    <ul id="g-action-status" class="g-message-block">
    </ul>
  </div>
</div>

<div class="no-flash" style="display: none">
  <p>
    <?= t("Your browser must have Adobe Flash Player version %flash_minimum_version or greater installed to use this feature.", array("flash_minimum_version" => $flash_minimum_version)) ?>
  </p>
  <a href="http://www.adobe.com/go/getflashplayer">
    <img src="<?= request::protocol() ?>://www.adobe.com/images/shared/download_buttons/get_flash_player.gif"
         alt=<?= t("Get Adobe Flash Player")->for_js() ?> />
  </a>
</div>
