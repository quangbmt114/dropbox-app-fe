```typescript
interface SortSortableByOrder {
  order: number;
}

export const getNewOrder = <T extends SortSortableByOrder>(
  itemsList: T[],
  oldIndex: number = -1,
  newIndex: number,
  reverse: boolean = false
): number | undefined => {
  const step = reverse ? -10_000 : 10_000;
  if (newIndex != oldIndex && itemsList.length > 1) {
    let order = 0;
    if (newIndex == 0) {
      order = itemsList[0].order + step;
    } else if (newIndex >= itemsList.length - 1) {
      order = itemsList[itemsList.length - 1].order - step;
    } else {
      let i1 = newIndex - 1,
        i2 = newIndex + 1;
      if (oldIndex - newIndex == 1) {
        i2 = newIndex;
      } else if (oldIndex - newIndex == -1) {
        i1 = newIndex;
      }
      order = Math.floor((itemsList[i1].order + itemsList[i2].order) / 2) + (newIndex > oldIndex ? -2 : 2);
    }
    return order;
  }
};
```