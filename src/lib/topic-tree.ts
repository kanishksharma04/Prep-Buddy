export type TopicNode<T> = T & { children: TopicNode<T>[] };

// Nests a flat, order-sorted topic list into a tree by parentId. A topic
// whose parent isn't in the list (already deleted, or just not fetched)
// is treated as a root rather than dropped, so nothing silently disappears.
export function buildTopicTree<T extends { id: string; parentId: string | null }>(
  topics: T[],
): TopicNode<T>[] {
  const nodes = new Map<string, TopicNode<T>>();
  for (const topic of topics) {
    nodes.set(topic.id, { ...topic, children: [] });
  }

  const roots: TopicNode<T>[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
