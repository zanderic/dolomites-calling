// var endpointURI = "http://factforge.net/repositories/ff-news";
var endpointURI = "http://localhost:3030/dolomites-calling-final/query";
var table = "";
var trails = [101, 103, 104, 105, 106, 107, 108, 109, 111, 112, 115, 116, 117, 118, 119, 120, 121, 271, 122, 123, 125, 152, 222, 224, 226, 227, 243, 260, 268, 270, 272, 273, 278, 279, 280, 1104, 1107, 1120, 1262];

$(document).ready(function() {
	$('#dream-form').submit(function(e) {
		e.preventDefault();

		var sentieri = $('#check-sentieri').is(':checked');
		var montagne = $('#check-montagne').is(':checked');
		var laghi = $('#check-laghi').is(':checked');
		var rifugi = $('#check-rifugi').is(':checked');

		if (!sentieri && !montagne && !laghi && !rifugi) {
			$('.response').html("");
			$('.response').append('<div class="alert alert-danger text-center" role="alert">Seleziona almeno una categoria da cercare!</div>');
		} else {
			var promise = querySpot(montagne, laghi, rifugi);
			promise.done(function(data) {
				displaySpot(data);
			});
			promise.fail(function() {
				$('.response').append('<div class="alert alert-danger text-center" role="alert">Qualcosa è andato storto nella query...</div>');
			});
		}
	});

	$('#btn-trails').click(function() {
		displayTrail();
	});

	$('#btn-easy').click(function() {
		filterHours(2);
	});

	$('#btn-medium').click(function() {
		filterHours(5);
	});

	$('#btn-hard').click(function() {
		filterHours(8);
	});

	$('[data-toggle="tooltip"]').tooltip();
});

function querySpot(montagne, laghi, rifugi) {
	// Assegno i codici relativi alle categorie
	var targets = [];
	if (montagne) {
		targets.push('T.MT');
		targets.push('T.PK');
		targets.push('T.PKS');
		targets.push('T.PASS');
		targets.push('T.VAL');
	}
	if (laghi) {
		targets.push('H.LK');
		targets.push('H.LKS');
	}
	if (rifugi) {
		targets.push('S.HUT');
	}

	var query = 'PREFIX gn: <http://www.geonames.org/ontology#>\
		PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>\
		PREFIX dbr: <http://dbpedia.org/resource/>\
		SELECT (?name AS ?Nome) (SAMPLE(?type) AS ?Categoria) (SAMPLE(?lat) AS ?Latitudine) (SAMPLE(?lon) AS ?Longitudine)\
		WHERE {\
	';

	// ?link gn:parentADM1 dbr:' + regione + ' .\
	for (var i = 0; i < targets.length; i++) {
		query = query + '{ ?link gn:name ?name .\
			?link gn:featureCode gn:' + targets[i] + ' .\
			?link gn:featureCode ?type .\
			?link geo:lat ?lat .\
			?link geo:long ?lon\
			}\
		';

		if (i < targets.length - 1) {
			query = query + 'UNION';
		} else {
			query = query + '} GROUP BY ?name ORDER BY ?type';
		}
	}
	console.log(query);
	var encodedQuery = encodeURIComponent(query);
	var encodedQueryURI = endpointURI + '?query=' + encodedQuery;
	return $.ajax({
		url: encodedQueryURI,
		dataType: 'json'
	});
}

// Composizione della tabella secondo i dati richiesti
function displaySpot(json) {
	$('.response').html("");
	table = '<table class="table table-responsive"><thead class="thead-default table-striped"><tr><th colspan="2">#</th>';
	var header = json.head.vars;
	for (var i = 0; i < header.length; i++) {
		table = table + '<th>' + header[i] + '</th>';
	}
	table = table + '</tr></thead><tbody>';
	var content = json.results.bindings;
	// console.log(content);
	for (var i = 0; i < content.length; i++) {
		table = table + '<tr class="click"><th scope="row">' + (i + 1) + '</th><td><button class="btn btn-sm btn-block btn-success" onclick="displayTrail(\'' + content[i].Nome.value.replace("'", "\\'") + '\', this)">Sentieri <i class="fa fa-fw fa-map-signs"></i></button></td><td>'
				+ content[i].Nome.value + '</td><td>' + translateType(content[i].Categoria.value) + '</td><td>' + content[i].Latitudine.value + '</td><td>' + content[i].Longitudine.value + '</td></tr>';
	}
	table = table + '</tbody></table>';
	$('.response').append(table);
}

