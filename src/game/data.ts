// ─── 武林闲侠传 v4 · 游戏静态数据（数值见 design/数值设计.md）──────────────

export type SkillId =
  | 'herbalism' | 'mining' | 'woodcutting' | 'hunting' | 'fishing'
  | 'alchemy' | 'smithing' | 'cooking' | 'tailoring' | 'enhancing'
  | 'hp' | 'attack' | 'defense' | 'sword' | 'fist' | 'hidden' | 'inner'

export interface SkillDef {
  id: SkillId
  name: string
  icon: string
  group: 'gather' | 'craft' | 'combat'
  desc: string // 一句用途说明，展示在技能页标题下
}

export const SKILLS: SkillDef[] = [
  { id: 'herbalism', name: '采药', icon: '🌿', group: 'gather', desc: '采集草药，是炼丹与炼化方的原料来源' },
  { id: 'mining', name: '采矿', icon: '⛏️', group: 'gather', desc: '开采矿石，供锻造炼锭、打造兵器防具' },
  { id: 'woodcutting', name: '伐木', icon: '🪓', group: 'gather', desc: '砍伐木材，锻造兵器与制衣所需的辅料' },
  { id: 'hunting', name: '打猎', icon: '🏹', group: 'gather', desc: '狩猎野兽得肉与兽皮兽骨，供烹饪、制衣与炼丹' },
  { id: 'fishing', name: '钓鱼', icon: '🎣', group: 'gather', desc: '垂钓水产，烹饪的原料，偶有珍宝沉箱出水' },
  { id: 'alchemy', name: '炼丹', icon: '⚗️', group: 'craft', desc: '将药材炼成回血丹药、增益丹药，兼可将低级材料炼化为高级' },
  { id: 'smithing', name: '锻造', icon: '🔨', group: 'craft', desc: '炼矿石为锭、打锭与木材为兵器，是装备的最主要来源' },
  { id: 'cooking', name: '烹饪', icon: '🍳', group: 'craft', desc: '以猎物、鲜鱼烹制美食，食用回血，平替丹药' },
  { id: 'tailoring', name: '制衣', icon: '🧵', group: 'craft', desc: '以兽皮为主料缝制防具，护身减伤' },
  { id: 'enhancing', name: '强化', icon: '✨', group: 'craft', desc: '制作强化石，为已装备的兵器防具强化提升属性（上限 +20）' },
  { id: 'hp', name: '气血', icon: '❤️', group: 'combat', desc: '提升气血上限，等级越高越耐打（战斗时随击杀成长）' },
  { id: 'attack', name: '攻击', icon: '⚔️', group: 'combat', desc: '提升攻击力，直接增加伤害（战斗时随击杀成长）' },
  { id: 'defense', name: '防御', icon: '🛡️', group: 'combat', desc: '提升防御力，减少受击伤害（战斗时随击杀成长）' },
  { id: 'sword', name: '剑法', icon: '🗡️', group: 'combat', desc: '10% 暴击 ×1.8 倍伤害；克制弱剑的怪物 +18%' },
  { id: 'fist', name: '拳掌', icon: '👊', group: 'combat', desc: '15% 追加连击；克制弱拳的怪物 +18%' },
  { id: 'hidden', name: '暗器', icon: '🔪', group: 'combat', desc: '每只怪首回合伤害 +25%；克制弱暗器的怪物 +18%' },
  { id: 'inner', name: '内功', icon: '🌀', group: 'combat', desc: '回复伤害 8% 的血量，越战越勇；克制弱内功的怪物 +18%' },
]

export type ItemCategory = 'currency' | 'material' | 'food' | 'pill' | 'weapon' | 'armor' | 'amulet' | 'stone' | 'manual' | 'special'

export interface ItemDef {
  id: string
  name: string
  icon: string
  category: ItemCategory
  price: number
  heal?: number // -1 = 全恢复
  atk?: number
  def?: number
  buff?: 'atk' | 'def'
  xpPct?: number   // 饰品：经验加成
  coinPct?: number // 饰品：铜钱加成
  manual?: StyleId // 秘籍：使用后永久提升对应流派伤害（每本 +3%，上限 5 层）
}

