### Using tree shaking import for lodash

```typescript
import { get } from 'lodash'; // Bad
import { orderBy } from 'lodash'; // Bad

// should be
import get from 'lodash/get';
import orderBy from 'lodash/orderBy';
```
