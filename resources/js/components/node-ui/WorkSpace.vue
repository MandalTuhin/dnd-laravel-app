<script setup lang="ts">
import { ref } from 'vue';
import { useNodeStore } from '@/stores/useNodeStore';
import { VueDraggable } from 'vue-draggable-plus';
import AddContainerForm from './AddContainerForm.vue';
import DragIndicator from './DragIndicator.vue';
import SubContainer from './SubContainer.vue';
import { SaveIcon } from 'lucide-vue-next';


const store = useNodeStore();
const indicatorIndex = ref<number | null>(null);
const indicatorSide = ref<'top' | 'bottom'>('top');

interface DraggableMoveEvent {
  relatedContext: { index: number | null | undefined };
  related: Element & { getBoundingClientRect: () => DOMRect };
  originalEvent: { clientY: number };
}

const onMove = (e: DraggableMoveEvent) => {
  const { relatedContext } = e;
  indicatorIndex.value = relatedContext.index ?? null;

  const rect = e.related.getBoundingClientRect();
  const mouseY = e.originalEvent.clientY;
  const midY = rect.top + rect.height / 2;

  indicatorSide.value = mouseY > midY ? 'bottom' : 'top';
  return false;
};

const onEnd = () => {
  indicatorIndex.value = null;
};

const handleSave = () => {
  // 1. Persist state to LocalStorage (Restores on reload)
  store.saveLayout();

  // 2. Export and Download JSON (Business Logic)
  const layout = store.getLayoutJson();
  const jsonString = JSON.stringify(layout, null, 2);
  
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'layout.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('Form Layout Export:', layout);
};
</script>

<template>
  <div class="flex-1 p-6 bg-gray-50 h-full overflow-y-auto">
    <div class="flex justify-between items-start">
      <AddContainerForm />
      <button
        @click="handleSave"
        class="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition-colors flex items-center gap-2 mt-4"
      >
      <SaveIcon />
        Save Layout
      </button>
    </div>

    <VueDraggable
      v-model="store.workspaceContainers"
      class="flex flex-col gap-4 relative"
      handle=".container-handle"
      :animation="250"
      ghost-class="opacity-30"
      :move="onMove"
      @end="onEnd"
      @drag-leave="onEnd"
    >
      <div v-for="(container, index) in store.workspaceContainers" :key="container.id" class="relative">
        <!-- Horizontal Indicator -->
        <DragIndicator :index="indicatorIndex === index ? index : null" :side="indicatorSide" />
        <SubContainer :container="container" />
      </div>
    </VueDraggable>
  </div>
</template>