export const ITEMS: Record<string, ItemDef> = {
  coin: { id: 'coin', name: '铜钱', icon: '🪙', category: 'currency', price: 1 },
  token: { id: 'token', name: '武林令', icon: '🎫', category: 'currency', price: 0 },
  labCoin: { id: 'labCoin', name: '秘境币', icon: '🪷', category: 'currency', price: 0 },

  // ── 药材（7 种）──
  gancao: { id: 'gancao', name: '甘草', icon: '🌱', category: 'material', price: 6 },
  heshouwu: { id: 'heshouwu', name: '何首乌', icon: '🫚', category: 'material', price: 18 },
  lingzhi: { id: 'lingzhi', name: '灵芝', icon: '🍄', category: 'material', price: 28 },
  xuelian: { id: 'xuelian', name: '雪莲', icon: '🪷', category: 'material', price: 72 },
  renshen: { id: 'renshen', name: '千年人参', icon: '🧅', category: 'material', price: 230 },
  zhuguo: { id: 'zhuguo', name: '朱果', icon: '🍒', category: 'material', price: 480 },
  jiuyeLingzhi: { id: 'jiuyeLingzhi', name: '九叶灵芝', icon: '🌺', category: 'material', price: 880 },
  jinyinhua: { id: 'jinyinhua', name: '金银花', icon: '🌼', category: 'material', price: 9 },
  fuling: { id: 'fuling', name: '茯苓', icon: '🍠', category: 'material', price: 24 },
  danggui: { id: 'danggui', name: '当归', icon: '🌾', category: 'material', price: 42 },
  longxian: { id: 'longxian', name: '龙涎草', icon: '🍀', category: 'material', price: 110 },
  tianshanXueshen: { id: 'tianshanXueshen', name: '天山雪参', icon: '❄️', category: 'material', price: 320 },
  xianlingcao: { id: 'xianlingcao', name: '仙灵草', icon: '🪻', category: 'material', price: 1200 },
  undyingGrass: { id: 'undyingGrass', name: '不死草', icon: '🍃', category: 'material', price: 1800 },
  hundunLotus: { id: 'hundunLotus', name: '混沌青莲', icon: '💮', category: 'material', price: 2600 },

  // ── 矿石（7 种）──
  copper: { id: 'copper', name: '铜矿', icon: '🟤', category: 'material', price: 7 },
  silver: { id: 'silver', name: '银矿', icon: '⚪', category: 'material', price: 20 },
  iron: { id: 'iron', name: '铁矿', icon: '⚙️', category: 'material', price: 30 },
  xuantie: { id: 'xuantie', name: '玄铁', icon: '⬛', category: 'material', price: 85 },
  meteor: { id: 'meteor', name: '陨星铁', icon: '☄️', category: 'material', price: 270 },
  coldIron: { id: 'coldIron', name: '深海寒铁', icon: '🧊', category: 'material', price: 520 },
  godIron: { id: 'godIron', name: '九天神铁', icon: '🌌', category: 'material', price: 960 },
  tin: { id: 'tin', name: '锡矿', icon: '⬜', category: 'material', price: 10 },
  coal: { id: 'coal', name: '煤炭', icon: '⚫', category: 'material', price: 14 },
  chitong: { id: 'chitong', name: '赤铜', icon: '🟧', category: 'material', price: 44 },
  zijin: { id: 'zijin', name: '紫金', icon: '🟣', category: 'material', price: 130 },
  xingsha: { id: 'xingsha', name: '星砂', icon: '🌟', category: 'material', price: 380 },
  hundunStone: { id: 'hundunStone', name: '混沌原石', icon: '🌀', category: 'material', price: 1300 },
  taiyiGold: { id: 'taiyiGold', name: '太乙精金', icon: '🔶', category: 'material', price: 1900 },
  hongmengCrystal: { id: 'hongmengCrystal', name: '鸿蒙紫晶', icon: '💜', category: 'material', price: 2800 },

  // ── 木材（8 种）──
  pine: { id: 'pine', name: '松木', icon: '🪵', category: 'material', price: 6 },
  cypress: { id: 'cypress', name: '柏木', icon: '🌲', category: 'material', price: 19 },
  shanmu: { id: 'shanmu', name: '杉木', icon: '🎋', category: 'material', price: 34 },
  zitan: { id: 'zitan', name: '紫檀', icon: '🟪', category: 'material', price: 78 },
  chenxiang: { id: 'chenxiang', name: '沉香木', icon: '🟫', category: 'material', price: 180 },
  nammu: { id: 'nammu', name: '金丝楠木', icon: '🟨', category: 'material', price: 340 },
  wutong: { id: 'wutong', name: '梧桐神木', icon: '🌳', category: 'material', price: 620 },
  jianmu: { id: 'jianmu', name: '建木', icon: '🎄', category: 'material', price: 1100 },
  bamboo: { id: 'bamboo', name: '青竹', icon: '🎍', category: 'material', price: 9 },
  taomu: { id: 'taomu', name: '桃木', icon: '🍑', category: 'material', price: 26 },
  huali: { id: 'huali', name: '花梨木', icon: '🟫', category: 'material', price: 48 },
  wumu: { id: 'wumu', name: '乌木', icon: '🌑', category: 'material', price: 120 },
  kunlunmu: { id: 'kunlunmu', name: '昆仑神木', icon: '🏔️', category: 'material', price: 1500 },
  dragonBloodWood: { id: 'dragonBloodWood', name: '龙血木', icon: '🟥', category: 'material', price: 2000 },
  yggdrasil: { id: 'yggdrasil', name: '世界树枝', icon: '☘️', category: 'material', price: 3000 },

  // ── 猎物（10 种）──
  rabbitMeat: { id: 'rabbitMeat', name: '兔肉', icon: '🍖', category: 'material', price: 10 },
  chickenMeat: { id: 'chickenMeat', name: '山鸡肉', icon: '🍗', category: 'material', price: 16 },
  boarMeat: { id: 'boarMeat', name: '野猪肉', icon: '🥩', category: 'material', price: 28 },
  wolfMeat: { id: 'wolfMeat', name: '狼肉', icon: '🦴', category: 'material', price: 62 },
  tigerMeat: { id: 'tigerMeat', name: '虎肉', icon: '🥓', category: 'material', price: 160 },
  auspiceMeat: { id: 'auspiceMeat', name: '瑞兽肉', icon: '🦄', category: 'material', price: 400 },
  fierceMeat: { id: 'fierceMeat', name: '凶兽肉', icon: '👹', category: 'material', price: 720 },
  hide: { id: 'hide', name: '兽皮', icon: '🟧', category: 'material', price: 12 },
  bone: { id: 'bone', name: '兽骨', icon: '🦴', category: 'material', price: 18 },
  sinew: { id: 'sinew', name: '兽筋', icon: '🪢', category: 'material', price: 45 },
  neidan: { id: 'neidan', name: '内丹', icon: '🔮', category: 'material', price: 300 },
  deerMeat: { id: 'deerMeat', name: '鹿肉', icon: '🦌', category: 'material', price: 12 },
  snakeMeat: { id: 'snakeMeat', name: '蛇肉', icon: '🐍', category: 'material', price: 22 },
  bearMeat: { id: 'bearMeat', name: '熊肉', icon: '🐻', category: 'material', price: 40 },
  leopardMeat: { id: 'leopardMeat', name: '豹肉', icon: '🐆', category: 'material', price: 75 },
  jiaolongMeat: { id: 'jiaolongMeat', name: '蛟龙肉', icon: '🦕', category: 'material', price: 480 },
  taotieMeat: { id: 'taotieMeat', name: '饕餮肉', icon: '🦬', category: 'material', price: 980 },
  baizeMeat: { id: 'baizeMeat', name: '白泽肉', icon: '🦁', category: 'material', price: 1400 },
  zhulongMeat: { id: 'zhulongMeat', name: '烛龙肉', icon: '🧡', category: 'material', price: 2200 },

  // ── 鱼类（8 种）──
  crucian: { id: 'crucian', name: '鲫鱼', icon: '🐟', category: 'material', price: 11 },
  caoyu: { id: 'caoyu', name: '草鱼', icon: '🐡', category: 'material', price: 17 },
  carp: { id: 'carp', name: '鲤鱼', icon: '🐠', category: 'material', price: 29 },
  guiyu: { id: 'guiyu', name: '鳜鱼', icon: '🦈', category: 'material', price: 48 },
  koi: { id: 'koi', name: '锦鲤', icon: '🎏', category: 'material', price: 90 },
  dragonFish: { id: 'dragonFish', name: '龙鱼', icon: '🐉', category: 'material', price: 290 },
  kun: { id: 'kun', name: '鲲', icon: '🐋', category: 'material', price: 640 },
  yinglong: { id: 'yinglong', name: '应龙', icon: '🐲', category: 'material', price: 1150 },
  shrimp: { id: 'shrimp', name: '河虾', icon: '🦐', category: 'material', price: 13 },
  crab: { id: 'crab', name: '河蟹', icon: '🦀', category: 'material', price: 26 },
  octopus: { id: 'octopus', name: '章鱼', icon: '🐙', category: 'material', price: 40 },
  seaTurtle: { id: 'seaTurtle', name: '海龟', icon: '🐢', category: 'material', price: 140 },
  xuanwuFish: { id: 'xuanwuFish', name: '玄武', icon: '🔵', category: 'material', price: 1600 },
  kunpeng: { id: 'kunpeng', name: '鲲鹏', icon: '🕊️', category: 'material', price: 2400 },

  // ── 锭（5 种）──
  copperIngot: { id: 'copperIngot', name: '铜锭', icon: '🧱', category: 'material', price: 18 },
  ironIngot: { id: 'ironIngot', name: '铁锭', icon: '🔩', category: 'material', price: 68 },
  steelIngot: { id: 'steelIngot', name: '钢锭', icon: '⛓️', category: 'material', price: 160 },
  xuantieIngot: { id: 'xuantieIngot', name: '玄铁锭', icon: '🖤', category: 'material', price: 190 },
  starIngot: { id: 'starIngot', name: '星辰锭', icon: '✨', category: 'material', price: 560 },
  tinIngot: { id: 'tinIngot', name: '锡锭', icon: '⬜', category: 'material', price: 26 },
  chitongIngot: { id: 'chitongIngot', name: '赤铜锭', icon: '🟧', category: 'material', price: 95 },
  zijinIngot: { id: 'zijinIngot', name: '紫金锭', icon: '🟣', category: 'material', price: 280 },
  xuanjing: { id: 'xuanjing', name: '玄晶', icon: '🔮', category: 'material', price: 150 },

  // ── 食物（8 味）──
  roastRabbit: { id: 'roastRabbit', name: '烤兔肉', icon: '🍢', category: 'food', price: 20, heal: 30 },
  jiaohuaChicken: { id: 'jiaohuaChicken', name: '叫花鸡', icon: '🍗', category: 'food', price: 40, heal: 55 },
  braisedPork: { id: 'braisedPork', name: '红烧肉', icon: '🍲', category: 'food', price: 65, heal: 90 },
  carpSoup: { id: 'carpSoup', name: '鲤鱼汤', icon: '🥣', category: 'food', price: 110, heal: 180 },
  wolfJerky: { id: 'wolfJerky', name: '狼肉干', icon: '🥩', category: 'food', price: 190, heal: 300 },
  fotiaoqiang: { id: 'fotiaoqiang', name: '佛跳墙', icon: '🍜', category: 'food', price: 620, heal: 600 },
  qilinFeast: { id: 'qilinFeast', name: '麒麟宴', icon: '🍱', category: 'food', price: 1300, heal: 1000 },
  dragonFeast: { id: 'dragonFeast', name: '龙肝凤髓', icon: '🍲', category: 'food', price: 2600, heal: 2000 },
  deerSkewer: { id: 'deerSkewer', name: '烤鹿肉串', icon: '🍖', category: 'food', price: 24, heal: 45 },
  shrimpShumai: { id: 'shrimpShumai', name: '虾仁烧卖', icon: '🍤', category: 'food', price: 26, heal: 50 },
  snakeSoup: { id: 'snakeSoup', name: '龙凤蛇羹', icon: '🫕', category: 'food', price: 45, heal: 75 },
  crabRoe: { id: 'crabRoe', name: '蟹黄汤包', icon: '🥟', category: 'food', price: 60, heal: 100 },
  bearPaw: { id: 'bearPaw', name: '红烧熊掌', icon: '🐾', category: 'food', price: 120, heal: 160 },
  octopusBall: { id: 'octopusBall', name: '章鱼丸子', icon: '🍡', category: 'food', price: 105, heal: 150 },
  leopardJerky: { id: 'leopardJerky', name: '风豹肉干', icon: '🥓', category: 'food', price: 240, heal: 320 },
  turtleSoup: { id: 'turtleSoup', name: '海龟珍汤', icon: '🥘', category: 'food', price: 420, heal: 420 },
  jiaolongDish: { id: 'jiaolongDish', name: '蛟龙闹海宴', icon: '🍛', category: 'food', price: 1600, heal: 900 },
  taotieFeast: { id: 'taotieFeast', name: '饕餮盛宴', icon: '🧆', category: 'food', price: 3200, heal: 1600 },
  zhulongFeast: { id: 'zhulongFeast', name: '烛龙宴', icon: '🎇', category: 'food', price: 4200, heal: 2600 },
  kunpengDish: { id: 'kunpengDish', name: '鲲鹏九变', icon: '🌠', category: 'food', price: 5600, heal: 3400 },

  // ── 丹药（8 种）──
  jinchuang: { id: 'jinchuang', name: '金疮药', icon: '💊', category: 'pill', price: 30, heal: 60 },
  juqi: { id: 'juqi', name: '聚气丹', icon: '🔴', category: 'pill', price: 95, heal: 150 },
  dahuan: { id: 'dahuan', name: '大还丹', icon: '🟣', category: 'pill', price: 290, heal: 400 },
  jiuzhuan: { id: 'jiuzhuan', name: '九转金丹', icon: '🟡', category: 'pill', price: 950, heal: -1 },
  daliwan: { id: 'daliwan', name: '大力丸', icon: '🔥', category: 'pill', price: 150, buff: 'atk' },
  tiebushan: { id: 'tiebushan', name: '铁布衫丹', icon: '🛡️', category: 'pill', price: 150, buff: 'def' },
  taiShangDan: { id: 'taiShangDan', name: '太上还魂丹', icon: '🌕', category: 'pill', price: 1800, heal: 1500 },
  jiuxiaoDan: { id: 'jiuxiaoDan', name: '九霄云丹', icon: '🌈', category: 'pill', price: 3600, heal: -1 },
  tea: { id: 'tea', name: '悟道茶', icon: '🍵', category: 'pill', price: 500 },
  xiaohuan: { id: 'xiaohuan', name: '小还丹', icon: '🟠', category: 'pill', price: 60, heal: 100 },
  zixiaDan: { id: 'zixiaDan', name: '紫霞丹', icon: '🟪', category: 'pill', price: 1400, heal: 700 },
  busiDan: { id: 'busiDan', name: '不死仙丹', icon: '💫', category: 'pill', price: 6000, heal: -1 },

  // ── 武器（7 把）──
  ironSword: { id: 'ironSword', name: '铁剑', icon: '🗡️', category: 'weapon', price: 120, atk: 6 },
  steelBlade: { id: 'steelBlade', name: '钢刀', icon: '🔪', category: 'weapon', price: 300, atk: 11 },
  steelSword: { id: 'steelSword', name: '精钢剑', icon: '⚔️', category: 'weapon', price: 480, atk: 16 },
  xuantieSword: { id: 'xuantieSword', name: '玄铁重剑', icon: '🔱', category: 'weapon', price: 1500, atk: 34 },
  meteorBlade: { id: 'meteorBlade', name: '陨星神兵', icon: '💫', category: 'weapon', price: 5200, atk: 55 },
  dragonSword: { id: 'dragonSword', name: '龙吟剑', icon: '🐉', category: 'weapon', price: 12000, atk: 82 },
  xuanyuanSword: { id: 'xuanyuanSword', name: '轩辕神剑', icon: '👑', category: 'weapon', price: 30000, atk: 128 },
  copperBlade: { id: 'copperBlade', name: '铜刀', icon: '🔪', category: 'weapon', price: 60, atk: 4 },
  ironSpear: { id: 'ironSpear', name: '铁枪', icon: '🔱', category: 'weapon', price: 280, atk: 11 },
  wujinBlade: { id: 'wujinBlade', name: '乌金刀', icon: '⚔️', category: 'weapon', price: 900, atk: 26 },
  qimenFan: { id: 'qimenFan', name: '奇门扇', icon: '🪭', category: 'weapon', price: 3200, atk: 40 },
  pozhanAxe: { id: 'pozhanAxe', name: '破山斧', icon: '🪓', category: 'weapon', price: 7000, atk: 62 },
  tianwenSword: { id: 'tianwenSword', name: '天问剑', icon: '⚜️', category: 'weapon', price: 18000, atk: 100 },
  dragonSlayer: { id: 'dragonSlayer', name: '屠龙刀', icon: '🔪', category: 'weapon', price: 26000, atk: 115 },
  fangtianHalberd: { id: 'fangtianHalberd', name: '方天画戟', icon: '🔱', category: 'weapon', price: 34000, atk: 135 },
  zhuxianSword: { id: 'zhuxianSword', name: '诛仙剑', icon: '⚡', category: 'weapon', price: 60000, atk: 160 },

  // ── 防具（7 件）──
  clothArmor: { id: 'clothArmor', name: '布衣', icon: '👘', category: 'armor', price: 70, def: 4 },
  leatherArmor: { id: 'leatherArmor', name: '皮甲', icon: '🦺', category: 'armor', price: 320, def: 10 },
  chainmail: { id: 'chainmail', name: '锁子甲', icon: '🥋', category: 'armor', price: 650, def: 15 },
  goldArmor: { id: 'goldArmor', name: '金丝甲', icon: '🎽', category: 'armor', price: 1200, def: 22 },
  tiancanArmor: { id: 'tiancanArmor', name: '天蚕宝甲', icon: '🧥', category: 'armor', price: 4200, def: 38 },
  xuanwuArmor: { id: 'xuanwuArmor', name: '玄武宝甲', icon: '🐢', category: 'armor', price: 9800, def: 56 },
  tiangangArmor: { id: 'tiangangArmor', name: '天罡战甲', icon: '⚜️', category: 'armor', price: 24000, def: 88 },
  tengArmor: { id: 'tengArmor', name: '藤甲', icon: '🎋', category: 'armor', price: 150, def: 6 },
  tieArmor: { id: 'tieArmor', name: '铁甲', icon: '🥋', category: 'armor', price: 500, def: 12 },
  yinsiArmor: { id: 'yinsiArmor', name: '银丝甲', icon: '🎽', category: 'armor', price: 950, def: 18 },
  longlinArmor: { id: 'longlinArmor', name: '龙鳞甲', icon: '🐉', category: 'armor', price: 5200, def: 45 },
  hundunArmor: { id: 'hundunArmor', name: '混沌战甲', icon: '🌌', category: 'armor', price: 36000, def: 115 },
  hongmengRobe: { id: 'hongmengRobe', name: '鸿蒙道袍', icon: '🔮', category: 'armor', price: 52000, def: 140 },

  // ── 饰品（秘境商店）──
  jadePendant: { id: 'jadePendant', name: '玉佩', icon: '📿', category: 'amulet', price: 0, xpPct: 5 },
  tigerTally: { id: 'tigerTally', name: '虎符', icon: '🐯', category: 'amulet', price: 0, atk: 8 },
  xuanwuPendant: { id: 'xuanwuPendant', name: '玄武佩', icon: '🐢', category: 'amulet', price: 0, def: 8 },
  treasureCharm: { id: 'treasureCharm', name: '聚宝符', icon: '🧧', category: 'amulet', price: 0, coinPct: 10 },

  // ── 强化材料（4 种）──
  stone: { id: 'stone', name: '强化石', icon: '🪨', category: 'stone', price: 45 },
  fineStone: { id: 'fineStone', name: '精锻石', icon: '💎', category: 'stone', price: 150 },
  meteorCrystal: { id: 'meteorCrystal', name: '天外陨晶', icon: '💠', category: 'stone', price: 500 },
  qiankunCrystal: { id: 'qiankunCrystal', name: '乾坤灵晶', icon: '🔷', category: 'stone', price: 1600 },

  // ── 特殊 ──
  chest: { id: 'chest', name: '沉船宝箱', icon: '🧰', category: 'special', price: 0 },

  // ── 武学秘籍（boss 掉落，每流派上限 5 层，每层伤害 +3%）──
  swordManual: { id: 'swordManual', name: '剑谱残页', icon: '📜', category: 'manual', price: 800, manual: 'sword' },
  fistManual: { id: 'fistManual', name: '拳谱残页', icon: '📖', category: 'manual', price: 800, manual: 'fist' },
  hiddenManual: { id: 'hiddenManual', name: '暗器谱残页', icon: '📓', category: 'manual', price: 800, manual: 'hidden' },
  innerManual: { id: 'innerManual', name: '内功心法残页', icon: '📕', category: 'manual', price: 800, manual: 'inner' },
}

export interface ActionDef {
  id: string
  skill: SkillId
  name: string
  icon: string
  levelReq: number
  timeSec: number
  xp: number
  inputs?: { item: string; count: number }[]
  outputs: { item: string; count: number; chance?: number }[]
}

