const QUESTIONS_PER_PAGE = 8;
const TOTAL_PAGES = 8;
const TOTAL_QUESTIONS = 64;
let currentPage = 0;
let answers = new Array(TOTAL_QUESTIONS).fill(null);
let currentTab = 'test';

const poets = {};
const poetKeys = [];

const questionsData = [];

function init() {
    fetchPoets().then(() => {
        buildQuestions();
        buildPageDots();
        renderPage(0);
        updateProgress();
    });
}

async function fetchPoets() {
    try {
        const resp = await fetch('/api/poets');
        const data = await resp.json();
        data.forEach(p => {
            poets[p.pinyin_id] = {
                id: p.pinyin_id,
                name: p.name,
                era: p.era,
                avatar: p.avatar_emoji,
                traits: p.traits || [],
                desc: p.description,
                poem: p.representative_poem,
                keywords: p.keywords || [],
                weight: 0
            };
            poetKeys.push(p.pinyin_id);
        });
    } catch (e) {
        console.error('加载诗人数据失败', e);
    }
}

function buildQuestions() {
    const raw = [
        {q:'你认为诗歌最重要的功能是什么？',opts:[
            {t:'揭示被遮蔽的真相，成为时代的见证',w:{beidao:5,xichuan:2}},
            {t:'构建一个纯净的精神世界，抵御现实的粗糙',w:{gucheng:5,zhangzao:2}},
            {t:'表达生命中最炽热的情感与渴望',w:{haizi:5,shuting:2}},
            {t:'在日常生活的缝隙中发现被忽略的诗意',w:{yujian:5,handong:3}}
        ]},
        {q:'一首好诗的标准是什么？',opts:[
            {t:'语言精确如手术刀，每一行都有思想的重量',w:{beidao:4,handong:3,xichuan:2}},
            {t:'纯真如孩童的眼睛，让人重新看见世界的美好',w:{gucheng:5,haizi:2}},
            {t:'有着优美的音乐性和精致的意象组合',w:{zhangzao:5,shuting:3}},
            {t:'敢于打破一切规则，用最直接的方式击中人心',w:{yisha:5,yujian:2}}
        ]},
        {q:'诗歌与政治/社会的关系应该是？',opts:[
            {t:'诗歌应保持独立，但必须直面时代的困境',w:{beidao:5,xichuan:2}},
            {t:'诗歌应该远离政治，守护纯粹的美学世界',w:{gucheng:4,zhangzao:3}},
            {t:'诗歌可以通过日常叙事间接反映社会',w:{yujian:4,handong:3}},
            {t:'诗歌就是最直接的介入和批判',w:{yisha:5,beidao:2}}
        ]},
        {q:'你更认同哪种对诗歌的比喻？',opts:[
            {t:'诗歌是投向黑暗的一道光线',w:{beidao:4,haizi:2,shuting:2}},
            {t:'诗歌是一座秘密的花园，只有纯真的人才能进入',w:{gucheng:5,zhangzao:2}},
            {t:'诗歌就是说话，和呼吸一样自然',w:{yujian:5,handong:3}},
            {t:'诗歌是血液，直接从血管里流出来的',w:{haizi:4,yisha:3}}
        ]},
        {q:'对于"口语诗"，你的看法是？',opts:[
            {t:'口语可以很有力量，但需要经过提炼和节制',w:{handong:4,beidao:2,xichuan:2}},
            {t:'口语是诗歌回到生活本身的必经之路',w:{yujian:5,yisha:2}},
            {t:'我更喜欢经过打磨的、有音乐性的语言',w:{zhangzao:5,shuting:2}},
            {t:'口语太粗糙，诗歌需要更精致的表达',w:{gucheng:3,xichuan:3}}
        ]},
        {q:'诗歌中的"意象"对你来说是什么？',opts:[
            {t:'意象是思想的载体，需要精确有力地传达',w:{beidao:4,handong:2}},
            {t:'意象是梦的碎片，应该轻盈、透明、不可捉摸',w:{gucheng:5,zhangzao:3}},
            {t:'意象来自大自然——麦田、太阳、花朵、星辰',w:{haizi:5,shuting:2}},
            {t:'意象就在身边——茶杯、公交卡、旧皮鞋',w:{yujian:5,yisha:2}}
        ]},
        {q:'你认为诗歌需要"意义"吗？',opts:[
            {t:'必须有意义，诗歌是对世界最深的理解',w:{beidao:4,xichuan:3}},
            {t:'诗歌本身就是一个自足的世界，不需要额外的意义',w:{gucheng:3,zhangzao:3}},
            {t:'意义在日常中自然浮现，不需要刻意追求',w:{yujian:4,handong:3}},
            {t:'有时候无意义本身就是一种有力的表达',w:{yisha:4,handong:2}}
        ]},
        {q:'你更欣赏哪种创作状态？',opts:[
            {t:'在深夜的灯光下，冷静地打磨每一个词语',w:{beidao:3,xichuan:3,zhangzao:3}},
            {t:'在自然的怀抱中，让诗句如泉水般自然涌出',w:{gucheng:4,haizi:3,shuting:2}},
            {t:'在街头巷尾，捕捉生活本身的节奏和语言',w:{yujian:5,yisha:3}},
            {t:'在激情迸发的瞬间，让词语如火山般喷发',w:{haizi:4,yisha:3}}
        ]},
        {q:'灵感通常来自哪里？',opts:[
            {t:'来自对社会现象的观察和思考',w:{beidao:4,yisha:2,handong:2}},
            {t:'来自内心深处的梦境和幻想',w:{gucheng:5,zhangzao:2}},
            {t:'来自大自然——山川、麦田、四季变换',w:{haizi:5,shuting:2}},
            {t:'来自日常生活的细节——一碗面、一次散步',w:{yujian:5,handong:3}}
        ]},
        {q:'写作时你更倾向于？',opts:[
            {t:'反复修改，直到每一个字都无可替代',w:{beidao:3,zhangzao:4,xichuan:2}},
            {t:'一气呵成，保留最初的冲动和温度',w:{haizi:4,gucheng:3,yisha:2}},
            {t:'写完之后放一放，过段时间再回来修改',w:{handong:3,yujian:3,shuting:2}},
            {t:'不太修改，相信第一感觉就是最好的',w:{yisha:4,yujian:3}}
        ]},
        {q:'你习惯在什么时间写作？',opts:[
            {t:'深夜——安静、孤独、思绪最清晰',w:{beidao:3,zhaiyongming:4,xichuan:2}},
            {t:'清晨——世界刚刚苏醒，一切都很新鲜',w:{gucheng:3,haizi:3,shuting:2}},
            {t:'随时随地——灵感来了就写，不分时间',w:{yujian:3,yisha:3,handong:2}},
            {t:'午后——阳光温暖，适合慢慢酝酿',w:{zhangzao:3,shuting:2}}
        ]},
        {q:'一个有趣的传闻：某位诗人喜欢戴一顶用裤腿改的帽子，你觉得这说明了什么？',opts:[
            {t:'一种对常规的反叛，用独特的方式标识自我（顾城真实趣事）',w:{gucheng:5,yisha:2}},
            {t:'诗人应该有自己的标志性风格，哪怕是穿着',w:{beidao:2,yisha:3}},
            {t:'这很可爱，诗人就是应该有点孩子气',w:{gucheng:4,haizi:2}},
            {t:'外在的标识不重要，重要的是作品本身',w:{handong:3,xichuan:3}}
        ]},
        {q:'某诗人在火车经过黄河时写下"我只想撒尿"，你觉得？',opts:[
            {t:'这是一种刻意的冒犯和解构，很有力量（伊沙真实趣事）',w:{yisha:5,yujian:2}},
            {t:'太粗俗了，诗歌还是应该保持一定的优雅',w:{zhangzao:3,gucheng:2,shuting:2}},
            {t:'有趣，但更重要的是它背后的反叛精神',w:{beidao:3,handong:3}},
            {t:'这就是真实的日常生活，诗歌就应该是这样',w:{yujian:4,yisha:3}}
        ]},
        {q:'海子曾带着《圣经》《瓦尔登湖》等书去山海关，你认为诗人与阅读的关系是？',opts:[
            {t:'广泛阅读是必要的，但最终要形成自己的声音',w:{xichuan:4,beidao:3}},
            {t:'阅读是灵魂的滋养，与伟大灵魂对话才能写出好诗',w:{haizi:4,shuting:3}},
            {t:'生活本身比书本更重要，阅读太多反而束缚',w:{yujian:3,yisha:2}},
            {t:'精读少数几本重要的书，反复咀嚼',w:{zhangzao:3,handong:2}}
        ]},
        {q:'北岛创办了《今天》杂志，你认为诗人参与公共事务是？',opts:[
            {t:'必要的，诗人不能只躲在象牙塔里',w:{beidao:5,yisha:2}},
            {t:'诗人应该专注于创作，公共事务会分散精力',w:{gucheng:3,zhangzao:3}},
            {t:'可以用诗歌本身参与，不一定需要组织行动',w:{shuting:3,xichuan:2}},
            {t:'每个人选择不同，没有对错之分',w:{handong:3,yujian:3}}
        ]},
        {q:'于坚说"日常生活背后站着神"，你的理解是？',opts:[
            {t:'深刻的洞察——神圣就在最平凡的事物中',w:{yujian:5,handong:3}},
            {t:'这是一种诗意的夸张，但确实引人思考',w:{xichuan:3,beidao:2}},
            {t:'我更喜欢在宏大叙事中寻找意义',w:{haizi:3,beidao:2}},
            {t:'日常就是日常，不需要赋予它额外的意义',w:{yisha:3,handong:2}}
        ]},
        {q:'你理想的生活状态是？',opts:[
            {t:'清醒而独立地观察世界，保持思想的锐利',w:{beidao:4,handong:2}},
            {t:'在一个安静的地方，与自然和书籍为伴',w:{gucheng:4,haizi:2,zhangzao:2}},
            {t:'在人间烟火中感受生活的温度和质感',w:{yujian:4,shuting:2}},
            {t:'自由自在地创作和生活，不被任何规则束缚',w:{yisha:3,haizi:3}}
        ]},
        {q:'面对现实中的挫折，你的态度是？',opts:[
            {t:'冷静分析，用理性寻找出路',w:{beidao:4,handong:3}},
            {t:'退回到内心的世界，在诗歌中寻找慰藉',w:{gucheng:4,zhangzao:3}},
            {t:'用更强烈的热情去对抗，哪怕燃烧自己',w:{haizi:5,yisha:2}},
            {t:'接受它，在日常的坚韧中慢慢消化',w:{yujian:3,shuting:3}}
        ]},
        {q:'你喜欢什么样的居住环境？',opts:[
            {t:'城市的一角，可以观察人群和社会',w:{beidao:3,yujian:3,handong:2}},
            {t:'远离城市的地方，靠近山林或海边',w:{gucheng:4,haizi:3,shuting:2}},
            {t:'有文化底蕴的老城，有书店和咖啡馆',w:{xichuan:3,zhangzao:3}},
            {t:'无所谓，在哪里都能找到诗意',w:{yujian:3,yisha:2}}
        ]},
        {q:'张枣的"只要想起一生中后悔的事，梅花便落满了南山"，你对"后悔"的态度是？',opts:[
            {t:'后悔是人生的一部分，它让生命有了深度',w:{zhangzao:5,shuting:3}},
            {t:'与其后悔，不如用行动去改变',w:{beidao:3,yisha:3}},
            {t:'后悔是一种诗意的情感，值得细细品味',w:{gucheng:3,zhangzao:3}},
            {t:'过去就过去了，后悔没有意义',w:{handong:3,yujian:2}}
        ]},
        {q:'你如何看待"孤独"？',opts:[
            {t:'孤独是思考的必要条件，我享受它',w:{beidao:3,xichuan:3,zhaiyongming:3}},
            {t:'孤独是痛苦的，但也是创作的源泉',w:{haizi:3,gucheng:3,zhaiyongming:3}},
            {t:'在人群中也可以孤独，这是一种现代处境',w:{yujian:3,handong:3}},
            {t:'我不喜欢孤独，我需要与人交流和碰撞',w:{yisha:3,shuting:2}}
        ]},
        {q:'朋友眼中的你更接近？',opts:[
            {t:'严肃而深刻，有时候有些冷峻',w:{beidao:4,handong:2,xichuan:2}},
            {t:'纯真而敏感，像一个长不大的孩子',w:{gucheng:5,haizi:2}},
            {t:'温暖而坚定，值得信赖的倾听者',w:{shuting:4,yujian:2}},
            {t:'幽默而直接，有时候语出惊人',w:{yisha:4,yujian:3}}
        ]},
        {q:'你对"成名"的态度是？',opts:[
            {t:'作品比名声重要，但被更多人看到是好事',w:{beidao:3,shuting:3}},
            {t:'对名声没有兴趣，只想安静地写自己的东西',w:{gucheng:4,zhangzao:3}},
            {t:'成名可以让诗歌影响更多人，值得追求',w:{haizi:2,yisha:3}},
            {t:'顺其自然，写好自己的诗就够了',w:{yujian:3,handong:3}}
        ]},
        {q:'某次诗歌朗诵会上，有人大声喧哗，你会？',opts:[
            {t:'停下来，用沉默和目光让对方感到压力',w:{beidao:3,handong:3}},
            {t:'感到受伤，但继续用诗歌表达自己的世界',w:{gucheng:3,shuting:2}},
            {t:'直接回应，用犀利的语言让对方闭嘴',w:{yisha:5,beidao:2}},
            {t:'不在意，继续按照自己的节奏朗诵',w:{yujian:3,xichuan:2}}
        ]},
        {q:'你对当前这个时代的基本判断是？',opts:[
            {t:'这是一个需要被审视和质疑的时代',w:{beidao:5,handong:2}},
            {t:'时代喧嚣，诗人应该守护内心的宁静',w:{gucheng:3,zhangzao:3}},
            {t:'每个时代都有它的诗意，关键在于发现',w:{yujian:4,shuting:2}},
            {t:'这是一个需要被解构和嘲弄的时代',w:{yisha:4,handong:2}}
        ]},
        {q:'诗歌在当代社会中的地位？',opts:[
            {t:'边缘化是事实，但诗歌的精神永不消亡',w:{beidao:3,xichuan:3}},
            {t:'诗歌是小众的，但这正是它的纯粹所在',w:{gucheng:3,zhangzao:3}},
            {t:'诗歌就在日常生活中，只是人们没有意识到',w:{yujian:4,handong:2}},
            {t:'诗歌需要重新找回与大众对话的能力',w:{yisha:3,shuting:2}}
        ]},
        {q:'关于传统与现代，你的立场是？',opts:[
            {t:'在传统中汲取养分，但必须进行现代转化',w:{zhangzao:4,xichuan:3,beidao:2}},
            {t:'传统是根基，现代诗歌不能切断与古典的联系',w:{zhangzao:3,shuting:2,xichuan:2}},
            {t:'更关注当下和未来，传统不是必须的参照',w:{yisha:3,yujian:3}},
            {t:'用现代口语重新激活传统中的活力',w:{yujian:3,handong:2}}
        ]},
        {q:'翟永明提出了"黑夜意识"，你认为这代表了什么？',opts:[
            {t:'女性在诗歌中对自身经验的深度挖掘',w:{zhaiyongming:5,shuting:3}},
            {t:'一种普遍的现代性焦虑和精神探索',w:{beidao:2,xichuan:2}},
            {t:'诗歌应该关注被忽略的暗面',w:{zhaiyongming:4,handong:2}},
            {t:'这是一种有力的性别政治表达',w:{zhaiyongming:4,yisha:2}}
        ]},
        {q:'你如何看待"知识分子写作"与"民间写作"的争论？',opts:[
            {t:'两者都有价值，但过度争论本身没有意义',w:{handong:3,yujian:3}},
            {t:'倾向于知识分子写作——诗歌需要深度和学识',w:{xichuan:5,zhangzao:2}},
            {t:'倾向于民间写作——诗歌应该接地气',w:{yujian:4,yisha:3}},
            {t:'超越这种二元对立，好的诗歌就是好的诗歌',w:{beidao:3,shuting:3}}
        ]},
        {q:'如果一个年轻诗人问你如何开始写诗，你会说？',opts:[
            {t:'从阅读经典开始，然后找到自己的声音',w:{xichuan:3,beidao:2,zhangzao:2}},
            {t:'从自己的内心出发，写最真实的感受',w:{gucheng:3,haizi:3,shuting:2}},
            {t:'从观察身边的生活开始，记录真实的细节',w:{yujian:4,handong:3}},
            {t:'大胆写，不要怕冒犯任何人',w:{yisha:4}}
        ]},
        {q:'你认为中国现代诗歌最大的问题是什么？',opts:[
            {t:'与现实的对话能力不足，需要更有力的介入',w:{beidao:4,yisha:2}},
            {t:'过度追求技巧，缺少了赤子之心的真诚',w:{haizi:3,gucheng:3}},
            {t:'圈子化严重，诗歌变成了小圈子的游戏',w:{yujian:3,handong:3}},
            {t:'缺少与古典传统的深度对话',w:{zhangzao:4,xichuan:2}}
        ]},
        {q:'韩东写过"有关大雁塔，我们又能知道些什么"，这反映了？',opts:[
            {t:'对宏大叙事的解构和对历史意义的怀疑',w:{handong:5,beidao:2}},
            {t:'一种虚无主义，对什么都提不起兴趣',w:{yisha:2,handong:2}},
            {t:'日常视角对宏大历史的有趣消解',w:{yujian:3,handong:3}},
            {t:'这是第三代诗歌的重要转向',w:{handong:4,yujian:2}}
        ]},
        {q:'表达情感时你倾向于？',opts:[
            {t:'克制而含蓄，让情感在词语间自然流露',w:{beidao:3,handong:4,zhangzao:2}},
            {t:'直接而热烈，让情感如火山般喷发',w:{haizi:5,yisha:3}},
            {t:'温柔而深沉，情感如暗流般在深处涌动',w:{shuting:4,zhaiyongming:3}},
            {t:'用意象来承载情感，让读者自己去体会',w:{gucheng:3,zhangzao:3}}
        ]},
        {q:'在爱情诗中，你更欣赏？',opts:[
            {t:'舒婷《致橡树》式的独立与平等',w:{shuting:5,zhaiyongming:2}},
            {t:'海子式的炽热与献身',w:{haizi:5,gucheng:2}},
            {t:'张枣式的幽微与惆怅',w:{zhangzao:5}},
            {t:'韩东式的冷静与去浪漫化',w:{handong:4,yujian:2}}
        ]},
        {q:'你对"伤感"的态度是？',opts:[
            {t:'适度的伤感是诗意的，但不能沉溺',w:{zhangzao:3,shuting:3}},
            {t:'伤感是诗歌的重要情感资源',w:{gucheng:3,haizi:2,zhaiyongming:3}},
            {t:'不太喜欢伤感，更欣赏有力量的表达',w:{beidao:3,yisha:3}},
            {t:'伤感在日常生活中有它的位置，但不夸大',w:{yujian:3,handong:3}}
        ]},
        {q:'你如何对待"愤怒"这种情绪？',opts:[
            {t:'将愤怒转化为冷静的批判力量',w:{beidao:4,handong:2}},
            {t:'愤怒是破坏性的，我倾向于化解它',w:{gucheng:3,zhangzao:2}},
            {t:'直接表达愤怒，用诗歌作为武器',w:{yisha:5,beidao:2}},
            {t:'用反讽和幽默来处理愤怒',w:{yujian:3,yisha:3}}
        ]},
        {q:'你更欣赏哪种表达方式？',opts:[
            {t:'言简意赅，用最少的词表达最多的意思',w:{handong:5,beidao:3}},
            {t:'意象丰富，让词语在联想中绽放',w:{gucheng:3,zhangzao:3,haizi:2}},
            {t:'娓娓道来，在日常叙述中展现诗意',w:{yujian:4,shuting:2}},
            {t:'直截了当，不绕弯子',w:{yisha:4,handong:2}}
        ]},
        {q:'诗歌中的"温柔"是一种怎样的品质？',opts:[
            {t:'温柔是力量的另一种形式，如舒婷的诗',w:{shuting:5,zhaiyongming:2}},
            {t:'温柔是纯粹心灵的天然流露',w:{gucheng:4,haizi:2}},
            {t:'温柔在日常细节中最动人',w:{yujian:3,zhangzao:2}},
            {t:'太温柔容易软弱，诗歌需要更硬的质地',w:{beidao:2,yisha:2,handong:2}}
        ]},
        {q:'你如何处理内心的"黑暗面"？',opts:[
            {t:'正视它，将它作为创作的重要素材',w:{zhaiyongming:5,beidao:2}},
            {t:'用光明和美好来抵御黑暗',w:{gucheng:3,haizi:3,shuting:2}},
            {t:'用幽默和自嘲来化解',w:{yisha:3,yujian:2}},
            {t:'冷静地观察它，不回避也不沉溺',w:{handong:3,xichuan:3}}
        ]},
        {q:'你相信"诗歌可以拯救灵魂"吗？',opts:[
            {t:'不完全相信，但诗歌确实可以安放灵魂',w:{beidao:3,xichuan:3}},
            {t:'相信——诗歌是我生命中最重要的东西',w:{haizi:5,gucheng:3}},
            {t:'诗歌不能拯救什么，但它让生活更值得过',w:{yujian:3,shuting:3}},
            {t:'不相信宏大叙事，诗歌就是诗歌本身',w:{handong:3,yisha:2}}
        ]},
        {q:'你更喜欢哪种自然意象？',opts:[
            {t:'月亮、黑夜、星辰——神秘而深邃',w:{zhaiyongming:4,beidao:2}},
            {t:'花朵、露珠、草地——轻盈而纯真',w:{gucheng:5,zhangzao:2}},
            {t:'麦田、太阳、大河——壮阔而热烈',w:{haizi:5,shuting:2}},
            {t:'街巷、砖墙、旧物——日常而有质感',w:{yujian:4,handong:2}}
        ]},
        {q:'在音乐品味上，你更接近？',opts:[
            {t:'古典音乐——结构严谨、情感深沉',w:{xichuan:3,zhangzao:3,beidao:2}},
            {t:'民谣——质朴、真诚、有故事感',w:{haizi:3,shuting:3,yujian:2}},
            {t:'摇滚——直接、有力、有反叛精神',w:{yisha:4,beidao:2}},
            {t:'自然的声音——风声、鸟鸣、流水',w:{gucheng:4,haizi:2}}
        ]},
        {q:'你更喜欢哪种颜色？',opts:[
            {t:'黑色与白色——对比鲜明，有力量',w:{beidao:3,zhaiyongming:3,handong:2}},
            {t:'金黄色与红色——温暖、热烈、充满能量',w:{haizi:4,shuting:2}},
            {t:'绿色与蓝色——清新、自然、宁静',w:{gucheng:4,shuting:2}},
            {t:'灰色与棕色——低调、日常、有质感',w:{yujian:4,handong:3}}
        ]},
        {q:'在视觉艺术中，你更欣赏？',opts:[
            {t:'水墨画——留白、意境、含蓄的美',w:{zhangzao:4,xichuan:3}},
            {t:'油画——浓烈、厚重、有质感',w:{haizi:3,shuting:2}},
            {t:'摄影——捕捉真实的瞬间',w:{yujian:3,handong:3}},
            {t:'涂鸦——自由、反叛、不受约束',w:{yisha:4}}
        ]},
        {q:'对于"残缺美"，你的看法是？',opts:[
            {t:'残缺比完美更有诗意，如断臂的维纳斯',w:{zhangzao:4,zhaiyongming:2}},
            {t:'残缺是真实的，完美是虚假的',w:{beidao:3,handong:3}},
            {t:'残缺让人心痛，但也让人更珍惜美好',w:{gucheng:3,shuting:3}},
            {t:'残缺就是生活本身的样子',w:{yujian:3,yisha:2}}
        ]},
        {q:'你更喜欢哪种季节？',opts:[
            {t:'秋天——成熟、深沉、略带忧伤',w:{zhangzao:3,beidao:2,zhaiyongming:3}},
            {t:'春天——新生、希望、万物复苏',w:{haizi:4,shuting:3}},
            {t:'夏天——热烈、饱满、生命力旺盛',w:{haizi:2,yisha:2}},
            {t:'冬天——寂静、纯粹、内省',w:{gucheng:3,handong:3,beidao:2}}
        ]},
        {q:'你对于"留白"在诗歌中的运用？',opts:[
            {t:'留白是诗歌的重要技巧，让读者参与进来',w:{zhangzao:4,handong:3,beidao:2}},
            {t:'适度的留白很美，但不能影响表达',w:{shuting:3,xichuan:2}},
            {t:'不太在意技巧，自然流露就好',w:{haizi:2,yujian:3}},
            {t:'直接表达更有效，留白有时是故弄玄虚',w:{yisha:3}}
        ]},
        {q:'你认为诗歌与"美"的关系是？',opts:[
            {t:'诗歌可以超越传统的美，追求更有力的真实',w:{beidao:3,yisha:3,handong:2}},
            {t:'美是诗歌的核心追求，没有美就没有诗歌',w:{zhangzao:4,gucheng:3}},
            {t:'日常生活中的美比精致的美更动人',w:{yujian:4,shuting:2}},
            {t:'美有很多种，诗歌应该探索美的各种可能',w:{xichuan:3,zhaiyongming:3}}
        ]},
        {q:'在社交场合中，你通常是？',opts:[
            {t:'安静观察，不轻易发言',w:{beidao:3,handong:4,zhaiyongming:2}},
            {t:'有些害羞，更喜欢小范围的深入交流',w:{gucheng:4,zhangzao:3}},
            {t:'热情开朗，喜欢与人分享',w:{haizi:3,shuting:3}},
            {t:'直言不讳，有时候会让人感到冒犯',w:{yisha:5,yujian:2}}
        ]},
        {q:'你如何看待诗歌圈子的"江湖气"？',opts:[
            {t:'不喜欢，诗歌应该超越这种小团体',w:{beidao:3,xichuan:3}},
            {t:'保持距离，做好自己的创作就够了',w:{gucheng:3,handong:3}},
            {t:'圈子是现实存在的，可以善加利用',w:{yujian:2,yisha:2}},
            {t:'无所谓，重要的是写出好作品',w:{zhangzao:2,shuting:2}}
        ]},
        {q:'你更喜欢与什么样的人交往？',opts:[
            {t:'有思想深度的人，可以进行严肃的对话',w:{beidao:3,xichuan:4}},
            {t:'真诚而敏感的人，可以分享内心的感受',w:{gucheng:4,shuting:3}},
            {t:'有趣而真实的人，不需要太多伪装',w:{yujian:4,yisha:2}},
            {t:'志同道合的人，可以一起创作和交流',w:{haizi:3,zhangzao:2}}
        ]},
        {q:'如果有人批评你的作品，你的反应是？',opts:[
            {t:'认真听取，理性分析是否有道理',w:{beidao:3,xichuan:3,handong:2}},
            {t:'可能会有些受伤，但会默默反思',w:{gucheng:3,zhangzao:3}},
            {t:'直接回应，捍卫自己的创作理念',w:{yisha:4,beidao:2}},
            {t:'不太在意他人的评价，坚持自己的路',w:{yujian:3,handong:3}}
        ]},
        {q:'你认为诗人之间应该建立怎样的关系？',opts:[
            {t:'保持独立，互相尊重，不需要太紧密',w:{beidao:3,handong:3}},
            {t:'精神上的共鸣比实际的交往更重要',w:{gucheng:3,zhangzao:3}},
            {t:'可以形成一个互相支持的社群',w:{shuting:3,haizi:2}},
            {t:'竞争和碰撞可以激发出更好的作品',w:{yisha:3,beidao:2}}
        ]},
        {q:'关于"知音"，你的看法是？',opts:[
            {t:'知音难求，但也不必强求',w:{zhangzao:3,handong:3}},
            {t:'有一个真正的知音就足够了',w:{gucheng:4,shuting:3}},
            {t:'知音是理想化的概念，现实中很少',w:{beidao:3,yujian:2}},
            {t:'不需要知音，写出自己想写的就够了',w:{yisha:3,handong:2}}
        ]},
        {q:'你如何看待诗歌朗诵会？',opts:[
            {t:'是一种有效的传播方式，但朗诵本身不是创作',w:{beidao:3,xichuan:2}},
            {t:'不太喜欢公开朗诵，诗歌更适合安静阅读',w:{gucheng:3,zhangzao:3}},
            {t:'喜欢朗诵，诗歌的声音维度很重要',w:{haizi:3,yujian:3}},
            {t:'朗诵可以很有力量，是表演的一部分',w:{yisha:3,shuting:2}}
        ]},
        {q:'在网络上发表诗歌，你的态度是？',opts:[
            {t:'网络是新的发表渠道，值得利用',w:{yujian:3,yisha:3}},
            {t:'更喜欢传统的纸质发表，更有仪式感',w:{zhangzao:3,xichuan:2}},
            {t:'无所谓渠道，重要的是作品本身',w:{beidao:3,handong:3}},
            {t:'网络让诗歌更民主，但也更嘈杂',w:{yisha:2,handong:2}}
        ]},
        {q:'你如何看待"死亡"？',opts:[
            {t:'死亡是生命的终极问题，值得严肃思考',w:{beidao:3,xichuan:3,zhaiyongming:3}},
            {t:'死亡是另一种形式的存在，如海子所言"春天，十个海子全部复活"',w:{haizi:5,gucheng:3}},
            {t:'死亡是日常的一部分，不需要过度渲染',w:{yujian:3,handong:3}},
            {t:'面对死亡，更需要珍惜当下的生命',w:{shuting:4,yujian:2}}
        ]},
        {q:'如果用一个词概括你的人生追求，会是？',opts:[
            {t:'清醒——看清世界的真相',w:{beidao:4,handong:3}},
            {t:'纯真——保持内心的纯净',w:{gucheng:5,haizi:2}},
            {t:'真实——活出生命的质感',w:{yujian:4,yisha:2}},
            {t:'自由——不被任何事物束缚',w:{yisha:3,haizi:3}}
        ]},
        {q:'你更认同哪种人生哲学？',opts:[
            {t:'怀疑一切，在质疑中寻找自己的立场',w:{beidao:5,handong:2}},
            {t:'用爱和信念度过一生',w:{shuting:5,haizi:2}},
            {t:'在日常中修行，在平凡中见伟大',w:{yujian:4,handong:2}},
            {t:'用美和艺术赋予生命意义',w:{zhangzao:4,gucheng:2}}
        ]},
        {q:'对于"理想主义"，你的态度是？',opts:[
            {t:'理想主义很重要，但需要理性的支撑',w:{beidao:3,xichuan:3}},
            {t:'我就是一个理想主义者，这是诗人的宿命',w:{haizi:5,gucheng:3}},
            {t:'理想主义在日常坚持中体现，不需要高调',w:{shuting:3,yujian:3}},
            {t:'对理想主义保持警惕，它可能导致盲目',w:{handong:3,yisha:2}}
        ]},
        {q:'你认为"幸福"是什么？',opts:[
            {t:'幸福是能够自由地思考和创作',w:{beidao:3,xichuan:2}},
            {t:'幸福是内心的宁静和与自然的和谐',w:{gucheng:4,shuting:2}},
            {t:'幸福是日常生活中的温暖和满足',w:{yujian:4,shuting:3}},
            {t:'幸福是不断超越自我、实现价值',w:{haizi:3,yisha:2}}
        ]},
        {q:'面对"虚无"，你的方式是？',opts:[
            {t:'用理性和思考来对抗虚无',w:{beidao:3,xichuan:3}},
            {t:'用诗歌和美来填补虚无的深渊',w:{gucheng:3,zhangzao:3,zhaiyongming:3}},
            {t:'接受虚无，在日常中继续生活',w:{yujian:3,handong:3}},
            {t:'用激烈的行动来冲破虚无',w:{haizi:3,yisha:3}}
        ]},
        {q:'你希望自己的诗歌最终能？',opts:[
            {t:'成为时代的见证和思想的灯塔',w:{beidao:4,xichuan:2}},
            {t:'成为纯净的精神家园，给读者以慰藉',w:{gucheng:4,shuting:3}},
            {t:'成为日常生活真实的记录',w:{yujian:4,handong:2}},
            {t:'成为打破常规、激发思考的力量',w:{yisha:4,beidao:2}}
        ]},
        {q:'最后一个问题：如果用一句话描述你与诗歌的关系，你会说？',opts:[
            {t:'诗歌是我审视世界的方式',w:{beidao:4,handong:2,xichuan:2}},
            {t:'诗歌是我灵魂的呼吸',w:{gucheng:4,haizi:3,zhaiyongming:2}},
            {t:'诗歌就是我的生活本身',w:{yujian:4,haizi:2,shuting:2}},
            {t:'诗歌是我对抗世界的武器',w:{yisha:4,beidao:2,zhaiyongming:2}}
        ]}
    ];
    raw.forEach(item => {
        questionsData.push({
            question: item.q,
            options: item.opts.map(o => ({
                text: o.t,
                poetWeights: o.w
            }))
        });
    });
}

