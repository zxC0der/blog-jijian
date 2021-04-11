---
permalink: rider-docker-dotnet-webapi-tutorial
tags: 
  - docker
  - dotnet
  - Bug Fixed
math: true
category: 技术学习
title: 使用Rider基于Docker进行dotnet-webapi开发入门
date: 2021-04-11 19:00:50 +0800
---

## Tutorial

本文根据一个实际例子，记录使用Rider基于docker进行dotnet-webapi开发的方法，用于个人备忘，后续还会总结Docker的更多知识点。

- 创建Web Api项目，Docker Support选择Linux。
- 此时在项目根目录多了一个Dockerfile和一个.dockerignore，Dockerfile是用来指示如何构建镜像，.dockerignore是说明在构建过程中忽略的文件。
- 使用命令行`docker build -t [image_name]:[version] .`构建或者通过Rider的可视化操作构建。如果使用命令行构建，要记得最后的`.`，指定当前路径为构建的上下文路径。
- 如果是多项目的Solution，此时默认生成的Dockerfile会报错，需要修改几处内容，具体见下文的Dockerfile解析。

```
# 基础镜像(就是个装好了dotnet的Linux系统...)
# FROM ... AS ... 是多阶段构建，后面总结讲
# 第一阶段
FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base

# https://stackoverflow.com/questions/48669548/why-does-aspnet-core-start-on-port-80-from-within-docker
# 定义环境变量，这里将容器内启动端口修改为5000，默认为80和443
ENV ASPNETCORE_URLS = http://+:5000

# 工作目录，就是Linux系统的/app路径
WORKDIR /app

# 声明端口，只是为了帮助使用者理解，方便配置端口映射
EXPOSE 80
EXPOSE 443
EXPOSE 5000

# 第二阶段
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build

# 如果是src，那么WORKDIR是相对路径，这里是/src，是绝对路径
WORKDIR /src

# 复制文件，将当前上下文路径的JudgeServer.csproj复制到WORKDIR下的JudgeServer(这里需要修改)
COPY ["JudgeServer.csproj", "JudgeServer/"]
# 执行命令
RUN dotnet restore "JudgeServer/JudgeServer.csproj"

WORKDIR "/src/JudgeServer"

# COPY的另一种形式，把项目源码复制到JudgeServer目录下
COPY . .

RUN dotnet build "JudgeServer.csproj" -c Release -o /app/build

# 第三阶段
FROM build AS publish
RUN dotnet publish "JudgeServer.csproj" -c Release -o /app/publish

# 第四阶段
FROM base AS final
WORKDIR /app

# --from表示从某一阶段的镜像中复制文件
COPY --from=publish /app/publish .

# RUN相当于执行命令修改镜像然后commit，新建了一层构建新的镜像
# CMD是容器启动时运行的程序和参数，比如Ubuntu镜像，默认CMD就是/bin/bash，可以在运行时指定覆盖。
# ENTRYPOINT可以简单认为和CMD一样，具体可以参考这个教程https://yeasy.gitbook.io/docker_practice/image/dockerfile/entrypoint
ENTRYPOINT ["dotnet", "JudgeServer.dll"]
```

关于`FROM ... AS ...`，在Dockerfile中，每一个RUN都会让镜像新增layer，导致镜像变大，为了解决这个问题，从17.05版本开始Docker增加了新特性：多阶段构建(multi-stage builds)，将构建过程分为多个阶段，每个阶段都可以指定一个基础镜像。

例如在这个Dockerfile中，一共有四个阶段:

- FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
- FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
- FROM build AS publish
- FROM base AS final

第一阶段base拉了一个aspnet镜像用于运行dotnet应用，声明了一些环境变量，工作目录。

第二阶段build拉了一个dotnet/sdk镜像用于生成构建dotnet应用，复制项目源码然后构建。

第三阶段publish基于build，发布项目。

第四阶段final基于base，运行项目

整个过程，多阶段构建的作用体现在哪呢？可以exec进容器，发现只多了一个/app目录以及下面的文件，其他的像/src，/app/build，/app/publish目录都不存在。所以可以这么理解，多阶段构建就是将整个Dockerfile分成几个部分，可以单独构建其中一个target，其他阶段都不会生成镜像，但是也可以从其他阶段里复制文件，比如这里第四阶段final是直接基于base，所以不需要考虑/src目录和源码的打包发布，直接从将ublish阶段已发布的文件复制过来即可，这样子可以大大减小镜像体积。

最后启动一个该镜像的容器，映射5000端口，就可以从外部访问了。

附上一个无语的debug经历...

用IDE启动容器再映射端口可以正常访问，但是命令行启动就一直不行，多次尝试无果。

冷静下来后考虑，可以尝试使用IDE构建的镜像在命令行run试试，然而发现IDE和命令行构建的镜像其实是完全一致的。

所以排除掉镜像的问题，也就只能是命令行run的时候出问题。

使用`docker ps`一看，发现命令行启动的容器根本没有映射到外部的端口，再仔细看看运行命令`docker run -it judge -p 5000:5000`，问题很sb，docker run指定的image应该放在指定端口的option后面，即完整命令是`docker run [OPTIONS] IMAGE [COMMAND] [ARG...]`。

至此，问题解决，还是那句话，**能用就行，到最后可能就不能用了...**，要吸取教训，减少此类浪费时间的操作。