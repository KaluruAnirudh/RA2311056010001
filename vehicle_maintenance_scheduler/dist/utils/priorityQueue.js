export class MinPriorityQueue {
    items = [];
    get size() {
        return this.items.length;
    }
    peek() {
        return this.items[0];
    }
    push(item, priority) {
        this.items.push({ item, priority });
        this.bubbleUp(this.items.length - 1);
    }
    pop() {
        if (this.items.length === 0) {
            return undefined;
        }
        const root = this.items[0];
        const last = this.items.pop();
        if (this.items.length > 0 && last) {
            this.items[0] = last;
            this.bubbleDown(0);
        }
        return root;
    }
    toSortedDescending() {
        return [...this.items].sort((left, right) => right.priority - left.priority);
    }
    bubbleUp(index) {
        let current = index;
        while (current > 0) {
            const parent = Math.floor((current - 1) / 2);
            if (this.items[parent].priority <= this.items[current].priority) {
                break;
            }
            [this.items[parent], this.items[current]] = [this.items[current], this.items[parent]];
            current = parent;
        }
    }
    bubbleDown(index) {
        let current = index;
        while (true) {
            const left = current * 2 + 1;
            const right = current * 2 + 2;
            let smallest = current;
            if (left < this.items.length &&
                this.items[left].priority < this.items[smallest].priority) {
                smallest = left;
            }
            if (right < this.items.length &&
                this.items[right].priority < this.items[smallest].priority) {
                smallest = right;
            }
            if (smallest === current) {
                break;
            }
            [this.items[current], this.items[smallest]] = [
                this.items[smallest],
                this.items[current]
            ];
            current = smallest;
        }
    }
}
