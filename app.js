var layer;
var elections;
// This array helps maintaining source order
var electionList;
var COLORS = {
    "Stimmen ungültig": "#f00",
    "Stimmen gültig": "#0f0",
    "Stimmen CDU": "#000",
    "Stimmen SPD": "#f00",
    "Stimmen Die Linke": "#a0a",
    "Stimmen FDP": "#ff0",
    "Stimmen Grüne": "#0f0",
    "Stimmen Rechte Parteien": "#553",
    "Stimmen sonstiger Parteien": "#333",
    "Stimmen AfD": "#33f",
    "Stimmen Piraten": "#f80",
};
var curElection = "Europawahl 2024";
var curParty = "Stimmen Piraten";

var maxPercent = 0;

function render() {
    maxPercent = 0.01;
    Object.keys(elections[curElection]).forEach(function(wb) {
	var record = elections[curElection][wb];
	var votes = record[curParty];
	var percent = 100 * votes / record["Stimmen gültig"];
	maxPercent = Math.max(percent, maxPercent);
    });
    console.log("maxPercent", maxPercent);

    // trigger geojson rerender
    if (layer) {
	layer.resetStyle();
    }
}

window.onload = function() {
    document.getElementById("map").innerText = "Download Wahlbezirke..."
    fetch("bezirke2024.geojson").then(function(res) {
	return res.json();
    }).then(function(geojson) {
	var map = L.map('map').setView([51.05, 13.75], 13);
	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    maxZoom: 19,
	    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);
	layer = L.geoJSON(geojson, {
	    style: function(feature) {
		if (!elections) {
		    return;
		}

		// console.log("style", feature.properties);
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
			    COLORS[curParty] +
			    " " +
			    Math.ceil(100 * percent / maxPercent) +
			    "%, #FFF)",
			fillOpacity: 0.75,
		    };
		} else {
		    console.warn("Not found:", feature.properties);
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
	    },
	// }).on("click", function(a) {
	//     console.log("click", a.layer?.feature?.properties?.wb);
	//     a.layer?.openTooltip();
	}).addTo(map);
    });

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
