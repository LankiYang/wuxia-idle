// ─── 精灵图映射 — 战斗角色 & 怪物 ────────────────────────────────────────────
// 图片由 Cloudsway API (Gemini 2.5 Flash Image) 生成，统一像素风 chibi 风格

// 玩家角色
import heroUrl from '../assets/sprites/characters/hero.png'

// 采集场景背景（5 采集系）+ 主角动作帧
import sceneLabUrl from '../assets/sprites/scenes/lab.png'
import actStartUrl from '../assets/sprites/characters/act_start.png'
import actStrikeUrl from '../assets/sprites/characters/act_strike.png'
import actRestUrl from '../assets/sprites/characters/act_rest.png'
import actIdleUrl from '../assets/sprites/characters/act_idle.png'

/** 玩家角色精灵图 */
export const HERO_SPRITE = heroUrl

/** 采集技能 → 场景背景图 */
export const SCENE_BG: Partial<Record<string, string>> = {
  lab: sceneLabUrl, // 秘境战斗背景
}

/** 主角动作帧（供帧动画；若角色一致性不佳由 CSS 动画方案替代） */
export const HERO_ACT_FRAMES: string[] = [actStartUrl, actStrikeUrl, actRestUrl, actIdleUrl]

// 普通怪物（12 种，对应 data.ts MONSTERS）
import rabbitSpiritUrl from '../assets/sprites/monsters/rabbit_spirit.png'
import boarKingUrl from '../assets/sprites/monsters/boar_king.png'
import banditUrl from '../assets/sprites/monsters/bandit.png'
import banditBossUrl from '../assets/sprites/monsters/bandit_boss.png'
import corpseSoldierUrl from '../assets/sprites/monsters/corpse_soldier.png'
import tombGuardianUrl from '../assets/sprites/monsters/tomb_guardian.png'
import swordPhantomUrl from '../assets/sprites/monsters/sword_phantom.png'
import wulinLegendUrl from '../assets/sprites/monsters/wulin_legend.png'
import fireLizardUrl from '../assets/sprites/monsters/fire_lizard.png'
import lavaBeastUrl from '../assets/sprites/monsters/lava_beast.png'
import skySoldierUrl from '../assets/sprites/monsters/sky_soldier.png'
import skyEmperorUrl from '../assets/sprites/monsters/sky_emperor.png'

// 秘境普通怪（5 种，按 data.ts labMonster 的 names 数组顺序）
import labStoneGolemUrl from '../assets/sprites/monsters/lab_stone_golem.png'
import labMistDemonUrl from '../assets/sprites/monsters/lab_mist_demon.png'
import labIceBeastUrl from '../assets/sprites/monsters/lab_ice_beast.png'
import labSoulShadowUrl from '../assets/sprites/monsters/lab_soul_shadow.png'
import labTowerSpiritUrl from '../assets/sprites/monsters/lab_tower_spirit.png'

// 秘境 Boss（5 种，按 data.ts labMonster 的 bossNames 数组顺序）
import labBossRemnantUrl from '../assets/sprites/monsters/lab_boss_remnant.png'
import labBossHellKingUrl from '../assets/sprites/monsters/lab_boss_hell_king.png'
import labBossChaosLordUrl from '../assets/sprites/monsters/lab_boss_chaos_lord.png'
import labBossSamsaraUrl from '../assets/sprites/monsters/lab_boss_samsara.png'
import labBossSovereignUrl from '../assets/sprites/monsters/lab_boss_sovereign.png'

/** 普通怪物 id → 精灵图 URL */
export const MONSTER_SPRITE: Record<string, string> = {
  rabbitJing: rabbitSpiritUrl,
  boarKing: boarKingUrl,
  bandit: banditUrl,
  banditBoss: banditBossUrl,
  corpse: corpseSoldierUrl,
  tombGuard: tombGuardianUrl,
  swordGhost: swordPhantomUrl,
  wulinGod: wulinLegendUrl,
  fireLizard: fireLizardUrl,
  lavaBeast: lavaBeastUrl,
  skySoldier: skySoldierUrl,
  skyEmperor: skyEmperorUrl,
}

/** 秘境普通怪：索引 0–4（对应 labMonster 的 names 数组） */
export const LAB_NORMAL_SPRITES: string[] = [
  labStoneGolemUrl,   // 石傀儡
  labMistDemonUrl,    // 迷雾妖
  labIceBeastUrl,     // 玄冰兽
  labSoulShadowUrl,   // 噬魂影
  labTowerSpiritUrl,  // 镇塔灵
]

/** 秘境 Boss：索引 0–4（对应 labMonster 的 bossNames 数组） */
export const LAB_BOSS_SPRITES: string[] = [
  labBossRemnantUrl,    // 塔主残念
  labBossHellKingUrl,   // 镇狱明王
  labBossChaosLordUrl,  // 混沌魔君
  labBossSamsaraUrl,    // 轮回尊者
  labBossSovereignUrl,  // 秘境主宰
]

/**
 * 根据秘境层数获取对应的精灵图 URL
 * @param floor 秘境层数（1-based）
 * @returns 精灵图 URL
 */
export function labMonsterSprite(floor: number): string {
  const isBoss = floor % 5 === 0
  const idx = (Math.floor((floor - 1) / 5)) % 5
  return isBoss ? LAB_BOSS_SPRITES[idx] : LAB_NORMAL_SPRITES[(floor - 1) % 5]
}
