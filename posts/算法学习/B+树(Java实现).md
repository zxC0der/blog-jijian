---
tags: 
  - B+树
  - 数据库
  - 数据结构
permalink: b-plus-tree-java-implementation
category: 算法学习
title: B+树(Java实现)
date: 2020-12-20 21:53:43 +0800
math: true
---

## 基础概念

B+树是一种多叉的平衡树，特点是数据都存储在叶子节点，且所有叶子节点通过一个双向链表连起来，而中间节点通过x个key分割x+1个子节点，每个子节点的所有值都大于等于左边的key，小于右边的key。对于一个m阶(order)的B+树，中间节点最多可以存储m-1个key，最少存储(m+1)/2-1个，叶子节点最多可以存储m-1个数据key-value对，最少存储(m+1)/2-1个。

## Search

查找是最简单的操作，从根节点往下递归直到叶子节点，通过中间节点的`searchInInternalNode`函数来判断要往哪个儿子节点走。

```java
public Tuple search(Tuple key){                       
    Node curNode=root;                                
    while(true){                                      
        if(curNode.isLeaf){                           
            return curNode.searchInLeafNode(key);     
        }else{                                        
            curNode=curNode.searchInInternalNode(key);
        }                                             
    }                                                 
}                                                     
```

## Insert

插入操作的第一步类似查找，从根节点往下找到叶子节点，然后插入到叶子节点，如果该叶子节点size超过了，就应该进行第二步的分裂，`splitLeafNode(tree)`。

```java
public boolean insert(Tuple key,Tuple value){
    if(search(key)!=null){
        return false;
    }
    Node curNode=root;
    while(true){
        if(curNode.isLeaf){
            curNode.insertLeafNode(this,key,value);
            break;
        }else{
            curNode= curNode.searchInInternalNode(key);
        }
    }
    return true;
}
public void insertLeafNode(BPlusTree tree,Tuple key,Tuple value){
    insertKeyValue(key,value);
    if(isOverfull()){
        splitLeafNode(tree);
    }                                     
}               
```

分裂叶子节点的方法首先是创建两个新的叶子节点，修改链表关系，然后复制所有key-value对，然后比较复杂的一步是修改父亲关系，需要判断当前分裂的叶子节点是否是根节点，若是根节点，需要创建一个新的根节点作为分裂的两个叶子节点的父节点，若不是根节点，需要删除父节点对当前分裂节点的儿子指针，然后加上分裂后两个新节点的儿子指针，然后如果父节点的size也超过了，就应该进行第三步的分裂，`splitInternalNode(tree)`

```java
public void splitLeafNode(BPlusTree tree){               
    Node left=buildLeafNode(tree.order);                 
    Node right=buildLeafNode(tree.order);                
    left.prev=prev;                                      
    if(prev!=null){                                      
        prev.next=left;                                  
    }else{                                               
        tree.head=left;                                  
    }                                                    
    right.next=next;                                     
    if(next!=null){                                      
        next.prev=right;                                 
    }                                                    
    left.next=right;                                     
    right.prev=left;                                     
    int siz=keys.size();                                 
    int leftSize=(siz+1)/2;                              
    left.keys.addAll(keys.subList(0,leftSize));          
    left.values.addAll(values.subList(0,leftSize));      
    right.keys.addAll(keys.subList(leftSize,siz));       
    right.values.addAll(values.subList(leftSize,siz));   
    if(isRoot){                                          
        splitNewRoot(tree,left,right);            
        tree.root.keys.add(right.keys.get(0));           
    }else{                                               
        parent.replaceChildren(this,left,right);     
        parent.insertInternalNode(right.keys.get(0));    
        if(parent.isOverfull()){                         
            parent.splitInternalNode(tree);              
        }                                                
    }                                                    
}          
private void replaceChildren(Node node,Node left,Node right){
    int index=children.indexOf(node);                        
    children.remove(index);                                  
    left.parent=this;                                        
    right.parent=this;                                       
    children.add(index,left);                                
    children.add(index+1,right);                             
}     
private void splitNewRoot(BPlusTree tree,Node left,Node right){
    isRoot=false;
    tree.root= buildRootNode(tree.order);
    left.parent=tree.root;
    right.parent=tree.root;
    tree.root.children.add(left);
    tree.root.children.add(right);
}                                                                                                     
```

类似叶子节点的分裂，首先创建两个中间节点，然后复制key和children，注意中间节点的分裂需要把中间一个key拉上去，然后修改父亲关系，同样是需要判断是否是根节点，若是根节点，同叶子节点，创建一个新的根节点然后把分裂的两个节点加上去，注意和叶子节点不同的是这里根节点加的key是拉上去的key，若不是根节点，同叶子节点进行替换，并插入拉上去的key，再判断父亲节点是否需要继续分裂。

