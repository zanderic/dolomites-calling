<?php
$resources = getResurces();
downloadResources($resources);

function getResurces() {
	$marker;
	$result = array();
	$file = fopen('geonames/IT.txt', 'r');
	while ($line = fgets($file)) {
		$array = explode("\t", $line);
		for ($i = 0; $i < count($array); $i++) { // 7 < IT index < 10
			if ($array[$i] == 'IT') {
				$marker = $i;
			}
			if ($array[$i] == 'BL') {
				// echo 'PV = ' . $array[$i] . ' | ';
				$cat = $array[$marker - 2].'.'.$array[$marker - 1];
				if ($cat == 'T.MT' || $cat == 'T.MTS' || $cat == 'H.LK' || $cat == 'S.HUT' || $cat == 'T.PK' || $cat == 'T.PKS' || $cat == 'T.PASS' || $cat == 'T.VAL' || $cat == 'H.LKS') {
					array_push($result, $array[0]);
					break;
				}
			}
		}
	}
	fclose($file);
	return $result;
}

function downloadResources($resources) {
	var_dump($resources);
	$link = 'http://sws.geonames.org/num/about.rdf';
	$destination = '/Users/riccardo/Downloads/resources.rdf';

	foreach ($resources as $res) {
		$sourceRes = str_replace('num', $res, $link);
		$data = file_get_contents($sourceRes);

		$file = fopen($destination, a);
		fputs($file, $data);
		fclose($file);
	}
}
?>