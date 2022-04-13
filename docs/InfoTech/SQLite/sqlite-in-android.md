# 在安卓中使用 SQLite

DataBaseHelper.kt

```kotlin
package sqlcurd.database

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import sqlcurd.model.TaskListModel

// SQLiteOpenHelper参数：上下文环境，数据库名，查询数据后返回的Cursor，数据库版本
class DatabaseHelper(context: Context) : SQLiteOpenHelper(context, DB_NAME, null, DB_VERSION) {
    // 伴生对象，定义数据库信息
    companion object {
        // 数据库名
        private const val DB_NAME = "task"
        // 数据库版本
        private const val DB_VERSION = 1
        // 表名
        private const val TABLE_NAME = "list"
        // 表的列名
        private const val ID = "id"
        private const val TASK_NAME = "name"
        private const val TASK_DETAILS = "details"
    }

    private fun Int.toPositive() = if (this >= 0) this else throw Exception("it's positive!")

    // 创建数据库
    override fun onCreate(db: SQLiteDatabase?) {
        val createTableString = """
            CREATE TABLE $TABLE_NAME (
                $ID INTEGER PRIMARY KEY,
                $TASK_NAME TEXT,
                $TASK_DETAILS TEXT
            );
        """.trimIndent()

        db?.execSQL(createTableString)
    }

    // 升级数据库时
    override fun onUpgrade(db: SQLiteDatabase?, oldVersion: Int, newVersion: Int) {
        val dropTAbleString = "DROP TABLE IF EXISTS $TABLE_NAME;"
        // 删表 重建
        db?.execSQL(dropTAbleString)
        onCreate(db)
    }

    // 查询所有数据
    fun getAllTask(): List<TaskListModel> {
        // 获取只读数据库
        val db = readableDatabase
        // 查询所有数据
        val selectString = "SELECT * FROM $TABLE_NAME;"
        // 执行查询，获得游标
        val cursor = db.rawQuery(selectString, null)
        // 构建结果列表
        val result = buildList {
            // 如果有结果
            if (cursor.moveToFirst()) {
                do {
                    // 将结果加入列表
                    add(
                        TaskListModel(
                            id = cursor.getInt(cursor.getColumnIndex(ID).toPositive()),
                            name = cursor.getString(cursor.getColumnIndex(TABLE_NAME).toPositive()),
                            detail = cursor.getString(
                                cursor.getColumnIndex(TASK_DETAILS).toPositive()
                            )
                        )
                    )
                // 游标指向下一条结果
                } while (cursor.moveToNext())
            }
        }
        // 关闭游标
        cursor.close()
        // 关闭数据库
        db.close()
        // 返回结果列表
        return result
    }

    // 增
    fun addTask(task:TaskListModel):Boolean {
        val db=writableDatabase
        val values=ContentValues().apply {
            put(TABLE_NAME,task.name)
            put(TASK_DETAILS,task.detail)
        }
        val success=db.insert(TASK_NAME,null,values)
        db.close()
        return success.toInt()!=-1
    }

    // 查
    fun getTask(id:Int):TaskListModel {
        val db=readableDatabase
        val selectString="SELECT * FROM $TABLE_NAME WHERE $ID = $id;"
        val cursor=db.rawQuery(selectString,null)
        cursor?.moveToFirst()
        val result=TaskListModel(
            id=cursor.getInt(cursor.getColumnIndex(ID).toPositive()),
            name = cursor.getString(cursor.getColumnIndex(TASK_NAME).toPositive()),
            detail = cursor.getString(cursor.getColumnIndex(TASK_DETAILS).toPositive())
        )
        cursor.close()
        db.close()
        return result
    }

    // 删
    fun deleteTask(id:Int):Boolean {
        val db=writableDatabase
        val success=db.delete(TABLE_NAME,"$ID =?", arrayOf(id.toString()))
        db.close()
        return success!=-1
    }

    // 改
    fun updateTAsk(task: TaskListModel):Boolean {
        val db=writableDatabase
        val values=ContentValues().apply {
            put(TASK_NAME, task.name)
            put(TASK_DETAILS,task.detail)
        }
        val success=db.update(TABLE_NAME,values, "$ID =?", arrayOf(task.id.toString()))
        db.close()
        return success!=-1
    }
}
```

TaskListModel.kt

```kotlin
package sqlcurd.model

data class TaskListModel(
    var id: Int = 0,
    var name: String = "",
    var detail: String = ""
)
```
