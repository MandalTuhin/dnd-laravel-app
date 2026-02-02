import { ref } from 'vue'

export function useDragIndicators() {
  const indicatorIndex = ref<number | null>(null)
  const indicatorSide = ref<'left' | 'right'>('left')
  const isDraggingOverEmpty = ref(false)

  const onMove = (e: any) => {
    const { relatedContext, to } = e

    isDraggingOverEmpty.value = false

    if (to.classList.contains('sortable-container')) {
      if (relatedContext.list.length === 0) {
        isDraggingOverEmpty.value = true
        indicatorIndex.value = null
      } else {
        indicatorIndex.value = relatedContext.index

        // Determine if we are on the left or right half of the target element
        const rect = e.related.getBoundingClientRect()
        const mouseX = e.originalEvent.clientX
        const midX = rect.left + rect.width / 2

        indicatorSide.value = mouseX > midX ? 'right' : 'left'
      }
    }
    return false // Prevent default SortableJS sorting
  }

  const onEnd = () => {
    indicatorIndex.value = null
    isDraggingOverEmpty.value = false
  }

  const onDragLeave = () => {
    indicatorIndex.value = null
    isDraggingOverEmpty.value = false
  }

  const resetIndicators = () => {
    indicatorIndex.value = null
    indicatorSide.value = 'left'
    isDraggingOverEmpty.value = false
  }

  return {
    indicatorIndex,
    indicatorSide,
    isDraggingOverEmpty,
    onMove,
    onEnd,
    onDragLeave,
    resetIndicators
  }
}
