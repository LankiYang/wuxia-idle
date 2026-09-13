// ─── SVG 图标映射 — 来自 game-icons.net (CC BY 3.0: Lorc, Delapouite & contributors) ───
// 每个 SVG 文件放在 src/assets/icons/ 下，通过 Vite import 引入

import swordBrandishUrl from './assets/icons/sword-brandish.svg'
import broadswordUrl from './assets/icons/broadsword.svg'
import fistUrl from './assets/icons/fist.svg'
import throwingKnifeUrl from './assets/icons/throwing-knife.svg'
import meditationUrl from './assets/icons/meditation.svg'
import heartsUrl from './assets/icons/hearts.svg'
import shieldUrl from './assets/icons/shield.svg'
import potionBallUrl from './assets/icons/potion-ball.svg'
import anvilImpactUrl from './assets/icons/anvil-impact.svg'
import fishingUrl from './assets/icons/fishing.svg'
import animalHideUrl from './assets/icons/animal-hide.svg'
import miningUrl from './assets/icons/mining.svg'
import axeInLogUrl from './assets/icons/axe-in-log.svg'
import cookingPotUrl from './assets/icons/cooking-pot.svg'
import needleTailUrl from './assets/icons/needle-tail.svg'
import crystalShineUrl from './assets/icons/crystal-shine.svg'
import coinUrl from './assets/icons/coin.svg'
import scrollUnfurledUrl from './assets/icons/scroll-unfurled.svg'
import trophyUrl from './assets/icons/trophy.svg'
import dragonHeadUrl from './assets/icons/dragon-head.svg'
import herbsUrl from './assets/icons/herbs.svg'
import chestUrl from './assets/icons/chest.svg'
import axeSwordUrl from './assets/icons/axe-sword.svg'
import spearHookUrl from './assets/icons/spear-hook.svg'
import knifeThrustUrl from './assets/icons/knife-thrust.svg'
import gearsUrl from './assets/icons/gears.svg'
import armorVestUrl from './assets/icons/armor-vest.svg'

// 技能 ID → SVG URL 映射
export const SKILL_SVG: Partial<Record<string, string>> = {
  herbalism: herbsUrl,
  mining: miningUrl,
  woodcutting: axeInLogUrl,
  hunting: animalHideUrl,
  fishing: fishingUrl,
  alchemy: potionBallUrl,
  smithing: anvilImpactUrl,
  cooking: cookingPotUrl,
  tailoring: needleTailUrl,
  enhancing: crystalShineUrl,
  hp: heartsUrl,
  attack: swordBrandishUrl,
  defense: shieldUrl,
  sword: broadswordUrl,
  fist: fistUrl,
  hidden: throwingKnifeUrl,
  inner: meditationUrl,
}

// 道具 ID → SVG URL 映射（常用/关键物品）
export const ITEM_SVG: Partial<Record<string, string>> = {
  coin: coinUrl,
  token: scrollUnfurledUrl,
  chest: chestUrl,
  trophy: trophyUrl,
  dragonHead: dragonHeadUrl,
  sword: swordBrandishUrl,
  broadsword: broadswordUrl,
  fist: fistUrl,
  copperBlade: knifeThrustUrl,
  ironSpear: spearHookUrl,
  pozhanAxe: axeSwordUrl,
  meteorCrystal: gearsUrl,
  clothArmor: armorVestUrl,
}
