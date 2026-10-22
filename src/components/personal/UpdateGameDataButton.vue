<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getGameVersions } from '@/scripts/gameData'
import { createAssetUrl } from '@/scripts/assets'

const { t } = useI18n()
const busy = ref(false)
const status = ref('')

async function clearGameDataCaches() {
    if (!('caches' in window)) return

    // Game data and game assets have their own PWA caches. Personal progress
    // is stored by Pinia in localStorage and is intentionally not touched.
    await Promise.all([
        caches.delete('game-data-cache'),
        caches.delete('game-assets-cache'),
    ])
}

function preservePersonalProgress() {
    // Keep a tiny recovery copy in case a future PWA update changes storage
    // behaviour. This is never used for game data and contains no server data.
    try {
        const personal = localStorage.getItem('personalTracker')
        if (personal !== null) {
            sessionStorage.setItem('personalTracker:recovery', personal)
        }
    } catch {
        // Storage can be unavailable in private/restricted browser contexts.
    }
}

function restorePersonalProgress() {
    try {
        const recovery = sessionStorage.getItem('personalTracker:recovery')
        if (recovery !== null) {
            localStorage.setItem('personalTracker', recovery)
            sessionStorage.removeItem('personalTracker:recovery')
        }
    } catch {
        // Ignore restricted storage contexts.
    }
}

async function update() {
    if (busy.value) return
    busy.value = true
    status.value = ''
    try {
        const current = getGameVersions()
        const url = createAssetUrl(`game_version.json?check=${Date.now()}`, { direct: true })
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const latest = await response.json() as typeof current

        if (current && latest.game_version === current.game_version && latest.content_version === current.content_version) {
            status.value = t('personal.update.current')
            return
        }

        preservePersonalProgress()
        await clearGameDataCaches()
        restorePersonalProgress()
        status.value = t('personal.update.updated')
        window.setTimeout(() => window.location.reload(), 250)
    } catch (error) {
        console.error(error)
        status.value = t('personal.update.error')
    } finally {
        busy.value = false
    }
}
</script>

<template>
    <div class="update-box">
        <button class="button button-blue update-button" :disabled="busy" @click="update">
            {{ busy ? t('personal.update.checking') : t('personal.update.check') }}
        </button>
        <span v-if="status" class="update-status">{{ status }}</span>
    </div>
</template>

<style scoped>
.update-box { display: flex; flex-direction: column; gap: .35rem; margin: .6rem .5rem; }
.update-button { width: 100%; }
.update-status { font-size: .78rem; line-height: 1.25; opacity: .9; }
</style>
