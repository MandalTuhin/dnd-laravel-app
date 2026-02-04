import { describe, it, expect } from 'vitest';
import type { BackendResponse, Container } from '@/types/workspace';
import { NodeService } from '../nodeService';

describe('NodeService', () => {
    describe('transformBackendNodes', () => {
        it('should transform backend response to frontend nodes', () => {
            const backendData: BackendResponse = {
                field1: {
                    label: 'First Name',
                    editorType: 'dxTextBox',
                    required: '1',
                },
                field2: {
                    label: 'Email',
                    editorType: 'dxTextBox',
                    format: 'email',
                },
            };

            const result = NodeService.transformBackendNodes(backendData);

            expect(result).toHaveLength(3); // 2 fields + spacer
            expect(result[0]).toEqual({
                id: 'field1',
                label: 'First Name',
                dataField: 'field1',
                editorType: 'dxTextBox',
                metadata: {
                    label: 'First Name',
                    editorType: 'dxTextBox',
                    required: '1',
                },
            });
            expect(result[1]).toEqual({
                id: 'field2',
                label: 'Email',
                dataField: 'field2',
                editorType: 'dxTextBox',
                metadata: {
                    label: 'Email',
                    editorType: 'dxTextBox',
                    format: 'email',
                },
            });
        });

        it('should add spacer node', () => {
            const backendData: BackendResponse = {};
            const result = NodeService.transformBackendNodes(backendData);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: 'spacer',
                label: '[ || ]',
                dataField: 'spacer',
                metadata: {},
            });
        });

        it('should use id as label when label is missing', () => {
            const backendData: BackendResponse = {
                field1: {
                    editorType: 'dxTextBox',
                },
            };

            const result = NodeService.transformBackendNodes(backendData);

            expect(result[0].label).toBe('field1');
        });
    });

    describe('exportLayout', () => {
        it('should export containers to backend format', () => {
            const containers: Container[] = [
                {
                    id: 'container1',
                    name: 'Personal Info',
                    numCol: 2,
                    nodes: [
                        {
                            id: 'field1',
                            label: 'First Name',
                            dataField: 'first_name',
                            editorType: 'dxTextBox',
                            metadata: { required: '1' },
                        },
                        {
                            id: 'spacer',
                            label: '[ || ]',
                            dataField: 'spacer',
                            metadata: {},
                        },
                    ],
                },
            ];

            const rawVardefs: BackendResponse = {
                first_name: {
                    label: 'First Name',
                    editorType: 'dxTextBox',
                    required: '1',
                },
            };

            const result = NodeService.exportLayout(containers, rawVardefs);

            expect(result).toEqual([
                {
                    name: 'Personal Info',
                    itemType: 'group',
                    colCount: 2,
                    items: [
                        {
                            dataField: 'first_name',
                            editorType: 'dxTextBox',
                            label: { text: 'First Name' },
                            required: '1',
                        },
                    ],
                },
            ]);
        });

        it('should filter out spacer nodes', () => {
            const containers: Container[] = [
                {
                    id: 'container1',
                    name: 'Test',
                    numCol: 1,
                    nodes: [
                        {
                            id: 'spacer',
                            label: '[ || ]',
                            dataField: 'spacer',
                            metadata: {},
                        },
                    ],
                },
            ];

            const result = NodeService.exportLayout(containers, {});

            expect(result[0].items).toHaveLength(0);
        });

        it('should use default editorType when missing', () => {
            const containers: Container[] = [
                {
                    id: 'container1',
                    name: 'Test',
                    numCol: 1,
                    nodes: [
                        {
                            id: 'field1',
                            label: 'Test Field',
                            dataField: 'test_field',
                            metadata: {},
                        },
                    ],
                },
            ];

            const result = NodeService.exportLayout(containers, {});

            expect(result[0].items[0].editorType).toBe('dxTextBox');
        });

        it('should preserve the original dataField (key) even if the node id is a UUID', () => {
            const mockBackendResponse: BackendResponse = {
                name: {
                    editorType: 'dxTextBox',
                    label: 'Name',
                },
            };

            // Simulate a cloned node in the workspace with a UUID
            const containers: Container[] = [
                {
                    id: 'c1',
                    name: 'Basic Information',
                    numCol: 2,
                    nodes: [
                        {
                            id: '92257312-16eb-4719-b039-0bc6278821dc', // UUID
                            label: 'Name',
                            dataField: 'name', // Original key
                            editorType: 'dxTextBox',
                            metadata: mockBackendResponse.name,
                        },
                    ],
                },
            ];

            const result = NodeService.exportLayout(
                containers,
                mockBackendResponse,
            );

            expect(result[0].items[0].dataField).toBe('name');
        });
    });

    describe('isSpacer', () => {
        it('should identify spacer by id', () => {
            const spacerNode = {
                id: 'spacer',
                label: 'Test',
                dataField: 'spacer',
                metadata: {},
            };

            expect(NodeService.isSpacer(spacerNode)).toBe(true);
        });

        it('should identify spacer by label', () => {
            const spacerNode = {
                id: 'test',
                label: '[ || ]',
                dataField: 'test',
                metadata: {},
            };

            expect(NodeService.isSpacer(spacerNode)).toBe(true);
        });

        it('should return false for regular nodes', () => {
            const regularNode = {
                id: 'field1',
                label: 'First Name',
                dataField: 'first_name',
                metadata: {},
            };

            expect(NodeService.isSpacer(regularNode)).toBe(false);
        });
    });
});
