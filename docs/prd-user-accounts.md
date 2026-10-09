# PRD：用户账号与内容收藏

- 状态：规划稿 v0.1（2026-10-10），待评审
- 范围：账号注册/登录（邮箱、Google）、跨设备内容收藏、本地数据迁移
- 不在本期：学习进度云同步、付费、社交分享、后台管理、手机号登录

## 1. 背景与问题

汉字网目前是「无需账号、纯静态」的工具站：Next.js `output: "export"` 导出到 `out/`，由 Cloudflare 托管，没有服务端、数据库和环境变量。用户数据全部落在浏览器 localStorage：

| 数据 | 存储键 | 现状 |
| --- | --- | --- |
| 诗词收藏 | `hanzis-poetry-favorites-v1` | 仅诗词；换设备、清缓存即丢失 |
| 字帖设置 | `hanzis-worksheet-settings` | 可通过链接导入分享 |
| 六款游戏进度 | `hanzis-games-*-v1` | 仅本机 |
| 诗词拼音开关 | `hanzis-poetry-show-pinyin-v1` | 偏好 |

带来的问题：

1. 收藏不能跨设备（手机查字、电脑打印字帖是典型场景）。
2. 只有诗词可收藏；字、词、成语、笔顺这些高频查询对象没有「存下来」的入口。
3. 浏览器清理站点数据即全部丢失，用户没有找回方式。
4. 没有身份，后续任何个性化（复习清单、学习进度、字帖模板）都无从落地。

## 2. 目标与成功指标

目标：在不破坏「免登录可用全部功能」的前提下，提供可选的账号体系，让收藏跨设备持久保存。

| 指标 | 目标值（上线 60 天） |
| --- | --- |
| 注册转化率（点击登录入口 → 完成登录） | ≥ 40% |
| 登录用户 7 日留存 | ≥ 25% |
| 登录用户人均收藏数 | ≥ 5 |
| 本地收藏成功迁移比例（有本地收藏且登录的用户） | ≥ 90% |
| 邮箱验证码送达 P95 | ≤ 60 秒 |
| 登录相关接口错误率 | < 0.5% |
| 非登录用户现有功能回归 | 0 |

## 3. 用户与场景

- 家长/教师：手机上查生字和诗词存起来，回家在电脑生成字帖打印。
- 中小学生：收藏学过的成语、诗词，游戏里出现的生词存到「待复习」。
- 中文学习者（海外）：Google 一键登录，收藏字词与笔顺。
- 匿名用户：不登录，一切如旧；本地收藏继续可用。

## 4. 核心原则

1. 账号完全可选：所有现有功能对匿名用户保持不变，登录只解锁「云端保存」。
2. 大陆与海外同时可用：Google 在大陆不可达，邮箱登录必须是第一主路径，Google 为补充。
3. 最少数据：只收集邮箱（或 Google 返回的邮箱与头像），不收集姓名、手机号、年龄。
4. 不引入密码：使用邮箱验证码 + 第三方 OAuth，避免密码存储、找回、泄露撞库的整条风险链。
5. 隐私承诺要同步改：隐私页「不需要账号」「只保存在本机」的表述须在上线同一发布中更新。

## 5. 功能需求

### 5.1 账号（P0）

**F1 邮箱验证码登录/注册**
- 入口：顶部导航「登录」按钮；收藏按钮未登录点击时的引导弹层；`/login/` 独立页。
- 流程：输入邮箱 → 发送 6 位验证码（10 分钟有效，单码一次性）→ 输入验证码 → 首次视为注册，创建账号并登录。
- 频控：同一邮箱 60 秒内只发一次，1 小时 ≤ 5 次；同一 IP 1 小时 ≤ 20 次；连续输错 5 次作废该验证码。
- 人机验证：发送验证码前过 Cloudflare Turnstile（与托管栈一致，无额外供应商）。
- 邮件：发件域 `hanzis.com`，配置 SPF/DKIM/DMARC；中文模板，含验证码、有效期、「非本人操作可忽略」。

**F2 Google 登录**
- OAuth 2.0 Authorization Code + PKCE，`state` 防 CSRF，只申请 `openid email profile`。
- 回调地址：`https://hanzis.com/api/auth/google/callback`。
- 账号合并规则：Google 返回的邮箱已 `email_verified` 且与现有邮箱账号相同 → 自动绑定到同一用户；未验证 → 拒绝自动合并，走邮箱验证码。
- 大陆网络下 Google 按钮保留但在失败时给出明确提示：「当前网络无法连接 Google，请使用邮箱登录」。

