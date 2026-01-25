# XposedAPI的Kotlin封装

## Bridge.kt

```kotlin
package ooo.cmg.oneuix.hook.util

import de.robv.android.xposed.XC_MethodHook
import de.robv.android.xposed.XC_MethodReplacement
import de.robv.android.xposed.XposedBridge
import java.lang.reflect.Member

context(_: XC_MethodHook)
fun Member.hookMethod(callback: XC_MethodHook): XC_MethodHook.Unhook = XposedBridge.hookMethod(this, callback)
context(_: XC_MethodHook)
fun Class<*>.hookAllMethods(methodName: String, callback: XC_MethodHook): Set<XC_MethodHook.Unhook> = XposedBridge.hookAllMethods(this, methodName, callback)
context(_: XC_MethodHook)
fun Class<*>.hookAllConstructors(callback: XC_MethodHook): Set<XC_MethodHook.Unhook> = XposedBridge.hookAllConstructors(this, callback)
context(_: XC_MethodHook)
fun Member.invokeOriginalMethod(args: Array<Any>, thisObject: Any? = null): Any? = XposedBridge.invokeOriginalMethod(this, thisObject, args)

context(_: XC_MethodHook)
fun Member.hookMethodBefore(
    before: XC_MethodHook.MethodHookParam.() -> Unit
): XC_MethodHook.Unhook {
    val callback = object : XC_MethodHook() {
        override fun beforeHookedMethod(param: MethodHookParam) {
            param.before()
        }
    }
    return hookMethod(callback)
}


context(_: XC_MethodHook)
fun Member.hookMethodAfter(
    after: XC_MethodHook.MethodHookParam.() -> Unit
): XC_MethodHook.Unhook {
    val callback = object : XC_MethodHook() {
        override fun afterHookedMethod(param: MethodHookParam) {
            param.after()
        }
    }
    return hookMethod(callback)
}

context(_: XC_MethodHook)
fun Member.hookMethodReplace(
    replace: XC_MethodHook.MethodHookParam.() -> Any?
): XC_MethodHook.Unhook {
    val callback = object : XC_MethodReplacement() {
        override fun replaceHookedMethod(param: MethodHookParam): Any? {
            return param.replace()
        }
    }
    return hookMethod(callback)
}

context(_: XC_MethodHook)
fun Class<*>.hookAllMethodsBefore(
    methodName: String,
    before: XC_MethodHook.MethodHookParam.() -> Unit
): Set<XC_MethodHook.Unhook> {
    val callback = object : XC_MethodHook() {
        override fun beforeHookedMethod(param: MethodHookParam) {
            param.before()
        }
    }
    return hookAllMethods(methodName, callback)
}

context(_: XC_MethodHook)
fun Class<*>.hookAllMethodsAfter(
    methodName: String,
    after: XC_MethodHook.MethodHookParam.() -> Unit
): Set<XC_MethodHook.Unhook> {
    val callback = object : XC_MethodHook() {
        override fun afterHookedMethod(param: MethodHookParam) {
            param.after()
        }
    }
    return hookAllMethods(methodName, callback)
}

context(_: XC_MethodHook)
fun Class<*>.hookAllMethodsReplace(
    methodName: String,
    replace: XC_MethodHook.MethodHookParam.() -> Any?
): Set<XC_MethodHook.Unhook> {
    val callback = object : XC_MethodReplacement() {
        override fun replaceHookedMethod(param: MethodHookParam): Any? {
            return param.replace()
        }
    }
    return hookAllMethods(methodName, callback)
}


context(_: XC_MethodHook)
fun Class<*>.hookAllConstructorsBefore(
    before: XC_MethodHook.MethodHookParam.() -> Unit
): Set<XC_MethodHook.Unhook> {
    val callback = object : XC_MethodHook() {
        override fun beforeHookedMethod(param: MethodHookParam) {
            param.before()
        }
    }
    return hookAllConstructors(callback)
}

context(_: XC_MethodHook)
fun Class<*>.hookAllConstructorsAfter(
    after: XC_MethodHook.MethodHookParam.() -> Unit
): Set<XC_MethodHook.Unhook> {
    val callback = object : XC_MethodHook() {
        override fun afterHookedMethod(param: MethodHookParam) {
            param.after()
        }
    }
    return hookAllConstructors(callback)
}

context(_: XC_MethodHook)
fun Class<*>.hookAllConstructorsReplace(
    replace: XC_MethodHook.MethodHookParam.() -> Any?
): Set<XC_MethodHook.Unhook> {
    val callback = object : XC_MethodReplacement() {
        override fun replaceHookedMethod(param: MethodHookParam): Any? {
            return param.replace()
        }
    }
    return hookAllConstructors(callback)
}
```

