---
tags: 
  - 字符串
  - LCS
  - dp
permalink: codeforces-1447D
category: 题解
title: CodeForces1447D
date: 2020-12-03 21:02:28 +0800
math: true
---

## 题意

给定两个长度为5000的字符串s和t，分别从中找到一个子串ss和tt，使得4\*lcs(ss,tt)-len(ss)-len(tt)的值最大。

## 分析

5000! lcs! <del>很容易</del>想到最长公共子序列O(N^2)的dp求法，类似的，我们定义dp[i][j]表示以s[i]结尾的子串和以t[j]结尾的子串的最大计算值，注意一定是以这两个字符结尾，这样统计才不重不漏，而子串的左端点其实无需考虑，只需要通过取max更新答案。

当两个字符相等，显然lcs加1，两个子串长度也分别加1，总的值加2，当两个字符不等，按照lcs的做法，这里的一个子串长度加1，另一个不变。

## 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=5050;
char s[N],t[N];
int n,m;
// 不用管子串的开头，dp[i][j]表示以s[i]结尾的子串和以t[j]结尾的子串的最大计算值
int dp[N][N];
int main(){
    scanf("%d%d",&n,&m);
    scanf("%s",s+1);
    scanf("%s",t+1);
    int ans=0;
    for(int i=1;i<=n;i++){
        for(int j=1;j<=m;j++){
            if(s[i]==t[j]){
                dp[i][j]=dp[i-1][j-1]+2;
            }else{
                dp[i][j]=max(0,max(dp[i][j-1],dp[i-1][j])-1);
            }
            ans=max(ans,dp[i][j]);
        }
    }
    printf("%d\n",ans);
    return 0;
}
```