**F3 会话**
- 服务端会话（随机 token 哈希存库），HttpOnly + Secure + SameSite=Lax Cookie，有效期 30 天，每次活跃滑动续期。
- 支持「退出当前设备」和「退出全部设备」。
- 账号页 `/account/` 显示邮箱、登录方式、已绑定 Google、会话列表（设备/最近活跃）。

**F4 注销账号**
- 账号页提供注销；二次确认后立即软删（匿名化邮箱），7 天后硬删全部收藏与会话。注销期间同邮箱重新登录可撤销。

### 5.2 内容收藏（P0）

**F5 可收藏对象**

| 类型 `type` | 标识 `target_id` | 入口页面 | 现有标识可直接复用 |
| --- | --- | --- | --- |
| `poem` | 诗词 slug（含 `haitang-*`） | `/poetry/[slug]/`、诗词列表卡片 | 是，与 `poetryFavorites.ts` 一致 |
| `char` | 单字（1 个 Unicode 字符） | `/dictionary/` 字详情、`/stroke/` | 是 |
| `word` | 词语原文 | `/dictionary/` 词语详情 | 是 |
| `idiom` | 成语原文 | 字典、成语接龙、每日成语 | 是 |
| `worksheet` | 字帖配置序列化串（已有链接导入格式） | `/` 字帖生成器 | 是（P1 再做，见下） |

- 服务端校验 `target_id` 合法性：诗词 slug 存在于构建产物清单；`char` 必须是单个 CJK 字符；`word`/`idiom` 长度 1–16 且仅含 CJK；`worksheet` 走现有 `restoreWorksheetSettings` 校验。
- 每用户收藏上限 2,000 条；超限提示而非静默丢弃。

**F6 收藏交互**
- 统一的「收藏/已收藏」按钮组件，复用现有诗词收藏的星形样式与 44px 触控区；乐观更新，失败回滚并 toast。
- 未登录点击：立即写入本地（行为与现在一致），同时在按钮旁出现一次性轻提示「登录后可跨设备保存」，不弹窗打断。
- 已登录：写云端，同时写本地作为缓存，离线时排队、恢复后重放。

**F7 我的收藏 `/me/favorites/`**
- 按类型分组 Tab：诗词 / 汉字 / 词语 / 成语（/ 字帖）。
- 每条支持：跳转详情、取消收藏、「生成字帖」（字/词/诗词已有该能力的直接复用 `PoemWorksheetAction` 模式）。
- 支持多选 → 一键生成字帖，这是本功能对现有核心价值（字帖）的直接增强。
- 排序：默认按收藏时间倒序。

**F8 本地收藏迁移**
- 用户首次登录时，若本地存在 `hanzis-poetry-favorites-v1`，弹一次确认：「检测到本机 N 条诗词收藏，是否合并到账号？」默认合并，去重。
- 迁移成功后本地键保留为缓存，不删除；迁移失败不阻断登录，稍后在收藏页顶部可重试。
- 新类型（字、词、成语）从本期起本地也按统一结构存 `hanzis-favorites-v2`，便于后续登录迁移。

### 5.3 导航与页面改动（P0）

- `components/layout` 顶栏：右侧新增登录按钮 / 头像菜单（我的收藏、账号设置、退出）。
- 新增路由：`/login/`、`/account/`、`/me/favorites/`。静态导出下这些页面是客户端渲染壳，数据由 API 拉取；`sitemap.ts` 与 `robots.ts` 排除 `/me/`、`/account/`，`/login/` 保留可索引但 `noindex` 更稳妥。
- 隐私页：新增「账号与云端收藏」卡片，修改「不需要账号」「只保存在本机」措辞；README 同步。

### 5.4 P1（本期评审通过后排期，不阻塞 P0 上线）

- 字帖配置收藏（`worksheet` 类型）与「我的字帖模板」。
- 游戏「待复习清单」接入收藏（`hanzi-match` 已有本地待复习结构）。
- 魔法链接登录（邮件中一键链接），作为验证码的补充。

### 5.5 明确不做

- 密码登录、手机号登录、微信登录（后两者需要企业主体与 ICP 备案条件，另立项评估）。
- 游戏进度云同步（数据结构各异，另行 PRD）。
- 用户昵称、头像上传、公开主页、关注等社交能力。

## 6. 技术方案

### 6.1 架构选型

约束：保持前端静态导出不变；复用 Cloudflare 托管；首发零运维成本；同源 Cookie 以免跨域与 CSP 改动。

