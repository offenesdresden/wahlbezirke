var map;
var layer;
var elections;
// This array helps maintaining source order
var electionList;
var COLORS = {
    "Stimmen ungültig": "#a00",
    "Stimmen CDU": "#000",
    "Stimmen SPD": "#a00",
    "Stimmen Die Linke": "#a0a",
    "Stimmen FDP": "#aa0",
    "Stimmen Grüne": "#0a0",
    "Stimmen Rechte Parteien": "#553",
    "Stimmen sonstiger Parteien": "#333",
    "Stimmen AfD": "#33f",
    "Stimmen Piraten": "#f80",
};
var GEOJSONS = {
    "Europawahl 1999": "bezirke_l2019.geojson",
    "Kommunalwahl 1999": "bezirke_k2019.geojson",
    "Landtagswahl 1999": "bezirke_l2019.geojson",
    "Bundestagswahl 2002": "bezirke_l2019.geojson",
    "Europawahl 2004": "bezirke_l2019.geojson",
    "Kommunalwahl 2004": "bezirke_k2019.geojson",
    "Landtagswahl 2004": "bezirke_l2019.geojson",
    "Bundestagswahl 2005": "bezirke_l2019.geojson",
    "Bundestagswahl 2009": "bezirke_l2019.geojson",
    "Europawahl 2009": "bezirke_l2019.geojson",
    "Kommunalwahl 2009": "bezirke_k2019.geojson",
    "Landtagswahl 2009": "bezirke_l2019.geojson",
    "Bundestagswahl 2013": "bezirke_l2019.geojson",
    "Europawahl 2014": "bezirke_l2019.geojson",
    "Kommunalwahl 2014": "bezirke_k2019.geojson",
    "Landtagswahl 2014": "bezirke_l2019.geojson",
    "Bundestagswahl 2017": "bezirke_l2019.geojson",
    "Europawahl 2019": "bezirke_l2019.geojson",
    "Kommunalwahl 2019": "bezirke_k2019.geojson",
    "Landtagswahl 2019": "bezirke_l2019.geojson",
    "Stadtbezirks- und Ortschaftsratswahl 2019": "bezirke_k2019.geojson",
    "Bundestagswahl 2021": "bezirke_b2021.geojson",
    "Europawahl 2024": "bezirke_e2024.geojson",
};
﻿
var curElection = "Europawahl 2024";
var curParty = "Stimmen Piraten";
var curGeojson = "";

var minPercent = 0;
var maxPercent = 0;

function render() {
    minPercent = 100;
    maxPercent = 0.01;
    Object.keys(elections[curElection]).forEach(function(wb) {
	var record = elections[curElection][wb];
	var votes = record[curParty];
	var percent = 100 * votes / record.total;
	maxPercent = Math.max(percent, maxPercent);
	minPercent = Math.min(percent, minPercent);
    });
    maxPercent = Math.max(minPercent + 0.01, maxPercent);

    var newGeojson = GEOJSONS[curElection];
    if (newGeojson !== curGeojson) {
	if (layer) {
	    layer.remove()
	}

	curGeojson = newGeojson;
	fetch(curGeojson, { cache: "force-cache" }).then(function(res) {
	    return res.json();
	}).then(function(geojson) {
	    if (curGeojson !== newGeojson) {
		return;
	    }

	    layer = L.geoJSON(geojson, {
		style: function(feature) {
		    if (!elections) {
			return;
		    }

		    var wb = feature.properties.wb;
		    var record = elections[curElection][wb];
		    if (record) {
			var votes = record[curParty];
			var percent = 100 * votes / record["Stimmen gültig"];
			return {
			    color: "#227",
			    weight: 1,
			    lineJoin: "miter-clip",
			    fillColor: "color-mix(in srgb, " +
				(COLORS[curParty] || "#070") +
				" " +
				Math.floor(100 * (percent - minPercent) / (maxPercent - minPercent)) +
				"%, #FFF)",
			    fillOpacity: 0.7,
			};
		    } else {
			return {
			    color: "#227",
			    weight: 1,
			    lineJoin: "miter-clip",
			    fillColor: "#333",
			    fillOpacity: 0,
			};
		    }
		},
		onEachFeature: function(feature, layer) {
		    layer.bindTooltip(feature.properties.wb_text);
		    layer.bindPopup(function() {
			var wb = feature.properties.wb;
			var record = elections[curElection][wb];
			var div = document.createElement("div");
			var h2 = document.createElement("h2");
			h2.append("Wahlkreis " + wb);
			div.append(h2);
			var h3 = document.createElement("h3");
			h3.append(feature.properties.wb_text);
			div.append(h3);
			if (record) {
			    Object.keys(COLORS).forEach(function(column) {
				var partyDiv = document.createElement("div");
				partyDiv.setAttribute("class", "party");
				var votes = record[column];
				var percent = Math.round(1000 * votes / record.total) / 10;
				var p1 = document.createElement("p");
				p1.setAttribute("class", "partyname");
				p1.append(column.replace(/^Stimmen /, ""));
				partyDiv.append(p1);
				var p2 = document.createElement("p");
				p2.setAttribute(
				    "style",
				    "width: " + Math.ceil(200 * votes / record.total) + "px; " +
					"border-bottom: 2px solid " + COLORS[column]
				);
				p2.append(percent + " %");
				partyDiv.append(p2);
				div.append(partyDiv);
			    });
			}
			var p = document.createElement("p");
			p.append(
			    record["Wahlberechtigte"] + " Wahlberechtigte, " +
				record["Wähler"] + " Wähler (" +
				Math.floor(1000 * record.total / Number(record["Wahlberechtigte"])) / 10 + "%)"
			);
			div.append(p);
			return div;
		    });
		},
	    }).addTo(map);
	});
    } else if (layer) {
	// trigger geojson rerender
	layer.resetStyle();
    }
}

