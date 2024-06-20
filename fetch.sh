#! /usr/bin/env bash

set -e

wget -O europa.csv https://opendata.dresden.de/duva2dcat/dataset/de-sn-dresden-wahlen_-_europawahl_1999ff_wahlbezirk_stadtteil_stadtraum/content.csv

wget -O kommunal.csv https://opendata.dresden.de/duva2dcat/dataset/de-sn-dresden-wahlen_-_kommunalwahl_1999ff_wahlbezirk_stadtteil_stadtraum/content.csv

wget -O all.csv https://opendata.dresden.de/duva2dcat/dataset/de-sn-dresden-wahlen_1999_-_2019_ohne_ob-wahlen_od_wahlen_wahlbezirk_stadtteil_stadtraum/content.csv

wget -O bezirke2024.geojson https://kommisdd.dresden.de/net4/public/ogcapi/collections/L1565/items

wget https://unpkg.com/leaflet@1.9.4/dist/leaflet.css
wget https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
