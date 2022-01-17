var d = function(id) { return document.getElementById(id); } // function shortener to save space
var locked = true;
var emergencySave = '';
var cancelText = '';
var loadAjax = new XMLHttpRequest();
var saveAjax = new XMLHttpRequest();

function installed() {
	// check if installed on iOS home screen
	if ((navigator.userAgent.match(/iPhone|iPod|iPad/i)) && (window.navigator.standalone)) { return true; }

	// check if installed on Android home screen
	else if ((navigator.userAgent.match(/Android/i)) && (window.matchMedia('(display-mode: standalone)').matches)) { return true; }

	else { return false; }
}

function loadFailure() {

	// if online, make sure the load request is stopped
	if (navigator.onLine) { loadAjax.abort(); }

	if (installed()) {
		// use text saved on device
		var localText = '';
		if (localStorage["pastecard"]) { localText = localStorage["pastecard"]; }
		d('pastecard').value = localText;

	} else {
		// throw an alert
		alert('Sorry, there was a problem loading your text. Refresh the page and try again?');
	}
}

function load() {
	if (navigator.onLine) {

		// prepare the load request, with a random number for cache busting
		loadAjax.open('GET', 'output.txt?' + Math.random(), true);
		loadAjax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		// when the response comes back successfully
		loadAjax.onreadystatechange=function() {
			if (loadAjax.readyState == 4 && loadAjax.status == 200) {

				// kill the timeout
				clearTimeout(loadTimeout);

				// save the text locally if installed
				var gotText = loadAjax.responseText;
				if (installed()) { localStorage["pastecard"] = gotText; }

				// put it in the card, unlock it, and enable typing
				d('pastecard').value = gotText;
				locked = false;
				d('pastecard').readOnly = false;
			}
		}

		// set the timeout and start the load request
		var loadTimeout = setTimeout(loadFailure, 5000);
		loadAjax.send();
	}

	// if not online, skip straight to load failure
	else { loadFailure(); }

	// be ready to prevent a readonly textarea from focusing
	d('pastecard').addEventListener('mousedown', function(event) {
		if (locked) { event.preventDefault(); }
	}, false);
}

function edit() {
	if (navigator.onLine) {
		var buttonsDisplay = d('buttons').style.display;
		if (locked == false && (buttonsDisplay == '' || 'none')) {
			cancelText = d('pastecard').value;
			d('buttons').style.display = 'block';
			d('pastecard').focus();
		}
	} else {
		locked = true;
	}
}

function cancel() {
	d('pastecard').value = cancelText;
	d('buttons').style.display = 'none';
}

function saveFailure() {
	// kill the save request
	saveAjax.abort();

	// restore the attempted save text
	d('pastecard').value = emergencySave;

	// throw an alert
	alert('Sorry, there was a problem saving your text. Try again?');

	// show the buttons again, unlock the card, and enable typing
	d('buttons').style.display = 'block';
	locked = false;
	d('pastecard').readOnly = false;
	d('pastecard').focus();
}

function save() {
	// get the new text and save it for an emergency
	var newText = d('pastecard').value;
	emergencySave = newText;

	// lock the card, disable typing, and hide buttons
	locked = true;
	d('pastecard').readOnly = true;
	d('buttons').style.display = 'none';

	// show a progress message
	d('pastecard').value = 'Saving…';

	// prepare the text to be sent to the save file
	newText = encodeURIComponent(newText);

	// prepare the save request
	saveAjax.open('POST', 'edit.php', true);
	saveAjax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	// when the request comes back successfully
	saveAjax.onreadystatechange = function() {
		if (saveAjax.readyState == 4 && saveAjax.status == 200) {

			// kill the timeout
			clearTimeout(saveTimeout);

			// get the text back and decode it
			var retText = saveAjax.responseText;
			retText = decodeURIComponent(retText);

			// if installed, save it locally
			if (installed()) { localStorage["pastecard"] = retText; }

			// render and unlock the card, and enable typing
			d('pastecard').value = retText;
			locked = false;
                        d('pastecard').readOnly = false;
		}
	}

	// set the timeout and start the save request, with a random number for cache busting
	var saveTimeout = setTimeout(saveFailure, 5000);
	saveAjax.send('card=' + newText + '&t=' + Math.random());
}