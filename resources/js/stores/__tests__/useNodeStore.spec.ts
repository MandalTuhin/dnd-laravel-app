import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useNodeStore } from '../useNodeStore'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('NodeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('initializes with default available nodes', () => {
    const store = useNodeStore()
    expect(store.availableNodes.length).toBeGreaterThan(0)
    expect(store.availableNodes.some(n => n.label === '[ || ]')).toBe(true)
  })

  describe('Container Management', () => {
    it('adds a new container', () => {
      const store = useNodeStore()
      store.addContainer('Test Panel')
      expect(store.workspaceContainers.length).toBe(1)
      expect(store.workspaceContainers[0]?.name).toBe('Test Panel')
    })

    it('validates unique container names (case-insensitive)', () => {
      const store = useNodeStore()
      store.addContainer('Panel A')
      
      expect(store.isContainerNameUnique('Panel A')).toBe(false)
      expect(store.isContainerNameUnique('panel a')).toBe(false)
      expect(store.isContainerNameUnique('Panel B')).toBe(true)
    })

    it('removes a container and rescues standard nodes', () => {
      const store = useNodeStore()
      store.addContainer('Cleanup Panel')
      const containerId = store.workspaceContainers[0]?.id
      if (!containerId) throw new Error('Container ID not found')
      
      // Manually add nodes to the container
      const standardNode = { id: 'test-1', label: 'Input Field' }
      const spacerNode = { id: 'test-spacer', label: '[ || ]' }
      store.updateContainerNodes(containerId, [standardNode, spacerNode])

      // Initial available nodes count
      const initialSidebarCount = store.availableNodes.length

      store.removeContainer(containerId)

      // Container should be gone
      expect(store.workspaceContainers.length).toBe(0)
      
      // Standard node should be back in sidebar
      expect(store.availableNodes).toContainEqual(standardNode)
      // Sidebar should have increased by 1 (only the standard node)
      expect(store.availableNodes.length).toBe(initialSidebarCount + 1)
      // Spacer should NOT be in sidebar
      expect(store.availableNodes.some(n => n.id === 'test-spacer')).toBe(false)
    })
  })

  describe('Node Updates', () => {
    it('updates container nodes', () => {
      const store = useNodeStore()
      store.addContainer('Update Test')
      const containerId = store.workspaceContainers[0]?.id
      if (!containerId) throw new Error('Container ID not found')
      const newNodes = [{ id: '99', label: 'Dynamic Node' }]
      
      store.updateContainerNodes(containerId, newNodes)
      expect(store.workspaceContainers[0]?.nodes).toEqual(newNodes)
    })

    it('updates container column count', () => {
      const store = useNodeStore()
      store.addContainer('Col Test')
      const containerId = store.workspaceContainers[0]?.id
      if (!containerId) throw new Error('Container ID not found')
      
      store.updateContainerNumCol(containerId, 4)
      expect(store.workspaceContainers[0]?.numCol).toBe(4)
      
      // Should not go below 1
      store.updateContainerNumCol(containerId, 0)
      expect(store.workspaceContainers[0]?.numCol).toBe(1)
    })
  })
})
