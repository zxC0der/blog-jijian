console.time('jijian generate')
const path = require("path");
const fs = require('fs');
const moment = require('moment');
const mustache = require('mustache');
const matter = require('gray-matter');
const jsonToYaml = require('json2yaml');
const md = require('markdown-it')({
    html: true,
});
const readline=require('readline');
// xxxDir是生成html的存放路径，xxxUrl是生成html的跳转url
const layoutDir = path.join(__dirname, '../layout');
const postsDir = path.join(__dirname, '../posts');
const rootDir = path.join(__dirname, '../public');
const srcDir = path.join(__dirname, '.');
let arguments = process.argv.splice(2);
const devUrl = "http://127.0.0.1:8080";
const prodUrl = "https://www.zxcoder.top";
// 平时启动默认为dev环境，如果从deploy脚本启动默认为开发环境
let rootUrl = devUrl;
if(arguments.length>0 && arguments[0]!==""){
    rootUrl=arguments[0];
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
        name: 'zxCoder',
        link: `${rootUrl}`,
    },
    {
        name: '首页',
        link: `${rootUrl}`,
    },
    {
        name: '分类',
        link: `${rootUrl}/${categoryUrl}`,
    },
    {
        name: '标签',
        link: `${rootUrl}/${tagUrl}`,
    },
    {
        name: '关于',
        link: `${rootUrl}/${aboutUrl}`,
    },
]
let search_bar = renderFromFile(`${layoutDir}/component/search-bar.html`, {
    searchPage: `${rootUrl}/${searchUrl}`,
});
let navbar_search = renderFromFile(`${layoutDir}/component/navbar.html`, {
    navbarItems,
}, {
    search_bar,
});
let navbar_no_search = renderFromFile(`${layoutDir}/component/navbar.html`, {
    navbarItems,
});
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
                // if(mat.permalink==='digital-dp-just-dfs'){
                //     console.log(o.content)
                //     console.log(md.render(o.content))
                // }
                // 渲染
                let detailComponent = renderFromFile(`${layoutDir}/detail.html`, {
                    title: obj.title,
                    date: obj.date,
                    category: obj.category,
                    tags: obj.tags,
                    content: md.render(o.content),
                    url: `${rootUrl}/${detailUrl}/${mat.permalink}`,
                });
                let detailPage = renderFromFile(`${layoutDir}/index.html`, {
                    title: mat.title + ' - zxCoder\'s blog',
                    year: moment().year(),
                }, {
                    navbar: navbar_search,
                    content: detailComponent
                });
                fs.mkdirSync(`${rootDir}/${detailDir}/${mat.permalink}`);
                fs.writeFileSync(`${rootDir}/${detailDir}/${mat.permalink}/index.html`, detailPage);
            })
        }
    );
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
 * 获取分页数据
 * @param page
 * @param size
 * @param array
 * @returns {*}
 */
let paging = (page, size, array) => {
    let offset = (page - 1) * size;
    return (offset + size >= array.length)
        ? array.slice(offset, array.length)
        : array.slice(offset, offset + size);
}
/**
 * 渲染分页页面
 * @param path 生成的页面放在{path}/page/下
 * @param url
 * @param sizePerPage 每页文章数量
 * @param data 分页数据
 * @param navbar_search navbar组件
 * @param home 是否是首页
 * @param name 分类/标签名
 */