```java
public void splitInternalNode(BPlusTree tree){                        
    Node left=buildInternalNode(tree.order);                          
    Node right=buildInternalNode(tree.order);                         
    int siz=keys.size();                                              
    int leftSize=(siz+1)/2;                                           
    Tuple keyToParent=keys.get(leftSize);                             
    left.keys.addAll(keys.subList(0,leftSize));                       
    children.subList(0,leftSize+1).forEach(child->{                   
        left.children.add(child);                                     
        child.parent=left;                                            
    });                                                               
    right.keys.addAll(keys.subList(leftSize+1,siz));                  
    children.subList(leftSize+1,siz+1).forEach(child->{               
        right.children.add(child);                                    
        child.parent=right;                                           
    });                                                               
    if(isRoot){                                                       
        splitNewRoot(tree,left,right);                        
        tree.root.keys.add(keyToParent);                              
    }else{
        parent.replaceChildren(this,left,right);                      
        parent.insertInternalNode(keyToParent);                     
        if(parent.isOverfull()){                                      
            parent.splitInternalNode(tree);                           
        }                                                             
    }                                                                 
}                                                                     
```

## Delete

删除操作细节比较多，整体框架也类似插入，递归找到叶子节点并删除对应key-value对，然后如果size不足，考虑三种情况，从前驱结点借，从后继节点借，或者合并前驱或后继节点，然后合并后父节点会少一个key，如果size不足，就需要继续进行下一步的操作，同时还要处理类似删除最后一个节点，删除第一个key-value对后必须修改祖先节点的key等细节。

```java
public boolean delete(Tuple key,Tuple value){
    if(search(key)==null){
        return false;
    }
    Node curNode=root;
    while(true){
        if(curNode.isLeaf){
            return curNode.deleteLeafNode(this,key,value);
        }else{
            curNode= curNode.searchInInternalNode(key);
        }
    }
}
public boolean deleteLeafNode(BPlusTree tree,Tuple key,Tuple value){
    boolean first=keys.indexOf(key)==0;                            
    Tuple oldKey=keys.get(0);                                      
    if(!deleteKeyValue(key,value)){                                
        return false;                                              
    }                                                              
    if(isRoot && keys.size()==0){                                  
        isRoot=false;                                              
        tree.root=null;                                            
    }                                                              
    if(first && keys.size()>0){                                    
        Tuple newKey=keys.get(0);                                  
        updateParentKey(oldKey,newKey);                            
    }                                                              
    if(isDeficient()){                                             
        if(isPrevLoanable()){                                      
            loanFromPrev();                                        
        }else if(isNextLoanable()){                                
            loadFromNext();                                        
        }else{                                                     
            if (canMergePrev()) {                                  
                mergePrev();                                       
            } else if (canMergeNext()) {                           
                mergeNext();                                       
            }                                                      
            if(parent!=null && parent.isDeficient()){              
                mergeInternalNode(tree,parent);                    
            }                                                      
        }                                                          
    }                                                              
    return true;                                                   
}          
private boolean isPrevLoanable(){                                                         
    return prev!=null && prev.isLoanable() && parent==prev.parent;                        
}                                                                       
private boolean isNextLoanable(){                                                         
    return next!=null && next.isLoanable() && parent==next.parent;                        
}                                                                                         
private void loanFromPrev(){                                                              
    int siz=prev.keys.size();                                                             
    Tuple loanKey=prev.keys.remove(siz-1);                                                
    keys.add(0,loanKey);                                                                  
    Tuple loanValue=prev.values.remove(siz-1);                                            
    values.add(0,loanValue);                                                              
    int index=parent.children.indexOf(this)-1;                                            
    parent.keys.remove(index);                                                            
    parent.keys.add(index,loanKey);                                                       
}                                                                                         
private void loadFromNext(){                                                              
    Tuple loanKey=next.keys.remove(0);                                                    
    keys.add(loanKey);                                                                    
    Tuple loanValue=next.values.remove(0);                                                
    values.add(loanValue);                                                                
    int index=parent.children.indexOf(this);                                              
    parent.keys.remove(index);                                                            
    parent.keys.add(index,next.keys.get(0));                                              
}     
private boolean canMerge(Node node) {                                                       
    return node!=null && keys.size() + node.keys.size() <= maxSize && parent == node.parent;
}                                                                                           
private boolean canMergePrev(){                                                             
    return canMerge(prev);                                                                  
}                                                                                           
private boolean canMergeNext(){                                                             
    return canMerge(next);                                                                  
}                                                                                   
private void mergePrev(){                    
    int siz=keys.size();                     
    for (int i = 0; i <siz; i++) {           
        prev.keys.add(keys.get(i));          
    }                                        
    int index=parent.children.indexOf(this)-1
    parent.keys.remove(index);               
    parent.children.remove(this);            
    prev.next=next;                          
    if (next != null) {                      
        next.prev=prev;                      
    }                                        
}                                            
private void mergeNext(){                    
    int siz=keys.size();                     
    for (int i = 0; i <siz; i++) {           
        next.keys.add(0,keys.get(i));        
    }                                        
    int index=parent.children.indexOf(this); 
    parent.keys.remove(index);               
    parent.children.remove(this);            
    next.prev=prev;                          
    if (prev != null) {                      
        prev.next=next;                      
    }                                        
}                                                                                                               
```

