# 一、创建Vue3.0工程

## 1.使用 vue-cli 创建

官方文档：<https://cli.vuejs.org/zh/guide/creating-a-project.html#vue-create>

```bash
## 查看@vue/cli版本，确保@vue/cli版本在4.5.0以上
vue --version
## 安装或者升级你的@vue/cli
npm install -g @vue/cli
## 创建
vue create vue_test
## 启动
cd vue_test
npm run serve
```

## 2.使用 vite 创建（推荐）

官方文档：<https://v3.cn.vuejs.org/guide/installation.html#vite>

vite官网：<https://vitejs.cn>

- 什么是vite？—— 新一代前端构建工具。
- 优势如下：
  - 开发环境中，无需打包操作，可快速的冷启动。
  - 轻量快速的热重载（HMR）。
  - 真正的按需编译，不再等待整个应用编译完成。
- 传统构建 与 vite构建对比图

<svg viewBox="0 0 1896 1071" fill="none" xmlns="http://www.w3.org/2000/svg">
<text fill="#FFAA3E" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #ffad45;" font-size="80" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="46" y="132.344">Bundle based dev server</tspan></text>
<rect x="48" y="239" width="1086" height="767" rx="98" stroke="#FFC36B" stroke-width="4" data-darkreader-inline-stroke="" style="--darkreader-inline-stroke: #ffc064;"></rect>
<rect x="108" y="577" width="212" height="83" rx="10" fill="#C3E88C" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #3f5411;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="170" y="631.488">entry</tspan></text>
<rect x="476" y="712" width="212" height="88" rx="10" fill="#4FC08D" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #338f70;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0.33em" data-darkreader-inline-fill=""><tspan x="552.5" y="768.988">···</tspan></text>
<rect x="476" y="438" width="212" height="88" rx="10" fill="#4FC08D" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #338f70;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="537" y="494.988">route</tspan></text>
<rect x="473" y="576" width="212" height="88" rx="10" fill="#4FC08D" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #338f70;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="534" y="632.988">route</tspan></text>
<path d="M472.614 481.699L438.815 489.291L462.289 514.766L472.614 481.699ZM324.582 622.18L454.791 502.201L450.726 497.789L320.516 617.768L324.582 622.18Z" fill="#E06666" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #861b1b;"></path>
<path d="M469 620L439 602.679V637.321L469 620ZM323 623H442V617H323V623Z" fill="#E06666" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #861b1b;"></path>
<path d="M472.614 756.105L462.032 723.12L438.757 748.777L472.614 756.105ZM320.533 622.196L450.601 740.186L454.632 735.742L324.565 617.752L320.533 622.196Z" fill="#E06666" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #861b1b;"></path>
<path d="M822.052 905.098L815.036 871.175L789.166 894.213L822.052 905.098ZM689.041 760.243L801.856 886.929L806.337 882.939L693.521 756.253L689.041 760.243Z" fill="#FFC36B" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #8c5300;"></path>
<path d="M819.908 756.105L811.894 722.403L786.715 746.195L819.908 756.105ZM689.1 622.034L799.185 738.54L803.546 734.419L693.462 617.914L689.1 622.034Z" fill="#FFC36B" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #8c5300;"></path>
<path d="M817.765 623.19L788.215 605.112L787.334 639.742L817.765 623.19ZM691.205 622.973L790.697 625.502L790.85 619.504L691.357 616.975L691.205 622.973Z" fill="#FFC36B" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #8c5300;"></path>
<path d="M818.837 481.699L789.286 463.622L788.406 498.252L818.837 481.699ZM692.277 481.483L791.769 484.012L791.922 478.014L692.429 475.485L692.277 481.483Z" fill="#FFC36B" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #8c5300;"></path>
<path d="M819.909 340.209L786.924 350.795L812.584 374.067L819.909 340.209ZM696.719 480.499L803.992 362.224L799.547 358.193L692.275 476.468L696.719 480.499Z" fill="#FFC36B" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #8c5300;"></path>
<path d="M817.765 614.614L810.467 580.751L784.789 604.002L817.765 614.614ZM692.273 480.497L797.418 596.614L801.866 592.587L696.721 476.47L692.273 480.497Z" fill="#FFC36B" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #8c5300;"></path>
<rect x="822" y="288" width="212" height="88" rx="10" fill="#4FC08D" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #338f70;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="864" y="344.988">module</tspan></text>
<rect x="822" y="435" width="212" height="87" rx="10" fill="#4FC08D" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #338f70;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="864" y="491.488">module</tspan></text>
<rect x="820" y="571" width="212" height="88" rx="10" fill="#4FC08D" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #338f70;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="862" y="627.988">module</tspan></text>
<rect x="822" y="718" width="212" height="87" rx="10" fill="#4FC08D" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #338f70;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="864" y="774.488">module</tspan></text>
<rect x="822" y="864" width="212" height="88" rx="10" fill="#4FC08D" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #338f70;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0.33em" data-darkreader-inline-fill=""><tspan x="898.5" y="920.988">···</tspan></text>
<path d="M1239 627L1209 609.679V644.321L1239 627ZM1136 630H1212V624H1136V630Z" fill="#FFC36B" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #8c5300;"></path>
<path d="M1596 627L1566 609.679V644.321L1596 627ZM1493 630H1569V624H1493V630Z" fill="#FFC36B" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #8c5300;"></path>
<rect x="1239" y="545" width="254" height="144" rx="10" fill="#C692EA" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #48156c;"></rect>
<text fill="white" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #e8e6e3;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="1306.5" y="629.988">Bundle</tspan></text>
<rect x="1596" y="543" width="254" height="143" rx="10" fill="#009688" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #00786d;"></rect>
<text fill="white" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #e8e6e3;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="1667.71" y="604.988">Server
</tspan><tspan x="1675.76" y="649.988">ready</tspan></text>
</svg>

