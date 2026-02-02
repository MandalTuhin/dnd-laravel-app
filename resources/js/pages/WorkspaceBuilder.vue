<script setup lang="ts">
import NodeSidebar from "../components/node-ui/NodeSidebarSource.vue";
import WorkSpace from "../components/node-ui/WorkSpace.vue";
import TrashZone from "../components/node-ui/TrashZone.vue";
</script>

<template>
  <main class="flex h-screen w-full overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
    <NodeSidebar />
    <WorkSpace />
    <TrashZone />
  </main>
</template>
