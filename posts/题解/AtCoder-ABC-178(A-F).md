---
permalink: atcoder-abc-178
tags: 
  - 思维
  - 快速幂
  - 容斥
  - dp
  - 二进制枚举
  - 最大曼哈顿距离
  - 贪心
category: 题解
title: AtCoder-ABC-178(A-F)
date: 2020-11-25 19:32:12 +0800
math: true
---

## A

输出1-x

## B

给定区间[a,b]和区间[c,d]，要从区间各取一个数，使得乘积最大。

一开始想复杂了，其实最大值肯定是区间边缘的值相乘得到的，如果包含0，再跟0取个max即可。

## C

求长度为n，至少含有一个0和一个9的不同数字序列个数。

利用容斥的思想，不加限制，长度为n的不同数字序列个数为$10^n$，再减去**可以**含有0，但是不含有9的数字序列个数$9^n$，再同样减去**可以**含有9，但是不含有0的数字序列个数$9^n$，然后要加上被删除两次的同时不含0和9的序列个数。

## D

求每一项大于等于3，且和为给定S的序列个数。

有序的凑硬币问题，基础dp。比如[3,4]和[4,3]是属于不同序列，如果题目要求是属于同一个序列的话，就要将第一重循环改为枚举硬币面额。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=2005;
const ll MOD=1e9+7;
ll dp[N];
int s;
int main(){
    scanf("%d",&s);
    dp[0]=1;
    for(int i=1;i<=s;i++){
        for(int j=3;j<=i;j++){
            if(i-j>=0){
                dp[i]=(dp[i]+dp[i-j])%MOD;
            }
        }
//        printf("%d %lld\n",i,dp[i]);
    }
    printf("%lld\n",dp[s]%MOD);
    return 0;
}
```

## E

给定n个点，求两点间最大的曼哈顿距离。

经典题目，做法是将曼哈顿距离公式的绝对值符号拆开，对二维点来说会有4种情况，然后将同一个点的x，y放一起，发现两个点的形式其实是一样的，比如都是$(x_i+y_i)-(x_j+y_j)$，或者是$(-x_i+y_i)-(-x_j+y_j)$，所以直接枚举符号状态，然后遍历一遍求最大最小值。

这个算法也可以改成动态的(支持查询，插入，删除)，只需要对每个二进制状态分别维护一个数据结构即可。原题hdu4666

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=2e5+50;
int n;
ll x[N],y[N];
int sta[4][2]={{1,1},{1,-1},{-1,1},{-1,-1}};
int main(){
    scanf("%d",&n);
    for(int i=1;i<=n;i++){
        scanf("%lld%lld",&x[i],&y[i]);
    }
    ll ans=0;
    for(int i=0;i<4;i++){
        ll mx=-1e18;
        ll mn=1e18;
        for(int j=1;j<=n;j++){
            ll t=sta[i][0]*x[j]+sta[i][1]*y[j];
            mx=max(mx,t);
            mn=min(mn,t);
        }
        ans=max(ans,mx-mn);
    }
    printf("%lld\n",ans);
    return 0;
}
```

## F

给定a和b长度相同的两个升序数组，要求重排数组b，使得a和b对应位置的数字不同。

a和b都已经升序，所以首先将b逆序，这时候中间就可能存在一段a和b对应位置数字相同，且**这段区间都是同一个数字**，然后考虑将b数组这些位置的数字交换到其他位置，这里维护一个可以交换的位置下标即可，这样复杂度是O(N)的。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=2e5+50;
int n,a[N],b[N];
int main(){
    scanf("%d",&n);
    for(int i=1;i<=n;i++){
        scanf("%d",&a[i]);
    }
    for(int i=1;i<=n;i++){
        scanf("%d",&b[n+1-i]);
    }
    int idx=1;
    bool flag=true;
    for(int i=1;i<=n;i++){
        if(a[i]==b[i]){
            while(idx<=n && (a[i]==b[idx] || a[idx]==b[i])){
                idx++;
            }
            if(idx>n){
                flag=false;
                break;
            }
            swap(b[idx],b[i]);
        }
    }
    if(flag){
        printf("Yes\n");
        for(int i=1;i<=n;i++){
            printf("%d%c",b[i],i==n?'\n':' ');
        }
    }else{
        printf("No\n");
    }
    return 0;
}
```

