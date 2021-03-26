---
permalink: jwt-session-summary
tag: 
  - jwt
  - 开发
  - session
tags: 
  - 默认
category: 基础知识
title: JWT基础原理
date: 2021-03-06 15:06:52 +0800
math: true
---

> 整理自[https://www.v2ex.com/t/656457](https://www.v2ex.com/t/656457)和[http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)

## 狭义的Session和Cookie

普通的用户认证流程通常如下：

- 客户端向服务端发送用户名和密码。
- 服务端验证通过后，在当前对话(session)里面保存相关数据(session data)，比如用户角色、登录时间等。
- 服务端向用户返回一个session_id，写入用户本地的Cookie。
- 客户端随后的每一次请求，都会自动将Cookie加到请求头中，其中的session_id被传回到服务端。
- 服务端收到session_id后，检索session data找到用户相关信息。

这种模式的扩展性不好，对于服务器集群，或者是跨域的服务架构等要求session数据共享的情况，一种解决方案是session数据持久化，写入数据库，这种方案的优点是架构清晰，缺点是工程量比较大，而且要性能有一定的损耗。另一种方案是服务器不保存session数据，采用Client Side Session的模式，所有数据都保存在客户端，每次请求再发回服务器。JWT就是这种方案的一个代表。

## JWT

### JWT原理

JWT全称是Json Web Token，它的原理是，在服务器认证以后，生成一个JSON对象，返回给用户，例如

```json
{
  "username": "zhangsan",
  "role": "admin",
  "expiredTime": "20180701000000"
}
```

之后，用户与服务端通信的时候，都要带上这个JSON对象。而服务器就不保存任何session数据了，也就是说，服务器变成无状态了，从而比较容易实现扩展。

服务器只靠这个对象来认定用户身份。因此为了防止用户篡改数据，服务器在生成这个对象的时候，需要加上签名。

### JWT 的数据结构

JWT是一个很长的字符串，中间用点分隔成三个部分，分别是Header，Payload和Signature。

其中Header是一个 JSON 对象，描述JWT的元数据，例如

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

其中alg属性表示签名算法，默认是HMAC SHA256。typ属性表示令牌类型，JWT令牌统一写为JWT。

Payload也是一个 SON 对象，用来存放实际传递的数据。JWT规定了7个官方字段。

- iss (issuer)：签发人
- exp (expiration time)：过期时间
- sub (subject)：主题
- aud (audience)：受众
- nbf (Not Before)：生效时间
- iat (Issued At)：签发时间
- jti (JWT ID)：编号

除了官方字段，也可以定义私有字段

**注意，JWT默认是不加密的(只是签名)，任何人都可以读到，不要把私密信息放在这个部分**。

这两部分都通过Base64URL算法转成字符串。

Signature部分是通过服务端的私钥，根据Header中指定的签名算法，对前两部分进行签名，防止数据篡改。

然后把Header，Payload，Signature三个部分拼成一个字符串，每个部分之间用"点"（.）分隔，返回给用户。

### JWT的使用方式

客户端收到服务器返回的Token，可以储存在Cookie里，也可以储存在localStorage里。

此后，客户端每次与服务器通信，都要带上这个Token。为了方便跨域，通常更好的做法是放在HTTP请求头的Authorization字段里面，或者放在POST请求的数据体里面。

### JWT的特点

- JWT默认不加密，但也是可以加密的。在生成原始 Token 以后，可以用密钥再加密一次。
- JWT的最大缺点是，由于服务器不保存session状态，因此无法在使用过程中使某个token失效，除非服务器部署额外的逻辑。

## 广义的Session和Cookie

广义的Session指的就是从用户登录到登出的过程中，维持的这样一种状态和相关信息。

### Sever Side Session

Sever Side Session是最常见的 Session实现，但它并不是唯一的一种Session实现。

优点:

- 数据存储在服务端，相对安全性更强
- 请求时只需要传递Session-ID，减小流量开销
- 可以方便的管理和吊销Session

缺点:

- Session-Data集中管理，不利于分布式架构，需要专门解决Session共享问题
- Session-Data需要占用服务端内存/存储，对服务端存在压力

### Client Side Session

Client Side Session顾名思义是在客户端存储Session。

优点:

- 将存储压力转移到了客户端，可以减小服务端的资源消耗
- 分布式架构下，不需要考虑Session共享问题

劣势:

- Cookie默认有4KB限制，不能存储太多内容
- 存在重放攻击的风险，客户端可能会将数据替换为合法的旧数据
- 实现Session数据的拉黑、强制失效等功能时比较复杂
- 部分实现没有对数据进行加密，客户端可以直接查看到数据内容，存在安全风险

## 相关问题

### Token是什么？

Token实际上泛指用于认证鉴权的凭据，广义上来说，如果使用Session-ID或Session-Data进行用户认证，也可以称之为Token。

### Session和JWT的关系是什么？

JWT是特定的一种Token生成方式，它有特定的格式，通过签名保证了信息的不可篡改，可以作为Client Side Session的数据处理方式。
