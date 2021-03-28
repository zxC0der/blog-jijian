#!/bin/bash

node ./src/index.js https://www.zxcoder.top
git add .
if [ $# == 0 ];then
    git commit -m "update $(date +'%Y%m%d%H%M%S')"
else
    git commit -m "update $(date +'%Y%m%d%H%M%S') $1"
fi
git push origin master

# 百度推送
#curl -H 'Content-Type:text/plain' --data-binary @urls.txt "http://data.zz.baidu.com/urls?site=https://www.zxcoder.top&token=jfwGQqdRpfDpbosC"
