<?php
// take in the input from the textarea
$pcOut = $_POST['card'];

// ensure it doesn't exceed the character limit
$pcOut = substr($pcOut, 0, 1034);

// open the text file and replace its contents with the textarea's
$filename = 'output.txt';
$handle = fopen($filename, 'w');
fwrite($handle, $pcOut);
fclose($handle);

// encode the text again and send it back
echo rawurlencode($pcOut);
?>