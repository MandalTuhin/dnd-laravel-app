<template>
  <div class="p-2 flex-1 relative">
    <DragIndicators
      :is-dragging-over-empty="isDraggingOverEmpty"
      :indicator-index="indicatorIndex"
      :indicator-side="indicatorSide"
      :item-count="nodes.length"
    />

    <VueDraggable
      v-model="nodes"
      group="nodeGroup"
      :animation="300"
      :move="onMove"
      @end="onEnd"
      @drag-leave="onDragLeave"
      :force-fallback="true"
      fallback-class="dragging-card"
      ghost-class="ghost-item"
      class="flex flex-wrap min-h-30 content-start sortable-container transition-all duration-300 ease-in-out"
    >
      <div
        v-for="(node, index) in nodes"
        :key="node.id"
        class="item-wrapper p-2 relative"
        :style="{ width: itemWidth }"
        :data-label="node.label"
      >
        <!-- Individual item insertion indicator -->
        <div
          v-if="indicatorIndex === index"
          class="absolute top-2 bottom-2 w-1 bg-green-500 z-50 rounded-full transition-all"
          :class="[indicatorSide === 'left' ? 'left-0' : 'right-0']"
        />

        <NodeItem :name="node.label" />
      </div>
    </VueDraggable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import NodeItem from './NodeItem.vue'
import DragIndicators from './DragIndicators.vue'
import { useDragIndicators } from './composables/useDragIndicators'

interface Node {
  id: string | number
  label: string
}

const props = defineProps<{
  nodes: Node[]
  numCol: number
}>()

const emit = defineEmits<{
  'update:nodes': [nodes: Node[]]
}>()

const nodes = computed({
  get: () => props.nodes,
  set: (val) => emit('update:nodes', val)
})

const itemWidth = computed(() => {
  return `${100 / props.numCol}%`
})

const {
  indicatorIndex,
  indicatorSide,
  isDraggingOverEmpty,
  onMove,
  onEnd,
  onDragLeave
} = useDragIndicators()
</script>

<style scoped>
.sortable-container {
  transition: all 0.3s ease;
}

:deep(.dragging-card) {
  opacity: 1 !important;
  cursor: grabbing !important;
  z-index: 9999;
  pointer-events: none;
  /* Fix size during drag: matches the internal NodeItem sizing */
  width: 250px !important;
}

/* Apply effects to the inner element to avoid conflicting with SortableJS transforms */
:deep(.dragging-card > *) {
  transform: rotate(3deg) !important;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.2) !important;
}

:deep(.ghost-item) {
  opacity: 0.3 !important;
  background: #eff6ff !important;
  border: 2px dashed #3b82f6 !important;
  border-radius: 0.5rem;
}

:deep(.sortable-fallback) {
  opacity: 1 !important;
}
</style>