## Helper.kt

```kotlin
package ooo.cmg.oneuix.hook.util

import de.robv.android.xposed.XC_MethodHook
import de.robv.android.xposed.XC_MethodReplacement
import de.robv.android.xposed.XposedHelpers
import java.lang.reflect.Constructor
import java.lang.reflect.Field
import java.lang.reflect.Method

@Suppress("UNCHECKED_CAST")
context(_: XC_MethodHook)
fun <T> Any.cast(): T = this as T

@Suppress("UNCHECKED_CAST")
context(_: XC_MethodHook)
fun <T> Any.castOrNull(): T? = this as? T

context(_: XC_MethodHook)
private inline fun trySetField(action: () -> Unit): Boolean = try {
    action()
    true
} catch (_: Throwable) {
    false
}

context(_: XC_MethodHook)
private inline fun <T> getFieldOrNull(action: () -> T): T? = try {
    action()
} catch (_: Throwable) {
    null
}

// find
context(_: XC_MethodHook)
fun findClass(className: String, classLoader: ClassLoader? = null): Class<*> = XposedHelpers.findClass(className, classLoader)
context(_: XC_MethodHook)
fun findClassIfExists(className: String, classLoader: ClassLoader? = null): Class<*>? = XposedHelpers.findClassIfExists(className, classLoader)
context(_: XC_MethodHook)
fun Class<*>.findField(fieldName: String): Field = XposedHelpers.findField(this, fieldName)
context(_: XC_MethodHook)
fun Class<*>.findFieldIfExists(fieldName: String): Field? = XposedHelpers.findFieldIfExists(this, fieldName)
context(_: XC_MethodHook)
fun Class<*>.findFirstFieldByExactType(type: Class<*>): Field = XposedHelpers.findFirstFieldByExactType(this, type)
context(_: XC_MethodHook)
fun Class<*>.findAndHookMethod(methodName: String, vararg parameterTypesAndCallback: Any?): XC_MethodHook.Unhook = XposedHelpers.findAndHookMethod(this, methodName, *parameterTypesAndCallback)

context(_: XC_MethodHook)
fun Class<*>.findAndHookMethodBefore(
    methodName: String,
    vararg parameterTypes: Any?,
    before: XC_MethodHook.MethodHookParam.() -> Unit
): XC_MethodHook.Unhook {
    val callback = object : XC_MethodHook() {
        override fun beforeHookedMethod(param: MethodHookParam) {
            param.before()
        }
    }
    return XposedHelpers.findAndHookMethod(this, methodName, *parameterTypes, callback)
}

context(_: XC_MethodHook)
fun Class<*>.findAndHookMethodAfter(
    methodName: String,
    vararg parameterTypes: Any?,
    after: XC_MethodHook.MethodHookParam.() -> Unit
): XC_MethodHook.Unhook {
    val callback = object : XC_MethodHook() {
        override fun afterHookedMethod(param: MethodHookParam) {
            param.after()
        }
    }
    return XposedHelpers.findAndHookMethod(this, methodName, *parameterTypes, callback)
}

context(_: XC_MethodHook)
fun Class<*>.findAndHookMethodReplace(
    methodName: String,
    vararg parameterTypes: Any?,
    replace: XC_MethodHook.MethodHookParam.() -> Any?
): XC_MethodHook.Unhook {
    val callback = object : XC_MethodReplacement() {
        override fun replaceHookedMethod(param: MethodHookParam): Any? {
            return param.replace()
        }
    }
    return XposedHelpers.findAndHookMethod(this, methodName, *parameterTypes, callback)
}

context(_: XC_MethodHook)
fun findAndHookMethodBefore(
    className: String,
    classLoader: ClassLoader,
    methodName: String,
    vararg parameterTypes: Any?,
    before: XC_MethodHook.MethodHookParam.() -> Unit
): XC_MethodHook.Unhook {
    val callback = object : XC_MethodHook() {
        override fun beforeHookedMethod(param: MethodHookParam) {
            param.before()
        }
    }
    return XposedHelpers.findAndHookMethod(className, classLoader, methodName, *parameterTypes, callback)
}

context(_: XC_MethodHook)
fun findAndHookMethodAfter(
    className: String,
    classLoader: ClassLoader,
    methodName: String,
    vararg parameterTypes: Any?,
    after: XC_MethodHook.MethodHookParam.() -> Unit
): XC_MethodHook.Unhook {
    val callback = object : XC_MethodHook() {
        override fun afterHookedMethod(param: MethodHookParam) {
            param.after()
        }
    }
    return XposedHelpers.findAndHookMethod(className, classLoader, methodName, *parameterTypes, callback)
}

context(_: XC_MethodHook)
fun findAndHookMethodReplace(
    className: String,
    classLoader: ClassLoader,
    methodName: String,
    vararg parameterTypes: Any?,
    replace: XC_MethodHook.MethodHookParam.() -> Any?
): XC_MethodHook.Unhook {
    val callback = object : XC_MethodReplacement() {
        override fun replaceHookedMethod(param: MethodHookParam): Any? {
            return param.replace()
        }
    }
    return XposedHelpers.findAndHookMethod(className, classLoader, methodName, *parameterTypes, callback)
}


context(_: XC_MethodHook)
fun Class<*>.findMethodExact(methodName: String, vararg parameterTypes: Class<*>?): Method = XposedHelpers.findMethodExact(this, methodName, *parameterTypes)
context(_: XC_MethodHook)
fun Class<*>.findMethodExactIfExists(methodName: String, vararg parameterTypes: Any?): Method? = XposedHelpers.findMethodExactIfExists(this, methodName, *parameterTypes)

context(_: XC_MethodHook)
fun Class<*>.findMethodExact(methodName: String, vararg parameterTypes: Any?): Method = XposedHelpers.findMethodExact(this, methodName, *parameterTypes)
context(_: XC_MethodHook)
fun Class<*>.findMethodsByExactParameters(returnType: Class<*>, vararg parameterTypes: Class<*>?): Array<Method> = XposedHelpers.findMethodsByExactParameters(this, returnType, *parameterTypes)
context(_: XC_MethodHook)
fun Class<*>.findMethodBestMatch(methodName: String, vararg parameterTypes: Class<*>?): Method = XposedHelpers.findMethodBestMatch(this, methodName, *parameterTypes)
context(_: XC_MethodHook)
fun Class<*>.findMethodBestMatch(methodName: String, vararg args: Any?): Method = XposedHelpers.findMethodBestMatch(this, methodName, *args)
context(_: XC_MethodHook)
fun Class<*>.findMethodBestMatch(methodName: String, parameterTypes: Array<Class<*>>, args: Array<Any?>): Method = XposedHelpers.findMethodBestMatch(this, methodName, parameterTypes, args)


context(_: XC_MethodHook)
fun Class<*>.findConstructorExact(vararg parameterTypes: Any?): Constructor<*> = XposedHelpers.findConstructorExact(this, *parameterTypes)
context(_: XC_MethodHook)
fun Class<*>.findConstructorExactIfExists(vararg parameterTypes: Any?): Constructor<*>? = XposedHelpers.findConstructorExactIfExists(this, *parameterTypes)
context(_: XC_MethodHook)
fun Class<*>.findConstructorExact(vararg parameterTypes: Class<*>?): Constructor<*> = XposedHelpers.findConstructorExact(this, *parameterTypes)

context(_: XC_MethodHook)
fun Class<*>.findAndHookConstructor(vararg parameterTypes: Any?): XC_MethodHook.Unhook = XposedHelpers.findAndHookConstructor(this, *parameterTypes)

context(_: XC_MethodHook)
fun Class<*>.findConstructorBestMatch(vararg parameterTypes: Class<*>?): Constructor<*> = XposedHelpers.findConstructorBestMatch(this, *parameterTypes)
context(_: XC_MethodHook)
fun Class<*>.findConstructorBestMatch(vararg args: Any?): Constructor<*> = XposedHelpers.findConstructorBestMatch(this, *args)
context(_: XC_MethodHook)
fun Class<*>.findConstructorBestMatch(parameterTypes: Array<Class<*>>, args: Array<Any?>): Constructor<*> = XposedHelpers.findConstructorBestMatch(this, parameterTypes, args)

context(_: XC_MethodHook)
fun Any.getSurroundingThis(): Any? = XposedHelpers.getSurroundingThis(this)

context(_: XC_MethodHook)
fun Any.setObjectField(fieldName: String, value: Any?) = XposedHelpers.setObjectField(this, fieldName, value)
context(_: XC_MethodHook)
fun Any.trySetObjectField(fieldName: String, value: Any?): Boolean = trySetField { this.setObjectField(fieldName, value) }
context(_: XC_MethodHook)
fun Class<*>.setStaticObjectField(fieldName: String, value: Any?) = XposedHelpers.setStaticObjectField(this, fieldName, value)
context(_: XC_MethodHook)
fun Class<*>.trySetStaticObjectField(fieldName: String, value: Any?) = trySetField { setStaticObjectField(fieldName, value) }
context(_: XC_MethodHook)
fun Any.getObjectField(fieldName: String): Any? = XposedHelpers.getObjectField(this, fieldName)
context(_: XC_MethodHook)
fun Class<*>.getStaticObjectField(fieldName: String): Any? = XposedHelpers.getStaticObjectField(this, fieldName)


context(_: XC_MethodHook)
fun Any.setBooleanField(fieldName: String, value: Boolean) = XposedHelpers.setBooleanField(this, fieldName, value)
context(_: XC_MethodHook)
fun Any.trySetBooleanField(fieldName: String, value: Boolean): Boolean = trySetField { this.setBooleanField(fieldName, value) }
context(_: XC_MethodHook)
fun Class<*>.setStaticBooleanField(fieldName: String, value: Boolean) = XposedHelpers.setStaticBooleanField(this, fieldName, value)
context(_: XC_MethodHook)
fun Class<*>.trySetStaticBooleanField(fieldName: String, value: Boolean) = trySetField { setStaticBooleanField(fieldName, value) }
context(_: XC_MethodHook)
fun Any.getBooleanField(fieldName: String): Boolean = XposedHelpers.getBooleanField(this, fieldName)
context(_: XC_MethodHook)
fun Any.getBooleanFieldOrNull(fieldName: String): Boolean? = getFieldOrNull { this.getBooleanField(fieldName) }
context(_: XC_MethodHook)
fun Class<*>.getStaticBooleanField(fieldName: String): Boolean = XposedHelpers.getStaticBooleanField(this, fieldName)
context(_: XC_MethodHook)
fun Class<*>.getStaticBooleanFieldOrNull(fieldName: String): Boolean? = getFieldOrNull { getStaticBooleanField(fieldName) }


context(_: XC_MethodHook)
fun Any.setByteField(fieldName: String, value: Byte) = XposedHelpers.setByteField(this, fieldName, value)
context(_: XC_MethodHook)
fun Any.trySetByteField(fieldName: String, value: Byte): Boolean = trySetField { this.setByteField(fieldName, value) }
context(_: XC_MethodHook)
fun Class<*>.setStaticByteField(fieldName: String, value: Byte) = XposedHelpers.setStaticByteField(this, fieldName, value)
context(_: XC_MethodHook)
fun Class<*>.trySetStaticByteField(fieldName: String, value: Byte) = trySetField { setStaticByteField(fieldName, value) }
context(_: XC_MethodHook)
fun Any.getByteField(fieldName: String): Byte = XposedHelpers.getByteField(this, fieldName)
context(_: XC_MethodHook)
fun Any.getByteFieldOrNull(fieldName: String): Byte? = getFieldOrNull { this.getByteField(fieldName) }
context(_: XC_MethodHook)
fun Class<*>.getStaticByteField(fieldName: String): Byte = XposedHelpers.getStaticByteField(this, fieldName)
context(_: XC_MethodHook)
fun Class<*>.getStaticByteFieldOrNull(fieldName: String): Byte? = getFieldOrNull { getStaticByteField(fieldName) }


context(_: XC_MethodHook)
fun Any.setCharField(fieldName: String, value: Char) = XposedHelpers.setCharField(this, fieldName, value)
context(_: XC_MethodHook)
fun Any.trySetCharField(fieldName: String, value: Char): Boolean = trySetField { this.setCharField(fieldName, value) }
context(_: XC_MethodHook)
fun Class<*>.setStaticCharField(fieldName: String, value: Char) = XposedHelpers.setStaticCharField(this, fieldName, value)
context(_: XC_MethodHook)
fun Class<*>.trySetStaticCharField(fieldName: String, value: Char) = trySetField { setStaticCharField(fieldName, value) }
context(_: XC_MethodHook)
fun Any.getCharField(fieldName: String): Char = XposedHelpers.getCharField(this, fieldName)
context(_: XC_MethodHook)
fun Any.getCharFieldOrNull(fieldName: String): Char? = getFieldOrNull { this.getCharField(fieldName) }
context(_: XC_MethodHook)
fun Class<*>.getStaticCharField(fieldName: String): Char = XposedHelpers.getStaticCharField(this, fieldName)
context(_: XC_MethodHook)
fun Class<*>.getStaticCharFieldOrNull(fieldName: String): Char? = getFieldOrNull { getStaticCharField(fieldName) }


context(_: XC_MethodHook)
fun Any.setDoubleField(fieldName: String, value: Double) = XposedHelpers.setDoubleField(this, fieldName, value)
context(_: XC_MethodHook)
fun Any.trySetDoubleField(fieldName: String, value: Double): Boolean = trySetField { this.setDoubleField(fieldName, value) }
context(_: XC_MethodHook)
fun Class<*>.setStaticDoubleField(fieldName: String, value: Double) = XposedHelpers.setStaticDoubleField(this, fieldName, value)
context(_: XC_MethodHook)
fun Class<*>.trySetStaticDoubleField(fieldName: String, value: Double) = trySetField { setStaticDoubleField(fieldName, value) }
context(_: XC_MethodHook)
fun Any.getDoubleField(fieldName: String): Double = XposedHelpers.getDoubleField(this, fieldName)
context(_: XC_MethodHook)
fun Any.getDoubleFieldOrNull(fieldName: String): Double? = getFieldOrNull { this.getDoubleField(fieldName) }
context(_: XC_MethodHook)
fun Class<*>.getStaticDoubleField(fieldName: String): Double = XposedHelpers.getStaticDoubleField(this, fieldName)
context(_: XC_MethodHook)
fun Class<*>.getStaticDoubleFieldOrNull(fieldName: String): Double? = getFieldOrNull { getStaticDoubleField(fieldName) }


context(_: XC_MethodHook)
fun Any.setFloatField(fieldName: String, value: Float) = XposedHelpers.setFloatField(this, fieldName, value)
context(_: XC_MethodHook)
fun Any.trySetFloatField(fieldName: String, value: Float): Boolean = trySetField { this.setFloatField(fieldName, value) }
context(_: XC_MethodHook)
fun Class<*>.setStaticFloatField(fieldName: String, value: Float) = XposedHelpers.setStaticFloatField(this, fieldName, value)
context(_: XC_MethodHook)
fun Class<*>.trySetStaticFloatField(fieldName: String, value: Float) = trySetField { setStaticFloatField(fieldName, value) }
context(_: XC_MethodHook)
fun Any.getFloatField(fieldName: String): Float = XposedHelpers.getFloatField(this, fieldName)
context(_: XC_MethodHook)
fun Any.getFloatFieldOrNull(fieldName: String): Float? = getFieldOrNull { this.getFloatField(fieldName) }
context(_: XC_MethodHook)
fun Class<*>.getStaticFloatField(fieldName: String): Float = XposedHelpers.getStaticFloatField(this, fieldName)
context(_: XC_MethodHook)
fun Class<*>.getStaticFloatFieldOrNull(fieldName: String): Float? = getFieldOrNull { getStaticFloatField(fieldName) }


context(_: XC_MethodHook)
fun Any.setIntField(fieldName: String, value: Int) = XposedHelpers.setIntField(this, fieldName, value)
context(_: XC_MethodHook)
fun Any.trySetIntField(fieldName: String, value: Int): Boolean = trySetField { this.setIntField(fieldName, value) }
context(_: XC_MethodHook)
fun Class<*>.setStaticIntField(fieldName: String, value: Int) = XposedHelpers.setStaticIntField(this, fieldName, value)
context(_: XC_MethodHook)
fun Class<*>.trySetStaticIntField(fieldName: String, value: Int) = trySetField { setStaticIntField(fieldName, value) }
context(_: XC_MethodHook)
fun Any.getIntField(fieldName: String): Int = XposedHelpers.getIntField(this, fieldName)
context(_: XC_MethodHook)
fun Any.getIntFieldOrNull(fieldName: String): Int? = getFieldOrNull { this.getIntField(fieldName) }
context(_: XC_MethodHook)
fun Class<*>.getStaticIntField(fieldName: String): Int = XposedHelpers.getStaticIntField(this, fieldName)
context(_: XC_MethodHook)
fun Class<*>.getStaticIntFieldOrNull(fieldName: String): Int? = getFieldOrNull { getStaticIntField(fieldName) }


context(_: XC_MethodHook)
fun Any.setLongField(fieldName: String, value: Long) = XposedHelpers.setLongField(this, fieldName, value)
context(_: XC_MethodHook)
fun Any.trySetLongField(fieldName: String, value: Long): Boolean = trySetField { this.setLongField(fieldName, value) }
context(_: XC_MethodHook)
fun Class<*>.setStaticLongField(fieldName: String, value: Long) = XposedHelpers.setStaticLongField(this, fieldName, value)
context(_: XC_MethodHook)
fun Class<*>.trySetStaticLongField(fieldName: String, value: Long) = trySetField { setStaticLongField(fieldName, value) }
context(_: XC_MethodHook)
fun Any.getLongField(fieldName: String): Long = XposedHelpers.getLongField(this, fieldName)
context(_: XC_MethodHook)
fun Any.getLongFieldOrNull(fieldName: String): Long? = getFieldOrNull { this.getLongField(fieldName) }
context(_: XC_MethodHook)
fun Class<*>.getStaticLongField(fieldName: String): Long = XposedHelpers.getStaticLongField(this, fieldName)
context(_: XC_MethodHook)
fun Class<*>.getStaticLongFieldOrNull(fieldName: String): Long? = getFieldOrNull { getStaticLongField(fieldName) }


context(_: XC_MethodHook)
fun Any.setShortField(fieldName: String, value: Short) = XposedHelpers.setShortField(this, fieldName, value)
context(_: XC_MethodHook)
fun Any.trySetShortField(fieldName: String, value: Short): Boolean = trySetField { this.setShortField(fieldName, value) }
context(_: XC_MethodHook)
fun Class<*>.setStaticShortField(fieldName: String, value: Short) = XposedHelpers.setStaticShortField(this, fieldName, value)
context(_: XC_MethodHook)
fun Class<*>.trySetStaticShortField(fieldName: String, value: Short) = trySetField { setStaticShortField(fieldName, value) }
context(_: XC_MethodHook)
fun Any.getShortField(fieldName: String): Short = XposedHelpers.getShortField(this, fieldName)
context(_: XC_MethodHook)
fun Any.getShortFieldOrNull(fieldName: String): Short? = getFieldOrNull { this.getShortField(fieldName) }
context(_: XC_MethodHook)
fun Class<*>.getStaticShortField(fieldName: String): Short = XposedHelpers.getStaticShortField(this, fieldName)
context(_: XC_MethodHook)
fun Class<*>.getStaticShortFieldOrNull(fieldName: String): Short? = getFieldOrNull { getStaticShortField(fieldName) }


context(_: XC_MethodHook)
operator fun Any.set(fieldName: String, value: Any?) = this.setObjectField(fieldName, value)
context(_: XC_MethodHook)
operator fun Any.set(fieldName: String, value: Boolean) = this.setBooleanField(fieldName, value)
context(_: XC_MethodHook)
operator fun Any.set(fieldName: String, value: Byte) = this.setByteField(fieldName, value)
context(_: XC_MethodHook)
operator fun Any.set(fieldName: String, value: Char) = this.setCharField(fieldName, value)
context(_: XC_MethodHook)
operator fun Any.set(fieldName: String, value: Double) = this.setDoubleField(fieldName, value)
context(_: XC_MethodHook)
operator fun Any.set(fieldName: String, value: Float) = this.setFloatField(fieldName, value)
context(_: XC_MethodHook)
operator fun Any.set(fieldName: String, value: Int) = this.setIntField(fieldName, value)
context(_: XC_MethodHook)
operator fun Any.set(fieldName: String, value: Long) = this.setLongField(fieldName, value)
context(_: XC_MethodHook)
operator fun Any.set(fieldName: String, value: Short) = this.setShortField(fieldName, value)
context(_: XC_MethodHook)
operator fun Any?.get(fieldName: String): Any? = this?.getObjectField(fieldName)


context(_: XC_MethodHook)
operator fun Class<*>.set(fieldName: String, value: Any?) = setStaticObjectField(fieldName, value)
context(_: XC_MethodHook)
operator fun Class<*>.set(fieldName: String, value: Boolean) = setStaticBooleanField(fieldName, value)
context(_: XC_MethodHook)
operator fun Class<*>.set(fieldName: String, value: Byte) = setStaticByteField(fieldName, value)
context(_: XC_MethodHook)
operator fun Class<*>.set(fieldName: String, value: Char) = setStaticCharField(fieldName, value)
context(_: XC_MethodHook)
operator fun Class<*>.set(fieldName: String, value: Double) = setStaticDoubleField(fieldName, value)
context(_: XC_MethodHook)
operator fun Class<*>.set(fieldName: String, value: Float) = setStaticFloatField(fieldName, value)
context(_: XC_MethodHook)
operator fun Class<*>.set(fieldName: String, value: Int) = setStaticIntField(fieldName, value)
context(_: XC_MethodHook)
operator fun Class<*>.set(fieldName: String, value: Long) = setStaticLongField(fieldName, value)
context(_: XC_MethodHook)
operator fun Class<*>.set(fieldName: String, value: Short) = setStaticShortField(fieldName, value)
context(_: XC_MethodHook)
operator fun Class<*>?.get(fieldName: String): Any? = this?.getStaticObjectField(fieldName)

context(_: XC_MethodHook)
fun Any.callMethod(methodName: String, vararg args: Any?): Any? = XposedHelpers.callMethod(this, methodName, *args)
context(_: XC_MethodHook)
operator fun Any?.invoke(methodName: String, vararg args: Any?): Any? = this?.callMethod(methodName, *args)

context(_: XC_MethodHook)
fun Any.callMethod(methodName: String, parameterTypes: Array<Class<*>>, vararg args: Any?): Any? = XposedHelpers.callMethod(this, methodName, parameterTypes, *args)
context(_: XC_MethodHook)
operator fun Any?.invoke(methodName: String, parameterTypes: Array<Class<*>>, vararg args: Any?): Any? = this?.callMethod(methodName, parameterTypes, *args)

context(_: XC_MethodHook)
fun Class<*>.callStaticMethod(methodName: String, vararg args: Any?): Any? = XposedHelpers.callStaticMethod(this, methodName, *args)
context(_: XC_MethodHook)
fun Class<*>.callStaticMethod(methodName: String, parameterTypes: Array<Class<*>>, vararg args: Any?): Any? = XposedHelpers.callStaticMethod(this, methodName, parameterTypes, *args)

context(_: XC_MethodHook)
fun Class<*>.newInstance(vararg args: Any?): Any? = XposedHelpers.newInstance(this, *args)
context(_: XC_MethodHook)
operator fun Class<*>?.invoke(vararg args: Any?): Any? = this?.newInstance(*args)
context(_: XC_MethodHook)
fun Class<*>.newInstance(parameterTypes: Array<Class<*>>, vararg args: Any?): Any? = XposedHelpers.newInstance(this, parameterTypes, *args)
context(_: XC_MethodHook)
operator fun Class<*>?.invoke(parameterTypes: Array<Class<*>>, vararg args: Any?): Any? = this?.newInstance(parameterTypes, *args)

context(_: XC_MethodHook)
fun Any.setAdditionalInstanceField(key: String, value: Any?): Any? = XposedHelpers.setAdditionalInstanceField(this, key, value)
context(_: XC_MethodHook)
fun Any.getAdditionalInstanceField(key: String): Any? = XposedHelpers.getAdditionalInstanceField(this, key)
context(_: XC_MethodHook)
fun Any.removeAdditionalInstanceField(key: String): Any? = XposedHelpers.removeAdditionalInstanceField(this, key)

context(_: XC_MethodHook)
fun Any.setAdditionalStaticField(key: String, value: Any?): Any? = XposedHelpers.setAdditionalStaticField(this, key, value)
context(_: XC_MethodHook)
fun Any.getAdditionalStaticField(key: String): Any? = XposedHelpers.getAdditionalStaticField(this, key)
context(_: XC_MethodHook)
fun Any.removeAdditionalStaticField(key: String): Any? = XposedHelpers.removeAdditionalStaticField(this, key)

context(_: XC_MethodHook)
fun Class<*>.setAdditionalStaticField(key: String, value: Any?): Any? = XposedHelpers.setAdditionalStaticField(this, key, value)
context(_: XC_MethodHook)
fun Class<*>.getAdditionalStaticField(key: String): Any? = XposedHelpers.getAdditionalStaticField(this, key)
context(_: XC_MethodHook)
fun Class<*>.removeAdditionalStaticField(key: String): Any? = XposedHelpers.removeAdditionalStaticField(this, key)
```
