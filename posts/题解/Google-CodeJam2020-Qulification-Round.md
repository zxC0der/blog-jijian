---
permalink: google-code-jam-2020-qualification-round
tags: 
  - 贪心
  - 递归
  - 字符串
  - 排序
  - 区间覆盖
  - 交互题
  - 01序列
  - TODO
category: 题解
title: Google-CodeJam2020-Qulification-Round
date: 2021-02-10 11:50:17 +0800
math: true
---

## A Vestigium

求方阵的主对角线和，判断有多少个行和多少个列有重复数字。

## B Nesting Depth

给一个数字序列，要求添加最少的括号，使得最后的字符串**括号是平衡的**，并且**每个数字x都正好被x对括号所包括**。

先考虑`xxx0xxx`的串，很显然，0不需要括号，而两边的两部分至少都是1，所以可以用一对括号将xxx包括起来，得到`(xxx)0(xxx)`，然后再处理每部分的xxx，此时`xxx`外层已经有一个括号，因此xxx中的1不需要括号，所以需要找到`xxx1xxx`的结构进行迭代处理。

迭代因为每次字符串都会变化，不太好写，因此采用递归的方法，基于上面的思路，可以得到算法如下：

- 构造一个dfs函数，进行类似split的操作，split的分隔符从'0'到字符串的最大数字字符，该函数返回传入字符串加括号后的结果。
- dfs函数中，利用分隔符将字符串分为多个部分，每个部分再递归处理，然后将每个部分加括号的结果再加上外层的一对括号，而分割符号不需要加(即使分隔符号不是0)，再将结果返回。
- 考虑一些边界情况：比如遍历后没有分割，不能直接返回，需要递归找下一个字符的分割；比如分割时注意最后不要漏了最后一个部分。

```cpp
#include <bits/stdc++.h>
using namespace std;
int T;
char s[105];
vector<char> dfs(vector<char> &arr,char cp,char mx){
    if(cp==mx){
        return arr;
    }
    int siz=arr.size();
    vector<char> ans;
    vector<char> t;
    for(int i=0;i<siz;i++){
        if(arr[i]==cp){
            if(t.size()>0){
                t=dfs(t,cp+1,mx);
                ans.push_back('(');
                ans.insert(ans.end(),t.begin(),t.end());
                ans.push_back(')');
                t.clear();
            }
            ans.push_back(cp);
        }else{
            t.push_back(arr[i]);
        }
    }
    if(t.size()>0){
        t=dfs(t,cp+1,mx);
        if(t.size()>0){
            ans.push_back('(');
            ans.insert(ans.end(),t.begin(),t.end());
            ans.push_back(')');
        }
    }
    return ans;
}
int main(){
    scanf("%d",&T);
    for(int t=1;t<=T;t++){
        scanf("%s",s);
        int n=strlen(s);
        vector<char> vs(s,s+n);
        char mx='0';
        for(int i=0;i<n;i++){
            mx=max(mx,s[i]);
        }
        vector<char> ans=dfs(vs,'0',mx);
        printf("Case #%d: ",t);
        int siz=ans.size();
        for(int i=0;i<siz;i++){
            printf("%c",ans[i]);
        }
        printf("\n");
    }
    return 0;
}
```

## C Parenting Partnering Returns

将n个时间段分配给两个人，要求不重叠，输出任意一个方案或者无解。

按照开始时间，结束时间的顺序排序，然后遍历贪心取，如果两个人都不能拿，就无解。

## D ESAb ATAd

第一次写交互题，参考了[这个博客](http://zory.ink/posts/6ad41bdb.html)。

题意是有一个100位的01序列，你每次可以询问某个位置的值，且每10次询问后(注意题目表达)，序列会等概率随机发生4种变化的一种，包括1)取反 2)反转 3)取反+反转 4)无变化，要求不超过150次询问得到该序列。

首先要找到变化的规律，一对01对有四种形式(00 01 10 11)进行这四种操作的结果只有16种，经过观察，可以发现01对可以抽象为两种，相同和不同(00和01)，而对应四种变化得到的也是两种不同的01对，所以，如果能找到一对相同的01对和一对不同的01对，通过观察变化前后的不同，就可以确定这次变化，这样子，需要2次询问，剩下的8次询问可以用来确定其他位，然后在变化的时候，将这些所有位都进行变化。

为了方便处理，采用头尾双指针的方法来确定序列，这样每次都是两次询问，刚好可以保证每十次询问就变化。

如果没同时找到相同和不同的01对，比如一直只有相同的01对，也没关系，此时只需要一次询问就可以确定序列的变化。

```cpp
#include <bits/stdc++.h>
using namespace std;
int T,n;
int ans[105];
int ask(int p){
    printf("%d\n",p);
    fflush(stdout);
    int ans;
    scanf("%d",&ans);
    return ans;
}
void complement(){
    for(int i=1;i<=n;i++){
        ans[i]=1-ans[i];
    }
}
void reverse(){
    for(int i=1;i<=n/2;i++){
        swap(ans[i],ans[n+1-i]);
    }
}
int main(){
    scanf("%d%d",&T,&n);
    for(int t=1;t<=T;t++){
        // 第几次询问
        int qs=1;
        // 已确定数组边界
        int l=1,r=n;
        // 相同和不同的数对位置
        int sa=0,di=0;
        while(l<=r){
            if(qs>10 && qs%10==1){
                // 变化是发生在第x1次询问之后，回复之前
                if(sa&& di){
                    int ta=ask(sa);
                    int tb=ask(di);
                    if(ta==ans[sa]){
                        if(tb==ans[di]){
                            // 4 没变化
                        }else{
                            // 2 reverse
                            reverse();
                        }
                    }else{
                        if(tb==ans[di]){
                            // 3 取反+reverse
                            complement();
                            reverse();
                        }else{
                            // 1 取反
                            complement();
                        }
                    }
                }else if(sa){
                    int t=ask(sa);
                    if(t!=ans[sa]){
                        // 1或3 取反
                        complement();
                    }
                    ask(sa);
                }else{
                    int t=ask(di);
                    if(t!=ans[di]){
                        // 1或2 reverse
                        reverse();
                    }
                    ask(di);
                }
            }else{
                ans[l]=ask(l);
                ans[r]=ask(r);
                if(ans[l]==ans[r]){
                    sa=l;
                }else{
                    di=l;
                }
                l++;
                r--;
            }
            // 题目设计每十次询问才会变化，所以每次都询问两个，方便处理
            qs+=2;
        }
        for(int i=1;i<=n;i++){
            printf("%d",ans[i]);
        }
        printf("\n");
        fflush(stdout);
        // 返回结果Y或N，但一般没办法再怎么处理，但要记得读
        char res[10];
        scanf("%s",res);
    }
    return 0;
}
```

## E Indicium

构造一个N\*N的矩阵，满足每一行每一列都是不重复的1到N，且对角线的和为K。

// TODO 暂时不会做