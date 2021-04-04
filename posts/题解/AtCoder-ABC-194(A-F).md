---
permalink: atcoder-abc-194
tags: 
  - 暴力
  - 预处理
  - 前缀和
  - 思维
  - dp
  - 期望dp
  - 数位dp
math: true
category: 题解
title: AtCoder-ABC-194(A-F)
date: 2021-03-17 11:17:20 +0800
---

## A

略

## B

N个员工，每个员工做A，B两种工作的时间都不同，如果让一个员工做A和B，花费时间就是两者之和，如果让两个员工做，花费时间就是两者最大值，问所花费最小时间。

N为1000，直接暴力枚举。

## C

求$\sum_{i = 2}^{N} \sum_{j = 1}^{i - 1} (A_i - A_j)^2$。

展开一下，预处理前缀和和平方前缀和即可。

## D

有N个点，一开始在点1，每次等概率随机选择一个点(包括所在的点)，将这两点连边并走到该点，问使得图连通的操作次数。

有个很重要的思路，走的顺序是不重要的，**重要的只有一点，就是走过了(连通)了多少个点**。就比如从1走到2，再从2走到1，和在2一直原地踏步是一样的，所以将图抽象为一条线段，比如3个点`1---2---3`，先算从1走到2的期望，这里的2并不仅仅指图上的点2，只是代表第二个走过的点，所以这里有三种可能性，原地踏步1种，另外2种可能性都可以走到第二个点，所以从1走到2的期望是3/2，同理再算从2走到3的期望是3/1，因此可以总结得到规律，答案为$\sum_{i-1}^{n-1}\frac{n}{i}$。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=1e5+50;
int n;
int main(){
    scanf("%d",&n);
    double ans=0.0;
    for(int i=1;i<n;i++){
        ans+=n*1.0/i;
    }
    printf("%.8lf\n",ans);
    return 0;
}
```

再仔细思考，其实题目本质就是N个点，每次随机给一个点染色，问所有点全部染色的次数期望。

考虑期望dp，dp[i]表示已经染色了i个点，要染色n个点所需要的次数期望，状态转移方程为$dp[i]=\frac{i}{n}dp[i]+\frac{n-i}{n}dp[i+1]+1$，其中第一部分是指随机选到的点是已染色的，第二部分是指选到未染色的点，移项化简，得到$dp[i]=dp[i+1]+\frac{n}{n-i}$，初始状态为dp[n]=0。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=1e5+50;
int n;
double dp[N];
int main(){
    scanf("%d",&n);
    for(int i=n-1;i>=1;i--){
        dp[i]=dp[i+1]+n*1.0/(n-i);
    }
    printf("%.8lf\n",dp[1]);
    return 0;
}
```

## E

给定长度为N的数组，对于每个长度为M的子数组，求出Mex，然后再求出所有Mex的最小值。

最简单的做法就是滑窗维护mex，但有个重要的问题，**只需要考虑删除数字之后mex的变化，而不用考虑添加数字之后mex的变化**，因为要求的是最小mex，而添加数字只会让mex变大。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=2e6+50;
int n,m;
int a[N],b[N];
int mex;
void add(int i){
    b[a[i]]++;
}
void del(int i){
    b[a[i]]--;
    if(b[a[i]]==0 && a[i]<mex){
        mex=a[i];
    }
}
int main(){
    scanf("%d%d",&n,&m);
    for(int i=1;i<=n;i++){
        scanf("%d",&a[i]);
    }
    for(int i=1;i<=m;i++){
        add(i);
    }
    for(int i=0;i<=n;i++){
        if(b[i]==0){
            mex=i;
            break;
        }
    }
    for(int i=m+1;i<=n;i++){
        add(i);
        del(i-m);
    }
    printf("%d\n",mex);
    return 0;
}
```

## F

求出1到N(不含前导零的16进制数)中多少个数字正好含有K的不同的数字(包括A-F)。

16进制的数位dp基础题。基本思路和注意点都在注释里了，后面可能会整理一个数位dp学习专题。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=2e5+50;
const int mod=1e9+7;
char s[N];
int k;
int dig[N];
// 低i位满足有k个不同数位的数字个数
// 注意这里定义的dp状态其实就蕴含了一种记忆化搜索时"空间换时间"的一种思想
// 实际上这里的状态也可以只定义dp[]一维，那表示的就是满足条件的数字个数，这种方法粒度大，使用空间小，但显然花费时间多，因为大多数搜索状态都无法记忆化，只能重复搜
// 同理状态也可以定义为dp[][][]三维，再加上一维状态压缩，这种做法就是粒度小，但是太占空间
ll dp[N][22];
void print(int x){
    if(x){
        print(x/2);
    }
    printf("%d",x%2);
}
ll dfs(int idx,int sta,int dif,bool lead,bool limit){
    if(idx==-1){
        // 一个合法数字(这题要排除含前导零的数)，有时候要单独考虑0的情况
        // 其实我觉得前导零的命名有点误导性，其实lead为true就是表示现在搜索的前缀是一串0
        if(dif==k && !lead){
            return 1;
        }else{
            return 0;
        }
    }
    // 记忆化的都是无上限的
    if(!limit && dp[idx][dif]!=-1){
        return dp[idx][dif];
    }
    // 这一位的枚举上限
    int up=limit?dig[idx]:15;
    ll ans=0;
    for(int i=0;i<=up;i++){
        if(lead && i==0 || (sta>>i)&1){
            ans+=dfs(idx-1,sta,dif,lead && i==0,limit && i==up);
        }else{
            ans+=dfs(idx-1,sta|(1<<i),dif+1,lead && i==0,limit && i==up);
        }
        ans%=mod;
    }
    if(!limit){
        dp[idx][dif]=ans%mod;
    }
    return ans%mod;
}
int main(){
    scanf("%s %d",s,&k);
    int n=strlen(s);
    for(int i=n-1;i>=0;i--){
        if(s[i]>='A'){
            dig[n-1-i]=s[i]-'A'+10;
        }else{
            dig[n-1-i]=s[i]-'0';
        }
    }
    memset(dp,-1,sizeof(dp));
    // 从高位搜索下去
    ll ans=dfs(n-1,0,0,true,true);
    printf("%lld\n",ans%mod);
    return 0;
}
```
