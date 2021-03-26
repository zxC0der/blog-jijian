---
tags: 
  - CMU15-445
  - 数据库
title: CMU15-445(19-fall)-Project1-Buffer-Pool-Manager
date: 2020-11-16 18:45:51 +0800
permalink: cmu15445-19fall-project1
category: 技术学习
math: true
---

> 由于课程禁止公开项目代码，所以如果有同样在做这个项目的同学对我的实现感兴趣，或者发现其中存在什么问题欢迎联系我，邮箱：1129142694@qq.com

## 理论基础

### Introduction of DBMS 

广义的数据库应该是指存储数据的地方，比如一个文件其实也是一个数据库，而数据库管理系统(DBMS)才是我们对数据库进行操作，管理的一个软件，也是我们这个project要实现的。

一个最基本的DBMS会由查询解析/编译器，执行引擎，索引管理器，缓冲区管理器，磁盘管理器，物理存储等几部分组成，另外还应该包括事务管理，日志恢复，并发控制等功能。在这个project中，我们主要实现的是后端部分，也就是关注以下几个部分。

- Query Planning
- Operator Execution
- Access Methods
- Buffer Pool Manager
- Disk Manager

### Database Storage Part #1

#### File Storage

为了实现对内存更好的控制，项目没有采用操作系统的缓存/虚拟内存技术，而是需要我们手动实现一个页面缓冲池管理器，...

DBMS通过包含页(Page，一块数据)的一个或多个文件来组织数据库(**通俗来讲，就是最少按一个页来操作数据的，比如一次从文件里读取一个页(16KB)的数据，这些数据里可能存储了多个元祖，或者存储了索引等**)，实际的硬件存储也有页的概念，一个磁盘页通常是4KB，所以一个4KB的页面的读写是自带有原子性的，但是一个数据库的页通常不止4KB，所以读取时需要采取额外的措施来保证并发安全。

DBMS通常是通过heap file的形式来组织文件中的这些Page(**通俗来讲，就是这些page(本质就是一块数据)是以什么顺序存放在一个文件里的，所以需要维护一些元数据来跟踪每个Page的位置，以及当前的空闲位置**)，通常有两种实现方式，链表或者页面文件(Page Directory)的形式，简单来说一个是链表存储，每次要找一个Page都需要从Header page开始找，一个是类似索引，Directory page里维护了每个Page在文件中的位置以及空闲的slot(一个Page有多个slot可以放数据)，所以DBMS必须保证Directory page的同步。

#### Page Layout

每个Page有一个Header来维护一些元数据，比如存储的元组(tuple)个数(假设存储的都是元组)，校验和，版本号，事务相关，压缩信息等等。具体每个Page存储元组的方式有slotted-page和log-structured两种。slotted page就是Page的Header部分维护一个slot表，指向当前存储的元组，而实际元组存储是从后往前，从Page的最后一个内存位置开始存储。类似于栈和堆的相向增长，直到两者相遇。另外一种方式log-structured则是指Page不存储具体的元组，而是存储数据库更新的记录，包括Insert，Update和Delete等，通过逆序扫描Page的日志记录，就可以查询所需的元组，为了提高扫描效率，可以添加日志的索引方便在记录中跳跃查找，以及对日志进行压缩。

#### Tuple Layout

最后一部分是元组的存储结构，同样有Header和其他Attribute Data，每个元组会有一个独一无二的identifier，通常是Page id+offset/slot。

### Database Storage Part #2

#### Data Representation

文件中存储的一个元组其实就是一些字节序列，所以DBMS需要能够将这些字节序列解析表示数据库里实际的类型(Type)和值(Value)。

#### System Catalogs

系统目录(System Catalogs)是DBMS内部存储的关于数据库的元数据，包括表，列，索引，视图，用户权限，内部统计等信息，其实也就是一个保存元数据的表。

#### Storage Models

OLTP(On-Line Transaction Processing)：联机事务处理，关系型数据库基本日常的简单查询，事务处理。

OLAP(On-Line Analytical Processing)：联机分析处理，应用在大型数据仓库，支持复杂的分析查询操作。

DMBS可以以不同的方式来组织元组的存储，使得可以满足不同数据量，不同场景的应用(OLTP or OLAP)。

在这个project中，我们将使用n-ary storage model(n-ary存储模型)，也叫row storage(行存储)，也就是将连续元组的所有属性保存在一个Page里，这种存储模型适用于OLTP。另外一种存储模型是decomposition storage model，也叫column storage(列存储)，也就是一个Page保存的是连续元组的同一个属性，这种存储模型适用于OLAP。

### Buffer Pool

#### Buffer Pool Manager

数据库的存储第一个问题是"How the DBMS represents the database in files on disk"，即DBMS如何用磁盘里的文件来表示数据库，第二个问题则是"How the DBMS manages its memory and move data back-and-forth from disk"，即DBMS如何管理内存，在磁盘和内存之间来回移动数据。

和磁盘文件分成多个Page(不是hardware page，而是DBMS组织的抽象Page)一样，DMBS将一块内存空间分为多个大小和Page相同的Frame，当DBMS请求一个页面，就从磁盘里读取并放到对应的空Frame上，然后用一个表(Page Table)来维护每个Page在缓冲区(Frame Table)的位置，同时也要维护两个标记：dirty flag和pin counter。其中dirty flag就表示这个页面的数据有没有被写过，是否需要刷会磁盘，而pin counter顾名思义，表示有多少个操作/线程pin(钉)住了这个页面，在对这个页面进行操作，所以这时候不能将这个页面淘汰出内存。

我们可以对缓冲池进行一些优化，包括以下几种操作。

