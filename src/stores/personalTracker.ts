import { defineStore } from 'pinia'
import type { GameObjectId } from '@/types/gameDataTypes'

export const usePersonalTracker = defineStore('personalTracker', {
    state: () => ({
        wanted: {} as Record<GameObjectId, boolean>,
    }),
    actions: {
        setWanted(id: GameObjectId, value: boolean) {
            if (value) this.wanted[id] = true
            else delete this.wanted[id]
        },
    },
    // Explicit key keeps the personal wishlist independent from game-data updates.
    persist: { key: 'personalTracker' },
})
