<script setup lang="ts">
import { computed } from 'vue'
import { useSaveStore } from '@/stores/saveManager'
import { usePersonalTracker } from '@/stores/personalTracker'
import type { PonyType } from '@/types/gameDataTypes'
import { translateName } from '@/scripts/gameData'
import { getPersonalF2P, getPersonalUseful } from '@/scripts/personalData'

const props = defineProps<{ pony: PonyType }>()
const saveStore = useSaveStore()
const personal = usePersonalTracker()
const name = computed(() => translateName(props.pony).value || '')
const f2p = computed(() => getPersonalF2P(name.value))
const useful = computed(() => getPersonalUseful(name.value))
const received = computed(() => saveStore.hasPony(props.pony.id))
const wanted = computed(() => Boolean(personal.wanted[props.pony.id]))

function toggleReceived() {
    if (received.value) saveStore.removePony(props.pony.id)
    else saveStore.addPony(props.pony.id)
}
function toggleWanted() {
    personal.setWanted(props.pony.id, !wanted.value)
}
</script>

<template>
    <section class="personal-panel">
        <div class="personal-panel__head">
            <div>
                <h2>Мои отметки</h2>
                <p>Личные отметки сохраняются только в этом браузере.</p>
            </div>
            <div class="personal-panel__actions">
                <button type="button" :class="['personal-action', { active: received }]" @click="toggleReceived">
                    {{ received ? 'Получена' : 'Не получена' }}
                </button>
                <button type="button" :class="['personal-action', { active: wanted }]" @click="toggleWanted">
                    {{ wanted ? 'В списке желаемого' : 'Хочу получить' }}
                </button>
            </div>
        </div>

        <div class="personal-tags">
            <span v-if="f2p" class="personal-tag free">F2P</span>
            <span v-if="useful" class="personal-tag useful">Полезная</span>
        </div>

        <div v-if="useful" class="personal-section">
            <h3>Полезность</h3>
            <div class="chips">
                <span v-for="role in useful.roles" :key="role" class="chip">{{ role }}</span>
            </div>
        </div>

        <div v-if="f2p" class="personal-section">
            <h3>Бесплатные способы получения</h3>
            <ul class="methods">
                <li v-for="method in f2p.methods" :key="method">{{ method }}</li>
            </ul>
        </div>
    </section>
</template>

<style scoped>
.personal-panel {
    margin-top: 1.25rem;
    padding: 1.1rem;
    border: 1px solid var(--ui-border);
    border-radius: 1rem;
    background: linear-gradient(135deg, #fff, #faf9fe);
}
.personal-panel__head { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; }
.personal-panel h2 { color:var(--ui-text); font-size:1.05rem; font-weight:700; }
.personal-panel p { margin-top:.3rem; color:var(--ui-muted); font-size:.78rem; }
.personal-panel__actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:.45rem; }
.personal-action { padding:.5rem .75rem; border:1px solid var(--ui-border-strong); border-radius:.7rem; background:#fff; color:var(--ui-text); font:inherit; font-size:.75rem; font-weight:700; cursor:pointer; }
.personal-action.active { background:var(--ui-lilac-soft); border-color:#d2c5e5; color:#735f91; }
.personal-tags,.chips { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.8rem; }
.personal-tag,.chip { padding:.3rem .55rem; border-radius:999px; border:1px solid var(--ui-border); background:#fff; color:var(--ui-muted); font-size:.72rem; font-weight:700; }
.personal-tag.free { background:var(--ui-blue-soft); color:#4f7890; }
.personal-tag.useful { background:var(--ui-lilac-soft); color:#725e92; }
.personal-section { margin-top:1rem; padding-top:1rem; border-top:1px solid var(--ui-border); }
.personal-section h3 { color:var(--ui-text); font-size:.86rem; font-weight:700; }
.methods { margin:.6rem 0 0 1.1rem; color:var(--ui-muted); font-size:.8rem; line-height:1.7; }
@media (max-width: 700px) { .personal-panel__head { flex-direction:column; } .personal-panel__actions { justify-content:flex-start; } }
</style>
