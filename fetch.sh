#! /usr/bin/env bash

set -e

wget -O all.csv https://opendata.dresden.de/duva2dcat/dataset/de-sn-dresden-wahlen_1999_-_2019_ohne_ob-wahlen_od_wahlen_wahlbezirk_stadtteil_stadtraum/content.csv

wget -O bezirke_k2019.geojson https://kommisdd.dresden.de/net4/public/ogcapi/collections/L1542/items
wget -O bezirke_l2019.geojson https://kommisdd.dresden.de/net4/public/ogcapi/collections/L1091/items
wget -O bezirke_b2021.geojson https://kommisdd.dresden.de/net4/public/ogcapi/collections/L703/items
wget -O bezirke_e2024.geojson https://kommisdd.dresden.de/net4/public/ogcapi/collections/L1565/items
wget -O bezirke_l2024.geojson https://kommisdd.dresden.de/net4/public/ogcapi/collections/L1588/items

wget https://unpkg.com/leaflet@1.9.4/dist/leaflet.css
wget https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
