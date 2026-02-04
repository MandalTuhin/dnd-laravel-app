import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNodeStore } from '../useNodeStore';

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
    value: {
        randomUUID: vi.fn(() => 'test-uuid-123'),
    },
});

// Mock the initial nodes data
vi.mock('@/assets/data/nodes.json', () => ({
    default: {
        first_name: {
            label: 'First Name',
            editorType: 'dxTextBox',
        },
        email: {
            label: 'Email',
            editorType: 'dxTextBox',
        },
    },
}));

describe('useNodeStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with empty workspace when no server data', () => {
            const store = useNodeStore();

            expect(store.workspaceContainers).toEqual([]);
            expect(store.availableNodes).toHaveLength(3); // 2 fields + spacer
        });
    });

    describe('actions', () => {
        describe('addContainer', () => {
            it('should add a new container', () => {
                const store = useNodeStore();

                store.addContainer('Test Container');

                expect(store.workspaceContainers).toHaveLength(1);
                expect(store.workspaceContainers[0]).toEqual({
                    id: 'test-uuid-123',
                    name: 'Test Container',
                    numCol: 1,
                    nodes: [],
                });
            });
        });

        describe('updateContainerNumCol', () => {
            it('should update container column count', () => {
                const store = useNodeStore();
                store.addContainer('Test Container');
                const containerId = store.workspaceContainers[0].id;

                store.updateContainerNumCol(containerId, 3);

                expect(store.workspaceContainers[0].numCol).toBe(3);
            });

            it('should ensure minimum column count of 1', () => {
                const store = useNodeStore();
                store.addContainer('Test Container');
                const containerId = store.workspaceContainers[0].id;

                store.updateContainerNumCol(containerId, 0);

                expect(store.workspaceContainers[0].numCol).toBe(1);
            });

            it('should do nothing if container not found', () => {
                const store = useNodeStore();
                store.addContainer('Test Container');
                const originalNumCol = store.workspaceContainers[0].numCol;

                store.updateContainerNumCol('non-existent-id', 5);

                expect(store.workspaceContainers[0].numCol).toBe(
                    originalNumCol,
                );
            });
        });

        describe('updateContainerNodes', () => {
            it('should update container nodes', () => {
                const store = useNodeStore();
                store.addContainer('Test Container');
                const containerId = store.workspaceContainers[0].id;

                const newNodes = [
                    {
                        id: 'field1',
                        label: 'Test Field',
                        dataField: 'test_field',
                        metadata: {},
                    },
                ];

                store.updateContainerNodes(containerId, newNodes);

                expect(store.workspaceContainers[0].nodes).toEqual(newNodes);
            });
        });

        describe('removeContainer', () => {
            it('should remove container and return nodes to available list', () => {
                const store = useNodeStore();
                store.addContainer('Test Container');
                const containerId = store.workspaceContainers[0].id;

                // Add a node to the container that's not already in available nodes
                const testNode = {
                    id: 'new_field',
                    label: 'New Field',
                    dataField: 'new_field',
                    metadata: {},
                };
                store.updateContainerNodes(containerId, [testNode]);

                const initialAvailableCount = store.availableNodes.length;

                store.removeContainer(containerId);

                expect(store.workspaceContainers).toHaveLength(0);
                // Should return the node to available nodes
                expect(store.availableNodes.length).toBeGreaterThanOrEqual(
                    initialAvailableCount,
                );
            });

            it('should return multiple nodes to sidebar while ignoring spacers', () => {
                const store = useNodeStore();
                store.addContainer('Cleanup Panel');
                const containerId = store.workspaceContainers[0].id;

                const standardNode = {
                    id: 'test-1',
                    label: 'Input Field',
                    dataField: 'test-1',
                    metadata: {},
                };
                const spacerNode = {
                    id: 'test-spacer',
                    label: '[ || ]',
                    dataField: 'spacer',
                    metadata: {},
                };
                store.updateContainerNodes(containerId, [
                    standardNode,
                    spacerNode,
                ]);

                const initialSidebarCount = store.availableNodes.length;
                store.removeContainer(containerId);

                expect(store.workspaceContainers).toHaveLength(0);
                expect(store.availableNodes).toContainEqual(standardNode);
                expect(
                    store.availableNodes.some((n) => n.id === 'test-spacer'),
                ).toBe(false);
                expect(store.availableNodes.length).toBe(
                    initialSidebarCount + 1,
                );
            });

            it('should not return spacer nodes to available list', () => {
                const store = useNodeStore();
                store.addContainer('Test Container');
                const containerId = store.workspaceContainers[0].id;

                const spacerNode = {
                    id: 'spacer',
                    label: '[ || ]',
                    dataField: 'spacer',
                    metadata: {},
                };
                store.updateContainerNodes(containerId, [spacerNode]);

                const initialAvailableCount = store.availableNodes.length;

                store.removeContainer(containerId);

                expect(store.availableNodes.length).toBe(initialAvailableCount);
            });
        });

        describe('isContainerNameUnique', () => {
            it('should return true for unique names', () => {
                const store = useNodeStore();
                store.addContainer('Existing Container');

                expect(store.isContainerNameUnique('New Container')).toBe(true);
            });

            it('should return false for duplicate names', () => {
                const store = useNodeStore();
                store.addContainer('Existing Container');

                expect(store.isContainerNameUnique('Existing Container')).toBe(
                    false,
                );
            });

            it('should be case insensitive', () => {
                const store = useNodeStore();
                store.addContainer('Existing Container');

                expect(store.isContainerNameUnique('EXISTING CONTAINER')).toBe(
                    false,
                );
                expect(store.isContainerNameUnique('existing container')).toBe(
                    false,
                );
            });

            it('should trim whitespace', () => {
                const store = useNodeStore();
                store.addContainer('Existing Container');

                expect(
                    store.isContainerNameUnique('  Existing Container  '),
                ).toBe(false);
            });
        });

        describe('getLayoutJson', () => {
            it('should return exported layout', () => {
                const store = useNodeStore();
                store.addContainer('Test Container');

                const result = store.getLayoutJson();

                expect(result).toEqual([
                    {
                        name: 'Test Container',
                        itemType: 'group',
                        colCount: 1,
                        items: [],
                    },
                ]);
            });
        });
    });
});
