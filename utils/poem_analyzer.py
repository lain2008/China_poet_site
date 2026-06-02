import re
import math

# 风格检测标记
ORAL_MARKERS = ['的', '了', '我', '你', '他', '她', '这', '那', '吧', '吗', '呢', '啊', '哈', '哦', '嗯',
                '在', '有', '是', '不', '就', '都', '也', '很', '还', '要', '会', '可以', '一个', '这个', '那个']

CLASSICAL_MARKERS = ['梅花', '南山', '镜', '月', '花', '梦', '江南', '长安', '故人', '流水',
                     '落花', '春风', '秋雨', '古道', '长亭', '归', '愁', '思', '忆', '旧',
                     '寒', '孤', '幽', '寂']

NATURE_MARKERS = ['麦田', '太阳', '花', '草', '树', '山', '海', '河', '风', '雨', '雪',
                  '星', '月', '鸟', '马', '春天', '秋天', '冬天', '夏天', '田野', '森林', '天空', '大地']

URBAN_MARKERS = ['街', '公交', '地铁', '楼', '房间', '窗', '门', '桌子', '椅子', '杯子',
                 '手机', '电视', '路', '车', '灯', '城市', '广场', '超市', '电梯', '办公室']

POSITIVE_WORDS = ['光明', '温暖', '幸福', '美好', '爱', '希望', '快乐', '阳光', '花',
                  '春天', '笑', '美', '甜', '温柔', '拥抱', '梦想', '飞翔']

NEGATIVE_WORDS = ['黑暗', '孤独', '痛苦', '死亡', '悲伤', '绝望', '冷', '寒', '泪',
                  '碎', '暗', '灰', '荒', '废', '腐烂', '深渊', '虚无']


def analyze(poem_text, poets):
    text = poem_text.strip()
    if not text:
        return {"error": "诗歌内容为空"}

    sentences = [s.strip() for s in re.split(r'[，。！？、；\n,\.!\?;]+', text) if s.strip()]
    avg_sentence_len = sum(len(s) for s in sentences) / max(1, len(sentences))
    total_chars = len(text.replace(' ', '').replace('\n', ''))

    keyword_scores = {}
    for poet in poets:
        score = 0
        for kw in poet["keywords"]:
            matches = re.findall(re.escape(kw), text)
            if matches:
                score += len(matches) * 3
        keyword_scores[poet["pinyin_id"]] = score

    oral_count = sum(1 for m in ORAL_MARKERS if m in text)
    oral_score = min(1.0, oral_count / len(ORAL_MARKERS))

    classical_count = sum(1 for m in CLASSICAL_MARKERS if m in text)
    classical_score = min(1.0, classical_count / 10)

    nature_count = sum(1 for m in NATURE_MARKERS if m in text)
    nature_score = min(1.0, nature_count / 8)

    urban_count = sum(1 for m in URBAN_MARKERS if m in text)
    urban_score = min(1.0, urban_count / 6)

    pos_count = sum(1 for w in POSITIVE_WORDS if w in text)
    neg_count = sum(1 for w in NEGATIVE_WORDS if w in text)
    sentiment_ratio = (pos_count + 1) / (neg_count + 1)

    final_scores = {}
    for poet in poets:
        pid = poet["pinyin_id"]
        score = keyword_scores.get(pid, 0)

        if pid in ('yujian', 'handong'):
            score += oral_score * 12 + urban_score * 10
        elif pid == 'yisha':
            score += oral_score * 14
        elif pid == 'zhangzao':
            score += classical_score * 14
        elif pid == 'gucheng':
            score += nature_score * 8 + (5 if sentiment_ratio > 1.5 else 0)
        elif pid == 'haizi':
            score += nature_score * 10 + (8 if sentiment_ratio > 1 else 0)
        elif pid == 'beidao':
            score += (6 if neg_count > 2 else 0) + (5 if oral_score < 0.5 else 0)
        elif pid == 'zhaiyongming':
            score += (8 if neg_count > 3 else 0) + classical_score * 4
        elif pid == 'shuting':
            score += (7 if sentiment_ratio > 1.2 else 0) + nature_score * 5
        elif pid == 'xichuan':
            score += (8 if avg_sentence_len > 8 else 0) + classical_score * 5

        final_scores[pid] = max(0, score)

    sorted_poets = sorted(
        [{"pinyin_id": p["pinyin_id"], "name": p["name"], "era": p["era"],
          "avatar_emoji": p["avatar_emoji"], "traits": p["traits"],
          "description": p["description"], "representative_poem": p["representative_poem"],
          "keywords": p["keywords"], "score": final_scores[p["pinyin_id"]]}
         for p in poets],
        key=lambda x: -x["score"]
    )

    top = sorted_poets[0]
    max_score = max(1, top["score"])
    display_pct = min(95, round((top["score"] / (max_score + 5)) * 90 + 5))

    tags = []
    if oral_score > 0.5:
        tags.append('口语化倾向')
    if classical_score > 0.3:
        tags.append('古典韵味')
    if nature_score > 0.4:
        tags.append('自然意象丰富')
    if urban_score > 0.4:
        tags.append('都市日常感')
    if sentiment_ratio > 2:
        tags.append('情感基调明亮')
    if sentiment_ratio < 0.6:
        tags.append('情感深沉内敛')
    if avg_sentence_len < 5:
        tags.append('短句节奏')
    if avg_sentence_len > 10:
        tags.append('长句铺陈')
    if neg_count > 5:
        tags.append('暗色意象')
    if pos_count > 5:
        tags.append('明亮底色')

    runner_ups = []
    for r in sorted_poets[1:4]:
        runner_ups.append({
            "pinyin_id": r["pinyin_id"],
            "name": r["name"],
            "avatar_emoji": r["avatar_emoji"],
            "score": r["score"],
            "display_pct": round((r["score"] / max_score) * display_pct) if max_score > 0 else 0
        })

    return {
        "top": {
            "pinyin_id": top["pinyin_id"],
            "name": top["name"],
            "era": top["era"],
            "avatar_emoji": top["avatar_emoji"],
            "traits": top["traits"],
            "description": top["description"],
            "representative_poem": top["representative_poem"],
            "score": top["score"],
            "match_pct": display_pct
        },
        "tags": tags[:6],
        "stats": {
            "avg_sentence_len": round(avg_sentence_len, 1),
            "total_chars": total_chars,
            "sentence_count": len(sentences),
            "oral_score": round(oral_score, 2),
            "classical_score": round(classical_score, 2),
            "nature_score": round(nature_score, 2),
            "urban_score": round(urban_score, 2),
            "sentiment_ratio": round(sentiment_ratio, 2)
        },
        "runner_ups": runner_ups
    }
