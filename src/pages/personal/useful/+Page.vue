<script setup lang="tsx">
import { computed } from 'vue'
import { Config } from 'vike-vue/Config'
import { useGameObjects, getNames } from '@/scripts/gameData'
import { getPersonalUseful, getPersonalUsefulCategories } from '@/scripts/personalData'
import PonyCard from '@/components/personal/PonyCard.vue'
import type { PonyType } from '@/types/gameDataTypes'
import SearchComponent from '@/components/SearchComponent.vue'
import { useGameCardSize } from '@/composables/useGameCardSize'
import { useRem } from '@/composables/useRem'

const gameObjects = useGameObjects()
const ponies = computed(() => Object.values(gameObjects.value?.pony?.objects ?? {}) as PonyType[])
const usefulPonies = computed(() => ponies.value.filter(pony => Boolean(getPersonalUseful(pony))))
const cardSize = 12
const { width: itemWidth } = useGameCardSize(cardSize)
const itemHeight = useRem(20.5)
const itemGap = useRem(.5)
const categories = computed(() => getPersonalUsefulCategories())
const filters = computed(() => Object.fromEntries(categories.value.map(category => [
    category,
    { name: category, client: true, check: (pony: PonyType) => Boolean(getPersonalUseful(pony)?.roles.includes(category)) },
])))
</script>

<template>
    <Config title="Полезные пони" description="Пони, отмеченные как полезные в личной базе" />
    <main class="catalog-page">
        <header class="catalog-header">
            <div>
                <h1 class="page-title">Полезные пони</h1>
                <p class="page-description">Та же карточка и навигация, что и в основном каталоге. Нужные детали остаются внутри страницы пони.</p>
                <div class="category-list">
                    <span v-for="category in categories" :key="category" class="category-chip">{{ category }}</span>
                </div>
            </div>
            <div class="catalog-count">{{ usefulPonies.length }}</div>
        </header>
        <SearchComponent
            :data="usefulPonies"
            :get-search-text="getNames"
            :get-exact-search-text="(item) => item.id"
            :sorters="{}"
            :filters="filters"
            placeholder="Поиск пони..."
            page-param="page"
            save-url
            :item-width="itemWidth"
            :item-height="itemHeight"
            :item-gap="itemGap"
        >
            <template #item="{ item }">
                <PonyCard :pony="item" />
            </template>
        </SearchComponent>
    </main>
</template>

<style scoped>
.catalog-page { width:min(100%,var(--content-max-width)); margin:0 auto; }
.catalog-header { display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:1rem; }
.catalog-count { min-width:3rem; padding:.55rem .75rem; border:1px solid var(--ui-border); border-radius:.8rem; background:#fff; color:var(--ui-text); text-align:center; font-size:.85rem; font-weight:700; }
.category-list { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.7rem; }
.category-chip { padding:.35rem .55rem; border:1px solid var(--ui-border); border-radius:999px; background:#fff; color:var(--ui-muted); font-size:.7rem; font-weight:700; }
</style>
