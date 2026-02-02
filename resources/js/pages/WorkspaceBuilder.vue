<script setup lang="ts">
import NodeSidebar from '../components/node-ui/NodeSidebarSource.vue';
import WorkSpace from '../components/node-ui/WorkSpace.vue';
</script>

<template>
    <main
        class="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased"
    >
        <NodeSidebar />
        <WorkSpace />
    </main>
</template>
