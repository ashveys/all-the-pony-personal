<script setup lang="ts">
import CustomScrollbar from '@/components/CustomScrollbar.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import Link from '@/components/Link.vue'
import SidebarLabel from '@/components/sidebar/SidebarLabel.vue'
import SidebarLink from '@/components/sidebar/SidebarLink.vue'
import SidebarRoot from '@/components/sidebar/SidebarRoot.vue'
import SidebarSeparator from '@/components/sidebar/SidebarSeparator.vue'
import SidebarSubmenu from '@/components/sidebar/SidebarSubmenu.vue'
import UpdateGameDataButton from '@/components/personal/UpdateGameDataButton.vue'
import { useGameVersions } from '@/scripts/gameData'
import { ref } from 'vue'

const sidebarShown = ref<boolean>(false)
const gameVersions = useGameVersions()

const emit = defineEmits<{
    change: [state: boolean],
}>()

function toggleSidebar(e: Event) {
    // emit('change', e.target.checked)

    if ((e.target as HTMLInputElement).checked) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''

    }
}


</script>

<template>
    <header class="site-header">
        <aside class="header">
            <div class="title-bar">
                <div class="brand-mark" aria-hidden="true">☑️</div>
                <label for="sidebar-toggle" class="sidebar-toggle">
                    <input @change="toggleSidebar" type="checkbox" name="sidebar-toggle" id="sidebar-toggle">
                    <label for="sidebar-toggle" aria-label="Toggle sidebar" title="Toggle sidebar"></label>
                </label>
                <div class="brand-content">
                    <Link class="title" href="/">{{ $t('site.title') }}</Link>
                    <span class="subtitle">Личный каталог и справочник</span>
                </div>
                <LanguageSelector />
            </div>
            <div class="sidebar-container">
                <label for="sidebar-toggle" class="sidebar-background"></label>
                <CustomScrollbar class="sidebar-scroller">
                    <SidebarRoot>
                        <SidebarLabel>Каталог</SidebarLabel>
                        <SidebarSubmenu>
                            <template #title>{{ $t('sidebar.browse') }}</template>
                            <SidebarLink href="/search/ponies/">{{ $t('game_object.pony.pony', 2) }}</SidebarLink>
                            <SidebarLink href="/search/houses/">{{ $t('game_object.house.house', 2) }}</SidebarLink>
                            <SidebarLink href="/search/shops/">{{ $t('game_object.shop.shop', 2) }}</SidebarLink>
                            <SidebarLink href="/search/decor/">{{ $t('game_object.decor.decor', 2) }}</SidebarLink>
                            <SidebarLink href="/search/pets/">{{ $t('game_object.pet.pet', 2) }}</SidebarLink>
                            <SidebarLink href="/search/costumes/">{{ $t('game_object.costume.costume', 2) }}</SidebarLink>
                            <SidebarSubmenu>
                                <template #title>{{ $t('sidebar.profile_decorations') }}</template>
                                <SidebarLink href="/search/avatars/">{{ $t('game_object.profile_decorations.avatar.avatar', 2) }}</SidebarLink>
                                <SidebarLink href="/search/avatar_frames/">{{ $t('game_object.profile_decorations.avatar_frame.avatar_frame', 2) }}</SidebarLink>
                                <SidebarLink href="/search/backgrounds/">{{ $t('game_object.profile_decorations.background.background', 2) }}</SidebarLink>
                                <SidebarLink href="/search/background_frames/">{{ $t('game_object.profile_decorations.background_frame.background_frame', 2) }}</SidebarLink>
                                <SidebarLink href="/search/cutie_marks/">{{ $t('game_object.profile_decorations.cutie_mark.cutie_mark', 2) }}</SidebarLink>
                            </SidebarSubmenu>
                            <SidebarLink href="/search/tokens/">{{ $t('game_object.token.token', 2) }}</SidebarLink>
                            <SidebarLink href="/search/collections/">{{ $t('collection.collection', 2) }}</SidebarLink>
                            <SidebarSeparator />
                            <div class="sidebar-section-title">Мой каталог</div>
                            <SidebarLink href="/personal/useful/">Полезные пони</SidebarLink>
                            <SidebarLink href="/personal/f2p/">Бесплатные пони</SidebarLink>
                            <SidebarLink href="/personal/">Мой прогресс</SidebarLink>
                        </SidebarSubmenu>
                        <SidebarSeparator />
                        <div class="sidebar-section-title">Инструменты</div>
                        <UpdateGameDataButton />
                        <SidebarLink href="/events/maze/">{{ $t('maze.title.short') }}</SidebarLink>
                        <SidebarLink href="/store/">{{ $t('store.title') }}</SidebarLink>
                        <SidebarSeparator />
                        <div class="sidebar-section-title">Игрок</div>
                        <SidebarLink href="/stats/">{{ $t('stats.title') }}</SidebarLink>
                        <SidebarLink href="/inventory/">{{ $t('inventory.title') }}</SidebarLink>

        
                        <template #footer>
                            <div class="version-numbers">
                                <span id="app-version">{{ $t('game.game_version', {version: gameVersions?.game_version}) }}</span>
                                <br>
                                <span id="content-version">{{ $t('game.content_version', {version: gameVersions?.content_version}) }}</span>
                            </div>
                        </template>
                    </SidebarRoot>
                </CustomScrollbar>
            </div>
        </aside>
    </header>
