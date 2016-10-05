// function shortener to save space
var d = function(id){ return document.getElementById(id); }

// check if installed to iPhone or iPod touch home screen
function installed() {
	if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) && (window.navigator.standalone)) { return true; }
	else { return false; }
}

// variables for later!
var locked = false;
var emergencyCard = '';
var emergencyTextArea = '';
var loadAjax = new XMLHttpRequest();
var saveAjax = new XMLHttpRequest();

function loadFailure() {

	// kill the load request if it was sent
	if (navigator.onLine) { loadAjax.abort(); }

	// lock the card
	locked = true;

	if (installed()) {
		// get the last-saved text to the device
		var localText = localStorage["pastecard"];

		// fix line breaks and render the card (empty if necessary)
		if (localStorage["pastecard"]) { localText = localStorage["pastecard"].replace(/\n/g,'<br>\n'); }
		else { localText = '&nbsp;'; }
		d('pc').innerHTML = localText;

	} else {
		// throw an alert if online
		alert('Sorry, there was a problem loading your text. Refresh the page and try again?');
	}
}

function load() {
	if (navigator.onLine) {

		// prepare the load request, with a random number for cache busting
		loadAjax.open('GET', 'output.txt?' + Math.random(), true);
		loadAjax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		// when the response comes back, kill the timeout
		loadAjax.onreadystatechange=function() {
			if (loadAjax.readyState == 4 && loadAjax.status == 200) {
				clearTimeout(loadTimeout);

				var gotText = loadAjax.responseText;

				// save the new text locally if installed
				if (installed()) { localStorage["pastecard"] = gotText; }

				// fix line breaks and render the card (empty if necessary)
				if (gotText) { gotText = gotText.replace(/\n/g,'<br>\n'); }
				else { gotText = '&nbsp;'; }
				d('pc').innerHTML = gotText;
			}
		}

		// set the timeout and start the load request
		var loadTimeout = setTimeout(loadFailure,5000);
		loadAjax.send();

	}

	// if not online, skip straight to load failure
	else { loadFailure(); }
}

function edit() {
	if (!locked) {

		// take the text from the div and save it for an emergency
		var oldText = d('pc').innerHTML;
		emergencyCard = oldText;

		// de-HTML a bunch of symbols
		oldText = oldText.replace(/<br>/gi,'');
		oldText = oldText.replace(/&gt;/gi,'>');
		oldText = oldText.replace(/&lt;/gi,'<');
		oldText = oldText.replace(/&amp;/gi,'&');
		oldText = oldText.replace(/&nbsp;/gi,'');

		// remove Apple data detectors
		oldText = oldText.replace(/<a\b[^>]*>/gi,'');
		oldText = oldText.replace(/<\/a>/gi,'');

		// put the text in the textarea
		d('editable').value = oldText;

		// hide the div, show the textarea and buttons
		d('pc').style.display = 'none';
		d('edit').style.display = 'block';

		// make the textarea active
		d('editable').focus();
	}
}

// hide the textarea and buttons, show the div
function cleanUp() {
	d('edit').style.display = 'none';
	d('pc').style.display = 'block';
}

function saveFailure() {
	// kill the save request
	saveAjax.abort();

	// set the div and textarea to their emergency reserves
	d('pc').innerHTML = emergencyCard;
	d('editable').value = emergencyTextArea;

	// turn on edit mode without doing all the string replacements
	d('pc').style.display = 'none';
	d('edit').style.display = 'block';
	locked = false;

	// throw an alert
	alert('Sorry, there was a problem saving your text. Try again?');

	// make the textarea active
	d('editable').focus();
}

function save() {
	// lock the card
	locked = true;

	// get the new text, strip http from URLs, and save it for an emergency
	var newText = d('editable').value;
	newText = newText.replace(/https?\:\/\//gi, '');
	emergencyTextArea = newText;

	// prepare the text to be sent to the save file
	newText = encodeURIComponent(newText);

	// show a progress message in the div, hide the textarea and buttons
	d('pc').innerHTML = '<strong>Saving&hellip;</strong>';
	cleanUp();

	// prepare the save request
	saveAjax.open('POST', 'edit.php', true);
	saveAjax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	// when the request comes back, kill the timeout
	saveAjax.onreadystatechange = function() {
		if (saveAjax.readyState == 4 && saveAjax.status == 200) {
			clearTimeout(saveTimeout);

			// get the text back and decode it
			var retText = saveAjax.responseText;
			retText = decodeURIComponent(retText);

			// if installed, save it locally
			if (installed()) { localStorage["pastecard"] = retText; }

			// fix line breaks and render the card (empty if necessary)
			if (retText) { retText = retText.replace(/\n/g,'<br>\n'); }
			else { retText = '&nbsp;'; }
			d('pc').innerHTML = retText;

			// unlock the card
			locked = false;
		}
	}

	// set the timeout and start the save request, with a random number for cache busting
	var saveTimeout = setTimeout(saveFailure,5000);
	saveAjax.send('card=' + newText + '&t=' + Math.random());
}
