import { BTree } from './btree';

describe('BTree', () => {
  describe('constructor', () => {
    it('should create an empty B-tree with default order', () => {
      const tree = new BTree<number>();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.getHeight()).toBe(0);
    });

    it('should create an empty B-tree with specified order', () => {
      const tree = new BTree<number>(5);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should throw error for order less than 3', () => {
      expect(() => new BTree<number>(2)).toThrow('Order must be at least 3');
    });

    it('should accept custom compare function', () => {
      const reverseCompare = (a: number, b: number) => b - a;
      const tree = new BTree<number>(3, reverseCompare);
      expect(tree).toBeDefined();
    });
  });

  describe('insert', () => {
    it('should insert a single value', () => {
      const tree = new BTree<number>(3);
      tree.insert(10);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.search(10)).toBe(true);
    });

    it('should insert multiple values in order', () => {
      const tree = new BTree<number>(3);
      [1, 2, 3, 4, 5].forEach(val => tree.insert(val));
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should insert multiple values in reverse order', () => {
      const tree = new BTree<number>(3);
      [5, 4, 3, 2, 1].forEach(val => tree.insert(val));
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle node splits correctly', () => {
      const tree = new BTree<number>(3);
      // Order 3 B-tree: max 2 keys per node
      [1, 2, 3, 4, 5, 6, 7].forEach(val => tree.insert(val));
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(tree.getHeight()).toBeGreaterThan(1);
    });

    it('should handle duplicate insertions', () => {
      const tree = new BTree<number>(3);
      tree.insert(5);
      tree.insert(5);
      expect(tree.toArray()).toEqual([5, 5]);
    });
  });

  describe('search', () => {
    let tree: BTree<number>;

    beforeEach(() => {
      tree = new BTree<number>(3);
      [10, 20, 5, 6, 12, 30, 7, 17].forEach(val => tree.insert(val));
    });

    it('should find existing values', () => {
      expect(tree.search(10)).toBe(true);
      expect(tree.search(5)).toBe(true);
      expect(tree.search(30)).toBe(true);
    });

    it('should not find non-existing values', () => {
      expect(tree.search(15)).toBe(false);
      expect(tree.search(100)).toBe(false);
      expect(tree.search(-5)).toBe(false);
    });

    it('should return false for empty tree', () => {
      const emptyTree = new BTree<number>(3);
      expect(emptyTree.search(10)).toBe(false);
    });
  });

  describe('delete', () => {
    let tree: BTree<number>;

    beforeEach(() => {
      tree = new BTree<number>(3);
      [10, 20, 5, 6, 12, 30, 7, 17].forEach(val => tree.insert(val));
    });

    it('should delete leaf node values', () => {
      expect(tree.delete(6)).toBe(true);
      expect(tree.search(6)).toBe(false);
      expect(tree.toArray()).not.toContain(6);
    });

    it('should delete internal node values', () => {
      expect(tree.delete(10)).toBe(true);
      expect(tree.search(10)).toBe(false);
      expect(tree.toArray()).not.toContain(10);
    });

    it('should return false when deleting non-existing value', () => {
      expect(tree.delete(100)).toBe(false);
    });

    it('should handle deletion with borrowing from siblings', () => {
      const tree = new BTree<number>(5);
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(val => tree.insert(val));
      expect(tree.delete(3)).toBe(true);
      expect(tree.toArray()).toEqual([1, 2, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle deletion with merging', () => {
      const tree = new BTree<number>(3);
      [1, 2, 3, 4, 5].forEach(val => tree.insert(val));
      expect(tree.delete(2)).toBe(true);
      expect(tree.toArray()).toEqual([1, 3, 4, 5]);
    });

    it('should handle deleting root', () => {
      const tree = new BTree<number>(3);
      tree.insert(10);
      expect(tree.delete(10)).toBe(true);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('traverse', () => {
    it('should return empty array for empty tree', () => {
      const tree = new BTree<number>(3);
      expect(tree.traverse()).toEqual([]);
    });

    it('should traverse in sorted order', () => {
      const tree = new BTree<number>(3);
      const values = [50, 30, 70, 40, 60, 80, 20];
      values.forEach(val => tree.insert(val));
      expect(tree.traverse()).toEqual([20, 30, 40, 50, 60, 70, 80]);
    });

    it('should handle duplicates correctly', () => {
      const tree = new BTree<number>(3);
      [5, 3, 5, 7, 3].forEach(val => tree.insert(val));
      expect(tree.traverse()).toEqual([3, 3, 5, 5, 7]);
    });
  });

  describe('getHeight', () => {
    it('should return 0 for empty tree', () => {
      const tree = new BTree<number>(3);
      expect(tree.getHeight()).toBe(0);
    });

    it('should return 1 for single node tree', () => {
      const tree = new BTree<number>(3);
      tree.insert(10);
      tree.insert(20);
      expect(tree.getHeight()).toBe(1);
    });

    it('should increase height after splits', () => {
      const tree = new BTree<number>(3);
      // Force splits
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      expect(tree.getHeight()).toBeGreaterThan(1);
    });
  });

  describe('clear', () => {
    it('should clear all nodes', () => {
      const tree = new BTree<number>(3);
      [1, 2, 3, 4, 5].forEach(val => tree.insert(val));
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.toArray()).toEqual([]);
    });
  });

  describe('with strings', () => {
    it('should work with string values', () => {
      const tree = new BTree<string>(3);
      ['banana', 'apple', 'cherry', 'date'].forEach(val => tree.insert(val));
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry', 'date']);
      expect(tree.search('banana')).toBe(true);
      expect(tree.search('grape')).toBe(false);
    });
  });

  describe('with custom objects', () => {
    interface Person {
      id: number;
      name: string;
    }

    it('should work with custom compare function', () => {
      const compareById = (a: Person, b: Person) => a.id - b.id;
      const tree = new BTree<Person>(3, compareById);
      
      const people: Person[] = [
        { id: 3, name: 'Charlie' },
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ];
      
      people.forEach(person => tree.insert(person));
      const sorted = tree.toArray();
      expect(sorted.map(p => p.id)).toEqual([1, 2, 3]);
    });
  });

  describe('stress test', () => {
    it('should handle large number of insertions and deletions', () => {
      const tree = new BTree<number>(5);
      const uniqueValues = new Set<number>();
      
      // Insert 100 unique random values
      while (uniqueValues.size < 100) {
        const val = Math.floor(Math.random() * 10000);
        uniqueValues.add(val);
      }
      
      const values = Array.from(uniqueValues);
      values.forEach(val => tree.insert(val));
      
      // Verify all values are searchable
      values.forEach(val => {
        expect(tree.search(val)).toBe(true);
      });
      
      // Delete half of them
      const toDelete = values.slice(0, 50);
      toDelete.forEach(val => {
        tree.delete(val);
      });
      
      // Verify deleted values are gone
      toDelete.forEach(val => {
        expect(tree.search(val)).toBe(false);
      });
      
      // Verify remaining values are still there
      values.slice(50).forEach(val => {
        expect(tree.search(val)).toBe(true);
      });
    });
  });
});