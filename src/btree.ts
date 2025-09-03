export interface BTreeNode<T> {
  keys: T[];
  children: BTreeNode<T>[];
  isLeaf: boolean;
  parent?: BTreeNode<T>;
}

export class BTree<T> {
  private root: BTreeNode<T> | null = null;
  private order: number; // Maximum number of children per node
  private minKeys: number;
  private maxKeys: number;
  private compareFn: (a: T, b: T) => number;

  constructor(
    order: number = 3,
    compareFn: (a: T, b: T) => number = (a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    }
  ) {
    if (order < 3) {
      throw new Error('Order must be at least 3');
    }
    this.order = order;
    this.minKeys = Math.ceil(order / 2) - 1;
    this.maxKeys = order - 1;
    this.compareFn = compareFn;
  }

  insert(key: T): void {
    if (this.root === null) {
      this.root = this.createNode(true);
      this.root.keys.push(key);
      return;
    }

    if (this.root.keys.length === this.maxKeys) {
      const newRoot = this.createNode(false);
      newRoot.children.push(this.root);
      this.root.parent = newRoot;
      this.splitChild(newRoot, 0);
      this.root = newRoot;
    }

    this.insertNonFull(this.root, key);
  }

  search(key: T): boolean {
    return this.searchNode(this.root, key);
  }

  delete(key: T): boolean {
    if (this.root === null) {
      return false;
    }

    const deleted = this.deleteFromNode(this.root, key);
    
    if (this.root.keys.length === 0) {
      if (this.root.isLeaf) {
        this.root = null;
      } else {
        this.root = this.root.children[0];
        if (this.root) {
          this.root.parent = undefined;
        }
      }
    }

    return deleted;
  }

  traverse(): T[] {
    const result: T[] = [];
    this.inOrderTraversal(this.root, result);
    return result;
  }

  getHeight(): number {
    return this.calculateHeight(this.root);
  }

  getRoot(): BTreeNode<T> | null {
    return this.root;
  }

  clear(): void {
    this.root = null;
  }

  isEmpty(): boolean {
    return this.root === null;
  }

  toArray(): T[] {
    return this.traverse();
  }

  // Helper method for visualization
  getTreeStructure(): any {
    return this.root;
  }

  private createNode(isLeaf: boolean): BTreeNode<T> {
    return {
      keys: [],
      children: [],
      isLeaf,
      parent: undefined
    };
  }

  private insertNonFull(node: BTreeNode<T>, key: T): void {
    let i = node.keys.length - 1;

    if (node.isLeaf) {
      node.keys.push(key);
      while (i >= 0 && this.compareFn(node.keys[i], key) > 0) {
        node.keys[i + 1] = node.keys[i];
        i--;
      }
      node.keys[i + 1] = key;
    } else {
      while (i >= 0 && this.compareFn(node.keys[i], key) > 0) {
        i--;
      }
      i++;

      if (node.children[i].keys.length === this.maxKeys) {
        this.splitChild(node, i);
        if (this.compareFn(node.keys[i], key) < 0) {
          i++;
        }
      }
      this.insertNonFull(node.children[i], key);
    }
  }

  private splitChild(parent: BTreeNode<T>, index: number): void {
    const fullChild = parent.children[index];
    const newChild = this.createNode(fullChild.isLeaf);
    const midIndex = Math.floor(this.maxKeys / 2);

    for (let j = midIndex + 1; j < this.maxKeys; j++) {
      newChild.keys.push(fullChild.keys[j]);
    }

    if (!fullChild.isLeaf) {
      for (let j = midIndex + 1; j <= this.maxKeys; j++) {
        newChild.children.push(fullChild.children[j]);
        if (fullChild.children[j]) {
          fullChild.children[j].parent = newChild;
        }
      }
      fullChild.children = fullChild.children.slice(0, midIndex + 1);
    }

    const midKey = fullChild.keys[midIndex];
    fullChild.keys = fullChild.keys.slice(0, midIndex);

    parent.children.splice(index + 1, 0, newChild);
    parent.keys.splice(index, 0, midKey);
    newChild.parent = parent;
  }

  private searchNode(node: BTreeNode<T> | null, key: T): boolean {
    if (node === null) {
      return false;
    }

    let i = 0;
    while (i < node.keys.length && this.compareFn(key, node.keys[i]) > 0) {
      i++;
    }

    if (i < node.keys.length && this.compareFn(key, node.keys[i]) === 0) {
      return true;
    }

    if (node.isLeaf) {
      return false;
    }

    return this.searchNode(node.children[i], key);
  }