// FUnzione che compone la query per i tre casi differenti: cerco tutti i sentieri, cerco i sentieri che portano ad un punto, cerco un sentiero nello specifico
function queryTrail(wanted) {
	var query = 'PREFIX gn: <http://www.geonames.org/ontology#>\
		SELECT (?name AS ?Nome) (SAMPLE(?code) AS ?Codice) (SAMPLE(?time) AS ?Tempo) (SAMPLE(?diff) AS ?Difficoltà)\
			(SAMPLE(?elevation) AS ?Dislivello) (SAMPLE(?p1) AS ?Partenza) (SAMPLE(?p2) AS ?Arrivo) (SAMPLE(?desc) AS ?Descrizione)\
			(SAMPLE(?poi1) AS ?PuntoDiInteresse1) (SAMPLE(?poi2) AS ?PuntoDiInteresse2) (SAMPLE(?poi3) AS ?PuntoDiInteresse3)\
			(SAMPLE(?cross) AS ?Crocevia)';
	if (wanted && !Number.isInteger(wanted)) {
		console.log("STRINGA");
		query += 'WHERE { {\
			?link gn:name ?name .\
		    ?link gn:trailCode ?code .\
		    ?link gn:travelTime ?time .\
		    ?link gn:difficulty ?diff .\
		    ?link gn:elevationGain ?elevation .\
		    ?link gn:startingP1 ?p1 .\
		    ?link gn:startingP2 ?p2 .\
		    ?link gn:description ?desc .\
		    ?link gn:featureCode gn:R.TRL .\
		    ?link gn:crossroads ?cross .\
			?link gn:nearbyPOI1 "' + wanted + '" .\
			?link gn:nearbyPOI2 ?poi2 .\
			?link gn:nearbyPOI3 ?poi3\
		} UNION {\
			?link gn:name ?name .\
		    ?link gn:trailCode ?code .\
		    ?link gn:travelTime ?time .\
		    ?link gn:difficulty ?diff .\
		    ?link gn:elevationGain ?elevation .\
		    ?link gn:startingP1 ?p1 .\
		    ?link gn:startingP2 ?p2 .\
		    ?link gn:description ?desc .\
		    ?link gn:featureCode gn:R.TRL .\
		    ?link gn:crossroads ?cross .\
		    ?link gn:nearbyPOI1 ?poi1 .\
			?link gn:nearbyPOI2 "' + wanted + '" .\
			?link gn:nearbyPOI3 ?poi3\
		} UNION {\
			?link gn:name ?name .\
		    ?link gn:trailCode ?code .\
		    ?link gn:travelTime ?time .\
		    ?link gn:difficulty ?diff .\
		    ?link gn:elevationGain ?elevation .\
		    ?link gn:startingP1 ?p1 .\
		    ?link gn:startingP2 ?p2 .\
		    ?link gn:description ?desc .\
		    ?link gn:featureCode gn:R.TRL .\
		    ?link gn:crossroads ?cross .\
		    ?link gn:nearbyPOI1 ?poi1 .\
		    ?link gn:nearbyPOI2 ?poi2 .\
			?link gn:nearbyPOI3 "' + wanted + '"\
		} }\
		GROUP BY ?name';
	} else if (Number.isInteger(wanted)) {
		console.log("INT");
		query += 'WHERE {\
			?link gn:name ?name .\
		    ?link gn:trailCode "' + wanted + '" .\
		    ?link gn:travelTime ?time .\
		    ?link gn:difficulty ?diff .\
		    ?link gn:elevationGain ?elevation .\
		    ?link gn:startingP1 ?p1 .\
		    ?link gn:startingP2 ?p2 .\
		    ?link gn:description ?desc .\
		    ?link gn:featureCode gn:R.TRL .\
			?link gn:nearbyPOI1 ?poi1 .\
			?link gn:nearbyPOI2 ?poi2 .\
			?link gn:nearbyPOI3 ?poi3 .\
			?link gn:crossroads ?cross\
		}\
		GROUP BY ?name ORDER BY ?code';	
	} else {
		console.log("VUOTO");
		query += 'WHERE {\
			?link gn:name ?name .\
		    ?link gn:trailCode ?code .\
		    ?link gn:travelTime ?time .\
		    ?link gn:difficulty ?diff .\
		    ?link gn:elevationGain ?elevation .\
		    ?link gn:startingP1 ?p1 .\
		    ?link gn:startingP2 ?p2 .\
		    ?link gn:description ?desc .\
		    ?link gn:featureCode gn:R.TRL .\
			?link gn:nearbyPOI1 ?poi1 .\
			?link gn:nearbyPOI2 ?poi2 .\
			?link gn:nearbyPOI3 ?poi3 .\
			?link gn:crossroads ?cross\
		}\
		GROUP BY ?name ORDER BY ?code';
	}

	console.log(query);
	var encodedQuery = encodeURIComponent(query);
	var encodedQueryURI = endpointURI + '?query=' + encodedQuery;
	return $.ajax({
		url: encodedQueryURI,
		dataType: 'json'
	});
}

