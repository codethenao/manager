<?php
$themeCode = false;
if (isset($_GET['oauth2'])) {
	$files = [
		'roboto/load.css',
		'normalize.css',
		'skeleton.css',
		'oauth2.css'
	];
} else {
	$files = [
		'roboto/load.css',
		'ext-all.css',
		'ext-filerun.css',
		'ext-ux/SuperBoxSelect.css',
		'ext-ux/ProgressColumn.css',
		'font-awesome/css/font-awesome.min.css'
	];

	$theme = isset($_GET['theme']) ? $_GET['theme'] : 'blue';
	$themeFile = 'theme_blue.css';
	if ($theme != 'blue') {
		if ($theme == 'red') {
			$replaceColors = [
				'main' => '#C0392B',
				'light' => '#E74C3C',
				'lighter' => '#FFE6E6',
				'dark' => '#DC2F1A'
			];
		} else if ($theme == 'green') {
			$replaceColors = [
				'main' => '#002900',
				'light' => '#0F640F',
				'lighter' => '#E9F7E9',
				'dark' => '#025a02'
			];
		} else {
			$themeFile = '../customizables/theme.css';
		}
	}
	if (is_file($themeFile)) {
		$themeCode = file_get_contents($themeFile);
		if ($theme != 'blue') {
			$colors = [
				'main' => '#427FED',
				'light' => '#4285F4',
				'lighter' => '#E8F0FE',
				'dark' => '#1967D2'
			];
			foreach ($colors as $key => $color) {
				$themeCode = str_replace($color, $replaceColors[$key], $themeCode);
			}
		}
	}
}

if (extension_loaded("zlib") && (ini_get("output_handler") != "ob_gzhandler")) {
	ini_set("zlib.output_compression", 1);
}

header("Content-type: text/css; charset: UTF-8");
header("Cache-control: public");
header("Pragma: cache");
header("Expires: " . gmdate ("D, d M Y H:i:s", time() + 31356000) . " GMT");

foreach ($files as $key => $file) {
	readfile($file);
	echo "\n";
}

if ($themeCode) {
	echo $themeCode;
}