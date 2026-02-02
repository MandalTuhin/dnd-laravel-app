<template>
    <div
        class="flex items-center justify-between rounded-t-xl border-b border-gray-100 bg-gray-50/50 p-4"
    >
        <div class="flex items-center gap-4">
            <div
                class="container-handle cursor-grab p-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"
                    />
                </svg>
            </div>
            <h3 class="font-bold tracking-tight text-gray-800">{{ name }}</h3>

            <div
                class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1 shadow-sm"
            >
                <label
                    :for="'cols-' + id"
                    class="text-[10px] font-black tracking-tighter text-gray-600 uppercase"
                    >Columns</label
                >
                <input
                    :id="'cols-' + id"
                    type="number"
                    :value="numCol"
                    @input="handleColsUpdate"
                    min="1"
                    max="12"
                    class="w-10 bg-transparent text-center font-bold text-blue-600 outline-none"
                />
            </div>
        </div>

        <button
            @click="$emit('remove')"
            class="rounded-lg p-1.5 text-gray-300 transition-all hover:bg-red-50 hover:text-red-700"
            aria-label="Remove container"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                />
            </svg>
        </button>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    id: string | number;
    name: string;
    numCol: number;
}>();

const emit = defineEmits<{
    remove: [];
    updateCols: [value: number];
}>();

const handleColsUpdate = (e: Event) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    if (!isNaN(val)) {
        emit('updateCols', val);
    }
};
</script>
