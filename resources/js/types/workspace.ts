/**
 * Represents the final Node format used by the UI components
 */
export interface Node {
  id: string
  label: string
  dataField?: string
}

/**
 * Represents a draggable container (panel) in the workspace
 */
export interface Container {
  id: string
  name: string
  numCol: number
  nodes: Node[]
}

/**
 * Represents the raw data format from the Backend (Vardefs)
 */
export interface BackendVardef {
  label?: string
  editorType?: string
  name?: string
  vname?: string
  // Add other backend fields here if needed
}

/**
 * The dictionary-style response received from the API
 */
export type BackendResponse = Record<string, BackendVardef>

