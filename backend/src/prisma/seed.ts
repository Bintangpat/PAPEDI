import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash("admin123", salt);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bootcampsewu.id" },
    update: {},
    create: {
      name: "Admin BootcampSewu",
      email: "admin@bootcampsewu.id",
      passwordHash,
      role: Role.admin,
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // Create mentor user
  const mentorHash = await bcrypt.hash("mentor123", salt);

  const mentor = await prisma.user.upsert({
    where: { email: "mentor@bootcampsewu.id" },
    update: {},
    create: {
      name: "Mentor BootcampSewu",
      email: "mentor@bootcampsewu.id",
      passwordHash: mentorHash,
      role: Role.mentor,
      bio: "Full-stack Developer & Educator",
    },
  });

  console.log(`✅ Mentor user created: ${mentor.email}`);

  // Create student user
  const studentHash = await bcrypt.hash("student123", salt);

  const student = await prisma.user.upsert({
    where: { email: "student@bootcampsewu.id" },
    update: {},
    create: {
      name: "Student Demo",
      email: "student@bootcampsewu.id",
      passwordHash: studentHash,
      role: Role.student,
    },
  });

  console.log(`✅ Student user created: ${student.email}`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Test accounts:");
  console.log("   Admin:   admin@bootcampsewu.id / admin123");
  console.log("   Mentor:  mentor@bootcampsewu.id / mentor123");
  console.log("   Student: student@bootcampsewu.id / student123");
}

seed()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