function buildPageDots() {
    const dotsContainer = document.getElementById('page-dots');
    dotsContainer.innerHTML = '';
    for (let i = 0; i < TOTAL_PAGES; i++) {
        const dot = document.createElement('span');
        dot.className = 'page-dot';
        dot.dataset.page = i;
        dot.title = `第${i + 1}页`;
        dot.addEventListener('click', () => goToPage(i));
        dotsContainer.appendChild(dot);
    }
    updatePageDots();
}

function updatePageDots() {
    const dots = document.querySelectorAll('#page-dots .page-dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('active', 'completed');
        if (i === currentPage) dot.classList.add('active');
        else if (isPageComplete(i)) dot.classList.add('completed');
    });
}

function isPageComplete(pageIndex) {
    const start = pageIndex * QUESTIONS_PER_PAGE;
    const end = Math.min(start + QUESTIONS_PER_PAGE, TOTAL_QUESTIONS);
    for (let i = start; i < end; i++) {
        if (answers[i] === null) return false;
    }
    return true;
}

function renderPage(pageIndex) {
    currentPage = pageIndex;
    const container = document.getElementById('questions-container');
    const start = pageIndex * QUESTIONS_PER_PAGE;
    const end = Math.min(start + QUESTIONS_PER_PAGE, TOTAL_QUESTIONS);
    let html = '';
    for (let i = start; i < end; i++) {
        const q = questionsData[i];
        const qNum = i + 1;
        const answered = answers[i] !== null;
        html += `<div class="question-block ${answered ? 'answered' : ''}" id="q-block-${i}">
          <div class="q-text"><span class="q-num">${qNum}</span><span>${q.question}</span></div>
          <div class="options">${q.options.map((opt, oi) => {
            const letter = String.fromCharCode(65 + oi);
            const checked = answers[i] === oi ? 'checked' : '';
            return `<label class="option-label" for="q${i}_o${oi}">
              <input type="radio" name="q${i}" id="q${i}_o${oi}" value="${oi}" ${checked} onchange="selectAnswer(${i}, ${oi})">
              <span class="option-letter">${letter}</span><span>${opt.text}</span></label>`;
          }).join('')}</div></div>`;
    }
    container.innerHTML = html;
    updateNavigation();
    updatePageDots();
    updateProgress();
    scrollToTop();
}

