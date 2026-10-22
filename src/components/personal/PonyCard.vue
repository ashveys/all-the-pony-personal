<script setup lang="ts">
import { computed } from 'vue'
import { useSaveStore } from '@/stores/saveManager'
import type { PonyType } from '@/types/gameDataTypes'
import { translateName, getCollection } from '@/scripts/gameData'
import { getPersonalF2P, getPersonalUseful } from '@/scripts/personalData'
import { createAssetUrl } from '@/scripts/assets'
import Link from '@/components/Link.vue'
import { modifyUrl } from 'vike/modifyUrl'

const props = defineProps<{ pony: PonyType }>()

const saveStore = useSaveStore()

const name = computed(() => translateName(props.pony).value || '')
const f2p = computed(() => getPersonalF2P(props.pony))
const useful = computed(() => getPersonalUseful(props.pony))
const received = computed(() => saveStore.hasPony(props.pony.id))

const collectionLink = computed(() => {
    const ids = Array.isArray(props.pony.collections)
        ? props.pony.collections.filter((id) => {
            const collection = getCollection(id)
            return !collection?.tags?.includes('unused') && !collection?.tags?.includes('vip')
        })
        : []

    if (!ids.length) return null
    if (ids.length === 1) return `/collection/${ids[0]}/`
    return modifyUrl('/search/collections/', { search: { q: name.value } })
})

function toggleReceived() {
    if (received.value) saveStore.removePony(props.pony.id)
    else saveStore.addPony(props.pony.id)
}

</script>

<template>
    <article class="pony-card" :class="{ 'is-owned': received }">
        <Link class="pony-card__link" :href="`/pony/${pony.id}/`">
            <div class="pony-card__image-wrap">
                <img
                    class="pony-card__image"
                    :src="createAssetUrl(pony.image.main.path)"
                    :alt="name"
                    loading="lazy"
                >
            </div>
            <h3 class="pony-card__name">{{ name }}</h3>
        </Link>

        <div class="pony-card__badges" aria-label="Дополнительные признаки">
            <span v-if="f2p" class="pony-badge pony-badge--free">F2P</span>
            <span v-if="useful" class="pony-badge pony-badge--useful">Полезная</span>
            <span v-if="collectionLink" class="pony-badge pony-badge--collection">Коллекция</span>
        </div>

        <div class="pony-card__actions">
            <button
                type="button"
                class="pony-action"
                :class="{ active: received }"
                :aria-pressed="received"
                @click="toggleReceived"
            >
                {{ received ? 'Получена' : 'Не получена' }}
            </button>
        </div>
    </article>
</template>

<style scoped>
.pony-card {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--ui-border);
    border-radius: 1.15rem;
    background: var(--ui-card);
    box-shadow: 0 0.35rem 1.15rem rgba(85, 75, 130, 0.07);
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.pony-card:hover {
    transform: translateY(-2px);
    border-color: var(--ui-border-strong);
    box-shadow: 0 0.7rem 1.6rem rgba(85, 75, 130, 0.12);
}

.pony-card__link {
    display: block;
    color: var(--ui-text);
    text-decoration: none;
}

.pony-card__image-wrap {
    aspect-ratio: 1 / 0.96;
    padding: 0.65rem;
    background: linear-gradient(145deg, #f4f9fc, #f7f3fb 58%, #fff4f8);
}

.pony-card__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.pony-card__name {
    min-height: 2.6rem;
    padding: 0.75rem 0.8rem 0.25rem;
    color: var(--ui-text);
    font-size: 0.92rem;
    font-weight: 700;
    line-height: 1.3;
}

.pony-card__badges {
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    min-height: 2.05rem;
    padding: 0.35rem 0.8rem 0.65rem;
}

.pony-badge {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    min-height: 1.35rem;
    padding: 0.18rem 0.48rem;
    border: 1px solid var(--ui-border);
    border-radius: 999px;
    color: var(--ui-muted);
    background: #fff;
    font-size: 0.62rem;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
}

.pony-badge--free { color: #4f7890; background: var(--ui-blue-soft); border-color: #d5eaf2; }
.pony-badge--useful { color: #725e92; background: var(--ui-lilac-soft); border-color: #e0d6ee; }
.pony-badge--collection { color: #9a657d; background: var(--ui-pink-soft); border-color: #efd8e1; }

.pony-card__actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.4rem;
    padding: 0 0.8rem 0.8rem;
}

.pony-action {
    min-width: 0;
    min-height: 2.2rem;
    padding: 0.38rem 0.45rem;
    border: 1px solid var(--ui-border-strong);
    border-radius: 0.72rem;
    background: #fff;
    color: var(--ui-muted);
    font: inherit;
    font-size: 0.62rem;
    font-weight: 700;
    line-height: 1.15;
    cursor: pointer;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease, transform 120ms ease;
}

.pony-action:hover {
    transform: translateY(-1px);
    border-color: var(--ui-purple);
    color: var(--ui-text);
}

.pony-action:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--ui-purple) 45%, transparent);
    outline-offset: 2px;
}

.pony-action.active:first-child {
    color: #557a68;
    border-color: #b9d8c7;
    background: #edf8f1;
}


@media (max-width: 520px) {
    .pony-card__actions {
        grid-template-columns: 1fr;
    }

    .pony-action {
        min-height: 2.05rem;
    }
}
</style>
