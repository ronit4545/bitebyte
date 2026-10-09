const BASE_URL = 'http://localhost:5000';

const runTests = async () => {
  console.log('🚀 Starting BiteByte Platform Automated Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('🔹 Test Suite 1: System Health & Base Discovery');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', 'API Health check returns healthy');

    const publicRecipesRes = await fetch(`${BASE_URL}/api/recipes`);
    const publicRecipes = await publicRecipesRes.json();
    assert(publicRecipesRes.status === 200 && Array.isArray(publicRecipes.recipes) && publicRecipes.total >= 7,
      `Public recipe discovery loads ${publicRecipes.total} approved recipes`);

    // Search and filter test
    const searchRes = await fetch(`${BASE_URL}/api/recipes?search=chicken&category=Italian`);
    const searchData = await searchRes.json();
    assert(searchData.recipes.length >= 1, 'Discover Recipes search filter by keyword and category works');

    // 2. Authentication & Demo logins
    console.log('\n🔹 Test Suite 2: Authentication & User Portals');
    const demoUserRes = await fetch(`${BASE_URL}/api/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user' })
    });
    const demoUserData = await demoUserRes.json();
    assert(demoUserRes.status === 200 && demoUserData.token && demoUserData.user.role === 'user',
      'Demo User login succeeds');
    const userToken = demoUserData.token;

    // Profile Management: Form for updating personal information
    const updateProfileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Ronit Sharma (Master Chef)',
        bio: 'Award-winning spice blender and artisan chef.',
        specialty: 'Contemporary Indian & Tandoori Master'
      })
    });
    const updateProfileData = await updateProfileRes.json();
    assert(updateProfileRes.status === 200 && updateProfileData.message.includes('Profile details updated successfully!'),
      'Output: Confirmation message for successful profile update received');

    // 3. Recipe Sharing
    console.log('\n🔹 Test Suite 3: User Recipe Sharing, Rating & Comments');
    const newRecipeRes = await fetch(`${BASE_URL}/api/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        title: 'Authentic Kashmiri Rogan Josh with Saffron Rice',
        description: 'Tender braised lamb cooked in an aromatic crimson gravy infused with Kashmiri chilies, fennel, and dried ginger.',
        category: 'Indian',
        prepTime: 20,
        cookTime: 50,
        servings: 4,
        difficulty: 'Medium',
        ingredients: ['800g Mutton pieces', '1 cup Yogurt', '2 tbsp Kashmiri chili powder', '1 tsp Fennel powder'],
        instructions: ['Heat mustard oil in pan', 'Whisk yogurt with spices and simmer meat until tender', 'Serve with saffron basmati'],
        tags: ['Kashmiri', 'Gluten-Free', 'Comfort Food']
      })
    });
    const newRecipeData = await newRecipeRes.json();
    assert(newRecipeRes.status === 201 && newRecipeData.message.includes('successfully'),
      'Output: Confirmation message for successful recipe sharing received');
    const createdRecipeId = newRecipeData.recipe.id;

    // Rate and Comment:
    const rateRes = await fetch(`${BASE_URL}/api/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        recipeId: 'rec-1',
        rating: 5,
        comment: 'Tested this linguine recipe tonight, perfectly creamy and flavorful!'
      })
    });
    const rateData = await rateRes.json();
    assert(rateRes.status === 201 && rateData.message.includes('successfully'),
      'Output: Confirmation message for successful rating and comment submission received');

    // User Dashboard: Ratings and Comments retrieval
    const myRatingsRes = await fetch(`${BASE_URL}/api/ratings/my-ratings`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const myRatingsData = await myRatingsRes.json();
    assert(myRatingsRes.status === 200 && myRatingsData.length >= 1,
      'User Dashboard: Ratings and comments list retrieved successfully');

    // User Dashboard: Recipe Sharing History
    const historyRes = await fetch(`${BASE_URL}/api/recipes/history`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const historyData = await historyRes.json();
    assert(historyRes.status === 200 && historyData.length >= 1,
      'User Dashboard: Recipe sharing history list retrieved successfully');

    // 4. Admin Functionalities
    console.log('\n🔹 Test Suite 4: Admin Functionalities & Dashboard');
    const demoAdminRes = await fetch(`${BASE_URL}/api/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' })
    });
    const demoAdminData = await demoAdminRes.json();
    assert(demoAdminRes.status === 200 && demoAdminData.user.role === 'admin',
      'Demo Admin login succeeds');
    const adminToken = demoAdminData.token;

    // 4.1 Admin: User Management (Create user)
    const createUserRes = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Pastry Chef Pierre',
        email: `pierre.${Date.now()}@bitebyte.com`,
        role: 'user',
        password: 'Password123!'
      })
    });
    const createUserData = await createUserRes.json();
    assert(createUserRes.status === 201 && createUserData.message === 'User account created successfully!',
      'Admin User Management: Confirmation message for successful user creation');
    const createdUserId = createUserData.user.id;

    // Admin: User Management (Update user)
    const updateUserRes = await fetch(`${BASE_URL}/api/users/${createdUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Pastry Chef Pierre Escoffier',
        role: 'user',
        status: 'active'
      })
    });
    const updateUserData = await updateUserRes.json();
    assert(updateUserRes.status === 200 && updateUserData.message === 'User account updated successfully!',
      'Admin User Management: Confirmation message for successful user update');

    // Admin: User Management (Delete user)
    const deleteUserRes = await fetch(`${BASE_URL}/api/users/${createdUserId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const deleteUserData = await deleteUserRes.json();
    assert(deleteUserRes.status === 200 && deleteUserData.message === 'User account deleted successfully!',
      'Admin User Management: Confirmation message for successful user deletion');

    // 4.2 Admin: Recipe Management (Approve or reject recipes)
    // Approve recipe
    const approveRes = await fetch(`${BASE_URL}/api/admin/recipes/${createdRecipeId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'approved',
        adminFeedback: 'Approved for publication! Clear instructions.'
      })
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200 && approveData.recipeApprovalStatus === 'approved',
      'Admin Recipe Management: Output recipe approval status APPROVED received');

    // 4.3 Admin: System Settings
    const updateSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        platformName: 'BiteByte Elite',
        tagline: 'Authentic Culinary Recipes & Masterclasses',
        allowRegistration: true,
        autoApproveRecipes: false,
        bannerNotice: 'Welcome to BiteByte! Explore curated seasonal recipes from top chefs worldwide.'
      })
    });
    const updateSettingsData = await updateSettingsRes.json();
    assert(updateSettingsRes.status === 200 && updateSettingsData.message === 'System settings updated successfully!',
      'Admin System Settings: Confirmation message for successful settings update');

    // 4.4 Admin: Recipe Statistics
    const statsRes = await fetch(`${BASE_URL}/api/admin/statistics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.metrics && statsData.metrics.totalRecipes >= 8 && Array.isArray(statsData.categoryBreakdown),
      'Admin Recipe Statistics: Metrics and submission trends retrieved successfully');

    // 4.5 Admin: User Activity Monitoring
    const activityRes = await fetch(`${BASE_URL}/api/admin/activity`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const activityData = await activityRes.json();
    assert(activityRes.status === 200 && Array.isArray(activityData) && activityData.length > 0,
      'Admin User Activity Monitoring: Real-time update activity logs retrieved successfully');

    console.log(`\n========================================`);
    console.log(`🏆 Verification Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed === 0) {
      console.log('🎉 ALL PROJECT REQUIREMENTS VERIFIED AND FUNCTIONAL!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Test Exception:', err);
    process.exit(1);
  }
};

runTests();
