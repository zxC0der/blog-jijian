---
permalink: a-bug-about-cookie-samesite-httponly
tags: 
  - Bug Fixed
  - Cookie
  - 开发
  - dotnet
math: true
category: 杂七杂八
title: Cookie跨域问题(SameSite,HttpOnly)
date: 2021-04-03 10:55:29 +0800
---

## 心路历程

将毕设项目切换到WSL前端一直跑不起来，很奇怪，纠结了两天，一直以为是WSL的问题，今天终于解决，其实不是WSL的问题(巨硬对不起...)，而是我脑子的问题。

首先，后端在Response设置Cookie的时候，如果不加选项，前端在登陆时，Chrome会提示无法设置cookie，`This set-cookie didn't specify a "SameSite" attribute and was defaulted to "SameSite=Lax" and broke the same rules specified in the SameSiteLax value`，提示需要给set-cookie设置SameSite属性，这个属性是干啥的这里不深入...总之就是为了安全考虑的，避免啥啥啥的跨域攻击，但是为了方便，在这里我们直接将该属性设置为`None`，然后再试，Chrome会提示，如果设置了None，就还必须设置`Secure`属性，让Cookie只能通过HTTPS发送。

参考[官方文档](https://docs.microsoft.com/en-us/aspnet/core/security/samesite?view=aspnetcore-5.0)，最终我们后端设置Cookie的时候应该是

```csharp
var cookieOptions = new CookieOptions {
    Secure = true,
    SameSite = SameSiteMode.None
};
HttpContext.Response.Cookies.Append("session-id", sessionId,cookieOptions);
```

然后关键就来了，直接我直接照抄文档，多加了一个`HttpOnly = true`的属性，结果该属性的含义是Cookie只能通过HTTP/HTTPS传输，无法从JS脚本中获取，而我前端应用进入主页时需要判断Cookie是否存在，所以才一直进不去。

做东西学东西一定要细心，**有时候总想着能用就行，到最后往往就变成不能用了**。