import type { BackendResponse, Node, Container } from '@/types/workspace'

/**
 * NodeService handles all data transformations and API interactions
 * related to draggable nodes.
 */
export const NodeService = {
  /**
   * Transforms the raw Vardef response from the backend into 
   * a format the frontend workspace can use.
   */
  transformBackendNodes(data: BackendResponse): Node[] {
    // 1. Map backend entries to our Node interface
    const nodes: Node[] = Object.entries(data).map(([id, vardef]) => ({
      id,
      label: vardef.label || id, // Fallback to id if label is missing
      dataField: id
    }))

    // 2. Inject frontend-only utility nodes (like the spacer)
    nodes.push({ id: 'spacer', label: '[ || ]' })

    return nodes
  },

  /**
   * Transforms the workspace state back into the specific format
   * required by the backend for saving.
   */
  exportLayout(containers: Container[], rawVardefs: BackendResponse) {
    return containers.map(container => ({
      name: container.name,
      itemType: 'group',
      colCount: container.numCol,
      items: container.nodes
        .filter(node => node.id !== 'spacer') // Usually, spacers aren't saved to DB
        .map(node => {
          const fieldId = node.dataField || node.id
          const original = rawVardefs[fieldId] || {}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { label, ...metadata } = original

          return {
            dataField: fieldId,
            editorType: original.editorType || 'dxTextBox',
            label: {
              text: node.label
            },
            ...metadata // Include any other original fields like status, required, etc.
          }
        })
    }))
  },

  /**
   * Identifies if a node is a spacer (clonable utility node)
   */
  isSpacer(node: Node): boolean {
    return node.id === 'spacer' || node.label === '[ || ]'
  }
}
// will have to look forward.
