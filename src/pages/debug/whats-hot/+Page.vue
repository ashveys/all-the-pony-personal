<script setup lang="ts">
import { Config } from 'vike-vue/Config'
import { ClientOnly } from 'vike-vue/ClientOnly'
import { ref } from 'vue'

const result = ref<any | null>(null)
const error = ref<string>('')
const loading = ref(false)

function asRecord(value: unknown, label: string): Record<string, any> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label}: сервер вернул неожиданный формат данных.`)
    }
    return value as Record<string, any>
}

function getName(value: any): string {
    const name = value?.name
    if (typeof name === 'string') return name
    if (name && typeof name === 'object') return name.ru ?? name.en ?? Object.values(name)[0] ?? value?.id ?? 'Без названия'
    return value?.id ?? 'Без названия'
}

async function getJson(url: string): Promise<unknown> {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
    return await response.json()
}

async function runDiagnostic() {
    loading.value = true
    error.value = ''
    result.value = null

    try {
        const [shopRaw, collectionsRaw] = await Promise.all([
            getJson('https://api.all-the-ponies.com/shop'),
            getJson('https://assets.all-the-ponies.com/collection_data.json'),
        ])

        if (!Array.isArray(shopRaw)) {
            throw new Error(`/shop вернул не массив. Получено: ${typeof shopRaw}`)
        }

        const collectionData = asRecord(collectionsRaw, 'collection_data.json')
        const collections = asRecord(collectionData.collections, 'collection_data.json.collections')

        const whShopItems = shopRaw.filter((entry: any) => Array.isArray(entry?.tags) && entry.tags.includes('whthot'))
        const whIds = new Set(whShopItems.map((entry: any) => entry?.id).filter(Boolean))

        const matches: any[] = []
        for (const collection of Object.values(collections)) {
            if (!collection || typeof collection !== 'object' || !Array.isArray((collection as any).ponies)) continue
            const ponyIds = [...new Set((collection as any).ponies.flatMap((item: any) => {
                const ids = [item?.item]
                if (item?.alt) ids.push(item.alt)
                return ids.filter(Boolean)
            }))]
            const matched = ponyIds.filter(id => whIds.has(id))
            if (matched.length) {
                matches.push({
                    id: (collection as any).id,
                    name: getName(collection),
                    total: ponyIds.length,
                    matched: matched.length,
                    missing: ponyIds.filter(id => !whIds.has(id)),
                    type: matched.length === ponyIds.length ? 'full' : 'partial',
                    ponyIds,
                })
            }
        }

        const matchedIds = new Set(matches.flatMap(x => x.ponyIds.filter((id: string) => whIds.has(id))))

        result.value = {
            shopItems: whShopItems.map((x: any) => ({ id: x.id, tags: x.tags, inShop: x.in_shop })),
            matches: matches.sort((a, b) => a.id.localeCompare(b.id)),
            unmatched: whShopItems.filter((x: any) => !matchedIds.has(x.id)),
        }
    } catch (e) {
        console.error('What's Hot diagnostic failed:', e)
        error.value = e instanceof Error ? e.message : String(e)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <Config title="What's Hot — диагностика" />

    <main class="debug-page">
        <h1>What's Hot — диагностика</h1>
        <p>Проверка выполняется только после нажатия кнопки. Страница не обращается к данным во время SSR.</p>

        <ClientOnly>
            <button type="button" :disabled="loading" @click="runDiagnostic">
                {{ loading ? 'Проверяем…' : 'Запустить проверку' }}
            </button>

            <p v-if="loading" class="info">Загружаем /shop и collection_data.json…</p>
            <p v-if="error" class="error"><b>Ошибка:</b> {{ error }}</p>

            <template v-if="result">
                <section class="summary">
                    <div><b>{{ result.shopItems.length }}</b><span>whthot товаров</span></div>
                    <div><b>{{ result.matches.filter(x => x.type === 'full').length }}</b><span>полных совпадений</span></div>
                    <div><b>{{ result.matches.filter(x => x.type === 'partial').length }}</b><span>частичных совпадений</span></div>
                    <div><b>{{ result.unmatched.length }}</b><span>без коллекции</span></div>
                </section>

                <section>
                    <h2>Коллекции</h2>
                    <article v-for="match in result.matches" :key="match.id" class="collection">
                        <h3>{{ match.name }} <code>{{ match.id }}</code></h3>
                        <p>{{ match.type === 'full' ? '🟢 Полное' : '🟡 Частичное' }} совпадение: {{ match.matched }} / {{ match.total }}</p>
                        <p v-if="match.missing.length" class="missing">Не найдены среди whthot: {{ match.missing.join(', ') }}</p>
                    </article>
                </section>

                <section>
                    <h2>Товары с whthot</h2>
                    <ul>
                        <li v-for="item in result.shopItems" :key="item.id"><code>{{ item.id }}</code> — {{ item.tags.join(', ') }}</li>
                    </ul>
                </section>
            </template>
        </ClientOnly>
    </main>
</template>

<style scoped>
.debug-page { width: min(100%, 1000px); margin: 0 auto; padding: 1rem; }
button { padding: .7rem 1rem; border-radius: 10px; cursor: pointer; }
button:disabled { cursor: wait; opacity: .6; }
.summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: .75rem; margin: 1.5rem 0; }
.summary div, .collection { padding: 1rem; border: 1px solid #ddd; border-radius: 12px; }
.summary b { display: block; font-size: 1.5rem; }
.summary span { opacity: .7; }
.collection { margin: .75rem 0; }
.error { margin-top: 1rem; padding: 1rem; border-radius: 10px; background: #fee; }
.info { margin-top: 1rem; opacity: .75; }
.missing { opacity: .7; }
code { font-family: monospace; }
</style>
