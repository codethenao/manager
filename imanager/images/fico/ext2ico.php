<?php
$fileTypes = require('../../system/data/filetypes.php');
$ext = strtolower($_GET['ext']);

if (array_key_exists($ext, $fileTypes)) {
	$typeInfo = $fileTypes[$ext];
} else {
	$typeInfo = reset($fileTypes);
}
$filename = $typeInfo[3];
if (!$filename) {
	$filename = 'generic.png';
}
header ('HTTP/1.1 301 Moved Permanently');
header('Location: '.$filename);