function selectAnswer(qIndex, optionIndex) {
    answers[qIndex] = optionIndex;
    const block = document.getElementById(`q-block-${qIndex}`);
    if (block) block.classList.add('answered');
    updateProgress();
    updatePageDots();
    updateNavigation();
}

function updateProgress() {
    const answeredCount = answers.filter(a => a !== null).length;
    const pct = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('answered-count').textContent = `已答：${answeredCount} / ${TOTAL_QUESTIONS}`;
    document.getElementById('progress-label').textContent = `第 ${currentPage + 1} 页 / 共 ${TOTAL_PAGES} 页`;
    document.getElementById('page-indicator-text').textContent = `第 ${currentPage + 1} / ${TOTAL_PAGES} 页`;
    const submitBtn = document.getElementById('btn-submit');
    if (answeredCount === TOTAL_QUESTIONS) {
        submitBtn.classList.remove('hidden');
    } else {
        submitBtn.classList.add('hidden');
    }
}

function updateNavigation() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    btnPrev.disabled = currentPage === 0;
    if (currentPage === TOTAL_PAGES - 1) {
        btnNext.textContent = '完成 ✓';
        btnNext.classList.add('btn-primary');
        btnNext.classList.remove('btn-outline');
    } else {
        btnNext.textContent = '下一页 ▶';
        btnNext.classList.remove('btn-primary');
        btnNext.classList.add('btn-outline');
    }
}

