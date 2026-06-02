import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'poets.db')

POETS_DATA = [
    {
        "pinyin_id": "beidao",
        "name": "北岛",
        "era": "朦胧诗派 · 1980年代",
        "avatar_emoji": "🌓",
        "traits": ["理性冷峻", "政治隐喻", "怀疑精神", "词语的刀刃"],
        "description": "你是北岛式的清醒者。在词语的冰层下潜行，用理性的刀锋划开时代的迷雾。你不信任宏大的抒情，更偏爱精确如手术刀的语言——每一行诗都是对世界的质询。你的内心有一片冷峻的星空，在黑暗中执着地寻找词语的微光。",
        "representative_poem": "卑鄙是卑鄙者的通行证，\n高尚是高尚者的墓志铭。",
        "keywords": ["回答", "宣告", "一切", "结局", "迷途", "影子", "界限", "沉默", "见证", "废墟"]
    },
    {
        "pinyin_id": "gucheng",
        "name": "顾城",
        "era": "朦胧诗派 · 1980年代",
        "avatar_emoji": "👒",
        "traits": ["童话诗人", "纯粹敏感", "自然之子", "梦幻与孤独"],
        "description": "你拥有顾城式的童话眼睛。世界在你眼中是一颗露珠、一片羽毛、一个未完成的梦。你渴望用孩子的语言对抗成人世界的浑浊，在诗歌中建造属于自己的理想国。你的敏感是天赋也是宿命，在黑夜里依然固执地画着太阳。",
        "representative_poem": "黑夜给了我黑色的眼睛，\n我却用它寻找光明。",
        "keywords": ["童话", "孩子", "眼睛", "梦", "花朵", "露珠", "羽毛", "星星", "小草", "城堡", "帽子"]
    },
    {
        "pinyin_id": "haizi",
        "name": "海子",
        "era": "后朦胧诗 · 1980年代",
        "avatar_emoji": "🌾",
        "traits": ["麦田守望者", "太阳之子", "激情燃烧", "神性追寻"],
        "description": "你是海子式的赤子。灵魂中燃烧着麦田、太阳和马匹的意象。你以全部的生命热情投入诗歌，拒绝平庸与妥协。你渴望在词语中触摸神圣，在麦浪间听见永恒的回声。你的诗歌是血液写成的，每一行都滚烫如烈日。",
        "representative_poem": "从明天起，做一个幸福的人\n喂马、劈柴，周游世界。",
        "keywords": ["麦田", "太阳", "马", "春天", "幸福", "劈柴", "面朝大海", "花开", "村庄", "远方", "王位"]
    },
    {
        "pinyin_id": "shuting",
        "name": "舒婷",
        "era": "朦胧诗派 · 1980年代",
        "avatar_emoji": "🌺",
        "traits": ["温柔坚韧", "女性视角", "爱与信念", "抒情深沉"],
        "description": "你是舒婷式的温柔力量。在柔软中蕴藏坚韧，在抒情中寄托信念。你相信爱是穿越黑夜的力量，也相信个体的尊严如橡树般挺拔。你的诗句如月光下的海潮，看似平静却蕴含着深沉的涌动。",
        "representative_poem": "与其在悬崖上展览千年，\n不如在爱人肩头痛哭一晚。",
        "keywords": ["爱", "信念", "月光", "海", "橡树", "木棉", "土地", "祖国", "母亲", "温柔", "坚守"]
    },
    {
        "pinyin_id": "xichuan",
        "name": "西川",
        "era": "学院派 · 1990年代至今",
        "avatar_emoji": "📚",
        "traits": ["智性典雅", "博学深邃", "学院精神", "东西融合"],
        "description": "你是西川式的智者。在书斋与旷野之间穿梭，将东方的诗意与西方的思辨融于一炉。你的诗歌建筑般严谨而壮丽，每一个意象都经过深思熟虑。你不追求瞬间的炫目，而致力于建造经得起时间考验的词语殿堂。",
        "representative_poem": "有一种神秘你无法驾驭，\n你只能充当旁观者的角色。",
        "keywords": ["知识", "远方", "致敬", "经典", "星空", "史诗", "智者", "巨兽", "图书馆", "视野", "深度"]
    },
    {
        "pinyin_id": "yujian",
        "name": "于坚",
        "era": "口语诗派 · 1990年代至今",
        "avatar_emoji": "🪨",
        "traits": ["日常神性", "口语反讽", "生活质感", "拒绝修饰"],
        "description": "你在于坚式的日常中发现了诗意。你拒绝华丽的修辞，相信一块砖头、一碗米饭、一趟公交车里藏着最真实的诗歌。你用平实如说话的语言写作，在看似平淡的叙述中暗藏锐利的洞察与温柔的幽默。",
        "representative_poem": "我看见日常生活的背后，\n站着神。",
        "keywords": ["日常", "街巷", "公交", "菜市场", "砖头", "米饭", "平凡", "生活", "口语", "真实", "零度"]
    },
    {
        "pinyin_id": "handong",
        "name": "韩东",
        "era": "口语诗派 · 1990年代至今",
        "avatar_emoji": "🧊",
        "traits": ["冷静克制", "去浪漫化", "简洁有力", "反讽精准"],
        "description": "你是韩东式的冷眼观察者。用最简洁的语言剥去事物的外衣，拒绝一切浮夸的抒情。你的诗歌像一把精准的手术刀，切开生活的表皮，露出令人心惊的真相。在冷静的表象下，藏着对世界深刻的洞察与悲悯。",
        "representative_poem": "有关大雁塔，\n我们又能知道些什么。",
        "keywords": ["冷静", "简洁", "真相", "表皮", "观察", "距离", "克制", "精准", "日常", "反讽", "平淡"]
    },
    {
        "pinyin_id": "zhaiyongming",
        "name": "翟永明",
        "era": "女性诗歌 · 1990年代至今",
        "avatar_emoji": "🌙",
        "traits": ["黑夜意识", "女性力量", "内心探索", "神秘深邃"],
        "description": "你是翟永明式的黑夜探索者。在女性意识的深处开掘诗歌的矿脉，用黑夜的意象承载丰富而复杂的内心世界。你的诗句如暗夜中的河流，表面幽深平静，底部却涌动着强大的生命力和不妥协的自我表达。",
        "representative_poem": "我目睹了这个世界，\n它的黑暗和光明。",
        "keywords": ["黑夜", "女人", "身体", "内心", "暗流", "意识", "觉醒", "深邃", "独立", "房间", "书写"]
    },
    {
        "pinyin_id": "yisha",
        "name": "伊沙",
        "era": "先锋口语 · 1990年代至今",
        "avatar_emoji": "⚡",
        "traits": ["先锋挑衅", "解构权威", "直白大胆", "黑色幽默"],
        "description": "你是伊沙式的叛逆者。用最直白甚至挑衅的语言撕碎诗歌的伪装，在解构中建立属于自己的真实。你不畏惧冒犯，也不追求优雅——你要的是赤裸裸的真相和一击即中的力量。你的诗歌是一记响亮的耳光，也是一声痛快的大笑。",
        "representative_poem": "车过黄河，\n我只想撒尿。",
        "keywords": ["解构", "挑衅", "直白", "幽默", "反叛", "痛快", "真实", "粗粝", "冲击", "颠覆", "先锋"]
    },
    {
        "pinyin_id": "zhangzao",
        "name": "张枣",
        "era": "后朦胧诗 · 1990年代",
        "avatar_emoji": "🎐",
        "traits": ["古典韵味", "精致音乐性", "幽微之美", "镜中幻象"],
        "description": "你是张枣式的古典知音。在现代汉语中复活了唐诗宋词的精魂，每一个字都经过精心的打磨，如镜中花、水中月般精致而幽微。你的诗歌有着优美的音乐性，在轻与重、古典与现代之间找到了完美的平衡。",
        "representative_poem": "只要想起一生中后悔的事，\n梅花便落满了南山。",
        "keywords": ["梅花", "镜中", "南山", "后悔", "古典", "精致", "音乐", "幽微", "轻逸", "镜子", "落花"]
    }
]


