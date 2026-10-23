<script setup lang="tsx">
import { computed } from 'vue'
import { Config } from 'vike-vue/Config'
import { useGameObjects, translateName } from '@/scripts/gameData'
import { getPersonalF2P } from '@/scripts/personalData'
import PonyCard from '@/components/personal/PonyCard.vue'
import type { PonyType } from '@/types/gameDataTypes'
import SearchComponent from '@/components/SearchComponent.vue'
import { getNames } from '@/scripts/gameData'
import { useGameCardSize } from '@/composables/useGameCardSize'
import { useRem } from '@/composables/useRem'
import { SortFunctions } from '@/scripts/categories'

const gameObjects = useGameObjects()
const ponies = computed(() => Object.values(gameObjects.value?.pony?.objects ?? {}) as PonyType[])
const f2pPonies = computed(() => ponies.value.filter(pony => Boolean(getPersonalF2P(translateName(pony).value))))
const cardSize = 12
const { width: itemWidth } = useGameCardSize(cardSize)
const itemHeight = useRem(20.5)
const itemGap = useRem(.5)

const sorters = computed(() => ({ ...SortFunctions.common }))
</script>

<template>
    <Config title="Бесплатные пони" description="Пони с отмеченными бесплатными способами получения" />
    <main class="catalog-page">
        <header class="catalog-header">
            <div>
                <h1 class="page-title">Бесплатные пони</h1>
                <p class="page-description">Пони, для которых в личной таблице указан хотя бы один бесплатный способ получения.</p>
            </div>
            <div class="catalog-count">{{ f2pPonies.length }}</div>
        </header>
        <SearchComponent
            :data="f2pPonies"
            :get-search-text="getNames"
            :get-exact-search-text="(item) => item.id"
            :sorters="sorters"
            :filters="{}"
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
</style>
