import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data generator
const getInitialSeedData = () => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const userPasswordHash = bcrypt.hashSync('user123', salt);

  const users = [
    {
      id: 'usr-admin-1',
      name: 'Chef Admin (System)',
      email: 'admin@bitebyte.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      bio: 'Lead System Administrator & Executive Culinary Director of BiteByte.',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
      specialty: 'Culinary Direction & Quality Control',
      status: 'active',
      createdAt: new Date('2026-01-10T08:00:00Z').toISOString(),
    },
    {
      id: 'usr-user-1',
      name: 'Ronit Sharma',
      email: 'user@bitebyte.com',
      passwordHash: userPasswordHash,
      role: 'user',
      bio: 'Enthusiastic home cook and spice lover. Always testing new culinary techniques.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      specialty: 'Modern Indian Fusion & Tandoor',
      status: 'active',
      createdAt: new Date('2026-02-01T10:30:00Z').toISOString(),
    },
    {
      id: 'usr-user-2',
      name: 'Elena Rostova',
      email: 'elena@bitebyte.com',
      passwordHash: userPasswordHash,
      role: 'user',
      bio: 'Passionate Italian pastry chef and artisan pasta maker from Florence.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      specialty: 'Handmade Pasta & Desserts',
      status: 'active',
      createdAt: new Date('2026-02-15T12:00:00Z').toISOString(),
    },
    {
      id: 'usr-user-3',
      name: 'Marcus Chen',
      email: 'marcus@bitebyte.com',
      passwordHash: userPasswordHash,
      role: 'user',
      bio: 'Street food enthusiast specializing in wok hei techniques and dim sum delicacies.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      specialty: 'Cantonese & Szechuan Cuisine',
      status: 'active',
      createdAt: new Date('2026-02-20T14:45:00Z').toISOString(),
    },
    {
      id: 'usr-user-4',
      name: 'Sofia Morales',
      email: 'sofia@bitebyte.com',
      passwordHash: userPasswordHash,
      role: 'user',
      bio: 'Heritage Mexican cook bringing generational family recipes to modern kitchens.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      specialty: 'Oaxacan Moles & Birria',
      status: 'active',
      createdAt: new Date('2026-03-01T09:15:00Z').toISOString(),
    }
  ];

  const recipes = [
    {
      id: 'rec-1',
      title: 'Creamy Tuscan Garlic Chicken Linguine',
      description: 'Pan-seared tender chicken breast cooked in a velvety garlic parmesan sauce with sun-dried tomatoes and fresh baby spinach, tossed with al dente linguine.',
      category: 'Italian',
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: 'Medium',
      tags: ['Pasta', 'Comfort Food', 'Chicken', 'Dinner'],
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=800&auto=format&fit=crop&q=80',
      ingredients: [
        '400g Chicken breast, cut into cutlets',
        '250g Linguine or Fettuccine pasta',
        '1 cup Heavy cream',
        '1/2 cup Chicken bone broth',
        '4 cloves Fresh garlic, finely minced',
        '1/2 cup Sun-dried tomatoes, drained and julienned',
        '2 cups Fresh baby spinach',
        '1/2 cup Parmigiano-Reggiano, grated',
        '2 tbsp Extra virgin olive oil',
        '1 tsp Italian herb seasoning (oregano, basil, thyme)',
        'Salt and freshly cracked black pepper to taste'
      ],
      instructions: [
        'Season chicken breast fillets generously with salt, pepper, and Italian herb seasoning.',
        'Heat 2 tablespoons olive oil in a large skillet over medium-high heat. Sear chicken 5-6 minutes per side until golden brown and cooked through (165°F). Transfer to a warm cutting board.',
        'In the same skillet, sauté minced garlic for 1 minute until fragrant. Add sun-dried tomatoes and pour in chicken broth and heavy cream, deglazing the fond from the pan.',
        'Bring sauce to a gentle simmer for 3 minutes, then stir in grated parmesan cheese until smoothly melted.',
        'Fold in fresh baby spinach and allow it to wilt in the creamy sauce (about 2 minutes).',
        'Boil linguine in salted water until al dente, drain, and fold directly into the skillet with sliced chicken cutlets. Serve immediately with extra grated cheese!'
      ],
      authorId: 'usr-user-2',
      authorName: 'Elena Rostova',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'approved',
      adminFeedback: 'Exceptional recipe with clear measurements and appetizing photos!',
      views: 1420,
      createdAt: new Date('2026-03-05T11:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-05T11:00:00Z').toISOString()
    },
    {
      id: 'rec-2',
      title: 'Authentic Smoky Butter Chicken (Murgh Makhani)',
      description: 'Charred marinated chicken cooked in a rich, buttery, velvety tomato-cream gravy perfumed with green cardamom and crushed kasoori methi.',
      category: 'Indian',
      prepTime: 30,
      cookTime: 40,
      servings: 5,
      difficulty: 'Medium',
      tags: ['Indian', 'Gluten-Free', 'Curry', 'Crowd Pleaser'],
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
      ingredients: [
        '600g Boneless chicken thighs, cubed',
        '1/2 cup Greek yogurt',
        '1 tbsp Ginger-garlic paste',
        '1 tbsp Kashmiri chili powder',
        '1 tsp Garam masala powder',
        '4 large Vine tomatoes, pureed',
        '3 tbsp Salted butter',
        '1/2 cup Heavy cream',
        '1 tbsp Dried fenugreek leaves (Kasoori methi)',
        '1 tbsp Honey or raw sugar',
        '2 tbsp Mustard oil'
      ],
      instructions: [
        'Marinate chicken pieces with yogurt, ginger-garlic paste, Kashmiri chili, salt, and mustard oil for at least 30 minutes.',
        'Grill chicken in a smoking hot pan or broiler at 240°C for 10-12 minutes until charred at edges.',
        'Melt butter in a heavy saucepan, cook tomato puree with Kashmiri chili and ginger until oil separates.',
        'Puree gravy through a fine sieve for a silky restaurant-style texture.',
        'Return gravy to pan, stir in roasted chicken pieces, cream, garam masala, and honey.',
        'Rub kasoori methi between palms and sprinkle on top. Simmer for 7 minutes on low flame. Serve hot with garlic naan.'
      ],
      authorId: 'usr-user-1',
      authorName: 'Ronit Sharma',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'approved',
      adminFeedback: 'Well structured and delicious traditional preparation.',
      views: 2850,
      createdAt: new Date('2026-03-08T15:20:00Z').toISOString(),
      updatedAt: new Date('2026-03-08T15:20:00Z').toISOString()
    },
    {
      id: 'rec-3',
      title: 'Slow-Cooked Beef Birria Tacos with Consomé',
      description: 'Succulent braised beef chuck simmered in an aromatic guajillo & ancho chile broth, shredded into crispy corn tortillas with melted Oaxaca cheese and cilantro.',
      category: 'Mexican',
      prepTime: 25,
      cookTime: 120,
      servings: 6,
      difficulty: 'Hard',
      tags: ['Mexican', 'Tacos', 'Street Food', 'Beef'],
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
      ingredients: [
        '1.2 kg Beef chuck roast, cut into large cubes',
        '4 Dried guajillo chilies, stemmed & seeded',
        '2 Dried ancho chilies, stemmed & seeded',
        '1 Dried chipotle chile in adobo',
        '1 White onion, quartered',
        '5 cloves Garlic',
        '1 tsp Mexican oregano & 1 stick Mexican cinnamon',
        '12 White corn tortillas',
        '250g Oaxaca or Monterey Jack cheese, shredded',
        'Fresh chopped cilantro and diced white onion for garnish',
        'Lime wedges'
      ],
      instructions: [
        'Toast dried chilies in a dry pan for 1-2 minutes until fragrant, then soak in hot water for 15 minutes to rehydrate.',
        'Blend soaked chilies, adobo chile, onion, garlic, cumin, oregano, and cinnamon with 1 cup of soaking water into a smooth paste.',
        'Sear seasoned beef in a Dutch oven until browned on all sides.',
        'Pour chili marinade and beef stock over the meat. Cover and braise on low for 2.5 to 3 hours until fork-tender.',
        'Shred the beef and reserve the rich consomé broth in bowls for dipping.',
        'Dip corn tortillas into the top chili oil layer of the consomé, place on hot griddle, fill with Oaxaca cheese and shredded beef, fold into tacos, and fry until golden-crisp. Serve with consomé!'
      ],
      authorId: 'usr-user-4',
      authorName: 'Sofia Morales',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      status: 'approved',
      adminFeedback: 'Stunning recipe presentation and detailed step by step braising guide.',
      views: 3100,
      createdAt: new Date('2026-03-12T18:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-12T18:00:00Z').toISOString()
    },
    {
      id: 'rec-4',
      title: 'Classic Szechuan Dan Dan Noodles',
      description: 'Springy wheat noodles bathed in a fiery, nutty sesame-chili sauce, crowned with crispy spiced minced pork, preserved mustard greens, and crushed peanuts.',
      category: 'Asian',
      prepTime: 20,
      cookTime: 15,
      servings: 2,
      difficulty: 'Medium',
      tags: ['Noodles', 'Spicy', 'Szechuan', 'Quick Meal'],
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
      ingredients: [
        '200g Fresh Chinese ramen or wheat noodles',
        '150g Ground pork',
        '2 tbsp Ya Cai (Sichuan preserved mustard green)',
        '2 tbsp Chinese sesame paste or tahini',
        '2 tbsp Homemade Szechuan chili oil with sediment',
        '1.5 tbsp Light soy sauce & 1 tsp Dark soy sauce',
        '1/2 tsp Ground roasted Szechuan peppercorn powder',
        '1/2 cup Chicken stock',
        '2 tbsp Crushed roasted peanuts',
        'Chopped scallions and baby bok choy'
      ],
      instructions: [
        'Brown ground pork in a wok with Shaoxing wine, five-spice powder, and Ya Cai until deeply browned and crisp.',
        'Whisk together sesame paste, soy sauce, black vinegar, chili oil, garlic, and Szechuan pepper in serving bowls. Thin with hot chicken stock.',
        'Boil noodles and baby bok choy until noodles are chewy (approx 2 minutes). Drain well.',
        'Transfer noodles directly into prepared sauce bowls.',
        'Top with crispy pork, bok choy, toasted peanuts, and scallions. Toss thoroughly before eating!'
      ],
      authorId: 'usr-user-3',
      authorName: 'Marcus Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'approved',
      adminFeedback: 'Approved! Authentic taste profile and precise technique.',
      views: 1890,
      createdAt: new Date('2026-03-15T19:30:00Z').toISOString(),
      updatedAt: new Date('2026-03-15T19:30:00Z').toISOString()
    },
    {
      id: 'rec-5',
      title: 'Decadent Molten Dark Chocolate Lava Cakes',
      description: 'Individual individual chocolate cakes with delicate cake edges and an irresistibly warm, oozing molten dark chocolate center, dusted with powdered sugar.',
      category: 'Dessert',
      prepTime: 15,
      cookTime: 12,
      servings: 4,
      difficulty: 'Easy',
      tags: ['Baking', 'Chocolate', 'Dessert', 'Vegetarian'],
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
      ingredients: [
        '170g High quality 70% dark bittersweet chocolate',
        '115g Unsalted butter (1 stick)',
        '2 Whole eggs + 2 Egg yolks (room temperature)',
        '1/3 cup Granulated sugar',
        'pinch of Sea salt',
        '2 tbsp All-purpose flour',
        'Powdered confectioners sugar and fresh raspberries for serving'
      ],
      instructions: [
        'Preheat oven to 425°F (220°C). Butter four 6-ounce ramekins and dust with cocoa powder.',
        'Melt dark chocolate and butter together in a heatproof bowl set over simmering water until silky smooth.',
        'In a separate bowl, whisk eggs, egg yolks, sugar, and pinch of salt on high speed until pale and doubled in volume.',
        'Gently fold melted chocolate into the whipped eggs, then sift in flour and fold until just combined.',
        'Divide batter evenly into ramekins. Bake for exactly 11-12 minutes until sides are firm but centers still jiggle.',
        'Run a thin knife around edges, invert onto dessert plates, and serve immediately with vanilla bean gelato!'
      ],
      authorId: 'usr-user-2',
      authorName: 'Elena Rostova',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'approved',
      adminFeedback: 'Exquisite dessert recipe! Perfect timing instructions.',
      views: 4200,
      createdAt: new Date('2026-03-18T14:10:00Z').toISOString(),
      updatedAt: new Date('2026-03-18T14:10:00Z').toISOString()
    },
    {
      id: 'rec-6',
      title: 'Mediterranean Quinoa Buddha Bowl with Lemon Tahini',
      description: 'Nutrient-packed wholesome bowl loaded with fluffy herbed quinoa, crisp roasted chickpeas, cucumber ribbons, kalamata olives, cherry tomatoes, and creamy lemon-herb tahini drizzle.',
      category: 'Healthy',
      prepTime: 15,
      cookTime: 20,
      servings: 2,
      difficulty: 'Easy',
      tags: ['Vegan', 'Gluten-Free', 'Healthy', 'Meal Prep'],
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
      ingredients: [
        '1 cup Quinoa, cooked and cooled',
        '1 can (400g) Chickpeas, rinsed and roasted with smoked paprika',
        '1 cup English cucumber, diced',
        '1 cup Cherry tomatoes, halved',
        '1/3 cup Kalamata olives, pitted',
        '1/4 cup Pickled red onions',
        '3 tbsp Tahini paste',
        '2 tbsp Fresh lemon juice',
        '1 clove Garlic, grated',
        '3 tbsp Warm water to thin dressing',
        'Fresh dill and mint leaves'
      ],
      instructions: [
        'Toss chickpeas with olive oil, cumin, and smoked paprika. Roast at 200°C for 20 minutes until crisp.',
        'Whisk tahini, lemon juice, grated garlic, salt, and warm water until light and pourable.',
        'Arrange fluffy quinoa as the bowl base.',
        'Section with cucumber, cherry tomatoes, kalamata olives, roasted crispy chickpeas, and pickled onions.',
        'Drizzle generously with lemon tahini dressing and finish with fresh herbs.'
      ],
      authorId: 'usr-user-1',
      authorName: 'Ronit Sharma',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'approved',
      adminFeedback: 'Wholesome, healthy, and easy for beginners.',
      views: 950,
      createdAt: new Date('2026-03-22T08:30:00Z').toISOString(),
      updatedAt: new Date('2026-03-22T08:30:00Z').toISOString()
    },
    {
      id: 'rec-7',
      title: 'Fluffy Japanese Soufflé Pancakes',
      description: 'Cloud-like, pillow-soft soufflé pancakes whipped with stiff meringue peaks, cooked low and slow with steam, served with whipped butter and maple syrup.',
      category: 'Breakfast',
      prepTime: 20,
      cookTime: 15,
      servings: 2,
      difficulty: 'Medium',
      tags: ['Breakfast', 'Fluffy', 'Japanese', 'Sweet'],
      imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&auto=format&fit=crop&q=80',
      ingredients: [
        '2 Large eggs, separated',
        '1.5 tbsp Whole milk',
        '1 tsp Vanilla extract',
        '3 tbsp Cake flour, sifted',
        '1/2 tsp Baking powder',
        '2 tbsp Granulated sugar',
        '1 tbsp Water (for steaming in pan)',
        'Butter and pure maple syrup for serving'
      ],
      instructions: [
        'Whisk egg yolks with milk and vanilla until frothy. Sift in cake flour and baking powder, mix gently.',
        'In a clean glass bowl, whip egg whites with sugar gradually until stiff glossy peaks form.',
        'Fold 1/3 of the meringue into yolk batter to lighten, then fold remaining meringue gently without deflating.',
        'Heat non-stick pan on lowest heat with a touch of oil. Stack 2-3 dollops of batter high.',
        'Add a splash of water to pan, cover with lid and steam for 5 minutes. Flip gently, add splash of water, cover and cook 4 more minutes.',
        'Stack gently and serve immediately with butter, maple syrup, and powdered sugar!'
      ],
      authorId: 'usr-user-3',
      authorName: 'Marcus Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'pending', // Pending approval for Admin to review!
      adminFeedback: '',
      views: 310,
      createdAt: new Date('2026-04-01T09:00:00Z').toISOString(),
      updatedAt: new Date('2026-04-01T09:00:00Z').toISOString()
    },
    {
      id: 'rec-8',
      title: 'Oaxacan Chicken Tamales with Mole Negro',
      description: 'Handmade masa steamed in fragrant plantain leaves stuffed with slow-shredded chicken and rich, complex 24-ingredient Oaxacan black mole.',
      category: 'Mexican',
      prepTime: 60,
      cookTime: 90,
      servings: 8,
      difficulty: 'Hard',
      tags: ['Mexican', 'Authentic', 'Baking', 'Traditional'],
      imageUrl: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80',
      ingredients: [
        '1 kg Fresh masa para tamales (or masa harina)',
        '250g Pork lard or vegetable shortening, whipped fluffy',
        '1 cup Rich chicken stock',
        '500g Shredded poached chicken breast',
        '1.5 cups Oaxacan Mole Negro paste prepared with broth',
        'Fresh plantain leaves or soaked dried corn husks'
      ],
      instructions: [
        'Whip lard until white and fluffy like frosting. Gradually alternate beating in masa and warm stock.',
        'Toss shredded chicken into warm mole negro sauce until coated.',
        'Spread 3 tablespoons of masa dough onto softened plantain leaf squares.',
        'Add spoonful of chicken mole in center, fold leaves tightly to seal into rectangular packets.',
        'Steam in a tamale steamer for 75-90 minutes until dough easily releases from the leaf wrapper. Rest 10 minutes and enjoy.'
      ],
      authorId: 'usr-user-4',
      authorName: 'Sofia Morales',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      status: 'pending', // Pending approval for Admin to review!
      adminFeedback: '',
      views: 120,
      createdAt: new Date('2026-04-02T16:15:00Z').toISOString(),
      updatedAt: new Date('2026-04-02T16:15:00Z').toISOString()
    },
    {
      id: 'rec-9',
      title: 'Quick 15-Minute Garlic Chili Oil Crispy Egg Toast',
      description: 'Artisan sourdough griddled in sizzling garlic chili crisp, topped with jammy fried eggs, avocado slices, and microgreens.',
      category: 'Breakfast',
      prepTime: 5,
      cookTime: 10,
      servings: 1,
      difficulty: 'Easy',
      tags: ['Breakfast', 'Quick', 'Eggs', 'Vegetarian'],
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
      ingredients: [
        '2 Slices rustic sourdough bread',
        '2 Free-range eggs',
        '2 tbsp Spicy chili crisp oil',
        '1/2 Ripe avocado, mashed with lime',
        '1 tsp Toasted sesame seeds',
        'Flaky sea salt'
      ],
      instructions: [
        'Heat 1 tbsp chili crisp in a skillet over medium heat. Crack eggs directly into the oil.',
        'Spoon hot oil over egg whites until set and edges are golden lace crisp while yolks remain runny.',
        'Toast sourdough slices, spread mashed avocado on top.',
        'Place fried chili crisp eggs over avocado, sprinkle flaky salt, and drizzle with remaining skillet oil.'
      ],
      authorId: 'usr-user-1',
      authorName: 'Ronit Sharma',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'approved',
      adminFeedback: 'Great quick breakfast recipe for busy mornings!',
      views: 840,
      createdAt: new Date('2026-03-28T07:15:00Z').toISOString(),
      updatedAt: new Date('2026-03-28T07:15:00Z').toISOString()
    }
  ];

  const ratings = [
    {
      id: 'rat-1',
      recipeId: 'rec-1',
      userId: 'usr-user-1',
      userName: 'Ronit Sharma',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Made this for dinner last night and it tasted like a 5-star Italian restaurant! The sun-dried tomatoes balanced the rich cream sauce perfectly.',
      createdAt: new Date('2026-03-06T19:40:00Z').toISOString()
    },
    {
      id: 'rat-2',
      recipeId: 'rec-1',
      userId: 'usr-user-3',
      userName: 'Marcus Chen',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Super easy to follow. My whole family requested I make it again this weekend.',
      createdAt: new Date('2026-03-07T12:15:00Z').toISOString()
    },
    {
      id: 'rat-3',
      recipeId: 'rec-2',
      userId: 'usr-user-2',
      userName: 'Elena Rostova',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'The depth of flavor from charring the chicken first and the touch of kasoori methi is divine. Best butter chicken recipe on the web!',
      createdAt: new Date('2026-03-09T20:00:00Z').toISOString()
    },
    {
      id: 'rat-4',
      recipeId: 'rec-3',
      userId: 'usr-user-1',
      userName: 'Ronit Sharma',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Dipping the tortillas into the consomé before crisping them on the pan is a total game changer. Phenomenal!',
      createdAt: new Date('2026-03-13T21:10:00Z').toISOString()
    },
    {
      id: 'rat-5',
      recipeId: 'rec-5',
      userId: 'usr-user-4',
      userName: 'Sofia Morales',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: '11 minutes was the golden number for my oven. The center was pure melted chocolate heaven.',
      createdAt: new Date('2026-03-20T17:45:00Z').toISOString()
    }
  ];

  const settings = {
    platformName: 'BiteByte',
    tagline: 'Discover, Share & Savor Culinary Masterpieces',
    allowRegistration: true,
    autoApproveRecipes: false,
    maxUploadSizeMB: 5,
    maintenanceMode: false,
    contactEmail: 'admin@bitebyte.com',
    bannerNotice: 'Welcome to BiteByte! Explore curated authentic recipes from chefs worldwide.',
    categories: ['All', 'Italian', 'Indian', 'Mexican', 'Asian', 'Dessert', 'Healthy', 'Breakfast', 'American']
  };

  const activityLogs = [
    {
      id: 'log-1',
      type: 'user_registered',
      actorId: 'usr-user-1',
      actorName: 'Ronit Sharma',
      actorRole: 'user',
      details: 'Registered as a new chef member on BiteByte.',
      timestamp: new Date('2026-02-01T10:30:00Z').toISOString()
    },
    {
      id: 'log-2',
      type: 'recipe_submitted',
      actorId: 'usr-user-2',
      actorName: 'Elena Rostova',
      actorRole: 'user',
      details: 'Submitted new recipe: "Creamy Tuscan Garlic Chicken Linguine".',
      timestamp: new Date('2026-03-05T10:50:00Z').toISOString()
    },
    {
      id: 'log-3',
      type: 'recipe_approved',
      actorId: 'usr-admin-1',
      actorName: 'Chef Admin',
      actorRole: 'admin',
      details: 'Approved recipe "Creamy Tuscan Garlic Chicken Linguine".',
      timestamp: new Date('2026-03-05T11:00:00Z').toISOString()
    },
    {
      id: 'log-4',
      type: 'recipe_reviewed',
      actorId: 'usr-user-1',
      actorName: 'Ronit Sharma',
      actorRole: 'user',
      details: 'Rated 5 stars and reviewed "Creamy Tuscan Garlic Chicken Linguine".',
      timestamp: new Date('2026-03-06T19:40:00Z').toISOString()
    },
    {
      id: 'log-5',
      type: 'recipe_submitted',
      actorId: 'usr-user-3',
      actorName: 'Marcus Chen',
      actorRole: 'user',
      details: 'Submitted recipe "Fluffy Japanese Soufflé Pancakes" for review.',
      timestamp: new Date('2026-04-01T09:00:00Z').toISOString()
    },
    {
      id: 'log-6',
      type: 'recipe_submitted',
      actorId: 'usr-user-4',
      actorName: 'Sofia Morales',
      actorRole: 'user',
      details: 'Submitted recipe "Oaxacan Chicken Tamales with Mole Negro" for review.',
      timestamp: new Date('2026-04-02T16:15:00Z').toISOString()
    }
  ];

  return { users, recipes, ratings, settings, activityLogs };
};

// Database state management with file synchronization
class JSONDatabase {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.data = getInitialSeedData();
      this.save();
    } else {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure all collections exist
        if (!this.data.users) this.data.users = [];
        if (!this.data.recipes) this.data.recipes = [];
        if (!this.data.ratings) this.data.ratings = [];
        if (!this.data.settings) this.data.settings = {};
        if (!this.data.activityLogs) this.data.activityLogs = [];
      } catch (err) {
        console.error('Error reading db.json, generating default data:', err);
        this.data = getInitialSeedData();
        this.save();
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save to db.json:', err);
    }
  }

  logActivity(type, actor, details) {
    const log = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type,
      actorId: actor?.id || 'system',
      actorName: actor?.name || 'System',
      actorRole: actor?.role || 'system',
      details,
      timestamp: new Date().toISOString()
    };
    this.data.activityLogs.unshift(log);
    // Keep max 200 logs
    if (this.data.activityLogs.length > 200) {
      this.data.activityLogs.pop();
    }
    this.save();
    return log;
  }
}

export const db = new JSONDatabase();
export default db;
