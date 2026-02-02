import { describe, it, expect } from 'vitest'
import { NodeService } from '../nodeService'
import type { Container, BackendResponse } from '@/types/workspace'

describe('NodeService Layout Export Issue', () => {
  const mockBackendResponse: BackendResponse = {
    "name": {
      "editorType": "dxTextBox",
      "label": "Name",
      "name": "name", // ensuring this exists as per user input, though structure varies slightly
      "vname": "LBL_NAME", 
      // @ts-ignore - satisfying the loose typing for test
      "validationRules": [] 
    }
  }

  it('reproduces the issue where exported dataField becomes a UUID instead of the original key', () => {
    // 1. Simulate initial transformation
    const availableNodes = NodeService.transformBackendNodes(mockBackendResponse)
    const nameNode = availableNodes.find(n => n.id === 'name')
    expect(nameNode).toBeDefined()

    // 2. Simulate dragging to workspace (Cloning)
    // This is the CRITICAL step happening in the UI component (NodeSidebarSource.vue)
    // but we simulate the result here: a node with a new UUID but same content.
    const clonedNode = {
      ...nameNode!,
      id: '92257312-16eb-4719-b039-0bc6278821dc' // Random UUID
    }

    // 3. Create a container with this cloned node
    const containers: Container[] = [{
      id: 'c1',
      name: 'Basic Information',
      numCol: 2,
      nodes: [clonedNode]
    }]

    // 4. Export Layout
    const result = NodeService.exportLayout(containers, mockBackendResponse)

    // 5. Assert EXPECTATIONS vs REALITY
    // The user EXPECTS 'dataField' to be 'name'
    // The current BUG causes it to be the UUID
    
    const exportedItem = result[0].items[0]
    
    console.log('Exported Item:', exportedItem)

    // This assertion CONFIRMS the bug exists (we expect it to fail if the bug is present, 
    // or we write it to pass ONLY if the bug is present to "prove" it).
    // Let's write the assertion for the DESIRED behavior, so the test FAILS now.
    expect(exportedItem.dataField).toBe('name')
    
    // Also, since lookup failed, other metadata might be missing or default
    expect(exportedItem.editorType).toBe('dxTextBox') 
  })
})
