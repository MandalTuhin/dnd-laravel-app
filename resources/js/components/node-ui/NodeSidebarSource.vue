<script setup lang="ts">
import { Search, X } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { NodeService } from '@/services/nodeService';
import { useNodeStore, type Node } from '@/stores/useNodeStore';
import NodeItem from './NodeItem.vue';

const store = useNodeStore();
const searchQuery = ref('');

// When an item is dropped into the sidebar
const onAdd = (e: any) => {
    const item = e.data; // The node object
    if (item && NodeService.isSpacer(item)) {
        // It's a spacer! Remove it from the sidebar so it doesn't pollute the list.
        store.availableNodes = store.availableNodes.filter(
            (n) => n.id !== item.id,
        );
    }
};

// Generates a new ID for cloned items
const handleClone = (node: Node) => {
    return {
        ...node,
        id: crypto.randomUUID(),
    };
};

const filteredMainNodes = computed({
    get: () => {
        const query = searchQuery.value.toLowerCase();
        return store.availableNodes.filter(
            (node) =>
                !NodeService.isSpacer(node) &&
                node.label.toLowerCase().includes(query),
        );
    },
    set: (val) => {
        const query = searchQuery.value.toLowerCase();
        const spacers = store.availableNodes.filter((node) =>
            NodeService.isSpacer(node),
        );
        const nonMatchingMains = store.availableNodes.filter(
            (node) =>
                !NodeService.isSpacer(node) &&
                !node.label.toLowerCase().includes(query),
        );
        store.availableNodes = [...spacers, ...nonMatchingMains, ...val];
    },
});

const filteredSpacerNodes = computed({
    get: () => {
        const query = searchQuery.value.toLowerCase();
        return store.availableNodes.filter(
            (node) =>
                NodeService.isSpacer(node) &&
                node.label.toLowerCase().includes(query),
        );
    },
    set: (val) => {
        const query = searchQuery.value.toLowerCase();
        const mains = store.availableNodes.filter(
            (node) => !NodeService.isSpacer(node),
        );
        const nonMatchingSpacers = store.availableNodes.filter(
            (node) =>
                NodeService.isSpacer(node) &&
                !node.label.toLowerCase().includes(query),
        );
        store.availableNodes = [...val, ...nonMatchingSpacers, ...mains];
    },
});
</script>

<template>
    <aside
        class="flex h-full w-72 flex-col border-r border-gray-200 bg-white shadow-sm"
    >
        <div class="border-b border-gray-100 p-4">
            <h2 class="text-lg font-bold text-gray-800">Available Elements</h2>
            <p class="mt-1 text-xs text-gray-500">
                Drag elements to the workspace
            </p>

            <!-- Search Input -->
            <div class="relative mt-4">
                <Search
                    class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
                />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search fields..."
                    class="w-full rounded-md border border-gray-200 py-2 pr-9 pl-9 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <button
                    v-if="searchQuery"
                    @click="searchQuery = ''"
                    class="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                    <X class="size-3" />
                </button>
            </div>
        </div>

        <div class="flex-1 space-y-6 overflow-y-auto p-4">
            <!-- Empty State -->
            <div
                v-if="!filteredMainNodes.length && !filteredSpacerNodes.length"
                class="flex flex-col items-center justify-center py-8 text-center"
            >
                <div class="text-sm text-gray-500">
                    No matching elements found for
                    <div>
                        <span
                            class="mt-3 inline-block bg-gray-200 px-4 py-1 font-semibold text-gray-800"
                        >
                            {{ searchQuery }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Spacer Nodes Section -->
            <div v-if="filteredSpacerNodes.length">
                <h3 class="mb-2 text-xs font-semibold text-gray-500 uppercase">
                    Spacer Nodes
                </h3>
                <VueDraggable
                    v-model="filteredSpacerNodes"
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
                        v-for="node in filteredSpacerNodes"
                        :key="node.id"
                        :data-id="node.id"
                        class="item block cursor-grab active:cursor-grabbing"
                    >
                        <NodeItem
                            :name="node.label"
                            class="flex h-10 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 font-mono text-sm text-gray-500"
                        />
                    </div>
                </VueDraggable>
            </div>

            <!-- Main Nodes Section -->
            <div>
                <h3
                    v-if="filteredMainNodes.length"
                    class="mb-2 text-xs font-semibold text-gray-500 uppercase"
                >
                    Main Nodes
                </h3>
                <VueDraggable
                    v-model="filteredMainNodes"
                    class="flex min-h-[150px] flex-col gap-2 pb-4"
                    :group="{ name: 'nodeGroup', pull: true, put: true }"
                    :clone="handleClone"
                    :animation="300"
                    :force-fallback="true"
                    fallback-class="dragging-card"
                    ghost-class="ghost-item"
                    @add="onAdd"
                >
                    <div
                        v-for="node in filteredMainNodes"
                        :key="node.id"
                        :data-id="node.id"
                        class="item block cursor-grab active:cursor-grabbing"
                    >
                        <NodeItem
                            :name="node.label"
                            class="transition-colors hover:border-blue-400"
                        />
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
