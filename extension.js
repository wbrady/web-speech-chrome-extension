$(function() {
  var notesDiv = $("#notes");
  var notes = [];
  chrome.storage.local.get("notes", function(result) {
    console.log(result);
    if (result.notes && result.notes.length > 0) {
      notes = result.notes;

      notes.forEach(function(note) {
        notesDiv.prepend(divForNote(note));
      });
    } else {
      clearNotes();
    }

    $('#new').click(function() {
      chrome.experimental.speechInput.isRecording(function(recording) {
        if (!recording) {
          chrome.experimental.speechInput.start({}, function() {
            if (chrome.runtime.lastError) {
              console.log("Couldn't start speech input: " + chrome.runtime.lastError.message);
            } else {
              showRecording();
            }
          });
        } else {
          // Speech already running
        }
      });
    });

    $('#clear-all').click(function() {
      clearNotes();
      notes = [];
      saveNotes();
    });
  });

  chrome.experimental.speechInput.onError.addListener(function(error) {
    console.error("Speech input failed: " + error.code);
    // Show start icon
  });

  chrome.experimental.speechInput.onResult.addListener(function(result) {
    hideRecording();

    console.log(notes);
    if (notes.length == 0) {
      notesDiv.html("");
    }

    var message = result.hypotheses[0].utterance;
    notesDiv.prepend(divForNote(message));
    notes.push(message);
    saveNotes();
  });

  function showRecording() {
    $("#recording-status").show();
  }

  function hideRecording() {
    $("#recording-status").hide();
  }

  function divForNote(note) {
    return "<div>" + note + "</div>";
  }

  function saveNotes() {
    chrome.storage.local.set({ "notes": notes }, function() {});
  }

  function clearNotes() {
    notesDiv.html("<div id='none'>No notes</div>");
  }
});
