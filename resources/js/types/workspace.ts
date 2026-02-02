/**
 * Represents the final Node format used by the UI components
 */
export interface Node {
    id: string;
    label: string;
    dataField: string;
    editorType?: string;
    // Store any extra metadata needed for export
    metadata?: Record<string, any>;
}

/**
 * Represents a draggable container (panel) in the workspace
 */
export interface Container {
    id: string;
    name: string;
    numCol: number;
    nodes: Node[];
}

/**
 * Represents the raw data format from the Backend (Vardefs)
 */
export interface BackendVardef {
    label?: string;
    editorType?: string;
    name?: string;
    vname?: string;
    required?: string | number;
    status?: string;
    format?: string;
    unique?: string | number;
    options?: string;
    editorOptions?: Record<string, any>;
    validationRules?: any[];
    [key: string]: any; // Allow for dynamic fields like rmodule1, relate_name, etc.
}

/**
 * The dictionary-style response received from the API
 */
export type BackendResponse = Record<string, BackendVardef>;
