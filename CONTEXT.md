# TeamMaster

面向小公司 manager / founder / CEO 的人与项目管理平台。把公司事实、专家方法论、实时工作信号合成为可追溯、可校对、可执行、且经人确认的管理建议。

本文件只是术语表（glossary），不放实现细节、不放 demo 脚本、不放架构决策。

## Language

**Dashboard**：
ambient 空间式指挥中心 —— 把人、项目、信号画成一张平静的地图，呈现当前"组织天气"。它是**观察面**：你看，还没动手。
_Avoid_: home、canvas（canvas 是视觉手法，不是这个概念本身）

**Nexus**：
**行动面** —— manager 的一个问题在这里变成一条被编排的线程：specialist agents 与人类同事协同，agent 在背景聆听并交叉校对证据，按需调用 tools，最终产出供人 review 的结构化可信输出。
_Avoid_: chat、conversation、thread（都低估了它的多 agent 编排本质）

**Briefing**：
Dashboard 上呈现的一段**离散、可重新生成**的高管摘要（"组织天气"）。可以不止一条，manager 可以再取一条。
_Avoid_: summary、report（report 专指 Nexus 的结构化输出）

**Calm**：
Dashboard 的**静息态**——人与项目以最简密度铺成一张平静地图，无高亮、无展开。观察面的默认状态；点空白处即回到 calm。
_Avoid_: idle、empty（calm 是"一切尽在掌握"的平静，不是空）

**Focus**：
calm 的反面——**一组关联实体被点亮、其余淡化**的状态。由三种选择器触发：点单个节点、选 tag、搜索。关键：**单点也点亮"该实体 + 它的关联簇"**（owner / 依赖 / 被分配的人），不是只亮被点那一个。是从"观察"过渡到"将要钻入"的中间态。
_Avoid_: select、filter（filter 暗示"减项"，focus 是"点亮关联簇"）、highlight（只说了视觉、没说关联语义）

**Reality gap**：
"被相信的状态"与"实时信号"之间被检测出的矛盾（例：owner 报 on-track，但信号显示 PR 卡住、重复 blocker、任务零更新）。系统只**指出矛盾并给低风险下一步**，绝不做人身/人格评价。其中"自报 vs 信号"这一具体子类叫 **report mismatch**。
_Avoid_: discrepancy、conflict

**Handoff**：
agent 产出的、落在 Dashboard / 详情页表面上**可直接执行**的单条行动（checklist 形式，可 done / discard，部分可一键飞回 Nexus 深挖）。是"建议"与"已确认派出的 Task"之间的中间态：人确认后才经 dispatchTask 变成 Task。
_Avoid_: action item、todo（会跟已派出的 Task 混淆）

**Capabilities**：
TeamMaster 自有的垂直领域专家知识层——跨 HR / Legal / PM / Finance / Ops / Sales 的真实案例、解决方案、SOP / playbook。可信性的"第二条腿"：公司事实回答"发生了什么"，Capabilities 回答"专业上该怎么判断、怎么处理"。是 agent 建议区别于普通 ChatGPT（只有泛化常识）的关键。**TeamMaster 私有资产，订阅制提供，agent 检索时自动优先引用——产品的护城河。**
_Avoid_: CAPA（撞行业既有术语 Corrective-And-Preventive-Action，会让听众卡顿解码）、capabilities RAG（RAG 是检索机制，不是这个知识层本身）、专家能力库
