---
tags: 
  - git
  - debug
permalink: a-suck-debug-for-git
category: 杂七杂八
title: 一次关于git的简单查错
date: 2020-12-28 20:30:37 +0800
math: true
---

本地一个项目突然push不上，报错是

```
ERROR: Repository not found.
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

没有权限，第一步检查了github，**确定有这个仓库**，然后**检查了ssh key**，本地和github上的都没有问题，也重新添加了，仍然不行，所以不是这个问题。

再接下来通过`git remote -v`**检查远程仓库链接**，没有问题，通过`git remote rm origin`和`git remote add origin`重新添加后还行不行。

然后通过`git config user.name/user.email`检查本地仓库的用户名和邮箱，也没问题。

想到大概率是两个ssh key的问题，因为之前博客放在小号的github上，所以本地配置了两个ssh密钥对，附上过程：

通过`ssh-keygen -t rsa -C 'xx@xx.com' -f ~/.ssh/xxx`生成一个新的密钥对，然后在`~/.ssh/config`中配置

```
Host github.com
HostName github.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/id_rsa

Host zxc.github.com
HostName github.com
PreferredAuthentications publickey		
IdentityFile ~/.ssh/xxx
```

这里因为两个都是用在github上，所以host应该加个子域名区分，如果是不同网站，比如gitee，直接gitee.com就行。

因此，重新仔细检查了`~/.ssh/config`文件，最后发现问题是把`id_rsa`打成了`id-rsa`...