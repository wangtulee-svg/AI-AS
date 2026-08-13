const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('123456', 10);

  // ສ້າງ Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      password_hash: hashedPassword,
      full_name: 'Admin User',
      student_id: 'ADMIN001',
      faculty: 'Engineering',
      role: 'admin',
      is_verified: true,
    },
  });

  // ສ້າງ Student
  const student = await prisma.user.upsert({
    where: { email: 'student@university.edu' },
    update: {},
    create: {
      email: 'student@university.edu',
      password_hash: hashedPassword,
      full_name: 'Test Student',
      student_id: 'STU001',
      faculty: 'Engineering',
      role: 'student',
      year_of_study: 2,
      is_verified: true,
    },
  });

  console.log('✅ Users created');

  // ສ້າງວິຊາ
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { code: 'CS101' },
      update: {},
      create: {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        description: 'ພື້ນຖານວິທະຍາສາດຄອມພິວເຕີ',
        credits: 3,
        faculty: 'Engineering',
        semester: 1,
        year: 2024,
        lecturer_id: admin.id,
      },
    }),
    prisma.subject.upsert({
      where: { code: 'CS201' },
      update: {},
      create: {
        code: 'CS201',
        name: 'Data Structures',
        description: 'ໂຄງສ້າງຂໍ້ມູນ ແລະ ອະລະກອລິທຶມ',
        credits: 3,
        faculty: 'Engineering',
        semester: 2,
        year: 2024,
        lecturer_id: admin.id,
      },
    }),
    prisma.subject.upsert({
      where: { code: 'MA101' },
      update: {},
      create: {
        code: 'MA101',
        name: 'Calculus I',
        description: 'ແຄລຄູລັດ 1',
        credits: 4,
        faculty: 'Science',
        semester: 1,
        year: 2024,
      },
    }),
  ]);

  console.log('✅ Subjects created');

  // ສ້າງການລົງທະບຽນ
  for (const subject of subjects) {
    await prisma.enrollment.upsert({
      where: {
        user_id_subject_id_semester: {
          user_id: student.id,
          subject_id: subject.id,
          semester: '2024-S1',
        },
      },
      update: {},
      create: {
        user_id: student.id,
        subject_id: subject.id,
        semester: '2024-S1',
        status: 'enrolled',
      },
    });
  }

  console.log('✅ Enrollments created');

  // ສ້າງຕາຕະລາງຮຽນ
  const cs101 = await prisma.subject.findUnique({ where: { code: 'CS101' } });
  if (cs101) {
    await prisma.timetable.upsert({
      where: {
        user_id_day_of_week_start_time_end_time: {
          user_id: student.id,
          day_of_week: 'MON',
          start_time: new Date('2024-01-01T09:00:00Z'),
          end_time: new Date('2024-01-01T10:30:00Z'),
        },
      },
      update: {},
      create: {
        user_id: student.id,
        subject_id: cs101.id,
        day_of_week: 'MON',
        start_time: new Date('2024-01-01T09:00:00Z'),
        end_time: new Date('2024-01-01T10:30:00Z'),
        room: 'Room 201',
        semester: '2024-S1',
      },
    });
  }

  console.log('✅ Timetable created');

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });