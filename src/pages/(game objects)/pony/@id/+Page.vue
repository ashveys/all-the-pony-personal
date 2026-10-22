<script setup lang="ts">
import { computed } from 'vue';
import { getCollection, getFortuneShopData, getObject, getTaskInfo, translateName, useGroupQuests } from '@/scripts/gameData'
import { language } from '@/globals';
import CurrencyImage from '@/components/CurrencyImage.vue'
import { staticImage } from '@/scripts/common'
import { formatTime } from '@/scripts/timeFunctions'
import StarRewards from '@/components/StarRewards.vue'
import BackButton from '@/components/buttons/BackButton.vue'
import { useSaveStore } from '@/stores/saveManager'
import Stars from '@/components/Stars.vue'
import { LOCATIONS } from '@/scripts/categories'
import { computedAsync, isClient, useArrayFilter, useMounted } from '@vueuse/core'
import { usePageContext } from 'vike-vue/usePageContext'
import Link from '@/components/Link.vue'
import { Config } from 'vike-vue/Config'
import absoluteUrl from '@/scripts/absoluteUrl'
import { useData } from 'vike-vue/useData'
import type { PonyType } from '@/types/gameDataTypes'
import PriceHistory from '@/components/tables/PriceHistory.vue'
import type { PriceHistoryType } from '@/scripts/api.types'
import ObjectPage from '@/layouts/ObjectPage.vue';
import FortuneShopTable from '@/components/tables/FortuneShopTable.vue';
import { useI18n } from 'vue-i18n';
import { createAssetUrl } from '@/scripts/assets';
import TaskInfo from '@/components/TaskInfo.vue';
import LazyImage from '@/components/LazyImage.vue';
import { useBasePrice } from '@/composables/useBasePrice';
import type { Data } from './+data';
import { modifyUrl } from 'vike/modifyUrl';
import PersonalPonyInfo from '@/components/personal/PersonalPonyInfo.vue';

const { t } = useI18n()
const isMounted = useMounted()
const groupQuests = useGroupQuests()

const pageContext = usePageContext()

const saveStore = useSaveStore()

const data = useData<Data>()
const priceHistory = computed(() => {
    if (!data.priceHistory) {
        return []
    }
    
    return data.priceHistory.price_history.filter(item => !item.hidden)
})

const filteredPriceHistory = useArrayFilter(priceHistory, (item) => item.price.base.currency !== 'Lotto')

const pony = computed(() => data.pony)

const basePrice = useBasePrice(pony, priceHistory)

const stars = computed({
  get() {
    if (!isMounted.value) {
        return 0
    }

    if (saveStore.hasPony(pony.value?.id)) {
      return saveStore.ponies[pony.value?.id].level
    } else {
      return 0
    }
  },
  set(stars: 0 | 1 | 2 | 3 | 4 | 5) {
    saveStore.addPony(pony.value?.id, {
      level: stars,
    })
  }
})


const name = computed(() => {
    let name = translateName(pony.value).value
    return name
})

const description = computed(() => {
    let description = pony.value?.description[language.value.key]
    return description
})

const house = computed(() => getObject(pony.value?.house, 'house'))
const houseName = computed(() => translateName(house.value).value)

const fortuneShopData = computed(() => getFortuneShopData(pony.value?.id))

const showProIcon = computed(() => {
    if (!groupQuests.value) {
        return false
    }
    
    let showPro = false

    for (let quest of pony.value.pro) {
        if (quest === 'random') {
            showPro = true
            break
        }
        if (!groupQuests.value?.quests[quest].special) {
            showPro = true
            break
        }
    }
    return showPro
})

const groupQuestName = computed(() => {
    const names = []

    if (!groupQuests.value) {
        return
    }
    
    for (let quest of pony.value.pro) {
        if (quest === 'random') {
            names.push(t('group_quests.random_pro'))
        } else {
            let name = groupQuests.value?.quests[quest].name[language.value.key]
            let special = groupQuests.value?.quests[quest].special
            switch (special) {
                case 'seasonal': name = t('group_quests.name_seasonal', {name}); break
                case 'tutorial':name = t('group_quests.name_tutorial', {name}); break
            }

            names.push(name)
        }
    }

    return new Intl.ListFormat(language.value.code, {style: 'short'}).format(names)
})

const costumes = computed(() => {
    if (!pony.value?.costumes.length) {
        return []
    }

    return pony.value.costumes.map(costume => getObject(costume, 'costume'))
})

const tasks = computed(() => {
    /**
     * Sort tasks by
     * 1. Tokens first
     * 2. Gems
     * 3. Bits/gems to duration ratio
     */
    
    let tasks = pony.value.tasks
    if (!tasks?.length && pony.value.changeling.id) {
        tasks = getObject(pony.value.changeling.id, 'pony')?.tasks
    }

    if (!tasks) {
        return []
    }

    let result = tasks.map(taskId => getTaskInfo(taskId))
                    .filter(task => task)
    
    result.sort((a, b) => {
        if (Boolean(a.reward.token) !== Boolean(b.reward.token)) {
            return a.reward.token ? -1 : 1
        }
        return (a.reward.gems - b.reward.gems) || (
            ((a.reward.gems || a.reward.bits) / a.duration) - 
            ((b.reward.gems || b.reward.bits) / b.duration)
        )
    })

    return result
})

