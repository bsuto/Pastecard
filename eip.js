// function shortener to save space
var d = function(id){ return document.getElementById(id); }

// variable to detect connectivity
var online = new Boolean(true);

// detect if installed to iphone or ipod touch
function installed() {
  if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) && (window.navigator.standalone)) { return true; }
  else { return false; }
}

// when the page loads in the browser
function load() {

  // define the online variable for the rest of the session
  online = window.navigator.onLine;

  // if online, get the card text from the server
  if (online) {
    var hget = new XMLHttpRequest();

    // append a random number to the GET request to bust caches
    hget.open('GET', 'output.txt?' + Math.random(), false);
    hget.send();

    var gotText = hget.responseText;

    // might as well save this locally while we can if possible
    if (installed()) { localStorage["pc"] = gotText; }

    // add br tags before putting it in the card
    gotText = gotText.replace(/\n/g,'<br>\n');
    d('pc').innerHTML = gotText;
  }

  else {
    // use the latest version from local storage and add br tags
    if (installed()) {
      var localText = localStorage["pc"];
      localText = localText.replace(/\n/g,'<br>\n');
      d('pc').innerHTML = localText;
    }
  }
}

function edit() {
  // if user is online and can write
  if (online) {

    // decode and remove HTML junk
    var oldText = d('pc').innerHTML;
    oldText = oldText.replace(/<br>/g,'');
    oldText = oldText.replace(/&gt;/g,'>');
    oldText = oldText.replace(/&lt;/g,'<');
    oldText = oldText.replace(/&amp;/g,'&');
    oldText = oldText.replace(/&nbsp;/g,'');
    oldText = oldText.replace(/<a\b[^>]*>/i,'');
    oldText = oldText.replace(/<\/a>/i,'');

    // fill the editable text field with the card content
    d('editable').value = oldText;

    // hide the card
    d('pc').style.display = 'none';

    // show the text field and action buttons
    d('edit').style.display = 'block';

    // focus on the text field so you can type right away
    d('editable').focus();
  }
}

// hide the text field and action buttons, show the card
function cleanUp() {
  d('edit').style.display = 'none';
  d('pc').style.display = 'block';
}

// the save function: write to the server and the local storage
function save() {
  // lock the card by pretending to be offline
  online = false;

  // get the new text that the user entered and encode it for safety
  var newText = d('editable').value;
  newText = encodeURIComponent(newText);

  // show a temporary loading message and clean up
  d('pc').innerHTML = '<b>Saving&hellip;</b>';
  cleanUp();

  // prepare an ajax request to edit.php with the new text and listen for it back
  var hpost = new XMLHttpRequest();
  hpost.open('POST', 'edit.php', true);
  hpost.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  hpost.onreadystatechange = function() { 
    if(hpost.readyState == 4) { 

      // when it comes back, decode it first
      var retText = hpost.responseText;
      retText = decodeURIComponent(retText);

      // save it locally too if you can
      if (installed()) { localStorage["pc"] = retText; }

      // add br tags
      retText = retText.replace(/\n/g,'<br>\n');

      // if no text, force-draw an empty card
      if (retText == '') { retText = '&nbsp;'; }

      // update the card with the new text and unlock it
      d('pc').innerHTML = retText;
      online = true;
    }
  }

  // send the new text and a random number to bust caches
  hpost.send('card=' + newText + '&t=' + Math.random());
}