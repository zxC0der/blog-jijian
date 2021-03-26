---
tags: 
  - AtCoder
  - 贪心
  - 最短路
  - floyd
  - dp
  - 状压dp
  - ToBeAC
title: AtCoder-ABC-180(A-F)
date: 2020-11-07 17:32:32 +0800
permalink: atcoder-abc-180
category: 题解
math: true
---

## A

输出N-A+B。

## B

输出一个点到原点的曼哈顿距离，欧几里得距离，切比雪夫距离。

## C

按顺序输出一个数的所有因子。

## D

初始值X，每次操作可以乘A或者加B，在X保持小于Y的前提下要求尽量多的操作次数。

有个边界，当某一次乘法操作后大于加法操作，说明后面都需要是加法操作。注意long long溢出。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
ll x,y,a,b;
int main(){
    scanf("%lld%lld%lld%lld",&x,&y,&a,&b);
    // ans要long long
    long long ans=0;
    // a*x会溢出
    while(__int128(a)*x<__int128(y) && a*x<=b+x){
        x*=a;
        ans++;
    }
    ans+=(y-1-x)/b;
    printf("%lld\n",ans);
    return 0;
}
```

## E

给n个点，定义之间的距离，然后要求从点1出发走完所有点(至少走一次)回到点1，求最短路。

同hdu5418，先floyd跑出任意两点之间的最短路，然后状压dp。

**注意：** 至少经过一次这个条件其实在跑floyd的时候就完成了，之后任意两点之间都可通且是最短路，所以肯定不存在走过一个点之后再重复走一次，但是实际上在走点对点的最短路时可能会重复走过某个点。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=17;
const int INF=0x3f3f3f3f;
int n;
int x[N],y[N],z[N];
int dis[N][N];
int dp[(1<<17)+5][17];
int main(){
//    freopen("in.txt","r",stdin);
    scanf("%d",&n);
    for(int i=0;i<n;i++){
        scanf("%d%d%d",&x[i],&y[i],&z[i]);
    }
    for(int i=0;i<n;i++){
        for(int j=0;j<n;j++){
            dis[i][j]=abs(x[j]-x[i])+abs(y[j]-y[i])+max(0,z[j]-z[i]);
        }
    }
    // floyd求所有点之间最短路
    for(int i=0;i<n;i++){
        for(int j=0;j<n;j++){
            for(int k=0;k<n;k++){
                dis[j][k]=min(dis[j][k],dis[j][i]+dis[i][k]);
            }
        }
    }
    memset(dp,INF,sizeof(dp));
    // 起点是点0，所以
    dp[1][0]=0;
    // 经过一个点至少一次，但是跑了floyd最短路之后，就要保证只走一次
    // 枚举前一个状态i
    for(int i=1;i<(1<<n);i++){
        // 枚举要到达的点
        for(int j=0;j<n;j++){
            // 状态i必须没经过j
            if(((i>>j)&1)==0){
                // 枚举状态i的最后点
                for(int k=0;k<n;k++){
                    // 状态i必须经过k
                    if(((i>>k)&1)==1){
                        dp[i|(1<<j)][j]=min(dp[i|(1<<j)][j],dp[i][k]+dis[k][j]);
                    }
                }
            }
        }
    }
    int ans=INF;
    for(int i=1;i<n;i++){
        ans=min(ans,dp[(1<<n)-1][i]+dis[i][0]);
    }
    printf("%d\n",ans);
    return 0;
}
```

## F

比较难的dp，等有时间再学一学