export const ACTIONS: ActionDef[] = [
  // ── 采药（13 档）──
  { id: 'gancao', skill: 'herbalism', name: '采甘草', icon: '🌱', levelReq: 1, timeSec: 4, xp: 8, outputs: [{ item: 'gancao', count: 2 }] },
  { id: 'jinyinhua', skill: 'herbalism', name: '采金银花', icon: '🌼', levelReq: 3, timeSec: 5, xp: 11, outputs: [{ item: 'jinyinhua', count: 2 }] },
  { id: 'heshouwu', skill: 'herbalism', name: '采何首乌', icon: '🫚', levelReq: 6, timeSec: 6, xp: 16, outputs: [{ item: 'heshouwu', count: 1 }] },
  { id: 'fuling', skill: 'herbalism', name: '采茯苓', icon: '🍠', levelReq: 9, timeSec: 6, xp: 20, outputs: [{ item: 'fuling', count: 1 }] },
  { id: 'lingzhi', skill: 'herbalism', name: '采灵芝', icon: '🍄', levelReq: 12, timeSec: 7, xp: 24, outputs: [{ item: 'lingzhi', count: 1 }] },
  { id: 'danggui', skill: 'herbalism', name: '采当归', icon: '🌾', levelReq: 16, timeSec: 8, xp: 36, outputs: [{ item: 'danggui', count: 1 }] },
  { id: 'xuelian', skill: 'herbalism', name: '采雪莲', icon: '🪷', levelReq: 20, timeSec: 10, xp: 48, outputs: [{ item: 'xuelian', count: 1 }] },
  { id: 'longxian', skill: 'herbalism', name: '采龙涎草', icon: '🍀', levelReq: 24, timeSec: 11, xp: 62, outputs: [{ item: 'longxian', count: 1 }] },
  { id: 'renshen', skill: 'herbalism', name: '采千年人参', icon: '🧅', levelReq: 30, timeSec: 14, xp: 95, outputs: [{ item: 'renshen', count: 1 }] },
  { id: 'tianshanXueshen', skill: 'herbalism', name: '采天山雪参', icon: '❄️', levelReq: 36, timeSec: 16, xp: 135, outputs: [{ item: 'tianshanXueshen', count: 1 }] },
  { id: 'zhuguo', skill: 'herbalism', name: '采朱果', icon: '🍒', levelReq: 40, timeSec: 18, xp: 160, outputs: [{ item: 'zhuguo', count: 1 }] },
  { id: 'jiuyeLingzhi', skill: 'herbalism', name: '采九叶灵芝', icon: '🌺', levelReq: 50, timeSec: 22, xp: 250, outputs: [{ item: 'jiuyeLingzhi', count: 1 }] },
  { id: 'xianlingcao', skill: 'herbalism', name: '采仙灵草', icon: '🪻', levelReq: 58, timeSec: 26, xp: 400, outputs: [{ item: 'xianlingcao', count: 1 }] },
  { id: 'undyingGrass', skill: 'herbalism', name: '采不死草', icon: '🍃', levelReq: 64, timeSec: 30, xp: 560, outputs: [{ item: 'undyingGrass', count: 1 }] },
  { id: 'hundunLotus', skill: 'herbalism', name: '采混沌青莲', icon: '💮', levelReq: 70, timeSec: 34, xp: 720, outputs: [{ item: 'hundunLotus', count: 1 }] },
  // ── 采矿（13 档）──
  { id: 'copper', skill: 'mining', name: '挖铜矿', icon: '🟤', levelReq: 1, timeSec: 4, xp: 9, outputs: [{ item: 'copper', count: 2 }] },
  { id: 'tin', skill: 'mining', name: '挖锡矿', icon: '⬜', levelReq: 3, timeSec: 5, xp: 12, outputs: [{ item: 'tin', count: 2 }] },
  { id: 'silver', skill: 'mining', name: '挖银矿', icon: '⚪', levelReq: 6, timeSec: 6, xp: 17, outputs: [{ item: 'silver', count: 1 }] },
  { id: 'coal', skill: 'mining', name: '挖煤炭', icon: '⚫', levelReq: 9, timeSec: 6, xp: 21, outputs: [{ item: 'coal', count: 2 }] },
  { id: 'iron', skill: 'mining', name: '挖铁矿', icon: '⚙️', levelReq: 12, timeSec: 7, xp: 26, outputs: [{ item: 'iron', count: 1 }] },
  { id: 'chitong', skill: 'mining', name: '挖赤铜', icon: '🟧', levelReq: 16, timeSec: 8, xp: 38, outputs: [{ item: 'chitong', count: 1 }] },
  { id: 'xuantie', skill: 'mining', name: '挖玄铁', icon: '⬛', levelReq: 20, timeSec: 11, xp: 52, outputs: [{ item: 'xuantie', count: 1 }] },
  { id: 'zijin', skill: 'mining', name: '挖紫金', icon: '🟣', levelReq: 26, timeSec: 12, xp: 70, outputs: [{ item: 'zijin', count: 1 }] },
  { id: 'meteor', skill: 'mining', name: '挖陨星铁', icon: '☄️', levelReq: 30, timeSec: 15, xp: 105, outputs: [{ item: 'meteor', count: 1 }] },
  { id: 'xingsha', skill: 'mining', name: '淘星砂', icon: '🌟', levelReq: 36, timeSec: 16, xp: 140, outputs: [{ item: 'xingsha', count: 1 }] },
  { id: 'coldIron', skill: 'mining', name: '挖深海寒铁', icon: '🧊', levelReq: 40, timeSec: 18, xp: 170, outputs: [{ item: 'coldIron', count: 1 }] },
  { id: 'godIron', skill: 'mining', name: '挖九天神铁', icon: '🌌', levelReq: 50, timeSec: 22, xp: 270, outputs: [{ item: 'godIron', count: 1 }] },
  { id: 'hundunStone', skill: 'mining', name: '采混沌原石', icon: '🌀', levelReq: 58, timeSec: 26, xp: 420, outputs: [{ item: 'hundunStone', count: 1 }] },
  { id: 'taiyiGold', skill: 'mining', name: '炼太乙精金', icon: '🔶', levelReq: 64, timeSec: 30, xp: 580, outputs: [{ item: 'taiyiGold', count: 1 }] },
  { id: 'hongmengCrystal', skill: 'mining', name: '采鸿蒙紫晶', icon: '💜', levelReq: 70, timeSec: 34, xp: 740, outputs: [{ item: 'hongmengCrystal', count: 1 }] },
  // ── 伐木（13 档）──
  { id: 'pine', skill: 'woodcutting', name: '砍松木', icon: '🌲', levelReq: 1, timeSec: 4, xp: 8, outputs: [{ item: 'pine', count: 2 }] },
  { id: 'bamboo', skill: 'woodcutting', name: '砍青竹', icon: '🎍', levelReq: 4, timeSec: 5, xp: 13, outputs: [{ item: 'bamboo', count: 2 }] },
  { id: 'cypress', skill: 'woodcutting', name: '砍柏木', icon: '🌳', levelReq: 7, timeSec: 6, xp: 17, outputs: [{ item: 'cypress', count: 1 }] },
  { id: 'taomu', skill: 'woodcutting', name: '砍桃木', icon: '🍑', levelReq: 10, timeSec: 7, xp: 24, outputs: [{ item: 'taomu', count: 1 }] },
  { id: 'shanmu', skill: 'woodcutting', name: '砍杉木', icon: '🎋', levelReq: 14, timeSec: 8, xp: 30, outputs: [{ item: 'shanmu', count: 1 }] },
  { id: 'huali', skill: 'woodcutting', name: '砍花梨木', icon: '🟫', levelReq: 17, timeSec: 9, xp: 44, outputs: [{ item: 'huali', count: 1 }] },
  { id: 'zitan', skill: 'woodcutting', name: '砍紫檀', icon: '🪵', levelReq: 21, timeSec: 10, xp: 52, outputs: [{ item: 'zitan', count: 1 }] },
  { id: 'wumu', skill: 'woodcutting', name: '砍乌木', icon: '🌑', levelReq: 25, timeSec: 12, xp: 72, outputs: [{ item: 'wumu', count: 1 }] },
  { id: 'chenxiang', skill: 'woodcutting', name: '砍沉香木', icon: '🎍', levelReq: 29, timeSec: 13, xp: 90, outputs: [{ item: 'chenxiang', count: 1 }] },
  { id: 'nammu', skill: 'woodcutting', name: '砍金丝楠木', icon: '🌴', levelReq: 38, timeSec: 16, xp: 150, outputs: [{ item: 'nammu', count: 1 }] },
  { id: 'wutong', skill: 'woodcutting', name: '砍梧桐神木', icon: '🌳', levelReq: 46, timeSec: 20, xp: 220, outputs: [{ item: 'wutong', count: 1 }] },
  { id: 'jianmu', skill: 'woodcutting', name: '砍建木', icon: '🎄', levelReq: 56, timeSec: 24, xp: 330, outputs: [{ item: 'jianmu', count: 1 }] },
  { id: 'kunlunmu', skill: 'woodcutting', name: '砍昆仑神木', icon: '🏔️', levelReq: 60, timeSec: 28, xp: 480, outputs: [{ item: 'kunlunmu', count: 1 }] },
  { id: 'dragonBloodWood', skill: 'woodcutting', name: '砍龙血木', icon: '🟥', levelReq: 64, timeSec: 30, xp: 600, outputs: [{ item: 'dragonBloodWood', count: 1 }] },
  { id: 'yggdrasil', skill: 'woodcutting', name: '砍世界树枝', icon: '☘️', levelReq: 70, timeSec: 34, xp: 760, outputs: [{ item: 'yggdrasil', count: 1 }] },
  // ── 打猎（14 档）──
  { id: 'rabbit', skill: 'hunting', name: '猎野兔', icon: '🐇', levelReq: 1, timeSec: 5, xp: 10, outputs: [{ item: 'rabbitMeat', count: 1 }, { item: 'hide', count: 1, chance: 0.3 }] },
  { id: 'deer', skill: 'hunting', name: '猎麋鹿', icon: '🦌', levelReq: 3, timeSec: 5, xp: 13, outputs: [{ item: 'deerMeat', count: 1 }, { item: 'hide', count: 1, chance: 0.3 }] },
  { id: 'chicken', skill: 'hunting', name: '猎山鸡', icon: '🐔', levelReq: 5, timeSec: 6, xp: 15, outputs: [{ item: 'chickenMeat', count: 1 }, { item: 'hide', count: 1, chance: 0.3 }] },
  { id: 'snake', skill: 'hunting', name: '猎巨蟒', icon: '🐍', levelReq: 8, timeSec: 7, xp: 22, outputs: [{ item: 'snakeMeat', count: 1 }, { item: 'hide', count: 1 }] },
  { id: 'boar', skill: 'hunting', name: '猎野猪', icon: '🐗', levelReq: 11, timeSec: 8, xp: 26, outputs: [{ item: 'boarMeat', count: 1 }, { item: 'hide', count: 1, chance: 0.5 }, { item: 'bone', count: 1, chance: 0.2 }] },
  { id: 'bear', skill: 'hunting', name: '猎棕熊', icon: '🐻', levelReq: 15, timeSec: 9, xp: 42, outputs: [{ item: 'bearMeat', count: 1 }, { item: 'hide', count: 2 }, { item: 'bone', count: 1, chance: 0.3 }] },
  { id: 'wolf', skill: 'hunting', name: '猎雪狼', icon: '🐺', levelReq: 19, timeSec: 11, xp: 54, outputs: [{ item: 'wolfMeat', count: 1 }, { item: 'hide', count: 2 }, { item: 'bone', count: 1, chance: 0.4 }] },
  { id: 'leopard', skill: 'hunting', name: '猎雪豹', icon: '🐆', levelReq: 22, timeSec: 12, xp: 68, outputs: [{ item: 'leopardMeat', count: 1 }, { item: 'hide', count: 2 }, { item: 'sinew', count: 1, chance: 0.3 }] },
  { id: 'tiger', skill: 'hunting', name: '猎猛虎', icon: '🐅', levelReq: 27, timeSec: 14, xp: 100, outputs: [{ item: 'tigerMeat', count: 1 }, { item: 'hide', count: 2 }, { item: 'sinew', count: 1, chance: 0.4 }] },
  { id: 'whiteTiger', skill: 'hunting', name: '猎白虎', icon: '🐯', levelReq: 36, timeSec: 17, xp: 160, outputs: [{ item: 'tigerMeat', count: 2 }, { item: 'sinew', count: 1 }, { item: 'neidan', count: 1, chance: 0.15 }] },
  { id: 'qilin', skill: 'hunting', name: '猎麒麟', icon: '🦄', levelReq: 44, timeSec: 20, xp: 230, outputs: [{ item: 'auspiceMeat', count: 1 }, { item: 'hide', count: 3 }, { item: 'neidan', count: 1, chance: 0.25 }] },
  { id: 'jiaolong', skill: 'hunting', name: '猎蛟龙', icon: '🦕', levelReq: 48, timeSec: 21, xp: 260, outputs: [{ item: 'jiaolongMeat', count: 1 }, { item: 'hide', count: 3 }, { item: 'neidan', count: 1, chance: 0.2 }] },
  { id: 'qiongqi', skill: 'hunting', name: '猎穷奇', icon: '👹', levelReq: 54, timeSec: 24, xp: 350, outputs: [{ item: 'fierceMeat', count: 1 }, { item: 'hide', count: 4 }, { item: 'neidan', count: 2, chance: 0.3 }] },
  { id: 'taotie', skill: 'hunting', name: '猎饕餮', icon: '🦬', levelReq: 60, timeSec: 26, xp: 460, outputs: [{ item: 'taotieMeat', count: 1 }, { item: 'hide', count: 5 }, { item: 'neidan', count: 2, chance: 0.35 }] },
  { id: 'baize', skill: 'hunting', name: '猎白泽', icon: '🦁', levelReq: 64, timeSec: 30, xp: 600, outputs: [{ item: 'baizeMeat', count: 1 }, { item: 'hide', count: 5 }, { item: 'neidan', count: 2, chance: 0.4 }] },
  { id: 'zhulong', skill: 'hunting', name: '猎烛龙', icon: '🧡', levelReq: 70, timeSec: 34, xp: 780, outputs: [{ item: 'zhulongMeat', count: 1 }, { item: 'hide', count: 6 }, { item: 'neidan', count: 3, chance: 0.5 }] },
  // ── 钓鱼（12 档）──
  { id: 'crucian', skill: 'fishing', name: '钓鲫鱼', icon: '🐟', levelReq: 1, timeSec: 5, xp: 9, outputs: [{ item: 'crucian', count: 1 }] },
  { id: 'shrimp', skill: 'fishing', name: '捕河虾', icon: '🦐', levelReq: 4, timeSec: 5, xp: 12, outputs: [{ item: 'shrimp', count: 1 }] },
  { id: 'caoyu', skill: 'fishing', name: '钓草鱼', icon: '🐡', levelReq: 6, timeSec: 6, xp: 15, outputs: [{ item: 'caoyu', count: 1 }] },
  { id: 'crab', skill: 'fishing', name: '捕河蟹', icon: '🦀', levelReq: 10, timeSec: 7, xp: 22, outputs: [{ item: 'crab', count: 1 }] },
  { id: 'carp', skill: 'fishing', name: '钓鲤鱼', icon: '🐠', levelReq: 12, timeSec: 8, xp: 25, outputs: [{ item: 'carp', count: 1 }] },
  { id: 'octopus', skill: 'fishing', name: '钓章鱼', icon: '🐙', levelReq: 16, timeSec: 9, xp: 38, outputs: [{ item: 'octopus', count: 1 }, { item: 'chest', count: 1, chance: 0.03 }] },
  { id: 'guiyu', skill: 'fishing', name: '钓鳜鱼', icon: '🦈', levelReq: 18, timeSec: 10, xp: 42, outputs: [{ item: 'guiyu', count: 1 }] },
  { id: 'koi', skill: 'fishing', name: '钓锦鲤', icon: '🎏', levelReq: 24, timeSec: 12, xp: 65, outputs: [{ item: 'koi', count: 1 }, { item: 'chest', count: 1, chance: 0.05 }] },
  { id: 'seaTurtle', skill: 'fishing', name: '钓海龟', icon: '🐢', levelReq: 27, timeSec: 13, xp: 85, outputs: [{ item: 'seaTurtle', count: 1 }, { item: 'chest', count: 1, chance: 0.06 }] },
  { id: 'dragonFish', skill: 'fishing', name: '钓龙鱼', icon: '🐉', levelReq: 32, timeSec: 15, xp: 110, outputs: [{ item: 'dragonFish', count: 1 }, { item: 'chest', count: 1, chance: 0.1 }] },
  { id: 'kun', skill: 'fishing', name: '钓鲲', icon: '🐋', levelReq: 42, timeSec: 18, xp: 190, outputs: [{ item: 'kun', count: 1 }, { item: 'chest', count: 1, chance: 0.12 }] },
  { id: 'yinglong', skill: 'fishing', name: '钓应龙', icon: '🐲', levelReq: 52, timeSec: 22, xp: 300, outputs: [{ item: 'yinglong', count: 1 }, { item: 'chest', count: 1, chance: 0.2 }] },
  { id: 'xuanwuFish', skill: 'fishing', name: '钓玄武', icon: '🔵', levelReq: 64, timeSec: 30, xp: 580, outputs: [{ item: 'xuanwuFish', count: 1 }, { item: 'chest', count: 1, chance: 0.25 }] },
  { id: 'kunpeng', skill: 'fishing', name: '钓鲲鹏', icon: '🕊️', levelReq: 70, timeSec: 34, xp: 760, outputs: [{ item: 'kunpeng', count: 1 }, { item: 'chest', count: 1, chance: 0.3 }] },
  // ── 炼丹（10 丹方 + 10 炼化方）──
  { id: 'jinchuang', skill: 'alchemy', name: '炼金疮药', icon: '💊', levelReq: 1, timeSec: 6, xp: 15, inputs: [{ item: 'gancao', count: 3 }], outputs: [{ item: 'jinchuang', count: 1 }] },
  { id: 'xiaohuan', skill: 'alchemy', name: '炼小还丹', icon: '🟠', levelReq: 5, timeSec: 7, xp: 24, inputs: [{ item: 'gancao', count: 2 }, { item: 'jinyinhua', count: 1 }], outputs: [{ item: 'xiaohuan', count: 1 }] },
  { id: 'juqi', skill: 'alchemy', name: '炼聚气丹', icon: '🔴', levelReq: 9, timeSec: 9, xp: 34, inputs: [{ item: 'lingzhi', count: 2 }, { item: 'gancao', count: 2 }], outputs: [{ item: 'juqi', count: 1 }] },
  { id: 'daliwan', skill: 'alchemy', name: '炼大力丸', icon: '🔥', levelReq: 13, timeSec: 10, xp: 45, inputs: [{ item: 'heshouwu', count: 2 }, { item: 'bone', count: 1 }], outputs: [{ item: 'daliwan', count: 1 }] },
  { id: 'tiebushan', skill: 'alchemy', name: '炼铁布衫丹', icon: '🛡️', levelReq: 17, timeSec: 11, xp: 55, inputs: [{ item: 'heshouwu', count: 2 }, { item: 'sinew', count: 1 }], outputs: [{ item: 'tiebushan', count: 1 }] },
  { id: 'dahuan', skill: 'alchemy', name: '炼大还丹', icon: '🟣', levelReq: 22, timeSec: 13, xp: 72, inputs: [{ item: 'xuelian', count: 2 }, { item: 'lingzhi', count: 1 }], outputs: [{ item: 'dahuan', count: 1 }] },
  { id: 'jiuzhuan', skill: 'alchemy', name: '炼九转金丹', icon: '🟡', levelReq: 32, timeSec: 18, xp: 135, inputs: [{ item: 'renshen', count: 1 }, { item: 'xuelian', count: 2 }, { item: 'neidan', count: 1 }], outputs: [{ item: 'jiuzhuan', count: 1 }] },
  { id: 'zixiaDan', skill: 'alchemy', name: '炼紫霞丹', icon: '🟪', levelReq: 36, timeSec: 19, xp: 180, inputs: [{ item: 'tianshanXueshen', count: 1 }, { item: 'zhuguo', count: 1 }], outputs: [{ item: 'zixiaDan', count: 1 }] },
  { id: 'taiShangDan', skill: 'alchemy', name: '炼太上还魂丹', icon: '🌕', levelReq: 42, timeSec: 22, xp: 230, inputs: [{ item: 'zhuguo', count: 2 }, { item: 'neidan', count: 2 }], outputs: [{ item: 'taiShangDan', count: 1 }] },
  { id: 'jiuxiaoDan', skill: 'alchemy', name: '炼九霄云丹', icon: '🌈', levelReq: 52, timeSec: 28, xp: 360, inputs: [{ item: 'jiuyeLingzhi', count: 1 }, { item: 'renshen', count: 1 }, { item: 'neidan', count: 2 }], outputs: [{ item: 'jiuxiaoDan', count: 1 }] },
  // 炼化：低阶材料 4:1 损耗转化为高阶（材料救急 / 溢出利用）
  { id: 'transHeshouwu', skill: 'alchemy', name: '炼化·何首乌', icon: '♻️', levelReq: 7, timeSec: 6, xp: 18, inputs: [{ item: 'gancao', count: 4 }], outputs: [{ item: 'heshouwu', count: 1 }] },
  { id: 'transLingzhi', skill: 'alchemy', name: '炼化·灵芝', icon: '♻️', levelReq: 13, timeSec: 7, xp: 26, inputs: [{ item: 'heshouwu', count: 4 }], outputs: [{ item: 'lingzhi', count: 1 }] },
  { id: 'transXuelian', skill: 'alchemy', name: '炼化·雪莲', icon: '♻️', levelReq: 21, timeSec: 9, xp: 46, inputs: [{ item: 'lingzhi', count: 4 }], outputs: [{ item: 'xuelian', count: 1 }] },
  { id: 'transIron', skill: 'alchemy', name: '炼化·铁矿', icon: '♻️', levelReq: 10, timeSec: 6, xp: 20, inputs: [{ item: 'copper', count: 4 }], outputs: [{ item: 'iron', count: 1 }] },
  { id: 'transXuantie', skill: 'alchemy', name: '炼化·玄铁', icon: '♻️', levelReq: 26, timeSec: 10, xp: 55, inputs: [{ item: 'iron', count: 4 }], outputs: [{ item: 'xuantie', count: 1 }] },
  { id: 'transMeteor', skill: 'alchemy', name: '炼化·陨星铁', icon: '♻️', levelReq: 33, timeSec: 12, xp: 80, inputs: [{ item: 'xuantie', count: 3 }, { item: 'coal', count: 2 }], outputs: [{ item: 'meteor', count: 1 }] },
  { id: 'transCypress', skill: 'alchemy', name: '炼化·柏木', icon: '♻️', levelReq: 8, timeSec: 6, xp: 18, inputs: [{ item: 'pine', count: 4 }], outputs: [{ item: 'cypress', count: 1 }] },
  { id: 'transZitan', skill: 'alchemy', name: '炼化·紫檀', icon: '♻️', levelReq: 20, timeSec: 9, xp: 48, inputs: [{ item: 'cypress', count: 4 }], outputs: [{ item: 'zitan', count: 1 }] },
  { id: 'transChenxiang', skill: 'alchemy', name: '炼化·沉香木', icon: '♻️', levelReq: 30, timeSec: 11, xp: 70, inputs: [{ item: 'zitan', count: 3 }, { item: 'wumu', count: 1 }], outputs: [{ item: 'chenxiang', count: 1 }] },
  { id: 'transJiuye', skill: 'alchemy', name: '炼化·九叶灵芝', icon: '♻️', levelReq: 44, timeSec: 15, xp: 150, inputs: [{ item: 'renshen', count: 2 }, { item: 'zhuguo', count: 1 }], outputs: [{ item: 'jiuyeLingzhi', count: 1 }] },
  { id: 'transSinew', skill: 'alchemy', name: '炼化·兽筋', icon: '♻️', levelReq: 18, timeSec: 8, xp: 36, inputs: [{ item: 'hide', count: 3 }], outputs: [{ item: 'sinew', count: 1 }] },
  { id: 'transRenshen', skill: 'alchemy', name: '炼化·千年人参', icon: '♻️', levelReq: 32, timeSec: 12, xp: 90, inputs: [{ item: 'xuanjing', count: 4 }, { item: 'danggui', count: 2 }], outputs: [{ item: 'renshen', count: 1 }] },
  { id: 'transNeidan', skill: 'alchemy', name: '炼化·内丹', icon: '♻️', levelReq: 35, timeSec: 13, xp: 110, inputs: [{ item: 'bone', count: 3 }, { item: 'sinew', count: 2 }], outputs: [{ item: 'neidan', count: 1 }] },
  { id: 'transXingsha', skill: 'alchemy', name: '炼化·星砂', icon: '♻️', levelReq: 38, timeSec: 13, xp: 120, inputs: [{ item: 'coal', count: 4 }, { item: 'silver', count: 2 }], outputs: [{ item: 'xingsha', count: 1 }] },
  { id: 'transColdIron', skill: 'alchemy', name: '炼化·深海寒铁', icon: '♻️', levelReq: 40, timeSec: 14, xp: 130, inputs: [{ item: 'xuanjing', count: 5 }, { item: 'iron', count: 2 }], outputs: [{ item: 'coldIron', count: 1 }] },
  { id: 'transGodIron', skill: 'alchemy', name: '炼化·九天神铁', icon: '♻️', levelReq: 50, timeSec: 18, xp: 220, inputs: [{ item: 'xuanjing', count: 8 }, { item: 'xuantie', count: 2 }], outputs: [{ item: 'godIron', count: 1 }] },
  { id: 'busiDan', skill: 'alchemy', name: '炼不死仙丹', icon: '💫', levelReq: 60, timeSec: 32, xp: 520, inputs: [{ item: 'undyingGrass', count: 1 }, { item: 'jiuyeLingzhi', count: 1 }, { item: 'neidan', count: 2 }], outputs: [{ item: 'busiDan', count: 1 }] },
  // ── 锻造（8 锭 + 13 器 + 5 进阶）──
  { id: 'copperIngot', skill: 'smithing', name: '炼铜锭', icon: '🧱', levelReq: 1, timeSec: 5, xp: 12, inputs: [{ item: 'copper', count: 2 }], outputs: [{ item: 'copperIngot', count: 1 }] },
  { id: 'tinIngot', skill: 'smithing', name: '炼锡锭', icon: '⬜', levelReq: 3, timeSec: 5, xp: 14, inputs: [{ item: 'tin', count: 2 }], outputs: [{ item: 'tinIngot', count: 1 }] },
  { id: 'ironIngot', skill: 'smithing', name: '炼铁锭', icon: '🔩', levelReq: 9, timeSec: 7, xp: 24, inputs: [{ item: 'iron', count: 2 }], outputs: [{ item: 'ironIngot', count: 1 }] },
  { id: 'steelIngot', skill: 'smithing', name: '炼钢锭', icon: '⛓️', levelReq: 16, timeSec: 9, xp: 45, inputs: [{ item: 'ironIngot', count: 2 }, { item: 'silver', count: 1 }], outputs: [{ item: 'steelIngot', count: 1 }] },
  { id: 'chitongIngot', skill: 'smithing', name: '炼赤铜锭', icon: '🟧', levelReq: 16, timeSec: 8, xp: 36, inputs: [{ item: 'chitong', count: 2 }], outputs: [{ item: 'chitongIngot', count: 1 }] },
  { id: 'xuantieIngot', skill: 'smithing', name: '炼玄铁锭', icon: '🖤', levelReq: 24, timeSec: 12, xp: 80, inputs: [{ item: 'xuantie', count: 2 }], outputs: [{ item: 'xuantieIngot', count: 1 }] },
  { id: 'zijinIngot', skill: 'smithing', name: '炼紫金锭', icon: '🟣', levelReq: 26, timeSec: 11, xp: 68, inputs: [{ item: 'zijin', count: 2 }], outputs: [{ item: 'zijinIngot', count: 1 }] },
  { id: 'starIngot', skill: 'smithing', name: '炼星辰锭', icon: '✨', levelReq: 34, timeSec: 15, xp: 130, inputs: [{ item: 'xuantieIngot', count: 2 }, { item: 'meteor', count: 1 }], outputs: [{ item: 'starIngot', count: 1 }] },
  // 兵器谱：剑系主线 + 刀枪扇斧并行线
  { id: 'copperBlade', skill: 'smithing', name: '打铜刀', icon: '🔪', levelReq: 2, timeSec: 8, xp: 22, inputs: [{ item: 'copperIngot', count: 1 }, { item: 'pine', count: 1 }], outputs: [{ item: 'copperBlade', count: 1 }] },
  { id: 'ironSword', skill: 'smithing', name: '打铁剑', icon: '🗡️', levelReq: 5, timeSec: 10, xp: 40, inputs: [{ item: 'copperIngot', count: 2 }, { item: 'pine', count: 1 }], outputs: [{ item: 'ironSword', count: 1 }] },
  { id: 'ironSpear', skill: 'smithing', name: '铸铁枪', icon: '🔱', levelReq: 9, timeSec: 11, xp: 46, inputs: [{ item: 'ironIngot', count: 2 }, { item: 'cypress', count: 1 }], outputs: [{ item: 'ironSpear', count: 1 }] },
  { id: 'steelBlade', skill: 'smithing', name: '打钢刀', icon: '🔪', levelReq: 13, timeSec: 12, xp: 60, inputs: [{ item: 'steelIngot', count: 2 }, { item: 'cypress', count: 1 }], outputs: [{ item: 'steelBlade', count: 1 }] },
  { id: 'steelSword', skill: 'smithing', name: '打精钢剑', icon: '⚔️', levelReq: 18, timeSec: 14, xp: 80, inputs: [{ item: 'steelIngot', count: 3 }, { item: 'shanmu', count: 1 }], outputs: [{ item: 'steelSword', count: 1 }] },
  { id: 'wujinBlade', skill: 'smithing', name: '锻乌金刀', icon: '⚔️', levelReq: 22, timeSec: 15, xp: 92, inputs: [{ item: 'steelIngot', count: 2 }, { item: 'wumu', count: 1 }], outputs: [{ item: 'wujinBlade', count: 1 }] },
  { id: 'xuantieSword', skill: 'smithing', name: '打玄铁重剑', icon: '🔱', levelReq: 28, timeSec: 20, xp: 150, inputs: [{ item: 'xuantieIngot', count: 2 }, { item: 'zitan', count: 1 }], outputs: [{ item: 'xuantieSword', count: 1 }] },
  { id: 'qimenFan', skill: 'smithing', name: '制奇门扇', icon: '🪭', levelReq: 32, timeSec: 18, xp: 160, inputs: [{ item: 'zijinIngot', count: 2 }, { item: 'chenxiang', count: 1 }], outputs: [{ item: 'qimenFan', count: 1 }] },
  { id: 'meteorBlade', skill: 'smithing', name: '铸陨星神兵', icon: '💫', levelReq: 38, timeSec: 26, xp: 240, inputs: [{ item: 'meteor', count: 2 }, { item: 'xuantieIngot', count: 1 }, { item: 'nammu', count: 1 }], outputs: [{ item: 'meteorBlade', count: 1 }] },
  { id: 'pozhanAxe', skill: 'smithing', name: '铸破山斧', icon: '🪓', levelReq: 44, timeSec: 24, xp: 300, inputs: [{ item: 'starIngot', count: 2 }, { item: 'wutong', count: 1 }], outputs: [{ item: 'pozhanAxe', count: 1 }] },
  { id: 'dragonSword', skill: 'smithing', name: '铸龙吟剑', icon: '🐉', levelReq: 46, timeSec: 32, xp: 380, inputs: [{ item: 'starIngot', count: 2 }, { item: 'coldIron', count: 1 }, { item: 'wutong', count: 1 }], outputs: [{ item: 'dragonSword', count: 1 }] },
  { id: 'tianwenSword', skill: 'smithing', name: '铸天问剑', icon: '⚜️', levelReq: 52, timeSec: 36, xp: 520, inputs: [{ item: 'starIngot', count: 2 }, { item: 'coldIron', count: 2 }, { item: 'kunlunmu', count: 1 }], outputs: [{ item: 'tianwenSword', count: 1 }] },
  { id: 'xuanyuanSword', skill: 'smithing', name: '铸轩辕神剑', icon: '👑', levelReq: 56, timeSec: 40, xp: 600, inputs: [{ item: 'godIron', count: 2 }, { item: 'starIngot', count: 1 }, { item: 'jianmu', count: 1 }], outputs: [{ item: 'xuanyuanSword', count: 1 }] },
  { id: 'dragonSlayer', skill: 'smithing', name: '铸屠龙刀', icon: '🔪', levelReq: 55, timeSec: 34, xp: 640, inputs: [{ item: 'starIngot', count: 2 }, { item: 'godIron', count: 1 }], outputs: [{ item: 'dragonSlayer', count: 1 }] },
  { id: 'fangtianHalberd', skill: 'smithing', name: '铸方天画戟', icon: '🔱', levelReq: 58, timeSec: 36, xp: 700, inputs: [{ item: 'godIron', count: 2 }, { item: 'hundunStone', count: 1 }], outputs: [{ item: 'fangtianHalberd', count: 1 }] },
  { id: 'zhuxianSword', skill: 'smithing', name: '铸诛仙剑', icon: '⚡', levelReq: 64, timeSec: 44, xp: 900, inputs: [{ item: 'hongmengCrystal', count: 2 }, { item: 'godIron', count: 2 }, { item: 'yggdrasil', count: 1 }], outputs: [{ item: 'zhuxianSword', count: 1 }] },
  // 进阶：旧兵器 + 材料 → 下一代（比直接打造省料，旧装备有处可去）
  { id: 'upSteelSword', skill: 'smithing', name: '进阶·精钢剑', icon: '⬆️', levelReq: 16, timeSec: 12, xp: 70, inputs: [{ item: 'ironSword', count: 1 }, { item: 'steelIngot', count: 2 }], outputs: [{ item: 'steelSword', count: 1 }] },
  { id: 'upXuantieSword', skill: 'smithing', name: '进阶·玄铁重剑', icon: '⬆️', levelReq: 26, timeSec: 16, xp: 120, inputs: [{ item: 'steelSword', count: 1 }, { item: 'xuantieIngot', count: 2 }], outputs: [{ item: 'xuantieSword', count: 1 }] },
  { id: 'upMeteorBlade', skill: 'smithing', name: '进阶·陨星神兵', icon: '⬆️', levelReq: 36, timeSec: 22, xp: 200, inputs: [{ item: 'xuantieSword', count: 1 }, { item: 'starIngot', count: 2 }], outputs: [{ item: 'meteorBlade', count: 1 }] },
  { id: 'upDragonSword', skill: 'smithing', name: '进阶·龙吟剑', icon: '⬆️', levelReq: 44, timeSec: 28, xp: 320, inputs: [{ item: 'meteorBlade', count: 1 }, { item: 'coldIron', count: 2 }], outputs: [{ item: 'dragonSword', count: 1 }] },
  { id: 'upXuanyuanSword', skill: 'smithing', name: '进阶·轩辕神剑', icon: '⬆️', levelReq: 54, timeSec: 36, xp: 560, inputs: [{ item: 'dragonSword', count: 1 }, { item: 'godIron', count: 2 }], outputs: [{ item: 'xuanyuanSword', count: 1 }] },
  // ── 烹饪（17 味）──
  { id: 'roastRabbit', skill: 'cooking', name: '烤兔肉', icon: '🍢', levelReq: 1, timeSec: 5, xp: 12, inputs: [{ item: 'rabbitMeat', count: 1 }], outputs: [{ item: 'roastRabbit', count: 1 }] },
  { id: 'deerSkewer', skill: 'cooking', name: '烤鹿肉串', icon: '🍖', levelReq: 3, timeSec: 5, xp: 14, inputs: [{ item: 'deerMeat', count: 1 }], outputs: [{ item: 'deerSkewer', count: 1 }] },
  { id: 'shrimpShumai', skill: 'cooking', name: '虾仁烧卖', icon: '🍤', levelReq: 4, timeSec: 5, xp: 15, inputs: [{ item: 'shrimp', count: 1 }, { item: 'gancao', count: 1 }], outputs: [{ item: 'shrimpShumai', count: 1 }] },
  { id: 'jiaohuaChicken', skill: 'cooking', name: '叫花鸡', icon: '🍗', levelReq: 6, timeSec: 6, xp: 18, inputs: [{ item: 'chickenMeat', count: 1 }, { item: 'gancao', count: 1 }], outputs: [{ item: 'jiaohuaChicken', count: 1 }] },
  { id: 'snakeSoup', skill: 'cooking', name: '龙凤蛇羹', icon: '🫕', levelReq: 8, timeSec: 7, xp: 24, inputs: [{ item: 'snakeMeat', count: 1 }, { item: 'jinyinhua', count: 1 }], outputs: [{ item: 'snakeSoup', count: 1 }] },
  { id: 'crabRoe', skill: 'cooking', name: '蟹黄汤包', icon: '🥟', levelReq: 10, timeSec: 8, xp: 30, inputs: [{ item: 'crab', count: 1 }, { item: 'fuling', count: 1 }], outputs: [{ item: 'crabRoe', count: 1 }] },
  { id: 'braisedPork', skill: 'cooking', name: '红烧肉', icon: '🍲', levelReq: 11, timeSec: 8, xp: 28, inputs: [{ item: 'boarMeat', count: 2 }], outputs: [{ item: 'braisedPork', count: 1 }] },
  { id: 'bearPaw', skill: 'cooking', name: '红烧熊掌', icon: '🐾', levelReq: 15, timeSec: 10, xp: 48, inputs: [{ item: 'bearMeat', count: 1 }, { item: 'danggui', count: 1 }], outputs: [{ item: 'bearPaw', count: 1 }] },
  { id: 'carpSoup', skill: 'cooking', name: '鲤鱼汤', icon: '🥣', levelReq: 15, timeSec: 10, xp: 50, inputs: [{ item: 'carp', count: 1 }, { item: 'gancao', count: 1 }], outputs: [{ item: 'carpSoup', count: 1 }] },
  { id: 'octopusBall', skill: 'cooking', name: '章鱼丸子', icon: '🍡', levelReq: 16, timeSec: 10, xp: 52, inputs: [{ item: 'octopus', count: 2 }], outputs: [{ item: 'octopusBall', count: 1 }] },
  { id: 'wolfJerky', skill: 'cooking', name: '狼肉干', icon: '🥩', levelReq: 21, timeSec: 12, xp: 70, inputs: [{ item: 'wolfMeat', count: 2 }], outputs: [{ item: 'wolfJerky', count: 1 }] },
  { id: 'leopardJerky', skill: 'cooking', name: '风豹肉干', icon: '🥓', levelReq: 22, timeSec: 12, xp: 78, inputs: [{ item: 'leopardMeat', count: 2 }], outputs: [{ item: 'leopardJerky', count: 1 }] },
  { id: 'turtleSoup', skill: 'cooking', name: '海龟珍汤', icon: '🥘', levelReq: 27, timeSec: 14, xp: 95, inputs: [{ item: 'seaTurtle', count: 1 }, { item: 'xuelian', count: 1 }], outputs: [{ item: 'turtleSoup', count: 1 }] },
  { id: 'fotiaoqiang', skill: 'cooking', name: '佛跳墙', icon: '🍜', levelReq: 28, timeSec: 16, xp: 115, inputs: [{ item: 'tigerMeat', count: 1 }, { item: 'dragonFish', count: 1 }, { item: 'xuelian', count: 1 }], outputs: [{ item: 'fotiaoqiang', count: 1 }] },
  { id: 'qilinFeast', skill: 'cooking', name: '麒麟宴', icon: '🍱', levelReq: 38, timeSec: 20, xp: 200, inputs: [{ item: 'auspiceMeat', count: 1 }, { item: 'koi', count: 1 }, { item: 'zhuguo', count: 1 }], outputs: [{ item: 'qilinFeast', count: 1 }] },
  { id: 'jiaolongDish', skill: 'cooking', name: '蛟龙闹海宴', icon: '🍛', levelReq: 48, timeSec: 22, xp: 280, inputs: [{ item: 'jiaolongMeat', count: 1 }, { item: 'longxian', count: 1 }], outputs: [{ item: 'jiaolongDish', count: 1 }] },
  { id: 'dragonFeast', skill: 'cooking', name: '龙肝凤髓', icon: '🍲', levelReq: 48, timeSec: 25, xp: 320, inputs: [{ item: 'fierceMeat', count: 1 }, { item: 'yinglong', count: 1 }, { item: 'jiuyeLingzhi', count: 1 }], outputs: [{ item: 'dragonFeast', count: 1 }] },
  { id: 'taotieFeast', skill: 'cooking', name: '饕餮盛宴', icon: '🧆', levelReq: 58, timeSec: 28, xp: 420, inputs: [{ item: 'taotieMeat', count: 1 }, { item: 'xianlingcao', count: 1 }], outputs: [{ item: 'taotieFeast', count: 1 }] },
  { id: 'zhulongFeast', skill: 'cooking', name: '烛龙宴', icon: '🎇', levelReq: 64, timeSec: 32, xp: 560, inputs: [{ item: 'zhulongMeat', count: 1 }, { item: 'hundunLotus', count: 1 }], outputs: [{ item: 'zhulongFeast', count: 1 }] },
  { id: 'kunpengDish', skill: 'cooking', name: '鲲鹏九变', icon: '🌠', levelReq: 66, timeSec: 34, xp: 640, inputs: [{ item: 'kunpeng', count: 1 }, { item: 'xianlingcao', count: 1 }], outputs: [{ item: 'kunpengDish', count: 1 }] },
  // ── 制衣（12 甲）──
  { id: 'clothArmor', skill: 'tailoring', name: '缝布衣', icon: '👘', levelReq: 1, timeSec: 8, xp: 25, inputs: [{ item: 'hide', count: 2 }], outputs: [{ item: 'clothArmor', count: 1 }] },
  { id: 'tengArmor', skill: 'tailoring', name: '编藤甲', icon: '🎋', levelReq: 5, timeSec: 9, xp: 32, inputs: [{ item: 'hide', count: 2 }, { item: 'bamboo', count: 1 }], outputs: [{ item: 'tengArmor', count: 1 }] },
  { id: 'leatherArmor', skill: 'tailoring', name: '缝制皮甲', icon: '🦺', levelReq: 11, timeSec: 12, xp: 60, inputs: [{ item: 'hide', count: 4 }, { item: 'cypress', count: 1 }], outputs: [{ item: 'leatherArmor', count: 1 }] },
  { id: 'tieArmor', skill: 'tailoring', name: '铸铁甲', icon: '🥋', levelReq: 14, timeSec: 12, xp: 68, inputs: [{ item: 'ironIngot', count: 1 }, { item: 'hide', count: 3 }], outputs: [{ item: 'tieArmor', count: 1 }] },
  { id: 'chainmail', skill: 'tailoring', name: '编锁子甲', icon: '🥋', levelReq: 18, timeSec: 14, xp: 85, inputs: [{ item: 'ironIngot', count: 2 }, { item: 'hide', count: 3 }], outputs: [{ item: 'chainmail', count: 1 }] },
  { id: 'yinsiArmor', skill: 'tailoring', name: '织银丝甲', icon: '🎽', levelReq: 22, timeSec: 15, xp: 95, inputs: [{ item: 'silver', count: 2 }, { item: 'hide', count: 4 }], outputs: [{ item: 'yinsiArmor', count: 1 }] },
  { id: 'goldArmor', skill: 'tailoring', name: '织金丝甲', icon: '🎽', levelReq: 26, timeSec: 18, xp: 125, inputs: [{ item: 'hide', count: 6 }, { item: 'zitan', count: 1 }], outputs: [{ item: 'goldArmor', count: 1 }] },
  { id: 'tiancanArmor', skill: 'tailoring', name: '织天蚕宝甲', icon: '🧥', levelReq: 35, timeSec: 22, xp: 200, inputs: [{ item: 'hide', count: 8 }, { item: 'neidan', count: 1 }, { item: 'nammu', count: 1 }], outputs: [{ item: 'tiancanArmor', count: 1 }] },
  { id: 'longlinArmor', skill: 'tailoring', name: '编龙鳞甲', icon: '🐉', levelReq: 40, timeSec: 24, xp: 260, inputs: [{ item: 'hide', count: 8 }, { item: 'neidan', count: 1 }, { item: 'zijinIngot', count: 1 }], outputs: [{ item: 'longlinArmor', count: 1 }] },
  { id: 'xuanwuArmor', skill: 'tailoring', name: '铸玄武宝甲', icon: '🐢', levelReq: 45, timeSec: 28, xp: 340, inputs: [{ item: 'hide', count: 10 }, { item: 'neidan', count: 2 }, { item: 'starIngot', count: 1 }], outputs: [{ item: 'xuanwuArmor', count: 1 }] },
  { id: 'tiangangArmor', skill: 'tailoring', name: '铸天罡战甲', icon: '⚜️', levelReq: 55, timeSec: 34, xp: 520, inputs: [{ item: 'hide', count: 12 }, { item: 'neidan', count: 3 }, { item: 'jianmu', count: 1 }], outputs: [{ item: 'tiangangArmor', count: 1 }] },
  { id: 'hundunArmor', skill: 'tailoring', name: '铸混沌战甲', icon: '🌌', levelReq: 58, timeSec: 38, xp: 640, inputs: [{ item: 'hundunStone', count: 2 }, { item: 'hide', count: 14 }, { item: 'neidan', count: 4 }], outputs: [{ item: 'hundunArmor', count: 1 }] },
  { id: 'hongmengRobe', skill: 'tailoring', name: '织鸿蒙道袍', icon: '🔮', levelReq: 64, timeSec: 42, xp: 800, inputs: [{ item: 'hongmengCrystal', count: 1 }, { item: 'hide', count: 16 }, { item: 'neidan', count: 5 }], outputs: [{ item: 'hongmengRobe', count: 1 }] },
  // ── 强化（4 石）──
  { id: 'stone', skill: 'enhancing', name: '制强化石', icon: '🪨', levelReq: 1, timeSec: 6, xp: 15, inputs: [{ item: 'copperIngot', count: 2 }], outputs: [{ item: 'stone', count: 1 }] },
  { id: 'fineStone', skill: 'enhancing', name: '制精锻石', icon: '💎', levelReq: 15, timeSec: 10, xp: 45, inputs: [{ item: 'ironIngot', count: 2 }], outputs: [{ item: 'fineStone', count: 1 }] },
  { id: 'meteorCrystal', skill: 'enhancing', name: '炼天外陨晶', icon: '💠', levelReq: 28, timeSec: 14, xp: 95, inputs: [{ item: 'meteor', count: 1 }, { item: 'xuantie', count: 1 }], outputs: [{ item: 'meteorCrystal', count: 1 }] },
  { id: 'qiankunCrystal', skill: 'enhancing', name: '炼乾坤灵晶', icon: '🔷', levelReq: 42, timeSec: 20, xp: 220, inputs: [{ item: 'coldIron', count: 1 }, { item: 'meteor', count: 1 }], outputs: [{ item: 'qiankunCrystal', count: 1 }] },
]