def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_database():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS poets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pinyin_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            era TEXT,
            avatar_emoji TEXT,
            traits TEXT,
            description TEXT,
            representative_poem TEXT,
            keywords TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analysis_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            poem_text TEXT,
            result_json TEXT,
            ip_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_analysis_logs_created_at
        ON analysis_logs(created_at)
    """)

    existing = cursor.execute("SELECT COUNT(*) FROM poets").fetchone()[0]
    if existing == 0:
        for poet in POETS_DATA:
            cursor.execute("""
                INSERT INTO poets (pinyin_id, name, era, avatar_emoji, traits, description, representative_poem, keywords)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                poet["pinyin_id"],
                poet["name"],
                poet["era"],
                poet["avatar_emoji"],
                json.dumps(poet["traits"], ensure_ascii=False),
                poet["description"],
                poet["representative_poem"],
                json.dumps(poet["keywords"], ensure_ascii=False)
            ))

    conn.commit()
    conn.close()


def get_all_poets():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM poets").fetchall()
    conn.close()
    result = []
    for row in rows:
        poet = dict(row)
        poet["traits"] = json.loads(poet["traits"])
        poet["keywords"] = json.loads(poet["keywords"])
        result.append(poet)
    return result


def log_analysis(poem_text, result_json, ip_address):
    truncated = poem_text[:500] if poem_text else ""
    conn = get_connection()
    conn.execute(
        "INSERT INTO analysis_logs (poem_text, result_json, ip_address) VALUES (?, ?, ?)",
        (truncated, json.dumps(result_json, ensure_ascii=False), ip_address)
    )
    conn.commit()
    conn.close()


def get_stats():
    conn = get_connection()
    rows = conn.execute("""
        SELECT result_json, created_at FROM analysis_logs
        ORDER BY created_at DESC LIMIT 100
    """).fetchall()
    conn.close()

    poet_count = {}
    for row in rows:
        try:
            data = json.loads(row["result_json"])
            top = data.get("top", {})
            poet_id = top.get("pinyin_id")
            if poet_id:
                poet_count[poet_id] = poet_count.get(poet_id, 0) + 1
        except (json.JSONDecodeError, TypeError):
            continue

    total = sum(poet_count.values()) or 1
    sorted_poets = sorted(poet_count.items(), key=lambda x: -x[1])

    conn2 = get_connection()
    poet_names = {}
    for pid, _ in sorted_poets:
        row = conn2.execute("SELECT name, avatar_emoji FROM poets WHERE pinyin_id=?", (pid,)).fetchone()
        if row:
            poet_names[pid] = {"name": row["name"], "avatar_emoji": row["avatar_emoji"]}
    conn2.close()

    stats = []
    for pid, count in sorted_poets:
        info = poet_names.get(pid, {"name": pid, "avatar_emoji": "❓"})
        stats.append({
            "pinyin_id": pid,
            "name": info["name"],
            "avatar_emoji": info["avatar_emoji"],
            "count": count,
            "percentage": round(count / total * 100, 1)
        })

    return {"total_analyses": sum(poet_count.values()), "poets": stats}
