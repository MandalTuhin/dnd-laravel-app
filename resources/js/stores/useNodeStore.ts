import { defineStore } from 'pinia';
import initialNodes from '@/assets/data/nodes.json';
import { NodeService } from '@/services/nodeService';
import type { Node, Container, BackendResponse } from '@/types/workspace';

export type { Node, Container, BackendResponse };

export const useNodeStore = defineStore('nodeStore', {
    state: () => {
        const allNodes = NodeService.transformBackendNodes(
            initialNodes as BackendResponse,
        );
        const workspaceContainers: Container[] = [];
        const availableNodes = allNodes;

        // Comment out localStorage loading - now we load from server
        // const STORAGE_KEY = 'vue_drag_drop_layout';
        // if (typeof window !== 'undefined') {
        //     const saved = localStorage.getItem(STORAGE_KEY);
        //     if (saved) {
        //         try {
        //             const parsedContainers = JSON.parse(saved);
        //             if (Array.isArray(parsedContainers)) {
        //                 workspaceContainers = parsedContainers;
        //                 // ... localStorage restoration logic
        //             }
        //         } catch (e) {
        //             console.error('Failed to restore workspace from localStorage', e);
        //         }
        //     }
        // }

        return {
            workspaceContainers,
            availableNodes,
            isLoading: false,
            loadError: null as string | null,
        };
    },
    actions: {
        // Comment out localStorage saving
        // saveLayout() {
        //     const STORAGE_KEY = 'vue_drag_drop_layout';
        //     if (typeof window !== 'undefined') {
        //         localStorage.setItem(
        //             STORAGE_KEY,
        //             JSON.stringify(this.workspaceContainers),
        //         );
        //     }
        // },

        async loadLatestLayout() {
            this.isLoading = true;
            this.loadError = null;

            try {
                const response = await fetch('/api/layouts', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                // Get the most recent layout (first in the sorted list)
                if (result.layouts && result.layouts.length > 0) {
                    const latestLayout = result.layouts[0];
                    await this.loadSpecificLayout(latestLayout.filename);
                } else {
                    // No saved layouts, start with empty workspace
                    this.workspaceContainers = [];
                    this.availableNodes = NodeService.transformBackendNodes(
                        initialNodes as BackendResponse,
                    );
                }
            } catch (error) {
                console.error('Failed to load layouts from server:', error);
                this.loadError = 'Failed to load workspace from server';
                // Fallback to empty workspace
                this.workspaceContainers = [];
                this.availableNodes = NodeService.transformBackendNodes(
                    initialNodes as BackendResponse,
                );
            } finally {
                this.isLoading = false;
            }
        },

        async loadSpecificLayout(filename: string) {
            try {
                const response = await fetch(`/api/layouts/${filename}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                // Convert server layout back to workspace containers
                this.workspaceContainers = this.convertServerLayoutToContainers(
                    result.layout,
                );

                // Update available nodes based on what's used in containers
                this.updateAvailableNodes();
            } catch (error) {
                console.error('Failed to load specific layout:', error);
                throw error;
            }
        },

        convertServerLayoutToContainers(serverLayout: any[]): Container[] {
            return serverLayout.map((group: any) => ({
                id: crypto.randomUUID(), // Generate new ID for frontend
                name: group.name || 'Untitled Container',
                numCol: group.colCount || 1,
                nodes: (group.items || []).map((item: any) => {
                    // Helper to safely get label text, handling potential nesting bug from previous versions
                    const getLabelText = (labelObj: any) => {
                        if (!labelObj) return undefined;
                        let text = labelObj.text;
                        // Handle nested text object bug
                        while (
                            typeof text === 'object' &&
                            text !== null &&
                            'text' in text
                        ) {
                            text = text.text;
                        }
                        return text;
                    };

                    const labelText = getLabelText(item.label);

                    // Check if this is a spacer node
                    const isSpacerNode =
                        item.dataField === 'spacer' ||
                        (!item.dataField && labelText === '[ || ]');

                    if (isSpacerNode) {
                        return {
                            id: crypto.randomUUID(),
                            label: '[ || ]',
                            dataField: 'spacer',
                            editorType: item.editorType,
                            metadata: item,
                        };
                    }

                    // Regular node
                    return {
                        id: crypto.randomUUID(), // Generate new ID for frontend
                        label: labelText || item.dataField || 'Unknown Field',
                        dataField: item.dataField,
                        editorType: item.editorType,
                        metadata: item,
                    };
                }),
            }));
        },

        updateAvailableNodes() {
            const allNodes = NodeService.transformBackendNodes(
                initialNodes as BackendResponse,
            );

            // Identify nodes already used in the workspace
            const usedDataFields = new Set<string>();
            this.workspaceContainers.forEach((container) => {
                container.nodes.forEach((node) => {
                    if (node.dataField !== 'spacer') {
                        usedDataFields.add(node.dataField);
                    }
                });
            });

            this.availableNodes = allNodes.filter(
                (node) =>
                    node.id === 'spacer' || !usedDataFields.has(node.dataField),
            );
        },

        addContainer(name: string) {
            this.workspaceContainers.push({
                id: crypto.randomUUID(),
                name,
                numCol: 1,
                nodes: [],
            });
        },
        updateContainerNumCol(containerId: string, numCol: number) {
            const container = this.workspaceContainers.find(
                (c) => c.id === containerId,
            );
            if (container) {
                container.numCol = numCol > 0 ? numCol : 1; // Ensure numCol is at least 1
            }
        },
        updateContainerNodes(containerId: string, nodes: Node[]) {
            const container = this.workspaceContainers.find(
                (c) => c.id === containerId,
            );
            if (container) {
                container.nodes = nodes;
            }
        },
        removeContainer(containerId: string) {
            const containerIndex = this.workspaceContainers.findIndex(
                (c) => c.id === containerId,
            );
            if (containerIndex !== -1) {
                const container = this.workspaceContainers[containerIndex];

                if (container) {
                    // Optimization: Use a Set for O(1) lookup to avoid O(N^2) complexity
                    const existingDataFields = new Set(
                        this.availableNodes.map((n) => n.dataField),
                    );

                    // Rescue standard nodes (non-spacers) and return them to the sidebar
                    container.nodes.forEach((node) => {
                        if (node.dataField !== 'spacer') {
                            if (!existingDataFields.has(node.dataField)) {
                                this.availableNodes.push(node);
                                existingDataFields.add(node.dataField);
                            }
                        }
                    });

                    // Remove the container
                    this.workspaceContainers.splice(containerIndex, 1);
                }
            }
        },
        isContainerNameUnique(name: string): boolean {
            const normalizedName = name.trim().toLowerCase();
            return !this.workspaceContainers.some(
                (c) => c.name.toLowerCase() === normalizedName,
            );
        },
        getLayoutJson() {
            return NodeService.exportLayout(
                this.workspaceContainers,
                initialNodes as BackendResponse,
            );
        },
    },
});
