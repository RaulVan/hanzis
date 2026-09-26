export interface ChengyuEntry {
  text: string;
  meaning: string;
  example: string;
}

export interface ChengyuChain {
  id: string;
  difficulty: "beginner" | "intermediate";
  idioms: readonly ChengyuEntry[];
}

export const CHENGYU_CHAIN_SOURCE = "汉字网编写";
export const CHENGYU_CHAIN_REVIEW_STATUS = "unreviewed" as const;
export const CHENGYU_CHAIN_CONTENT_VERSION = 1;

/** Fixed 6-idiom chains: each idiom's last character is the next idiom's first. */
export const chengyuChains: readonly ChengyuChain[] = [
  {
    id: "shou-zhu",
    difficulty: "beginner",
    idioms: [
      { text: "守株待兔", meaning: "死守着偶然的机会，希望再碰上同样的好运。", example: "他不肯换个办法，只盼着上次的运气再来一次。" },
      { text: "兔死狐悲", meaning: "看到同类遭遇不幸，自己也感到悲伤。", example: "看到同伴倒下，它也跟着难过起来。" },
      { text: "悲欢离合", meaning: "人生中的悲伤、欢乐、分别和相聚。", example: "故事里写满了人生的各种遭遇。" },
      { text: "合二为一", meaning: "把两部分合成一个整体。", example: "两支队伍合并成了一支。" },
      { text: "一马当先", meaning: "走在最前面，起带头作用。", example: "比赛一开始，她就冲到了最前面。" },
      { text: "先见之明", meaning: "事先看清事情的发展。", example: "他早就料到会下雨，所以带了伞。" },
    ],
  },
  {
    id: "hua-she",
    difficulty: "beginner",
    idioms: [
      { text: "画蛇添足", meaning: "做了多余的事，反而把事情弄糟。", example: "事情已经做好了，多加的那一笔反而帮了倒忙。" },
      { text: "足智多谋", meaning: "主意很多，善于想办法。", example: "遇到难题，她总有办法。" },
      { text: "谋事在人", meaning: "计划事情要靠人的努力。", example: "能不能办成，先看大家肯不肯努力。" },
      { text: "人山人海", meaning: "人非常多。", example: "节日的广场上挤满了人。" },
      { text: "海阔天空", meaning: "空间广阔，也指想法不受拘束。", example: "他们顺着话题，越聊越远。" },
      { text: "空前绝后", meaning: "以前没有过，以后也难再有。", example: "这样的场面，以前没见过，以后也难再遇。" },
    ],
  },
  {
    id: "yi-xin",
    difficulty: "beginner",
    idioms: [
      { text: "一心一意", meaning: "心思专一，没有别的念头。", example: "她把心思都放在练字上。" },
      { text: "意味深长", meaning: "含着的意思耐人寻味。", example: "老师最后那句话，值得好好想想。" },
      { text: "长驱直入", meaning: "毫无阻挡地一路向前。", example: "队伍一路向前，没有遇到阻挡。" },
      { text: "入木三分", meaning: "形容见解或刻画非常深刻。", example: "这幅画把人物的神情刻画得很深。" },
      { text: "分秒必争", meaning: "极短的时间也不放过。", example: "离出发只有一会儿，大家都抓紧时间。" },
      { text: "争先恐后", meaning: "抢着向前，生怕落在后面。", example: "门一开，大家抢着往里走。" },
    ],
  },
  {
    id: "wo-xin",
    difficulty: "intermediate",
    idioms: [
      { text: "卧薪尝胆", meaning: "忍受艰苦，立志雪耻。", example: "他吃了苦头，决心把失去的夺回来。" },
      { text: "胆大心细", meaning: "做事勇敢，同时考虑周密。", example: "做实验既要敢试，也要把步骤核对清楚。" },
      { text: "细水长流", meaning: "一点一点地持续下去。", example: "零花钱每月省下一点，日子就宽裕了。" },
      { text: "流连忘返", meaning: "留恋得忘记了回去。", example: "风景太美，大家都不想回家。" },
      { text: "返老还童", meaning: "老年人恢复了青春的活力。", example: "爷爷跳起舞来，又有了年轻人的精神。" },
      { text: "童言无忌", meaning: "孩子说话不必避讳。", example: "小朋友怎么想就怎么说，不必苛责。" },
    ],
  },
  {
    id: "ye-gong",
    difficulty: "intermediate",
    idioms: [
      { text: "叶公好龙", meaning: "嘴上喜欢，真正见到却害怕。", example: "他嘴上说喜欢，真见到了却吓得躲开。" },
      { text: "龙马精神", meaning: "精力旺盛。", example: "爷爷年纪大了，做事还是那么有劲。" },
      { text: "神采飞扬", meaning: "精神饱满，神情焕发。", example: "赢了比赛，她整个人都亮了起来。" },
      { text: "扬长而去", meaning: "丢下别人，大步离开。", example: "他没打招呼，就大步走了。" },
      { text: "去伪存真", meaning: "去掉虚假的，留下真实的。", example: "把不可靠的说法去掉，留下经得起核对的部分。" },
      { text: "真知灼见", meaning: "正确而透彻的见解。", example: "这篇文章把问题看得又准又透。" },
    ],
  },
  {
    id: "di-shui",
    difficulty: "intermediate",
    idioms: [
      { text: "滴水穿石", meaning: "坚持不懈，就能办成难事。", example: "每天坚持练几个字，日子久了就有成绩。" },
      { text: "石破天惊", meaning: "出人意料，使人震惊。", example: "这个消息一出来，大家都愣住了。" },
      { text: "惊天动地", meaning: "声势或影响极大。", example: "那一声巨响，整座山谷都跟着震了一下。" },
      { text: "地大物博", meaning: "土地广大，物产丰富。", example: "这个国家土地广大，出产也多。" },
      { text: "博古通今", meaning: "对古代和现代的事情都了解。", example: "她对过去和现在的事情都说得清楚。" },
      { text: "今非昔比", meaning: "现在已经不是过去的样子了。", example: "小镇修了铁路，样子和从前大不一样。" },
    ],
  },
];
