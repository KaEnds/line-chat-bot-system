# Librairy Frontend (Next.js Application)

ระบบเว็บแอปพลิเคชันส่วนหน้า (Frontend) พัฒนาด้วย **Next.js** สำหรับระบบของหอสมุด มจธ. รองรับการเชื่อมต่อกับฐานข้อมูล PostgreSQL และการยืนยันตัวตนผ่าน Azure AD (Microsoft Entra ID)

---

## 🛠️ โครงสร้างและการตั้งค่าระบบ (Configuration)

### 1. การตั้งค่าฐานข้อมูล (Database Configuration)
ระบบใช้ `pg` (PostgreSQL client) ในการเชื่อมต่อกับฐานข้อมูล โดยมีการตั้งค่า Connection Pool อยู่ที่ไฟล์ `line-front-end/lib/db.ts`:

```typescript
import { Pool, QueryResult } from 'pg';

// ตั้งค่า Connection Pool สำหรับเชื่อมต่อฐานข้อมูล
const pool = new Pool({
  host: 'postgres',
  port: 5432,
  database: 'librairy', 
  user: 'admin',
  password: 'adminpass'
});
```

### 2. การตั้งค่า Azure AD สำหรับ NextAuth (Authentication)
ระบบใช้ **NextAuth.js** ในการจัดการการลงชื่อเข้าใช้งานผ่าน Azure AD (Microsoft Entra ID) โดยมีตัวเลือกในการขอสิทธิ์ (Scope) เพิ่มเติมเพื่อใช้งาน Microsoft Graph API อยู่ที่ไฟล์ `line-front-end/app/api/auth/[...nextauth]/route.ts`:

```typescript
export const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      
      // [สำคัญ!] การขอ "scope" เพิ่มเติมเพื่อไปยิง Graph API
      authorization: {
        params: {
          scope: "openid profile email User.Read", // <-- [เพิ่ม] User.Read
          prompt: "select_account", // <-- บังคับให้ผู้ใช้เลือกบัญชีทุกครั้ง
        },
      },
    }),
  ],
});
```

### 3. การเตรียมไฟล์ Environment Variables (`.env.local`)
สร้างไฟล์ `.env.local` ไว้ที่ Root ของโปรเจกต์ซอร์สโค้ด (`./line-front-end/.env.local`) เพื่อเก็บค่าความลับของระบบ:

```env
NEXTAUTH_URL=https://form.librairy.work
NEXT_PUBLIC_BASE_URL=https://form.librairy.work
AZURE_AD_CLIENT_ID=your_azure_ad_client_id_here
AZURE_AD_CLIENT_SECRET=your_azure_ad_client_secret_here
AZURE_AD_TENANT_ID=your_azure_ad_tenant_id_here
CLOUDFLARE_TUNNEL_TOKEN=your_cloudflare_tunnel_token_here
```

---

## 🚀 วิธีการรันระบบ (How to Run)

ก่อนเริ่มใช้งาน ตรวจสอบให้แน่ใจว่าได้สร้าง Docker Network ภายนอกไว้เรียบร้อยแล้ว ด้วยคำสั่ง:
```bash
docker network create librairy-net
```

### วิธีที่ 1: การรันในโหมดพัฒนา (Development Mode) ด้วย Docker Compose
วิธีนี้เหมาะสำหรับการพัฒนาโปรแกรม (Local Development) เพราะมีการใช้ Bind Volumes ทำให้โค้ดอัปเดตแบบ Real-time และรันด้วยคำสั่ง `npm run dev`

1. **สั่งรันระบบด้วย Docker Compose:**
   ```bash
   docker compose up --build
   ```
2. **การทำงานเบื้องหลัง:**
   - ระบบจะ Build Target ไปที่ `builder` stage
   - จะทำการ Mount โฟลเดอร์ `./line-front-end` เข้าไปใน Container
   - ทำงานบน Port `3000`

### วิธีที่ 2: การรันในโหมด Production ด้วย Dockerfile (Multi-stage Build)
หากต้องการนำแอปพลิเคชันไปติดตั้งบนเซิร์ฟเวอร์จริง (Production) ควรใช้ Dockerfile แบบ Multi-stage Build เพื่อให้ได้ Container Image ที่มีขนาดเล็กและปลอดภัยที่สุด

1. **สั่ง Build Docker Image:**
   ```bash
   docker build -t librairy-frontend:latest .
   ```
2. **สั่งรัน Container:**
   ```bash
   docker run -d -p 3000:3000 --name librairy_frontend_prod librairy-frontend:latest
   ```

---

## 📦 รายละเอียด Docker Setup

### Dockerfile (Multi-stage Build)
Dockerfile ถูกแบ่งออกเป็น 2 Stages เพื่อลดขนาดของ Image ปลายทาง:
* **Stage 1 (Builder):** ใช้สำหรับติดตั้ง Dependencies ทั้งหมด (รวม DevDependencies) และทำการ `npm run build` โปรเจกต์ Next.js
* **Stage 2 (Runner):** คัดลอกเฉพาะไฟล์ที่จำเป็น (เช่น `.next`, `public`, `package.json`) และติดตั้งเฉพาะ Production Dependencies (`npm ci --omit=dev`) จากนั้นสั่งทำงานด้วย `npm run start`

### Docker Compose Configuration
ในไฟล์ `docker-compose.yml` มีการตั้งค่า Service หลักดังนี้:
* **frontend:** ทำการรัน Next.js ในโหมด `dev` บนเครือข่าย `librairy-net`
* **Cloudflare Tunnel (Optional):** มีการเตรียมคอนฟิกสำหรับต่ออุโมงค์เชื่อมตรงไปยัง Cloudflare หากต้องการเปิดใช้งาน ให้นำเครื่องหมาย `#` ออกในส่วนของ `cloudflared`

---

## 📝 หมายเหตุ
* ไฟล์ `.env.local` จะถูกคัดลอกเข้าไปทำงานในระบบตอน Build/Run (หากมีอยู่ในโฟลเดอร์ทำงาน)