function queryTrail(wanted) {
	var query = 'PREFIX gn: <http://www.geonames.org/ontology#>\
		SELECT (?name AS ?Nome) (SAMPLE(?code) AS ?Codice) (SAMPLE(?time) AS ?Tempo) (SAMPLE(?diff) AS ?Difficoltà)\
			(SAMPLE(?elevation) AS ?Dislivello) (SAMPLE(?p1) AS ?Partenza) (SAMPLE(?p2) AS ?Arrivo) (SAMPLE(?desc) AS ?Descrizione)\
			(SAMPLE(?poi1) AS ?PuntoDiInteresse1) (SAMPLE(?poi2) AS ?PuntoDiInteresse2) (SAMPLE(?poi3) AS ?PuntoDiInteresse3)\
			(SAMPLE(?cross) AS ?Crocevia)';
	if (wanted && !Number.isInteger(wanted)) {
		console.log("STRINGA");
		query += 'WHERE { {\
			?link gn:name ?name .\
		    ?link gn:trailCode ?code .\
		    ?link gn:travelTime ?time .\
		    ?link gn:difficulty ?diff .\
		    ?link gn:elevationGain ?elevation .\
		    ?link gn:startingP1 ?p1 .\
		    ?link gn:startingP2 ?p2 .\
		    ?link gn:description ?desc .\
		    ?link gn:featureCode gn:R.TRL .\
		    ?link gn:crossroads ?cross .\
			?link gn:nearbyPOI1 "' + wanted + '" .\
			?link gn:nearbyPOI2 ?poi2 .\
			?link gn:nearbyPOI3 ?poi3\
		} UNION {\
			?link gn:name ?name .\
		    ?link gn:trailCode ?code .\
		    ?link gn:travelTime ?time .\
		    ?link gn:difficulty ?diff .\
		    ?link gn:elevationGain ?elevation .\
		    ?link gn:startingP1 ?p1 .\
		    ?link gn:startingP2 ?p2 .\
		    ?link gn:description ?desc .\
		    ?link gn:featureCode gn:R.TRL .\
		    ?link gn:crossroads ?cross .\
		    ?link gn:nearbyPOI1 ?poi1 .\
			?link gn:nearbyPOI2 "' + wanted + '" .\
			?link gn:nearbyPOI3 ?poi3\
		} UNION {\
			?link gn:name ?name .\
		    ?link gn:trailCode ?code .\
		    ?link gn:travelTime ?time .\
		    ?link gn:difficulty ?diff .\
		    ?link gn:elevationGain ?elevation .\
		    ?link gn:startingP1 ?p1 .\
		    ?link gn:startingP2 ?p2 .\
		    ?link gn:description ?desc .\
		    ?link gn:featureCode gn:R.TRL .\
		    ?link gn:crossroads ?cross .\
		    ?link gn:nearbyPOI1 ?poi1 .\
		    ?link gn:nearbyPOI2 ?poi2 .\
			?link gn:nearbyPOI3 "' + wanted + '"\
		} }\
		GROUP BY ?name';
	} else if (Number.isInteger(wanted)) {
		console.log("INT");
		query += 'WHERE {\
			?link gn:name ?name .\
		    ?link gn:trailCode "' + wanted + '" .\
		    ?link gn:travelTime ?time .\
		    ?link gn:difficulty ?diff .\
		    ?link gn:elevationGain ?elevation .\
		    ?link gn:startingP1 ?p1 .\
		    ?link gn:startingP2 ?p2 .\
		    ?link gn:description ?desc .\
		    ?link gn:featureCode gn:R.TRL .\
			?link gn:nearbyPOI1 ?poi1 .\
			?link gn:nearbyPOI2 ?poi2 .\
			?link gn:nearbyPOI3 ?poi3 .\
			?link gn:crossroads ?cross\
		}\
		GROUP BY ?name ORDER BY ?code';	
	} else {
		console.log("VUOTO");
		query += 'WHERE {\
			?link gn:name ?name .\
		    ?link gn:trailCode ?code .\
		    ?link gn:travelTime ?time .\
		    ?link gn:difficulty ?diff .\
		    ?link gn:elevationGain ?elevation .\
		    ?link gn:startingP1 ?p1 .\
		    ?link gn:startingP2 ?p2 .\
		    ?link gn:description ?desc .\
		    ?link gn:featureCode gn:R.TRL .\
			?link gn:nearbyPOI1 ?poi1 .\
			?link gn:nearbyPOI2 ?poi2 .\
			?link gn:nearbyPOI3 ?poi3 .\
			?link gn:crossroads ?cross\
		}\
		GROUP BY ?name ORDER BY ?code';
	}

	console.log(query);
	var encodedQuery = encodeURIComponent(query);
	var encodedQueryURI = endpointURI + '?query=' + encodedQuery;
	return $.ajax({
		url: encodedQueryURI,
		dataType: 'json'
	});
}