<svg viewBox="0 0 1896 1071" fill="none" xmlns="http://www.w3.org/2000/svg">
<text fill="#FFAA3E" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #ffad45;" font-size="80" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="45" y="129.344">Native ESM based dev server</tspan></text>
<rect x="632" y="526" width="273" height="106" rx="10" fill="#C3E88C" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #3f5411;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="724.5" y="591.988">entry</tspan></text>
<rect x="1106" y="699" width="274" height="114" rx="10" fill="#666665" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #4c5356;"></rect>
<g filter="url(#filter0_d_5_61)">
<text fill="#CCCCCB" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #c7c3bb;" font-size="38" font-weight="600" letter-spacing="0.33em" data-darkreader-inline-fill=""><tspan x="1213.5" y="768.988">···</tspan></text>
</g>
<rect x="1106" y="346" width="274" height="113" rx="10" fill="#4FC08D" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #338f70;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="1198" y="415.488">route</tspan></text>
<rect x="1102" y="524" width="273" height="114" rx="10" fill="#666665" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #4c5356;"></rect>
<text fill="#CCCCCB" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #c7c3bb;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="1193.5" y="593.988">route</tspan></text>
<path d="M1101.79 402.463L1067.99 410.054L1091.46 435.529L1101.79 402.463ZM910.168 583.106L1083.96 422.965L1079.9 418.553L906.102 578.693L910.168 583.106Z" fill="#C892E9" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #4b166c;"></path>
<path d="M1097 581L1067 563.679V598.321L1097 581ZM908 584H1070V578H908V584Z" fill="#999899" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #52595c;"></path>
<path d="M1101.79 756.57L1091.2 723.584L1067.93 749.242L1101.79 756.57ZM906.119 583.121L1079.77 740.651L1083.8 736.207L910.151 578.677L906.119 583.121Z" fill="#999899" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #52595c;"></path>
<path d="M1552.72 948.839L1545.7 914.916L1519.83 937.953L1552.72 948.839ZM1381.73 761.331L1532.52 930.67L1537 926.68L1386.21 757.341L1381.73 761.331Z" fill="#999899" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #52595c;"></path>
<path d="M1549.95 756.569L1541.94 722.868L1516.76 746.659L1549.95 756.569ZM1381.79 582.96L1529.23 739.005L1533.59 734.884L1386.15 578.839L1381.79 582.96Z" fill="#999899" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #52595c;"></path>
<path d="M1547.19 585.049L1517.64 566.972L1516.76 601.602L1547.19 585.049ZM1383.89 583.898L1520.12 587.362L1520.27 581.364L1384.04 577.9L1383.89 583.898Z" fill="#999899" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #52595c;"></path>
<path d="M1548.57 402.463L1519.02 384.386L1518.14 419.015L1548.57 402.463ZM1385.27 401.312L1521.5 404.776L1521.66 398.778L1385.43 395.314L1385.27 401.312Z" fill="#C892E9" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #4b166c;"></path>
<path d="M631.489 585.049L601.583 567.567L601.396 602.207L631.489 585.049ZM375.576 586.666L604.473 587.903L604.506 581.903L375.608 580.666L375.576 586.666Z" fill="#C892E9" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #4b166c;"></path>
<path d="M1549.95 219.877L1516.97 230.462L1542.63 253.735L1549.95 219.877ZM1390.34 400.329L1534.04 241.892L1529.59 237.861L1385.89 396.298L1390.34 400.329Z" fill="#C892E9" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #4b166c;"></path>
<path d="M1547.19 573.983L1539.89 540.12L1514.21 563.372L1547.19 573.983ZM1385.89 400.327L1526.84 555.983L1531.29 551.956L1390.34 396.3L1385.89 400.327Z" fill="#C892E9" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #4b166c;"></path>
<rect x="1553" y="152" width="274" height="113" rx="10" fill="#4FC08D" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #338f70;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="1626" y="221.488">module</tspan></text>
<rect x="1553" y="341" width="274" height="114" rx="10" fill="#4FC08D" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #338f70;"></rect>
<text fill="#15505C" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #95d9e7;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="1621.5" y="411.818">module</tspan></text>
<rect x="1550" y="517" width="274" height="114" rx="10" fill="#666665" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #4c5356;"></rect>
<text fill="#CCCCCB" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #c7c3bb;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="1623" y="586.988">module</tspan></text>
<rect x="1553" y="707" width="274" height="113" rx="10" fill="#666665" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #4c5356;"></rect>
<text fill="#CCCCCB" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #c7c3bb;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="1626" y="776.488">module</tspan></text>
<rect x="1553" y="896" width="274" height="113" rx="10" fill="#666665" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #4c5356;"></rect>
<text fill="#CCCCCB" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #c7c3bb;" font-size="38" font-weight="600" letter-spacing="0.33em" data-darkreader-inline-fill=""><tspan x="1660.5" y="965.488">···</tspan></text>
<rect x="45" y="491" width="330" height="179" rx="10" fill="#029788" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #02796d;"></rect>
<text fill="white" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #e8e6e3;" font-size="38" font-weight="600" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="154.707" y="570.988">Server
</tspan><tspan x="162.76" y="615.988">ready</tspan></text>
<line x1="507.615" y1="459.201" x2="506.232" y2="569.859" stroke="#C892E9" stroke-width="4" stroke-dasharray="8 8" data-darkreader-inline-stroke="" style="--darkreader-inline-stroke: #521876;"></line>
<line x1="1038.78" y1="733.073" x2="1037.37" y2="883.845" stroke="#E06666" stroke-width="4" stroke-dasharray="8 8" data-darkreader-inline-stroke="" style="--darkreader-inline-stroke: #831a1a;"></line>
<text fill="#E06666" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #e16969;" font-size="38" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="918" y="938.988">Dynamic import
</tspan><tspan x="918" y="983.988">(code split point)</tspan></text>
<text fill="#C892E9" xml:space="preserve" style="white-space: pre; --darkreader-inline-fill: #c388e7;" font-size="38" letter-spacing="0em" data-darkreader-inline-fill=""><tspan x="399" y="431.488">HTTP request</tspan></text>
<defs>
<filter id="filter0_d_5_61" x="1212.15" y="752.766" width="60.9863" height="13.2324" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix>
<feOffset dy="4"></feOffset>
<feGaussianBlur stdDeviation="2"></feGaussianBlur>
<feComposite in2="hardAlpha" operator="out"></feComposite>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"></feColorMatrix>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5_61"></feBlend>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5_61" result="shape"></feBlend>
</filter>
</defs>
</svg>

确保你的当前工作目录正是打算创建项目的目录。在命令行中运行以下命令

```bash
bun create vue@latest
```

这一指令将会安装并执行 create-vue，它是 Vue 官方的项目脚手架工具。你将会看到一些诸如 TypeScript 和测试支持之类的可选功能提示：

```txt
Vue.js - The Progressive JavaScript Framework

√ 请输入项目名称： ... vue-test
√ 是否使用 TypeScript 语法？ ... 否 / 是
√ 是否启用 JSX 支持？ ... 否 / 是
√ 是否引入 Vue Router 进行单页面应用开发？ ... 否 / 是
√ 是否引入 Pinia 用于状态管理？ ... 否 / 是
√ 是否引入 Vitest 用于单元测试？ ... 否 / 是
√ 是否要引入一款端到端（End to End）测试工具？ » Playwright
√ 是否引入 ESLint 用于代码质量检测？ » 是，并同时引入 Oxlint 以加快检测（试验阶段）
√ 是否引入 Prettier 用于代码格式化？ ... 否 / 是

正在初始化项目 C:\Users\UserName\Projects\vue-test...

项目初始化完成，可执行以下命令：

  cd vue-test
  bun install
  bun format
  bun dev
```
