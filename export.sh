#! /usr/bin/env bash

set -e

git branch -D gh-pages || true
git co -b gh-pages

git rm .gitignore
git add *.js *.geojson *.css *.csv
git push origin HEAD:gh-pages -f

git co main
