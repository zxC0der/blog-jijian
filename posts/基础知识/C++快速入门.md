---
draft: true
---

> 同时也是《Essential C++ 中文版》的读书笔记。

## 基于对象的编程(Object-Based Programming)

### 概述

- 一个类(class)包括一组公开(public)的操作函数和运算符(称为成员函数，member function)，以及一组私有(private)的实现细节。

类的声明:

```cpp
class Stack;
```

类的定义:

```cpp
class Stack{
public:
    // ...
private:
    // ...
};
```

member function都必须在class主体内声明，但不一定要定义，如果在class内定义，编译器会自动将该函数视为inline function。如果在class外定义，格式为`class name::function name{}`。

```cpp
class Stack{
public:
    bool push(const string&);
    bool pop(string &elem);
    bool peek(string &elem);
    bool empty();
    bool full();
    int size(){
        return _stack.size();
    }
private:
    vector<string> _stack;
};
```

inline function:

- 功能上类似于宏展开，比起宏展开，优点是，inline发生在编译阶段，会做类型检查，更安全，也便于编译器做上下文的优化；缺点是效率不如宏替换。
- inline主要用在比较简单的函数，例如size，get和set等。并且inline只是给编译器的建议，如果函数体过于复杂，编译器会直接忽略。
- 即使不显式地加上inline，大多数编译器在带编译优化选项的时候都会自己做inline的优化。

### 构造函数和析构函数

注意无参构造和一个参数的构造方法。

通过`A a`这种方法定义的对象分配在栈中，a也相当于是Java中的一个引用，指向这个对象。

```cpp
class Triangular{
public:
    Triangular();
    Triangular(int len);
    Triangular(int len,int beg_pos);
private:
    int _length;
    int _beg_pos;
    int _next;
};

int main() {
    Triangular t1;       // 无参构造
    Triangular t2=5;     // 一个参数的构造函数
    Triangular t3(1);    // 一个参数的构造函数
    Triangular t4(1,2);  // 两个参数的构造函数
    Triangular t5();     // 为了兼容C，这被认为是函数调用而不是无参构造
    return 0;
}
```

// TODO

默认构造参数(default constructor)有两种形式，一种是不带参数，一种是给所有参数提供默认值。

【特么真是奇怪的语法...】

```cpp
// 这两个构造参数不能同时定义
Triangular::Triangular(int len, int bp) {
    _length=len>0?len:1;
    _beg_pos=bp>0?bp:1;
    _next=_beg_pos-1;
}

Triangular::Triangular() {
    _length=1;
    _beg_pos=1;
    _next=0;
}
```



## 面向对象的编程(Object-Oriented Programming)