let renderPages = (path, url, sizePerPage, data, navbar_search, home = false, name = '') => {
    const total = data.length;
    const pageNum = Math.ceil(total / sizePerPage);
    if (pageNum > 1) {
        fs.mkdirSync(`${path}/${pageDir}`);
    }
    for (let i = 1; i <= pageNum; i++) {
        // 必须显示第一页和最后一页，当前页以及当前页的前一页和后一页，其他省略号，感觉这个可以作为一道新生赛题目了
        let number = [];
        number.push({
            num: 'Prev',
            link: i > 1 ? (i - 1 === 1 ? `${url}` : `${url}/${pageUrl}/${i - 1}`) : 'javascript:void(0)',
            disabled: i > 1 ? '' : 'disabled',
        })
        if (pageNum <= 3) {
            for (let j = 1; j <= pageNum; j++) {
                number.push({
                    num: j,
                    class: i === j ? 'active' : '',
                    link: j === 1 ? `${url}` : `${url}/${pageDir}/${j}`,
                })
            }
        } else {
            number.push({
                num: 1,
                class: i === 1 ? 'active' : '',
                link: `${url}`,
            })
            if (i - 1 > 2) {
                // 需要在1和i之间输出...
                number.push({
                    num: '...',
                    link: 'javascript:void(0)',
                })
            }
            if (i - 1 > 1) {
                // 输出i-1
                number.push({
                    num: i - 1,
                    link: `${url}/${pageDir}/${i - 1}`,
                })
            }
            if (i - 1 > 0 && pageNum - i > 0) {
                // 输出i
                number.push({
                    num: i,
                    class: 'active',
                    link: i === 1 ? `${url}` : `${url}/${pageDir}/${i}`,
                })
            }
            if (pageNum - i > 1) {
                // 输出i+1
                number.push({
                    num: i + 1,
                    link: `${url}/${pageDir}/${i + 1}`,
                })
            }
            if (pageNum - i > 2) {
                // 需要在i和pageNum之间输出...
                number.push({
                    num: '...',
                    link: 'javascript:void(0)',
                })
            }
            number.push({
                num: pageNum,
                class: i === pageNum ? 'active' : '',
                link: `${url}/${pageDir}/${pageNum}`,
            })
        }
        number.push({
            num: 'Next',
            disabled: i < pageNum ? '' : 'disabled',
            link: i < pageNum ? (i + 1 === pageNum ? `${url}` : `${url}/${pageDir}/${i + 1}`) : 'javascript:void(0)',
        })
        let curPage = renderFromFile(`${layoutDir}/component/list.html`, {
            data: paging(i, sizePerPage, data),
            number,
        });
        let index = renderFromFile(`${layoutDir}/index.html`, {
            title: (home ? '' : name + ' - ') + 'zxCoder\'s blog',
            year: moment().year(),
            home: (i === 1 && home),
            rootUrl,
        }, {
            navbar: navbar_search,
            content: curPage,
        });
        // 没有page/1
        if (i === 1) {
            fs.writeFileSync(`${path}/index.html`, index);
        } else {
            fs.mkdirSync(`${path}/${pageDir}/${i}`);
            fs.writeFileSync(`${path}/${pageDir}/${i}/index.html`, index);
        }
    }
}
let obj = readAllData(postsDir);
let absData = obj.absData;
let catList = obj.catList;
let tagList = obj.tagList;
// 首页分页
const indexSizePerPage = 6;
const indexPageNum=Math.ceil(absData.length/indexSizePerPage);
renderPages(rootDir, rootUrl, indexSizePerPage, absData, navbar_search, true);
// 关于页
let aboutMe = [
    "一个不<del>喜欢</del>懂科研的准研究生，打过ACM，CF灰名水平，喜欢写代码",
    "不喜欢人工智能，是激进的<del>反AI者</del>弱人工智能支持者",
    "数学不太行，英文也不太行，语文更不行",
]
let aboutBlog = [
    "基于Mustache模板引擎，自己实现了一个极简的的静态网页生成器",
    "纯原生css/js打造，包括一个简单的站内搜索(目前是字符串暴力匹配)",
    "记录一些做题题解，技术总结，读书笔记，debug经历等等",
    "目前部署在Vercel(免费，省心，速度也还行)，AliDNS解析",
]
let aboutComponent = renderFromFile(`${layoutDir}/about.html`, {
    aboutMe,
    aboutBlog,
});
let aboutPage = renderFromFile(`${layoutDir}/index.html`, {
    title: '关于 - zxCoder\'s blog',
    year: moment().year(),
    rootUrl,
}, {
    navbar: navbar_search,
    content: aboutComponent,
});
fs.mkdirSync(`${rootDir}/${aboutDir}`);
fs.writeFileSync(`${rootDir}/${aboutDir}/index.html`, aboutPage);
// 分类首页
let categoryComponent = renderFromFile(`${layoutDir}/category.html`, {
    title: "分类",
    categoryList: catList,
});
let categoryPage = renderFromFile(`${layoutDir}/index.html`, {
    title: '分类 - zxCoder\'s blog',
    year: moment().year(),
    rootUrl,
}, {
    navbar: navbar_search,
    content: categoryComponent
});
fs.mkdirSync(`${rootDir}/${categoryDir}`);
fs.writeFileSync(`${rootDir}/${categoryDir}/index.html`, categoryPage);
// 分类列表页
const categorySizePerPage = 6;
for (let i = 0; i < catList.length; i++) {
    let cat = catList[i];
    let filteredData = absData.filter(value => {
        return value.category.name === cat.name;
    })
    fs.mkdirSync(`${rootDir}/${categoryDir}/${cat.name}`);
    renderPages(`${rootDir}/${categoryDir}/${cat.name}`,
        `${rootUrl}/${categoryUrl}/${cat.name}`,
        categorySizePerPage, filteredData, navbar_search, false, cat.name);
}
// 标签首页
let tagComponent = renderFromFile(`${layoutDir}/tag.html`, {
    title: "标签",
    tagList: tagList,
});
let tagPage = renderFromFile(`${layoutDir}/index.html`, {
    title: '标签 - zxCoder\'s blog',
    year: moment().year(),
}, {
    navbar: navbar_search,
    content: tagComponent
});
fs.mkdirSync(`${rootDir}/${tagDir}`);
fs.writeFileSync(`${rootDir}/${tagDir}/index.html`, tagPage);
// 标签列表页
const tagSizePerPage = 6;
for (let i = 0; i < tagList.length; i++) {
    let tag = tagList[i];
    let filteredData = absData.filter(value => {
        return value.tags.map(value1 => {
            return value1.name;
        }).indexOf(tag.name) !== -1;
    })
    fs.mkdirSync(`${rootDir}/${tagDir}/${tag.name}`);
    renderPages(`${rootDir}/${tagDir}/${tag.name}`,
        `${rootUrl}/${tagUrl}/${tag.name}`,
        tagSizePerPage, filteredData, navbar_search, false, tag.name);
}
// 搜索页
let searchComponent = renderFromFile(`${layoutDir}/search.html`, {
    rootUrl,
});
let searchPage = renderFromFile(`${layoutDir}/index.html`, {
    title: '搜索 - zxCoder\'s blog',
    year: moment().year(),
    search: rootUrl,
}, {
    navbar: navbar_no_search,
    content: searchComponent,
});
fs.mkdirSync(`${rootDir}/${searchDir}`);
fs.writeFileSync(`${rootDir}/${searchDir}/index.html`, searchPage);
// favicon.ico
fs.writeFileSync(`${rootDir}/favicon.ico`, fs.readFileSync(`${srcDir}/favicon.ico`));
// 生成url.txt文件
let fWrite = fs.createWriteStream(`${rootDir}/../urls.txt`);
// 首页
fWrite.write(`${rootUrl}`+'\n');
// 首页分页
for(let i=2;i<=indexPageNum;i++){
    fWrite.write(`${rootUrl}/page/${i}`+'\n');
}
// 分类页
fWrite.write(`${rootUrl}/category`+'\n');
// 分类列表页
for(let i=0;i<catList.length;i++){
    fWrite.write(`${catList[i].link}`+'\n');
    for(let j=2;j<=Math.ceil(catList[i].num/categorySizePerPage);j++){
        fWrite.write(`${catList[i].link}/page/${j}`+'\n');
    }
}
// 标签页
fWrite.write(`${rootUrl}/tags`+'\n');
// 标签列表首页
for(let i=0;i<tagList.length;i++){
    fWrite.write(`${tagList[i].link}`+'\n');
    for(let j=2;j<=Math.ceil(tagList[i].num/tagSizePerPage);j++){
        fWrite.write(`${tagList[i].link}/page/${j}`+'\n');
    }
}
// 详情页
for(let i=0;i<absData.length;i++){
    fWrite.write(`${absData[i].permalink}`+'\n');
}
fWrite.close();
console.timeEnd('jijian generate');

// TODO
// 1 navbar浏览器宽度小于某个值会消失
// 2 写文章时需要人肉确定标签是否存在(DP和dp)
// 3 样式修改
// 4 代码缩进问题
