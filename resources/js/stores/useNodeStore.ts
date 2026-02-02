import { defineStore } from 'pinia';
import initialNodes from '@/assets/data/nodes.json';
import { NodeService } from '@/services/nodeService';
import type { Node, Container, BackendResponse } from '@/types/workspace';

export type { Node, Container, BackendResponse };

export const useNodeStore = defineStore('nodeStore', {
  state: () => {
    const STORAGE_KEY = 'vue_drag_drop_layout';
    const allNodes = NodeService.transformBackendNodes(initialNodes as BackendResponse);
    let workspaceContainers: Container[] = [];
    let availableNodes = allNodes;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedContainers = JSON.parse(saved);
        if (Array.isArray(parsedContainers)) {
          workspaceContainers = parsedContainers;
          
          // Identify nodes already used in the workspace to remove them from sidebar
          const usedNodeIds = new Set<string>();
          workspaceContainers.forEach(container => {
            container.nodes.forEach(node => {
              // We check 'dataField' or 'id'. 
              // Standard nodes moved (not cloned) retain their original ID.
              // We need to exclude them from availableNodes.
              usedNodeIds.add(node.id);
            });
          });

          availableNodes = allNodes.filter(node => 
            node.id === 'spacer' || !usedNodeIds.has(node.id)
          );
        }
      } catch (e) {
        console.error('Failed to restore workspace from localStorage', e);
      }
    }

    return {
      workspaceContainers,
      availableNodes,
    };
  },
  actions: {
    saveLayout() {
      const STORAGE_KEY = 'vue_drag_drop_layout';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.workspaceContainers));
    },
    addContainer(name: string) {
      this.workspaceContainers.push({
        id: crypto.randomUUID(),
        name,
        numCol: 1,
        nodes: []
      });
    },
    updateContainerNumCol(containerId: string, numCol: number) {
      const container = this.workspaceContainers.find(c => c.id === containerId);
      if (container) {
        container.numCol = numCol > 0 ? numCol : 1; // Ensure numCol is at least 1
      }
    },
    updateContainerNodes(containerId: string, nodes: Node[]) {
      const container = this.workspaceContainers.find(c => c.id === containerId);
      if (container) {
        container.nodes = nodes;
      }
    },
    removeContainer(containerId: string) {
      const containerIndex = this.workspaceContainers.findIndex(c => c.id === containerId);
      if (containerIndex !== -1) {
        const container = this.workspaceContainers[containerIndex];
        
        if (container) {
          // Rescue standard nodes (non-spacers) and return them to the sidebar
          const nodesToReturn = container.nodes.filter(n => n.label !== '[ || ]');
          this.availableNodes.push(...nodesToReturn);

          // Remove the container
          this.workspaceContainers.splice(containerIndex, 1);
        }
      }
    },
    isContainerNameUnique(name: string): boolean {
      const normalizedName = name.trim().toLowerCase();
      return !this.workspaceContainers.some(c => c.name.toLowerCase() === normalizedName);
    },
    getLayoutJson() {
      return NodeService.exportLayout(this.workspaceContainers, initialNodes as BackendResponse);
    }
  }
});
