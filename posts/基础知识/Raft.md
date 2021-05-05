---
draft: true
---

> 论文: https://web.stanford.edu/~ouster/cgi-bin/papers/raft-atc14
> 动画: http://thesecretlivesofdata.com/raft/

## 概述

如同论文标题所说，Raft是一个易于理解的**分布式共识算法/协议**，在分布式系统中，共识算法通常被用于中心化复制集(replicaion)问题，简单来说，就是将一份数据冗余保存在多个从节点中，同时对主节点的操作必须能够同步到所有从节点。

每个节点有3种状态，Follower(从节点)，Candidate(候选节点)和Leader(主节点)，一开始所有节点都是Follower，当Follower节点接收不到Leader的心跳包，就会转为Candidate状态，开始一个新的term，然后向其他节点发送选票，等待其他节点投票(自己会投自己一票)，如果获得超过半票，就转为Leader状态，这个过程就是Leader Election。

对该分布式系统的所有修改操作都会经过Leader节点，每个操作都作为一个记录(log entry)添加到节点日志中，此时该log entry还未提交，Leader节点先将该log entry复制到所有Follower节点，等待Follower节点的写入返回，当超过半数的Follower节点返回表明已写入，Leader节点提交该log entry，修改实际数据状态，然后再通知所有Follower节点该log entry已提交，Follower节点接收到消息后更新数据，此时集群系统就对该系统状态达成了共识，处于一致性状态。这个过程就是Log Replication。

election timeout是Follower节点变成Candidate节点的等待时间，默认是在150ms到300ms之间随机(使用随机的timeout来分散节点的行为，减少split vote(票数相同)的情况，因为投票的规则是每个节点每个term一票，而且先来先到)。Follower节点给Candidate节点投完票之后，会重置election timeout。在成为Leader节点之后，Leader节点会按心跳时间间隔向所有Follower节点发送Append Entries，开始这个新的term，直到下一次选举。

## 论文详细内容