| 方案 | 优点 | 代价 | 结论 |
| --- | --- | --- | --- |
| A. Cloudflare Pages Functions（`functions/api/**`）+ D1 + KV | 同源 `/api/*`，`connect-src 'self'` 不改；与现有托管一体；D1 免费额度足够首发 | 要自写验证码、OAuth、会话逻辑（约 600–900 行） | **推荐** |
| B. 独立 Worker `api.hanzis.com` | 前后端解耦清晰 | 需 CORS、跨站 Cookie（SameSite=None）、CSP 加域名，复杂度高于收益 | 备选 |
| C. Supabase / Firebase Auth | 邮箱 OTP 与 Google 开箱即用 | 引入第二家供应商与数据出境问题；CSP 与隐私说明都要加第三方；大陆访问质量不稳定 | 不采用 |

鉴于项目明确「仅一个主要类型/文件」「非生成代码 ≤ 800 行」的约束，方案 A 的后端按 `functions/api/auth/*.ts`、`functions/api/favorites.ts`、`functions/_lib/{db,session,mail,rate-limit}.ts` 拆分。

### 6.2 组件

- 运行时：Pages Functions（Workers 运行时），TypeScript。
- 数据库：D1（SQLite）。
- 验证码与频控：KV（TTL 天然匹配）。
- 邮件：Cloudflare Email Service 优先（同栈）；若其发送能力在实施时不可用，回退 Resend。实施前核实当前可用性与免费额度。
- 人机验证：Turnstile。
- 密钥：`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`TURNSTILE_SECRET`、`SESSION_PEPPER`、邮件服务凭据，全部走 Pages 环境变量；**这是项目首次引入必填环境变量，`DEPLOYMENT.md` 要更新**。

### 6.3 数据模型（D1）

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- ULID
  email TEXT UNIQUE,                -- 小写规范化；注销后置为 'deleted:<id>'
  email_verified_at INTEGER,
  avatar_url TEXT,
  created_at INTEGER NOT NULL,
  deleted_at INTEGER                -- 软删时间，7 天后硬删
);

CREATE TABLE oauth_accounts (
  provider TEXT NOT NULL,           -- 'google'
  provider_user_id TEXT NOT NULL,   -- Google sub
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (provider, provider_user_id)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,              -- token 的 SHA-256
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  ua TEXT, ip_hash TEXT
);
CREATE INDEX sessions_user ON sessions(user_id);

CREATE TABLE favorites (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('poem','char','word','idiom','worksheet')),
  target_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, type, target_id)
);
CREATE INDEX favorites_user_time ON favorites(user_id, created_at DESC);
```

验证码不进 D1：KV 键 `otp:<email>` 存 `{codeHash, attempts, expiresAt}`，TTL 600 秒；频控键 `rl:otp:email:<email>`、`rl:otp:ip:<ipHash>`。

### 6.4 API

