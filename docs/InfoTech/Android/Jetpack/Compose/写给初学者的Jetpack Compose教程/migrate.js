// 提取图片链接
function extractImageLinks(markdownContent) {
    // 匹配 Markdown 图片语法: ![alt](url) 或 <img src="url">
    const markdownImageRegex = /!\[.*?\]\((.*?)\)|<img.*?src=['"](.*?)['"]/g;
    const links = [];
    let match;

    while ((match = markdownImageRegex.exec(markdownContent)) !== null) {
        // match[1] 是 ![alt](url) 格式的链接
        // match[2] 是 <img src="url"> 格式的链接
        const link = match[1] || match[2];
        if (link && !links.includes(link)) {
            links.push(link);
        }
    }

    return links;
}

// 获取标题
function getTitle(markdownContent) {
    return markdownContent.split('\n')[0].replace('# ', '').trim()
}

// 返回下载图片的 Promise 数组
function getDonwnloadPromises(markdownContent, dir = getTitle(markdownContent)) {
    // 图片链接去掉 #pic_center 后缀
    const formatedLinks = extractImageLinks(md).map((e) => e.replace('#pic_center', ''))
    return formatedLinks.map(async (link) => {
        const response = await fetch(link)
        const path  = `${dir}/${link.split('/').pop()}`
        await Bun.write(path, response)
    })
}

// 替换 markdown 中图片链接为本地路径
function replaceImageUrls(markdownContent) {
    // 匹配markdown图片语法，捕获整个图片标记和URL
    const imagePattern = /!\[(.*?)\]\((https?:\/\/[^)]+)\)/g;

    // 替换函数
    return markdownContent.replace(imagePattern, (match, altText, url) => {
        // 提取文件名（URL的最后一部分）
        const fileName = url.split('/').pop().split('#')[0]; // 移除#后的部分
        // 返回替换后的格式
        return `![${altText}](${fileName})`;
    });
}

function getSaveMarkdownPromise(markdownContent, dir = getTitle(markdownContent)) {
    return Bun.write(`${dir}/index.md`, replaceImageUrls(markdownContent))
}


const md = await Bun.file("tmp.md").text()
const title = md.split('\n')[0].replace('# ', '').trim()

// 创建 title 文件夹
import { mkdir } from "node:fs/promises";
await mkdir(title);

await Promise.all(getDonwnloadPromises(md, title).concat(getSaveMarkdownPromise(md, title)))
