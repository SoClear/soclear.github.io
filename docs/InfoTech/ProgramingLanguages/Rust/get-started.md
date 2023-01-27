# 入门

## 安装

Linux/macOS/WSL：  
`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

## 更新Rust

`rustup update`

## 包管理器 Cargo

* `cargo build` 可以构建项目
* `cargo run` 可以运行项目
* `cargo test` 可以测试项目
* `cargo doc` 可以为项目构建文档
* `cargo publish` 可以将库发布到 crates.io。
* `cargo --version` 可以查看cargo版本

## 创建新项目

我们将在新的 Rust 开发环境中编写一个小应用。首先用 Cargo 创建一个新项目。在您的终端中执行：

`cargo new hello-rust`

这会生成一个名为 `hello-rust` 的新目录，其中包含以下文件：

```text
hello-rust
|- Cargo.toml
|- src
  |- main.rs
```

`Cargo.toml` 为 Rust 的清单文件。其中包含了项目的元数据和依赖库。

`src/main.rs` 为编写应用代码的地方。

___

`cargo new` 会生成一个新的“Hello, world!”项目！我们可以进入新创建的目录中，执行下面的命令来运行此程序：

`cargo run`

您应该会在终端中看到如下内容：

```bash
$ cargo run
   Compiling hello-rust v0.1.0 (/Users/ag_dubs/rust/hello-rust)
    Finished dev [unoptimized + debuginfo] target(s) in 1.34s
     Running `target/debug/hello-rust`
Hello, world!
```

## 添加依赖

现在我们来为应用添加依赖。您可以在 [crates.io](https://crates.io)，即 Rust 包的仓库中找到所有类别的库。在 Rust 中，我们通常把包称作“crates”。

在本项目中，我们使用了名为 [`ferris-says`](https://crates.io/crates/ferris-says) 的库。

我们在 `Cargo.toml` 文件中添加以下信息（从 crate 页面上获取）：

```text
[dependencies]
ferris-says = "0.2"
```

接着运行：

`cargo build`

…之后 Cargo 就会安装该依赖。

运行此命令会创建一个新文件 `Cargo.lock`，该文件记录了本地所用依赖库的精确版本。

要使用该依赖库，我们可以打开 `main.rs`，删除其中所有的内容（它不过是个示例而已），然后在其中添加下面这行代码：

```rust
use ferris_says::say;
```

这样我们就可以使用 `ferris-says` crate 中导出的 `say` 函数了。

## 一个 Rust 小应用

现在我们用新的依赖库编写一个小应用。在 `main.rs` 中添加以下代码：

```rust
use ferris_says::say; // from the previous step
use std::io::{stdout, BufWriter};

fn main() {
    let stdout = stdout();
    let message = String::from("Hello fellow Rustaceans!");
    let width = message.chars().count();

    let mut writer = BufWriter::new(stdout.lock());
    say(message.as_bytes(), width, &mut writer).unwrap();
}
    
```

保存完毕后，我们可以输入以下命令来运行此应用：

`cargo run`

如果一切正确，您会看到该应用将以下内容打印到了屏幕上：

```text
----------------------------
< Hello fellow Rustaceans! >
----------------------------
              \
               \
                 _~^~^~_
             \) /  o o  \ (/
               '_   -   _'
               / '-----' \
    
```
