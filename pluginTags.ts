// packages/plugin-tags/src/index.ts  
import type { RspressPlugin, PageIndexInfo } from '@rspress/core';  


  

export function pluginTags(): RspressPlugin {  

  const routePathToPage = new Map<string, {title: string, description: string | undefined, lang: string}>()
  const tagToRoutePaths = new Map<string, Set<string>>()

  return {  
    name: '@rspress/plugin-tags',  
      
    // 1. 数据收集  
    extendPageData(pageData: PageIndexInfo) {  
      const { routePath, frontmatter, title, description, lang } = pageData;  
      // 从 frontmatter 提取 tags 字段  
      const tags = frontmatter.tags as string[] | string | undefined;  
      // if(tags) {
      //   console.log(`[@rspress/plugin-tags] Processing page: ${routePath}, tags: ${tags}`);
      //   console.log(`[@rspress/plugin-tags] Processing page: ${routePath}, tags: ${tags[0]}`);
      // }
      // if (!tags) return;  
  
      // 标准化为数组格式  
      const tagArray = Array.isArray(tags) ? tags : [tags].filter(Boolean);  
        
      // 处理每个标签  
      for (const rawTag of tagArray) {  
        const cleanTagName = rawTag?.trim();  
        if (!cleanTagName) continue;
        
        routePathToPage.set(routePath, {title, description, lang})

        if (tagToRoutePaths.has(cleanTagName)){
          tagToRoutePaths.get(cleanTagName)?.add(routePath)
        } else {
          tagToRoutePaths.set(cleanTagName, new Set([routePath]))
        }
      }  
    },  
  
  
    // 4. 注入运行时数据  
    builderConfig: {  
      source: {  
        define: {  
          'process.env.RSPRESS_TAGS_DATA': JSON.stringify(routePathToPage),  
        },  
      },  
    },  
  };  
}  
