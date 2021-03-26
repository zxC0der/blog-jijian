---
permalink: git-fundamental-memorandum
tags: 
  - git
  - 开发
category: 基础知识
title: Git基本操作备忘
date: 2021-02-21 23:23:18 +0800
math: true
---

## 基本概念

### Git

Git是一个分布式的版本控制系统。

### 工作区，暂存区和版本库

工作区(Workspace): 本地目录。
暂存区(Index): 指`.git/index`文件，修改会先添加到暂存区，再提交到版本库。
版本库(Repository): 可以认为整个`.git`就是版本库，Git所管理的文件数据都是保存在该文件夹里。

## 基本操作

### 初始化仓库

`git init`

### 添加到暂存区

`git add a.txt`

### 提交到版本库

`git commit -m "add a.txt"`

### 查看提交历史

`git log`包括该版本之前的版本提交信息。`git log --pretty=oneline`可以以单行简化输出。

`git reflog`包括所有分支的操作记录。

### 查看仓库状态

`git status`

查看整个版本库的状态，显示有变更的文件。

### 对比工作区和暂存区

`git diff a.txt`

`git diff`

### 对比暂存区和版本库

`git diff --cached a.txt`

`git diff --cached`

### 版本回退

对于已经提交到版本库的文件信息，通过`git reset --hard HEAD^`来回退到上一版本，其中版本指针`HEAD^`表示上一版本，上上版本是`HEAD^^`，上上上n个版本是`HEAD~n`，也可以用commit id来表示指针，即`git log`中的16进制字符串。

### 从暂存区回退

`git checkout -- a.txt`

该命令可以撤回工作区文件的修改(删除同理)，如果文件还没提交到暂存区，将回退到当前版本库的版本。如果文件已经提交到暂存区，将回退到上一次添加到暂存区后的版本。也就是让文件回到最近一次commit或者add的状态。

如果修改已经添加到暂存区，可以通过`git reset HEAD a.txt`将修改从暂存区撤销，回到工作区，然后再根据上一段的命令从工作区撤销(也可以用该命令同时执行暂存区和工作区的撤销)。

如果修改已经提交到版本库，就需要通过上一节的命令进行版本回退。

### 删除文件

`git rm a.txt`是同时删除版本库和工作区的文件，该命令执行后要`git commit`，而`git rm a.txt --cached`只删除版本库中的文件，让该文件不再收版本控制，但本地仍保留该文件。

## 远程仓库

### 关联远程仓库

首先在远程的Git托管平台上创建一个远程Git仓库，`git remote add origin git@github.com:zxc/learngit.git`命令将远程仓库和本地仓库相关联，这里使用的是默认的`git://`(ssh协议)，其中origin是远程仓库名字，通常都命名为origin，这里托管平台是github，用户名是zxc，仓库名是learngit。

### 推送到远程仓库

`git push -u origin master`将本地仓库推送到远程仓库origin，其中master表示将本地的master分支推送到远程的master分支，如果本地和远程分支名不同，则需要指定{本地分支名}:{远程分支名}，而-u是设置当前本地分支的上游分支，这样下次push的时候，在当前分支下，可以不指定远程分支。

### 克隆远程仓库

`git clone git@github.com:zxc/learngit.git`

TODO pull呢？

## 分支管理

Git里的分支都是直接通过修改指针的指向来管理，所以速度更快。Git的HEAD是指当前分支，默认是master，实际上所有提交版本构成了一个(多个)版本链，而master分支是一个指针，指向分支的最新版本，而HEAD也是一个指针，指向了当前分支。

### 列出分支

`git branch`

其中带*号的是当前分支。

### 创建并切换分支

`git checkout -b dev`

在新版本Git中，等同于`git switch -c dev`。

该命令表示创建并切换到dev分支，等同于先`git branch dev`创建分支，再`git checkout dev`(在新版本Git中，等同于`git switch dev`)切换分支。


### 合并分支

`git merge dev`

该命令将指定分支dev合并到当前分支，如果没有其他冲突，直接将master指针移动到dev指针处，速度很快。

### 删除分支

`git branch -d dev`

### 手动解决冲突

合并时如果文件发生冲突需要手动解决，此时文件会显示如下的内容，表示每个分支的不同修改，需要手动合并之后再提交。

```txt
<<<<<<< HEAD
Creating a new branch is quick & simple.
=======
Creating a new branch is quick AND simple.
>>>>>>> feature1
```

### 查看分支合并图

`git log --graph --pretty=oneline --abbrev-commit`

### 分支合并策略

默认的分支合并策略是Fast forward，比如`git merge dev`是直接将master指针指向dev，来达到合并的效果，这时候如果删除dev分支，就会直接丢失这个分支的所有提交动作，可以通过添加`--no-ff`参数，即`git merge --no-ff -m "merge" dev`，将合并作为一个新的提交，将两个提交合并起来，这样即使删除了dev分支，原先dev分支的提交动作已经合并在master分支上而不会丢失了。

### 临时保存进度

当一个分支的工作还没完成提交，这时候又有一个紧急bug需要处理，因此需要新建一个新的分支来操作，但是为了不影响这个分支的commit日志，这时候的修改还不能提交，如果直接切到bug分支进行修改，那么这个分支的修改就会丢失(即使添加到了暂存区，也是多个分支共享的)。

这时候可以使用`git stash`直接将整个工作区入栈保存起来。

然后切回master分支，再新建一个bug分支进行处理，之后回到dev分支。

`git stash list`可以查看所有暂存的工作区。

`git stash pop`恢复栈顶工作区并弹出。等同于`git stash apply stash@{0}`之后`git stash drop stash@{0}`，后面参数是list查看到的序号。

这时候发现其实修复的bug在dev分支也存在，因为dev分支是在修复bug之前新建的，所以这时候一种方法就是在dev分支重新执行一次bug修复，另一种方法就是使用`git cherry-pick xxxx`命令，其中xxxx是commit id，该命令可以将提交在该分支上重新执行一遍，当然如果存在冲突也需要手动处理。

### 多人协作

多人协作的工作模式通常是这样：

- `git push origin {branch}`尝试推送自己的修改。
- 如果推送失败，因为远程分支领先本地分支(别人先推送上去了)，需要先用`git pull origin {branch}`拉下来并尝试合并(设定上游之后可以简写为`git push`和`git pull`)。
- 如果合并有冲突，需要手动解决冲突，并提交。
- 如果没有冲突或者冲突已解决，再用`git push origin {branch}`推送。
- 如果提示`no tracking information`，说明本地分支和远程分支还没有链接关系，通过命令`git branch --set-upstream-to {branch} origin/{origi_branch}`设置上游分支即可。

### Rebase

`git rebase`

rebase操作可以把**本地未推送**的分叉提交历史整理成直线。

## 其他

### 标签

标签用来标记某一个版本，比起commit id更好记忆，本质上也是一个指向某个commit的不可变的指针。

`git tag v1.0 {commit id}`指给指定的commit打上v1.0的标签，如果忽略commit id，表示给最近的一个commit打上标签。

`git tag -a v1.0 -m "comment"`可以指定标签名和说明文字。

`git tag`查看所有标签。

`git show {tag name}`查看标签详细信息。

`git tag -d {tag name}`删除标签。

`git push origin {tag name} || --tags`可以将某个标签或者所有标签推送到远程origin分支上，默认不推送。

`git push origin :refs/tags/{tag name}`在删除本地标签之后删除远程标签。