function displayTrail(spot, button) {
	var promise = queryTrail(spot);
	promise.done(function(data) {
		var content = data.results.bindings;
		console.log(content);
		// Controllo che la ricerca di sentieri non sia stata vana
		if (content[0].Partenza != undefined) {
			// $('.progress-bar').attr("style", "width: 66%;");
			displayTrailCards(spot, content);
		} else {
			button.className = 'btn btn-sm btn-block btn-secondary';
			button.innerHTML = 'Assente';
			table = document.getElementsByClassName("table")[0];
		}
	});
	promise.fail(function() {
		$('.response').append('<div class="alert alert-danger text-center" role="alert">Qualcosa è andato storto nella query...</div>');
	})
}

function filterHours(hours) {
	var promise = queryTrail();
	promise.done(function(data) {
		var content = data.results.bindings;
		var thisContent = [];
		for (var i = 0; i < content.length; i++) {
			// Cerco sempre l'orario massimo per fare un filtro basato sulla stima peggiore
			var time = content[i].Tempo.value.replace('h', '');
			var times = time.split('-');
			var maxTime = (times[1] === undefined) ? times[0] : times[1];
			if (maxTime <= hours) {
				thisContent.push(content[i]);
			}
		}
		console.log(thisContent);
		displayTrailCards("Sentieri di " + hours + " ore", thisContent);
	});
	promise.fail(function() {
		$('.response').append('<div class="alert alert-danger text-center" role="alert">Qualcosa è andato storto nella query...</div>');
	})
}

function displayTrailCards(spot, content) {
	var newSpot;
	if (spot && !Number.isInteger(spot)) {
		newSpot = spot.toUpperCase();
	} else {
		newSpot = "SENTIERI";
	}
	$('.response').html("");
	$('.response').append('<div class="card card-title text-center border-success"><h3 class="card-header bg-success text-white">\
		<button class="btn pull-left btn-light" onclick="back()"><i class="fa fa-fw fa-arrow-left"></i> Home</button><i class="fa fa-fw fa-map-marker"></i> ' + newSpot + '</h3>\
		</div>');
	for (var i = 0; i < content.length; i++) {
		// Gestione casi diversi di query
		var poi1 = (content[i].PuntoDiInteresse1 === undefined) ? spot : content[i].PuntoDiInteresse1.value;
		var poi2 = (content[i].PuntoDiInteresse2 === undefined) ? spot : content[i].PuntoDiInteresse2.value;
		var poi3 = (content[i].PuntoDiInteresse3 === undefined) ? spot : content[i].PuntoDiInteresse3.value;
		var cod = (content[i].Codice === undefined) ? spot : content[i].Codice.value;
		var newCard = '<div class="row"><div class="col-6"><div class="card border-success">\
			<h4 class="card-header text-white bg-success"><i class="fa fa-fw fa-map-signs"></i> Sentiero ' + cod + '</h4>\
	  		<div class="card-body">\
	    		<h5 class="card-title">' + content[i].Nome.value + '</h5>\
	    		<ul class="list-group text-black">\
					<li class="list-group-item"><b>Partenza:</b> ' + content[i].Partenza.value + '</li>\
					<li class="list-group-item"><b>Arrivo:</b> ' + content[i].Arrivo.value + '</li>\
					<li class="list-group-item"><b>Difficoltà:</b> ' + content[i].Difficoltà.value + '</li>\
					<li class="list-group-item"><b>Dislivello:</b> ' + content[i].Dislivello.value + '</li>\
					<li class="list-group-item"><b>Tempo di percorrenza medio:</b> ' + content[i].Tempo.value + '</li>\
					<li class="list-group-item"><b>Punti di interesse:</b> ' + poi1 + ', ' + poi2 + ', ' + poi3 + '</li>\
					<li class="list-group-item"><b>Crocevia:</b> ' + linkCroce(content[i].Crocevia.value) + '</li>\
				</ul>\
			</div>\
			<div class="card-footer text-center">Ulteriori informazioni: <a href="' + content[i].Descrizione.value + '" target="_blank">www.caiauronzo.it</a></div>\
			</div></div>\
			<div class="col-6">\
				<div class="map" id="map' + i + '"></div>\
			</div></div></div>';
		$('.response').append(newCard);
		showMap(i, cod);
	}
}

