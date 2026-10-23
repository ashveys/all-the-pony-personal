<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Config } from 'vike-vue/Config'
import { diagnoseWhatsHot, type WhatsHotDiagnosticResult } from '@/scripts/whatsHotDiagnostic'
import { translateName } from '@/scripts/gameData'

const result = ref<WhatsHotDiagnosticResult | null>(null)
const error = ref<string | null>(null)

async function runDiagnostic() {
    error.value = null
    try {
        result.value = await diagnoseWhatsHot()
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e)
    }
}

onMounted(() => {
    void runDiagnostic()
})

function collectionName(collection: any) {
    return translateName(collection).value || collection.id
}
</script>

<template>
    <Config title="What's Hot — диагностика" />

    <div class="debug-page">
        <section v-if=!result && !error class="loading">Загружаем данные магазина и коллекций…</section>
        <section>
            <h1>What's Hot — диагностика</h1>
            <p>
                Проверяем цепочку: <code>/shop → tags: whthot → ID пони → collection_data.json</code>.
            </p>
            <button type="button" @click="runDiagnostic">Обновить проверку</button>
        </section>

        <section v-if="error" class="error">
            <strong>Ошибка:</strong> {{ error }}
        </section>

        <template v-if="result">
            <section class="summary">
                <div><b>{{ result.shopItems.length }}</b><span>WH товаров в /shop</span></div>
                <div><b>{{ result.collectionMatches.filter(x => x.matchType === 'full').length }}</b><span>полных совпадения</span></div>
                <div><b>{{ result.collectionMatches.filter(x => x.matchType === 'partial').length }}</b><span>частичных совпадения</span></div>
                <div><b>{{ result.unmatchedShopItems.length }}</b><span>WH товаров без коллекции</span></div>
            </section>

            <section>
                <h2>Найденные What's Hot товары</h2>
                <ul>
                    <li v-for="item in result.shopItems" :key="item.id">
                        <code>{{ item.id }}</code> — {{ item.name }}
                        <small>{{ item.tags.join(', ') }}</small>
                    </li>
                </ul>
            </section>

            <section>
                <h2>Совпадения с коллекциями</h2>
                <article v-for="match in result.collectionMatches" :key="match.collection.id" class="collection">
                    <h3>{{ collectionName(match.collection) }} <code>{{ match.collection.id }}</code></h3>
                    <p :class="['match-status', match.matchType]">
                        <strong v-if="match.matchType === 'full'">🟢 ПОЛНОЕ СОВПАДЕНИЕ</strong>
                        <strong v-else>🟡 ЧАСТИЧНОЕ СОВПАДЕНИЕ</strong>
                        — {{ match.matchedPonyIds.length }} из {{ match.ponyIds.length }} позиций.
                    </p>
                    <ul>
                        <li v-for="id in match.ponyIds" :key="id">
                            <span :class="{ hit: match.matchedPonyIds.includes(id) }">
                                {{ match.matchedPonyIds.includes(id) ? '✓' : '✗' }}
                            </span>
                            <code>{{ id }}</code>
                        </li>
                    </ul>
                    <p v-if="match.missingPonyIds.length" class="missing">
                        Не имеют <code>whthot</code>: {{ match.missingPonyIds.join(', ') }}
                    </p>
                </article>
            </section>

            <section v-if="result.unmatchedShopItems.length">
                <h2>WH товары, которые не нашли ни в одной коллекции</h2>
                <ul>
                    <li v-for="item in result.unmatchedShopItems" :key="item.id">
                        <code>{{ item.id }}</code> — {{ item.name }}
                    </li>
                </ul>
            </section>
        </template>
    </div>
</template>

<style scoped>
.debug-page { max-width: 1000px; margin: 0 auto; padding: 1rem; }
section { margin-bottom: 1.5rem; }
.summary { display: flex; gap: .75rem; flex-wrap: wrap; }
.summary div { padding: .8rem 1rem; border-radius: 12px; background: var(--background-color-secondary, #f5f5f5); }
.summary b { display: block; font-size: 1.5rem; }
.summary span, small { display: block; opacity: .7; }
button { padding: .6rem 1rem; border-radius: 10px; cursor: pointer; }
.collection { padding: 1rem; margin-bottom: .8rem; border: 1px solid #ddd; border-radius: 12px; }
.collection ul { columns: 2; }
.hit { font-weight: 700; }
.match-status.full { color: #267a45; }
.match-status.partial { color: #9a6a00; }
.missing { opacity: .75; }
.error { padding: 1rem; border-radius: 12px; background: #fee; }
.loading { padding: 1rem; border-radius: 12px; background: var(--background-color-secondary, #f5f5f5); }
code { font-family: monospace; }
</style>
