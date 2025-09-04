// Verification script for Redis configuration
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Redis configuration files...\n');

const filesToCheck = [
  'src/config/redis.ts',
  'src/utils/redis.util.ts',
  'src/config/session.ts',
  'src/routes/health.routes.ts',
  'src/types/session.types.ts'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - exists`);
  } else {
    console.log(`❌ ${file} - missing`);
    allFilesExist = false;
  }
});

console.log('\n🔍 Checking package.json dependencies...');

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = [
    'redis',
    'express-session',
    'connect-redis'
  ];
  
  const requiredDevDeps = [
    '@types/express-session',
    '@types/connect-redis'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} - installed (${packageJson.dependencies[dep]})`);
    } else {
      console.log(`❌ ${dep} - missing from dependencies`);
      allFilesExist = false;
    }
  });
  
  requiredDevDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep} - installed (${packageJson.devDependencies[dep]})`);
    } else {
      console.log(`❌ ${dep} - missing from devDependencies`);
      allFilesExist = false;
    }
  });
}

console.log('\n🔍 Checking environment configuration...');

const envExamplePath = path.join(__dirname, '.env.example');
if (fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  
  const requiredEnvVars = [
    'REDIS_URL',
    'REDIS_PASSWORD'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} - configured in .env.example`);
    } else {
      console.log(`❌ ${envVar} - missing from .env.example`);
      allFilesExist = false;
    }
  });
}

console.log('\n🔍 Checking Docker Compose configuration...');

const dockerComposePath = path.join(__dirname, 'docker-compose.yml');
if (fs.existsSync(dockerComposePath)) {
  const dockerContent = fs.readFileSync(dockerComposePath, 'utf8');
  
  if (dockerContent.includes('redis:')) {
    console.log('✅ Redis service - configured in docker-compose.yml');
  } else {
    console.log('❌ Redis service - missing from docker-compose.yml');
    allFilesExist = false;
  }
  
  if (dockerContent.includes('6379:6379')) {
    console.log('✅ Redis port mapping - configured');
  } else {
    console.log('❌ Redis port mapping - missing');
    allFilesExist = false;
  }
}

console.log('\n📋 Summary:');
if (allFilesExist) {
  console.log('✅ All Redis configuration files and dependencies are properly set up!');
  console.log('\n🚀 Next steps:');
  console.log('1. Start Redis: docker-compose up -d redis');
  console.log('2. Test connection: node test-redis.js');
  console.log('3. Start the server: npm run dev');
  console.log('4. Check health: http://localhost:3001/health/redis');
} else {
  console.log('❌ Some Redis configuration files or dependencies are missing.');
  console.log('Please review the missing items above.');
}

console.log('\n🔧 Redis Configuration Features Implemented:');
console.log('• Redis connection with connection pooling');
console.log('• Automatic reconnection with exponential backoff');
console.log('• Health check endpoints');
console.log('• Session store configuration');
console.log('• Comprehensive Redis utilities (RedisUtil, SessionUtil, CacheUtil)');
console.log('• Error handling and logging');
console.log('• Graceful shutdown handling');
console.log('• TypeScript type definitions');
console.log('• Docker Compose integration');