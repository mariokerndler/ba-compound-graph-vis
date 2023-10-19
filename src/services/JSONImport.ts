import type { CustomType, CustomGraph, CustomLink, CustomNode } from "../types/Graph";
import { defineGraph, defineLink, defineNode } from 'd3-graph-controller';
import type { DataImport } from "./DataImport";
import type { Import } from "../types/GraphDTO";
import * as d3 from 'd3';

export class JSONImport implements DataImport {
    private color = d3.scaleOrdinal(d3.schemeCategory10);

    async import(data: string): Promise<CustomGraph> {
        const jsonObj: Import.GraphDTO = await JSON.parse(data);
        
        const idMap: Map<string, CustomNode> = new Map<string, CustomNode>();
        
        const newNodes: CustomNode[] = this.convertNodes(jsonObj.nodes, idMap);
        const newLinks: CustomLink[] = this.convertLinks(jsonObj.links, idMap);
        
        const graph: CustomGraph = defineGraph<CustomType, CustomNode, CustomLink>({
            nodes: newNodes,
            links: newLinks,
        });
        
        return new Promise((resolve) => {
            resolve(graph);
        });
    }

    private convertNodes(nodes: Import.NodeDTO[], map: Map<string, CustomNode>): CustomNode[] {
        const newNodes: CustomNode[] = [];
        
        nodes.forEach((node) => {
            const newNode: CustomNode = defineNode<CustomType, CustomNode>({
                id: node.id,
                type: 'primary',
                isFocused: false,
                color: this.color(node.group.toString()),
                label: {
                    color: 'black',
                    fontSize: '0.5rem',
                    text: node.id
                },
                group: node.group
            });
            
            newNodes.push(newNode);
            
            map.set(node.id, newNode);
        });
        
        return newNodes;
    }
    
    private convertLinks(links: Import.LinkDTO[], map: Map<string, CustomNode>): CustomLink[] {
        const newLinks: CustomLink[] = [];
        
        links.forEach((link) => {
            const s = map.get(link.source);
            const t = map.get(link.target);
            
            if (s === undefined || t === undefined) {
                alert("Link could not be converted.");
                return newLinks;
            }
            
            const newLink: CustomLink = defineLink<CustomType, CustomNode, CustomNode, CustomLink>({
                source: s,
                target: t,
                color: 'black',
                label: {
                    color: 'black',
                    fontSize: '1rem',
                    text: '',
                }
            });
            
            newLinks.push(newLink);
        });
        
        return newLinks;
    }
}