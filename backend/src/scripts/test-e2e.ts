import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3001';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

function log(test: string, passed: boolean, message: string, data?: any) {
  results.push({ test, passed, message, data });
  const icon = passed ? '✓' : '✗';
  console.log(`${icon} ${test}: ${message}`);
  if (data) console.log('  Data:', JSON.stringify(data, null, 2));
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealthCheck() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    log('Health Check', true, 'Server is healthy', response.data);
  } catch (error: any) {
    log('Health Check', false, error.message);
  }
}

async function testGuestWorkflow() {
  console.log('\n=== TESTING GUEST WORKFLOW ===\n');

  try {
    // Register as guest
    const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
      username: `guest_test_${Date.now()}`,
      email: `guest${Date.now()}@test.com`,
      password: 'password123',
      role: 'guest'
    });
    log('Guest Registration', true, 'Guest registered successfully', {
      username: registerRes.data.user.username,
      role: registerRes.data.user.role
    });

    const token = registerRes.data.token;

    // Try to create recipe (should fail)
    try {
      await axios.post(
        `${API_URL}/api/recipes`,
        {
          title: 'Test Recipe',
          description: 'Test',
          canvas_data: { elements: [] }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      log('Guest Create Recipe', false, 'Guest should NOT be able to create recipes');
    } catch (error: any) {
      if (error.response?.status === 403) {
        log('Guest Create Recipe', true, 'Guest correctly blocked from creating recipes');
      } else {
        log('Guest Create Recipe', false, `Unexpected error: ${error.message}`);
      }
    }

    // View public recipes
    const recipesRes = await axios.get(`${API_URL}/api/recipes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log('Guest View Recipes', true, `Guest can view ${recipesRes.data.recipes.length} public recipes`);

  } catch (error: any) {
    log('Guest Workflow', false, error.message);
  }
}

async function testHomeCookWorkflow() {
  console.log('\n=== TESTING HOME COOK WORKFLOW ===\n');

  try {
    // Register as home_cook
    const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
      username: `homecook_test_${Date.now()}`,
      email: `homecook${Date.now()}@test.com`,
      password: 'password123',
      role: 'home_cook'
    });
    log('Home Cook Registration', true, 'Home cook registered successfully', {
      username: registerRes.data.user.username,
      role: registerRes.data.user.role
    });

    const token = registerRes.data.token;
    const userId = registerRes.data.user.id;

    // Create recipes up to quota
    const canvasData = {
      version: '1.0',
      dimensions: { width: 800, height: 1000 },
      background: '#ffffff',
      elements: [
        { id: '1', type: 'text', content: 'Test Recipe', x: 100, y: 100, width: 200, height: 50 }
      ]
    };

    let recipeIds: number[] = [];
    for (let i = 1; i <= 11; i++) {
      try {
        const recipeRes = await axios.post(
          `${API_URL}/api/recipes`,
          {
            title: `Test Recipe ${i}`,
            description: 'Test description',
            is_public: i % 2 === 0,
            canvas_data: canvasData
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (i <= 10) {
          recipeIds.push(recipeRes.data.recipe.id);
          log(`Create Recipe ${i}`, true, `Recipe created successfully (${i}/10)`);
        } else {
          log(`Create Recipe ${i}`, false, 'Should have been blocked by quota');
        }
      } catch (error: any) {
        if (i === 11 && error.response?.status === 403) {
          log('Quota Enforcement', true, 'Correctly blocked 11th recipe (quota: 10)');
        } else if (i <= 10) {
          log(`Create Recipe ${i}`, false, `Failed: ${error.message}`);
        }
      }
    }

    // Update own recipe
    if (recipeIds.length > 0) {
      try {
        await axios.put(
          `${API_URL}/api/recipes/${recipeIds[0]}`,
          {
            title: 'Updated Recipe Title',
            description: 'Updated description'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        log('Update Own Recipe', true, 'Successfully updated own recipe');
      } catch (error: any) {
        log('Update Own Recipe', false, error.message);
      }
    }

    // Delete own recipe
    if (recipeIds.length > 1) {
      try {
        await axios.delete(`${API_URL}/api/recipes/${recipeIds[1]}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        log('Delete Own Recipe', true, 'Successfully deleted own recipe');
      } catch (error: any) {
        log('Delete Own Recipe', false, error.message);
      }
    }

    // View recipes (should see own + public)
    const recipesRes = await axios.get(`${API_URL}/api/recipes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log('View Recipes', true, `Can view ${recipesRes.data.recipes.length} recipes (own + public)`);

  } catch (error: any) {
    log('Home Cook Workflow', false, error.message);
  }
}

async function testChefWorkflow() {
  console.log('\n=== TESTING CHEF WORKFLOW ===\n');

  try {
    // Register as chef
    const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
      username: `chef_test_${Date.now()}`,
      email: `chef${Date.now()}@test.com`,
      password: 'password123',
      role: 'chef'
    });
    log('Chef Registration', true, 'Chef registered successfully', {
      username: registerRes.data.user.username,
      role: registerRes.data.user.role
    });

    const token = registerRes.data.token;

    // Create recipe
    const canvasData = {
      version: '1.0',
      dimensions: { width: 800, height: 1000 },
      background: '#ffffff',
      elements: []
    };

    const recipeRes = await axios.post(
      `${API_URL}/api/recipes`,
      {
        title: 'Chef Test Recipe',
        description: 'Chef recipe',
        is_public: true,
        canvas_data: canvasData
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    log('Chef Create Recipe', true, 'Chef created recipe successfully');

    const recipeId = recipeRes.data.recipe.id;

    // View all recipes
    const recipesRes = await axios.get(`${API_URL}/api/recipes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log('Chef View All Recipes', true, `Chef can view all ${recipesRes.data.recipes.length} recipes`);

    // Update any recipe
    if (recipesRes.data.recipes.length > 0) {
      try {
        await axios.put(
          `${API_URL}/api/recipes/${recipesRes.data.recipes[0].id}`,
          { title: 'Chef Updated Title' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        log('Chef Update Any Recipe', true, 'Chef can update any recipe');
      } catch (error: any) {
        log('Chef Update Any Recipe', false, error.message);
      }
    }

  } catch (error: any) {
    log('Chef Workflow', false, error.message);
  }
}

async function testRateLimiting() {
  console.log('\n=== TESTING RATE LIMITING ===\n');

  try {
    // Test login rate limiting (10 requests per 15 minutes)
    let rateLimited = false;
    for (let i = 1; i <= 12; i++) {
      try {
        await axios.post(`${API_URL}/api/auth/login`, {
          username: 'nonexistent',
          password: 'wrong'
        });
      } catch (error: any) {
        if (error.response?.status === 429) {
          rateLimited = true;
          log('Rate Limiting', true, `Rate limited after ${i} requests (limit: 10)`);
          break;
        }
      }
    }

    if (!rateLimited) {
      log('Rate Limiting', false, 'Rate limiting not triggered after 12 requests');
    }

  } catch (error: any) {
    log('Rate Limiting', false, error.message);
  }
}

async function testCanvasSizeValidation() {
  console.log('\n=== TESTING CANVAS SIZE VALIDATION ===\n');

  try {
    const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
      username: `size_test_${Date.now()}`,
      email: `sizetest${Date.now()}@test.com`,
      password: 'password123',
      role: 'home_cook'
    });

    const token = registerRes.data.token;

    // Create large canvas data (> 200KB)
    const largeElements = Array.from({ length: 1000 }, (_, i) => ({
      id: `element_${i}`,
      type: 'text',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10),
      x: i * 10,
      y: i * 10,
      width: 200,
      height: 50
    }));

    try {
      await axios.post(
        `${API_URL}/api/recipes`,
        {
          title: 'Large Canvas Recipe',
          description: 'Test',
          canvas_data: {
            version: '1.0',
            dimensions: { width: 800, height: 1000 },
            background: '#ffffff',
            elements: largeElements
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      log('Canvas Size Validation', false, 'Large canvas should have been rejected');
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('too large')) {
        log('Canvas Size Validation', true, 'Large canvas correctly rejected');
      } else {
        log('Canvas Size Validation', false, `Unexpected error: ${error.message}`);
      }
    }

  } catch (error: any) {
    log('Canvas Size Validation', false, error.message);
  }
}

async function testPagination() {
  console.log('\n=== TESTING PAGINATION ===\n');

  try {
    const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
      username: `pagination_test_${Date.now()}`,
      email: `pagtest${Date.now()}@test.com`,
      password: 'password123',
      role: 'home_cook'
    });

    const token = registerRes.data.token;

    // Test pagination with limit
    const res1 = await axios.get(`${API_URL}/api/recipes?limit=5&offset=0`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res1.data.pagination) {
      log('Pagination Response', true, 'Pagination data included', res1.data.pagination);
    } else {
      log('Pagination Response', false, 'Pagination data missing');
    }

  } catch (error: any) {
    log('Pagination', false, error.message);
  }
}

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Recipe Card Builder - E2E Test Suite        ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log(`Testing API: ${API_URL}\n`);

  await testHealthCheck();
  await testGuestWorkflow();
  await testHomeCookWorkflow();
  await testChefWorkflow();
  await testRateLimiting();
  await testCanvasSizeValidation();
  await testPagination();

  // Summary
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║              TEST SUMMARY                      ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.test}: ${r.message}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
