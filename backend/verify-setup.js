const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifySetup() {
  try {
    console.log('🔍 Verifying database setup...\n');

    // Check departments
    const departments = await prisma.department.findMany();
    console.log(`📊 Departments: ${departments.length} found`);
    departments.forEach(dept => {
      console.log(`  - ${dept.name} (${dept.isActive ? 'Active' : 'Inactive'})`);
    });

    // Check users
    const users = await prisma.user.findMany({
      include: { department: true }
    });
    console.log(`\n👥 Users: ${users.length} found`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.department?.name || 'No Department'}`);
    });

    console.log('\n✅ Database setup verification completed successfully!');
  } catch (error) {
    console.error('❌ Error verifying setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySetup();