<script setup lang="tsx">
import { computed } from 'vue'
import { Config } from 'vike-vue/Config'
import { useGameObjects } from '@/scripts/gameData'
import { useSaveStore } from '@/stores/saveManager'
import { getPersonalF2P, getPersonalUseful, getPersonalUsefulCategories } from '@/scripts/personalData'
import type { PonyType } from '@/types/gameDataTypes'

const gameObjects = useGameObjects()
const saveStore = useSaveStore()
const ponies = computed(() => Object.values(gameObjects.value?.pony?.objects ?? {}) as PonyType[])
const owned = computed(() => ponies.value.filter(pony => saveStore.hasPony(pony.id)))
const f2p = computed(() => ponies.value.filter(pony => Boolean(getPersonalF2P(pony))))
const useful = computed(() => ponies.value.filter(pony => Boolean(getPersonalUseful(pony))))
const usefulCategoryCounts = computed(() => {
    const counts = new Map<string, number>()
    for (const pony of useful.value) {
        for (const role of getPersonalUseful(pony)?.roles ?? []) counts.set(role, (counts.get(role) ?? 0) + 1)
    }
    return getPersonalUsefulCategories().map(role => ({ role, count: counts.get(role) ?? 0 })).filter(x => x.count)
})
</script>

<template>
    <Config title="Мой прогресс" description="Личный прогресс по каталогу пони" />
    <main class="progress-page">
        <header>
            <h1 class="page-title">Мой прогресс</h1>
            <p class="page-description">Отметка «получена» хранится только в этом браузере.</p>
        </header>

        <section class="stats-grid">
            <article class="stat-card"><strong>{{ owned.length }}</strong><span>получено</span><small>из {{ ponies.length }}</small></article>
            <article class="stat-card"><strong>{{ ponies.length - owned.length }}</strong><span>не получено</span><small>{{ Math.round((owned.length / Math.max(ponies.length, 1)) * 100) }}% собрано</small></article>
            <article class="stat-card"><strong>{{ f2p.length }}</strong><span>F2P</span><small>{{ f2p.filter(p => !saveStore.hasPony(p.id)).length }} не получено</small></article>
            <article class="stat-card"><strong>{{ useful.length }}</strong><span>полезные</span><small>{{ useful.filter(p => !saveStore.hasPony(p.id)).length }} не получено</small></article>
        </section>

        <section v-if="usefulCategoryCounts.length" class="section">
            <h2>Категории полезности</h2>
            <div class="role-list">
                <div v-for="item in usefulCategoryCounts" :key="item.role" class="role-row"><span>{{ item.role }}</span><strong>{{ item.count }}</strong></div>
            </div>
        </section>
    </main>
</template>

<style scoped>
.progress-page { width:min(100%,var(--content-max-width)); margin:0 auto; }
.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(9rem,1fr)); gap:.7rem; margin:1.25rem 0 1.7rem; }
.stat-card { display:flex; flex-direction:column; min-height:7rem; padding:1rem; border:1px solid var(--ui-border); border-radius:1rem; background:#fff; box-shadow:0 .3rem 1rem rgba(85,75,130,.05); }
.stat-card strong { color:var(--ui-text); font-size:1.35rem; font-weight:700; }
.stat-card span { margin-top:.35rem; color:var(--ui-text); font-size:.78rem; font-weight:700; }
.stat-card small { margin-top:.25rem; color:var(--ui-muted); font-size:.68rem; }
.section { margin-top:1.5rem; padding-top:1.3rem; border-top:1px solid var(--ui-border); }
.section h2 { color:var(--ui-text); font-size:1.1rem; font-weight:700; }
.section-head { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:.5rem; }
.section-head p { margin-top:.25rem; color:var(--ui-muted); font-size:.75rem; }
.section-head > strong { color:var(--ui-muted); }
.role-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(15rem,1fr)); gap:.45rem; margin-top:.7rem; }
.role-row { display:flex; justify-content:space-between; padding:.65rem .8rem; border:1px solid var(--ui-border); border-radius:.75rem; background:#fff; color:var(--ui-muted); font-size:.75rem; }
.role-row strong { color:var(--ui-text); }
.empty { padding:1rem; border:1px dashed var(--ui-border-strong); border-radius:.8rem; color:var(--ui-muted); text-align:center; }
</style>
