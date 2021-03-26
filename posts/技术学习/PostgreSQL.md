---
draft: true
---

## docker安装隔离环境

(以下命令在root用户下执行或者添加当前用户到docker用户组)

- 从docker-hub拉取ubuntu最新(20.04 LTS)镜像。

```
docker pull ubuntu
```

- 启动容器

```
docker run -d ubuntu:latest
```

- 进入容器

```
docker exec -it {container id} /bin/bash 
```

- 更新软件源

可以把一些基础软件和配置的命令写入Dockerfile，构建一个新的镜像。

```
apt update
```

注意在容器内如果使用`exit`退出，该容器会停止，此时单纯`docker ps`的话看不到，需要加`-a`参数显示所有容器。然后通过`docker start {container id/container name}`启动容器，同理还有`stop`和`restart`命令。

在命令行操作时容器id有时候不容易记，可以在第一次启动容器的时候通过`--name={container name}`指定容器名，或者通过`docker rename {old_name} {new_name}`进行改名。

而如果要让退出容器命令行之后容器继续执行，应该使用Ctrl+P和Ctrl+Q退出。

## 使用vscode remote development

vscode的remote development是一大亮点，可以很方便地结合可视化操作和命令行，在远程服务器(也就包括了docker)上进行开发。

- 配置Docker

修改配置文件`/lib/systemd/system/docker.service`。

将`ExecStart=/usr/bin/dockerd -H fd://`修改为`ExecStart=/usr/bin/dockerd -H unix:///var/run/docker.sock -H tcp://0.0.0.0:2375`(我机器配置文件默认不需要修改)。

重启配置生效(如果修改)。

```
systemctl daemon-reload
systemctl restart docker
```

- 安装配置Docker拓展

安装Docker拓展，在设置中配置docker:host为`tcp://127.0.0.1:2375`，打开左边栏的docker图标，连接成功则会出现镜像和容器的管理界面。

- 安装配置Remote-Containers拓展

安装Remote-Containers拓展，打开左下角remote development按钮，选择`Remote-Containers:Attach to Running Container...`，即可连接到一个运行的容器进行远程开发。

## postgre源码安装

参考官方文档16.3，安装最新的PostgreSQL 13.1版本。

- 下载源码

```
wget https://ftp.postgresql.org/pub/source/v13.1/postgresql-13.1.tar.gz
```

- 解压

其中x表示解压，z表示解压gzip类型的压缩文件，v表示显示解压过程，f一定是最后一个参数，指定解压的文件名。

```
tar -xzvf postgresql-13.1.tar.gz
```

- 编译安装

Linux源码安装软件通常都是通过

```
./configure
make
make install
```

三部曲来完成，具体可以参考[这篇文章](https://juejin.cn/post/6844903911648657416)和[这篇文章](https://www.cnblogs.com/tinywan/p/7230039.html)的讲解。

整个编译安装过程需要的依赖和工具库包括gcc，make，readline(libreadline-dev)和zlib(zlib1g-dev)。

为了避免编译生成的中间文件和源文件混在一起，可以单独建一个文件夹，比如build_dir，然后在该文件夹下执行`configure`，编译的所有中间结果就都会放在这个文件夹下。

默认安装目录是`/usr/local/pgsql`，可以在`./configure`配置时通过`--prefix={install_dir}`来指定安装目录。

然后配置环境变量，修改`~/.bash_profile`，加上

```
PATH=/usr/local/pgsql/bin:$PATH
export PATH
```

使用`source ~/.bash_profile`使生效。

## 服务端

官方文档18章。

### 18.1 PostgreSQL的用户

PostgreSQL是建议用一个单独的用户来运行PostgreSQL，该用户拥有这个数据库节点的数据。

并且出于安全考虑，这个用户最好不是安装PostgreSQL的用户，也就是没有执行PostgreSQL可执行文件的权限。

通过包安装会自动创建一个名为postgres的用户，通过源码安装则不会自动创建用户，可以通过`adduser`命令创建系统用户，同时也就是数据库的管理员用户。

### 18.2 创建一个数据库集群

在使用数据库之前，必须在磁盘上初始化一块存储区域，称为数据库集群(database cluster)，在初始化之后，一个数据库集群会包括两个自带的数据库`postgres`和`template1`。

使用`initdb`命令来初始化这块数据存储区域，必须使用参数`-D`指定路径，通常放在`/usr/local/pgsql/data`下。

注意从现在开始，要使用一个新的用户`zxc`，通过`su zxc`切换。

使用`adduser`创建用户时，可以会有一个警告

```
perl: warning: Setting locale failed.
perl: warning: Please check that your locale settings:
        LANGUAGE = (unset),
        LC_ALL = (unset),
        LANG = "en_US.UTF-8"
    are supported and installed on your system.
perl: warning: Falling back to the standard locale ("C").
```

会导致后面`initdb`命令也出现错误，为了解决这个问题，先`exit`回到root用户，安装`localse`包，然后`locale-gen en_US.UTF-8`。

注意还要通过`chown zxc /usr/local/pgsql/data`给用户zxc添加对数据目录的读写权限(因为目录是`/`下的)。

然后现在正常的话就能使用`initdb`命令进行初始化了。

## 客户端


