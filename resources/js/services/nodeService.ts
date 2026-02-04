import type { BackendResponse, Node, Container } from '@/types/workspace';

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
            label: vardef.label || id,
            dataField: id,
            editorType: vardef.editorType,
            metadata: vardef,
        }));

        // 2. Inject frontend-only utility nodes (like the spacer)
        nodes.push({
            id: 'spacer',
            label: '[ || ]',
            dataField: 'spacer',
            metadata: {},
        });

        return nodes;
    },

    /**
     * Transforms the workspace state back into the specific format
     * required by the backend for saving.
     */
    exportLayout(containers: Container[], rawVardefs: BackendResponse) {
        return containers.map((container) => ({
            name: container.name,
            itemType: 'group',
            colCount: container.numCol,
            items: container.nodes
                .filter((node) => node.id !== 'spacer')
                .map((node) => {
                    const fieldId = node.dataField;
                    const original = rawVardefs[fieldId] || node.metadata || {};

                    // We want to construct the item exactly as requested.
                    // The requested layout JSON has: dataField, editorType, label: { text },
                    // and then other properties like source, summaryType (if added), etc.

                    const { label, ...metadata } = original;

                    // Ensure we don't nest the label text recursively (handle deep nesting)
                    let labelText = label;
                    while (
                        labelText &&
                        typeof labelText === 'object' &&
                        'text' in labelText
                    ) {
                        labelText = labelText.text;
                    }
                    // Fallback to node.label if labelText is empty/undefined
                    labelText = labelText || node.label;

                    return {
                        dataField: fieldId,
                        editorType: original.editorType || 'dxTextBox',
                        label: {
                            text: labelText,
                        },
                        ...metadata,
                    };
                }),
        }));
    },

    /**
     * Identifies if a node is a spacer (clonable utility node)
     */
    isSpacer(node: Node): boolean {
        return node.id === 'spacer' || node.label === '[ || ]';
    },
};
// will have to look forward.
