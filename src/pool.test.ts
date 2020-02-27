import {Pool} from './pool';
import {Random} from './random';

const N = (a: number[]) => a.map(n => ({val: `k${n}`, weight: n}));
const someValues = N([3, 15, 2, 300, 16, 4, 1, 8, 50, 21, 58, 7, 4, 9, 78, 88]);
const otherValues = N([12, 1, 2, 30, 116, 42, 12, 18, 1, 1, 1, 1]);

describe('Pool', () => {
  describe('#indexOfParent()', () => {
    it('should return the parent for every child', () => {
      for (let i = 100; i > 0; --i) {
        const p = (i - 2 + (i % 2)) / 2;
        expect(Pool.indexOfParent(i)).toEqual(p);
      }
    });
    it('should return -1 for index <= 0', () => {
      expect(Pool.indexOfParent(0)).toEqual(-1);
      expect(Pool.indexOfParent(-100)).toEqual(-1);
    });
  });
  describe('#indicesOfChildren()', () => {
    it('should return children for every index', () => {
      for (let i = 100; i >= 0; --i) {
        const c = [i * 2 + 1, i * 2 + 2];
        expect(Pool.indicesOfChildren(i)).toEqual(c);
      }
    });
  });
});

describe('Pool instances', () => {
  describe('max heap', () => {
    describe('#bubbleUp(i)', () => {
      it('should move the element up the hierarchy', () => {
        const heap: Pool<string> = Pool.create();
        const arr = N([3, 2, 1]);
        arr.sort((a, b) => heap.cmp(a, b) * -1);
        heap.data = arr.slice(0);
        // move it
        heap.bubbleUp(2);
        expect(heap.data[0]).toEqual(arr[2]);
        expect(heap.data[2]).toEqual(arr[0]);
        // do not move it
        heap.bubbleUp(2);
        expect(arr.slice(0, 2)).not.toContain(heap.data[0]);
        expect(arr.slice(0, 2)).toContain(heap.data[2]);
      });
    });

    describe('#bubbleDown(i)', () => {
      it('should move the element down the hierarchy', () => {
        const heap: Pool<string> = Pool.create();
        const arr = N([3, 2, 1]);
        // reverse order
        arr.sort((a, b) => heap.cmp(a, b) * -1);
        heap.data = arr.slice(0);
        // move it
        heap.bubbleDown(0);
        expect(heap.data[2]).toEqual(arr[0]);
        expect(heap.data[0]).toEqual(arr[2]);
        // do not move it
        heap.bubbleDown(0);
        expect(arr.slice(0, 2)).not.toContain(heap.data[0]);
        expect(arr.slice(0, 2)).toContain(heap.data[2]);
      });
    });

    describe('#clone()', () => {
      it('should clone the heap to a new one', () => {
        const heap = createPool();
        const cloned = heap.clone();
        expect(cloned.length).toEqual(heap.length);
        expect(heap.data).not.toBe(cloned.data);
        expect(cloned.data).toEqual(heap.data);
        expect(cloned.limit).toEqual(heap.limit);
      });
    });

    describe('#cmp', () => {
      it('should return the comparison function', () => {
        const heap: Pool<string> = Pool.create();
        const fn = heap.cmp;
        expect(typeof fn).toBe('function');
        expect(heap.cmp).toEqual(fn);
      });
    });

    describe('#get(index)', () => {
      it('should return the element', () => {
        const heap = createPool();
        expect(heap.get(0)).toEqual(heap.peek());
        expect(heap.get(5)).toEqual(heap.data[5]);
      });
    });

    describe('#length', () => {
      it('should return the heap length', () => {
        expect(Pool.create().length).toEqual(0);
        expect(createPool().length).toEqual(100);
      });
    });

    //describe('#limit', () => {
    //it('should limit the heap length', () => {
    //const heap: Pool<string> = Pool.create();
    //heap.push(...someValues);
    //expect(heap.length).toEqual(someValues.length);
    //heap.limit = 5;
    //expect(heap.limit).toEqual(5);
    //expect(heap.length).toEqual(5);
    //heap.push(...otherValues);
    //expect(heap.length).toEqual(5);
    //expect(heap.check()).not.toBeDefined();
    //});
    //});

    describe('#peek()', () => {
      it('should return the top element of the heap', () => {
        const heap = createPool();
        expect(heap.peek().weight).toEqual(99);
      });
    });

    describe('#pop()', () => {
      it('should return undefined if heap is empty', () => {
        expect(Pool.create().pop()).toBeUndefined();
      });
      it('should extract the peek if length is 1', () => {
        const heap: Pool<string> = Pool.create();
        heap.push({val: 'k999', weight: 999});
        expect(heap.pop()!.weight).toBe(999);
        expect(heap.length).toBe(0);
      });
      it('should extract the element at the top, and keep the heap sorted', () => {
        const heap = createPool();
        const peek = heap.peek();
        const len = heap.length;
        expect(heap.pop()).toEqual(peek);
        expect(heap.length).toEqual(len - 1);
        expect(heap.check()).not.toBeDefined();
      });
    });

    describe('#push() / add, addAll', () => {
      it('should add one element to the heap, sorted', () => {
        const heap: Pool<string> = Pool.create();
        const len = heap.length;
        someValues.forEach(el => heap.push(el));
        expect(heap.length).toEqual(len + someValues.length);
        expect(heap.check()).not.toBeDefined();
      });
      it('should add many elements to the heap, sorted', () => {
        const heap: Pool<string> = Pool.create();
        heap.push(...someValues);
        const len = heap.length;
        heap.push(...otherValues);
        expect(heap.length).toEqual(len + otherValues.length);
        expect(heap.check()).not.toBeDefined();
      });
      it('should ignore empty calls', () => {
        const heap = createPool();
        const len = heap.length;
        expect(heap.push()).toBe(false);
        expect(heap.length).toEqual(len);
      });
    });

    describe('#remove()', () => {
      it('should skip an empty heap', () => {
        const heap: Pool<string> = Pool.create();
        expect(heap.remove()).toBe(false);
      });
      it('should skip if no element matches', () => {
        const heap = createPool();
        const len = heap.length;
        expect(heap.remove('k50000')).toBe(false);
        expect(heap.length).toBe(len);
      });
      it('should remove the peek if it matches and length is 1', () => {
        const heap: Pool<string> = Pool.create();
        heap.push({val: 'k999', weight: 999});
        expect(heap.remove('k999')).toBe(true);
        expect(heap.length).toBe(0);
      });
      it('should remove the leaf if it matches the end', () => {
        const heap = createPool();
        const len = heap.length;
        const bottom = heap.data[heap.length - 1];
        expect(heap.remove(bottom.val)).toBe(true);
        expect(heap.data[heap.length - 1]).not.toBe(bottom);
        expect(heap.length).toBe(len - 1);
        expect(heap.check()).not.toBeDefined();
      });
      it('should remove the element from the heap, and keep the heap sorted', () => {
        const heap: Pool<string> = Pool.create();
        heap.push(...someValues);
        const len = heap.length;
        expect(heap.remove(someValues[3].val)).toBe(true);
        expect(heap.remove(someValues[4].val)).toBe(true);
        expect(heap.length).toBe(len - 2);
        expect(heap.check()).not.toBeDefined();
      });
      it('whithout element, should remove the peek', () => {
        const heap = createPool();
        const peek = heap.peek();
        const len = heap.length;
        expect(heap.remove()).toBe(true);
        expect(heap.peek()).not.toBe(peek);
        expect(heap.length).toBe(len - 1);
        expect(heap.check()).not.toBeDefined();
      });
    });

    describe('#replace(element)', () => {
      it('should put the element at the top, and then sort it', () => {
        const heap = createPool();
        const len = heap.length;
        const peek = heap.peek();
        expect(heap.replace({val: 'k3000', weight: 3000})).toEqual(peek);
        expect(heap.length).toEqual(len);
        expect(heap.contains('k3000')).toBe(true);
        expect(heap.check()).not.toBeDefined();
      });
    });

    describe('#top(N)', () => {
      it('should return an empty array for an empty heap', () => {
        const heap: Pool<string> = Pool.create();
        expect(heap.top()).toEqual([]);
        expect(heap.top(10)).toEqual([]);
      });
      it('should return an empty array for invalid N', () => {
        const heap: Pool<string> = Pool.create();
        heap.push(...someValues);
        expect(heap.top(0)).toEqual([]);
        expect(heap.top(-10)).toEqual([]);
      });
      it('should return the top N (<= length) elements of the heap', () => {
        const heap: Pool<string> = Pool.create();
        heap.push(...someValues.concat(someValues));
        const top = heap.toArray().slice(0);
        top.sort(heap.cmp);
        expect(heap.top(1)).toEqual(top.slice(0, 1));
        expect(heap.top(6)).toEqual(top.slice(0, 6));
        expect(heap.top(someValues.length + 100)).toEqual(top);
      });
      it('should return the top element of the heap if no N', () => {
        const heap = createPool();
        expect(heap.top()).toEqual(heap.top(1));
      });
    });

    describe('#toArray()', () => {
      it('should return an array', () => {
        const heap: Pool<string> = Pool.create();
        heap.push(...someValues);
        const arr = heap.toArray();
        expect(Array.isArray(arr)).toBe(true);
        expect(arr.length).toEqual(someValues.length);
        const clonedValues = someValues.slice(0);
        clonedValues.sort(heap.cmp);
        arr.sort(heap.cmp);
        expect(arr).toEqual(clonedValues);
      });
    });

    describe('#toString()', () => {
      it('should return an string', () => {
        const heap: Pool<string> = Pool.create();
        heap.push(...someValues);
        expect(heap.toString().length).toEqual(someValues.toString().length);
      });
    });
  });
});

function createPool(size = 100) {
  const random = new Random();
  const nodes = [];
  for (let i = 0; i < size; i++) {
    nodes.push({val: `k${i}`, weight: i});
  }
  random.shuffle(nodes);
  const pool: Pool<string> = Pool.create();
  pool.push(...nodes);
  return pool;
}
