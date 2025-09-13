export class BSTNode<T> {
  value: T;
  left: BSTNode<T> | null = null;
  right: BSTNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class BST<T> {
  root: BSTNode<T> | null = null;
  private compare: (a: T, b: T) => number;

  constructor(compareFunction?: (a: T, b: T) => number) {
    this.compare = compareFunction || ((a, b) => (a as any) - (b as any));
  }

  insert(value: T): void {
    this.root = this.insertRecursive(this.root, value);
  }

  private insertRecursive(node: BSTNode<T> | null, value: T): BSTNode<T> {
    if (!node) {
      return new BSTNode(value);
    }

    if (this.compare(value, node.value) < 0) {
      node.left = this.insertRecursive(node.left, value);
    } else if (this.compare(value, node.value) > 0) {
      node.right = this.insertRecursive(node.right, value);
    }

    return node;
  }

  getRoot(): BSTNode<T> | null {
    return this.root;
  }

  // Create a balanced BST from sorted array
  static fromSortedArray<T>(values: T[], compareFunction?: (a: T, b: T) => number): BST<T> {
    const bst = new BST<T>(compareFunction);
    bst.root = BST.buildBalancedFromSorted(values, 0, values.length - 1);
    return bst;
  }

  private static buildBalancedFromSorted<T>(values: T[], start: number, end: number): BSTNode<T> | null {
    if (start > end) return null;

    const mid = Math.floor((start + end) / 2);
    const node = new BSTNode(values[mid]);

    node.left = BST.buildBalancedFromSorted(values, start, mid - 1);
    node.right = BST.buildBalancedFromSorted(values, mid + 1, end);

    return node;
  }

  traverse(): T[] {
    const result: T[] = [];
    this.inorderTraversal(this.root, result);
    return result;
  }

  private inorderTraversal(node: BSTNode<T> | null, result: T[]): void {
    if (node) {
      this.inorderTraversal(node.left, result);
      result.push(node.value);
      this.inorderTraversal(node.right, result);
    }
  }
}