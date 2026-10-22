<script setup lang="ts">
import type { AnchorHTMLAttributes } from 'vue'
import Link from '../Link.vue'
import SidebarItem from './SidebarItem.vue'
const props = defineProps<{ href: AnchorHTMLAttributes['href'] }>()
</script>
<template>
    <SidebarItem>
        <Link :href="props.href" class="sidebar-link"><slot></slot></Link>
    </SidebarItem>
</template>
<style scoped>
.sidebar-link { display:block; width:100%; padding:.55rem .7rem; border-radius:.65rem; color:var(--ui-muted); text-decoration:none; font-size:.8rem; font-weight:600; }
.sidebar-link:hover, .sidebar-link:focus-visible, .sidebar-link.a-active { color:var(--ui-text); background:var(--ui-lilac-soft); text-decoration:none; }
</style>
