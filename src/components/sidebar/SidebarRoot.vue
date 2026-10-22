<template>
    <nav class="sidebar-nav">
        <ul class="sidebar-menu"><slot></slot></ul>
        <div class="sidebar-footer"><slot name="footer"></slot></div>
    </nav>
</template>

<style scoped>
.sidebar-nav { display:flex; flex-direction:column; justify-content:space-between; min-height:100%; gap:.4rem; background:#fff; border-right:1px solid var(--ui-border); }
.sidebar-menu { display:flex; flex-direction:column; padding:.6rem; }
.sidebar-footer { margin-top:1rem; padding:.75rem 1rem; border-top:1px solid var(--ui-border); }
</style>
