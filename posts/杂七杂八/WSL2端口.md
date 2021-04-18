---
draft: true
---

冷静下来后开始debug查找原因

首先用nodejs的http-server启动一个静态服务器，可以访问

然后直接启动dotnet项目，可以访问

很可能是docker的问题了

再测试用docker开个其他服务看看，http-server可以访问

所以不是docker的问题

而是docker和dotnet的问题

最后发现问题居然是swagger的问题？？？服务接口其实是正常的，只是swagger的ui显示不了



一个感想

在查isolate issue的时候看到judge0的那个老哥，2017年2月的时候还在isolate issue上提问关于cgroup的问题，问的也是比较简单的问题，然后到了2017年10月，就在另一个issue下回答了另一个人的提问，而且恰好是他的这个回答解决了我今天的问题。而且2017年10月，judge0也发了v1.0.0版本，不得不说，这老哥学习能力，执行力是真的强。