function nextPage() {
    if (currentPage < TOTAL_PAGES - 1) {
        renderPage(currentPage + 1);
    } else {
        const answeredCount = answers.filter(a => a !== null).length;
        if (answeredCount < TOTAL_QUESTIONS) {
            showToast(`还有 ${TOTAL_QUESTIONS - answeredCount} 道题未回答，请完成后再提交`);
            for (let i = 0; i < TOTAL_PAGES; i++) {
                if (!isPageComplete(i)) { renderPage(i); return; }
            }
        } else {
            submitTest();
        }
    }
}

function prevPage() {
    if (currentPage > 0) renderPage(currentPage - 1);
}

function goToPage(pageIndex) {
    if (pageIndex >= 0 && pageIndex < TOTAL_PAGES) renderPage(pageIndex);
}

function scrollToTop() {
    const panel = document.getElementById('panel-test');
    const top = panel.getBoundingClientRect().top + window.pageYOffset - 100;
    window.scrollTo({ top, behavior: 'smooth' });
}

function submitTest() {
    const answeredCount = answers.filter(a => a !== null).length;
    if (answeredCount < TOTAL_QUESTIONS) {
        showToast(`还有 ${TOTAL_QUESTIONS - answeredCount} 道题未回答，请完成后再提交`);
        for (let i = 0; i < TOTAL_PAGES; i++) {
            if (!isPageComplete(i)) { renderPage(i); return; }
        }
        return;
    }
    const scores = {};
    poetKeys.forEach(k => { scores[k] = 0; });
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        const chosen = answers[i];
        if (chosen !== null) {
            const weights = questionsData[i].options[chosen].poetWeights;
            for (const [poetId, score] of Object.entries(weights)) {
                if (scores[poetId] !== undefined) scores[poetId] += score;
            }
        }
    }
    const sorted = poetKeys.map(k => ({ id: k, score: scores[k], ...poets[k] })).sort((a, b) => b.score - a.score);
    const top = sorted[0];
    const maxScore = top.score;
    const matchPct = Math.min(98, Math.max(60, Math.round((maxScore / (64 * 5 * 0.35)) * 100)));
    displayResult(sorted, matchPct);
}

