---
tags: 
  - AtCoder
  - 计算几何
  - 思维
  - 二分查找
  - 分类讨论
  - 前缀和
  - 二分答案
  - 并查集
title: AtCoder-ABC-181(A-F)
date: 2020-11-05 22:43:17 +0800
permalink: atcoder-abc-181
category: 题解
math: true;
---

## A

奇数输出Black，偶数输出White。

## B

求多个连续整数区间和。

## C

判断点C是否在直线AB上，可以通过判断AB向量和AC向量的叉积是否为0，叉积公式为$x_1y_2-x_2y_1$，大于0说明AC向量在AB向量顺时针方向，小于0是逆时针方向，等于0则共线。

## D

1e5的数字串，问能否重新调整位置使得这个数可以整除8。分类讨论，因为1000肯定可以被8整除，所以只要枚举后三位能被8整除的数，判断原来的数能否组成这个三位数。

**注意：** 枚举要从三位数开始枚举，也就是104，而不是8，枚举8的话另外两位不一定是0，所以如果要枚举8的话，其实要枚举的是008，所以原数字里需要两个0。如果从104开始枚举，例如1008，1016这种数字也会被被check
到，因为会枚举到800，800可以，008显然也可以，同理也会枚举到160，所以016也可以。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=2e5+50;
char s[N];
int dig[10];
bool check(int x){
    int temp[10]={0};
    int cnt=3;
    while(x){
        cnt--;
        temp[x%10]++;
        x/=10;
    }
    temp[0]+=cnt;
    for(int i=0;i<10;i++){
        if(dig[i]<temp[i]){
            return false;
        }
    }
    return true;
}
int main(){
    scanf("%s",s);
    int n=strlen(s);
    if(n==1){
        if(s[0]=='8'){
            printf("Yes\n");
        }else{
            printf("No\n");
        }
    }else if(n==2){
        if(((s[0]-'0')*10+(s[1]-'0'))%8==0 || ((s[1]-'0')*10+(s[0]-'0'))%8==0){
            printf("Yes\n");
        }else{
            printf("No\n");
        }
    }else{
        for(int i=0;i<n;i++){
            dig[s[i]-'0']++;
        }
        for(int i=8;i<1000;i+=8){
            if(check(i)){
                printf("Yes\n");
                return 0;
            }
        }
        printf("No\n");
    }
}
```

## E

从m个数中选择一个插入到另外n个数(n为奇数)，然后两两配对，使得差的和最小。

首先n个数排序，然后枚举m个数中的每一个，二分查找插入的位置，插入之后会影响小范围的答案统计，而大范围的不变，所以可以先正着和倒着分别求一次差的前缀和和后缀和，然后分类讨论插入的位置，更新答案即可。

一开始可以先把所有边界情况详细分类讨论，然后再考虑合并。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=2e5+50;
int n,m,h[N],w[N];
int l[N],r[N];
int main(){
    scanf("%d%d",&n,&m);
    for(int i=1;i<=n;i++){
        scanf("%d",&h[i]);
    }
    for(int i=1;i<=m;i++){
        scanf("%d",&w[i]);
    }
    sort(h+1,h+1+n);
    for(int i=1;i<=n;i++){
        l[i]=l[i-1];
        if(i%2==0){
            l[i]+=h[i]-h[i-1];
        }
    }
    for(int i=n;i>=1;i--){
        r[i]=r[i+1];
        if((n-i)%2==1){
            r[i]+=h[i+1]-h[i];
        }
    }
    int ans=INT_MAX;
    for(int i=1;i<=m;i++){
        int k=lower_bound(h+1,h+1+n,w[i])-h;
        if(k%2==1){
            ans=min(ans,l[k-1]+h[k]-w[i]+r[k+1]);
        }else{
            ans=min(ans,l[k-2]+w[i]-h[k-1]+r[k]);
        }
    }
    printf("%d\n",ans);
    return 0;
}
```

## F

y=100和y=-100两条直线之间有一些钉子，求一个最大的环能够从左边走到右边而不会碰到钉子和直线。

因为答案具有单调性，所以可以二分答案，然后考虑一个问题：两个钉子如果距离小于2r，说明环不可能从这两个钉子之间通过，所以可以把这两个钉子看成一个整体，所以用到了并查集，对于每个半径，枚举所有钉子对，用并查集维护，也包括了上下两条直线。

最后判断如果上下两条直线已经属于同一个并查集，则这个半径的环无法通过。

**注意：** 一开始写成当并查集数量等于1时，无法通过，其实不止这种情况，有可能上下直线连成一起，但是还有其他的钉子组成了其他的并查集。

```cpp
#include <bits/stdc++.h>
using namespace std;
const double eps=1e-8;
int n;
double x[105],y[105];
int p[105];
void init(){
    for(int i=1;i<=n+2;i++){
        p[i]=i;
    }
}
int find(int x){
    return x==p[x]?p[x]:find(p[x]);
}
void unit(int i,int j){
    int fa=find(i);
    int fb=find(j);
    p[fa]=fb;
}
double dis2(int i,int j){
    return (x[i]-x[j])*(x[i]-x[j])+(y[i]-y[j])*(y[i]-y[j]);
}
bool check(double a){
    init();
    for(int i=1;i<=n;i++){
        for(int j=1;j<=n;j++){
            if(i==j){
                continue;
            }
            if(dis2(i,j)-4*a*a<=eps){
                unit(i,j);
            }
        }
    }
    for(int i=1;i<=n;i++){
        if(100-y[i]-2*a<=eps){
            unit(i,n+1);
        }
        if(y[i]+100-2*a<=eps){
            unit(i,n+2);
        }
    }
    return find(n+1)!=find(n+2);
}
int main(){
    scanf("%d",&n);
    for(int i=1;i<=n;i++){
        scanf("%lf%lf",&x[i],&y[i]);
    }
    double l=0,r=100;
    double ans;
    while(l+eps<=r){
        double mid=(l+r)/2;
        if(check(mid)){
            ans=mid;
            l=mid;
        }else{
            r=mid;
        }
    }
    printf("%lf\n",ans);
    return 0;
}
```
