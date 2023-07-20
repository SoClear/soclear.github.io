# Playwright

## 方便的扩展函数

```kotlin
fun Page.queryAll(selector: String): List<ElementHandle> {
    return try {
        waitForSelector(selector)
        querySelectorAll(selector)
    } catch (e: PlaywrightException) {
        emptyList()
    }
}

private val defaultBrowserContextOptions: BrowserContext.() -> Unit = {
    route("**/*") { route: Route ->
        // 不获取图片、外部的字体和css
        if (route.request().resourceType() in listOf("image", "font", "stylesheet")) {
            route.abort()
        } else {
            route.resume()
        }
    }
}

fun <T> operate(
    launchOptions: BrowserType.LaunchOptions = BrowserType.LaunchOptions(),
    browserContextOptions: BrowserContext.() -> Unit = defaultBrowserContextOptions,
    instructions: Page.() -> T
): T = Playwright.create().use {
    it.chromium().launch(launchOptions).newContext().apply { browserContextOptions() }.newPage().run(instructions)
}

fun <T> operate(
    userDataDir: Path,
    launchPersistentContextOptions: BrowserType.LaunchPersistentContextOptions = BrowserType.LaunchPersistentContextOptions(),
    browserContextOptions: BrowserContext.() -> Unit = defaultBrowserContextOptions,
    instructions: Page.() -> T
): T = Playwright.create().use {
    it.chromium().launchPersistentContext(userDataDir, launchPersistentContextOptions).apply {
        browserContextOptions()
    }.newPage().run(instructions)
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
