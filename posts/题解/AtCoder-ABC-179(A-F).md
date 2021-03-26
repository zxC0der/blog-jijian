---
tags: 
  - 因子
  - DP
  - 前缀和
  - 区间合并
  - 循环节
  - 思维
title: AtCoder-ABC-179(A-F)
date: 2020-11-11 08:16:11 +0800
permalink: atcoder-abc-179
category: 题解
math: true
---

## A

输出字符串，以s结尾就加es，否则加s。

## B

判断是否有连续三对相同的数。

## C

给定N，求多少个正数三元组(A,B,C)满足AB+C=N。预处理因子个数然后暴力枚举C。

## D

给定一些区间，从数轴的1开始，每次可以选择任意一个区间的任意一个数，向右走这么多步，问走到N的方案数。

简单的方案数DP，不同的是从前面的某一段区间转移而来，所以枚举区间，然后用前缀和优化即可，再优化也可以先把区间进行合并。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=2e5+50;
const long long MOD=998244353;
int n,k;
long long dp[N],pre[N];
struct node{
    int l,r;
    bool operator<(const node& rhs)const{
        if(l!=rhs.l){
            return l<rhs.l;
        }else{
            return r<rhs.r;
        }
    }
}a[15];
int main(){
    scanf("%d%d",&n,&k);
    for(int i=1;i<=k;i++){
        scanf("%d%d",&a[i].l,&a[i].r);
    }
    sort(a+1,a+1+k);
    vector<node> b;
    int lastl=-1;
    int lastr=-1;
    int cur=1;
    while(cur<=k){
        if(a[cur].l<=lastr){
            lastr=a[cur].r;
        }else{
            if(lastr!=-1){
                b.push_back(node{lastl,lastr});
            }
            lastl=a[cur].l;
            lastr=a[cur].r;
        }
        cur++;
    }
    if(lastr!=-1){
        b.push_back(node{lastl,lastr});
    }
    dp[1]=1LL;
    int siz=b.size();
    for(int i=1;i<=n;i++){
        for(int j=0;j<siz;j++){
            int l=max(0,i-b[j].l);
            int r=max(0,i-b[j].r-1);
            dp[i]=(dp[i]+pre[l]-pre[r]+MOD)%MOD;
        }
        pre[i]=pre[i-1]+dp[i];
    }
    printf("%lld\n",dp[n]);
    return 0;
}
```

## E

给定首项x和递推式$a_n=(a_{n-1}^2)\%m$，求前n项和。

注意到m的范围是1e5，所以很明显每一项都不会超过1e5，所以肯定会存在循环节，所以暴力找出循环节然后用前缀和计算一下剩下的小部分即可。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=2e6+50;
ll n,x,m;
ll a[N],p[N];
int loc[N];
int main(){
//    freopen("in.txt","r",stdin);
    scanf("%lld%lld%lld",&n,&x,&m);
    a[1]=x;
    p[1]=x;
    ll ans=x;
    memset(loc,-1,sizeof(loc));
    loc[x]=1;
    for(int i=2;i<=n;i++){
        a[i]=(a[i-1]*a[i-1])%m;
        p[i]=p[i-1]+a[i];
        ans+=a[i];
        if(loc[a[i]]!=-1){
            ll cy=p[i]-p[loc[a[i]]];
            ll num=(n-loc[a[i]])/(i-loc[a[i]]);
            ll rem=n-loc[a[i]]-num*(i-loc[a[i]]);
            ans+=cy*(num-1);
            ans+=p[loc[a[i]]+rem]-p[loc[a[i]]];
            break;
        }
        loc[a[i]]=i;
    }
    printf("%lld\n",ans);
    return 0;
}
```

## F

有个n行n列的网格图，初始中间n-2的方阵是黑色，最下边的行和最右边的列是白色，有两种操作，选择一列或者一行变成白色直到第一个原先已经白色的格子，给定一些操作，问最后黑色格子数量。

最重要的一点是要从全局来看这个网格图，每一次操作其实都是对中间n-2行n-2列的黑色方阵的压缩，比如对第x列操作，那么对于x列右边的列，横向行的操作就不会再影响到了。

具体做法如下，行和列分别维护：从上到下第一个被操作(全部变成白色)的行，这是因为上一段提到的，相当于一个收缩隔离的作用，在这个行以下的，状态不会再被改变，即黑色格子数量是一定的，可以通过第二个维护的量来记录；每一行第一个白色格子位置，显然这个白色格子就是列操作产生的，这样子当对这一行进行操作，就可以直接算出消失的黑色格子数量(**注意比如[黑 白 黑]的清空，行的操作也只会影响第一个黑，但是这不会影响答案，第二个黑会在列的操作时被影响**)。列同理。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=2e5+50;
int n,q,o,x;
// a[i]表示第i列第一个白色，b[i]表示第i行第一个白色
int a[N],b[N];
int main(){
    scanf("%d%d",&n,&q);
    for(int i=1;i<=n;i++){
        a[i]=n;
        b[i]=n;
    }
    // r表示从左到右第一个被竖切全白的列
    // d表示从上到下第一个被横切全白的行
    int r=n;
    int d=n;
    long long ans=(long long)(n-2)*(n-2);
    while(q--){
        scanf("%d%d",&o,&x);
        if(o==1){
            if(x<r){
                for(int i=x;i<r;i++){
                    a[i]=d;
                }
                // 更新从左到右第一个全白列
                r=x;
            }
            // a[x]是x列从上到下第一个白色，所以前面a-1个除了第一行(没有颜色)，其他(a-2)个都是黑色，将变成白色
            ans-=(long long)(a[x]-2);
        }else{
            if(x<d){
                for(int i=x;i<d;i++){
                    b[i]=r;
                }
                d=x;
            }
            ans-=(long long)(b[x]-2);
        }
    }
    printf("%lld\n",ans);
    return 0;
}
```
