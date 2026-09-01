#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
拼音音频下载脚本
从 http://yinjie.hanyupinyin.cn/ 下载所有拼音音节的 MP3 音频文件
"""

import os
import requests
import time
from typing import List, Set

# 音频文件基础URL
BASE_URL = "http://yinjie.hanyupinyin.cn/duyinjie/"

# 输出目录
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "voice")

# 完整的拼音音节表 (根据网站拼音表整理)
PINYIN_SYLLABLES = [
    # 单韵母 (6个)
    "a", "o", "e", "i", "u", "v",  # v 代表 ü

    # 复韵母 (9个)
    "ai", "ei", "ui", "ao", "ou", "iu", "ie", "ve", "er",  # ve 代表 üe

    # 前鼻韵母 (5个)
    "an", "en", "in", "un", "vn",  # vn 代表 ün

    # 后鼻韵母 (4个)
    "ang", "eng", "ing", "ong",

    # b 开头
    "ba", "bo", "bi", "bu", "bai", "bei", "bao", "bie", "ban", "ben", "bin", "bang", "beng", "bing", "bian", "biao",

    # p 开头
    "pa", "po", "pi", "pu", "pai", "pei", "pao", "pou", "pie", "pan", "pen", "pin", "pang", "peng", "ping", "pian", "piao",

    # m 开头
    "ma", "mo", "me", "mi", "mu", "mai", "mei", "mao", "mou", "miu", "mie", "man", "men", "min", "mang", "meng", "ming", "mian", "miao",

    # f 开头
    "fa", "fo", "fu", "fei", "fou", "fan", "fen", "fang", "feng",

    # d 开头
    "da", "de", "di", "du", "dai", "dei", "dui", "dao", "dou", "diu", "die", "dan", "den", "dun", "dang", "deng", "ding", "dong", "dia", "dian", "diao", "duan", "duo",

    # t 开头
    "ta", "te", "ti", "tu", "tai", "tui", "tao", "tou", "tie", "tan", "tun", "tang", "teng", "ting", "tong", "tian", "tiao", "tuan", "tuo",

    # n 开头
    "na", "ne", "ni", "nu", "nv", "nai", "nei", "nao", "nou", "niu", "nie", "nve", "nan", "nen", "nin", "nang", "neng", "ning", "nong", "nian", "niang", "niao", "nuan", "nuo",

    # l 开头
    "la", "lo", "le", "li", "lu", "lv", "lai", "lei", "lao", "lou", "liu", "lie", "lve", "lan", "lin", "lun", "lang", "leng", "ling", "long", "lia", "lian", "liang", "liao", "luan", "luo",

    # g 开头
    "ga", "ge", "gu", "gai", "gei", "gui", "gao", "gou", "gan", "gen", "gun", "gang", "geng", "gong", "gua", "guai", "guan", "guang", "guo",

    # k 开头
    "ka", "ke", "ku", "kai", "kei", "kui", "kao", "kou", "kan", "ken", "kun", "kang", "keng", "kong", "kua", "kuai", "kuan", "kuang", "kuo",

    # h 开头
    "ha", "he", "hu", "hai", "hei", "hui", "hao", "hou", "han", "hen", "hun", "hang", "heng", "hong", "hua", "huai", "huan", "huang", "huo",

    # j 开头
    "ji", "ju", "jiu", "jie", "jue", "jin", "jun", "jing", "jia", "jian", "jiang", "jiao", "jiong", "juan",

    # q 开头
    "qi", "qu", "qiu", "qie", "que", "qin", "qun", "qing", "qia", "qian", "qiang", "qiao", "qiong", "quan",

    # x 开头
    "xi", "xu", "xiu", "xie", "xue", "xin", "xun", "xing", "xia", "xian", "xiang", "xiao", "xiong", "xuan",

    # zh 开头
    "zha", "zhe", "zhi", "zhu", "zhai", "zhei", "zhui", "zhao", "zhou", "zhan", "zhen", "zhun", "zhang", "zheng", "zhong", "zhua", "zhuai", "zhuan", "zhuang", "zhuo",

    # ch 开头
    "cha", "che", "chi", "chu", "chai", "chui", "chao", "chou", "chan", "chen", "chun", "chang", "cheng", "chong", "chua", "chuai", "chuan", "chuang", "chuo",

    # sh 开头
    "sha", "she", "shi", "shu", "shai", "shei", "shui", "shao", "shou", "shan", "shen", "shun", "shang", "sheng", "shua", "shuai", "shuan", "shuang", "shuo",

    # r 开头
    "re", "ri", "ru", "rui", "rao", "rou", "ran", "ren", "run", "rang", "reng", "rong", "rua", "ruan", "ruo",

    # z 开头
    "za", "ze", "zi", "zu", "zai", "zei", "zui", "zao", "zou", "zan", "zen", "zun", "zang", "zeng", "zong", "zuan", "zuo",

    # c 开头
    "ca", "ce", "ci", "cu", "cai", "cui", "cao", "cou", "can", "cen", "cun", "cang", "ceng", "cong", "cuan", "cuo",

    # s 开头
    "sa", "se", "si", "su", "sai", "sui", "sao", "sou", "san", "sen", "sun", "sang", "seng", "song", "suan", "suo",

    # y 开头
    "ya", "yo", "ye", "yi", "yu", "yao", "you", "yue", "yan", "yin", "yun", "yang", "ying", "yong", "yuan",

    # w 开头
    "wa", "wo", "wu", "wai", "wei", "wan", "wen", "wang", "weng",
]

# 声调数量 (1-4声)
TONES = [1, 2, 3, 4]


def download_audio(syllable: str, tone: int, output_dir: str) -> bool:
    """
    下载单个音频文件

    Args:
        syllable: 拼音音节
        tone: 声调 (1-4)
        output_dir: 输出目录

    Returns:
        是否下载成功
    """
    filename = f"{syllable}{tone}.mp3"
    url = f"{BASE_URL}{filename}"
    output_path = os.path.join(output_dir, filename)

    # 如果文件已存在且大小大于0，跳过
    if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
        print(f"[跳过] {filename} 已存在")
        return True

    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            # 检查是否是有效的MP3文件 (至少要有一定大小)
            if len(response.content) > 1000:
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                print(f"[成功] {filename}")
                return True
            else:
                print(f"[警告] {filename} 文件太小，可能无效")
                return False
        else:
            print(f"[失败] {filename} - HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"[错误] {filename} - {str(e)}")
        return False


def main():
    """主函数"""
    # 确保输出目录存在
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"音频文件将保存到: {OUTPUT_DIR}")
    print(f"共 {len(PINYIN_SYLLABLES)} 个音节，每个 {len(TONES)} 个声调")
    print(f"预计下载 {len(PINYIN_SYLLABLES) * len(TONES)} 个文件")
    print("-" * 50)

    success_count = 0
    fail_count = 0
    failed_files: List[str] = []

    for syllable in PINYIN_SYLLABLES:
        for tone in TONES:
            if download_audio(syllable, tone, OUTPUT_DIR):
                success_count += 1
            else:
                fail_count += 1
                failed_files.append(f"{syllable}{tone}.mp3")
            # 添加小延迟避免请求过快
            time.sleep(0.1)

    print("-" * 50)
    print(f"下载完成！成功: {success_count}, 失败: {fail_count}")

    if failed_files:
        print("\n失败的文件:")
        for f in failed_files:
            print(f"  - {f}")


if __name__ == "__main__":
    main()
