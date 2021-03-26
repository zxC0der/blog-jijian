---
tags: 
  - CodeForces
  - 构造
  - 素数
  - 二分查找
  - dfs
  - 贪心
title: CodeForces-Div2-678(A-D)
date: 2020-11-13 21:36:18 +0800
permalink: codeforces-div2-678
category: 题解
math: true
---

## 比赛情况

<del>退役复健之CF</del>，第一场VP，果然和想象中一样，勉强过了C，D赛后看了一下题解思路不太对，整体来说还是很符合rating 1300的水平的。

## 题解

### A

题意的复杂公式转化后就是判断给定的数组和是否等于m。

### B

给定n(n<=100)，构造一个数的方阵满足每个数都不是素数，且每一行每一列的和都为素数。

我的做法是先筛素数，然后暴力构造，从n=3的全1矩阵开始，然后**行和列对称**，维护每一行的和，然后直接暴力枚举每个数判断新的一行的和是否为素数，最后，**所有新添加的数的和也就是新的一行的和**，通过这个和，就就构造最后的一个a[n-1][n-1]。

......突然发现题意看错，矩阵的数可以是0，所以按照题解的做法，直接根据n的奇偶性，如果n是偶数，则主副对角线都为1，其他为0，如果n是奇数，在偶数的基础上再补充两个1即可。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=1e5+50;
int t,n;
bool isPrime[N];
int ans[105][105],sum[105];
void init(){
    isPrime[2]=true;
    for(int i=3;i<N;i++){
        isPrime[i]=true;
        for(int j=2;j*j<=i;j++){
            if(i%j==0){
                isPrime[i]=false;
                break;
            }
        }
    }
}
int main(){
    init();
    scanf("%d",&t);
    while(t--){
        scanf("%d",&n);
        if(n==1){
            printf("1\n");
        }else if(n==2){
            printf("1 1\n1 1\n");
        }else if(n==3){
            printf("1 1 1\n1 1 1\n1 1 1\n");
        }else{
            for(int i=0;i<3;i++){
                for(int j=0;j<3;j++){
                    ans[i][j]=1;
                }
                sum[i]=3;
            }
            for(int i=3;i<n;i++){
                int shu=0;
                for(int j=0;j<i;j++){
                    int nw=1;
                    while(!isPrime[nw+sum[j]]){
                        nw++;
                        while(isPrime[nw]){
                            nw++;
                        }
                    }
                    ans[i][j]=ans[j][i]=nw;
                    shu+=nw;
                    sum[j]+=nw;
                }
                int nw=1;
                while(!isPrime[nw+shu]){
                    nw++;
                    while(isPrime[nw]){
                        nw++;
                    }
                }
                ans[i][i]=nw;
                sum[i]=shu+nw;
            }
            for(int i=0;i<n;i++){
                for(int j=0;j<n;j++){
                    printf("%d%c",ans[i][j],j==n-1?'\n':' ');
                }
            }
        }
    }
    return 0;
}
```

### C

给定n，x和p，求有多少个长为n的全排列满足p位置是x，且可以通过给定的二分查找算法查找到x。

按照给定的算法二分查找，因为二分的路径是一定的，所以可以确定每次二分定位的那个数要大于x还是小于x，还是等于x，所以最后可以得到的信息，就是这个全排列里，有多少个位置必须放比x大的数，多少个位置必须放比x小的数，剩下就随便放，排列数乘一下就可以了。

比赛时想得很乱，写完完全没底，结果直接秒过？？？

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=1e5+50;
const int MOD=1e9+7;
int n,x,p;
ll Pow(ll x,ll n,ll mod){
    ll ans=1LL;
    while(n){
        if(n%2){
            ans=ans*x%mod;
        }
        x=x*x%mod;
        n/=2;
    }
    return ans;
}
ll Inv(ll x,ll mod){
    return Pow(x,mod-2,mod);
}
ll fac[1005];
void init(){
    fac[0]=1;
    fac[1]=1;
    for(ll i=2;i<1005;i++){
        fac[i]=(fac[i-1]*i)%MOD;
    }
}
ll A(int a,int b){
    return (fac[a]*Inv(fac[a-b],MOD))%MOD;
}
int main(){
//    freopen("in.txt","r",stdin);
    init();
    scanf("%d%d%d",&n,&x,&p);
    int l=0,r=n;
    int xiao=0;
    int da=0;
    while(l<r){
        int mid=(l+r)/2;
        if(mid<p){
            l=mid+1;
            xiao++;
        }else if(mid==p){
            l=mid+1;
        }else{
            r=mid;
            da++;
        }
    }#include <bits/stdc++.h>
using namespace std;
const int N=1e5+50;
int t,n;
bool isPrime[N];
int ans[105][105],sum[105];
void init(){
    isPrime[2]=true;
    for(int i=3;i<N;i++){
        isPrime[i]=true;
        for(int j=2;j*j<=i;j++){
            if(i%j==0){
                isPrime[i]=false;
                break;
            }
        }
    }
}
int main(){
    init();
    scanf("%d",&t);
    while(t--){
        scanf("%d",&n);
        if(n==1){
            printf("1\n");
        }else if(n==2){
            printf("1 1\n1 1\n");
        }else if(n==3){
            printf("1 1 1\n1 1 1\n1 1 1\n");
        }else{
            for(int i=0;i<3;i++){
                for(int j=0;j<3;j++){
                    ans[i][j]=1;
                }
                sum[i]=3;
            }
            for(int i=3;i<n;i++){
                int shu=0;
                for(int j=0;j<i;j++){
                    int nw=1;
                    while(!isPrime[nw+sum[j]]){
                        nw++;
                        while(isPrime[nw]){
                            nw++;
                        }
                    }
                    ans[i][j]=ans[j][i]=nw;
                    shu+=nw;
                    sum[j]+=nw;
                }
                int nw=1;
                while(!isPrime[nw+shu]){
                    nw++;
                    while(isPrime[nw]){
                        nw++;
                    }
                }
                ans[i][i]=nw;
                sum[i]=shu+nw;
            }
            for(int i=0;i<n;i++){
                for(int j=0;j<n;j++){
                    printf("%d%c",ans[i][j],j==n-1?'\n':' ');
                }
            }
        }
    }
    return 0;
}
```

