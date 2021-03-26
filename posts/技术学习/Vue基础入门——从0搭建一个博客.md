---
tags: 
  - 博客
  - Vue
permalink: vue-startup-with-my-blog
category: 技术学习
title: Vue基础入门——从0搭建一个博客
date: 2021-01-12 21:40:44 +0800
math: true
---

> 拖了很久的一篇，一直想记录一下Vue开发一个简单的个人前端项目的全过程<del>(免得每写一次前端都要重新查一遍文档和博客)</del>，直到Vue3都出了，我终于写下这篇小短文了<del>(Vue2)</del>。

## 初始化

首先全局安装`vue`和`vue-cli`

```shell
npm install -g vue
npm install -g @vue/cli
```

然后通过`vue-cli`创建项目

```shell
vue init xxx
```

## 页面

在`src/components`下写一些组件，创建文件夹`src/pages`放页面，在`src`目录下的`App.
vue`是主组件，也是入口页面，里面通常是放`Header`，`Footer`，`router-view`这些组件，其中`router-view`是可以根据路由的变化切换页面的，后面会提到。

一个Vue组件有一些通用的结构，如下：

```vue
<template>
  <div>
    <!--组件内容-->
  </div>
</template>
<script>  // js部分
export default {
  name:"Navbar", // 组件名
  data() {       // 数据，写成函数的形式，使用数据副本，避免了数据污染
    return {
      current: 'home',
      searchText:"",
    };
  },
  methods: {     // 方法
    search(){
      // ...
    }
  },
  watch:{        // 监听某个数据的变化 
    searchText(nVal){   // 函数名就是监听的数据名，或者写成数据名:function(){}
      //参数就是新值，如果有两个参数，第二个就是旧值
    },
  },
};
</script>
<style scoped>  /** css部分，scoped表示只在组件内生效 **/
</style>
```

## 父子组件交互

### 父组件传值给子组件

在子组件中定义`props`，包括名字和类型，默认值等等。

```vue
<script>
export default {
  props: {
    pageSize: {
      type: Number
    },
  },
}
</script>
```

父组件传值，注意子组件props的命名是camelCase，而父组件传值则使用横线划分。除此之外还有很多其他的命名规范，<del>就不一一遵守了。</del>

```vue
<Pagination 
    :page-size="pageSize"
    @change="pageChange">
</Pagination>
```

### 子组件传值给父组件

在子组件中通过调用`emit`函数来触发父组件的回调函数，例如以下代码触发了父组件的`change`函数，也就是`@change`所指定的函数。

```js
this.$emit("change", para);
```

## 路由

首先安装`vue-router`，在`main.js`同级文件夹里创建`routes.js`，格式如下

```js
Vue.use(VueRouter)
const routes = [
    {
        path: "/about",
        name: "about",
        component: AboutPage,
    },
    // 路由匹配的优先级问题
    // 如果这个路由放在第一位，后面的/about会匹配到，把about看成page参数
    // {
    //     path: "/:page?/:tag?/:cat?",
    //     name: "home",
    //     component: PostListPage,
    // },

]
const router = new VueRouter({
    routes
})
const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (to) {
    return VueRouterPush.call(this, to).catch(err => err)
}
export default router
```

在`main.js`中导入，并作为参数构造Vue实例，注意要在`App.vue`中配置好`<router-view>`组件

```js
import router from "./routes";
new Vue({
    render: h => h(App),
    router, // 必须是router或者指定router:xxx
}).$mount('#app')
```

路由中复杂的参数以及其他配置具体参照文档。

## 获取数据

通常使用`axios`来获取数据，在本项目中，用将`md`文件生成`json`文件的方法实现一个“伪后端”，将文件放到`public`文件夹下，`axios`也同样可以获取到。

```js
this.$axios.get("/data.json").then((resp) => {
    // ...
})
```

注意`axios`的使用还需要在`main.js`中将`axios`绑定到`Vue`原型上。

```js
Vue.prototype.$axios = axios
```

## 其他

博客里用到了`pure.css`样式库，用法很简单，先`npm`安装，然后在`main.js`里`import Purecss from 'purecss'`导入，再用`Vue.use(Purecss)
`就能用上这个样式库，其他插件/组件库/样式库等也基本同理，看对应文档即可。

博客除了`pure.css`，还用到了`normalize.css`，`awesome-icon`，`mavon-editor`等。

## 运行

在项目目录下先`npm install`安装依赖包，然后`npm run serve`可以在本地跑起来，`npm run build`可以打包成静态文件放服务器上。

这个博客是用了`Vercel`托管，绑定`github`项目后，每次`push`完就会自动构建打包。
