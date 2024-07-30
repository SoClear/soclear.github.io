const s = `* 数学
  * 高等数学
    * 第1讲 函数极限与连续
      * [1.1 函数的概念和特性](数学/高等数学/1.%20函数极限与连续/1.1%20函数的概念与特性.md)
      * [1.2 函数的图像](数学/高等数学/1.%20函数极限与连续/1.2%20函数的图像.md)
      * [1.3 函数极限的概念与性质](数学/高等数学/1.%20函数极限与连续/1.3%20函数极限的概念与性质.md)
      * [1.4 计算](数学/高等数学/1.%20函数极限与连续/1.4%20计算.md)
      * [1.5 函数的连续与间断](数学/高等数学/1.%20函数极限与连续/1.5%20函数的连续与间断.md)
    * [必背1](数学/高等数学/必背1.md)
* 408
  * 数据结构
    * 第1章 绪论
      * [1. 绪论](./408/数据结构/1.%20绪论/1.%20绪论.md)
      * [1.1 数据结构的基本概念](408/数据结构/1.%20绪论/1.1%20数据结构的基本概念.md)`

const s2 = `* Jetpack
  * [Jetpack 简介](InfoTech/Android/Jetpack/Jetpack.md)
  * Jetpack Compose
    * [官网教程代码](InfoTech/Android/Jetpack/Compose/official_tutorial.md)
    * [编程思想](InfoTech/Android/Jetpack/Compose/mental_model.md)
  * Dagger-Hilt
    * [控制反转和依赖注入](InfoTech/Android/Jetpack/Dagger-Hilt/ioc_di.md)
    * [Dagger子组件](InfoTech/Android/Jetpack/Dagger-Hilt/subcomponents.md)`
/**
 * 分割输入的字符串并提取空白部分和标题。
 * 
 * 此函数接受一个字符串作为输入，该字符串由一个星号分隔成两部分。
 * 第一部分是空白部分，第二部分是标题。函数的目的是将输入字符串分割成这两部分，
 * 并对标题部分进行trim操作，以去除前导和尾随的空格。
 * 
 * @param {string} line - 输入的字符串，星号分隔的空白部分和标题。
 * @returns {Array} - 返回一个包含两个元素的数组：第一个元素是空白部分，第二个元素是trim后的标题。
 */
function blanksAndTitle(line) {
    // 使用split方法将输入字符串按星号分割成两部分。
    const [blanks, title] = line.split('*')
    // 对标题部分使用trim方法去除前导和尾随的空格，然后将结果作为数组返回。
    return [blanks, title.trim()]
}


/**
 * 根据标题的格式转换标题。
 * 
 * 该函数用于处理Markdown格式的标题，根据标题是否包含链接，将其转换为特定的JSON格式。
 * 如果标题以方括号开始，表示包含链接，则函数会将标题分割为文本和链接两部分，并返回一个包含文本和链接的JSON对象。
 * 如果标题不包含链接，函数会返回一个表示折叠状态的JSON对象，其中包含标题文本和一个空的items数组，表示该标题下可能有子项。
 * 
 * @param {string} title - 待转换的标题字符串。
 * @returns {string} - 转换后的JSON格式字符串。
 */
function convertLine(title) {
    // 检查标题是否以方括号开始，即是否包含链接
    if (title.startsWith('[')) {
        // 使用"]("作为分隔符将标题分割为文本和链接两部分
        const [text, link] = title.split('](')
        // 返回一个包含文本和链接的JSON对象，注意要处理掉多余的方括号和括号
        // return `{ text: '${text.slice(1)}', link: '${link.slice(0, -1)}'},`
        return `{"text":"${text.slice(1)}","link":"${link.slice(0, -1)}"},`
    } else {
        // 返回一个表示折叠状态的JSON对象，其中包含标题文本和一个空的items数组
        // return `{ text: '${title}', collapsed: true, items: [``
        return `{"text":"${title}","collapsed":true,"items":[`
    }
}


/**
 * 将给定的文本行转换为特定的JSON格式。
 * 此函数主要用于处理多行文本，其中每行可能以不同数量的空格开头，然后是标题。
 * 它的目的是将这种格式的文本转换为一个JSON数组，每个数组元素对应一行文本，空格用缩进表示。
 * 
 * @param lines 一个包含多行文本的数组，每行文本以空格开头，后跟标题。
 * @return 转换后的JSON字符串，表示原始文本的缩进结构。
 */
function convert(lines) {
    // 初始化结果字符串为一个空的JSON数组。
    let result = '[' + convertLine(blanksAndTitle(lines[0])[1])
    // 初始化一个变量来跟踪上一行的空格数量。
    let priorBlanks = ''
    // 遍历除第一行之外的所有行。
    for (let i = 1; i < lines.length; i++) {
        // 分离当前行的空格和标题。
        const [blanks, title] = blanksAndTitle(lines[i])

        // 如果当前行的空格少于上一行，需要在结果中添加额外的']}'来匹配缩进。
        if (blanks.length < priorBlanks.length) {
            // 计算需要添加的']}'的数量，并将其添加到结果中。
            const backNumber = (priorBlanks.length - blanks.length) / 2
            result += ']},'.repeat(backNumber)
        }
        // 更新上一行的空格数量。
        priorBlanks = blanks

        // 将当前行的标题转换为JSON格式，并添加到结果中。
        result += convertLine(title)
    }
    // 根据最后一行的空格数量，添加相应的']}'来结束JSON数组。
    result += ']}'.repeat(priorBlanks.length / 2) + ']'
    // 返回最终转换后的JSON字符串。
    return result
}


/**
 * 将Markdown格式的字符串转换为JSON格式。
 * 
 * 该函数首先对输入的Markdown字符串进行处理，分割成单独的行，然后调用convert函数进行转换，
 * 最后通过替换掉多余的逗号来修正JSON格式，确保其正确性。
 * 
 * @param {string} markdown - 输入的Markdown格式字符串。
 * @returns {string} - 转换后的JSON格式字符串。
 */
function markdownToJson(markdown) {
    // 去除markdown字符串两端的空格并分割成行数组
    const lines = markdown.trim().split('\n')
    // 调用convert函数处理行数组，并替换掉可能存在的多余逗号
    return convert(lines).replaceAll(',]', ']')
}

const file = Bun.file('D:/IdeaProjects/soclear.github.io-vitepress/docs/_sidebar.md')
const r = await file.text()
await Bun.write('D:/IdeaProjects/js/o.txt',`{"sidebar": ${markdownToJson(r)}}`)

const o = Bun.file('D:/IdeaProjects/js/o.txt')
const jp = JSON.parse(await o.text())
const js = JSON.stringify(jp, null, 4)
await Bun.write('D:/IdeaProjects/js/o.json', js)
