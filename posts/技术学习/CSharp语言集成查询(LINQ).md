---
tags: 
  - C#
  - LINQ
permalink: csharp-linq-startup
category: 技术学习
title: CSharp语言集成查询(LINQ)
date: 2021-01-08 14:25:40 +0800
math: true
---

## 概述

LINQ(Language Integrated Query，语言集成查询)，是C#的一个统一查询工具，可以用相同的基本查询表达式来支持不同的数据源，比如数据库，XML文档，内存对象等，LINQ查询返回的。

例子：

```c#
int[] num = {1, 5, 2, 7, 6, 3, 9, 8, 4, 10};
var lowNum = from i in num where i > 5 orderby i descending select i;
foreach (var x in lowNum) {
    Console.WriteLine(x);
}
```

每一个查询运算符(基本上)都有对应的一个**拓展方法**，因此上述的例子可以改写成

```c#
var lowNum2 = num.Where(i => i > 5).OrderByDescending(i => i);
foreach (var x in lowNum2) {
    Console.WriteLine(x);
}
```

LINQ查询返回的基本都是`IEnumerable<\T>`或其派生接口，仅创建查询变量不会检索到任何数据，默认是延迟执行。

对于`Count`、`Max`、`Average`和`First`等此查询，默认强制立即执行，返回单个值，`ToList`和`ToArray`方法也可以强制立即执行查询并缓存结果。

![LINQ查询示意图](https://docs.microsoft.com/zh-cn/dotnet/csharp/programming-guide/concepts/linq/media/introduction-to-linq-queries/linq-query-complete-operation.png)


除了上面的简单查询的例子，LINQ支持分组，连接，子查询等复杂操作，详见文档。