- Multiple Buffer Pool，多个缓冲池，可以通过对page id进行哈希来判断使用哪一个缓冲池，或者可以每个表使用一个缓冲池。好处就是可以对每一个缓冲池采用单独的页面替换策略。
- Pre-Fetching，预先将可能需要用到的磁盘page读取到缓冲池中，而不是等到用到才去一页一页读取。这些page在磁盘中可能不连续，但可以通过索引进行跳转。
- Scan Sharing，多个查询可以共享一些从磁盘查到的数据，查询并不需要完全相同，可能是共享一些中间结果。也就是一个线程查询的cursor可以先attach在另一个已经开始的查询线程中，先查两者剩下的查询中共有的，然后再回过头去查剩下的，避免缓冲池页面的频繁进出替换。
- Buffer Pool ByPass，为了查询一些临时的数据，不想污染缓冲池，可以直接将磁盘读取到的page放到一块另外的内存里，当查询完成后就释放掉这块内存。

#### Replacement Policies

缓冲池的另外的一个重要部分就是页面替换策略，即当缓冲池空间不足时将某个页面淘汰的策略。最常见的替换策略是LRU(Least Recently Used)，即最近最少使用，通过一个链表和一个维护位置的哈希表可以实现。Clock，时钟算法是LRU算法的近似算法，简单来说就是通过模拟时钟的指针不断循环扫描整个page table，扫到的slot对应的页面就应该被淘汰，但如果这个页面当前正在被使用(pin)，可以有一次拯救的机会，将pin标记置为0，下一次再扫到这个slot，如果标记为0，就直接淘汰。

这两种策略是最基本的替换策略，实际上还有很多优化的版本。

## 具体实现

Project \#1目标是实现一个Buffer Pool Manager(缓冲池管理器)用于管理内存中的缓冲池，以及缓冲区必须要有的页面置换算法，包括LRU和Clock算法。

缓冲池就是指内存里一块特定区域，用于缓存一些从磁盘读取的页面，对应到代码中，就是一个Page数组，每个Page元素就保存有数据和一些元数据。Page数组的下标其实就是frame id，所以这个数组其实可以看成frame id对page的映射，也就是哪一个frame放了哪个page，而一般情况下我们是需要通过page id来查找page的位置，所以显然需要另外一个映射关系表示从page id到frame id的映射，理论上也是一个数值数组就行，不过为了逻辑上更加合理，可以采用哈希表，也就是上面提到的page table。

然后管理器里还可以再维护一个free list，保存空闲的frame id，初始化整个缓冲池是空的，所以free list就是满的。

Replacer是管理器的另外一个重要组件，也就是替换策略的实现，其实就是维护一些已被使用的page所对应的frame id，当缓冲池需要放一个新页面，但是free list已经为空，也就是缓冲池已满，那就需要通过调用Replacer的Victim方法来淘汰掉某一个frame id所对应的page。

并发安全的实现采用std的互斥量mutex类来实现，原始的方法是采用mutex 的lock/trylock方法来加锁，unlock方法来解锁。更常见的是用lock_guard这个模板类，实现在作用域结束后自动调用析构函数，执行unlock方法。

### ClockReplacer

时钟的大小和缓冲池大小一样，对应每个位置(也就是每一个frame id)有两个标记，一个标记记录这个frame是否真正在Replacer中，这是为了方便处理，用静态大小的数组可以无需处理frame动态的进出，另一个标记是Clock算法中的记录最近是否被使用，更准确地说应该是最近是否被使用结束后被加到Replacer中，如果是，则标记为1。

Replacer包括3个主要函数，Pin函数表示这个页面被某个线程引用了，要对这个页面进行读写操作，所以显然不能放在Replacer里，如果在里面就要拿出来，反过来如果一个页面不再被引用了，即pin count减到0，就应该调用Unpin函数，将这个frame加入Replacer，随时可以被淘汰。

Victim函数就是选择淘汰某个页面，也是置换算法的核心，维护一个指针位置clockHand，然后循环扫过每一个"在"Replacer里的frame，如果frame的最近访问标志为true，置为false，即给了一次"自我拯救"的机会，如果是false，就需要将这个frame对应的page淘汰掉，返回该frame id即可。

### LRUReplacer

这个比较简单，用一个链表放frame id，同时用一个哈希表维护frame id在链表中的位置(迭代器)，同样包括三个主要函数，Pin就是将frame从链表中移除，Unpin就是将frame加入链表尾部，如果已经在链表中就直接过，Victim就是将链表头部的frame淘汰。

这里跟想象中的LRU似乎不太一样，第一次实现Pin函数是把frame从链表中移到尾部，从单元测试来看，这里直接删除似乎更为合理。

### Buffer Pool Manager

缓冲池管理器作用就是管理缓冲池，包括页面的读写存取，页面的替换等。包括几个主要函数：

- FlushPage，给定page id，如果该页面在缓冲池中且脏标记为true，将其刷回磁盘，记得要将脏标记置为false。
- UnpinPage，给定page id和一个脏标记，表示对这个页面的操作结束以及是否有修改，找到对应页面，将pin count减1，如果pin count减为0，就要调用Replacer的Unpin方法，将这个frame加入Replacer中。
- DeletePage，从缓冲池中删掉一个页面，其实也就是将内存清空，将一些对应关系清空。
- NewPage，在缓冲池中新建一个空页面，从free list或者Replacer里取出/淘汰一个frame，然后通过磁盘管理器的AllocatePage函数创建一个新页面，返回对应的page id，添加上frame id和page id的对应关系。这个操作也就是执行写操作，即把数据先写到内存里，等再刷回磁盘，所以脏标记是true。
- FetchPage，通过page id读取对应页面，如果缓冲池里有直接读取，如果没有，同样是需要从free list里或者Replacer里淘汰一个frame，然后从磁盘里读取对应页面到缓冲池里。
