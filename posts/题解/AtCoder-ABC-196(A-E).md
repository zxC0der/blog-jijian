---
permalink: atcoder-abc-196
tags: 
  - 字符串
  - 暴力
  - 二分查找
  - 爆搜
  - 思维
math: true
category: 题解
title: AtCoder-ABC-196(A-E)
date: 2021-04-03 15:54:28 +0800
---

## A

给定a,b,c,d四个整数，在a到b之间选一个x，c到d之间选一个y，求最大的x-y。

就是b-c...

## B

给定一个浮点数，输出向下取整的数。

读字符串，输出直到遇到小数点或者结束。

## C

求1-N之间多少个满足"不含前导零，前一部分字符串和后一部分字符串相同"的数字。

暴力把1e12以内所有满足条件的数预处理出来，然后二分查找。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
ll n;
int main(){
    vector<ll> v;
    for(int i=1;i<=6;i++){
        ll up=1LL;
        for(int j=1;j<=i;j++){
            up=up*10;
        }
        for(ll j=up/10;j<up;j++){
            ll x=j*up+j;
            v.push_back(x);
        }
    }
    scanf("%lld",&n);
    int k=upper_bound(v.begin(),v.end(),n)-v.begin();
    printf("%d\n",k);
    return 0;
}

```

## D

长为H，宽为W的面积不超过16的矩形，有A个2\*1和B个1\*1的瓷砖，保证能铺满，问铺满的方案数。

直接爆搜，标记每个单位是被哪种瓷砖所占，因为2\*1的可以旋转，所以是三种，然后搜就完事了。

注意放横的2\*1时要注意判断右边的那块有没有被上面一行放竖的2\*1占用了，这个bug浪费了接近30分钟...

```cpp
#include <bits/stdc++.h>
const int N=16;
int vis[N][N];
int h,w,a,b;
int cnt;
void print(){
    for(int i=1;i<=h;i++){
        for(int j=1;j<=w;j++){
            printf("%d",vis[i][j]);
        }
        printf("\n");
    }
    printf("----\n");
}
void dfs(int x,int y,int ua,int ub){
    if(vis[x][y]){
        // 被上一排的竖的1*2放了
        if(y==w){
            if(x==h){
                cnt++;
            }else{
                dfs(x+1,1,ua,ub);
            }
        }else{
            dfs(x,y+1,ua,ub);
        }
        return;
    }
    if(ua<a){
        // 放1*1
        vis[x][y]=1;
        if(y==w){
            if(x==h){
                cnt++;
            }else{
                dfs(x+1,1,ua+1,ub);
            }
        }else{
            dfs(x,y+1,ua+1,ub);
        }
        vis[x][y]=0;
    }
    if(ub<b){
        // 放横的2*1
        if(y+1<=w && !vis[x][y] && !vis[x][y+1]){
            vis[x][y]=2;
            vis[x][y+1]=2;
            if(y+1==w){
                if(x==h){
                    cnt++;
                }else{
                    dfs(x+1,1,ua,ub+1);
                }
            }else{
                dfs(x,y+2,ua,ub+1);
            }
            vis[x][y]=0;
            vis[x][y+1]=0;
        }
        // 放竖的1*2
        if(x+1<=h){
            vis[x][y]=3;
            vis[x+1][y]=3;
            if(y==w){
                dfs(x+1,1,ua,ub+1);
            }else{
                dfs(x,y+1,ua,ub+1);
            }
            vis[x][y]=0;
            vis[x+1][y]=0;
        }
    }
}
int main(){
    scanf("%d%d%d%d",&h,&w,&b,&a);
    dfs(1,1,0,0);
    printf("%d\n",cnt);
}
```

## E

题意咋一看比较复杂，其实就是给定序列a和序列t，序列t表示每次操作类型(累加ai，和ai取max，和ai取min)，序列a表示每次操作的值，然后再给一个序列q，求对q做所有操作之后的新序列。

模型可以看成坐标轴上一排点，加操作就是将整一排点往上移，和其他两种操作无关，所以可以作为一个偏移量独立出来，而取max操作就是给定一个y值，即一条直线，在这直线之下的全部点往上移到直线上，即往上压缩，同理取min操作就是往下压缩。

所以直接维护这两个压缩的直线，以及添加的总数add，最后每个数只需要加上add，再限制在两个压缩直线中间即可。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const ll INF=1e18;
int n,q;
ll a,t,x;
int main(){
    scanf("%d",&n);
    ll mn=-INF;
    ll mx=INF;
    ll add=0;
    for(int i=1;i<=n;i++){
        scanf("%lld%lld",&a,&t);
        if(t==1){
            add+=a;
            mn+=a;
            mx+=a;
        }else if(t==2){
            mn=max(mn,a);
            mx=max(mx,a);
        }else{
            mn=min(mn,a);
            mx=min(mx,a);
        }
    }
    scanf("%d",&q);
    for(int i=1;i<=q;i++){
        scanf("%lld",&x);
        x+=add;
        x=min(x,mx);
        x=max(x,mn);
        printf("%lld\n",x);
    }
    return 0;
}
```

## F

给定两个01字符串S和T，问T最少修改几个字符能成为S的子串。

做法应该是FFT，知识盲区了...有空再补。