---
draft: true
---

## B Pascal Walk

构造一个和为N的杨辉三角路径，N<=1e9。

思想僵化了，看了题解才做出来。

注意到杨辉三角的特点是每一行的和都是2个次幂，所以路径的和这个数刚好可以拆成二进制位，对每一位，如果为0，就靠边走，如果为1，就横着走。这样因为一直有靠边走，所以得到的总和比预期的要多，我们假设先走到30层，也就是多了30，所以如果我们要构造N的路径，实际上就需要用这个方法构造N-30的路径。

然后，因为如果二进制位为1，靠边走所加的1并不是多余的，所以还需要利用一个类似容斥的思想，把这部分的缺的再继续往下靠边走。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
int T;
ll n;
int main(){
    scanf("%d",&T);
    for(int t=1;t<=T;t++){
        scanf("%lld",&n);
        printf("Case #%d:\n",t);
        if(n<500){
            for(int i=1;i<=n;i++){
                printf("%d 1\n",i);
            }
            continue;
        }
        n-=30;
        int y=1;
        int cnt=0;
        int sum=0;
        for(int i=0;i<30;i++){
            printf("%d %d\n",i+1,y);
            if((n>>i)&1){
                cnt++;
                if(y==1){
                    for(int j=2;j<=i+1;j++){
                        printf("%d %d\n",i+1,j);
                    }
                    if(i+1>=2){
                        y=i+2;
                    }
                }else{
                    for(int j=y-1;j>=1;j--){
                        printf("%d %d\n",i+1,j);
                    }
                    y=1;
                }
            }else{
                if(y!=1){
                    y++;
                }
            }
        }
        for(int i=0;i<cnt;i++){
            if(y==1){
                printf("%d %d\n",31+i,1);
            }else{
                printf("%d %d\n",31+i,y);
                y++;
            }
        }
    }
    return 0;
}
```