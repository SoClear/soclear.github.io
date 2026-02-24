# Frida

Dynamic instrumentation toolkit for developers, reverse-engineers, and security researchers. Learn more at [frida.re](https://frida.re/).

必看 [Frida 17 重大更新](https://frida.re/news/2025/05/17/frida-17-0-0-released/)

## 1. 安装

### 1.1 安装 uv

[uv](https://github.com/astral-sh/uv) is An extremely fast Python package and project manager, written in Rust.

Install uv with our standalone installers:

```shell
# On macOS and Linux.
curl -LsSf https://astral.sh/uv/install.sh | sh
```

```shell
# On Windows.
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 1.2 安装 frida-tools

```bash
uv init example
cd example
uv pip install frida-tools
```

### 1.3 设置环境变量（可选）

设置环境变量后可直接使用 frida 命令，不用要每次都输入绝对路径。

将 `example\Scripts` 添加到环境变量中即可。

### 1.4 安装 frida-server

> 前提：安卓手机/模拟器 有 root 权限！！！
>
> 强烈建议使用真机，因为用模拟器会有很多bug

打开 [https://github.com/frida/frida/releases/latest](https://github.com/frida/frida/releases/latest)

搜索 `frida-server-`

例如，17.3.2 版本有如下文件：

```txt
frida-server-17.3.2-android-arm.xz
frida-server-17.3.2-android-arm64.xz
frida-server-17.3.2-android-x86.xz
frida-server-17.3.2-android-x86_64.xz
```

下载被控设备 CPU 架构对应文件。

例如，手机是 arm64，下载 `frida-server-17.3.2-android-arm64.xz` 文件。

解压文件，得到 `frida-server-17.3.2-android-arm64`

将 `frida-server-17.3.2-android-arm64` 移动到被控设备的 `/data/local/tmp` 目录下：`adb push frida-server-17.3.2-android-arm64 /data/local/tmp`

添加执行权限：`adb shell chmod 755 /data/local/tmp/frida-server-17.3.2-android-arm64`

### 1.5 验证是否安装成功

#### 1.5.1 启动 frida-server

```bash
adb shell
su
cd /data/local/tmp
./frida-server-17.3.2-android-arm64
```

#### 1.5.2 查看当前手机/模拟器运行的进程

打开一个新的终端窗口

```bash
cd example/Scripts
./frida-ps -U
```

如果显示进程列表，则说明安装成功

## 2. 配置 js/ts 开发环境

### 2.1 安装 js 运行环境

[Node.js](https://nodejs.org/) / [Bun](https://bun.sh/) / [Deno](https://deno.com/)

### 2.2 创建项目

以使用 Bun 创建 ts 项目 frida-ts 为例

```bash
bun init -y frida-ts
cd frida-ts
bun add -d @types/frida-gum frida-java-bridge
```

配置 package.json 的 scripts

```json
{
  "name": "frida-ts",
  "module": "index.ts",
  "private": true,
  "scripts": {
    "build": "bun build ./index.ts --outfile ./dist/agent.js",
    "watch": "bun build ./index.ts --outfile ./dist/agent.js --watch",
    "attach": "../frida/Scripts/frida.exe -U -f com.microsoft.emmx -l ./dist/agent.js"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/frida-gum": "^19.0.1",
    "frida-java-bridge": "^7.0.8"
  },
  "peerDependencies": {
    "typescript": "^5.9.3"
  },
  "dependencies": {}
}
```

- build 命令会编译 index.ts 文件，生成 dist/agent.js 文件
- watch 命令会监听 index.ts 文件，保存时自动编译
- attach 命令会启动 frida-server，附加到被控设备的进程，并加载 dist/agent.js 文件

附：il2cpp dump

```json
{
  "name": "frida-js",
  "module": "index.ts",
  "private": true,
  "scripts": {
    "adb": "adb shell 'su -c /data/local/tmp/frida-server'",
    "build": "bun build ./ZombieHunter.ts --outfile ./dist/agent.js",
    "watch": "bun build ./ZombieHunter.ts --outfile ./dist/agent.js --watch",
    "attach": "../example/Scripts/frida.exe -U -f zombie.survival.dead.shooting -l ./dist/agent.js",
    "dev": "bun dev.ts",
    "dump": "../example/Scripts/activate && python node_modules/frida-il2cpp-bridge/cli/main.py -U -f zombie.survival.dead.shooting dump --out-dir dumps"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/frida-gum": "^19.0.1",
    "frida-java-bridge": "^7.0.8"
  },
  "peerDependencies": {
    "typescript": "^5.9.3"
  },
  "dependencies": {
    "frida-il2cpp-bridge": "^0.12.1"
  }
}
```

### 2.3 编写 js/ts 代码

index.ts:

```ts
import Java from 'frida-java-bridge'

Java.perform(() => {
    const Activity = Java.use('android.app.Activity');
    Activity.onResume.implementation = function () {
        console.log('onResume() got called!');
        this.onResume()
    }
})
```

### 2.4 运行代码

1. 启动 frida-server

    新建终端窗口：

    ```bash
    adb shell
    su
    cd /data/local/tmp
    ./frida-server-17.3.2-android-arm64
    ```

2. 保存时自动编译

    再新建终端窗口：

    ```bash
    cd frida-ts
    bun watch
    ```

3. 附加到进程

    又新建终端窗口：

    ```bash
    cd frida-ts
    bun attach
    ```

这个时候，启动被控设备上的该应用，就会在控制台打印 `onResume() got called!`

每次修改代码后，保存一下就会自动编译，并加载到被控设备上

## 3. 示例

### 3.1 ZombieHunter.ts

```ts
import "frida-il2cpp-bridge"

function main() {
    console.log("[-] Starting Field Hook...");

    const ActiveGun = Il2Cpp.domain.assembly("Assembly-CSharp").image.class("ActiveGun");

    // 1. Hook 初始化/配置加载方法
    // 当枪支初始化属性时，强制将换弹时间改为 0
    const TryLoadGunStatByConfig = ActiveGun.method("TryLoadGunStatByConfig");
    // for (let i = 0; i < ActiveGun.fields.length; i++) {
    //     console.log(ActiveGun.fields[i].name)
    // }

    TryLoadGunStatByConfig.implementation = function () {
        // 1. 先执行原始的加载逻辑，确保其他属性正常
        this.method("TryLoadGunStatByConfig").invoke();

        // 2. 修改当前实例的 ReloadTime 字段
        // 注意：字段名必须与 Dump 中的一致
        try {
            // 换弹时间
            this.field("ReloadTime").value = 0.0;

            // 射速
            this.field("FireRate").value = 50000000

            // 弹夹容量
            this.field("ClipSize").value = 2147483647;

            // 无子弹散布
            this.field("BulletSpread").value = 0.0;

            // 伤害
            this.field("Damage").value = 9000
        } catch (e) {
            console.error(`[!] Failed to patch field: ${e}`);
        }
    };
}

Il2Cpp.perform(main).catch(e => console.error(e))
```

### 3.2 ShadowHunter.ts

```ts
// import Java from 'frida-java-bridge'
import "frida-il2cpp-bridge"
// godmode_player_only.js

// ----------------

console.log("[*] Frida GodMode 脚本已启动...");

// 等待 il2cpp 初始化完成
Il2Cpp.perform(() => {
    console.log("[*] Il2Cpp API 已准备就绪。");
    const assembly = Il2Cpp.domain.assembly('Assembly-CSharp');
    godMode(assembly)
    noSkillCooldown()
}).catch(e => console.error(e))


function godMode(
    assembly: Il2Cpp.Assembly = Il2Cpp.domain.assembly('Assembly-CSharp'),
    invincible: boolean = true,
    damage: number = 2147483647
) {
    const characterClass = assembly.image.class('SH.Combat.Skills.Impl.DefaultSkillCharacter');
    const entityTagComponentClass = assembly.image.class('EntityComponentSystem.Components.EntityTagComponent');
    // const artemisAssembly = Il2Cpp.domain.assembly('Assembly-CSharp-firstpass');
    // const entityClass = artemisAssembly.image.class('Artemis.Entity');
    // const damageFromAttackClass = assembly.image.class('ES.Core.Skills.Logics.DamageFromAttack');

    const receiveDamageMethod = characterClass.method('ReceiveDamage');
    const originalReceiveDamage = new NativeFunction(
        receiveDamageMethod.virtualAddress,
        'void', // C# 的 void 返回值
        ['pointer', 'pointer'] // 参数: [this, DamageFromAttack damage]
    );

    // RVA: 0x269f754 VA: 0x75c70dd754
    // public override Void ReceiveDamage(DamageFromAttack damage) { }
    Interceptor.replace(
        receiveDamageMethod.virtualAddress,
        new NativeCallback(function (characterPointer: NativePointer, damageFromAttackPointer: NativePointer): void {
            const character = new Il2Cpp.Object(characterPointer);
            const entity = character.field<Il2Cpp.Object>('entity').value
            const getComponentMethod = entity.method<Il2Cpp.Object>('GetComponent', 0).inflate(entityTagComponentClass);
            const tagComponent = getComponentMethod.invoke();
            const isMainCharacter = tagComponent.method<boolean>('IsMainCharacter').invoke();
            if (isMainCharacter && invincible) {
                return
            }
            if (!isMainCharacter){
                const damageFromAttack = new Il2Cpp.Object(damageFromAttackPointer)
                damageFromAttack.method('SetOverrideDmg').invoke(damage);
            }
            originalReceiveDamage(characterPointer, damageFromAttackPointer);
        }, "void", ["pointer", "pointer"])
    )

    console.log((invincible ? '已': '未') + '开启无敌')
    console.log(`已开启 ${damage} 伤害`)
}

function noSkillCooldown(assembly: Il2Cpp.Assembly = Il2Cpp.domain.assembly('Assembly-CSharp')) {
    try {
        const TimeCooldown = assembly.image.class("ES.Core.Skills.Cooldowns.TimeCooldown");

        let instance: NativePointer;
        // Start
        Interceptor.attach(TimeCooldown.method('Start').virtualAddress, {
            onEnter: function(args: NativePointer[]) {
                instance = args[0]!
            },
            onLeave() {
                instance.add(0x18).writeFloat(0)
            }
        });
        console.log('已开启技能无冷却')
    } catch (e: any) {
        console.error("开启技能无冷却失败" + e.message);
    }
}

function getReceiveDamageBaseAddress(): NativePointer {
    // --- 配置区 ---
    // HealthComponent.ReceiveDamage 的 RVA
    const receiveDamageRVA = 0x237a8ec;
    // 获取 libil2cpp.so 的基地址
    const il2cppBase = Il2Cpp.module.base;

    // 1. 计算 ReceiveDamage 的绝对地址
    const receiveDamageAddr = il2cppBase.add(receiveDamageRVA);
    console.log(`[+] HealthComponent.ReceiveDamage 位于: ${receiveDamageAddr}`);
    return receiveDamageAddr;
}

function getIl2cppBaseAddress() {
    return Il2Cpp.module.base;
}

rpc.exports = {
    noSkillCooldown,
    getReceiveDamageBaseAddress,
    getIl2cppBaseAddress
}
```
