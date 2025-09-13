https://ssundarraj.com/b-tree-viz/

> [!WARNING]
> Most of this repo is vibe coded.

## How B-Trees Work

B-trees are self-balancing search trees designed for systems that read/write large blocks of data (like databases and filesystems).

### Key Properties
- **Multi-way branching:** Each node can have many children (not just 2 like binary trees)
- **Sorted keys:** Keys within nodes are sorted, children between keys contain ranges
- **Balanced height:** All leaf nodes are at the same level
- **Optimized for disk I/O:** Many keys per node = fewer disk reads

### Why Many Keys Per Node?

B-trees prioritize **disk I/O efficiency** over CPU efficiency:

- **Problem:** Binary trees require O(log₂ n) disk reads per operation
- **Solution:** Wide nodes with many keys reduce tree height dramatically
- **Example:** 1M records: Binary tree ~20 reads vs B-tree ~3 reads
- **Key insight:** Reading 100 keys from one disk page is faster than reading 1 key from 100 different pages
- **Real impact:** Database indexes can find any record in ≤4 disk reads regardless of table size

### Search Process
1. Start at root, compare search key with node's keys
2. Find the range where key belongs (between two keys or before/after all keys)
3. Follow the corresponding child pointer
4. Repeat until reaching a leaf node

### Balancing Through Splits and Merges

**Insertion balancing:**
- Insert key into appropriate leaf node
- If node exceeds max keys (`m-1`), **split** it:
  - Create new node, distribute keys between old and new
  - Promote middle key to parent
  - If parent overflows, split it recursively up to root
  - Root split increases tree height by 1

**Deletion balancing:**
- Remove key from node
- If node falls below min keys (`⌈m/2⌉-1`), **rebalance**:
  - Try to **borrow** a key from a sibling (via parent)
  - If siblings are also minimal, **merge** with a sibling
  - Merging may cause parent underflow, propagating upward
  - Root merge decreases tree height by 1

This automatic rebalancing keeps the tree height logarithmic, ensuring O(log n) operations.

## B-Tree Order Explained

**Order (m)** defines the structural constraints:

**Children bounds:**
- Max: `m` children per node
- Min: `⌈m/2⌉` children per non-leaf (root exception: ≥2)

**Key bounds:**
- Max: `m-1` keys per node
- Min: `⌈m/2⌉-1` keys per non-leaf (root exception: ≥1)

**Why these limits:**
- **Max values:** Prevent nodes from becoming too wide (memory/disk efficiency)
- **Min values:** Ensure nodes stay "half full" to guarantee balanced tree height
- **Key-children relationship:** Node with `k` keys has `k+1` children (keys separate child ranges)

**Example (Order 4):**
- 2-4 children, 1-3 keys per node
- Keeps tree balanced while allowing efficient branching

TODOs:
- [ ] Make sure b-tree is actually right. Perhaps reimplement from scratch.
- [ ] Composite index
