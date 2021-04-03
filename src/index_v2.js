console.time('jijian generate')
const path = require("path");
const fs = require('fs');
const moment = require('moment');
const mustache = require('mustache');
const matter = require('gray-matter');
const jsonToYaml = require('json2yaml');
const marked = require("marked");
// xxxDir是生成html的存放路径，xxxUrl是生成html的跳转url
const layoutDir = path.join(__dirname, '../layout/v2');
const postsDir = path.join(__dirname, '../posts');
const rootDir = path.join(__dirname, '../public/v2');
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
const pageDir = "page";
const pageUrl = "page";
const aboutDir = "about";
const aboutUrl = "about";
const detailDir = "detail";
const detailUrl = "detail";
const searchDir = "search";
const searchUrl = "search";
/**
 * 递归删除文件夹
 * @param path
 */
let delDir = (path) => {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(file => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}
// 更新public目录
delDir(rootDir);
fs.mkdirSync(rootDir);
/**
 * 从文件渲染mustache模板
 * @param path
 * @param view
 * @param partial
 * @returns {*}
 */
let renderFromFile = (path, view, partial) => {
    let str = fs.readFileSync(path).toString();
    return mustache.render(str, view, partial);
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
    // 摘要数据
    let absData = [];
    // 分类列表
    let cats = {};
    // 标签列表
    let tags = {};
    // index.json
    let jsonData = [];
    let dirs = fs.readdirSync(postPath);
    fs.mkdirSync(`${rootDir}/${detailDir}`);
    dirs.forEach(function (dir) {
            let files = fs.readdirSync(postPath + "/" + dir);
            files.forEach(function (filename) {
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
                // 要删除.md
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
                    date: moment(mat.date, "YYYY-MM-DD HH:mm:ss ZZ").format('MMM D, YYYY'),
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
                jsonData.push({
                    title: mat.title,
                    permalink: `${rootUrl}/${detailUrl}/${mat.permalink}`,
                    content: o.content,
                    date: moment(mat.date, "YYYY-MM-DD HH:mm:ss ZZ").format('MMM D, YYYY'),
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
                })
                if (cats[mat.category] === undefined) {
                    cats[mat.category] = 1;
                } else {
                    cats[mat.category]++;
                }
                mat.tags.forEach(function (tag) {
                    if (tags[tag] === undefined) {
                        tags[tag] = 1;
                    } else {
                        tags[tag]++;
                    }
                });
                // 渲染
                let detailComponent = renderFromFile(`${layoutDir}/detail.html`, {
                    title: obj.title,
                    date: obj.date,
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
                    content: marked(o.content),
                    url: `${rootUrl}/${detailUrl}/${mat.permalink}`,
                });
                let detailPage = renderFromFile(`${layoutDir}/index.html`, {
                    title: mat.title + ' - zxCoder\'s blog',
                    year: moment().year(),
                    navbarItems,
                }, {
                    content: detailComponent
                });
                fs.mkdirSync(`${rootDir}/${detailDir}/${mat.permalink}`);
                fs.writeFileSync(`${rootDir}/${detailDir}/${mat.permalink}/index.html`, detailPage);
            })
        }
    );
    jsonData.sort((a, b) => {
        return moment(b.date, "MMM D, YYYY").diff(moment(a.date, "MMM D, YYYY"));
    })
    fs.writeFileSync(`${rootDir}/index.json`, JSON.stringify(jsonData));
    // 格式转换
    let tagList = []
    let catList = []
    for (let tag in tags) {
        tagList.push({
            name: tag,
            num: tags[tag],
            link: `${rootUrl}/${tagUrl}/${tag}`,
        })
    }
    for (let cat in cats) {
        catList.push({
            name: cat,
            num: cats[cat],
            link: `${rootUrl}/${categoryUrl}/${cat}`,
        })
    }
    let sortFun = (a, b) => {
        return a.num < b.num ? 1 : -1;
    }
    tagList.sort(sortFun)
    catList.sort(sortFun)
    absData.sort((a, b) => {
        return moment(b.date, "MMM D, YYYY").diff(moment(a.date, "MMM D, YYYY"));
    })
    return {
        absData,
        catList,
        tagList,
    }
}
/**
 * 渲染列表页面
 * @param path 生成的页面放在{path}/page/下
 * @param url
 * @param data 所有数据
 * @param home 是否是首页
 * @param name 分类/标签名
 */
let renderList = (path, url, data, home = false, name = '') => {
    const total = data.length;
    let listComponent = renderFromFile(`${layoutDir}/list.html`, {
        data,
    });
    let index = renderFromFile(`${layoutDir}/index.html`, {
        title: (home ? '' : name + ' - ') + 'zxCoder\'s blog',
        year: moment().year(),
        rootUrl,
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
renderList(rootDir, rootUrl, absData, true);
// 关于页
let aboutContent=[
    {
        name:"About Me",
        data:[
            "一个不<del>喜欢</del>懂科研的准研究生，打过ACM，CF灰名水平，喜欢写代码",
            "不喜欢人工智能，是激进的<del>反AI者</del>弱人工智能支持者",
            "数学不太行，英文也不太行，语文更不行",
            "<a href='https://www.github.com/Zeng1998'>Github</a>",
            "Email: <a href='mailto:1129142694@qq.com'>1129142694@qq.com</a>"
        ],
    },
    {
        name:"About My Blog",
        data:[
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
    year: moment().year(),
    rootUrl,
    navbarItems,
}, {
    content: aboutComponent,
});
fs.mkdirSync(`${rootDir}/${aboutDir}`);
fs.writeFileSync(`${rootDir}/${aboutDir}/index.html`, aboutPage);
// 分类首页
let categoryComponent = renderFromFile(`${layoutDir}/category.html`, {
    title: "分类",
    catList,
});
let categoryPage = renderFromFile(`${layoutDir}/index.html`, {
    title: '分类 - zxCoder\'s blog',
    year: moment().year(),
    rootUrl,
    navbarItems,
}, {
    content: categoryComponent
});
fs.mkdirSync(`${rootDir}/${categoryDir}`);
fs.writeFileSync(`${rootDir}/${categoryDir}/index.html`, categoryPage);
// 分类列表页
for (let i = 0; i < catList.length; i++) {
    let cat = catList[i];
    let filteredData = absData.filter(value => {
        return value.category.name === cat.name;
    })
    fs.mkdirSync(`${rootDir}/${categoryDir}/${cat.name}`);
    renderList(`${rootDir}/${categoryDir}/${cat.name}`,
        `${rootUrl}/${categoryUrl}/${cat.name}`,
        filteredData, false, cat.name);
}
// 标签首页
let tagComponent = renderFromFile(`${layoutDir}/tag.html`, {
    title: "标签",
    tagList,
});
let tagPage = renderFromFile(`${layoutDir}/index.html`, {
    title: '标签 - zxCoder\'s blog',
    year: moment().year(),
    navbarItems,
}, {
    content: tagComponent
});
fs.mkdirSync(`${rootDir}/${tagDir}`);
fs.writeFileSync(`${rootDir}/${tagDir}/index.html`, tagPage);
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
        `${rootUrl}/${tagUrl}/${tag.name}`,
        filteredData, false, tag.name);
}
// 搜索页
let searchComponent = renderFromFile(`${layoutDir}/search.html`, {
    rootUrl,
});
let searchPage = renderFromFile(`${layoutDir}/index.html`, {
    title: '搜索 - zxCoder\'s blog',
    year: moment().year(),
    search: rootUrl,
    navbarItems,
}, {
    content: searchComponent,
});
fs.mkdirSync(`${rootDir}/${searchDir}`);
fs.writeFileSync(`${rootDir}/${searchDir}/index.html`, searchPage);
// favicon.ico
fs.writeFileSync(`${rootDir}/favicon.ico`, fs.readFileSync(`${srcDir}/favicon.ico`));
// 生成url.txt文件
if (arguments.length > 0 && arguments[0] !== "") {
    let fWrite = fs.createWriteStream(`${rootDir}/../../urls.txt`);
    // 首页
    fWrite.write(`${rootUrl}` + '\n');
    // 分类页
    fWrite.write(`${rootUrl}/category` + '\n');
    // 分类列表页
    for (let i = 0; i < catList.length; i++) {
        fWrite.write(`${catList[i].link}` + '\n');
   }
    // 标签页
    fWrite.write(`${rootUrl}/tags` + '\n');
    // 标签列表首页
    for (let i = 0; i < tagList.length; i++) {
        fWrite.write(`${tagList[i].link}` + '\n');
    }
    // 详情页
    for (let i = 0; i < absData.length; i++) {
        fWrite.write(`${absData[i].permalink}` + '\n');
    }
    fWrite.close();
}
// 复制js
fs.writeFileSync(`${rootDir}/highlight.pack.js`, fs.readFileSync(`${srcDir}/highlight.pack.js`));
// fs.writeFileSync(`${rootDir}/katex.js`, fs.readFileSync(`${srcDir}/katex.js`));
console.timeEnd('jijian generate');
