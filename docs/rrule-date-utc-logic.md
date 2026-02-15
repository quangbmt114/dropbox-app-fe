# 📅 Date Matching with `rrule` (UTC, Date-Only Logic)

We use [`rrule`](https://github.com/jakubroztocil/rrule) to handle recurring time slot logic. However, our use case **only cares about the date** (e.g., `2025-06-17`) — **not the time of day**.  
To avoid unexpected bugs due to time zones or time comparisons, we normalize all time-related fields to **UTC at the start/end of day**.

---

## ✅ Why we use UTC + Ignore Time

| Problem | Solution |
|--------|----------|
| Time zones can shift recurrence to the wrong day (e.g., `2025-06-17T17:00Z` becomes `2025-06-18` in GMT+7) | We convert all dates to **UTC 00:00–23:59** range |
| `rrule` compares full DateTime (`dtstart`, `between`) – not just date | We **normalize `dtstart` and check date to UTC start-of-day** |
| JSON input may contain time, but we only care about the day it represents | We strip time by using `dayjs.utc(...).startOf('day')` |

---

## 🛠️ Implementation Strategy

```ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { RRule } from 'rrule';
dayjs.extend(utc);

// Normalize dtstart to UTC start-of-day (00:00)
const normalizedDtstart = dayjs.utc(timeSlot.dtstart).startOf('day').toDate();

// Normalize check date to full-day UTC range
const startDate = dayjs.utc(date).startOf('day').toDate();
const endDate = dayjs.utc(date).endOf('day').toDate();

const rrule = new RRule({
  freq: RRule.WEEKLY,
  dtstart: normalizedDtstart,
  byweekday: [RRule.MO, RRule.FR],
  // ...other options
});

// Check if date is within rule (by day only)
const matches = rrule.between(startDate, endDate, true).length > 0;
```