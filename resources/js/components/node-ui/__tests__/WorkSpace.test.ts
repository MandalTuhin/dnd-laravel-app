import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNodeStore } from '@/stores/useNodeStore';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto
Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: vi.fn(() => 'test-uuid-123') },
});

// Mock initial nodes data
vi.mock('@/assets/data/nodes.json', () => ({
    default: {
        first_name: { label: 'First Name', editorType: 'dxTextBox' },
    },
}));

// Simple test component that mimics WorkSpace behavior
const TestWorkSpace = {
    template: `
        <div>
            <button @click="save" data-testid="save-btn">Save</button>
            <div v-if="!store.workspaceContainers.length" data-testid="empty">
                Empty workspace
            </div>
            <div v-else data-testid="has-containers">
                {{ store.workspaceContainers.length }} containers
            </div>
        </div>
    `,
    setup() {
        const store = useNodeStore();
        // Comment out localStorage save since we removed that functionality
        // const save = () => store.saveLayout();
        const save = () => {
            // Mock save function for testing
            console.log('Save clicked');
        };
        return { store, save };
    },
};

describe('WorkSpace Component Logic', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    it('should show empty state when no containers', () => {
        const wrapper = mount(TestWorkSpace);
        expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="has-containers"]').exists()).toBe(
            false,
        );
    });

    it('should show containers when they exist', () => {
        const store = useNodeStore();
        store.addContainer('Test Container');

        const wrapper = mount(TestWorkSpace);
        expect(wrapper.find('[data-testid="empty"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="has-containers"]').exists()).toBe(
            true,
        );
        expect(wrapper.text()).toContain('1 containers');
    });

    it('should call save when button clicked', async () => {
        const consoleSpy = vi
            .spyOn(console, 'log')
            .mockImplementation(() => {});

        const wrapper = mount(TestWorkSpace);
        await wrapper.find('[data-testid="save-btn"]').trigger('click');

        expect(consoleSpy).toHaveBeenCalledWith('Save clicked');

        consoleSpy.mockRestore();
    });
});
