```typescript
// restrict find item in array to get info in a loop, use mapping instead of filter or find
// for ex:
const arr = [
  { id: 1, name: 'a' },
  { id: 2, name: 'b' },
];
const item = arr.find((item) => item.id === 1); // Bad

const item = arr.filter((item) => item.id === 1)[0]; // Bad
// ===================
const itemMap = arr.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

const item = itemMap[1]; // Good
```

### Common function

```typescript
// use transformToFullMap
// for ex:
const arr = [
  { id: 1, name: 'a' },
  { id: 2, name: 'b' },
];
const itemMap = transformToFullMap(arr, 'id');
const itemMap2 = transformToFullMap(arr, 'name');
// itemMap output: {1: {id: 1, name: 'a'}, 2: {id: 2, name: 'b'}}
// itemMap2 output: {a: {id: 1, name: 'a'}, b: {id: 2, name: 'b'}}

// use transformToMap
// for ex:
const arr = [
  { id: 1, name: 'a' },
  { id: 2, name: 'b' },
];
const itemMap = transformToMap(arr, 'id');
const itemMap2 = transformToMap(arr, 'name');
// itemMap output: {1: true, 2: true}
// itemMap2 output: {a: true, b: true}
```
