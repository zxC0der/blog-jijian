#!/bin/bash

node ./src/index.js
git add .
git commit -m "update `date +'%Y%m%d%H%M%S'`"
git push origin master