第一种是情况是要操作的父节点是根节点，且儿子节点只有一个，那么该儿子节点将作为新的根节点，另一种情况，首先要找出当前操作的中间节点的前驱和后继节点，注意中间节点是没有双向链表相连的，然后类似叶子节点的操作，也是考虑三种情况，从前驱结点借，从后继节点借，或者合并前驱或后继节点，注意从前驱结点借，其实相当于它们中间父节点的key落下来，然后前驱结点这个借出去的key拉上去，后继节点同理，最后同样是要往上考虑父亲节点是否需要继续合并下去。

```java
private void mergeInternalNode(BPlusTree tree,Node curNode){                        
    if (curNode.isRoot) {                                                           
        if (curNode.children.size() < 2) {                                          
            tree.root=tree.root.children.get(0);                                    
            tree.root.isRoot = true;                                                
            tree.root.parent = null;                                                
        }                                                                           
    } else {                                                                        
        int curIdx = curNode.parent.children.indexOf(curNode);                      
        int preIdx = curIdx - 1;                                                    
        int nextIdx = curIdx + 1;                                                   
        Node prevNode = null;                                                       
        Node nextNode = null;                                                       
        if (preIdx >= 0) {                                                          
            prevNode = curNode.parent.children.get(preIdx);                         
        }                                                                           
        if (nextIdx < curNode.parent.children.size()) {                             
            nextNode = curNode.parent.children.get(nextIdx);                        
        }                                                                           
        if (isInternalNodeLoanable(curNode,prevNode)) {                             
            borrowMiddleNodePrevious(curNode,prevNode);                             
        } else if (isInternalNodeLoanable(curNode,nextNode)) {                      
            borrowMiddleNodeNext(curNode,nextNode);                                 
        } else {                                                                    
            if (curNode.canMergeInternalNode(prevNode)) {                           
                mergeTwiToPreMiddleNode(prevNode, curNode);                            
                int parentKeyIdx = curNode.parent.children.indexOf(curNode)-1;      
                curNode.parent.keys.remove(parentKeyIdx);                           
                curNode.parent.children.remove(parentKeyIdx + 1);                   
            } else if (curNode.canMergeInternalNode(nextNode)) {                    
                mergeTwoToPreMiddleNode(curNode, nextNode);                            
                int parentKeyIdx = curNode.parent.children.indexOf(nextNode)-1;     
                curNode.parent.keys.remove(parentKeyIdx);                           
                curNode.parent.children.remove(parentKeyIdx + 1);                   
            }                                                                       
            if(curNode.parent.isDeficient()){                                       
                mergeInternalNode(tree,curNode.parent);                             
            }                                                                       
        }                                                                           
    }                                                                               
}        
private boolean isInternalNodeLoanable(Node curNode,Node node){           
    return node!=null && node.isLoanable() && curNode.parent==node.parent;
}           
private void borrowMiddleNodePrevious(Node curNode,Node preNode) {                                                                                 
    int parentKeyIdx = curNode.parent.children.indexOf(curNode)-1;             
    Tuple downKey = curNode.parent.keys.get(parentKeyIdx);                     
    curNode.keys.add(0, downKey);                                              
    curNode.parent.keys.remove(parentKeyIdx);                                  
    int preSize = preNode.keys.size();                                         
    Tuple upKey = preNode.keys.get(preSize - 1);                               
    curNode.parent.keys.add(parentKeyIdx, upKey);                              
    preNode.keys.remove(preSize - 1);                                          
    int preChildSize = preNode.children.size();                                
    Node borrowPoint = preNode.children.get(preChildSize - 1);                 
    curNode.children.add(0 , borrowPoint);                                     
    preNode.children.remove(preChildSize - 1);                                 
    borrowPoint.parent = curNode;                                              
}                                                                              
private void borrowMiddleNodeNext(Node curNode,Node nextNode) {                                                                                     
    int parentKeyIdx = curNode.parent.children.indexOf(nextNode)-1;            
    Tuple downKey = curNode.parent.keys.get(parentKeyIdx);                     
    curNode.keys.add(downKey);                                                 
    curNode.parent.keys.remove(parentKeyIdx);                                  
    Tuple upKey = nextNode.keys.get(0);                                        
    curNode.parent.keys.add(parentKeyIdx, upKey);                              
    nextNode.keys.remove(0);                                                   
    Node borrowPoint = nextNode.children.get(0);                               
    curNode.children.add(borrowPoint);                                         
    nextNode.children.remove(0);                                               
}                                                                                                                                                          
private boolean canMergeInternalNode(Node node){
    if (node != null) {
        return keys.size() + node.keys.size() <= maxSize && parent == node.parent;
    }
    return false;
}
private void mergeTwoInternalNode(Node first, Node sec) {
    int parentKeyIdx = sec.parent.children.indexOf(sec)-1;
    first.keys.add(first.parent.keys.get(parentKeyIdx));
    first.keys.addAll(sec.keys);
    for (int i = 0; i < sec.children.size(); i++) {
        sec.children.get(i).parent = first;
        first.children.add(sec.children.get(i));
    }
}                                                        
```
