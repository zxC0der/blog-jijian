---
draft: true
permalink: weekly-cf-mo-fish-1
tags:
  - 思维
  - 前缀
  - 后缀
  - 贪心
  - 概率
  - 乘法定律
  - 数学
  - 暴力
---

2021.2.15-2021.2.22

## 1473D (1700)

### 题意

变量x初始值为0，有n个连续操作，'+'表示加1，'-'表示减1，给定m个独立询问，每个询问给定一个区间[l,r]，要求不执行该区间内操作，其他操作整个过程中出现多少个不同的数。

### 分析

- 每次操作都是加1或者减1，因此整个过程出现的数都是连续的。
- 对于一段操作区间，出现的不同数的个数只取决于最大值和最小值。
- 题目中询问的本质是删去一段操作区间，然后将左右两个操作区间合并。
- 左边部分的前缀最大最小值可以直接维护。
- 右边部分的后缀最大最小值有所不同，因为我们需要把左右两部分接起来，所以对于维护的后缀最值数组smx[i]和smn[i]，都必须将当前操作前的初始值看为0，也就是长度为i的后缀对于长度为i-1的后缀来说，最值整体进行了移动，移动的方向就是第i个操作。(这一点感觉很巧妙：倒着递推的时候，参考点不断变化)

### 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=2e5+50;
int T,n,m,l,r;
char s[N];
int pmx[N],pmn[N],pre[N],smx[N],smn[N];
int main(){
    scanf("%d",&T);
    while(T--){
        scanf("%d%d",&n,&m);
        scanf("%s",s+1);
        pre[0]=0;
        pmx[0]=0;
        pmn[0]=0;
        for(int i=1;i<=n;i++){
            int d=s[i]=='+'?1:-1;
            pre[i]=pre[i-1]+d;
            pmx[i]=max(pmx[i-1],pre[i]);
            pmn[i]=min(pmn[i-1],pre[i]);
        }
        smx[n+1]=0;
        smn[n+1]=0;
        for(int i=n;i>=1;i--){
            int d=s[i]=='+'?1:-1;
            smx[i]=max(smx[i+1]+d,0);
            smn[i]=min(smn[i+1]+d,0);
        }
        while(m--){
            scanf("%d%d",&l,&r);
            int mx=max(pmx[l-1],pre[l-1]+smx[r+1]);
            int mn=min(pmn[l-1],pre[l-1]+smn[r+1]);
            printf("%d\n",mx-mn+1);
        }
    }
    return 0;
}
```

## 1468D (1700)

### 题意

长为n的方格路径上，有流氓和警察，流氓在a，警察在b，每一秒按顺序发生这三种事件：1)流氓走一步或者扔一颗在ai秒之后爆炸的鞭炮；2)鞭炮爆炸；3)警察走一步。问流氓最多可以扔多少个鞭炮。

### 分析

- 流氓肯定往远离警察的方向走。
- 最优的策略显然是先扔鞭炮，直到警察走到面前，然后再一直往边上走直到被抓。
- 要注意边界条件以及三种操作的顺序。

### 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=2e5+50;
int T,n,m,a,b,c[N];
bool cmp(int x,int y){
    return x>y;
}
int main(){
    scanf("%d",&T);
    while(T--){
        scanf("%d%d%d%d",&n,&m,&a,&b);
        for(int i=1;i<=m;i++){
            scanf("%d",&c[i]);
        }
        sort(c+1,c+1+m,cmp);
        // 可用扔鞭炮次数
        int avai=abs(a-b)-1;
        if(avai==0){
            printf("0\n");
            continue;
        }
        // 可拖延时间/被抓前的时间，当|a-b|=1且a在两边，time为0
        int time=abs(a-b)-1+(a<b?a-1:n-a);
        int cnt=0;
        for(int i=1;i<=m;i++){            
            if(c[i]<=time){
                cnt++;
                // 转化为一种子情况，时间减1
                time--;
            }
            if(cnt==avai){
                break;
            }
        }
        printf("%d\n",cnt);
    }
    return 0;
}
```

## 1461C (1500)

### 题意

给定一个长度为n的全排列，有m个操作，有pi的概率对长度为ri的前缀进行排序，求整个全排列有序的概率。

### 分析

- 先求出不合法(需要排序)的前缀长度t，对于每个操作，如果ri大于等于t，那么这个操作可以使整个全排列有序，因为是多个操作一起，利用概率的乘法定律，将所有"无法使整个全排列有序"的概率相乘，最后用1减去就是答案。如果ri小于r，那么这个操作无法使整个全排列有序，直接忽略，不影响概率。

### 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=1e5+50;
int T,n,m,a[N],r[N];
double p[N];
int main(){
    scanf("%d",&T);
    while(T--){
        scanf("%d%d",&n,&m);
        for(int i=1;i<=n;i++){
            scanf("%d",&a[i]);
        }
        int t=n;
        for(int i=n;i>=1;i--){
            if(a[i]!=i){
                break;
            }
            t--;
        }
        double ans=1.0;
        for(int i=1;i<=m;i++){
            scanf("%d%lf",&r[i],&p[i]);
            if(r[i]<t){
                continue;
            }
            ans=ans*(1.0-p[i]);
        }
        if(t==0){
            printf("1.000000\n");
            continue;
        }
        printf("%.6lf\n",1.0-ans);
    }
    return 0;
}
```

## 1487D (1500)

### 题意

求出满足$1<=a<=b<=c<=n$且$a^2+b^2=c^2$且$c=a^2-b$的三元组$(a,b,c)$的个数。

### 分析

- 把第二个条件代入，再根据平方差公式得到$c=b+1$，也就是要相邻两个数相加为一个完全平方数。
- 相邻两个数之和一定是奇数，所以答案就是$2n$以内的奇完全平方数(除去1)。

### 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
int T;
ll n;
int main(){
    scanf("%d",&T);
    while(T--){
        scanf("%lld",&n);
        ll ans=(sqrt(2*n-1)-1)/2;
        printf("%lld\n",ans);
    }
    return 0;
}
```