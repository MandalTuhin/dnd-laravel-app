<script setup lang="ts">
import { ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import type { Node } from '@/stores/useNodeStore';

const trash = ref<Node[]>([]);

const onAdd = () => {
  // Clear the trash immediately to "remove" the item
  trash.value = [];
};
</script>

<template>
  <div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
    <VueDraggable
      v-model="trash"
      group="nodeGroup"
      @add="onAdd"
      filter=".static-content"
      ghost-class="trash-ghost"
      class="trash-zone bg-red-50 border-2 border-dashed border-red-300 rounded-full px-8 py-4 flex items-center gap-3 transition-all hover:bg-red-100 hover:border-red-500 group drop-shadow-lg"
    >
      <div class="static-content flex items-center gap-3 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-400 group-hover:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span class="text-red-500 font-bold text-sm">Drop here to delete</span>
      </div>
      <div v-for="item in trash" :key="item.id" class="hidden"></div>
    </VueDraggable>
  </div>
</template>

<style scoped>
.trash-zone {
  min-width: 240px;
  justify-content: center;
}

.trash-ghost {
  opacity: 0;
}

/* Add a subtle pulse when dragging over the trash */
.trash-zone:hover {
  transform: scale(1.05);
  background-color: #fee2e2;
}
</style>
