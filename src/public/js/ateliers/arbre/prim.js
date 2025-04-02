export const primAlgorithm = (cy) => {
    const nodes = cy.nodes();
    if (nodes.length === 0) return [];

    const visited = new Set();
    const edgeQueue = [];
    const resultEdgeIds = [];

    const startNode = nodes[0];
    visited.add(startNode.id());

    startNode.connectedEdges().forEach(edge => {
        if (edge.data('weight') !== undefined) {
            edgeQueue.push(edge);
        }
    });

    while (visited.size < nodes.length && edgeQueue.length > 0) {

        edgeQueue.sort((a, b) => a.data('weight') - b.data('weight'));

        const minEdge = edgeQueue.shift();
        const sourceId = minEdge.source().id();
        const targetId = minEdge.target().id();

        let nextNode = null;

        if (visited.has(sourceId) && !visited.has(targetId)) {
            nextNode = minEdge.target();
        } else if (visited.has(targetId) && !visited.has(sourceId)) {
            nextNode = minEdge.source();
        }

        if (nextNode) {
            visited.add(nextNode.id());
            resultEdgeIds.push(minEdge.id());

            nextNode.connectedEdges().forEach(edge => {
                const src = edge.source().id();
                const tgt = edge.target().id();

                if ((visited.has(src) && !visited.has(tgt)) || (visited.has(tgt) && !visited.has(src))) {
                    if (edge.data('weight') !== undefined) {
                        edgeQueue.push(edge);
                    }
                }
            });
        }
    }

    if (visited.size !== nodes.length) {
        return null;
    }

    return resultEdgeIds;
}
