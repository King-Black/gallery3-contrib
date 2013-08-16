
function humanSize(size) {
  if( size > 1000000000000 ) {
    size = Math.round(size / 10000000000) / 100;
    unit = "TB";

  } else if( size > 1000000000 ) {
    size = Math.round(size / 10000000) / 100;
    unit = "GB";

  } else if( size > 1000000 ) {
    size = Math.round(size / 10000) / 100;
    unit = "MB";

  } else if( size > 1000 ) {
    size = Math.round(size / 1000);
    unit = "KB";
  } else {
    unit = "B";
  }

  return size+" "+unit;
}


function humanTime(time) {
  label = "";
  if( time >= 60*60 ) {
    time = Math.round(time/60/60);
    label = (time < 2)
      ? MSG_X_HOUR
      : MSG_X_HOURS;
  } else if( time >= 60 ) {
    time = Math.round(time/60);
    label = (time < 2)
      ? MSG_X_MINUTE
      : MSG_X_MINUTES;
  } else {
    label = (time < 2)
      ? MSG_X_SECOND
      : MSG_X_SECONDS;
  }
    
  return label.replace("__X__", time);
}

/**
 * Triggers once each time a file or group of files is added to the queue.
 */
function sobriety_uploadify_onSelectOnce(event, data) {
  allBytesTotal = data.allBytesTotal;

  if( document.getElementById("g-add-photos-progress") ) {
    $("#g-add-photos-progress-bar span").removeClass("stop");
  } else {
    $("#g-add-photos-status").replaceWith(
      '<div id="g-add-photos-progress">'+
      '  <ul>'+
      '    <li id="g-add-photos-progress-text">'+ MSG_UPLOADED_COUNT_OF_TOTAL +'</li>'+
      '    <li id="g-add-photos-progress-bar"><span></span></li>'+
      '    <li id="g-add-photos-progress-filename">'+ MSG_UPLOADING_FILE +'</li>'+
      '    <li><span id="g-add-photos-progress-rate">'+ MSG_UPLOAD_RATE +'</span>, <span id="g-add-photos-progress-eta">'+ MSG_UPLOAD_ETA +'</span></li>'+
      '  </ul>'+
      '</div>'
    );
  }

  if ($("#g-upload-cancel-all").hasClass("ui-state-disabled")) {
    $("#g-upload-cancel-all")
      .removeClass("ui-state-disabled")
      .attr("disabled", null);
    $("#g-upload-done")
      .addClass("ui-state-disabled")
      .attr("disabled", "disabled");
  }
  return true;
}

/**
 * Triggers each time the progress of a file upload changes.
 */
function sobriety_uploadify_onProgress(event, ID, fileObj, data) {
console.log((new Date())+'onProgress: '+data.allBytesLoaded+' / '+allBytesTotal);
if( (data.allBytesLoaded - allBytesTotal_offset) == fileObj.size ) console.log((new Date())+'onProgress: Generating thumbnails');
  $("#g-add-photos-progress-text").text(
    MSG_UPLOADED_COUNT_OF_TOTAL
      .replace("__COUNT__", humanSize(data.allBytesLoaded))
      .replace("__TOTAL__", humanSize(allBytesTotal))
  );
  $("#g-add-photos-progress-bar span").css("width", Math.floor(data.allBytesLoaded/allBytesTotal * 100) +"%");
  $("#g-add-photos-progress-filename ").text(
    MSG_UPLOADING_FILE.replace("__FILE__", fileObj.name)
  );
  $("#g-add-photos-progress-rate ").text(
    MSG_UPLOAD_RATE.replace("__RATE__", humanSize(data.speed*1000)+"/s")
  );
  $("#g-add-photos-progress-eta ").text(
    MSG_UPLOAD_ETA.replace("__ETA__", humanTime(Math.round((allBytesTotal - data.allBytesLoaded) / (data.speed * 1000))) )
  );
}

/**
 * Triggers once for each file upload that is completed.
 */
function sobriety_uploadify_onComplete(event, ID, fileObj, response, data) {
  allBytesTotal_offset += fileObj.size;
}

/**
 * Triggers once when all files in the queue have finished uploading.
 */
function sobriety_uploadify_onAllComplete(event, data) {
console.log((new Date())+'onCompleteAll: '+data.allBytesLoaded+' / '+allBytesTotal);
  // FIXME: data seems to have incorrect values (?)
  $("#g-add-photos-progress-text").text(
    MSG_UPLOADED_COUNT_OF_TOTAL
      .replace("__COUNT__", humanSize(allBytesTotal))
      .replace("__TOTAL__", humanSize(allBytesTotal))
  );
  $("#g-add-photos-progress-bar span").css("width", "100%");

  $("#g-add-photos-progress-bar span").addClass("stop");
  $("#g-add-photos-progress-rate ").text(
    MSG_UPLOAD_RATE.replace("__RATE__", humanSize(data.speed*1000)+"/s")
  );
  $("#g-add-photos-progress-eta ").text("");

  $("#g-upload-cancel-all")
    .addClass("ui-state-disabled")
    .attr("disabled", "disabled");
  $("#g-upload-done")
    .removeClass("ui-state-disabled")
    .attr("disabled", null);
  return true;
}


function sobriety_uploadify_onClearQueue(event) {
  $("#g-upload-cancel-all")
    .addClass("ui-state-disabled")
    .attr("disabled", "disabled");
  $("#g-upload-done")
    .removeClass("ui-state-disabled")
    .attr("disabled", null);
  return true;
}

function sobriety_uploadify_onError(event, queueID, fileObj, errorObj) {
  /*
          if (errorObj.type == "HTTP") {
            if (errorObj.info == "500") {
              error_msg = <?= t("Unable to process this photo")->for_js() ?>;
            } else if (errorObj.info == "404") {
              error_msg = <?= t("The upload script was not found")->for_js() ?>;
            } else if (errorObj.info == "400") {
              error_msg = <?= t("This photo is too large (max is %size bytes)",
                                array("size" => $size_limit))->for_js() ?>;
            } else {
              msg += (<?= t("Server error: __INFO__ (__TYPE__)")->for_js() ?>
                .replace("__INFO__", errorObj.info)
                .replace("__TYPE__", errorObj.type));
            }
          } else if (errorObj.type == "File Size") {
            error_msg = <?= t("This photo is too large (max is %size bytes)",
                              array("size" => $size_limit))->for_js() ?>;
          } else {
            error_msg = <?= t("Server error: __INFO__ (__TYPE__)")->for_js() ?>
                        .replace("__INFO__", errorObj.info)
                        .replace("__TYPE__", errorObj.type);
          }
          msg = " - <a target=\"_blank\" href=\"http://codex.gallery2.org/Gallery3:Troubleshooting:Uploading\">" +
            error_msg + "</a>";

          $("#g-add-photos-status ul").append(
            "<li id=\"q" + queueID + "\" class=\"g-error\">" + fileObj.name + msg + "</li>");
          $("#g-uploadify").uploadifyCancel(queueID);
          error_count++;
          update_status();
  */
}




/*
        onComplete: function(event, queueID, fileObj, response, data) {
          var re = /^error: (.*)$/i;
          var msg = re.exec(response);
          $("#g-add-photos-status ul").append(
            "<li id=\"q" + queueID + "\" class=\"g-success\">" + fileObj.name + " - " +
            <?= t("Completed")->for_js() ?> + "</li>");
          setTimeout(function() { $("#q" + queueID).slideUp("slow").remove() }, 5000);
          success_count++;
          update_status();
          return true;
        },
*/