export const actionsBySkill = (skill: SkillId) => ACTIONS.filter(a => a.skill === skill)

/** 材料来源引导：查产出该物品的主要动作（排除进阶/炼化等副作用配方） */
export function itemSource(itemId: string): { skill: SkillId; name: string } | null {
  const a = ACTIONS.find(x =>
    x.outputs.some(o => o.item === itemId && (o.chance === undefined || o.chance >= 0.5)) &&
    !x.id.startsWith('up') && !x.id.startsWith('trans')
  )
  if (!a) return null
  return { skill: a.skill, name: a.name }
}

/** 物品用途：该物品被哪些配方消耗，各产出什么（背包悬停展示"拿来干嘛"） */
export function itemUsage(itemId: string): { recipe: string; skill: SkillId; outputs: string }[] {
  const out: { recipe: string; skill: SkillId; outputs: string }[] = []
  for (const a of ACTIONS) {
    if (!a.inputs?.some(i => i.item === itemId)) continue
    const outs = a.outputs.map(o => `${ITEMS[o.item]?.icon ?? '❓'}${ITEMS[o.item]?.name ?? o.item}×${o.count}${o.chance !== undefined ? `(${Math.round(o.chance * 100)}%)` : ''}`).join(' ')
    out.push({ recipe: a.name, skill: a.skill, outputs: outs })
  }
  return out
}

