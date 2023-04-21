# Playwright

## 方便的扩展函数

```kotlin
fun Page.queryAll(selector: String): List<ElementHandle> {
    waitForSelector(selector)
    return querySelectorAll(selector)
}

fun <T> operate(
    launchOptions: LaunchOptions = LaunchOptions(),
    browserContextOptions: BrowserContext.() -> Unit = {
        route("**/*") { route: Route ->
            // 不获取图片 和 外部的css
            if (route.request().resourceType() in listOf("image", "stylesheet")) {
                route.abort()
            } else {
                route.resume()
            }
        }
    },
    instructions: Page.() -> T
): T = Playwright.create().use {
    it.chromium().launch(launchOptions).newContext().apply { browserContextOptions() }.newPage().run(instructions)
}
```

## 使用示例

```kotlin
fun recentlySentEmails(): List<String> {
    return operate {
        navigate("https://mail.xxx.com/")
        type("#uid", "abc@xxx.com")
        type("#password", "yourPassword")
        click(".submit")
        click("#mltree_4_span > .cnt")
        queryAll(".subject").map { it.innerText() }
    }
}
```