全部同源 `/api/*`，JSON，错误体 `{ error: { code, message } }`，写操作校验 `Origin`。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/email/send` | `{email, turnstileToken}` → 发送验证码；无论邮箱是否存在都返回 200（防枚举） |
| POST | `/api/auth/email/verify` | `{email, code}` → 建会话，Set-Cookie；返回 `{user, isNew}` |
| GET | `/api/auth/google/start` | 生成 state/PKCE 存 KV，302 到 Google |
| GET | `/api/auth/google/callback` | 换 token，校验 `id_token`，绑定/创建用户，302 回 `redirect`（仅允许站内路径） |
| GET | `/api/auth/me` | 当前用户或 401 |
| POST | `/api/auth/logout` | `{all?: boolean}` |
| DELETE | `/api/auth/account` | 软删 |
| GET | `/api/favorites` | `?type=&cursor=&limit=` 游标分页 |
| PUT | `/api/favorites` | `{type, target_id}` 幂等新增 |
| DELETE | `/api/favorites` | `{type, target_id}` |
| POST | `/api/favorites/import` | `{items: [{type, target_id}]}` 批量去重导入（≤ 500 条/次），用于本地迁移 |

### 6.5 前端

- 新增 `lib/auth/` ：`useSession()`（`useSyncExternalStore`，与现有本地 store 风格一致）、API 客户端。
- `lib/favorites.ts` 取代 `poetryFavorites.ts` 的角色：统一本地 v2 结构 + 云端同步 + 离线队列；`usePoetryFavorites` 保留为薄封装，调用方不改。
- 新增 `components/account/`：`LoginDialog`、`EmailCodeForm`、`GoogleButton`、`UserMenu`、`FavoriteButton`、`FavoritesList`。
- 静态导出不变；`/login/`、`/account/`、`/me/favorites/` 为客户端页面。
- `public/_headers`：`/me/*`、`/account/*`、`/login/*` 加 `X-Robots-Tag: noindex`；CSP 的 `script-src`/`frame-src` 需加 Turnstile 域（`https://challenges.cloudflare.com`），其余不变。

## 7. 安全与合规

- 验证码：6 位数字、服务端哈希比对、一次性、10 分钟、5 次错误作废；响应时间恒定，不泄露邮箱是否注册。
- 会话：仅存 token 哈希，Cookie HttpOnly/Secure/SameSite=Lax；登录成功时轮换会话 ID。
- OAuth：校验 `state`、`nonce`、`aud`、`iss`、`exp`，仅信任 `email_verified=true`。
- 写接口校验 `Origin` 与站点一致；所有输入走白名单校验，`target_id` 规则见 F5。
- 频控与 Turnstile 覆盖所有发信接口；D1 查询全部参数化。
- 日志：不记录邮箱明文与验证码；IP 只存哈希，保存 30 天。
- 未成年人：站点面向中小学生，注册页加「13 岁以下请在监护人陪同下使用」提示；不做年龄验证（无法可靠执行），但不采集年龄以外任何额外信息。
- 数据主体权利：账号页可导出收藏 JSON、可注销（F4）。
- 隐私页更新清单：账号数据项、存储位置（Cloudflare 数据中心，说明数据可能位于境外）、Google 登录数据流、邮件服务商、保留期限、注销方式。

## 8. 对现有系统的影响

| 影响面 | 说明 | 处理 |
| --- | --- | --- |
| 「无需账号」定位 | README、隐私页、About 页多处陈述 | 改为「无需账号即可使用全部功能，登录可跨设备保存收藏」 |
| 部署流程 | 首次引入环境变量、D1 绑定、KV 绑定、迁移脚本 | `DEPLOYMENT.md` 增补；`wrangler.toml` 入库 |
| 发布校验 | `release:verify` 只校验静态文件 | 增加 `/api/auth/me` 401 冒烟与 D1 迁移版本检查 |
| CSP | 加 Turnstile 域 | `_headers` 调整并在 preview 脚本中同步 |
| 测试 | 当前无服务端测试 | 新增 Functions 单测（Miniflare）与 Playwright 登录/收藏 E2E |
| 广告 | 无直接冲突 | 登录页不放广告 |

## 9. 里程碑

| 阶段 | 内容 | 预估 |
| --- | --- | --- |
| M0 评审 | 本 PRD 决策点确认（见第 10 节） | 1 周 |
| M1 后端基础 | D1 schema、会话、邮箱验证码、Turnstile、频控、单测 | 1.5 周 |
| M2 Google 登录 | OAuth 流程、账号合并、Google Cloud 项目与同意屏幕审核 | 1 周（审核时间外部不可控） |
| M3 收藏 | 收藏 API、统一本地 v2、收藏按钮接入四类页面、我的收藏页、迁移弹层 | 2 周 |
| M4 文档与合规 | 隐私页、README、DEPLOYMENT、邮件域名 SPF/DKIM、E2E | 0.5 周 |
| M5 灰度 | 预发环境验证 → 生产上线，监控指标 | 1 周 |

## 10. 待决策事项

1. 登录方式：本 PRD 推荐「邮箱验证码 + Google，不做密码」。若产品要求传统邮箱+密码，需补密码策略、找回流程与泄露检测，工期 +1 周。
2. 收藏范围：P0 是否包含 `char/word/idiom` 三类，还是先只把诗词收藏上云？推荐包含，因为四类共用一套 API 与组件，边际成本低。
3. 邮件服务商：Cloudflare Email Service 与 Resend 二选一，实施前核实可用性、额度与大陆送达率（QQ/163 邮箱）。
4. 数据驻留：Cloudflare D1 不保证数据位于中国大陆；若有合规要求需另选方案或在隐私页明确告知。
5. Google Cloud 项目所有权与 OAuth 同意屏幕的主体信息（需要公开的隐私政策 URL，与第 7 节隐私页改动联动）。
6. 匿名用户的本地收藏是否永久保留为「无账号模式」？推荐保留，这是「账号可选」原则的落点。

## 11. 风险

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| 大陆邮箱（QQ/163）对海外发件域名的拦截 | 验证码送达率低，直接影响注册 | 域名预热、SPF/DKIM/DMARC 全配、监控送达率，必要时启用国内邮件通道 |
| Google OAuth 同意屏幕审核延迟 | M2 延期 | 先以「测试模式」内测，审核并行 |
| 静态导出 + Functions 的本地开发体验 | 开发调试成本 | `wrangler pages dev out/` 作为本地集成环境写进 README |
| 验证码接口被刷 | 邮件费用与域名信誉 | Turnstile + 双维度频控 + 异常告警 |
| 隐私承诺变更引起用户疑虑 | 信任 | 更新日志透明说明；匿名模式零改变 |