// v4 经验曲线：25 × L^1.95（内容消耗目标 2–3 个月）
export const xpToNext = (level: number) => Math.floor(25 * Math.pow(level, 1.95))

// ─── 怪物 ────────────────────────────────────────────────────────────────────
export interface MonsterDef {
  id: string
  zone: string
  name: string
  icon: string
  levelReq: number
  hp: number
  atk: number
  def: number
  weak?: StyleId  // 流派克制：使用该流派出战伤害 +18%
  drops: { item: string; min: number; max: number; chance: number }[]
}

export const MONSTERS: MonsterDef[] = [
  { id: 'rabbitJing', zone: '野猪林', name: '野兔精', icon: '🐰', levelReq: 1, hp: 30, atk: 4, def: 0, weak: 'hidden', drops: [{ item: 'coin', min: 5, max: 15, chance: 1 }, { item: 'rabbitMeat', min: 1, max: 1, chance: 0.4 }] },
  { id: 'boarKing', zone: '野猪林', name: '野猪王', icon: '🐗', levelReq: 5, hp: 65, atk: 9, def: 2, weak: 'fist', drops: [{ item: 'coin', min: 12, max: 30, chance: 1 }, { item: 'boarMeat', min: 1, max: 1, chance: 0.5 }, { item: 'hide', min: 1, max: 1, chance: 0.3 }] },
  { id: 'bandit', zone: '黑风寨', name: '山贼', icon: '🥷', levelReq: 10, hp: 130, atk: 15, def: 4, weak: 'sword', drops: [{ item: 'coin', min: 30, max: 70, chance: 1 }, { item: 'gancao', min: 2, max: 2, chance: 0.4 }, { item: 'stone', min: 1, max: 1, chance: 0.15 }] },
  { id: 'banditBoss', zone: '黑风寨', name: '山贼头目', icon: '🦹', levelReq: 15, hp: 240, atk: 21, def: 6, weak: 'fist', drops: [{ item: 'coin', min: 70, max: 150, chance: 1 }, { item: 'ironSword', min: 1, max: 1, chance: 0.1 }, { item: 'lingzhi', min: 1, max: 1, chance: 0.4 }, { item: 'swordManual', min: 1, max: 1, chance: 0.08 }] },
  { id: 'corpse', zone: '古墓', name: '尸兵', icon: '🧟', levelReq: 20, hp: 320, atk: 27, def: 10, weak: 'sword', drops: [{ item: 'coin', min: 100, max: 220, chance: 1 }, { item: 'iron', min: 2, max: 2, chance: 0.4 }, { item: 'steelBlade', min: 1, max: 1, chance: 0.08 }] },
  { id: 'tombGuard', zone: '古墓', name: '古墓护法', icon: '👹', levelReq: 28, hp: 520, atk: 36, def: 14, weak: 'inner', drops: [{ item: 'coin', min: 200, max: 400, chance: 1 }, { item: 'xuelian', min: 1, max: 1, chance: 0.4 }, { item: 'fineStone', min: 1, max: 1, chance: 0.2 }, { item: 'fistManual', min: 1, max: 1, chance: 0.08 }] },
  { id: 'swordGhost', zone: '缥缈峰', name: '剑客幻影', icon: '👤', levelReq: 35, hp: 850, atk: 47, def: 20, weak: 'inner', drops: [{ item: 'coin', min: 400, max: 800, chance: 1 }, { item: 'xuantie', min: 1, max: 1, chance: 0.4 }, { item: 'xuantieSword', min: 1, max: 1, chance: 0.05 }] },
  { id: 'wulinGod', zone: '缥缈峰', name: '武林神话', icon: '🐲', levelReq: 45, hp: 1600, atk: 62, def: 28, weak: 'hidden', drops: [{ item: 'coin', min: 1000, max: 2000, chance: 1 }, { item: 'renshen', min: 1, max: 1, chance: 0.3 }, { item: 'jiuzhuan', min: 1, max: 1, chance: 0.1 }, { item: 'hiddenManual', min: 1, max: 1, chance: 0.08 }] },
  { id: 'fireLizard', zone: '熔岩洞', name: '火蜥蜴', icon: '🦎', levelReq: 48, hp: 2200, atk: 78, def: 36, weak: 'inner', drops: [{ item: 'coin', min: 1500, max: 3000, chance: 1 }, { item: 'coldIron', min: 1, max: 1, chance: 0.4 }, { item: 'qiankunCrystal', min: 1, max: 1, chance: 0.12 }] },
  { id: 'lavaBeast', zone: '熔岩洞', name: '熔岩巨兽', icon: '🌋', levelReq: 56, hp: 3400, atk: 95, def: 45, weak: 'fist', drops: [{ item: 'coin', min: 2500, max: 5000, chance: 1 }, { item: 'neidan', min: 1, max: 1, chance: 0.35 }, { item: 'dragonSword', min: 1, max: 1, chance: 0.04 }, { item: 'innerManual', min: 1, max: 1, chance: 0.08 }] },
  { id: 'skySoldier', zone: '九霄云巅', name: '天兵幻影', icon: '⚡', levelReq: 62, hp: 5000, atk: 115, def: 55, weak: 'sword', drops: [{ item: 'coin', min: 4000, max: 8000, chance: 1 }, { item: 'godIron', min: 1, max: 1, chance: 0.35 }, { item: 'xuanwuArmor', min: 1, max: 1, chance: 0.04 }] },
  { id: 'skyEmperor', zone: '九霄云巅', name: '九霄帝君', icon: '🌩️', levelReq: 70, hp: 8000, atk: 140, def: 68, weak: 'hidden', drops: [{ item: 'coin', min: 8000, max: 15000, chance: 1 }, { item: 'jiuyeLingzhi', min: 1, max: 1, chance: 0.3 }, { item: 'xuanyuanSword', min: 1, max: 1, chance: 0.03 }] },
]

