console.time('jijian generate')
const path = require("path");
const fs = require('fs');
const moment = require('moment');
const mustache = require('mustache');
const matter = require('gray-matter');
const jsonToYaml = require('json2yaml');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const md = require('markdown-it')({
    html:         true,
})
    .use(require('markdown-it-texmath'), {
        engine: require('katex'),
        delimiters: 'dollars',
        katexOptions: {macros: {"\\RR": "\\mathbb{R}"}}
    })
    .use(require('markdown-it-highlightjs'), {inline: true});
const {execSync} = require('child_process');
// xxxDir是生成html的存放路径，xxxUrl是生成html的跳转url
const layoutDir = path.join(__dirname, '../layout/v3');
const postsDir = path.join(__dirname, '../posts');
const rootDir = path.join(__dirname, '../public/v3');
const srcDir = path.join(__dirname, '.');
let arguments = process.argv.splice(2);
const devUrl = "http://127.0.0.1:8080";
const prodUrl = "https://www.zxcoder.top";
// 平时启动默认为dev环境，如果从deploy脚本启动默认为开发环境
let rootUrl = devUrl;
if (arguments.length > 0 && arguments[0] !== "") {
    rootUrl = arguments[0];
}
const categoryDir = "category";
const categoryUrl = "category";
const tagDir = "tags";
const tagUrl = "tags";
const aboutDir = "about";
const aboutUrl = "about";
const detailDir = "detail";
const detailUrl = "detail";
const searchDir = "search";
const searchUrl = "search";
const request = require('request');
execSync(`rm -rf ${rootDir}/*`);
/**
 * 从文件渲染mustache模板
 * @param path
 * @param view
 * @param partial
 * @returns {*}
 */
let renderFromFile = (path, view, partial) => {
    return mustache.render(fs.readFileSync(path).toString(), view, partial);
}
let savePage=(path,page)=>{
    fs.mkdirSync(path);
    fs.writeFileSync(`${path}/index.html`, page);
}
// 组件
let navbarItems = [
    {
        name: 'Home',
        link: `${rootUrl}`,
    },
    {
        name: 'Category',
        link: `${rootUrl}/${categoryUrl}`,
    },
    {
        name: 'Tag',
        link: `${rootUrl}/${tagUrl}`,
    },
    {
        name: 'About',
        link: `${rootUrl}/${aboutUrl}`,
    },
    {
        name: 'Search',
        link: `${rootUrl}/${searchUrl}`,
    },
];
/**
 * 解析md文件，渲染详情页
 * @param postPath
 * @returns {{absData: [], tagList: [], catList: []}}
 */
