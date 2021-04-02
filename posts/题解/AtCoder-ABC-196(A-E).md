---
draft: true
---

## D

长为H，宽为W的面积不超过16的矩形，有A个2\*1和B个1\*1的瓷砖，保证能铺满，问铺满的方案数。

直接爆搜，标记每个单位是被哪种瓷砖所占，因为2\*1的可以旋转，所以是三种，然后搜就完事了。

注意放横的2\*1时要注意判断右边的那块有没有被上面一行放竖的2\*1占用了，这个bug浪费了接近30分钟...

```cpp
//
// Created by zxc on 2020/11/28.
//
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