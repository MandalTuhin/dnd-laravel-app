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
                    const baseVardef = rawVardefs[fieldId] || {};
                    // Merge: Metadata from the layout (preserving summaryType, etc)
                    // takes precedence over base vardefs if they overlap,
                    // but we ensure the current node's editorType is used.
                    const combined = {
                        ...baseVardef,
                        ...(node.metadata || {}),
                    };

                    // Ensure we don't nest the label text recursively (handle deep nesting)
                    let labelText = combined.label;
                    while (
                        labelText &&
                        typeof labelText === 'object' &&
                        'text' in labelText
                    ) {
                        labelText = labelText.text;
                    }
                    // Fallback to node.label if labelText is empty/undefined
                    labelText = labelText || node.label;

                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { label, ...metadata } = combined;

                    return {
                        dataField: fieldId,
                        editorType:
                            node.editorType ||
                            combined.editorType ||
                            'dxTextBox',
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
