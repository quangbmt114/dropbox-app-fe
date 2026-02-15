### for component

```typescript
// order of defining hook usage in component
// state > callback > effect
// it means: useState, useRef, useImmer, …. > useMemo,… > useCallback, normal function,… > useEffect, useMount,…
// it makes code more readable and understandable

const [vara, setVarA] = useState(0);
const [varb, setVarB] = useState(0);

const aCallback = useCallback(() => {});
const bNormalFnc = () => {};
const cCallback = useCallback(() => {});

usEffect(() => {}, []);
usEffect(() => {}, [vara, varb]);
usEffect(() => {}, [varb]);
```

### for component

```
the import function have no prefix like action, utils,...

internal function should have prefix "handle"

external function should have prefix "on"

except some case like: function is render jsx
```

### for if else condition

```typescript
let a = undefined; // null or undefined or empty string or 0 or false

//  ====================
if (a == undefined) {
  return true;
}

//====>  should be
if (!a) return true;

//  ====================
if (a != undefined) {
  //   do something here A
}
if (!a) {
  //   do something here B
}

//====>  should be
if (a) {
  //   do something here A
  return;
}
// do something here B
//  ====================
```
