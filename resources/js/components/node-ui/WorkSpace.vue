<script setup lang="ts">
import { SaveIcon, Plus } from 'lucide-vue-next';
import { ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useNodeStore } from '@/stores/useNodeStore';
import AddContainerForm from './AddContainerForm.vue';
import DragIndicator from './DragIndicator.vue';
import SubContainer from './SubContainer.vue';

const store = useNodeStore();

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

// Separated save concerns
const saveToStorage = () => store.saveLayout();

const saveToServer = async () => {
    try {
        const layout = store.getLayoutJson();
        const layoutName = `layout_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

        const response = await fetch('/api/layouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
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
        return result;
    } catch (error) {
        console.error('Failed to save layout to server:', error);
        throw error;
    }
};

const downloadLayout = () => {
    const layout = store.getLayoutJson();
    const jsonString = JSON.stringify(layout, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'layout.json';
    link.click();

    URL.revokeObjectURL(url);
    console.log('Form Layout Export:', layout);
};

const handleSave = async () => {
    try {
        // 1. Persist state to LocalStorage (Restores on reload)
        saveToStorage();

        // 2. Save to server
        await saveToServer();

        // 3. Also download JSON file for backup
        downloadLayout();

        // Optional: Show success message
        alert('Layout saved successfully to server and downloaded!');
    } catch (error) {
        console.error('Save failed:', error);
        alert('Failed to save layout to server. Check console for details.');

        // Still download the file as fallback
        downloadLayout();
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
            v-if="!store.workspaceContainers.length"
            class="flex h-full flex-col items-center justify-center gap-2"
        >
            <Plus class="size-16 text-gray-400" />
            <p class="text-center text-sm text-muted-foreground">
                Your workspace is empty. <br />
                Create a container to start building your layout.
            </p>
        </div>
        <VueDraggable
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
