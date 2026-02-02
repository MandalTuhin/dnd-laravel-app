<script setup lang="ts">
import { useNodeStore, type Node } from "@/stores/useNodeStore";
import { VueDraggable } from "vue-draggable-plus";
import NodeItem from "./NodeItem.vue";
import { NodeService } from "@/services/nodeService";
import { computed } from "vue";

const store = useNodeStore();

// When an item is dropped into the sidebar
const onAdd = (e: any) => {
  const item = e.data; // The node object
  if (item && NodeService.isSpacer(item)) {
    // It's a spacer! Remove it from the sidebar so it doesn't pollute the list.
    // Since it was 'moved' from the sub-container, it's already gone from there.
    store.availableNodes = store.availableNodes.filter((n) => n.id !== item.id);
  }
};

// Generates a new ID for cloned items
const handleClone = (node: Node) => {
  return {
    ...node,
    id: crypto.randomUUID(),
  };
};

const mainNodes = computed({
  get: () => store.availableNodes.filter((node) => !NodeService.isSpacer(node)),
  set: (val) => {
    const spacers = store.availableNodes.filter((node) => NodeService.isSpacer(node));
    store.availableNodes = [...spacers, ...val];
  },
});

const spacerNodes = computed({
  get: () => store.availableNodes.filter((node) => NodeService.isSpacer(node)),
  set: (val) => {
    const mains = store.availableNodes.filter((node) => !NodeService.isSpacer(node));
    store.availableNodes = [...val, ...mains];
  },
});
</script>

<template>
  <aside class="w-72 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
    <div class="p-4 border-b border-gray-100">
      <h2 class="text-lg font-bold text-gray-800">Available Elements</h2>
      <p class="text-xs text-gray-500 mt-1">Drag elements to the workspace</p>
    </div>

    <div class="p-4 flex-1 overflow-y-auto space-y-6">
      <!-- Spacer Nodes Section -->
      <div v-if="spacerNodes.length">
        <h3 class="text-xs font-semibold text-gray-500 uppercase mb-2">Spacer Nodes</h3>
        <VueDraggable
          v-model="spacerNodes"
          class="flex flex-col gap-2"
          :group="{ name: 'nodeGroup', pull: 'clone', put: true }"
          :clone="handleClone"
          :animation="300"
          :force-fallback="true"
          fallback-class="dragging-card"
          ghost-class="ghost-item"
          @add="onAdd"
        >
          <div
            v-for="node in spacerNodes"
            :key="node.id"
            :data-id="node.id"
            class="block item cursor-grab active:cursor-grabbing"
          >
            <NodeItem
              :name="node.label"
              class="h-10 flex items-center justify-center border border-dashed border-gray-300 text-gray-500 font-mono text-sm rounded-md bg-gray-50"
            />
          </div>
        </VueDraggable>
      </div>

      <!-- Main Nodes Section -->
      <div v-if="mainNodes.length">
        <h3 class="text-xs font-semibold text-gray-500 uppercase mb-2">Main Nodes</h3>
        <VueDraggable
          v-model="mainNodes"
          class="flex flex-col gap-2"
          :group="{ name: 'nodeGroup', pull: true, put: true }"
          :clone="handleClone"
          :animation="300"
          :force-fallback="true"
          fallback-class="dragging-card"
          ghost-class="ghost-item"
          @add="onAdd"
        >
          <div
            v-for="node in mainNodes"
            :key="node.id"
            :data-id="node.id"
            class="block item cursor-grab active:cursor-grabbing"
          >
            <NodeItem :name="node.label" class="hover:border-blue-400 transition-colors" />
          </div>
        </VueDraggable>
      </div>
    </div>
  </aside>
</template>

<style scoped>
:deep(.dragging-card) {
  opacity: 1 !important;
  cursor: grabbing !important;
  pointer-events: none;
  z-index: 9999;
}

/* Apply the visual effects to the CONTENT, not the wrapper moving around */
:deep(.dragging-card > *) {
  transform: rotate(3deg) !important;
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.2),
    0 8px 10px -6px rgb(0 0 0 / 0.2) !important;
}

:deep(.ghost-item) {
  opacity: 1 !important;
  background: #f3f4f6 !important;
  border: 2px dashed #3b82f6 !important;
  border-radius: 0.5rem;
}
</style>
