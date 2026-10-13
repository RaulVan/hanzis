# 首批学习内容核对记录

日期：2026-10-13。编辑及检查者：AI Agent（Codex）。状态：新增文字与引用资料已由 Agent 核对；未经人工教师审校，未完成音频听辨专项。该记录不是教学资质或全面审校声明。

## 版本与方法

- 原诗、作者与注音继续使用 `data/poems.ts` 的常见简体版本；新增内容在 `data/poemLearning.ts`，不修改原文或既有阅读功能。
- 下列参考资料用于核对事实。学习问题、背诵线索、书写活动及英文说明由本站本次整理，不复制参考文献的长篇赏析；推荐理由是编辑判断。
- 不新增无法核对的创作年代、地点、作者经历或教师署名。
- 中文原文和音节保留；新增界面、教学说明、反馈提供英文翻译。

## 逐项核对

| 内容 ID | 核对资料 | Agent 已核对的范围 | 仍未验证 |
| --- | --- | --- | --- |
| `jing-ye-si` | [教育局《静夜思》原文、注释与赏析，第1–2页](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/recommended-passages/KS1_10.pdf) | 疑霜与真实霜的区别；举头/低头/故乡语义；动作和思乡的关系；答案依据原诗；练字字符出自原文 | 人工审校；朗读表现 |
| `chun-xiao` | [教育局《春晓》第1–2页](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/recommended-passages/KS1_08.pdf)、[教育部简编本“不觉”](https://dict.concised.moe.edu.tw/dictView.jsp?ID=2121&la=0&powerMode=0) | 晓/闻含义；觉读 jué；今晨与昨夜的叙述次序；落花数量未给出；答案和练字字符 | 人工审校；连读变调听辨 |
| `yong-e` | [教育局《咏鹅》第1–2页](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/recommended-passages/KS1_05.pdf) | 曲项/浮/拨语义；白、绿、红对应对象；问题与动作解释；与《小池》水边观察的关联 | 人工审校；实际录音听辨；曲字读音沿用原有 qū 注音，未据此宣称全库读音审校 |
| `deng-guan-que-lou` | [教育局《登鹳鹊楼》第1–2页](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/recommended-passages/KS1_07.pdf) | 依山尽/欲/穷含义；登高与望远关系；入海包含想象，不能误写看见海口；问答与推荐理由 | 人工审校；当前标题“鹳雀”与参考资料“鹳鹊”为版本差异，保留现有标题 |
| `min-nong` | [教育局《悯农（其二）》第1–2页](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/recommended-passages/KS1_13.pdf) | 锄禾不是锄掉禾苗；正午/汗滴的劳动场景；粒粒皆的范围；田间与餐桌两层关系 | 人工审校；参考资料采用“盘中飧”而本站保留“盘中餐”，不以该资料证明 cān 注音或版本完全一致 |
| `aspiration` | [教育部《汉语拼音的教学特色》](https://www.moe.gov.cn/s78/A18/A18_ztzl/jnhypyfa/201805/t20180517_336341.html)、[中国教育和科研计算机网《普通话语音》声母段](https://www.edu.cn/pu_tong_hua_483/20060323/t20060323_19443.shtml) | 手前比较气流的方法；b/d/g 与 p/t/k 的对应；同韵母同声调示例；两道练习的正确和错误反馈 | 人工审校；12个示例音频中的6个送气示例未做人耳听辨；文件存在不证明发音准确 |
| `u-spelling` | [湖南第一师范学院教务处《怎么使用〈汉语拼音方案〉？》第2、3、5问](https://jwc.hnfnu.edu.cn/info/1055/3129.htm)、`lib/pinyinQuiz.ts` | j/q/x 省点、n/l 保点、无声母时 y 拼写；nǚ/qù选择题；程序接受 v/u: 的输入便利与书面拼写分开；女绿居去虚鱼示例的音节规则 | 人工审校；示例音频听辨；不会将程序兼容 qǜ 解释为规范书面拼音 |
| `pinyin-quiz-review` | `lib/pinyinQuiz.ts`、`tests/pinyinQuiz.test.ts` | 正确、声调错误、拼写错误、跳过、错后答对进入复习的既有逻辑；提供一般课程复习链接 | 不声称现有随机题池支持两个专项训练；结果未保存错误类别，故不伪造针对错误的自动推荐 |

教育部网页在浏览工具中无法打开时，用正常证书校验的 `curl` 读取了《汉语拼音的教学特色》正文。拼写规则使用可直接访问的高校教学资料交叉核对，没有将无法提取的图片当作已读文本。

## 有限题库检查与待办

- 本次有限文字检查：既有 `c-白`（bái）、`c-包`（bāo）、`c-太`（tài）、`c-月`（yuè）、`c-学`（xué）、`c-雪`（xuě）；对应声母、ü 行拼写与现有课程无矛盾，未发现足以修正的数据错误，保留数据。
- 新小练习独立于游戏题池，不伪造题库 ID。`女/去` 用于课程讲解，即使现有随机池没有它们，也不宣称可定向练习。
- 词语消除全部120词、成语接龙36环节、每日成语库：本轮未做全面人工或逐条权威词典审校。已有自动数据检查不能代替该工作。
- 音频仅复用现有发音接口及本地资源/系统语音回退。需要听辨者核对送气差别、音节、声调及回退语音后，才能将音频专项标为通过。

## 工程证据

- `npm run typecheck`：通过（2026-10-13）。
- `npx tsx --test tests/pinyinQuiz.test.ts tests/pinyinAudio.test.ts tests/poetryPinyin.test.ts`：13/13通过，覆盖字母/声调判定、跳过/回看及既有诗词注音一致性。
- 主任务最终构建与 release:verify 通过；无 JavaScript 的新增场景样例和五首诗学习正文可读。最终专项24项E2E通过，另有双语双端16个新页面状态检查与截图核对；PDF/PNG和打印文档生成通过，系统打印对话框/实体打印未验证。
- 新增学习文件 ESLint：通过；5首诗的选字均存在于对应原文，推荐 slug 均有效。
- 12个新增示例的本地 MP3 路径均存在：`ba1/pa1/da1/ta1/ge1/ke1/nv3/lv4/ju1/qu4/xu1/yu2`；未据此宣称录音音质或发音已通过听辨。
- 新增浏览器用例 `tests/e2e/learning-guides.spec.ts`：覆盖桌面/手机答案展开与选字导入、两个小练习错误/正确/重置、英文解释与汉字保留，已在最终静态构建全部通过。

- 拼音快答复习题新增按题目 ID 生成反馈草稿的入口；正文、来源事实和题库数据未因此变更。