function showMap(index, trailNumber) {
	// Inizializza la mappa
	var map = new google.maps.Map(document.getElementById('map' + index), {
		center: {lat: 46.6181881, lng: 12.2817772},
		zoom: 11
	});

	// cerca punti di partenza e arrivo
	var promise = queryPoints(trailNumber);
	promise.done(function(data) {
		setMarkers(map, data);
	});
	promise.fail(function() {
		$('#map' + index).append('<p>Oh no, something went wrong!</p>');
	});

	function setMarkers(map, data) {
		var letters = ["A", "B"];
		var content = data.results.bindings;
		for (var i = 0; i < content.length; i++) {
			var marker = new google.maps.Marker({
				position: {lat: Number(content[i].lat.value), lng: Number(content[i].lon.value)},
				map: map,
				animation: google.maps.Animation.DROP,
				label: letters[i]
			});
		}
	}
}

function queryPoints(number) {
	var query = 'PREFIX gn: <http://www.geonames.org/ontology#>\
		PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>\
		SELECT ?lat ?lon\
		WHERE {\
			?link gn:name ?name .\
    		?link gn:featureCode gn:R.TRLSTR .\
    		?link gn:linkedTrail "' + number + '" .\
    		?link geo:lat ?lat .\
    		?link geo:long ?lon\
    	} ORDER BY ?name';

    console.log(query);
	var encodedQuery = encodeURIComponent(query);
	var encodedQueryURI = endpointURI + '?query=' + encodedQuery;
	
	return $.ajax({
		url: encodedQueryURI,
		dataType: 'json'
	});
}

function translateType(type) {
	var response;
	switch (type) {
		case "http://www.geonames.org/ontology#T.MT":
			response = "Montagna";
			break;
		case "http://www.geonames.org/ontology#T.PK":
			response = "Cima";
			break;
		case "http://www.geonames.org/ontology#T.PKS":
			response = "Cime";
			break;
		case "http://www.geonames.org/ontology#T.PASS":
			response = "Passo";
			break;
		case "http://www.geonames.org/ontology#T.VAL":
			response = "Valle";
			break;
		case "http://www.geonames.org/ontology#H.LK":
		case "http://www.geonames.org/ontology#H.LKS":
			response = "Lago";
			break;
		case "http://www.geonames.org/ontology#S.HUT":
			response = "Rifugio";
			break;
		default:
			response = "Indefinito";
	}
	return response;
}

function linkCroce(numbers) {
	var links = "";
	var noLinks = "";
	var arr = numbers.split(", ");
	
	for (var i = 0; i < arr.length; i++) {
		for (var j = 0; j < trails.length; j++) {
			if (trails[j] == arr[i]) {
				links += '<button type="button" class="btn btn-outline-success croce-btn" onclick="displayTrail(' + arr[i] + ')">' + arr[i] + '</button>';
				break;
			}
			if (j == trails.length - 1) {
				noLinks += '<button type="button" class="btn btn-outline-success croce-btn" onclick="displayTrail(' + arr[i] + ')" disabled>' + arr[i] + '</button>';
			}
		}
	}
	return links + noLinks;
}

function back() {
	$('.response').html("");
	$('.response').append(table);
}