export const ZONES = ['野猪林', '黑风寨', '古墓', '缥缈峰', '熔岩洞', '九霄云巅']

// ─── 秘境（无限爬塔）─────────────────────────────────────────────────────────
export interface LabMonster {
  name: string
  icon: string
  hp: number
  atk: number
  def: number
  isBoss: boolean
}

export function labMonster(floor: number): LabMonster {
  const isBoss = floor % 5 === 0
  const mult = isBoss ? 1.6 : 1
  const names = ['石傀儡', '迷雾妖', '玄冰兽', '噬魂影', '镇塔灵']
  const icons = ['🗿', '🌫️', '🧊', '👻', '🛕']
  const bossNames = ['塔主残念', '镇狱明王', '混沌魔君', '轮回尊者', '秘境主宰']
  const bossIcons = ['😈', '👺', '👿', '🎭', '👁️']
  const idx = (Math.floor((floor - 1) / 5)) % 5
  return {
    name: isBoss ? `${bossNames[idx]} · ${floor}层` : `${names[(floor - 1) % 5]} · ${floor}层`,
    icon: isBoss ? bossIcons[idx] : icons[(floor - 1) % 5],
    hp: Math.floor(150 * Math.pow(1.16, floor) * mult),
    atk: Math.floor(8 * Math.pow(1.11, floor) * mult),
    def: Math.floor(2 * Math.pow(1.09, floor) * mult),
    isBoss,
  }
}

