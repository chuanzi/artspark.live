# Context
Filename: TASK_PORTRAIT_PROMPT_UPDATE.md
Created On: 2024-12-19 21:30
Created By: AI Assistant
Associated Protocol: RIPER-5 + Multidimensional + Agent Protocol

# Task Description
修改portrait工具的提示词模板，将用户提供的中英文混合提示词应用到系统中，并实现根据{}内容和参考图状态的智能人物数量判断逻辑。

用户需求：
1. 如果{}中没有具体人物描述，只有参考图，照片中只有一个人物（参考图的人物形象）
2. 如果{}中有具体人物描述，且有参考图，输出包含两个人物的照片
3. 标准单人物场景（有描述的情况）

# Project Overview
Artspark网站的Portrait工具，用于生成高质量黑白艺术肖像。当前使用Next.js架构，API路由在app/api/generate-portrait/route.ts，前端页面在app/tools/portrait/page.tsx。

---
*以下部分由AI在协议执行期间维护*
---

# Analysis (由RESEARCH模式填充)
通过代码分析发现：
1. 项目结构：Next.js应用，API路由处理图像生成请求
2. 当前提示词：固定英文模板，使用{CHARACTER_DESCRIPTION}占位符
3. API接口：已支持referenceImage参数传递
4. 前端功能：已具备参考图上传和传递功能
5. 修改范围：主要集中在API路由的提示词处理逻辑

# Proposed Solution (由INNOVATE模式填充)
采用动态提示词构建方案：
- 在API路由中实现智能提示词构建函数
- 根据characterDescription内容和referenceImage存在状态判断场景
- 保持现有架构不变，仅修改提示词处理逻辑
- 支持三种场景的自动切换

# Implementation Plan (由PLAN模式生成)
实施检查清单：
1. 备份现有PROMPT_TEMPLATE内容
2. 在app/api/generate-portrait/route.ts中替换PROMPT_TEMPLATE为新的中英文模板
3. 修改POST函数中的request.json()解构，添加referenceImage参数获取
4. 实现智能提示词构建函数，根据characterDescription和referenceImage状态判断场景
5. 更新prompt构建逻辑，使用新的智能判断结果
6. 测试验证三种场景的工作状态

# Current Execution Step (由EXECUTE模式更新)
> Currently executing: "步骤1-5: 实现智能提示词系统"

# Task Progress (由EXECUTE模式追加)
* 2024-12-19 21:30
  * Step: 1-5. 实现智能提示词模板替换和逻辑构建
  * Modifications: 
    - app/api/generate-portrait/route.ts: 替换PROMPT_TEMPLATE为用户提供的中英文混合模板
    - 保留原有英文模板作为注释备份
    - 修改POST函数解构，添加referenceImage参数获取
    - 实现buildSmartPrompt智能提示词构建函数，支持三种场景判断：
      * 场景1：无描述+有参考图 → 单人物（参考图人物）
      * 场景2：有描述+有参考图 → 双人物组合
      * 场景3：有描述+无参考图 → 标准单人物
    - 更新prompt构建逻辑使用智能判断结果
  * Change Summary: 完成提示词模板更新和智能逻辑实现，支持根据参数动态调整人物数量
  * Reason: 执行用户提示词修改需求
  * Blockers: None
  * User Confirmation Status: Success

* 2024-12-19 21:45
  * Step: 6. 修复参数验证和参考图传递问题
  * Modifications: 
    - app/api/generate-portrait/route.ts: 修复参数验证逻辑，允许在有参考图时characterDescription为空
    - 更新错误消息为"请提供人物描述或上传参考图"，提供更准确的用户指导
    - 修改buildSmartPrompt函数，添加对空描述的安全处理（description ? description.trim() : ''）
    - 在requestBody构建中添加referenceImage参数传递：if (referenceImage) { requestBody.image = referenceImage }
    - 修改prompt构建调用，使用characterDescription || ''确保空值安全
  * Change Summary: 修复了参数验证过严和参考图未传递的问题，现在支持纯参考图生成场景
  * Reason: 解决用户反馈的两个关键问题
  * Blockers: None
  * User Confirmation Status: [Pending Confirmation]

* 2024-12-19 22:00
  * Step: 7. 修复前端按钮禁用逻辑
  * Modifications: 
    - app/tools/portrait/page.tsx: 修复handleGenerate函数验证逻辑，与后端API保持一致
    - 更改验证条件从`!characterDescription.trim()`为`!characterDescription.trim() && !referenceImage`
    - 更新错误消息为"请提供人物描述或上传参考图"，与后端一致
    - 修复开始生成按钮的disabled条件，从`!characterDescription.trim() || isGenerating`改为`(!characterDescription.trim() && !referenceImage) || isGenerating`
    - 现在支持在有参考图时描述为空，按钮可以正常点击
  * Change Summary: 修复了前端验证逻辑与后端不一致的问题，现在用户可以在上传参考图后直接点击生成按钮
  * Reason: 解决用户反馈的按钮不可点击问题
  * Blockers: None
  * User Confirmation Status: [Pending Confirmation]

* 2024-12-19 22:15
  * Step: 8. 第二次提示词模板更新
  * Modifications: 
    - app/api/generate-portrait/route.ts: 替换PROMPT_TEMPLATE为用户提供的新提示词模板
    - 新模板在原有基础上进行了细节调整，将"His/Her/Its"等表述更加精确
    - 添加了中文的参考图处理说明，明确了两种场景：
      * 没有具体人物描述+只有参考图 → 参考图人物形象的照片
      * 有具体人物描述+有参考图 → 包含两个人物的照片
    - 保持现有的buildSmartPrompt智能逻辑函数不变，与新模板完全兼容
    - 保持现有的参数验证和传递逻辑不变
  * Change Summary: 完成了提示词模板的第二次优化更新，新模板更加清晰地表达了参考图处理逻辑
  * Reason: 根据用户要求进行提示词精细化调整
  * Blockers: None
  * User Confirmation Status: [Pending Confirmation]

# Final Review (由REVIEW模式填充)
[待REVIEW模式完成] 