window.onload = function() {
    map = L.map('map').setView([51.05, 13.75], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    fetch("all.csv").then(function(res) {
	return res.text();
    }).then(function(data) {
	var lines = data.split(/\r?\n/)
	    .filter(function(line) {
		return !!line;
	    })
	    .map(function(line) {
		var rawFields = line.split(",");
		var fields = [];
		var quote = false;
		rawFields.forEach(function(s) {
		    if (!quote) {
			if (s.startsWith('"')) {
			    quote = true;
			    s = s.slice(1);
			}
			fields.push(s);
		    } else {
			if (s.endsWith('"')) {
			    quote = false;
			    s = s.substr(0, s.length - 1);
			}
			fields[fields.length - 1] += "," + s;
		    }
		});
		return fields;
	    });
	var columns = lines.shift();
	var partiesDiv = document.getElementById("parties");
	columns.forEach(function(column) {
	    if (!column.startsWith("Stimmen ")) {
		// Ignore non-numeric columns
		return;
	    }

	    var label = document.createElement("label");
	    var input = document.createElement("input");
	    input.setAttribute("type", "radio");
	    input.setAttribute("name", "party");
	    if (column == curParty) {
		input.setAttribute("checked", "checked");
	    }
	    input.addEventListener("change", function() {
		curParty = column;
		render();
	    });
	    label.append(input);
	    label.append(column.slice(8));
	    partiesDiv.append(label);
	});
	partiesDiv.append();

	elections = {};
	electionList = [];
	lines.forEach(function(line) {
	    var record = {};
	    columns.forEach(function(column, i) {
		var value = line[i];
		if (column.startsWith("Stimmen ")) {
		    value = Number(value);
		}
		record[column] = value;
	    });
	    record.total = Math.max(1, Number(
		record["Stimmen gültig"] ||
		    record["Wähler mit WS"] ||
		    record["Wähler"] ||
		    record["Wahlberechtigte mit WS"] ||
		    record["Wahlberechtigte"]
	    ));
	    var election = record.Wahlart + " " + record.Jahr;
	    if (!elections[election]) {
		elections[election] = {};
		electionList.push(election);
	    }
	    elections[election][record.Wahlbezirk] = record;
	});
	var electionsSelect = document.getElementById("elections");
	electionList.forEach(function(election) {
	    var option = document.createElement("option");
	    option.setAttribute("value", election);
	    option.append(election);
	    electionsSelect.append(option);
	});
	electionsSelect.addEventListener("change", function() {
	    curElection = electionsSelect.value;
	    render();
	});

	electionsSelect.value = curElection;
	render();
    })
};
