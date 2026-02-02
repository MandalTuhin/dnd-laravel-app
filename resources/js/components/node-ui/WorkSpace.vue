<script setup lang="ts">
import { SaveIcon } from 'lucide-vue-next';
import { SquarePlus } from 'lucide-vue-next';
import { ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useNodeStore } from '@/stores/useNodeStore';
import AddContainerForm from './AddContainerForm.vue';
import DragIndicator from './DragIndicator.vue';
import SubContainer from './SubContainer.vue';

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
    <div class="h-full flex-1 overflow-y-auto bg-gray-50 p-6">
        <div class="flex items-start justify-between">
            <AddContainerForm />
            <button
                @click="handleSave"
                class="mt-4 flex cursor-pointer items-center gap-2 rounded bg-green-800 px-6 py-2 text-white shadow transition-colors hover:bg-green-900"
            >
                <SaveIcon />
                Save Layout
            </button>
        </div>

        <div
            v-if="!store.workspaceContainers.length"
            class="flex h-full flex-col items-center justify-center gap-2"
        >
            <SquarePlus class="size-16 text-gray-600" />
            <p class="text-center text-sm text-muted-foreground">
                Drag and drop containers to get started
            </p>
        </div>
        <VueDraggable
            v-model="store.workspaceContainers"
            class="relative flex flex-col gap-4"
            handle=".container-handle"
            :animation="250"
            ghost-class="opacity-30"
            :move="onMove"
            @end="onEnd"
            @drag-leave="onEnd"
        >
            <div
                v-for="(container, index) in store.workspaceContainers"
                :key="container.id"
                class="relative"
            >
                <!-- Horizontal Indicator -->
                <DragIndicator
                    :index="indicatorIndex === index ? index : null"
                    :side="indicatorSide"
                />
                <SubContainer :container="container" />
            </div>
        </VueDraggable>
    </div>
</template>
