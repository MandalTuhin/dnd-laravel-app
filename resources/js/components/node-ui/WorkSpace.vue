<script setup lang="ts">
import { SaveIcon, Plus } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useNodeStore } from '@/stores/useNodeStore';
import AddContainerForm from './AddContainerForm.vue';
import DragIndicator from './DragIndicator.vue';
import SubContainer from './SubContainer.vue';

const store = useNodeStore();

// Load workspace from server on component mount
onMounted(async () => {
    await store.loadLatestLayout();
});

// Consolidated drag state
const dragState = ref({
    indicatorIndex: null as number | null,
    indicatorSide: 'top' as 'top' | 'bottom',
});

interface DraggableMoveEvent {
    relatedContext: { index: number | null | undefined };
    related: Element & { getBoundingClientRect: () => DOMRect };
    originalEvent: { clientY: number };
}

// Simplified drag move handler
const handleDragMove = (e: DraggableMoveEvent) => {
    const { relatedContext, related, originalEvent } = e;

    dragState.value.indicatorIndex = relatedContext.index ?? null;

    const rect = related.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    dragState.value.indicatorSide =
        originalEvent.clientY > midY ? 'bottom' : 'top';

    return false;
};

// Clear drag state when drag ends
const clearDragState = () => {
    dragState.value.indicatorIndex = null;
};

const handleSave = async () => {
    try {
        const layout = store.getLayoutJson();
        const layoutName = `layout_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

        const response = await fetch('/api/layouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                layout: layout,
                name: layoutName,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Layout saved to server:', result);

        // Show success message
        alert('Layout saved successfully!');
    } catch (error) {
        console.error('Failed to save layout to server:', error);
        alert('Failed to save layout. Please try again.');
    }
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
            v-if="store.isLoading"
            class="flex h-full flex-col items-center justify-center gap-2"
        >
            <div
                class="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
            ></div>
            <p class="text-center text-sm text-muted-foreground">
                Loading workspace from server...
            </p>
        </div>
        <div
            v-else-if="store.loadError"
            class="flex h-full flex-col items-center justify-center gap-2"
        >
            <div class="size-16 text-red-400">⚠️</div>
            <p class="text-center text-sm text-red-600">
                {{ store.loadError }}
            </p>
            <button
                @click="store.loadLatestLayout()"
                class="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
                Retry
            </button>
        </div>
        <div
            v-else-if="!store.workspaceContainers.length"
            class="flex h-full flex-col items-center justify-center gap-2"
        >
            <Plus class="size-16 text-gray-400" />
            <p class="text-center text-sm text-muted-foreground">
                Your workspace is empty. <br />
                Create a container to start building your layout.
            </p>
        </div>
        <VueDraggable
            v-if="
                !store.isLoading &&
                !store.loadError &&
                store.workspaceContainers.length
            "
            v-model="store.workspaceContainers"
            class="relative flex flex-col gap-4"
            handle=".container-handle"
            :animation="250"
            ghost-class="opacity-30"
            :move="handleDragMove"
            @end="clearDragState"
            @drag-leave="clearDragState"
        >
            <div
                v-for="(container, index) in store.workspaceContainers"
                :key="container.id"
                class="relative"
            >
                <!-- Horizontal Indicator - Only render when needed -->
                <DragIndicator
                    v-if="dragState.indicatorIndex === index"
                    :side="dragState.indicatorSide"
                />
                <SubContainer :container="container" />
            </div>
        </VueDraggable>
    </div>
</template>
