---
tags: 
  - CMU15-445
  - 数据库
title: CMU15-445(19-fall)-Project2-Hash-Index
date: 2020-11-17 17:04:10 +0800
permalink: cmu15445-19fall-project2
category: 技术学习
math: true
---

> 由于课程禁止公开项目代码，所以如果有同样在做这个项目的同学对我的实现感兴趣，或者发现其中存在什么问题欢迎联系我，邮箱：1129142694@qq.com

## 理论基础

DBMS内部会使用多种数据结构，具体用途包括表示内部的元数据，存储核心数据，执行查询时的临时数据结构(比如join时用了哈希表)，数据库索引。

对于一个哈希表我们通常会关注两个部分，一个是Hash Function(哈希函数)，另一个是Hashing Scheme(哈希冲突解决方案)。

对于不同的哈希函数，通常我们会关注它的速度和冲突率。

对于哈希冲突时的解决方案，该课程提供了3种静态和3种动态方案：

静态方案：

- Linear Probe Hashing：线性探测，最简单的方案之一，也是我们Project中要实现的，即当发生哈希冲突时，直接尝试下一个slot，直到可以放下为止。
- Robin Hood Hashing：线性探测的改进，对于普通的线性探测，如果如果冲突的key很多，可能会导致后面的key查询花费非常大，robing hood方案就是对每个slot的key维护一个数字，表示离实际哈希位置的距离，然后线性探测的时候，如果探测到某个slot的key的这个距离小于要插入的这个key当前离哈希位置的距离，为了"劫富济贫"，就应该把这个位置让给这个新插入的key，而原来的key就要另寻位置。
- Cuckoo Hashing：布谷鸟方案，维护多个哈希函数，对应多个哈希表，以2个为例，对于一个key的插入，先计算每个哈希函数的值，然后在多个哈希表中找到有空闲slot的一个，放下，如果多个哈希表都冲突了，选择其中一个，替换原有的key，原有的key重新使用该方案查找可以插入的slot，直到所有key都可以放下。

动态方案：

- Chained Hashing：链地址法，用一个链表来保存冲突的key。
- Extendible Hashing：可拓展哈希，基于二进制位，重点就是每个block放的key都是有相同长度的二进制前缀，所以需要维护每个block的深度(也就是这个前缀长度)，以及全局的深度(最大的block深度)，而哈希表slot的数量就刚好等于2的深度次幂，当block满时就分裂并更新深度和哈希表slot。
- Linear Hashing：线性哈希，重点在于不是当block溢出是分裂，而是维护一个split pointer，指向下一个需要分裂的位置，当插入时**任意一个**block溢出，先用链地址法解决(仍然属于溢出)，然后添加一个哈希函数，然后将split pointer指向的block重新哈希并分裂，然后移动split pointer到下一位，这样查找时如果发现哈希后的位置在split pointer之上，说明需要进行第二次哈希。当split pointer移动到最后一个slot之后，直接删除第一个哈希，将split pointer移动到顶端，重新开始。

(后面这几种哈希方案第一次见，有一说一，还是很秀的，最后一个有点看不太懂，或者说有点难描述。

## 具体实现

Project \#2目标是实现一个哈希表作为数据库中的基础数据结构，使用线性探测来解决哈希冲突。

这里实现的哈希表和之前理解的哈希表没有本质的区别，有一点不同就是后者因为可以完全加载到内存中，所以其实就是一个k-v对的数组，而前者的不行，必须将哈希表必须分成多个部分(block)，一个page就放一个block，按需加载进内存。

### Header Page

维护哈希表的一些元数据，包括bucket(存放k-v对的桶，一个block里有多个bucket)数量，blcok数量以及所有block对应的page id。

### Block Page

存放实际数据的page，一个block包含一个k-v对数组，以及两个标记数组，occupied表示该bucket是否被占用，readable表示该bucket如果被占用是有效k-v对还是已经被懒删除。这里采用atomic_char(8位)来表示8个bucket的状态，同时可以通过cas技术来实现线程安全。

同时包括两个主要函数，Insert和Remove。

Insert首先通过cas判断occupied对应位是否为0，若是，置为1(cas自动实现)并插入数据，同时将readable对应位修改为1，若否，说明已经有k-v对占用，再次通过cas判断readable是否为0，若是，置为1(cas自动实现)并插入数据，若否，插入失败，返回false，由上层的哈希算法去决定如何处理。

Remove采用懒删除的方法，因为这里采用线性探测，如果不采用懒删除，就会导致删除后的查找失败。所以具体操作就是不断轮询cas将readable对应位改为0，表示该位置是无效数据。

### Linear Probing Hash Table

实际的哈希表对象包含了一个header page的page id，所有操作都是从这里发起，先从磁盘中读取header page，再根据header page定位找到各个block page。此外还有一个哈希函数和一个key的比较器，一个用来读取page的缓冲池管理器，以及一个读写锁用于实现并发线程安全。

同时哈希表包括了以下几个核心函数功能：

- 初始化：创建header page和block page，传入的bucket数量不一定能整除每个block的bucket数量，但是问题不大，以传入的为准。注意创建完的page要Unpin，等到需要再加载进来。
- GetValue()，Insert()，Remove()，GetSize()：这几个函数都具有类似的操作，比如查询操作，首先是读取header page，获取bucket总数，然后就是计算哈希值，取模得到blockIdx(在第几个block)和bucketIdx(在block的第几个bucket)，然后就是循环，动态加载block page，要记得对上一个block page进行Unpin。然后比较key之前要判断Occupied和Readable，即bucket里存放了有效k-v对才进行比较，由于这个project的哈希表是支持相同key的，所以这里查询到一个匹配的key之后并不能停，有两种情况可以退出，一种是扫描到了一个Occupied为0的bucket，因为key的哈希值余数相同(哈希冲突)的k-v对经过线性探测后一定是会处于连续的一段bucket；另外一种就是当所有bucket都被占用了，这时候如果用第一种判断就会死循环，所以需要记录是否走了完整一圈。而对于插入操作，当要插入的k-v对已存在，直接返回false，此外，当index走了一整圈还没找到可以插入的bucket，应该进行Resize(**Resize前要做好退出函数收尾工作**)，然后再进行插入。删除操作也和插入类似，而GetSize操作我的理解是查询实际k-v对数量，所以跟普通查询也没有差别。
- Resize()：稍微复杂一些， 需要创建一些新的page(header page和block page)，然后遍历原哈希表的所有有效k-v对，重新哈希后插入新的page里，最后记得**更新这个哈希表的header page id**。

并发安全方面，首先要弄清楚在每种操作中每个对象(哈希表对象和各个page对象)应该加读锁还是写锁，这取决于是否对这个对象进行写操作。比如对于哈希表对象，GetValue函数中只会对哈希表对象进行读操作，读取BPM对象，compartor对象等，所以加读锁，Insert和Remove同理，但是Resize就会修改哈希表对象的bucket数量，header page id，block数量，block映射关系等等，所以需要加写锁。对于page对象，包括header page和block page，在GetValue函数中，page只需要加读锁，在Insert和Remove函数中，header page只要加读锁，block page因为要插入，删除，要加写锁，在Resize函数中，新的page需要写入数据，所以要加写锁。

注意在读写锁的实现中，加读锁是可以同时读，加了读锁可以再加写锁，但不能再加读锁，而且会等到所有读者完成才开始写锁，所以加读锁可以防止写。注意**加锁后一定要记得解锁，不然就很容易出现死锁**。
