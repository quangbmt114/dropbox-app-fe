# 🔄 PAGE RELOAD INVESTIGATION

## Vấn đề
Khi login, page bị reload → Redux store reset → token mất

## Các nguyên nhân có thể xảy ra

### 1. ❌ Form Submit không được handle đúng
**Triệu chứng:**
- Khi click "Sign in", page reload như submit form thông thường
- URL không thay đổi, chỉ reload lại `/login`

**Nguyên nhân:**
- Form `onSubmit` không có `e.preventDefault()`
- `react-hook-form`'s `handleSubmit` không được gọi đúng

**Đã fix:**
- ✅ Thêm log vào LoginForm để track form submit
- ✅ react-hook-form tự động prevent default

### 2. ❌ React Strict Mode mount component 2 lần
**Triệu chứng:**
- Trong console thấy logs bị duplicate
- Component mount → unmount → mount lại

**Nguyên nhân:**
- `next.config.js` có `reactStrictMode: true`
- React 18 mount component 2 lần trong dev mode

**Đã fix:**
- ✅ Fix useCallback dependencies (thêm `dispatch, setError, router`)
- ✅ Fix useEffect dependencies (thêm `isAuthenticated, router`)

### 3. ❌ Next.js Fast Refresh reload page
**Triệu chứng:**
- Sau khi save code, page reload
- Không phải do click login mà do file change

**Không phải vấn đề:**
- Fast refresh chỉ chạy khi save file
- Không chạy khi click button

### 4. ❌ Navigation gây full page reload
**Triệu chứng:**
- `router.push('/dashboard')` gây reload thay vì client-side navigation
- Có thể do Next.js router issue

**Để check:**
- Xem logs: nếu StoreProvider mount lại sau `router.push()` → có reload
- Nếu không mount lại → không reload, chỉ là client-side navigation

### 5. ❌ Redux Persist gây issue
**Triệu chứng:**
- Persist rehydrate conflict với navigation
- Store bị reset khi navigate

**Đã add logs:**
- ✅ Track persist lifecycle trong StoreProvider
- ✅ Track token before/after navigation

---

## Cách xác định nguyên nhân

### Test 1: Check Form Submit
**Steps:**
1. Mở console (F12)
2. Login
3. Tìm log: `[LoginForm] Form submit event triggered`

**Kết quả:**
- ✅ **Nếu thấy log** → Form được handle đúng, không reload
- ❌ **Nếu KHÔNG thấy log + page reload** → Form submit không được prevent

### Test 2: Check Component Lifecycle
**Steps:**
1. Mở console
2. Login
3. Đếm số lần thấy: `[LoginFeature] Component rendering`

**Kết quả:**
- ✅ **2-3 lần** (strict mode) → Bình thường
- ❌ **>3 lần sau khi click login** → Có reload

### Test 3: Check Navigation
**Steps:**
1. Login thành công
2. Tìm logs theo thứ tự:
```
[LoginFeature] Navigating to dashboard...
[LoginFeature] Component unmounting
[DashboardFeature] Mounting
```

**Kết quả:**
- ✅ **Thấy unmount → mount Dashboard** → Client-side navigation OK
- ❌ **Thấy `[StoreProvider] Component mounted` sau navigation** → Full reload!

### Test 4: Check Token Persistence
**Steps:**
1. Login thành công
2. Check logs:
```
[LoginFeature] Store state after login: { hasToken: true, token: '...' }
[LoginFeature] Navigating to dashboard...
[DashboardFeature] Mounting: { hasToken: ??? }
```

**Kết quả:**
- ✅ **hasToken: true ở Dashboard** → Token không mất
- ❌ **hasToken: false ở Dashboard** → Token bị mất!

---

## Các fix đã implement

### Fix 1: LoginFeature.tsx
```typescript
// BEFORE
const onSubmit = useCallback(async (data) => { ... }, []); // ❌ Missing deps

// AFTER
const onSubmit = useCallback(async (data) => { ... }, [dispatch, setError, router]); // ✅
```

### Fix 2: LoginFeature.tsx useEffect
```typescript
// BEFORE
useEffect(() => {
  if (isAuthenticated) router.push('/dashboard');
}, []); // ❌ Missing deps

// AFTER
useEffect(() => {
  if (isAuthenticated) router.push('/dashboard');
}, [isAuthenticated, router]); // ✅
```

### Fix 3: Thêm logs toàn bộ
- LoginFeature: render, mount, unmount
- LoginForm: form submit
- Auth actions: login flow
- DashboardFeature: mount state

---

## Expected Logs (NO RELOAD)

```
# 1. Initial Mount
[StoreProvider] Component mounted
[PersistGate] BEFORE LIFT
[PersistGate] AFTER LIFT
[LoginFeature] Component rendering
[LoginFeature] Component mounted, isAuthenticated: false

# 2. User clicks Login
[LoginForm] Form submit event triggered
[LoginForm] Event default prevented by react-hook-form
[LoginFeature] Login form submitted
[authActions.login] Calling API...
[authActions.login] Login successful, setting auth...
[setAuth reducer] Setting auth: { hasUser: true, hasToken: true }
[LoginFeature] Login result: { success: true }
[LoginFeature] Store state after login: { hasToken: true, ... }
[LoginFeature] Navigating to dashboard...

# 3. Navigation (NO RELOAD!)
[LoginFeature] Component unmounting
[DashboardFeature] Component rendering
[DashboardFeature] Mounting - Initial auth state: { hasToken: true, ... }

# ✅ NO [StoreProvider] Component mounted → NO RELOAD!
```

---

## Expected Logs (WITH RELOAD - BUG!)

```
# 1-2. Same as above...

[LoginFeature] Navigating to dashboard...
[LoginFeature] Component unmounting

# ❌ BUG: StoreProvider mounts again!
[StoreProvider] Component mounted
[PersistGate] BEFORE LIFT - State: { auth: { accessToken: null } }  ← TOKEN MẤT!
[PersistGate] AFTER LIFT
[DashboardFeature] Mounting: { hasToken: false }  ← TOKEN MẤT!
```

---

## Next Steps

1. ✅ **Run app**: `npm run dev`
2. ✅ **Open console**: F12
3. ✅ **Login** và quan sát logs
4. ✅ **Tìm**: 
   - Có `[LoginForm] Form submit event triggered` không?
   - Có `[StoreProvider] Component mounted` xuất hiện 2 lần không?
   - Token có trong state khi mount Dashboard không?

5. ✅ **Report kết quả** để tôi phân tích tiếp!
