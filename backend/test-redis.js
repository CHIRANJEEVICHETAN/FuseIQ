// Simple test script to verify Redis configuration
const { createClient } = require('redis');

async function testRedisConnection() {
  console.log('🔄 Testing Redis connection...');
  
  const client = createClient({
    url: 'redis-16854.c282.east-us-mz.azure.redns.redis-cloud.com:16854',
    socket: {
      connectTimeout: 5000,
      lazyConnect: true,
    }
  });

  client.on('error', (err) => {
    console.log('❌ Redis Client Error:', err.message);
  });

  client.on('connect', () => {
    console.log('🔄 Redis: Connecting...');
  });

  client.on('ready', () => {
    console.log('✅ Redis: Connected and ready');
  });

  try {
    await client.connect();
    
    // Test basic operations
    await client.set('test:key', 'test-value');
    const value = await client.get('test:key');
    console.log('✅ Redis test operation successful:', value);
    
    // Test with expiration
    await client.setEx('test:expiring', 10, 'expires-in-10s');
    const ttl = await client.ttl('test:expiring');
    console.log('✅ Redis TTL test successful:', ttl, 'seconds');
    
    // Cleanup
    await client.del('test:key', 'test:expiring');
    
    await client.quit();
    console.log('✅ Redis test completed successfully');
    
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    console.log('💡 Make sure Redis is running on localhost:6379');
    console.log('💡 You can start it with: docker-compose up -d redis');
  }
}

testRedisConnection();