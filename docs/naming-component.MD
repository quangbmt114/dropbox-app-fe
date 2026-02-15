### for connect between redux with component

> the component should have name to export, it will help to vscode suggest the name of component when import

```typescript
const ComponentA = () => {
  return <div>ComponentA</div>;
};

const mapStateToProps = (state: any) => {
  return {};
};

export default connect(mapStateToProps)(ComponentA); // Bad, vscode cannot suggest the name of component when import
```

```typescript
// should $ComponentA or other name
const $ComponentA = () => {
  return <div>ComponentA</div>;
};

const mapStateToProps = (state: any) => {
  return {};
};

const ComponentA = connect(mapStateToProps)($ComponentA);

export default ComponentA; // Good, vscode can suggest the name of component when import

// OR

export const ComponentA = connect(mapStateToProps)($ComponentA); // // Good, vscode can suggest the name of component when import
```
