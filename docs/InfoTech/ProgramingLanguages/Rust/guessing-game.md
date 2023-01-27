# 猜数游戏

```rust
// 导入
use rand::Rng;
use std::cmp::Ordering;
use std::io;

fn main() {
    // println! 是宏
    println!("Guess the number!");
    // let 用来声明不可变变量
    let secret_number = rand::thread_rng().gen_range(1..=100);
    // 循环
    loop {
        println!("Please input your guess.");
        // let mut 用来声明可变变量
        let mut guess = String::new();
        // 读取控制台输入，read_line函数的返回值是Result
        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");
        // 冒号后面显式指明类型，parse函数是将字符串转为数字（返回值为Result）
        let guess: u32 = match guess.trim().parse() {
            // 转换成功，返回转换的值
            Ok(num) => num,
            // 转换失败
            Err(_) => continue,
        };

        println!("You guessed: {guess}");

        // 使用 match cmp Less Greater Equal 比较大小
        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win!");
                // 跳出loop循环
                break;
            }
        }
    }
}
```