export interface IIterator<T> {
    hasNext(): boolean;
    next(): T | null;
}

export interface IAggregate<T> {
    createIterator(): IIterator<T>;
}
