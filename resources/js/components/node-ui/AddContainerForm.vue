<script setup lang="ts">
import { ref, watch } from 'vue';
import { useNodeStore } from '@/stores/useNodeStore';

const store = useNodeStore();
const newContainerName = ref('');
const errorMessage = ref('');

const handleAddContainer = () => {
  const name = newContainerName.value.trim();
  if (!name) {
    errorMessage.value = 'Container name is required';
    return;
  }

  if (!store.isContainerNameUnique(name)) {
    errorMessage.value = 'A container with this name already exists';
    return;
  }

  store.addContainer(name);
  newContainerName.value = '';
  errorMessage.value = '';
};
// Clear error when user starts typing
watch(newContainerName, () => {
  if (errorMessage.value) errorMessage.value = '';
});
</script>

<template>
  <div class="mb-6 flex gap-4 items-start bg-white p-4 rounded shadow-sm">
    <div class="flex-1">
      <label class="block text-sm font-medium text-gray-700">Container Name</label>
      <input
        v-model="newContainerName"
        type="text"
        :class="[
          'mt-1 block w-full rounded-md shadow-sm sm:text-sm border p-2 transition-colors',
          errorMessage
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        ]"
        placeholder="e.g. Panel A"
        @keydown.enter="handleAddContainer"
      />
      <p v-if="errorMessage" class="text-xs text-red-500 mt-1">{{ errorMessage }}</p>
    </div>
    <button
      @click="handleAddContainer"
      class="mt-6 bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors h-9.5"
    >
      Add Sub-Container
    </button>
  </div>
</template>
