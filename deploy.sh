#!/bin/bash

node ./src/index_v2.js https://www.zxcoder.top
git add .
if [ $# == 0 ];then
    git commit -m "update $(date +'%Y%m%d%H%M%S')"
else
    git commit -m "update $(date +'%Y%m%d%H%M%S') $1"
fi
git push origin master