export const labCoinReward = (floor: number) => (1 + Math.floor(floor / 3)) * (floor % 5 === 0 ? 3 : 1)

export interface LabShopItem {
  id: string
  name: string
  icon: string
  desc: string
  baseCost: number
  growth: number // 每次购买价格 ×growth（amulet 类为 0 = 固定价限购一次）
  amulet?: string
}

export const LAB_SHOP: LabShopItem[] = [
  { id: 'atkInsight', name: '攻击心得', icon: '📕', desc: '永久 ATK +1', baseCost: 8, growth: 1.6 },
  { id: 'defInsight', name: '防御心得', icon: '📘', desc: '永久 DEF +1', baseCost: 8, growth: 1.6 },
  { id: 'hpInsight', name: '气血心得', icon: '📗', desc: '永久气血上限 +15', baseCost: 6, growth: 1.6 },
  { id: 'jadePendant', name: '玉佩', icon: '📿', desc: '饰品：全部经验 +5%', baseCost: 50, growth: 0, amulet: 'jadePendant' },
  { id: 'tigerTally', name: '虎符', icon: '🐯', desc: '饰品：ATK +8', baseCost: 120, growth: 0, amulet: 'tigerTally' },
  { id: 'xuanwuPendant', name: '玄武佩', icon: '🐢', desc: '饰品：DEF +8', baseCost: 120, growth: 0, amulet: 'xuanwuPendant' },
  { id: 'treasureCharm', name: '聚宝符', icon: '🧧', desc: '饰品：铜钱获取 +10%', baseCost: 200, growth: 0, amulet: 'treasureCharm' },
]

// ─── 秘境祝福（每 10 层三选一，仅本次爬塔生效）────────────────────────────────
export interface LabBlessing {
  id: string
  name: string
  icon: string
  desc: string
  atkPct?: number      // 秘境内攻击 +%
  defPct?: number      // 秘境内防御 +%
  hpPct?: number       // 秘境内气血上限 +%
  lifesteal?: number   // 秘境内吸血（伤害 % 回复）
  crit?: number        // 秘境内暴击率 +%（1.8 倍，任意流派）
  pierce?: number      // 秘境内无视怪物防御 %
  dodge?: number       // 秘境内闪避怪物反击 %
  labCoinPct?: number  // 秘境币获取 +%
  coinPct?: number     // 秘境铜钱获取 +%
  xpPct?: number       // 秘境经验 +%
}

export const LAB_BLESSINGS: LabBlessing[] = [
  { id: 'swordQi', name: '剑意冲霄', icon: '⚔️', desc: '秘境内攻击 +15%', atkPct: 15 },
  { id: 'bell', name: '金钟罩', icon: '🔔', desc: '秘境内防御 +20%', defPct: 20 },
  { id: 'dragonBlood', name: '气血如龙', icon: '🐉', desc: '秘境内气血上限 +25%', hpPct: 25 },
  { id: 'bloodSuck', name: '噬血大法', icon: '🩸', desc: '秘境内吸血：回复伤害 10% 的生命', lifesteal: 10 },
  { id: 'eagleEye', name: '鹰眼诀', icon: '🦅', desc: '秘境内暴击率 +10%（任意流派，1.8 倍）', crit: 10 },
  { id: 'armorBreak', name: '破甲式', icon: '🔨', desc: '秘境内无视怪物 20% 防御', pierce: 20 },
  { id: 'windStep', name: '疾风步', icon: '💨', desc: '秘境内 10% 概率闪避怪物反击', dodge: 10 },
  { id: 'treasureRat', name: '寻宝鼠', icon: '🐭', desc: '秘境币获取 +50%', labCoinPct: 50 },
  { id: 'goldHand', name: '点金手', icon: '✋', desc: '秘境铜钱获取 +50%', coinPct: 50 },
  { id: 'epiphany', name: '顿悟', icon: '💡', desc: '秘境经验 +30%', xpPct: 30 },
]

// ─── 装备词缀（装备时随机凝聚 1–3 条，含诅咒；重铸有裂痕惩罚）─────────────────
export type AffixStat = 'atkPct' | 'defPct' | 'hpPct' | 'crit' | 'lifesteal' | 'pierce' | 'coinPct' | 'xpPct'

export interface AffixDef {
  id: string
  name: string
  stat: AffixStat
  min: number  // 数值下限（%），诅咒为负
  max: number
  weight: number
  curse?: boolean
}

export const AFFIXES: AffixDef[] = [
  { id: 'sharp', name: '锋锐', stat: 'atkPct', min: 3, max: 12, weight: 20 },
  { id: 'sturdy', name: '坚壁', stat: 'defPct', min: 3, max: 12, weight: 20 },
  { id: 'vital', name: '活血', stat: 'hpPct', min: 5, max: 15, weight: 16 },
  { id: 'eagle', name: '鹰眼', stat: 'crit', min: 2, max: 6, weight: 12 },
  { id: 'leech', name: '吸血', stat: 'lifesteal', min: 2, max: 5, weight: 10 },
  { id: 'breaker', name: '破甲', stat: 'pierce', min: 3, max: 8, weight: 10 },
  { id: 'fortune', name: '聚财', stat: 'coinPct', min: 5, max: 15, weight: 12 },
  { id: 'insight', name: '顿悟', stat: 'xpPct', min: 3, max: 10, weight: 12 },
  { id: 'curseSlow', name: '诅咒·迟钝', stat: 'atkPct', min: -8, max: -4, weight: 4, curse: true },
  { id: 'curseWeak', name: '诅咒·虚弱', stat: 'defPct', min: -8, max: -4, weight: 4, curse: true },
  { id: 'curseLeak', name: '诅咒·漏财', stat: 'coinPct', min: -10, max: -6, weight: 3, curse: true },
]

export interface AffixRoll { id: string; value: number }

export const AFFIX_STAT_LABEL: Record<AffixStat, string> = {
  atkPct: '攻击', defPct: '防御', hpPct: '气血', crit: '暴击率',
  lifesteal: '吸血', pierce: '破甲', coinPct: '铜钱', xpPct: '经验',
}

export function affixDesc(a: AffixRoll): string {
  const def = AFFIXES.find(x => x.id === a.id)
  if (!def) return ''
  return `${def.name} ${AFFIX_STAT_LABEL[def.stat]} ${a.value > 0 ? '+' : ''}${a.value}%`
}

// 随机词缀：50% 一条 / 35% 两条 / 15% 三条，按权重抽取（不放回）
export function rollAffixes(): AffixRoll[] {
  const r = Math.random()
  const count = r < 0.5 ? 1 : r < 0.85 ? 2 : 3
  const pool = [...AFFIXES]
  const out: AffixRoll[] = []
  while (out.length < count && pool.length > 0) {
    const total = pool.reduce((s, x) => s + x.weight, 0)
    let roll = Math.random() * total
    let idx = 0
    for (let i = 0; i < pool.length; i++) {
      roll -= pool[i].weight
      if (roll <= 0) { idx = i; break }
    }
    const def = pool.splice(idx, 1)[0]
    out.push({ id: def.id, value: Math.round(def.min + Math.random() * (def.max - def.min)) })
  }
  return out
}

// ─── 武学流派与招式 ──────────────────────────────────────────────────────────
export type StyleId = 'sword' | 'fist' | 'hidden' | 'inner'

export interface StyleDef {
  id: StyleId
  name: string
  icon: string
  signature: string
  abilities: { level: number; name: string; desc: string }[]
}

export const STYLES: StyleDef[] = [
  {
    id: 'sword', name: '剑法', icon: '🗡️',
    signature: '剑气纵横：10% 概率暴击，造成 1.8 倍伤害',
    abilities: [
      { level: 5, name: '流云剑式', desc: '剑法伤害 +5%' },
      { level: 15, name: '破岳剑意', desc: '无视怪物 30% 防御，伤害 +5%' },
      { level: 30, name: '人剑合一', desc: '剑法伤害 +5%' },
      { level: 45, name: '万剑归宗', desc: '剑法伤害 +5%' },
      { level: 60, name: '剑开天门', desc: '剑法伤害 +10%' },
      { level: 75, name: '天外飞仙', desc: '剑法伤害 +10%' },
    ],
  },
  {
    id: 'fist', name: '拳掌', icon: '👊',
    signature: '连环进击：15% 概率追加一次攻击',
    abilities: [
      { level: 5, name: '罗汉拳', desc: '拳掌伤害 +5%' },
      { level: 15, name: '铁线拳', desc: '拳掌伤害 +5%' },
      { level: 30, name: '降龙掌', desc: '拳掌伤害 +5%' },
      { level: 45, name: '天下第一掌', desc: '拳掌伤害 +5%' },
      { level: 60, name: '如来神掌', desc: '拳掌伤害 +10%' },
      { level: 75, name: '万佛朝宗', desc: '拳掌伤害 +10%' },
    ],
  },
  {
    id: 'hidden', name: '暗器', icon: '🔪',
    signature: '先发制人：每只怪物首回合伤害 +25%',
    abilities: [
      { level: 5, name: '袖里箭', desc: '暗器伤害 +5%' },
      { level: 15, name: '梅花针', desc: '暗器伤害 +5%' },
      { level: 30, name: '暴雨梨花', desc: '暗器伤害 +5%' },
      { level: 45, name: '万毒噬心', desc: '暗器伤害 +5%' },
      { level: 60, name: '生死符', desc: '暗器伤害 +10%' },
      { level: 75, name: '观音泪', desc: '暗器伤害 +10%' },
    ],
  },
  {
    id: 'inner', name: '内功', icon: '🌀',
    signature: '气随意转：回复造成伤害 8% 的生命',
    abilities: [
      { level: 5, name: '吐纳诀', desc: '内功伤害 +5%' },
      { level: 15, name: '小周天', desc: '内功伤害 +5%' },
      { level: 30, name: '大周天', desc: '内功伤害 +5%' },
      { level: 45, name: '易筋洗髓', desc: '内功伤害 +5%' },
      { level: 60, name: '北冥神功', desc: '内功伤害 +10%' },
      { level: 75, name: '九阳神功', desc: '内功伤害 +10%' },
    ],
  },
]

// ─── 成就（达成即生效，轮回保留）─────────────────────────────────────────────
export interface AchievementDef {
  id: string
  name: string
  icon: string
  desc: string
  bonus: string
  xpPct?: number
  coinPct?: number
  atkFlat?: number
  defFlat?: number
  check: (s: AchievementStats) => boolean
}

