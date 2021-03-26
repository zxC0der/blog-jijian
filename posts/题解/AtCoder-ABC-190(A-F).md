---
tags: 
  - 思维
  - 枚举
  - 暴搜
  - 因子
  - bfs
  - 最短路
  - 状压dp
  - 树状数组
  - 逆序数
permalink: atcoder-abc-190
category: 题解
title: AtCoder-ABC-190(A-F)
date: 2021-01-30 22:48:56 +0800
math: true
---

## A

输入A，B，C，C决定先后手，A和B每次轮流减1，先减为0的输。

根据先后手决定判断是小于还是小于等于。

## B

有一些法术，施法需要Xi秒，攻击力Yi，怪兽可以无视施法大于等于S秒或者是攻击力小于等于D的法术，问能否使怪兽造成伤害。

遍历判断，必须两个条件都不符合。

## C

有N个盘子，M个条件，要求某两个盘子上都要有球，有K个操作，可以给两个盘子的其中一个放上一个球，问怎么放能满足最多条件。

K<=16，直接爆搜，然后枚举所有条件进行判断。

## D

求出和为N的公差为1的整数等差数列的数量。

根据定义，该数列首尾相加乘以长度就是2N，是一个偶数，所以直接枚举2N的因子，再排除掉两个因子都是偶数(**如果数列长度是偶数，而公差又是1，则首尾相加不可能是偶数**)的情况，剩下的就是所有可能的数列。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
ll n;
int main(){
    scanf("%lld",&n);
    n*=2LL;
    ll ans=0;
    for(ll i=1LL;i*i<=n;i++){
        if(n%i==0){
            if(i%2==1 || (n/i)%2==1){
                ans+=2;
            }
        }
    }
    printf("%lld\n",ans);
    return 0;
}
```

## E

问题抽象出来就是给一个1e5的无向图，边权都为1，指定K个特殊点，要求找到最短的路径满足每个特殊点至少经过一次。

特殊点和特殊点之间肯定是走最短路径，所以可以先枚举特殊点，通过bfs求出任意两个特殊点的最短距离，这样就可以对图进行简化，其他的点都不需要，只需要关注这K个特殊点和它们之间的距离。

然后就是转化为带权的最短哈密顿通路的问题，因为K<=17，所以可以用状压dp来解决这个问题。

枚举起点，定义dp[i][j]表示已经过的点状态为i，最后经过的点是j的最短距离，枚举状态，再枚举上一个经过的点，状态转移方程为`dp[j][l]=min(dp[j][l],dp[(j^(1<<(l-1)))][o]+cost[o][l])`

注意状压dp中的位运算。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=1e5+50;
const int INF=0x3f3f3f3f;
int n,m,a,b,k;
int c[20];
vector<int> g[N];
int vis[N];
int cost[20][20],dp[1<<19][20];
int main(){
    scanf("%d%d",&n,&m);
    for(int i=1;i<=m;i++){
        scanf("%d%d",&a,&b);
        g[a].push_back(b);
        g[b].push_back(a);
    }
    scanf("%d",&k);
    for(int i=1;i<=k;i++){
        scanf("%d",&c[i]);
    }
    if(k==1){
        printf("%d\n",1);
        return 0;
    }
    for(int i=1;i<=k;i++){
        for(int j=1;j<=k;j++){
            if(i==j){
                cost[i][i]=0;
                continue;
            }else{
                cost[i][j]=INF;
            }
            int st=c[i];
            int ed=c[j];
            queue<pair<int,int>> q;
            queue<int> vq;
            q.push({st,0});
            vis[st]=1;
            vq.push(st);
            while(!q.empty()){
                auto t=q.front();
                q.pop();
                int u=t.first;
                int cs=t.second;
                if(u==ed){
                    cost[i][j]=cs-1;
                    break;
                }
                int siz=g[u].size();
                for(int l=0;l<siz;l++){
                    int v=g[u][l];
                    if(!vis[v]){
                        q.push({v,cs+1});
                        vis[v]=1;
                        vq.push(v);
                    }
                }
            }
            while(!vq.empty()){
                vis[vq.front()]=0;
                vq.pop();
            }
        }
    }
    int ans=INF;
    for(int i=1;i<=k;i++) {
        memset(dp,INF,sizeof(dp));
        // 起点
        dp[1<<(i-1)][i]=0;
        for(int j=1;j<(1<<k);j++){
            for(int l=1;l<=k;l++){
                if((j>>(l-1))&1){
                    // 枚举上一个经过的点
                    for(int o=1;o<=k;o++){
                        if(((j^(1<<(l-1)))>>(o-1))&1){
                            dp[j][l]=min(dp[j][l],dp[(j^(1<<(l-1)))][o]+cost[o][l]);
                        }
                    }
                }
            }
        }
        for(int j=1;j<=k;j++){
            if(j!=i){
                ans=min(ans,dp[(1<<k)-1][j]);
            }
        }
    }
    printf("%d\n",ans>=INF?-1:ans+k);
    return 0;
}
```

## F

给定一个全排列，计算分别循环左移0到n-1位时候序列的逆序数。

因为是全排列，所以当一个数从首位左移到末位，显然逆序数的变化就是减去后面比它小的数的个数，再加上后面比它大的数的个数。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=3e5+50;
typedef long long ll;
int n,a[N];
int c[N];
int lowbit(int x){
    return x&(-x);
}
void add(int i,int x){
    while(i<=n){
        c[i]+=x;
        i+=lowbit(i);
    }
}
int sum(int i){
    int ans=0;
    while(i){
        ans+=c[i];
        i-=lowbit(i);
    }
    return ans;
}
int main(){
    scanf("%d",&n);
    for(int i=1;i<=n;i++){
        scanf("%d",&a[i]);
    }
    ll ans=0;
    for(int i=n;i>=1;i--){
        ans+=1LL*sum(a[i]+1);
        add(a[i]+1,1);
    }
    printf("%lld\n",ans);
    for(int i=1;i<n;i++){
        ans=ans+n-1-2LL*a[i];
        printf("%lld\n",ans);
    }
    return 0;
}
```