</template>

<style scoped>
.site-header {
    --padding-inline: .75rem;
    background: rgba(255,255,255,.96);
    color: var(--ui-text);
    border-right: 1px solid var(--ui-border);
    box-shadow: .2rem 0 1.5rem rgba(83, 76, 120, .035);
}
header a { color: var(--ui-text); text-decoration: none; }
.header {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    width: 18.5rem;
    height: 100dvh;
    max-height: 100dvh;
}
.title-bar {
    padding: .8rem .75rem;
    display: flex;
    align-items: center;
    gap: .65rem;
    border-bottom: 1px solid var(--ui-border);
    background: linear-gradient(135deg, #f1f8fc, #f7f2fb 58%, #fff4f8);
}
.brand-mark {
    width: 2.45rem;
    height: 2.45rem;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: .8rem;
    background: #fff;
    border: 1px solid var(--ui-border-strong);
    color: #8f82b8;
    font-size: .72rem;
    font-weight: 800;
    letter-spacing: .04em;
}
.brand-content { min-width: 0; flex: 1; }
.title { font-size: 1.02rem; display: block; font-weight: 800; }
.subtitle { display: block; margin-top: .12rem; color: var(--ui-muted); font-size: .68rem; }
.sidebar-toggle { display: none; }
.sidebar-container { display: block; height: 100%; overflow: hidden; }
.sidebar-scroller { background: #fff; }
.sidebar-container .version-numbers { font-size: .72rem; padding-inline: var(--padding-inline); color: var(--ui-muted); }
.sidebar-section-title { padding: .8rem .75rem .3rem; color: #8a86a2; font-size: .66rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }

@media screen and (max-width: 50rem) {
    .title-bar {
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .sidebar-toggle {
        display: inline;
    }

    .sidebar-toggle input {
        display: none;
    }

    .sidebar-toggle > label {
        display: block;

        background-image: url('@/assets/images/ui/hamburger-menu.png');
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;

        width: 3rem;
        height: 3rem;

        cursor: pointer;
    }

    .sidebar-toggle > label:hover {
        filter: brightness(75%);
    }

    .title-bar {
        margin-inline: auto;
        max-width: var(--page-width);
        width: 100%;
    }

    header:has(.sidebar-toggle > input:checked) {
        /* height: 100dvh; */
        overscroll-behavior: contain;
        position: sticky;
        top: 0;
        /* width: 100%; */
        z-index: 99999;
    }

    .header:has(.sidebar-toggle > input:checked) {
        /* height: 100dvh; */
        overscroll-behavior: contain;
    }

    .header {
        position: relative;
        width: 100%;
        height: auto;
    }

    .sidebar-container {
        /* display: contents; */
        /* opacity: 0; */
        visibility: hidden;

        position: absolute;
        top: 100%;

        width: 100%;

        z-index: 999999;

        height: calc(100dvh - 100%);

        transition: visibility 0.3s;
    }

    .header:has(.sidebar-toggle > input:checked) .sidebar-container {
        visibility: visible;
        /* display: grid; */
        opacity: 1;
    }

    .sidebar-container .sidebar-background {
        display: block;
        visibility: hidden;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        background-color: black;
        opacity: 0;

        transition: 0.3s opacity, 0.3s visibility ;
    }

    .header:has(.sidebar-toggle > input:checked) .sidebar-background {
        /* display: block; */
        visibility: visible;
        opacity: 0.5;
        @starting-style {
            opacity: 0;
        }
    }

    .sidebar-scroller {
        width: clamp(15rem, 65vw, 25rem);
        transform: translate(-100%, 0);
        transition: transform 0.3s ease;
    }

    .header:has(.sidebar-toggle > input:checked) .sidebar-scroller {
        transform: translate(0, 0);
    }

    /* @starting-style {
        .sidebar-container .sidebar-background {
            opacity: 0;
        }
    } */
}
</style>
