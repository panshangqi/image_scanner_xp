export function flatFilter(tree, callback) {
    return tree.reduce((acc, node) => {
        if (callback(node)) {
            acc.push(node);
        }
        if (node.children) {
            const children = flatFilter(node.children, callback);
            acc.push(...children);
        }
        return acc;
    }, []);
}
