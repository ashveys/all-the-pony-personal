<script setup lang="tsx">
import SearchComponent from '@/components/SearchComponent.vue';
import { CATEGORIES, FilterFunctions, PLURAL_CATEGORY_MAP, SortFunctions } from '@/scripts/categories';
import { useGameObjects, getNames } from '@/scripts/gameData';
import { computed } from 'vue';
// import { useSeoMeta } from '@unhead/vue';
import ObjectCard from '@/components/ObjectCard.vue';
import { useGameCardSize } from '@/composables/useGameCardSize';
import { useRem } from '@/composables/useRem';
import { useWindowSize } from '@vueuse/core';
import type { CategoryName, GameObject } from '@/types/gameDataTypes';
import { Config } from 'vike-vue/Config';
import { usePageContext } from 'vike-vue/usePageContext';
import { useI18n } from 'vue-i18n';

const pageContext = usePageContext()
const gameObjects = useGameObjects()

const { t } = useI18n()

const category = computed<CategoryName | null>(() => {
    return PLURAL_CATEGORY_MAP[pageContext.routeParams.category] || null
})

const categoryName = computed(() => t(CATEGORIES[category?.value].string, 2))

// useSeoMeta({
//     title: () => categoryName.value,
//     ogTitle: () => `${t('search.title')} ${categoryName.value}`,
// })

const sortFunctions = computed(() => {
    let functions = {
        ...SortFunctions.common
    }

    if (category.value in SortFunctions) {
        functions = {
            ...functions,
            ...SortFunctions[category.value],
        }
    }

    return functions
})

const filterFunctions = computed(() => {
    let functions = {
        ...FilterFunctions.common
    }

    if (category.value in FilterFunctions) {
        functions = {
            ...functions,
            ...FilterFunctions[category.value]
        }
    }

    return functions
})

const objects = computed(() => {
    if (!gameObjects.value) {
        return []
    }
    const values = Object.values(gameObjects.value[category.value].objects) as GameObject[]
    return values
})

const { width: viewportWidth } = useWindowSize()
const cardSize = computed(() => {
    if (viewportWidth.value < 560) return 9.5
    if (viewportWidth.value < 900) return 11
    return 13.5
})

const { width: itemWidth } = useGameCardSize(cardSize)
const itemHeight = useRem(() => {
    if (viewportWidth.value < 560) return 18.2
    if (viewportWidth.value < 900) return 19.8
    return 21.8
})
const itemGap = useRem(() => viewportWidth.value < 560 ? .45 : .65)

</script>

<template>
    <Config :title="categoryName">

    </Config>

    <main v-if="category != null" class="catalog-shell" :class="{ 'pony-catalog': category === 'pony' }">
        <header v-if="category === 'pony'" class="catalog-header">
            <div class="catalog-heading">
                <span class="catalog-kicker">Каталог</span>
                <h1 class="page-title">Все пони</h1>
                <p class="page-description">Полный список пони с быстрыми отметками F2P, полезности, коллекций и личного прогресса.</p>
            </div>
            <div class="catalog-count">{{ objects.length }}</div>
        </header>

    <!-- @vue-generic {GameObject} -->
    <SearchComponent
        :data="objects"
        :get-search-text="getNames"
        :get-exact-search-text="(item) => item.id"
        :sorters="sortFunctions"
        :filters="filterFunctions"
        :placeholder="$t(CATEGORIES[category].string)"
        page-param="page"
        save-url
        :item-width="itemWidth"
        :item-height="itemHeight"
        :item-gap="itemGap"
    >
        <template #item="{ item }">
            <ObjectCard
                class="item-card"
                :object="item"
                is-link
                hasButtons
            >
            </ObjectCard>
        </template>
    </SearchComponent>
    </main>
    <div v-else>Not Found</div>
</template>

<style lang="css" scoped>
.catalog-shell {
    width: min(100%, var(--content-max-width));
    margin: 0 auto;
}

.catalog-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    padding: .65rem .75rem .9rem;
}

.catalog-heading { min-width: 0; }
.catalog-kicker {
    display: inline-block;
    margin-bottom: .25rem;
    color: #8b82ad;
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
}
.catalog-count {
    flex: 0 0 auto;
    min-width: 3.25rem;
    padding: .65rem .8rem;
    border: 1px solid var(--ui-border);
    border-radius: .9rem;
    background: linear-gradient(145deg, var(--ui-blue-soft), var(--ui-lilac-soft));
    color: var(--ui-text);
    text-align: center;
    font-size: .82rem;
    font-weight: 700;
}

.item-card {
    --card-size: calc(v-bind('cardSize') * 1rem);
}

@media (max-width: 560px) {
    .catalog-header { align-items: center; padding-inline: .35rem; }
    .page-description { font-size: .78rem; }
}
</style>
