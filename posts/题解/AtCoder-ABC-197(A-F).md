---
draft: true

tags:
  - 爆搜
  - 计算几何
  - 贪心
  - DP
  - 分类讨论
---

## A

输入s，输出s[1]s[2]s[0]。

## B

方格图上有一些障碍，给定点(x,y)，计算和给定点在同一行或者同一列且之间(**包括这两个点**)没有障碍的方格数量。

## C

给定长度为n(n<=20)的一个数列，要求分成若干段，使得每一段求按位与的值进行按位异或得到的值最小。

n很小，直接爆搜。

## D

二维坐标轴上一个正n(n为偶数)边形，给定点$P_0$和$P_{n/2}$，求$P_1$。

计算几何...完全的知识盲区，参考题解。

首先求出$P_0P_{n/2}$的中点，也就是多边形的轴对称中心，设为点O，所以$OP_1$其实就是$OP_0$逆时针旋转$\farc{2\pi}{N}$角度得到，设$OP_0$和x轴夹角为$a$，长度为$l$，那么向量$OP_1$的坐标就是$(lcos(a+\farc{2\pi}{N}),lsin(a+\farc{2\pi}{N}))$，然后再加上中点，就能得到$P_1$的坐标。

```cpp
#include <bits/stdc++.h>
using namespace std;
int n;
double x_0,y_0,xn2,yn2;
const double pi=acos(-1);
int main(){
    scanf("%d",&n);
    scanf("%lf%lf%lf%lf",&x_0,&y_0,&xn2,&yn2);
    double xm=(x_0+xn2)/2;
    double ym=(y_0+yn2)/2;
    double l=sqrt((x_0-xm)*(x_0-xm)+(y_0-ym)*(y_0-ym));
    double x_1=l*cos(2*pi/n+atan2(y_0-ym,x_0-xm))+xm;
    double y_1=l*sin(2*pi/n+atan2(y_0-ym,x_0-xm))+ym;
    printf("%.12lf %.12lf\n",x_1,y_1);
    return 0;
}
```

## E

数轴上不同位置有n个颜色不同(颜色编号1-n，有些颜色可能不存在)的小球，初始在0，只能按照编号不递减的顺序收集小球，问收集完所有球再回到0走过的最小路程。

首先有个贪心的思想，收集完一种颜色的小球之后，肯定是停在该种颜色最左小球或者最右小球这两个位置，不可能停在中间(画一画感感性认知一下...)。

所以可以定义状态dp[i][0/1]表示收集完颜色i的小球之后，停在该颜色最左小球/最右小球此时走过的总路程。

状态转移需要分类讨论，根据上一个颜色收集完停的位置和当前颜色即将停下的位置的相对关系，进行不同转移，具体见代码。

注意每种颜色并不一定都有小球，所以维护上一个颜色收集后停下的位置，如果当前颜色不存在，那么该位置就不变，dp状态页直接从上一个颜色转移，无需修改。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=2e5+50;
const ll INF=1e18;
ll dp[N][2];
int n,c[N],vis[N];
ll l[N],r[N],x[N];
int main(){
//    freopen("in.txt","r",stdin);
    scanf("%d",&n);
    for(int i=1;i<=n;i++){
        l[i]=INF;
        r[i]=-INF;
    }
    int mx=0;
    for(int i=1;i<=n;i++){
        scanf("%lld%d",&x[i],&c[i]);
        vis[c[i]]=1;
        mx=max(mx,c[i]);
        l[c[i]]=min(l[c[i]],x[i]);
        r[c[i]]=max(r[c[i]],x[i]);
    }
    int lm=0;
    int rm=0;
    for(int i=1;i<=n;i++){
        // dp[i][0]表示收集完i的球之后停在该颜色最左边的球所花费的时间，同理dp[i][1]表示右边
        if(!vis[i]){
            dp[i][0]=dp[i-1][0];
            dp[i][1]=dp[i-1][1];
        }else{
            dp[i][0]=INF;
            dp[i][1]=INF;
            if(lm>r[i]){
                dp[i][0]=min(dp[i][0],dp[i-1][0]+lm-l[i]);
            }else{
                dp[i][0]=min(dp[i][0],dp[i-1][0]+r[i]-lm+r[i]-l[i]);
            }
            if(lm<l[i]){
                dp[i][1]=min(dp[i][1],dp[i-1][0]+r[i]-lm);
            }else{
                dp[i][1]=min(dp[i][1],dp[i-1][0]+lm-l[i]+r[i]-l[i]);
            }
            if(rm>r[i]){
                dp[i][0]=min(dp[i][0],dp[i-1][1]+rm-l[i]);
            }else{
                dp[i][0]=min(dp[i][0],dp[i-1][1]+r[i]-rm+r[i]-l[i]);
            }
            if(rm<l[i]){
                dp[i][1]=min(dp[i][1],dp[i-1][1]+r[i]-rm);
            }else{
                dp[i][1]=min(dp[i][1],dp[i-1][1]+rm-l[i]+r[i]-l[i]);
            }
            lm=l[i];
            rm=r[i];
        }
    }
    ll ans=min(dp[mx][0]+abs(l[mx]),dp[mx][1]+abs(r[mx]));
    printf("%lld\n",ans);
    return 0;
}
```

## F

给一个N个点M条边(N<1000,M<=1000)的图(不一定简单图，可能不连通，可能有环)，边上有a-z的字符，要求找出一条从1到N的最短路径满足路径上的字符组成回文串。

```cpp

```