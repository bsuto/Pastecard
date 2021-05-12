<?php
// take in the input from the textarea
$pcOut = $_POST['card'];

// open the text file and replace its contents with the textarea's
$filename = 'output.txt';
$handle = fopen($filename, 'w');
fwrite($handle, $pcOut);
fclose($handle);

// encode the text again and send it back
echo rawurlencode($pcOut);
?>