---
tags: 
  - C#
  - dotnet
permalink: dotnet5-project-quick-start
category: 技术学习
title: dotnet5-项目快速起步
date: 2020-12-14 10:40:04 +0800
math: true
---

> 用最简单的方式介绍dotnet中我所用到的一小小小部分，更多具体信息需要查看官方文档。

## Solution和Project

一个Solution可以包括多个Project，比如在我的项目中，为了方便(<del>其实是电脑打开两个IDE太卡</del>)，把MongoDB-PBAC-Server/Client/Common三个Project放在同一个Solution里，其中sln文件就是Solution的相关配置文件，csproj文件就是Project的配置文件。

在这里，我的Project分为两种，\*-Common是一个Class Library(类库)，可以打包成NuGet包，另外两个是Console Application(控制台应用)，可以引入NuGet包，直接运行或者打包成可执行文件。

## 打包

`dotnet build`命令会将项目及其依赖包生成为一大堆二进制文件(.dll，.pdb等)。

`build`之后，通过`dotnet pack --no-build`命令可以将项目打包为NuGet包，也就是一个.nupkg文件，`--no-build`指明无需再build一次，所以也可以直接`pack`而不用先`buiid`。

也可以在csproj文件中指定`<GeneratePackageOnBuild>true</GeneratePackageOnBuild>`，这样子在`build`的时候会自动`pack`。

默认情况下会在`**/bin/Debug/`下生成一个.nupkg文件，更多选项可以参考文档。

得到的NuGet包可以放到某个文件夹里，然后在本地的NuGet配置文件(`~/.nuget/NuGet/NuGet.Config`)中指定路径，相当于添加本地源，这样子就可以通过`dotnet add`或者直接在IDE中安装NuGet包，对应的在csproj文件中就会有响应的`<PackageReference Include="" Version=""/>`。

## 发布

`dotnet publish -r linux-x64 -p:PublishSingleFile=true -p:PublishTrimmed=true`，该命令默认会在`**/bin/Debug/net5.0/linux-x64/publish`下生成一个可执行文件。

其中`-r`后面接linux-x64是指定运行时(runtime)，而`PublishSingleFile=true`和`PublishTrimmed=true`分别表示生成单个可执行文件以及对生成的文件进行裁剪，减小文件大小。

## build和publish

简单来说，`build`不会把第三方的依赖包打包进入，所以`build`之后的可执行文件可以在本机运行，在运行时依赖本地的依赖包，而`publish`是专门用于发布的，所以会将所有依赖包打包进入，可以直接移植到其他机器运行。

根据官方文档，其实在.Net Core3.0之后的项目，库依赖项会被打包到输出文件夹。 如果没有其他任何特定于发布的逻辑(例如，Web项目具有的逻辑)，也可以直接部署。