let readAllData = (postPath) => {
    let absData = [];
    let catList = []
    let tagList = []
    let jsonData = [];
    const mjAPI = require("mathjax-node");
    mjAPI.config({
        MathJax: {
            // traditional MathJax configuration
        }
    });
    mjAPI.start();
    let dirs = fs.readdirSync(postPath);
    fs.mkdirSync(`${rootDir}/${detailDir}`);
    dirs.forEach(function (dir) {
            let files = fs.readdirSync(postPath + "/" + dir);
            files.forEach(function (filename, idx) {
                let file = fs.readFileSync(postPath + "/" + dir + "/" + filename);
                let o = matter(file);
                let mat = o.data;
                if (mat.draft) {
                    return;
                }
                if (mat.permalink === undefined) {
                    console.log(filename);
                    throw Error("必须定义permalink");
                }
                if (mat.tags === undefined) {
                    console.log(filename);
                    throw Error("必须定义至少一个标签");
                }
                if (mat.math === undefined) {
                    mat.math = true;
                }
                mat.category = dir;
                // 删除.md
                mat.title = filename.slice(0, -3);
                if (mat.date === undefined) {
                    mat.date = moment().format("YYYY-MM-DD HH:mm:ss ZZ");
                }
                const newData = jsonToYaml
                        .stringify(mat)
                        .replace(/\n\s{2}/g, "\n")
                        .replace(/"/g, "") + '---\r\n'
                    + o.content;
                // 写入
                fs.writeFileSync(postPath + "/" + dir + "/" + filename, newData);
                let obj = {
                    title: mat.title,
                    permalink: `${rootUrl}/${detailUrl}/${mat.permalink}`,
                    date: moment(mat.date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY-MM-DD'),
                    timestamp: moment(mat.date, "YYYY-MM-DD HH:mm:ss ZZ").format("X"),
                    category: {
                        name: mat.category,
                        permalink: `${rootUrl}/${categoryUrl}/${mat.category}`,
                    },
                    tags: mat.tags.map(value => {
                        return {
                            name: value,
                            permalink: `${rootUrl}/${tagUrl}/${value}`,
                        }
                    }),
                };
                absData.push(obj);
                let jsObj = JSON.parse(JSON.stringify(obj));
                jsObj.content = o.content;
                jsonData.push(jsObj);
                let t = catList.findIndex(ele => ele.name === mat.category);
                if (t === -1) {
                    catList.push({
                        name: mat.category,
                        num: 1,
                        link: `${rootUrl}/${categoryUrl}/${mat.category}`,
                    })
                } else {
                    catList[t].num++;
                }
                mat.tags.forEach(function (tag) {
                    let t = tagList.findIndex(ele => ele.name === tag);
                    if (t === -1) {
                        tagList.push({
                            name: tag,
                            num: 1,
                            link: `${rootUrl}/${tagUrl}/${tag}`,
                        })
                    } else {
                        tagList[t].num++;
                    }
                });
                // 渲染
                let rdObj = JSON.parse(JSON.stringify(obj));
                rdObj.content = md.render(o.content);
                let detailComponent = renderFromFile(`${layoutDir}/detail.html`, rdObj);
                let detailPage = renderFromFile(`${layoutDir}/index.html`, {
                    title: mat.title + ' - zxCoder\'s blog',
                    navbarItems,
                }, {
                    content: detailComponent
                });
                const dom = new JSDOM(detailPage);
                let nav = dom.window.document.getElementById('TableOfContents');
                let h23s = dom.window.document.querySelectorAll('.post h2,h3');
                let h2ul = dom.window.document.createElement('ul');
                h23s.forEach(h23 => {
                    h23.id = h23.innerHTML;
                    // 给每个标题添加一个返回目录的a标签
                    let a = dom.window.document.createElement('a');
                    h23.style.display = 'inline-block';
                    a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">\n' +
                        '  <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>\n' +
                        '  <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>\n' +
                        '</svg>';
                    a.style.display = 'inline-block';
                    a.href = '#headingTOC';
                    h23.parentElement.insertBefore(a, h23.nextElementSibling);
                });
                let lst = dom.window.document.querySelector('.post');
                for (let i = 0; i < h23s.length; i++) {
                    if (h23s[i].tagName === 'H2') {
                        let h2li = dom.window.document.createElement('li');
                        let h2a = dom.window.document.createElement('a');
                        h2a.href = `#${h23s[i].innerHTML}`;
                        h2a.innerHTML = h23s[i].innerHTML;
                        h2li.appendChild(h2a);
                        h2ul.appendChild(h2li);
                        lst = h2li;
                    } else {
                        let h3ul = dom.window.document.createElement('ul');
                        while (i < h23s.length && h23s[i].tagName === 'H3') {
                            let h3li = dom.window.document.createElement('li');
                            let h3a = dom.window.document.createElement('a');
                            h3a.href = `#${h23s[i].innerHTML}`;
                            h3a.innerHTML = h23s[i].innerHTML;
                            h3li.appendChild(h3a);
                            h3ul.appendChild(h3li);
                            i++;
                        }
                        lst.appendChild(h3ul);
                        i--;
                    }
                }
                nav.appendChild(h2ul);
                nav.style.display = 'none';
                const codes = dom.window.document.querySelectorAll('div code')
                codes.forEach((block) => {
                    if (block.classList.length >= 1) {
                        block.innerHTML = "<ul><li>" + block.innerHTML.replace(/\n/g, "\n</li><li>") + "\n</li></ul>";
                        let ul = block.firstElementChild;
                        ul.removeChild(ul.lastElementChild);
                    } else {
                        block.classList.add('z-inline-code')
                    }
                });
                savePage(`${rootDir}/${detailDir}/${mat.permalink}`,dom.window.document.documentElement.outerHTML);
            })
        }
    );
    jsonData.sort((a, b) => b.timestamp - a.timestamp)
    fs.writeFileSync(`${rootDir}/index.json`, JSON.stringify(jsonData));
    tagList.sort((a, b) => b.num - a.num)
    catList.sort((a, b) => b.num - a.num)
    absData.sort((a, b) => b.timestamp - a.timestamp);
    return {
        absData,
        catList,
        tagList,
    }
}
/**
 * 渲染列表页面
 * @param path 生成的页面放在{path}/page/下
 * @param data 所有数据
 * @param home 是否是首页
 * @param name 分类/标签名
 */
let renderList = (path, data, home = false, name = '') => {
    let listComponent = renderFromFile(`${layoutDir}/list.html`, {
        data,
    });
    let index = renderFromFile(`${layoutDir}/index.html`, {
        title: (home ? '' : name + ' - ') + 'zxCoder\'s blog',
        navbarItems,
    }, {
        content: listComponent,
    });
    fs.writeFileSync(`${path}/index.html`, index);
}
let obj = readAllData(postsDir);
let absData = obj.absData;
let catList = obj.catList;
let tagList = obj.tagList;
// 首页列表
renderList(rootDir, absData, true);
// 关于页
let aboutContent = [
    {
        name: "About Me",
        data: [
            "一个不懂科研的准研究生，打过ACM，CF灰名水平，喜欢写代码",
            "不喜欢人工智能，是激进的<del>反AI者</del>弱人工智能支持者",
            "数学不太行，英文也不太行，语文更不行",
            "<a href='https://www.github.com/Zeng1998'>Github</a>",
            "Email: <a href='mailto:1129142694@qq.com'>1129142694@qq.com</a>"
        ],
    },
    {
        name: "About My Blog",
        data: [
            "基于<a href='https://github.com/janl/mustache.js'>Mustache</a>模板引擎，自己实现了一个极简的的静态网页生成器",
            "纯原生css/js打造，基本样式<del>抄袭</del>参考自<a href='https://bearblog.dev/'>bearblog</a>",
            "记录一些做题题解，技术总结，读书笔记，debug经历等等",
            "目前部署在<a href='https://vercel.com/'>Vercel</a>(免费，省心，速度也还行)，AliDNS解析",
        ],
    }
]
let aboutComponent = renderFromFile(`${layoutDir}/about.html`, {
    aboutContent,
});
let aboutPage = renderFromFile(`${layoutDir}/index.html`, {
    title: '关于 - zxCoder\'s blog',
    navbarItems,
}, {
    content: aboutComponent,
});
savePage(`${rootDir}/${aboutDir}`, aboutPage);
// 分类首页
let categoryComponent = renderFromFile(`${layoutDir}/category.html`, {
    title: "分类",
    catList,
});
let categoryPage = renderFromFile(`${layoutDir}/index.html`, {
    title: '分类 - zxCoder\'s blog',
    navbarItems,
}, {
    content: categoryComponent
});
savePage(`${rootDir}/${categoryDir}`, categoryPage);
// 分类列表页
for (let i = 0; i < catList.length; i++) {
    let cat = catList[i];
    let filteredData = absData.filter(value => {
        return value.category.name === cat.name;
    })
    fs.mkdirSync(`${rootDir}/${categoryDir}/${cat.name}`);
    renderList(`${rootDir}/${categoryDir}/${cat.name}`,
        filteredData, false, cat.name);
}
// 标签首页
let tagComponent = renderFromFile(`${layoutDir}/tag.html`, {
    title: "标签",
    tagList,
});
let tagPage = renderFromFile(`${layoutDir}/index.html`, {
    title: '标签 - zxCoder\'s blog',
    navbarItems,
}, {
    content: tagComponent
});
savePage(`${rootDir}/${tagDir}`,tagPage);
// 标签列表页
for (let i = 0; i < tagList.length; i++) {
    let tag = tagList[i];
    let filteredData = absData.filter(value => {
        return value.tags.map(value1 => {
            return value1.name;
        }).indexOf(tag.name) !== -1;
    })
    fs.mkdirSync(`${rootDir}/${tagDir}/${tag.name}`);
    renderList(`${rootDir}/${tagDir}/${tag.name}`,
        filteredData, false, tag.name);
}
// 搜索页
let searchComponent = renderFromFile(`${layoutDir}/search.html`, {});
let searchPage = renderFromFile(`${layoutDir}/index.html`, {
    title: '搜索 - zxCoder\'s blog',
    search: rootUrl,
    navbarItems,
}, {
    content: searchComponent,
});
savePage(`${rootDir}/${searchDir}`,searchPage);
console.timeEnd('jijian generate');