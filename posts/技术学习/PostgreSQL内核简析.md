---
draft: true
---

阅读[官方文档(version 13)](https://www.postgresql.org/files/documentation/pdf/13/postgresql-13-A4.pdf)第7部分(Part VII. Internals)后的一些笔记和思考。

## 概述

### 一个查询语句的执行路径

- 应用程序客户端将Query发送到Server，等待接收Server返回结果。
- Parser(语法和语义分析器)检查查询语句的语法是否正确，创建Query Tree(查询树)。
- Rewrite System(重写模块)在系统目录中查找合适的规则对查询树进行重写，比如视图消解。
- Planner/Optimizer(计划/优化器)根据重写后的查询树创建查询计划，优化器会在所有可能的查询路径中找出花费最小的。
- Executor(执行器)根据查询计划树递归地通过存储系统去获取元组数据，进行连接，排序等操作后最终返回。

### C/S架构

PostgreSQL采用的是多进程而不是多线程。其中两个主要的线程Postmaster和Postgres，其中Postmaster是守护进程，负责监听客户端的连接请求，并每一个客户端分配一个单独的Postgres进程，不同的Postgres进程之间通过信号量和共享内存来保证并发访问的数据完整性。

用线程而不是进程的优点是稳定性，健壮性更好，确定是进程开销较大，需要进程池配合。

### Parser阶段

PostgreSQL使用flex/bison进行词法和语法解析，定义在`src/backend/parser`下的`scan.l`和`gram.y`。

通过词法和语法分析之后得到的是原始的Parse Tree(分析树)，必须经过一个transformation的过程转化为更加详细的Query Tree(查询树)。

### Rule System/Query Rewriting

重写不会影响树的表示以及在语义级别上不会有变化，可以看成是一种宏展开。

### Planner/Optimizer

Planner/Optimizer的目的是构建一个最优的查询计划，
