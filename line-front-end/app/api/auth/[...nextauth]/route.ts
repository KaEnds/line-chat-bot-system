import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { JWT } from "next-auth/jwt";

/**
 * นี่คือ URL ของ Graph API ที่เราจะยิง (เหมือนใน Graph Explorer)
 * เราขอข้อมูล 4 field นี้โดยเฉพาะ
 */
const MS_GRAPH_URL = "https://graph.microsoft.com/v1.0/me?$select=displayName,mail,onPremisesSamAccountName,department";

/**
 * ฟังก์ชันนี้จะ "ยิง" Graph API โดยใช้ Access Token
 * @param accessToken ตั๋วใบใหญ่ (Access Token) ที่ได้จาก Azure
 */
async function fetchGraphData(accessToken: string) {
  try {
    const response = await fetch(MS_GRAPH_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // ถ้าล้มเหลว (เช่น ยังไม่เปิดสิทธิ์ User.Read) ให้โยน Error
      throw new Error(`Graph API call failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching Graph data:", error);
    return null;
  }
}

export const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      
      // [สำคัญ!] นี่คือการ "อัปเกรด"
      // เราต้องขอ "scope" (สิทธิ์) เพิ่ม เพื่อไปยิง Graph API ครับ
      authorization: {
        params: {
          scope: "openid profile email User.Read", // <-- [เพิ่ม] User.Read
          prompt: "select_account", // <-- บังคับเลือกบัญชี
        },
      },
    }),
  ],

  // [สำคัญ!] นี่คือการ "ยกเครื่อง" callbacks ใหม่ทั้งหมด
  callbacks: {
    /**
     * Callback นี้ทำงาน "เฉพาะตอนล็อกอิน" (ครั้งแรกที่ได้ Token)
     * เราจะยิง Graph API "แค่ครั้งเดียว" ในจังหวะนี้ แล้วเก็บข้อมูลไว้ใน Token
     */
    async jwt({ token, account, profile }) {
      // ถ้าเป็นการล็อกอินครั้งแรก (มี `account` object)
      if (account) {
        // 1. ดึง Access Token (ตั๋วใบใหญ่) มา
        const accessToken = account.access_token;

        if (accessToken) {
          // 2. ยิง Graph API เพื่อเอาข้อมูล "เฉพาะ" ของเรา
          const graphData = await fetchGraphData(accessToken);

          if (graphData) {
            // 3. ยัดข้อมูลที่ได้ (เช่น รหัส นศ.) เข้าไปใน Token
            token.studentId = graphData.onPremisesSamAccountName;
            token.department = graphData.department;
          }
        }
      }
      // คืนค่า Token (ไม่ว่าจะเป็นการล็อกอินใหม่ หรือแค่เช็ก Session)
      return token;
    },

    /**
     * Callback นี้ทำงาน "ทุกครั้ง" ที่เรียก useSession()
     * มันจะคัดลอกข้อมูลจาก "Token" (ที่เราเพิ่งแก้) ไปใส่ใน "Session" (ฝั่ง Client)
     */
    async session({ session, token }) {
      // คัดลอกข้อมูลจาก token ไปยัง session.user
      // (เราต้องบอก TypeScript ให้รู้จัก field เหล่านี้ในไฟล์ .d.ts)
      session.user.studentId = token.studentId;
      session.user.department = token.department;
      
      return session;
    },
  },

  // (เหมือนเดิม) Logout เมื่อปิดเบราว์เซอร์
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },

  // (เหมือนเดิม) เปิด Debug mode (ถ้ายังไม่ได้ทำใน .env.local)
  debug: process.env.AUTH_DEBUG === "true",
});

export { handler as GET, handler as POST };