  private inOrderTraversal(node: BTreeNode<T> | null, result: T[]): void {
    if (node === null) {
      return;
    }

    let i = 0;
    for (i = 0; i < node.keys.length; i++) {
      if (!node.isLeaf) {
        this.inOrderTraversal(node.children[i], result);
      }
      result.push(node.keys[i]);
    }

    if (!node.isLeaf) {
      this.inOrderTraversal(node.children[i], result);
    }
  }

  private calculateHeight(node: BTreeNode<T> | null): number {
    if (node === null) {
      return 0;
    }

    if (node.isLeaf) {
      return 1;
    }

    return 1 + this.calculateHeight(node.children[0]);
  }

  private deleteFromNode(node: BTreeNode<T>, key: T): boolean {
    let idx = this.findKey(node, key);

    if (idx < node.keys.length && this.compareFn(node.keys[idx], key) === 0) {
      if (node.isLeaf) {
        node.keys.splice(idx, 1);
        return true;
      } else {
        return this.deleteFromNonLeaf(node, idx);
      }
    } else if (!node.isLeaf) {
      const flag = (idx === node.keys.length);
      
      if (node.children[idx].keys.length < this.minKeys + 1) {
        this.fill(node, idx);
      }
      
      if (flag && idx > node.keys.length) {
        return this.deleteFromNode(node.children[idx - 1], key);
      } else {
        return this.deleteFromNode(node.children[idx], key);
      }
    }
    
    return false;
  }

  private deleteFromNonLeaf(node: BTreeNode<T>, idx: number): boolean {
    const key = node.keys[idx];
    
    if (node.children[idx].keys.length >= this.minKeys + 1) {
      const pred = this.getPredecessor(node, idx);
      node.keys[idx] = pred;
      return this.deleteFromNode(node.children[idx], pred);
    } else if (node.children[idx + 1].keys.length >= this.minKeys + 1) {
      const succ = this.getSuccessor(node, idx);
      node.keys[idx] = succ;
      return this.deleteFromNode(node.children[idx + 1], succ);
    } else {
      this.merge(node, idx);
      return this.deleteFromNode(node.children[idx], key);
    }
  }

  private getPredecessor(node: BTreeNode<T>, idx: number): T {
    let cur = node.children[idx];
    while (!cur.isLeaf) {
      cur = cur.children[cur.keys.length];
    }
    return cur.keys[cur.keys.length - 1];
  }

  private getSuccessor(node: BTreeNode<T>, idx: number): T {
    let cur = node.children[idx + 1];
    while (!cur.isLeaf) {
      cur = cur.children[0];
    }
    return cur.keys[0];
  }

  private fill(node: BTreeNode<T>, idx: number): void {
    if (idx !== 0 && node.children[idx - 1].keys.length >= this.minKeys + 1) {
      this.borrowFromPrev(node, idx);
    } else if (idx !== node.keys.length && node.children[idx + 1].keys.length >= this.minKeys + 1) {
      this.borrowFromNext(node, idx);
    } else {
      if (idx !== node.keys.length) {
        this.merge(node, idx);
      } else {
        this.merge(node, idx - 1);
      }
    }
  }

  private borrowFromPrev(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx];
    const sibling = node.children[idx - 1];
    
    child.keys.unshift(node.keys[idx - 1]);
    
    if (!child.isLeaf) {
      child.children.unshift(sibling.children[sibling.children.length - 1]);
      if (child.children[0]) {
        child.children[0].parent = child;
      }
      sibling.children.pop();
    }
    
    node.keys[idx - 1] = sibling.keys[sibling.keys.length - 1];
    sibling.keys.pop();
  }

  private borrowFromNext(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx];
    const sibling = node.children[idx + 1];
    
    child.keys.push(node.keys[idx]);
    
    if (!child.isLeaf) {
      child.children.push(sibling.children[0]);
      if (sibling.children[0]) {
        sibling.children[0].parent = child;
      }
      sibling.children.shift();
    }
    
    node.keys[idx] = sibling.keys[0];
    sibling.keys.shift();
  }

  private merge(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx];
    const sibling = node.children[idx + 1];
    
    child.keys.push(node.keys[idx]);
    
    for (let i = 0; i < sibling.keys.length; i++) {
      child.keys.push(sibling.keys[i]);
    }
    
    if (!child.isLeaf) {
      for (let i = 0; i < sibling.children.length; i++) {
        child.children.push(sibling.children[i]);
        if (sibling.children[i]) {
          sibling.children[i].parent = child;
        }
      }
    }
    
    node.keys.splice(idx, 1);
    node.children.splice(idx + 1, 1);
  }

  private findKey(node: BTreeNode<T>, key: T): number {
    let idx = 0;
    while (idx < node.keys.length && this.compareFn(node.keys[idx], key) < 0) {
      idx++;
    }
    return idx;
  }
}