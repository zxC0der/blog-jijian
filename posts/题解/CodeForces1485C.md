---
tags: 
  - 数论
  - 思维
  - 整除分块
  - 枚举
permalink: codeforces-1485C
category: 题解
title: CodeForces1485C
date: 2021-02-14 19:30:30 +0800
math: true
---

## 题意

求满足$a \in [1,x]$和$b \in [1,y]$且$\left \lfloor \frac{a}{b} \right \rfloor	=a\%b$的数对$(a,b)$数量。

## 分析

设余数为$k$，当$k=0$，不存在这样的数对，当$k>0$，则$a=kb+k=k(b+1)$，根据余数的定义，$k<b$，因此$k^2 kb<kb+k=a<x$，所以$k<=\sqrt x$。

所以可以枚举$k$，而对于给定的$k$，如何求出满足条件的数对数量：$b$的最小值是$k+1$，$b$每递增1，$a$递增$k$，因此$b$上界为$min(x/k-1,y)$。

另一种思路：

很容易发现，对于上一段提到的这个$k$，会存在一个分割点，若我们从1到$y$枚举$b$，当$b \in [1,\sqrt x]$时，$b<=\sqrt x$，**因此**$a\%b < \sqrt x$，而因为$a<=x$，**所以**$\lfloor \frac{a}{b} \rfloor>=\sqrt x$，因此对于这个$b$，贡献的数对数量应该由小的来决定，也就是$a\%b$，即$b-1$。所以这一部分的数对总个数为$\sum_{b=1}^{\sqrt x} b-1=\frac{\sqrt x(\sqrt x-1)}{2}$。（注意$y<\sqrt x$的情况）

同理，当$b \in [\sqrt x+1]$时，因为$a=k(b+1)$，所以数对的数量($b$已知，不同的$k$对应不同的$a$)应为$\sum_{b=\sqrt x+1}^{y} \lfloor \frac{x}{b+1} \rfloor$，这一部分用整除分块来做。(通过$c=b+1$的代换，可以更好理解)

## 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
int T;
ll x,y;
int main(){
    scanf("%d",&T);
    while(T--){
        scanf("%lld%lld",&x,&y);
        ll ans=0;
        ll sq=sqrt(x);
        if(y<=sq){
            // 枚举b从1到y求sum(b-1)=>等差数列求和
            ans=y*(y-1)/2;
        }else{
            // 等差数列求第一部分
            ans+=sq*(sq-1)/2;
            // 整除分块求第二部分
            for(ll l=sq+2,r;l<=y+1;l=r+1){
                if(x/l==0){
                    break;
                }
                r=min(y+1,x/(x/l));
                // printf("%d %d %d %d\n",l,r,r-l+1,x/l);
                ans+=(r-l+1)*(x/l);
            }
        }
        printf("%lld\n",ans);
    }
    return 0;
}
```
