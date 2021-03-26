---
tags: 
  - debug
permalink: a-bug-caused-by-for-a-ubyte
category: 杂七杂八
title: 关于for循环用无符号byte引发的一个bug
date: 2021-01-08 14:25:40 +0800
math: true
---

突然脑抽for循环定义byte变量

```c#
for (byte i = 0; i < 256; i++) {
    data.Add(i);
}
```

看似很有道理，byte的范围是0-255，那我就遍历到255就行，结果单元测试一直炸，而且电脑变卡，所以猜测是内存炸了。

定睛一看，这TM不是一个死循环！i到255后在加1，又变成0...

解决，又顺利浪费了20分钟。