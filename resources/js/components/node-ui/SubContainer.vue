<script setup lang="ts">
import { computed } from 'vue';
import { useNodeStore, type Container } from '@/stores/useNodeStore';
import ContainerHeader from './ContainerHeader.vue';
import DraggableNodeGrid from './DraggableNodeGrid.vue';

const props = defineProps<{ container: Container }>();
const store = useNodeStore();

const nodes = computed({
    get: () => props.container.nodes,
    set: (val) => {
        store.updateContainerNodes(props.container.id, val);
    },
});

const removeContainer = () => {
    store.removeContainer(props.container.id);
};

const updateCols = (value: number) => {
    store.updateContainerNumCol(props.container.id, value);
};
</script>

<template>
    <div
        class="flex min-h-40 flex-col rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all duration-300"
    >
        <ContainerHeader
            :id="container.id"
            :name="container.name"
            :num-col="container.numCol"
            @remove="removeContainer"
            @update-cols="updateCols"
        />

        <DraggableNodeGrid v-model:nodes="nodes" :num-col="container.numCol" />
    </div>
</template>
