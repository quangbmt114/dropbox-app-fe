# Cài đặt và Chạy project

Tài liệu hướng dẫn yêu cầu hệ thống, cài đặt và cách chạy frontend Dropbox Clone.

---

## 1. Yêu cầu hệ thống

| Thành phần     | Yêu cầu                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| **Node.js**    | >= 20.19.0 (khuyến nghị dùng version trong `.nvmrc`: 20.19.x)                                                 |
| **Yarn**       | 1.x (Classic)                                                                                                 |
| **Java (JRE)** | Chỉ cần khi **generate/cập nhật API client** từ OpenAPI (ví dụ OpenJDK 17). Không bắt buộc để chạy dev/build. |

---

## 2. Cài đặt

### 2.1. Clone và vào thư mục project

```bash
git clone <repository-url>
cd dropbox-app-fe
```

### 2.2. Chọn đúng phiên bản Node

Project dùng Node theo file `.nvmrc`:

```bash
nvm use
# hoặc
nvm install 20.19
nvm use 20.19
```

Kiểm tra:

```bash
node -v   # ví dụ: v20.19.6
yarn -v   # ví dụ: 1.22.x
```

### 2.3. Cài dependency

```bash
yarn install
```

### 2.4. Cấu hình biến môi trường

```bash
cp .env.example .env.local
```

Chỉnh `.env.local` cho đúng môi trường (URL backend, port, v.v.). Ví dụ:

- **Backend API**: `NEXT_PUBLIC_API_URL=http://localhost:7002` (hoặc URL backend thực tế)
- **Port frontend**: `NEXT_PUBLIC_CLIENT_PORT=4000`

---

## 3. Chạy project

### 3.1. Chế độ development

```bash
yarn dev
```

- Ứng dụng chạy tại: **http://localhost:4000**
- Hot reload khi sửa code.

### 3.2. Build production

```bash
yarn build
```

### 3.3. Chạy bản production (sau khi build)

```bash
yarn start
```

Ứng dụng chạy tại **http://localhost:4000**.

---

## 4. Cập nhật API client (khi backend đổi)

API client được generate từ OpenAPI (Swagger) của backend. Cần **Java** (ví dụ OpenJDK 17) để chạy generator.

### 4.1. Cài Java (chỉ cần 1 lần, khi muốn generate API)

**macOS (Homebrew):**

```bash
brew install openjdk@17
```

Thêm vào PATH (trong `~/.zshrc` hoặc `~/.bash_profile`):

```bash
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"   # Apple Silicon
# hoặc
export PATH="/usr/local/opt/openjdk@17/bin:$PATH"      # Intel Mac
```

Sau đó mở lại terminal hoặc chạy `source ~/.zshrc`.

**Lưu ý:** Script `generate:api` trong `package.json` đã set sẵn PATH cho Java (Apple Silicon). Nếu dùng Intel Mac hoặc cài Java ở chỗ khác, có thể cần sửa script cho đúng đường dẫn.

### 4.2. Tải schema và generate lại client

- **Backend phải đang chạy** và expose Swagger tại `http://localhost:7002/api-json` (hoặc chỉnh URL trong script/`download:schema` nếu backend khác port).

```bash
# Tải swagger.json từ backend + generate client
yarn update:api
```

Hoặc từng bước:

```bash
yarn download:schema   # curl swagger từ backend -> swagger.json
yarn generate:api      # generate TypeScript client vào src/api-service/generated
```

### 4.3. Xóa generated API và swagger (nếu cần)

```bash
yarn clean:api
```

---

## 5. Các lệnh thường dùng

| Lệnh              | Mô tả                                                      |
| ----------------- | ---------------------------------------------------------- |
| `yarn dev`        | Chạy dev server (port 4000)                                |
| `yarn build`      | Build production                                           |
| `yarn start`      | Chạy bản production (sau build)                            |
| `yarn lint`       | Chạy ESLint                                                |
| `yarn lint:fix`   | Tự sửa lỗi lint có thể                                     |
| `yarn format`     | Format code bằng Prettier                                  |
| `yarn type-check` | Kiểm tra TypeScript                                        |
| `yarn test`       | Chạy test (Vitest)                                         |
| `yarn test:run`   | Chạy test 1 lần                                            |
| `yarn update:api` | Tải schema + generate API client (cần Java + backend chạy) |

---

## 6. Lỗi thường gặp

### “Unable to locate a Java Runtime” khi chạy `yarn generate:api`

- Chưa cài Java hoặc Java chưa có trong PATH.
- Làm theo **mục 4.1** để cài OpenJDK 17 và thêm vào PATH.
- Trên Apple Silicon, script đã set sẵn PATH; nếu vẫn lỗi, thử mở terminal mới hoặc `source ~/.zshrc`.

### “openapi-generator-cli: command not found”

- Chạy `yarn install` để cài dependency (có `@openapitools/openapi-generator-cli`).
- Dùng `yarn generate:api` / `yarn update:api`, không gọi trực tiếp `openapi-generator-cli` từ shell nếu chưa thêm `node_modules/.bin` vào PATH.

### Backend không kết nối được / 404

- Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.local` trùng với URL và port backend (ví dụ `http://localhost:7002`).
- Đảm bảo backend đang chạy khi dùng app hoặc khi chạy `yarn update:api`.

### Node version không đúng

- Chạy `nvm use` (nếu dùng nvm) hoặc cài đúng Node >= 20.19.0 như trong `.nvmrc`.

---

## 7. Tóm tắt nhanh

```bash
# Cài đặt (1 lần)
nvm use
yarn install
cp .env.example .env.local
# Chỉnh .env.local nếu cần

# Chạy dev
yarn dev
# Mở http://localhost:4000

# (Tùy chọn) Cập nhật API khi backend đổi
# Cần: Java 17 + backend đang chạy
yarn update:api
```
