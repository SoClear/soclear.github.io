# 介绍

SQLite 官网：[https://sqlite.org/](https://sqlite.org/)

SQLite 是一个 C 语言库，它实现了一个[小型](https://sqlite.org/footprint.html)、[快速](https://sqlite.org/fasterthanfs.html)、[自包含](https://sqlite.org/selfcontained.html)、[高可靠](https://sqlite.org/hirely.html)、[全功能](https://sqlite.org/fullsql.html)的 SQL 数据库引擎。SQLite 是世界上[使用最广泛](https://sqlite.org/mostdeployed.html)的数据库引擎。它内置于所有手机和大多数电脑中，并捆绑在人们每天使用的无数其他应用程序中。[更多信息...](https://sqlite.org/about.html)

SQLite [源码](https://sqlite.org/src) 属于[公有领域](https://sqlite.org/copyright.html)，任何人都可以出于任何目的免费（free，也指自由）使用。

SQLite 是一个 **进程内（in-process）** 库，它实现了一个[自包含](https://sqlite.org/about.htmlselfcontained.html)、[无服务器](https://sqlite.org/about.htmlserverless.html)、[零配置](https://sqlite.org/about.htmlzeroconf.html)、[事务性](https://sqlite.org/about.htmltransactional.html)的 SQL 数据库引擎。SQLite 的代码属于[公有领域](https://sqlite.org/about.htmlcopyright.html)，因此可以出于任何目的（无论是商业还是私人用途）免费使用。SQLite 是世界上[部署最广泛](https://sqlite.org/about.htmlmostdeployed.html)的数据库，其应用案例多到难以计数，其中包含数个[知名项目](https://sqlite.org/about.htmlfamous.html)。

SQLite 是一个嵌入式 SQL 数据库引擎。与大多数其他 SQL 数据库不同，SQLite 没有独立的服务器进程。SQLite 直接读写普通的磁盘文件。一个包含多个表、索引、触发器和视图的完整 SQL 数据库都包含在单个磁盘文件中。该数据库[文件格式](https://sqlite.org/fileformat2.html)是跨平台的——你可以自由地在 32 位和 64 位系统之间，或在[大端序 (big-endian)](http://en.wikipedia.org/wiki/Endianness) 和 [小端序 (little-endian)](http://en.wikipedia.org/wiki/Endianness) 架构之间复制数据库。这些特性使 SQLite 成为[应用程序文件格式](https://sqlite.org/appfileformat.html)的流行选择。SQLite 数据库文件还是美国国会图书馆[推荐的存储格式](https://sqlite.org/locrsf.html)。不要把 SQLite 看作 [Oracle](http://www.oracle.com/database/index.html) 的替代品，而应将其看作 [fopen()](http://man.he.net/man3/fopen) 的替代品。

SQLite 是一个紧凑的库。根据目标平台和编译器优化设置的不同，在启用所有功能的情况下，[库的大小](https://sqlite.org/footprint.html)可以小于 900KiB。（64 位代码会更大。此外，某些编译器优化（如激进的函数内联和循环展开）会导致目标代码体积显著增大。）在内存使用和速度之间存在权衡。通常情况下，你分配给 SQLite 的内存越多，它的运行速度就越快。尽管如此，即使在低内存环境中，其性能通常也非常出色。根据使用方式的不同，SQLite 甚至可以比[直接的文件系统 I/O 更快](https://sqlite.org/fasterthanfs.html)。

SQLite 在每次发布前都经过[极其严格的测试](https://sqlite.org/testing.html)，并以高可靠性著称。SQLite 的大部分源代码纯粹用于测试和验证。一个自动化测试套件会运行数千万个测试用例，涉及数亿条独立的 SQL 语句，并实现了 [100% 的分支测试覆盖率](https://sqlite.org/testing.html#coverage)。SQLite 能够优雅地处理内存分配失败和磁盘 I/O 错误。即使因系统崩溃或电源故障而中断，事务也符合 [ACID](http://en.wikipedia.org/wiki/ACID) 特性。所有这些都通过使用模拟系统故障的特殊测试装置由自动化测试进行验证。当然，即使经过了所有这些测试，仍然会存在漏洞。但与某些类似项目（尤其是商业竞争对手）不同，SQLite 对所有漏洞都保持公开透明，并提供[漏洞列表](https://sqlite.org/src/rptview?rn=1)和代码更改的实时[编年史](https://sqlite.org/src/timeline)。

SQLite 代码库由一个全职开发 SQLite 的[国际团队](https://sqlite.org/crew.html)提供支持。开发人员在不断扩展 SQLite 功能、提高其可靠性和性能的同时，保持与[已发布的接口规范](https://sqlite.org/c3ref/intro.html)、[SQL 语法](https://sqlite.org/lang.html)以及数据库[文件格式](https://sqlite.org/fileformat2.html)的向后兼容性。源代码对任何需要的人都是完全免费的，但也提供[专业支持](https://sqlite.org/prosupport.html)。

SQLite 项目启动于 [2000-05-09](https://sqlite.org/src/timeline?c=2000-05-29+14:26:00)。未来总是难以预测，但开发者的目标是支持 SQLite 直到 2050 年。所有的设计决策都是以此目标为出发点。

我们（开发者）希望您发现 SQLite 的用处，并恳请您善用它：去创造优秀且精美的产品，使其快速、可靠且易于使用。愿您宽恕他人，一如您获得他人的宽恕。正如您免费获得 SQLite 一样，也请慷慨施予，将这份恩惠传递下去。
