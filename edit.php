<?php
// take in the input from the textarea
$pcOut = $_POST['card'];

// URL-decode it and strip out the slashes
$pcOut = rawurldecode($pcOut);
$pcOut = str_replace('\\', '', $pcOut);

// open the text file and replace its contents with the textarea's
$filename = 'output.txt';
$handle = fopen($filename, 'w');
fwrite($handle, $pcOut);
fclose($handle);

// encode the text again and send it back
echo rawurlencode($pcOut);
?>