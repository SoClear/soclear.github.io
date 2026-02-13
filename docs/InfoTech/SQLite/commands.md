# 命令

本章将向您讲解 SQLite 编程人员所使用的简单却有用的命令。这些命令被称为 SQLite 的点命令，这些命令的不同之处在于它们不以分号 ; 结束。

让我们在命令提示符下键入一个简单的 **sqlite3** 命令，在 SQLite 命令提示符下，您可以使用各种 SQLite 命令。

```bash
$ sqlite3
SQLite version 3.51.2 2026-01-09 17:27:48
Enter ".help" for usage hints.
sqlite>
```

## 命令列表

**如需** 获取可用的点命令的清单，可以在任何时候输入 ".help"。例如：

```bash
sqlite>.help
```

上面的命令会显示各种重要的 SQLite 点命令的列表，如下所示：

| 命令                      | 描述                                               |
|---------------------------|----------------------------------------------------|
| .archive ...              | Manage SQL archives                                |
| .auth ON\|OFF             | Show authorizer callbacks                          |
| .backup ?DB? FILE         | Backup DB (default "main") to FILE                 |
| .bail on\|off             | Stop after hitting an error.  Default OFF          |
| .cd DIRECTORY             | Change the working directory to DIRECTORY          |
| .changes on\|off          | Show number of rows changed by SQL                 |
| .check GLOB               | Fail if output since .testcase does not match      |
| .clone NEWDB              | Clone data into NEWDB from the existing database   |
| .connection [close] [#]   | Open or close an auxiliary database connection     |
| .crlf ?on\|off?           | Whether or not to use \r\n line endings            |
| .databases                | List names and files of attached databases         |
| .dbconfig ?op? ?val?      | List or change sqlite3_db_config() options         |
| .dbinfo ?DB?              | Show status information about the database         |
| .dbtotxt                  | Hex dump of the database file                      |
| .dump ?OBJECTS?           | Render database content as SQL                     |
| .echo on\|off             | Turn command echo on or off                        |
| .eqp on\|off\|full\|...   | Enable or disable automatic EXPLAIN QUERY PLAN     |
| .excel                    | Display the output of next command in spreadsheet  |
| .exit ?CODE?              | Exit this program with return-code CODE            |
| .expert                   | EXPERIMENTAL. Suggest indexes for queries          |
| .explain ?on\|off\|auto?  | Change the EXPLAIN formatting mode.  Default: auto |
| .filectrl CMD ...         | Run various sqlite3_file_control() operations      |
| .fullschema ?--indent?    | Show schema and the content of sqlite_stat tables  |
| .headers on\|off          | Turn display of headers on or off                  |
| .help ?-all? ?PATTERN?    | Show help text for PATTERN                         |
| .import FILE TABLE        | Import data from FILE into TABLE                   |
| .imposter INDEX TABLE     | Create imposter table TABLE on index INDEX         |
| .indexes ?TABLE?          | Show names of indexes                              |
| .intck ?STEPS_PER_UNLOCK? | Run an incremental integrity check on the db       |
| .limit ?LIMIT? ?VAL?      | Display or change the value of an SQLITE_LIMIT     |
| .lint OPTIONS             | Report potential schema issues.                    |
| .load FILE ?ENTRY?        | Load an extension library                          |
| .log FILE\|on\|off        | Turn logging on or off.  FILE can be stderr/stdout |
| .mode ?MODE? ?OPTIONS?    | Set output mode                                    |
| .nonce STRING             | Suspend safe mode for one command if nonce matches |
| .nullvalue STRING         | Use STRING in place of NULL values                 |
| .once ?OPTIONS? ?FILE?    | Output for the next SQL command only to FILE       |
| .open ?OPTIONS? ?FILE?    | Close existing database and reopen FILE            |
| .output ?FILE?            | Send output to FILE or stdout if FILE is omitted   |
| .parameter CMD ...        | Manage SQL parameter bindings                      |
| .print STRING...          | Print literal STRING                               |
| .progress N               | Invoke progress handler after every N opcodes      |
| .prompt MAIN CONTINUE     | Replace the standard prompts                       |
| .quit                     | Stop interpreting input stream, exit if primary.   |
| .read FILE                | Read input from FILE or command output             |
| .recover                  | Recover as much data as possible from corrupt db.  |
| .restore ?DB? FILE        | Restore content of DB (default "main") from FILE   |
| .save ?OPTIONS? FILE      | Write database to FILE (an alias for .backup ...)  |
| .scanstats on\|off\|est   | Turn sqlite3_stmt_scanstatus() metrics on or off   |
| .schema ?PATTERN?         | Show the CREATE statements matching PATTERN        |
| .separator COL ?ROW?      | Change the column and row separators               |
| .sha3sum ...              | Compute a SHA3 hash of database content            |
| .shell CMD ARGS...        | Run CMD ARGS... in a system shell                  |
| .show                     | Show the current values for various settings       |
| .stats ?ARG?              | Show stats or turn stats on or off                 |
| .system CMD ARGS...       | Run CMD ARGS... in a system shell                  |
| .tables ?TABLE?           | List names of tables matching LIKE pattern TABLE   |
| .timeout MS               | Try opening locked tables for MS milliseconds      |
| .timer on\|off            | Turn SQL timer on or off                           |
| .trace ?OPTIONS?          | Output each SQL statement as it is run             |
| .version                  | Show source, library and compiler versions         |
| .vfsinfo ?AUX?            | Information about the top-level VFS                |
| .vfslist                  | List all available VFSes                           |
| .vfsname ?AUX?            | Print the name of the VFS stack                    |
| .width NUM1 NUM2 ...      | Set minimum column widths for columnar output      |
| .www                      | Display output of the next command in web browser  |

让我们尝试使用 **.show** 命令，来查看 SQLite 命令提示符的默认设置。

```text
sqlite> .show
        echo: off
         eqp: off
     explain: auto
     headers: off
        mode: list
   nullvalue: ""
      output: stdout
colseparator: "|"
rowseparator: "\n"
       stats: off
       width:
    filename: :memory:
sqlite>
```

> 确保 sqlite> 提示符与点命令之间没有空格，否则将无法正常工作。

## 查看所有支持的 .mode（输出格式）

```text
sqlite> .help mode
.mode ?MODE? ?OPTIONS?   Set output mode
   MODE is one of:
     ascii       Columns/rows delimited by 0x1F and 0x1E
     box         Tables using unicode box-drawing characters
     csv         Comma-separated values
     column      Output in columns.  (See .width)
     html        HTML <table> code
     insert      SQL insert statements for TABLE
     json        Results in a JSON array
     line        One value per line
     list        Values delimited by "|"
     markdown    Markdown table format
     qbox        Shorthand for "box --wrap 60 --quote"
     quote       Escape answers as for SQL
     table       ASCII-art table
     tabs        Tab-separated values
     tcl         TCL list elements
   OPTIONS: (for columnar modes or insert mode):
     --escape T     ctrl-char escape; T is one of: symbol, ascii, off
     --wrap N       Wrap output lines to no longer than N characters
     --wordwrap B   Wrap or not at word boundaries per B (on/off)
     --ww           Shorthand for "--wordwrap 1"
     --quote        Quote output text as SQL literals
     --noquote      Do not quote output text
     TABLE          The name of SQL table used for "insert" mode
sqlite>
```

## 格式化输出

您可以使用下列的点命令来格式化输出为本教程下面所列出的格式：

```bash
sqlite>.header on
sqlite>.mode box
sqlite>.timer on
```

上面设置将产生如下格式的输出：

```text
┌────┬──────┬───────┐
│ id │ name │ score │
├────┼──────┼───────┤
│ 1  │ 张三 │ 30    │
│ 2  │ 李四 │ 40    │
│ 3  │ 王五 │ 50    │
│ 4  │ 赵六 │ 60    │
└────┴──────┴───────┘
```

## sqlite_master 表格

主表中保存数据库表的关键信息，并把它命名为 **sqlite\_master**。如要查看表概要，可按如下操作：

```sql
sqlite>.schema sqlite_master
```

这将产生如下结果：

```sql
CREATE TABLE sqlite_master (
  type text,
  name text,
  tbl_name text,
  rootpage integer,
  sql text
);
```
