---
draft: true
permalink: leetcode-weekly-230
tags:
  - 贪心
  - 优先队列
  - 单调栈
  - TODO
---

## C 通过最少操作次数使数组的和相等

给定两个长度可能不同的数组，值域为[1,6]，每次可以选择任意一个数组的任意一个数修改为值域内的另外一个数，问最少修改次数使得两个数组总和相等，或者返回-1表示不可能。

首先处理不可能的情况，即当两个数组长度比例大于6，直接返回-1。然后计算两个数组总和，显然，总和小的数组的数需要变大，而另一个数组的数需要变小，然后每次贪心地取变化(变大或变小)的值，直到两个数组总和差值小于等于0。

这里值域比较小，可以直接使用桶排序。

```cpp
class Solution {
public:
    int minOperations(vector<int>& nums1, vector<int>& nums2) {
        int n=nums1.size();
        int m=nums2.size();
        if(n>m*6 || m>n*6){
            return -1;
        }
        int sum1=0;
        int sum2=0;
        for(int i=0;i<n;i++){
            sum1+=nums1[i];
        }
        for(int i=0;i<m;i++){
            sum2+=nums2[i];
        }
        if(sum1==sum2){
            return 0;
        }
        vector<int> ava(6,0);
        if(sum1>sum2){
            for(int i=0;i<n;i++){
                ava[nums1[i]-1]++;
            }
            for(int i=0;i<m;i++){
                ava[6-nums2[i]]++;
            }
        }else if(sum1<sum2){
            for(int i=0;i<n;i++){
                ava[6-nums1[i]]++;
            }
            for(int i=0;i<m;i++){
                ava[nums2[i]-1]++;
            }
        }
        int cha=abs(sum1-sum2);
        int ans=0;
        for(int i=5;i>=0;i--){
            while(ava[i]){
                cha-=i;
                ava[i]--;
                ans++;
                if(cha<=0){
                    return ans;
                }
            }
        }
        return -1;
    }
};
```

## D 车队 II

给定n个车的位置和速度，如果追上下一辆车，两辆车就会合成一个车队，多辆车同理，而车队的速度是其中速度最慢的车决定的。问每辆车追上下一辆车的时间，如果追不上，返回-1。

解法1(堆):

- 一开始所有车都是独立的，一辆车就是一个车队，求出前n-1辆车追上下一辆车所花费的时间(追不上的跳过)，加入堆(按追上时间从小到大)，同时每个时间需要关联追上后这个车队的最左和最右车辆编号。
- 依次从堆中取出追及关系，其中最左的车辆可以直接记录答案了(注意不能覆盖答案，先取出的一定是时间短的，但是堆里可能存在之前加入的)。
- 维护新的车辆关系，得到答案的车辆已经不用考虑，然后将新的追及关系加入堆中。

```cpp
const int N=1e5+50;
class Solution {
public:
    typedef pair<double,pair<int,int>> PDPII;
    double calc(int p1,int s1,int p2,int s2){
        if(s1<=s2){
            return -1;
        }
        return (p2-p1)*1.0/(s1-s2);
    }
    vector<double> getCollisionTimes(vector<vector<int>>& cars) {
        int n=cars.size();
        vector<double> ans(n,-1);
        // 每一辆车的左边车辆
        vector<int> l(n,0);
        for(int i=0;i<n;i++){
            l[i]=i-1;
        }
        // 初始每一辆车能追上下一辆车所花费时间
        // first为时间，second为追上后车队边界
        priority_queue<PDPII,vector<PDPII>,greater<PDPII>> q;
        for(int i=0;i<n-1;i++){
            double t=calc(cars[i][0],cars[i][1],cars[i+1][0],cars[i+1][1]);
            if(t<0){
                continue;
            }
            q.push({t,{i,i+1}});
        }
        while(!q.empty()){
            auto p=q.top();
            q.pop();
            auto t=p.first;
            auto c1=p.second.first;
            auto c2=p.second.second;
            // 避免答案被覆盖，优先队列中可能有之前添加的追及关系，但是后面的车已经发生了合并
            if(ans[c1]>=0){
                continue;
            }
            ans[c1]=t;
            // c1追上c2后，已经得到答案，不用再考虑，而且被追到的车一定是当前车队速度最慢的
            l[c2]=l[c1];
            if(l[c2]==-1){
                continue;
            }
            // 新的追及关系
            double nt=calc(cars[l[c2]][0],cars[l[c2]][1],cars[c2][0],cars[c2][1]);
            if(nt<0){
                continue;
            }
            q.push({nt,{l[c2],c2}});
        }
        return ans;
    }
};
```

解法2(单调栈):

- 从更宏观的角度看，不要只看到相邻的追及关系。
- **车i能追上车j，当且仅当车j在车i右边，且车j速度小于车i速度。**
- **车i追上车j之后，车i就“消失”了，因为条件的规定，车队的速度变为慢的车j的速度。**
- 基于以上两个点，考虑维护一个单调栈，并从右到左遍历处理。

TODO

其实本质第一步就是找到右边第一个速度比他慢的车辆，就很容易想到单调栈了，然后再细细考虑一下，然后判断