const collectionLink = computed(() => {
    if (pony.value.category !== 'pony' || !Array.isArray(pony.value.collections)) {
        return null
    }
    
    const collections = pony.value.collections.filter(collectionId => {
        const collection = getCollection(collectionId)
        return !(collection.tags?.includes('unused') || collection.tags?.includes('vip'))
    })


    if (collections.length === 0) {
        return null
    } else if (collections.length === 1) {
        return `/collection/${collections[0]}/`
    }
    return modifyUrl(
        '/search/collections/',
        {
            search: {
                q: name.value,
            }
        }
    )
})

</script>

<template>
    <Config
        v-if="pony"
        :title="name"
        :description="description"
    >
    </Config>

    <div>
        <back-button fallback="/search/ponies" />
        <div v-if="!pony">
            Pony {{ pageContext.routeParams.id }} not found
        </div>
        <div v-else>
            <ObjectPage :gameObject="pony">
                <template #name>
                    <img class="portrait" :src="createAssetUrl(pony.image.portrait.path)" :alt="name">
                    {{ name }}
                </template>
                <template #image-left>
                    <img v-if="showProIcon" loading="lazy" src="@/assets/images/ui/pro-pony.png" />
                </template>
                <template #image>
                    <div class="character-wrapper">
                        <div class="character-container">
                            <Stars
                                class="stars"
                                v-model="stars"
                                interractive
                            >
                                <img class="full-image" :src="createAssetUrl(pony.image.main.path)" :alt="name">
                            </Stars>
                            <Link
                                v-if="pony.changeling.id"
                                :href="`/pony/${pony.changeling.id}/`"
                                class="button button-blue"
                                keep-scroll-position
                            >
                                {{ $t('game_object.pony.transform') }}
                            </Link>
                        </div>
                    </div>
                </template>
                <template #left-info>
                    <div class="description">{{ description }}</div>
                </template>
                <template #info>
                    <table class="infobox">
                        <tbody>
                            <tr>
                                <th colspan="2">{{ $t('common.info') }}</th>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <Link :href="`https://mlp-game-wiki.no/wiki/${pony.wiki_path}`" class="link" target="_blank">
                                        {{ $t('common.wiki') }}
                                    </Link>
                                </td>
                            </tr>
                            <tr v-if="(basePrice?.currency && basePrice?.price) || (basePrice?.token && basePrice?.tokens)">
                                <td>{{ $t('common.price') }}</td>
                                <td>
                                    <template v-if="basePrice.token && basePrice.tokens">
                                        <CurrencyImage :object="basePrice.token" is-link>
                                            {{ $n(basePrice.tokens) }}
                                        </CurrencyImage>
                                        <template v-if="basePrice.currency && basePrice.price">
                                            {{}}
                                            {{ $t('common.or').toLocaleLowerCase() }} 
                                            {{}}
                                        </template>
                                    </template>
                                    <CurrencyImage v-if="basePrice.currency && basePrice.price" :object="basePrice.currency">
                                        {{ $n(basePrice.price) }}
                                    </CurrencyImage>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('game_object.common.unlock_level') }}</td>
                                <td>{{ pony.unlock_level }}</td>
                            </tr>
                            <tr>
                                <td>{{ $t('location.town') }}</td>
                                <td>{{ $t(LOCATIONS[pony.location].string) }}</td>
                            </tr>
                            <tr>
                                <td>{{ $t('game_object.house.house') }}</td>
                                <td>
                                    <Link
                                        v-if="house !== null"
                                        class="link"
                                        :href="`/house/${house?.id}`"
                                    >
                                        {{ houseName }}
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('game_object.pony.arrival_bonus') }}</td>
                                <td>
                                    <currency-image object="XP">
                                        {{ pony.arrival_xp }}
                                    </currency-image>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('game_object.pony.minigame_cooldown') }}</td>
                                <td>{{ formatTime(pony.minigame.cooldown) }}</td>
                            </tr>
                            <tr>
                                <td>{{ $t('game_object.pony.minigame_skip_cost') }}</td>
                                <td>
                                    <currency-image object="Gems">
                                        {{ pony.minigame.skip_cost }}
                                    </currency-image>
                                </td>
                            </tr>
                            <tr v-if="groupQuestName">
                                   <td>{{ $t('group_quests.pro') }}</td>
                                   <td>{{ groupQuestName }}</td>
                            </tr>
                            <tr>
                                <td colspan="2" class="table-header">{{ $t('game_object.pony.level_up_rewards') }}</td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <span v-if="pony.max_level || pony.rewards.length == 0" class="none-star-rewards">None</span>
                                    <star-rewards
                                        v-if="!pony.max_level && pony.rewards.length > 0"
                                        :rewards="pony.rewards"
                                        v-model="stars"
                                    ></star-rewards>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </template>
            </ObjectPage>
            <PersonalPonyInfo :pony="pony" />
            <section class="section detail-section detail-section--history" v-if="filteredPriceHistory.length">
                <h2 class="h2 detail-section__title">{{ $t('price_history.title') }}</h2>
                <PriceHistory :object="pony?.id" :priceHistory="filteredPriceHistory"></PriceHistory>
            </section>
            <section class="section detail-section detail-section--fortune" v-if="fortuneShopData">
                <h2 class="h2 detail-section__title">{{ $t('fortune_shop.title') }}</h2>
                <FortuneShopTable :prices="fortuneShopData.prices"></FortuneShopTable>
            </section>
            <section class="section detail-section detail-section--costumes" v-if="pony.costumes.length">
                <h2 class="h2 detail-section__title">{{ $t('game_object.costume.costume', 2) }}</h2>
                <div class="costumes detail-grid">

                    <Link
                        v-for="costume in costumes"
                        :href="`/${costume.category}/${costume.id}`"
                        class="costume link"
                    >
                        <img
                            :src="createAssetUrl(costume.image.main.path)"
                            :alt="translateName(costume).value"
                            :title="translateName(costume).value"
                            loading="lazy"
                
                        >
                        <span class="costume-name">{{ translateName(costume) }}</span>
                    </Link>
                </div>
            </section>
            <section class="section detail-section detail-section--tasks" v-if="tasks.length">
                <h2 class="h2 detail-section__title">{{ $t('tasks.task', 2) }}</h2>
                <div class="tasks detail-grid detail-grid--tasks">
                    <TaskInfo v-for="task in tasks" :task-id="task"></TaskInfo>
                </div>
            </section>
        </div>
    </div>