function displayResult(sorted, topPct) {
    const top = sorted[0];
    const runnerUps = sorted.slice(1, 4);
    const maxScore = top.score;
    const runnerUpData = runnerUps.map(r => ({ ...r, displayPct: Math.round((r.score / maxScore) * topPct) }));
    const imgPath = getAvatarPath(top.id);
    const resultHTML = `<div class="result-card mt-20" id="result-card">
      <div class="result-poet-avatar">${imgPath ? `<img src="${imgPath}" alt="${top.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="emoji-fallback" style="display:none">${top.avatar}</span>` : `<span class="emoji-fallback">${top.avatar}</span>`}</div>
      <div class="result-name">${top.name}</div>
      <div class="result-match">🎯 匹配度：<strong>${topPct}%</strong></div>
      <div style="max-width:300px;margin:0 auto;"><div class="result-bar"><div class="result-bar-fill" style="width:${topPct}%;"></div></div></div>
      <p style="font-size:0.85rem;color:#a09070;margin:8px 0;">${top.era}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0;">${top.traits.map(t => `<span class="analysis-tag">${t}</span>`).join('')}</div>
      <div class="result-desc"><p style="margin-bottom:8px;"><strong>📖 灵魂解读：</strong></p><p>${top.desc}</p>
        <div class="highlight-box mt-12"><p style="font-size:0.85rem;color:var(--text-light);">「${top.poem.replace(/\n/g, '<br>')}」</p><p style="font-size:0.75rem;color:#a09070;margin-top:4px;">—— ${top.name} 代表诗句</p></div></div>
      <div style="margin-top:16px;text-align:left;"><p style="font-weight:600;color:var(--accent);margin-bottom:8px;">🏅 其他高匹配诗人：</p>
        ${runnerUpData.map((r, i) => `<div class="runner-up"><span><strong>#${i+2}</strong> ${r.avatar} <span class="ru-name">${r.name}</span></span><span class="ru-pct">${r.displayPct}%</span></div>`).join('')}</div>
      <div class="btn-row mt-20"><button class="btn btn-secondary" onclick="resetTest()">🔄 重新测试</button><button class="btn btn-outline" onclick="switchTab('poem')">✒️ 试试诗歌评析</button></div></div>`;
    const container = document.getElementById('result-container');
    container.innerHTML = resultHTML;
    container.classList.remove('hidden');
    setTimeout(() => { document.getElementById('result-card').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 200);
    document.getElementById('questions-container').innerHTML = '';
    document.getElementById('nav-buttons').classList.add('hidden');
    document.getElementById('btn-submit').classList.add('hidden');
    document.getElementById('page-dots').classList.add('hidden');
    document.getElementById('progress-label').textContent = '✅ 测试完成';
    document.getElementById('answered-count').textContent = '已答：64 / 64';
    document.getElementById('progress-fill').style.width = '100%';
}

const PINYIN_TO_CHINESE = {
    beidao: '\u5317\u5c9b',
    gucheng: '\u987e\u57ce',
    haizi: '\u6d77\u5b50',
    shuting: '\u8212\u5a77',
    xichuan: '\u897f\u5ddd',
    yujian: '\u4e8e\u575a',
    handong: '\u97e9\u4e1c',
    zhaiyongming: '\u7fdf\u6c38\u660e',
    yisha: '\u4f0a\u6c99',
    zhangzao: '\u5f20\u67e3'
};

function getAvatarPath(poetId) {
    const chName = PINYIN_TO_CHINESE[poetId] || poetId;
    return `/static/images/poets/${encodeURIComponent(chName)}.webp`;
}

function resetTest() {
    answers = new Array(TOTAL_QUESTIONS).fill(null);
    currentPage = 0;
    document.getElementById('result-container').classList.add('hidden');
    document.getElementById('result-container').innerHTML = '';
    document.getElementById('nav-buttons').classList.remove('hidden');
    document.getElementById('btn-submit').classList.add('hidden');
    document.getElementById('page-dots').classList.remove('hidden');
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-label').textContent = '第 1 页 / 共 8 页';
    document.getElementById('answered-count').textContent = '已答：0 / 64';
    buildPageDots();
    renderPage(0);
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function analyzePoem() {
    const input = document.getElementById('poem-input').value.trim();
    if (!input) { showToast('请先粘贴您的诗歌作品'); return; }
    if (input.length < 15) { showToast('诗歌内容太短，请至少输入15个字'); return; }

    const btn = document.getElementById('btn-analyze');
    btn.disabled = true;
    btn.textContent = '⏳ 分析中...';

    try {
        const resp = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ poem: input })
        });
        if (!resp.ok) {
            const err = await resp.json();
            showToast(err.error || '分析失败，请稍后重试');
            return;
        }
        const result = await resp.json();
        displayPoemResult(result);
    } catch (e) {
        showToast('网络错误，请检查后端是否运行');
    } finally {
        btn.disabled = false;
        btn.textContent = '🔍 开始评析';
    }
}

function displayPoemResult(analysis) {
    const container = document.getElementById('poem-result');
    const top = analysis.top;
    const tags = analysis.tags || [];
    const stats = analysis.stats || {};
    const runnerUps = analysis.runner_ups || [];
    const imgPath = getAvatarPath(top.pinyin_id);

    const html = `<div class="analysis-result">
      <h4 style="color:var(--accent);margin-bottom:12px;font-size:1.1rem;">📊 评析报告</h4>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap;">
        <div class="result-poet-avatar" style="width:60px;height:60px;font-size:1.8rem;margin:0;">${imgPath ? `<img src="${imgPath}" alt="${top.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="emoji-fallback" style="display:none">${top.avatar_emoji}</span>` : `<span class="emoji-fallback">${top.avatar_emoji}</span>`}</div>
        <div><p style="font-weight:700;font-size:1.2rem;color:var(--accent);">最匹配诗人：<strong>${top.name}</strong></p>
        <p style="color:var(--gold);font-weight:600;">风格相似度：${top.match_pct}%</p><p style="font-size:0.8rem;color:#a09070;">${top.era}</p></div></div>
      <div class="analysis-tags">${tags.map(t => `<span class="analysis-tag">${t}</span>`).join('')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0;font-size:0.82rem;color:var(--text-light);">
        <div>📏 平均句长：<strong>${stats.avg_sentence_len}</strong> 字</div>
        <div>📝 总字数：<strong>${stats.total_chars}</strong></div>
        <div>📃 句数：<strong>${stats.sentence_count}</strong></div>
        <div>🗣 口语度：<strong>${Math.round(stats.oral_score * 100)}%</strong></div></div>
      <div class="result-desc" style="margin-top:12px;"><p style="margin-bottom:6px;"><strong>🔍 风格解读：</strong></p><p>${top.description}</p>
        <div class="highlight-box mt-12"><p style="font-size:0.85rem;color:var(--text-light);">「${(top.representative_poem || '').replace(/\n/g, '<br>')}」</p><p style="font-size:0.75rem;color:#a09070;margin-top:4px;">—— ${top.name} 代表诗句</p></div></div>
      ${runnerUps.length > 0 ? `<div style="margin-top:14px;text-align:left;"><p style="font-weight:600;color:var(--accent);margin-bottom:6px;font-size:0.9rem;">🏅 其他接近的诗人：</p>
        ${runnerUps.map((r, i) => `<div class="runner-up" style="font-size:0.85rem;"><span><strong>#${i+2}</strong> ${r.avatar_emoji} <span class="ru-name">${r.name}</span></span><span class="ru-pct">${r.display_pct}%</span></div>`).join('')}</div>` : ''}
      <p style="font-size:0.75rem;color:#b8a890;margin-top:14px;text-align:center;">⚠ 本评析基于关键词匹配与风格特征分析，仅供参考。诗歌的魅力在于其不可完全量化。</p></div>`;

    container.innerHTML = html;
    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearPoem() {
    document.getElementById('poem-input').value = '';
    document.getElementById('poem-result').classList.add('hidden');
    document.getElementById('poem-result').innerHTML = '';
}

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tab-test').classList.toggle('active', tab === 'test');
    document.getElementById('tab-poem').classList.toggle('active', tab === 'poem');
    document.getElementById('panel-test').classList.toggle('active', tab === 'test');
    document.getElementById('panel-poem').classList.toggle('active', tab === 'poem');
    if (tab === 'test') {
        document.getElementById('result-container').classList.add('hidden');
        document.getElementById('result-container').innerHTML = '';
        document.getElementById('nav-buttons').classList.remove('hidden');
        document.getElementById('page-dots').classList.remove('hidden');
        document.getElementById('btn-submit').classList.add('hidden');
        if (answers.filter(a => a !== null).length === 0 && currentPage !== 0) currentPage = 0;
        renderPage(currentPage);
        updateProgress();
        buildPageDots();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
}

document.addEventListener('DOMContentLoaded', () => { init(); });
document.addEventListener('keydown', (e) => {
    if (currentTab !== 'test') return;
    if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); nextPage(); }
    else if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); prevPage(); }
});

// ==================== 调试后门 ====================
// 按 Ctrl+Shift+D 打开调试面板
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDebug();
    }
});

function toggleDebug() {
    let panel = document.getElementById('debug-panel');
    if (panel) { panel.remove(); return; }

    panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.innerHTML = buildDebugHTML();
    document.body.appendChild(panel);
    updateDebugInfo();
}

function buildDebugHTML() {
    return `
    <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;">
      <div style="background:#1a1a2e;color:#e0e0e0;border-radius:12px;padding:24px;max-width:700px;width:90%;max-height:80vh;overflow-y:auto;font-family:monospace;font-size:13px;line-height:1.6;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="color:#ffd700;margin:0;">🔧 调试面板</h3>
          <button onclick="toggleDebug()" style="background:#cc3333;color:#fff;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:16px;">✕</button>
        </div>
        <div id="debug-content"></div>
        <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="debugFillRandom()" style="background:#4a6a8a;color:#fff;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:12px;">🎲 随机填充全部</button>
          <button onclick="debugResetAll()" style="background:#8a4a4a;color:#fff;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:12px;">🗑 清空全部</button>
          <button onclick="debugSubmit()" style="background:#8b6914;color:#fff;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:12px;">🚀 直接提交</button>
          <button onclick="toggleDebug()" style="background:#5a5a6a;color:#fff;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:12px;">✕ 关闭</button>
        </div>
        <p style="color:#888;font-size:11px;margin-top:12px;">快捷键: Ctrl+Shift+D 打开/关闭</p>
      </div>
    </div>`;
}

function updateDebugInfo() {
    const container = document.getElementById('debug-content');
    if (!container) return;

    const answered = answers.filter(a => a !== null).length;
    const pct = Math.round((answered / TOTAL_QUESTIONS) * 100);

    // 每题作答状态
    let qHtml = '';
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        const q = questionsData[i];
        const a = answers[i];
        const optText = a !== null ? q.options[a].text.substring(0, 20) : '—';
        const letter = a !== null ? String.fromCharCode(65 + a) : '?';
        qHtml += `<div style="display:flex;gap:6px;padding:2px 0;${a !== null ? 'color:#8f8;' : 'color:#888;'}">
          <span style="width:30px;flex-shrink:0;">#${i+1}</span>
          <span style="width:24px;flex-shrink:0;font-weight:bold;">${letter}</span>
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${optText}</span>
        </div>`;
    }

    // 分数计算
    const scores = {};
    poetKeys.forEach(k => { scores[k] = 0; });
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        const chosen = answers[i];
        if (chosen !== null) {
            const weights = questionsData[i].options[chosen].poetWeights;
            for (const [poetId, score] of Object.entries(weights)) {
                if (scores[poetId] !== undefined) scores[poetId] += score;
            }
        }
    }
    const sorted = poetKeys.map(k => ({ id: k, score: scores[k], ...poets[k] })).sort((a, b) => b.score - a.score);

    let scoreHtml = '';
    sorted.forEach((p, i) => {
        const barW = Math.round((p.score / Math.max(1, sorted[0].score)) * 100);
        scoreHtml += `<div style="display:flex;align-items:center;gap:8px;margin:3px 0;">
          <span style="width:24px;color:#ffd700;font-weight:bold;">#${i+1}</span>
          <span style="width:50px;">${p.avatar}</span>
          <span style="width:60px;">${p.name}</span>
          <div style="flex:1;height:14px;background:#333;border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${barW}%;background:linear-gradient(90deg,#b8860b,#ffd700);border-radius:3px;"></div>
          </div>
          <span style="width:50px;text-align:right;">${p.score}分</span>
        </div>`;
    });

    container.innerHTML = `
    <div style="margin-bottom:12px;display:flex;gap:16px;flex-wrap:wrap;padding:8px;background:#2a2a4e;border-radius:6px;">
      <span>已答: <strong style="color:#8f8;">${answered}</strong> / ${TOTAL_QUESTIONS} (${pct}%)</span>
      <span>当前页: ${currentPage + 1} / ${TOTAL_PAGES}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div style="background:#2a2a4e;border-radius:6px;padding:10px;">
        <p style="color:#ffd700;font-weight:bold;margin-bottom:6px;">📋 每题作答</p>
        <div style="max-height:300px;overflow-y:auto;font-size:12px;">${qHtml}</div>
      </div>
      <div style="background:#2a2a4e;border-radius:6px;padding:10px;">
        <p style="color:#ffd700;font-weight:bold;margin-bottom:6px;">🏆 诗人得分</p>
        <div style="max-height:300px;overflow-y:auto;">${scoreHtml}</div>
      </div>
    </div>`;
}

// 调试工具函数
function debugFillRandom() {
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        const optCount = questionsData[i].options.length;
        answers[i] = Math.floor(Math.random() * optCount);
    }
    renderPage(currentPage);
    updateProgress();
    updatePageDots();
    updateDebugInfo();
    showToast('已随机填充全部64题');
}

function debugResetAll() {
    answers = new Array(TOTAL_QUESTIONS).fill(null);
    renderPage(currentPage);
    updateProgress();
    updatePageDots();
    updateDebugInfo();
    showToast('已清空全部答案');
}

function debugSubmit() {
    toggleDebug();
    const answeredCount = answers.filter(a => a !== null).length;
    if (answeredCount < TOTAL_QUESTIONS) {
        if (!confirm(`还有 ${TOTAL_QUESTIONS - answeredCount} 题未答，确定提交？`)) return;
    }
    submitTest();
}
