import type { CustomGraph, CustomLink, CustomNode } from "../../types/Graph";

export interface SingleFileImport {

    /**
     * Import data and convert it to a graph
     * @param data The converted graph
     */
    import(data: string): Promise<CustomGraph>;
}