</template>

<style lang="scss" scoped>

.detail-section {
    margin: 1.25rem 0;
    padding: 1.1rem 1.15rem 1.2rem;
    border: 1px solid var(--ui-border);
    border-radius: 1.15rem;
    background: linear-gradient(135deg, rgba(237,247,251,.72), rgba(242,238,249,.62) 52%, rgba(253,240,245,.7));
    box-shadow: 0 0.35rem 1.2rem rgba(82,90,117,.06);
    overflow: hidden;
}

.detail-section__title {
    margin: 0 0 .85rem;
    color: var(--ui-text);
    font-size: 1.15rem;
    font-weight: 700;
}

.detail-section :deep(.table-container) {
    margin: 0;
    border: 1px solid rgba(212,210,230,.85);
    border-radius: .85rem;
    background: rgba(255,255,255,.82);
    overflow-x: auto;
}

.detail-section :deep(table) {
    background: transparent;
}

.detail-section :deep(th) {
    background: rgba(242,238,249,.82);
    color: var(--ui-text);
}

.detail-section :deep(td) {
    background: rgba(255,255,255,.58);
}

.detail-section :deep(tr:nth-child(even) td) {
    background: rgba(237,247,251,.28);
}

.detail-section :deep(.task),
.detail-section :deep(.task-info) {
    border-color: var(--ui-border);
    border-radius: .9rem;
    background: rgba(255,255,255,.82);
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
    gap: .75rem;
}

.detail-grid .costume {
    min-width: 0;
    padding: .65rem .45rem .75rem;
    border: 1px solid rgba(229,229,239,.9);
    border-radius: .9rem;
    background: rgba(255,255,255,.78);
    transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
}

.detail-grid .costume:hover {
    transform: translateY(-2px);
    border-color: var(--ui-border-strong);
    box-shadow: 0 .35rem .9rem rgba(82,90,117,.08);
}

.detail-grid .costume img {
    width: 7.25rem;
    height: 7.25rem;
}

.costume-name {
    color: var(--ui-text);
    font-size: .78rem;
    line-height: 1.25;
}

.detail-grid--tasks {
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

@media (max-width: 42rem) {
    .detail-section {
        padding: .9rem;
        border-radius: .95rem;
    }

    .detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .detail-grid--tasks {
        grid-template-columns: 1fr;
    }
}

.portrait {
    height: 1em;
}

.full-image {
    /*max-height: 10rem;*/
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
}

.character-wrapper {
    align-items: start;
}

.character-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stars {
    width: 12rem;
    height: 13rem;
    font-size: 1.7rem;
}

.left-image-container,
.right-image-container {
    --width: 2rem;
    
    height: 100%;
    width: var(--width);
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-content: center;

    /* padding: 0.4rem 0.3rem; */
}
.left-image-container {
    left: 0;
}
.right-image-container {
    right: 0;
}

.left-image-container > *,
.right-image-container > * {
    width: var(--width);
    height: var(--width);
    /*aspect-ratio: 1 / 1;*/

    margin: 0;
}


.costumes {
    --item-width: 8rem;

    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--item-width), 1fr));
    /* grid-template-rows: subgrid; */
    gap: 0.8rem;
}

.costume {
    display: grid;
    text-align: center;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;
    grid-row: span 2;
    width: 100%;
    justify-items: center;
    align-items: stretch;
    
    img {
        object-fit: contain;
        object-position: center;
        width: var(--item-width);
        height: 8rem;
    }
}

</style>