export interface AchievementStats {
  maxSkillLevel: number
  totalLevel: number
  kills: number
  coinsHeld: number
  crafted: number
  highestFloor: number
  rebirths: number
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // 技能境界
  { id: 'sk10', name: '小有所成', icon: '🌱', desc: '任意技能达到 Lv.10', bonus: '经验 +1%', xpPct: 1, check: s => s.maxSkillLevel >= 10 },
  { id: 'sk20', name: '渐入佳境', icon: '🌿', desc: '任意技能达到 Lv.20', bonus: '经验 +1%', xpPct: 1, check: s => s.maxSkillLevel >= 20 },
  { id: 'sk30', name: '炉火纯青', icon: '🔥', desc: '任意技能达到 Lv.30', bonus: '经验 +2%', xpPct: 2, check: s => s.maxSkillLevel >= 30 },
  { id: 'sk40', name: '登峰造极', icon: '⛰️', desc: '任意技能达到 Lv.40', bonus: '经验 +2%', xpPct: 2, check: s => s.maxSkillLevel >= 40 },
  { id: 'sk50', name: '出神入化', icon: '🌟', desc: '任意技能达到 Lv.50', bonus: '经验 +3%', xpPct: 3, check: s => s.maxSkillLevel >= 50 },
  { id: 'sk60', name: '一代宗师', icon: '👑', desc: '任意技能达到 Lv.60', bonus: '经验 +5%', xpPct: 5, check: s => s.maxSkillLevel >= 60 },
  // 总等级
  { id: 'tl50', name: '初涉江湖', icon: '🚶', desc: '总等级达到 50', bonus: '经验 +1%', xpPct: 1, check: s => s.totalLevel >= 50 },
  { id: 'tl150', name: '声名鹊起', icon: '📣', desc: '总等级达到 150', bonus: '经验 +2%', xpPct: 2, check: s => s.totalLevel >= 150 },
  { id: 'tl300', name: '名震一方', icon: '🏯', desc: '总等级达到 300', bonus: '经验 +3%', xpPct: 3, check: s => s.totalLevel >= 300 },
  { id: 'tl500', name: '武林盟主', icon: '🎖️', desc: '总等级达到 500', bonus: '经验 +5%', xpPct: 5, check: s => s.totalLevel >= 500 },
  { id: 'tl800', name: '神话传说', icon: '🌠', desc: '总等级达到 800', bonus: '经验 +8%', xpPct: 8, check: s => s.totalLevel >= 800 },
  // 战斗
  { id: 'kill100', name: '小试牛刀', icon: '🗡️', desc: '击杀 100 只怪物', bonus: 'ATK +1', atkFlat: 1, check: s => s.kills >= 100 },
  { id: 'kill1k', name: '百人斩', icon: '⚔️', desc: '击杀 1,000 只怪物', bonus: 'ATK +2', atkFlat: 2, check: s => s.kills >= 1000 },
  { id: 'kill10k', name: '万人敌', icon: '💀', desc: '击杀 10,000 只怪物', bonus: 'ATK +5', atkFlat: 5, check: s => s.kills >= 10000 },
  { id: 'kill100k', name: '杀神降世', icon: '🩸', desc: '击杀 100,000 只怪物', bonus: 'ATK +12', atkFlat: 12, check: s => s.kills >= 100000 },
  // 财富
  { id: 'rich10k', name: '小有积蓄', icon: '💰', desc: '持有 10,000 铜钱', bonus: '铜钱 +2%', coinPct: 2, check: s => s.coinsHeld >= 10000 },
  { id: 'rich1m', name: '富甲一方', icon: '🏦', desc: '持有 1,000,000 铜钱', bonus: '铜钱 +5%', coinPct: 5, check: s => s.coinsHeld >= 1000000 },
  { id: 'rich100m', name: '富可敌国', icon: '👑', desc: '持有 100,000,000 铜钱', bonus: '铜钱 +10%', coinPct: 10, check: s => s.coinsHeld >= 100000000 },
  // 制造
  { id: 'craft100', name: '能工巧匠', icon: '🔨', desc: '累计制造 100 件物品', bonus: '经验 +1%', xpPct: 1, check: s => s.crafted >= 100 },
  { id: 'craft2k', name: '铸剑大师', icon: '⚒️', desc: '累计制造 2,000 件物品', bonus: '经验 +2%', xpPct: 2, check: s => s.crafted >= 2000 },
  { id: 'craft20k', name: '鬼斧神工', icon: '🏭', desc: '累计制造 20,000 件物品', bonus: '经验 +4%', xpPct: 4, check: s => s.crafted >= 20000 },
  // 秘境
  { id: 'lab10', name: '初入秘境', icon: '🌀', desc: '秘境抵达第 10 层', bonus: 'DEF +1', defFlat: 1, check: s => s.highestFloor >= 10 },
  { id: 'lab30', name: '百折不挠', icon: '🧗', desc: '秘境抵达第 30 层', bonus: 'DEF +2', defFlat: 2, check: s => s.highestFloor >= 30 },
  { id: 'lab60', name: '登堂入室', icon: '🏔️', desc: '秘境抵达第 60 层', bonus: 'DEF +4', defFlat: 4, check: s => s.highestFloor >= 60 },
  { id: 'lab100', name: '秘境传说', icon: '🌌', desc: '秘境抵达第 100 层', bonus: 'DEF +8', defFlat: 8, check: s => s.highestFloor >= 100 },
  // 轮回
  { id: 're1', name: '涅槃重生', icon: '🐣', desc: '完成 1 次轮回', bonus: '经验 +5%', xpPct: 5, check: s => s.rebirths >= 1 },
  { id: 're3', name: '三生有幸', icon: '🍀', desc: '完成 3 次轮回', bonus: '经验 +10%', xpPct: 10, check: s => s.rebirths >= 3 },
  { id: 're7', name: '七世轮回', icon: '♾️', desc: '完成 7 次轮回', bonus: '经验 +20%', xpPct: 20, check: s => s.rebirths >= 7 },
]

// ─── 江湖名号（身份感：按总等级自动晋升）──────────────────────────────────────
export interface TitleDef {
  name: string
  icon: string
  minTotalLevel: number
}

export const TITLES: TitleDef[] = [
  { name: '初入江湖', icon: '🥋', minTotalLevel: 1 },
  { name: '崭露头角', icon: '🗡️', minTotalLevel: 50 },
  { name: '小有名气', icon: '🎋', minTotalLevel: 150 },
  { name: '声名鹊起', icon: '🌄', minTotalLevel: 300 },
  { name: '名震一方', icon: '🐉', minTotalLevel: 500 },
  { name: '武林盟主', icon: '👑', minTotalLevel: 800 },
  { name: '传说', icon: '🌟', minTotalLevel: 1200 },
]

/** 根据总等级取当前名号（取最高可达档） */
export function titleFor(totalLevel: number): TitleDef {
  let cur = TITLES[0]
  for (const t of TITLES) {
    if (totalLevel >= t.minTotalLevel) cur = t
    else break
  }
  return cur
}

// ─── 江湖群侠榜（模拟群侠：固定名单，数值随玩家动态缩放）─────────────────────
export interface LeaderDef {
  name: string
  icon: string
  epithet: string
  flavor: string
}

export const LEADERS: LeaderDef[] = [
  { name: '西门吹雪', icon: '❄️', epithet: '剑神', flavor: '一剑霜寒十四州，据说从未有人见过他出第二剑。' },
  { name: '东方求败', icon: '☯️', epithet: '不世出', flavor: '一生求败而不得，如今退隐山林，每日与孤雁对坐。' },
  { name: '扫地僧', icon: '🧹', epithet: '扫地神僧', flavor: '藏经阁扫地八十年，秘境已到 40 层，深藏不露。' },
  { name: '燕十三', icon: '🗡️', epithet: '夺命剑十三', flavor: '他的剑路只有十三式，但江湖无人能接满十三式。' },
  { name: '百晓生', icon: '📜', epithet: '江湖活百科', flavor: '著《兵器谱》一卷，传说记载了天下兵器的秘密。' },
  { name: '楚留香', icon: '🪶', epithet: '盗帅', flavor: '闻香识人，来去无踪，他的扇子一出场就散着玫瑰香。' },
  { name: '郭巨侠', icon: '🏹', epithet: '侠之大者', flavor: '镇守襄阳二十八载，一双铁掌可开山裂石。' },
  { name: '唐门少主', icon: '💉', epithet: '暗器宗师', flavor: '蜀中唐门第十八代传人，袖中藏着八百种暗器。' },
  { name: '金轮法王', icon: '🔔', epithet: '密宗圣者', flavor: '五轮齐出，鬼神辟易，内功深不可测。' },
  { name: '慕容公子', icon: '🎭', epithet: '复国公子', flavor: '「以彼之道还施彼身」，天下武学皆能信手拈来。' },
  { name: '令狐冲', icon: '🍶', epithet: '笑傲剑客', flavor: '嗜酒如命，醉中剑法反比清醒时更凌厉三分。' },
  { name: '无名老乞丐', icon: '🥣', epithet: '藏拙高人', flavor: '终日蜷在破庙打盹，露出的手掌却覆满老茧。' },
  { name: '龙女', icon: '🐉', epithet: '古墓仙子', flavor: '冷若冰霜，剑出则天地为之失声。' },
  { name: '洪七公', icon: '🍜', epithet: '北丐', flavor: '吃遍天下美食，人称「九指神丐」，降龙掌天下无双。' },
  { name: '杨大侠', icon: '🦅', epithet: '神雕侠', flavor: '独臂行天下，一柄玄铁重剑重剑无锋、大巧不工。' },
  { name: '段公子', icon: '🪷', epithet: '六脉剑客', flavor: '大理段氏一阳指传人，指力可隔空点穴。' },
  { name: '神侯', icon: '🦉', epithet: '神鬼六扇门', flavor: '铁狱追魂，江湖榜七大名捕之首，消息通天。' },
  { name: '铁掌水上漂', icon: '💦', epithet: '轻功第一', flavor: '踏水无痕，他飞掠湖面的速度比鱼还快。' },
  { name: '李清愁', icon: '🌸', epithet: '紫衣神医', flavor: '妙手回春，求医者踏破门槛，她却只愿救有缘人。' },
  { name: '叶孤城', icon: '🌙', epithet: '白云城主', flavor: '「天外飞仙」一剑既出，天下无敌，唯剑神可抗。' },
]

// ─── 每日悬赏类型（决策点：每天 3 个轮换目标）────────────────────────────────
export interface DailyQuest {
  actionId: string
  count: number
  progress: number
  claimed: boolean
  rewardCoins: number
  rewardTokens: number
}

// ─── 轮回 ────────────────────────────────────────────────────────────────────
export const REBIRTH_REQ_LEVEL = 300 // 总等级门槛
export const rebirthPointsGain = (totalLevel: number) => Math.floor(totalLevel / 100)
export const REBIRTH_XP_PCT_PER_POINT = 5
export const REBIRTH_COIN_PCT_PER_POINT = 3

// ─── 任务模板（由动作自动生成，覆盖全部档位）────────────────────────────────
export interface TaskTemplate {
  skill: SkillId
  actionId: string
  item: string
  min: number
  max: number
}

export const TASK_TEMPLATES: TaskTemplate[] = ACTIONS.map(a => {
  const base = Math.max(4, Math.round(50 - a.levelReq * 0.75))
  return {
    skill: a.skill,
    actionId: a.id,
    item: a.outputs[0].item,
    min: base,
    max: Math.round(base * 2.2),
  }
})

// ─── 模拟聊天 ────────────────────────────────────────────────────────────────
export const CHAT_CHANNELS = ['江湖', '门派', '交易', '组队', '萌新', '求助', '私聊']

export const FAKE_CHAT: { channel: string; user: string; text: string }[] = [
  { channel: '江湖', user: '扫地僧', text: '贫僧扫了八十年地，秘境才爬到 40 层' },
  { channel: '江湖', user: '东方求败', text: '二转之后经验快了三成，真香' },
  { channel: '江湖', user: '燕十三', text: '熔岩巨兽掉的龙吟剑，全服第二把' },
  { channel: '江湖', user: '百晓生', text: '兵器谱第一，非轩辕神剑莫属' },
  { channel: '门派', user: '大师兄', text: '今日门派任务记得交，声望换贺礼' },
  { channel: '门派', user: '小师妹', text: '师兄，轮回之后装备还在吗？' },
  { channel: '门派', user: '大师兄', text: '不在，但成就和轮回点永存' },
  { channel: '交易', user: '钱多多', text: '收内丹 ×10，急用，价格好说' },
  { channel: '交易', user: '杂货铺老板', text: '出乾坤灵晶 ×5，打包 7500 铜钱' },
  { channel: '交易', user: '玄铁商人', text: '长期收深海寒铁，有多少要多少' },
  { channel: '组队', user: '铁掌水上漂', text: '九霄云巅三等一，来防御 80+ 的' },
  { channel: '萌新', user: '初入江湖', text: '这游戏能玩多久啊？' },
  { channel: '求助', user: '燕十三', text: '慢慢玩，三个月才刚出新手村' },
  { channel: '求助', user: '迷路小侠客', text: '秘境币换什么最划算？' },
  { channel: '求助', user: '百晓生', text: '先换玉佩，经验加成一个顶俩' },
]

export const MARKET_BUYABLE = ['gancao', 'copper', 'pine', 'rabbitMeat', 'crucian', 'tea']

export const fmt = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 10_000) return (n / 1000).toFixed(0) + 'K'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return Math.floor(n).toString()
}