### D

一个只含单向边的有根树，根为1，每个节点有ai个居民，一开始绑匪在根节点，居民可以分散跑，可以在某个节点合并，居民先跑1步，然后绑匪再跑1步，两者都用最优策略，直到叶子节点居民无法再跑，问绑匪能抓到多少个居民。

比赛时想复杂了，其实对于任意一个子树，居民肯定要跑得越分散越好，所以就是sum[u]/leaf[u]向上取整即可，sum[u]表示子树u所有居民总数，leaf[u]表示子树u叶子总数。

**注意：** 假如子树的sum并不能全部分散到叶子，比如所有居民在一个分支，而无法向上走到另一个分支，这会导致对于这个子树的答案出错，但并不会导致总体的答案出错，因为最终dfs会走到这个分支对应的子树，而总体的答案是不断取max更新。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=2e5+05;
vector<int> g[N];
int n,f;
ll a[N];
ll sum[N],leaf[N];
ll ans=0;
void dfs(int u){
    int siz=g[u].size();
    sum[u]=a[u];
    leaf[u]=siz==0;
    for(int i=0;i<siz;i++){
        int v=g[u][i];
        dfs(v);
        sum[u]+=sum[v];
        leaf[u]+=leaf[v];
    }
    ans=max(ans,(sum[u]+leaf[u]-1)/leaf[u]);
}
int main(){
//    freopen("in.txt","r",stdin);
    scanf("%d",&n);
    for(int i=2;i<=n;i++){
        scanf("%d",&f);
        g[f].push_back(i);
    }
    for(int i=1;i<=n;i++){
        scanf("%lld",&a[i]);
    }
    dfs(1);
    printf("%lld\n",ans);
    return 0;
}
```
