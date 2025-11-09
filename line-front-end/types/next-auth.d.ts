import NextAuth, { DefaultSession, User } from "next-auth";
import { JWT } from "next-auth/jwt";

/**
 * นี่คือการ "ขยาย" (Extend) Type ของ NextAuth
 * เพื่อให้ TypeScript รู้จัก field ใหม่ที่เราเพิ่มเข้าไป
 */

declare module "next-auth" {
  /**
   * ขยาย Session object
   */
  interface Session {
    user: {
      /**
       * เพิ่ม field ใหม่ 2 field นี้เข้าไปใน `session.user`
       */
      studentId?: string | null;
      department?: string | null;
    } & DefaultSession["user"]; // <-- ยังคงเก็บ field เดิมไว้ (name, email, image)
  }

  /**
   * ขยาย User object (ถ้าจำเป็น)
   */
  interface User {
    studentId?: string | null;
    department?: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * ขยาย JWT (Token) object
   */
  interface JWT {
    /** เพิ่ม field ใหม่ 2 field นี้เข้าไปใน `token` */
    studentId?: string | null;
    department?: string | null;
  }
}