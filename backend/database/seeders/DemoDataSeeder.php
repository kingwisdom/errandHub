<?php

namespace Database\Seeders;

use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\Category;
use App\Models\Message;
use App\Models\PortfolioItem;
use App\Models\Review;
use App\Models\ServiceListing;
use App\Models\ServiceRequest;
use App\Models\ServiceRequestStatus;
use App\Models\User;
use App\Models\VerificationRequest;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        if (User::count() > 0) {
            $this->command->info('Users already exist. Wiping and re-seeding...');
            $this->command->call('migrate:fresh', ['--seed' => false]);
            $this->command->call(RoleSeeder::class);
            $this->command->call(CategorySeeder::class);
        }

        $categories = Category::whereNull('parent_id')->get();
        $allCategories = Category::all();

        $groceries = $allCategories->firstWhere('name', 'Groceries') ?? $allCategories->first();
        $delivery = $allCategories->firstWhere('name', 'Document delivery') ?? $allCategories->skip(1)->first();
        $furniture = $allCategories->firstWhere('name', 'Furniture assembly') ?? $allCategories->skip(2)->first();
        $plumber = $allCategories->firstWhere('name', 'Plumber') ?? $allCategories->skip(3)->first();
        $airport = $allCategories->firstWhere('name', 'Airport pickup') ?? $allCategories->skip(4)->first();
        $shopper = $allCategories->firstWhere('name', 'Personal shopper') ?? $allCategories->skip(5)->first();
        $cleaning = $allCategories->firstWhere('name', 'House cleaning') ?? $allCategories->skip(6)->first();
        $electric = $allCategories->firstWhere('name', 'Electrician') ?? $allCategories->skip(7)->first();
        $painting = $allCategories->firstWhere('name', 'Painting') ?? $allCategories->skip(8)->first();
        $moving = $allCategories->firstWhere('name', 'Moving help') ?? $allCategories->skip(9)->first();
        $tutoring = $allCategories->firstWhere('name', 'Tutoring') ?? $allCategories->first();
        $landscaping = $allCategories->firstWhere('name', 'Landscaping') ?? $allCategories->first();
        $petCare = $allCategories->firstWhere('name', 'Pet care') ?? $allCategories->first();
        $techSupport = $allCategories->firstWhere('name', 'Computer repair') ?? $allCategories->first();
        $photography = $allCategories->firstWhere('name', 'Photography') ?? $allCategories->first();

        // ═══════════════════════════════════════════════════════
        //  SUPER ADMIN
        // ═══════════════════════════════════════════════════════

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super-admin',
            'is_verified' => true,
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('super-admin');

        // ═══════════════════════════════════════════════════════
        //  CLIENTS (8)
        // ═══════════════════════════════════════════════════════

        $clientData = [
            ['name' => 'Alice Johnson', 'email' => 'alice@example.com', 'phone' => '+1-555-0101'],
            ['name' => 'Bob Smith', 'email' => 'bob@example.com', 'phone' => '+1-555-0102'],
            ['name' => 'Carol Davis', 'email' => 'carol@example.com', 'phone' => '+1-555-0106'],
            ['name' => 'David Park', 'email' => 'david@example.com', 'phone' => '+1-555-0107'],
            ['name' => 'Emma Wilson', 'email' => 'emma@example.com', 'phone' => '+1-555-0108'],
            ['name' => 'Frank Liu', 'email' => 'frank@example.com', 'phone' => '+1-555-0109'],
            ['name' => 'Grace Kim', 'email' => 'grace@example.com', 'phone' => '+1-555-0110'],
            ['name' => 'Henry Taylor', 'email' => 'henry@example.com', 'phone' => '+1-555-0111'],
        ];

        $clients = [];
        foreach ($clientData as $i => $data) {
            $c = User::create([
                ...$data,
                'password' => bcrypt('password'),
                'role' => 'client',
                'is_verified' => $i < 5,
                'email_verified_at' => $i < 5 ? now()->subDays(rand(1, 30)) : null,
                'phone_verified_at' => $i < 4 ? now()->subDays(rand(1, 15)) : null,
            ]);
            $c->assignRole('client');
            $clients[] = $c;
        }

        // ═══════════════════════════════════════════════════════
        //  AGENTS (8)
        // ═══════════════════════════════════════════════════════

        $agentData = [
            [
                'user' => ['name' => 'Carlos Rivera', 'email' => 'carlos@example.com', 'phone' => '+1-555-0103'],
                'profile' => ['bio' => 'Experienced errand runner with 5+ years in shopping, delivery, and personal assistance. Reliable and fast.', 'skills' => [$groceries->id, $delivery->id, $shopper->id, $furniture->id], 'languages' => ['English', 'Spanish'], 'coverage_area' => 'Downtown, Midtown, Westside', 'vehicle' => 'Car', 'experience_years' => 5, 'completed_jobs_count' => 47, 'is_online' => true, 'profile_completion_score' => 95],
            ],
            [
                'user' => ['name' => 'Diana Chen', 'email' => 'diana@example.com', 'phone' => '+1-555-0104'],
                'profile' => ['bio' => 'Handyman and repair specialist. I can fix almost anything around the house or office. Licensed and insured.', 'skills' => [$plumber->id, $furniture->id, $electric->id], 'languages' => ['English', 'Mandarin'], 'coverage_area' => 'Eastside, Northside, Downtown', 'vehicle' => 'Van', 'experience_years' => 8, 'completed_jobs_count' => 89, 'is_online' => false, 'profile_completion_score' => 90],
            ],
            [
                'user' => ['name' => 'Elena Foster', 'email' => 'elena@example.com', 'phone' => '+1-555-0105'],
                'profile' => ['bio' => 'Your go-to for event planning, airport pickups, and transportation. Friendly and detail-oriented.', 'skills' => [$airport->id, $cleaning->id, $moving->id], 'languages' => ['English', 'French'], 'coverage_area' => 'City-wide', 'vehicle' => 'Car', 'experience_years' => 3, 'completed_jobs_count' => 34, 'is_online' => true, 'profile_completion_score' => 85],
            ],
            [
                'user' => ['name' => 'James O\'Brien', 'email' => 'james@example.com', 'phone' => '+1-555-0112'],
                'profile' => ['bio' => 'Professional painter with 10 years experience. Interior and exterior. Free quotes.', 'skills' => [$painting->id, $furniture->id], 'languages' => ['English'], 'coverage_area' => 'Northside, Westside', 'vehicle' => 'Truck', 'experience_years' => 10, 'completed_jobs_count' => 62, 'is_online' => true, 'profile_completion_score' => 88],
            ],
            [
                'user' => ['name' => 'Priya Patel', 'email' => 'priya@example.com', 'phone' => '+1-555-0113'],
                'profile' => ['bio' => 'Tech-savvy helper. Computer repair, smart home setup, and IT support for homes and small businesses.', 'skills' => [$techSupport->id, $electric->id], 'languages' => ['English', 'Hindi', 'Gujarati'], 'coverage_area' => 'Downtown, Eastside', 'vehicle' => null, 'experience_years' => 4, 'completed_jobs_count' => 28, 'is_online' => false, 'profile_completion_score' => 75],
            ],
            [
                'user' => ['name' => 'Marcus Brown', 'email' => 'marcus@example.com', 'phone' => '+1-555-0114'],
                'profile' => ['bio' => 'Landscaping and garden maintenance expert. Lawns, hedges, irrigation systems, and seasonal cleanups.', 'skills' => [$landscaping->id, $cleaning->id], 'languages' => ['English', 'Portuguese'], 'coverage_area' => 'Suburbs, Northside', 'vehicle' => 'Truck', 'experience_years' => 7, 'completed_jobs_count' => 55, 'is_online' => true, 'profile_completion_score' => 82],
            ],
            [
                'user' => ['name' => 'Sophie Martin', 'email' => 'sophie@example.com', 'phone' => '+1-555-0115'],
                'profile' => ['bio' => 'Professional photographer and pet sitter. I capture moments and care for your furry friends.', 'skills' => [$photography->id, $petCare->id], 'languages' => ['English', 'French'], 'coverage_area' => 'City-wide', 'vehicle' => 'Car', 'experience_years' => 6, 'completed_jobs_count' => 41, 'is_online' => true, 'profile_completion_score' => 92],
            ],
            [
                'user' => ['name' => 'Tom Nguyen', 'email' => 'tom@example.com', 'phone' => '+1-555-0116'],
                'profile' => ['bio' => 'Moving and assembly specialist. Quick, careful, and affordable. Furniture assembly is my specialty.', 'skills' => [$moving->id, $furniture->id, $delivery->id], 'languages' => ['English', 'Vietnamese'], 'coverage_area' => 'City-wide', 'vehicle' => 'Van', 'experience_years' => 4, 'completed_jobs_count' => 31, 'is_online' => false, 'profile_completion_score' => 78],
            ],
        ];

        $agents = [];
        $profiles = [];
        foreach ($agentData as $i => $data) {
            $a = User::create([
                ...$data['user'],
                'password' => bcrypt('password'),
                'role' => 'agent',
                'is_verified' => $i < 6,
                'email_verified_at' => $i < 6 ? now()->subDays(rand(1, 60)) : null,
                'phone_verified_at' => $i < 5 ? now()->subDays(rand(1, 30)) : null,
            ]);
            $a->assignRole('agent');
            $agents[] = $a;

            $p = AgentProfile::create([
                'user_id' => $a->id,
                ...$data['profile'],
                'available_hours' => ['weekdays 8am-6pm', 'weekends 9am-3pm'],
                'avg_response_time' => rand(5, 30),
                'avg_completion_time' => rand(30, 180),
            ]);
            $profiles[] = $p;
        }

        // ═══════════════════════════════════════════════════════
        //  VERIFICATION REQUESTS (10)
        // ═══════════════════════════════════════════════════════

        $verifTypes = ['government_id', 'address', 'business'];
        $verifStatuses = ['pending', 'approved', 'rejected', 'approved', 'pending', 'pending', 'approved', 'rejected', 'pending', 'pending'];

        foreach ($agents as $i => $agent) {
            if ($i >= 10) break;
            $v = VerificationRequest::create([
                'user_id' => $agent->id,
                'type' => $verifTypes[$i % 3],
                'documents' => [
                    "verifications/doc_" . $agent->id . "_1.jpg",
                    "verifications/doc_" . $agent->id . "_2.jpg",
                ],
                'status' => $verifStatuses[$i],
                'admin_note' => $verifStatuses[$i] === 'rejected' ? 'Document was blurry. Please resubmit.' : null,
                'reviewed_by' => $verifStatuses[$i] !== 'pending' ? $admin->id : null,
                'reviewed_at' => $verifStatuses[$i] !== 'pending' ? now()->subDays(rand(1, 5)) : null,
            ]);
        }

        // Add verifications for some clients too
        foreach ([$clients[0], $clients[2]] as $client) {
            VerificationRequest::create([
                'user_id' => $client->id,
                'type' => 'government_id',
                'documents' => ["verifications/doc_" . $client->id . "_1.jpg"],
                'status' => 'pending',
            ]);
        }

        // ═══════════════════════════════════════════════════════
        //  SERVICE LISTINGS (20)
        // ═══════════════════════════════════════════════════════

        $listingsData = [
            ['agent' => 0, 'cat' => $groceries, 'title' => 'Grocery Shopping & Delivery', 'desc' => 'I will shop for your groceries at any store and deliver to your door. Fresh produce guaranteed.', 'price_type' => 'fixed', 'price' => 25, 'loc' => 'Downtown', 'radius' => 10, 'tags' => ['groceries', 'shopping', 'delivery'], 'dur' => 60, 'status' => 'active'],
            ['agent' => 0, 'cat' => $delivery, 'title' => 'Document & Parcel Delivery', 'desc' => 'Same-day document and small parcel delivery across the city. Secure and trackable.', 'price_type' => 'fixed', 'price' => 15, 'loc' => 'Downtown', 'radius' => 15, 'tags' => ['delivery', 'documents', 'courier'], 'dur' => 45, 'status' => 'active'],
            ['agent' => 0, 'cat' => $shopper, 'title' => 'Personal Shopping Assistant', 'desc' => 'Need a personal shopper? I can help pick gifts, clothes, or anything you need.', 'price_type' => 'hourly', 'price' => 20, 'loc' => 'Downtown', 'radius' => 8, 'tags' => ['shopping', 'gifts', 'personal'], 'dur' => 120, 'status' => 'active'],
            ['agent' => 1, 'cat' => $plumber, 'title' => 'Plumbing Repairs & Installation', 'desc' => 'Licensed plumber with 8 years experience. Sinks, faucets, pipes, water heaters.', 'price_type' => 'hourly', 'price' => 50, 'loc' => 'Eastside', 'radius' => 20, 'tags' => ['plumbing', 'repair', 'installation'], 'dur' => 120, 'status' => 'active'],
            ['agent' => 1, 'cat' => $furniture, 'title' => 'Furniture Assembly', 'desc' => 'I will assemble any flat-pack furniture quickly and correctly. I bring my own tools.', 'price_type' => 'fixed', 'price' => 40, 'loc' => 'Eastside', 'radius' => 15, 'tags' => ['assembly', 'furniture', 'ikea'], 'dur' => 90, 'status' => 'active'],
            ['agent' => 1, 'cat' => $electric, 'title' => 'Electrical Repairs & Installation', 'desc' => 'Licensed electrician. Wiring, outlets, light fixtures, breaker panels.', 'price_type' => 'hourly', 'price' => 60, 'loc' => 'Eastside', 'radius' => 20, 'tags' => ['electrical', 'wiring', 'repair'], 'dur' => 90, 'status' => 'active'],
            ['agent' => 2, 'cat' => $airport, 'title' => 'Airport Pickup & Drop-off', 'desc' => 'Reliable airport transportation. I will pick you up or drop you off with a smile.', 'price_type' => 'fixed', 'price' => 30, 'loc' => 'City-wide', 'radius' => 30, 'tags' => ['airport', 'transport', 'pickup'], 'dur' => 60, 'status' => 'active'],
            ['agent' => 2, 'cat' => $cleaning, 'title' => 'Deep Cleaning Service', 'desc' => 'Thorough deep cleaning for apartments and houses. Kitchen, bathrooms, living areas.', 'price_type' => 'fixed', 'price' => 80, 'loc' => 'City-wide', 'radius' => 15, 'tags' => ['cleaning', 'deep clean', 'housekeeping'], 'dur' => 180, 'status' => 'active'],
            ['agent' => 3, 'cat' => $painting, 'title' => 'Interior Painting Service', 'desc' => 'Professional interior painting. Walls, ceilings, trim. Clean lines and quality finish.', 'price_type' => 'hourly', 'price' => 45, 'loc' => 'Northside', 'radius' => 15, 'tags' => ['painting', 'interior', 'walls'], 'dur' => 240, 'status' => 'active'],
            ['agent' => 3, 'cat' => $furniture, 'title' => 'Custom Shelving & Carpentry', 'desc' => 'Custom shelving units, bookcases, and small carpentry projects. Quality craftsmanship.', 'price_type' => 'negotiable', 'price' => 75, 'loc' => 'Westside', 'radius' => 12, 'tags' => ['carpentry', 'shelving', 'custom'], 'dur' => 180, 'status' => 'active'],
            ['agent' => 4, 'cat' => $techSupport, 'title' => 'Computer Repair & Setup', 'desc' => 'Virus removal, hardware upgrades, OS installation, smart home setup.', 'price_type' => 'hourly', 'price' => 40, 'loc' => 'Downtown', 'radius' => 10, 'tags' => ['computer', 'tech', 'repair'], 'dur' => 60, 'status' => 'active'],
            ['agent' => 4, 'cat' => $electric, 'title' => 'Smart Home Setup', 'desc' => 'Smart lights, thermostats, cameras, and locks. Full installation and configuration.', 'price_type' => 'fixed', 'price' => 100, 'loc' => 'Eastside', 'radius' => 15, 'tags' => ['smart home', 'installation', 'tech'], 'dur' => 120, 'status' => 'paused'],
            ['agent' => 5, 'cat' => $landscaping, 'title' => 'Lawn Mowing & Garden Care', 'desc' => 'Regular lawn maintenance, hedge trimming, garden cleanup. Keep your yard looking great.', 'price_type' => 'fixed', 'price' => 35, 'loc' => 'Suburbs', 'radius' => 20, 'tags' => ['lawn', 'garden', 'maintenance'], 'dur' => 60, 'status' => 'active'],
            ['agent' => 5, 'cat' => $cleaning, 'title' => 'Gutter Cleaning', 'desc' => 'Thorough gutter cleaning and inspection. Prevent water damage to your home.', 'price_type' => 'fixed', 'price' => 50, 'loc' => 'Northside', 'radius' => 15, 'tags' => ['gutters', 'cleaning', 'home'], 'dur' => 90, 'status' => 'active'],
            ['agent' => 6, 'cat' => $photography, 'title' => 'Event Photography', 'desc' => 'Professional photography for events, portraits, and product shots. Fast turnaround.', 'price_type' => 'hourly', 'price' => 75, 'loc' => 'City-wide', 'radius' => 25, 'tags' => ['photography', 'events', 'portraits'], 'dur' => 180, 'status' => 'active'],
            ['agent' => 6, 'cat' => $petCare, 'title' => 'Pet Sitting & Dog Walking', 'desc' => 'Reliable pet sitting and dog walking. Your pets will love me!', 'price_type' => 'hourly', 'price' => 18, 'loc' => 'City-wide', 'radius' => 10, 'tags' => ['pets', 'dog walking', 'sitting'], 'dur' => 60, 'status' => 'active'],
            ['agent' => 7, 'cat' => $moving, 'title' => 'Moving & Heavy Lifting', 'desc' => 'Help with moves, furniture rearrangement, and heavy lifting. Strong and careful.', 'price_type' => 'hourly', 'price' => 30, 'loc' => 'City-wide', 'radius' => 20, 'tags' => ['moving', 'lifting', 'heavy'], 'dur' => 240, 'status' => 'active'],
            ['agent' => 7, 'cat' => $furniture, 'title' => 'IKEA & Flat-Pack Assembly', 'desc' => 'Fast and accurate flat-pack furniture assembly. Bring your instructions, I bring the tools.', 'price_type' => 'fixed', 'price' => 45, 'loc' => 'City-wide', 'radius' => 15, 'tags' => ['assembly', 'furniture', 'ikea'], 'dur' => 90, 'status' => 'active'],
            ['agent' => 0, 'cat' => $groceries, 'title' => 'Bulk Shopping Service', 'desc' => 'Costco, Sam\'s Club, or wholesale shopping trips. I pick up bulk items for you.', 'price_type' => 'fixed', 'price' => 35, 'loc' => 'Midtown', 'radius' => 12, 'tags' => ['bulk', 'shopping', 'wholesale'], 'dur' => 90, 'status' => 'active'],
            ['agent' => 2, 'cat' => $moving, 'title' => 'Small Move Assistance', 'desc' => 'Help with small moves, apartment transitions, and furniture delivery.', 'price_type' => 'hourly', 'price' => 28, 'loc' => 'City-wide', 'radius' => 20, 'tags' => ['moving', 'delivery', 'help'], 'dur' => 180, 'status' => 'active'],
        ];

        $listings = [];
        foreach ($listingsData as $data) {
            $svc = ServiceListing::create([
                'agent_id' => $agents[$data['agent']]->id,
                'category_id' => $data['cat']->id,
                'title' => $data['title'],
                'description' => $data['desc'],
                'price_type' => $data['price_type'],
                'starting_price' => $data['price'],
                'is_negotiable' => true,
                'location' => $data['loc'],
                'latitude' => 40.7128 + (mt_rand(-50, 50) / 1000),
                'longitude' => -74.0060 + (mt_rand(-50, 50) / 1000),
                'coverage_radius' => $data['radius'],
                'availability' => ['Mon-Fri 8am-6pm', 'Sat 9am-3pm'],
                'tags' => $data['tags'],
                'experience_years' => $agents[$data['agent']]->agentProfile->experience_years,
                'estimated_duration' => $data['dur'],
                'status' => $data['status'],
            ]);
            $listings[] = $svc;
        }

        // ═══════════════════════════════════════════════════════
        //  SERVICE REQUESTS (25) — all statuses represented
        // ═══════════════════════════════════════════════════════

        $requestsData = [
            // COMPLETED requests (6)
            ['client' => 0, 'agent' => 0, 'cat' => $groceries, 'title' => 'Weekly Grocery Run', 'desc' => 'Need someone to pick up my weekly groceries from FreshMart.', 'status' => 'completed', 'priority' => 'medium', 'loc' => 'FreshMart Downtown', 'days_ago' => 3, 'budget' => [20, 30]],
            ['client' => 1, 'agent' => 0, 'cat' => $delivery, 'title' => 'Deliver Contract Documents', 'desc' => 'Deliver signed contract documents to the law office.', 'status' => 'completed', 'priority' => 'urgent', 'loc' => '456 Oak Avenue', 'days_ago' => 5, 'budget' => [15, 25]],
            ['client' => 2, 'agent' => 2, 'cat' => $airport, 'title' => 'Airport Pickup - Flight AA1234', 'desc' => 'Pick up my mother from the airport. Flight AA1234 at Terminal 2.', 'status' => 'completed', 'priority' => 'high', 'loc' => 'International Airport', 'days_ago' => 7, 'budget' => [25, 40]],
            ['client' => 3, 'agent' => 1, 'cat' => $furniture, 'title' => 'Assemble IKEA Bookshelf', 'desc' => 'Need help assembling an IKEA BILLY bookcase.', 'status' => 'completed', 'priority' => 'low', 'loc' => '123 Main St', 'days_ago' => 10, 'budget' => [30, 50]],
            ['client' => 0, 'agent' => 3, 'cat' => $painting, 'title' => 'Paint Living Room', 'desc' => 'Interior painting for a 20x15 living room. Already bought the paint.', 'status' => 'completed', 'priority' => 'medium', 'loc' => '789 Pine Road', 'days_ago' => 14, 'budget' => [150, 250]],
            ['client' => 4, 'agent' => 6, 'cat' => $petCare, 'title' => 'Weekend Dog Sitting', 'desc' => 'Need someone to watch my dog for the weekend while I travel.', 'status' => 'completed', 'priority' => 'high', 'loc' => '456 Oak Avenue', 'days_ago' => 4, 'budget' => [80, 120]],

            // IN PROGRESS requests (5)
            ['client' => 1, 'agent' => 0, 'cat' => $delivery, 'title' => 'Deliver Legal Documents', 'desc' => 'Urgent document delivery to the courthouse.', 'status' => 'in_progress', 'priority' => 'urgent', 'loc' => 'Court House, 5th Ave', 'days_ago' => 0, 'budget' => [20, 30]],
            ['client' => 2, 'agent' => 1, 'cat' => $plumber, 'title' => 'Fix Kitchen Sink Leak', 'desc' => 'The kitchen sink has been leaking for two days.', 'status' => 'in_progress', 'priority' => 'urgent', 'loc' => '321 Elm Street', 'days_ago' => 1, 'budget' => [40, 80]],
            ['client' => 3, 'agent' => 2, 'cat' => $cleaning, 'title' => 'Deep Clean Apartment', 'desc' => 'Post-renovation deep clean for a 2BR apartment.', 'status' => 'in_progress', 'priority' => 'medium', 'loc' => '789 Pine Road', 'days_ago' => 0, 'budget' => [80, 120]],
            ['client' => 5, 'agent' => 5, 'cat' => $landscaping, 'title' => 'Spring Garden Cleanup', 'desc' => 'Need the garden cleaned up after winter. Trim hedges, rake leaves.', 'status' => 'in_progress', 'priority' => 'medium', 'loc' => 'Suburbs, Northside', 'days_ago' => 1, 'budget' => [100, 150]],
            ['client' => 6, 'agent' => 7, 'cat' => $moving, 'title' => 'Studio Apartment Move', 'desc' => 'Moving from a studio apartment to a 1BR. Need help with heavy items.', 'status' => 'in_progress', 'priority' => 'high', 'loc' => 'Downtown to Midtown', 'days_ago' => 0, 'budget' => [120, 200]],

            // ACCEPTED requests (4)
            ['client' => 0, 'agent' => 4, 'cat' => $techSupport, 'title' => 'Laptop Repair', 'desc' => 'My laptop screen is flickering. Need diagnosis and repair.', 'status' => 'accepted', 'priority' => 'medium', 'loc' => '123 Main St', 'days_ago' => 1, 'budget' => [50, 100]],
            ['client' => 4, 'agent' => 3, 'cat' => $painting, 'title' => 'Paint Bedroom', 'desc' => 'Need a bedroom painted in a calming blue. 12x12 room.', 'status' => 'accepted', 'priority' => 'medium', 'loc' => 'Midtown', 'days_ago' => 2, 'budget' => [100, 150]],
            ['client' => 7, 'agent' => 1, 'cat' => $electric, 'title' => 'Install Ceiling Fan', 'desc' => 'Need a ceiling fan installed in the living room.', 'status' => 'accepted', 'priority' => 'low', 'loc' => 'Westside', 'days_ago' => 3, 'budget' => [60, 100]],
            ['client' => 3, 'agent' => 6, 'cat' => $photography, 'title' => 'Family Portrait Session', 'desc' => 'Need family portraits taken at the park. 4 people.', 'status' => 'accepted', 'priority' => 'medium', 'loc' => 'Central Park', 'days_ago' => 1, 'budget' => [150, 250]],

            // PUBLISHED requests (3) — waiting for agents
            ['client' => 5, 'cat' => $groceries, 'title' => 'Costco Bulk Shopping', 'desc' => 'Need a Costco shopping trip. I have a list of 15 items.', 'status' => 'published', 'priority' => 'medium', 'loc' => 'Costco, Eastside', 'days_ago' => 1, 'budget' => [30, 50]],
            ['client' => 6, 'cat' => $shopper, 'title' => 'Birthday Gift Shopping', 'desc' => 'Help me find a birthday gift for my partner. Budget around $100.', 'status' => 'published', 'priority' => 'medium', 'loc' => 'Downtown Mall', 'days_ago' => 0, 'budget' => [25, 40]],
            ['client' => 7, 'cat' => $cleaning, 'title' => 'Move-Out Cleaning', 'desc' => 'Need a thorough cleaning before moving out. 1BR apartment.', 'status' => 'published', 'priority' => 'high', 'loc' => 'Eastside', 'days_ago' => 2, 'budget' => [70, 100]],

            // CLIENT CONFIRMED (2)
            ['client' => 0, 'agent' => 2, 'cat' => $airport, 'title' => 'Airport Drop-off', 'desc' => 'Need a ride to the airport at 5am.', 'status' => 'client_confirmed', 'priority' => 'high', 'loc' => 'Downtown to Airport', 'days_ago' => 0, 'budget' => [30, 50]],
            ['client' => 4, 'agent' => 7, 'cat' => $furniture, 'title' => 'IKEA Desk Assembly', 'desc' => 'Just bought an IKEA desk that needs assembly.', 'status' => 'client_confirmed', 'priority' => 'low', 'loc' => 'Midtown', 'days_ago' => 1, 'budget' => [35, 55]],

            // TRAVELLING (1)
            ['client' => 1, 'agent' => 0, 'cat' => $shopper, 'title' => 'Pharmacy Pickup', 'desc' => 'Pick up my prescription from the pharmacy.', 'status' => 'travelling', 'priority' => 'urgent', 'loc' => 'CVS, 5th Ave', 'days_ago' => 0, 'budget' => [10, 20]],

            // CANCELLED (2)
            ['client' => 3, 'cat' => $furniture, 'title' => 'Assemble Wardrobe', 'desc' => 'Need help with an IKEA wardrobe assembly. Changed plans.', 'status' => 'cancelled', 'priority' => 'low', 'loc' => '789 Pine Road', 'days_ago' => 8, 'budget' => [40, 60]],
            ['client' => 5, 'cat' => $plumber, 'title' => 'Fix Toilet', 'desc' => 'Toilet keeps running. Plumber found the issue himself.', 'status' => 'cancelled', 'priority' => 'medium', 'loc' => 'Northside', 'days_ago' => 12, 'budget' => [50, 80]],

            // DRAFT (2)
            ['client' => 6, 'cat' => $tutoring, 'title' => 'Math Tutoring', 'desc' => 'Need a math tutor for my high school student.', 'status' => 'draft', 'priority' => 'medium', 'loc' => 'Online', 'days_ago' => 0, 'budget' => [30, 50]],
            ['client' => 7, 'cat' => $delivery, 'title' => 'Package Pickup', 'desc' => 'Need a package picked up from the post office.', 'status' => 'draft', 'priority' => 'low', 'loc' => 'Post Office, Main St', 'days_ago' => 1, 'budget' => [10, 15]],
        ];

        $requests = [];
        foreach ($requestsData as $data) {
            $agentId = isset($data['agent']) ? $agents[$data['agent']]->id : null;
            $daysAgo = $data['days_ago'] ?? 0;

            $r = ServiceRequest::create([
                'client_id' => $clients[$data['client']]->id,
                'agent_id' => $agentId,
                'category_id' => $data['cat']->id,
                'title' => $data['title'],
                'description' => $data['desc'],
                'status' => $data['status'],
                'priority' => $data['priority'],
                'location' => $data['loc'],
                'deadline' => now()->addDays(mt_rand(-14, 7)),
                'budget_range' => $data['budget'],
                'created_at' => now()->subDays($daysAgo)->subHours(mt_rand(0, 23)),
            ]);

            // Add lifecycle statuses for non-draft requests
            if ($data['status'] !== 'draft') {
                ServiceRequestStatus::create([
                    'service_request_id' => $r->id,
                    'from_status' => null,
                    'to_status' => 'published',
                    'user_id' => $clients[$data['client']]->id,
                    'created_at' => $r->created_at,
                ]);
            }

            $statuses = [
                'published' => ['accepted', 'client_confirmed', 'travelling', 'waiting', 'in_progress', 'completed', 'reviewed'],
                'accepted' => ['client_confirmed'],
                'client_confirmed' => ['travelling', 'waiting', 'in_progress'],
                'travelling' => ['waiting', 'in_progress'],
                'in_progress' => ['completed'],
            ];

            if (isset($statuses[$data['status']])) {
                $userId = $agentId ?? $clients[$data['client']]->id;
                foreach ($statuses[$data['status']] as $i => $s) {
                    if ($s === $data['status']) break;
                    ServiceRequestStatus::create([
                        'service_request_id' => $r->id,
                        'from_status' => $i === 0 ? 'published' : $statuses[$data['status']][$i - 1],
                        'to_status' => $s,
                        'user_id' => $s === 'published' || $s === 'client_confirmed' ? $clients[$data['client']]->id : ($agentId ?? $clients[$data['client']]->id),
                        'created_at' => $r->created_at->addHours(($i + 1) * 2),
                    ]);
                }
            }

            $requests[] = $r;
        }

        // ═══════════════════════════════════════════════════════
        //  MESSAGES (30+)
        // ═══════════════════════════════════════════════════════

        $messagePairs = [
            // Request 0 (grocery run)
            [0, 0, 'Hi Carlos, here is my shopping list: milk, eggs, bread, apples, chicken breast, and olive oil.'],
            [0, 1, 'Got it! I will head to FreshMart now. Anything else?'],
            [0, 0, 'That is everything, thanks!'],
            // Request 1 (document delivery)
            [1, 1, 'The documents are in the lobby mailbox at 123 Main.'],
            [1, 0, 'On my way to pick them up now!'],
            [1, 1, 'Please deliver to 456 Oak Ave, Suite 200.'],
            [1, 0, 'Delivered! The receptionist signed for them.'],
            // Request 2 (airport pickup)
            [2, 1, 'What time does the flight land?'],
            [2, 0, 'Flight AA1234 lands at 3:30 PM at Terminal 2.'],
            [2, 1, 'I will be there with a sign. Any special instructions?'],
            [2, 0, 'She will be carrying two large suitcases.'],
            // Request 3 (bookshelf assembly)
            [3, 3, 'I have the BILLY bookcase instructions ready.'],
            [3, 1, 'Perfect. I will bring my power drill. See you at 2pm.'],
            // Request 5 (dog sitting)
            [5, 4, 'What kind of dog do you have?'],
            [5, 6, 'A golden retriever named Max. Very friendly.'],
            [5, 4, 'I love goldens! What does he eat?'],
            [5, 6, 'Royal Canin, twice a day. I will leave enough food.'],
            // Request 6 (legal documents)
            [6, 1, 'These need to be at the courthouse by 2 PM. Very urgent!'],
            [6, 0, 'On it. I will leave now.'],
            // Request 7 (kitchen sink)
            [7, 1, 'Can you send a photo of the leak?'],
            [7, 2, 'I will take one when I get there. What type of sink?'],
            [7, 1, 'It is a stainless steel double basin.'],
            // Request 10 (laptop repair)
            [10, 3, 'When did the flickering start?'],
            [10, 0, 'About two days ago. It gets worse when I move the screen.'],
            [10, 3, 'Sounds like a loose cable. I can take a look Thursday.'],
            [10, 0, 'Thursday works. What time?'],
            [10, 3, 'How about 10am?'],
            [10, 0, 'Perfect, see you then!'],
        ];

        foreach ($messagePairs as [$reqIdx, $senderIdx, $content]) {
            if (!isset($requests[$reqIdx])) continue;
            $sender = $senderIdx === 0
                ? User::find($requests[$reqIdx]->client_id)
                : ($requests[$reqIdx]->agent_id ? User::find($requests[$reqIdx]->agent_id) : null);

            if (!$sender) continue;

            Message::create([
                'service_request_id' => $requests[$reqIdx]->id,
                'sender_id' => $sender->id,
                'content' => $content,
                'type' => 'text',
                'read_at' => rand(0, 3) > 0 ? now()->subMinutes(rand(1, 60)) : null,
            ]);
        }

        // ═══════════════════════════════════════════════════════
        //  BOOKINGS (12)
        // ═══════════════════════════════════════════════════════

        $bookingsData = [
            ['req' => 0, 'svc' => 0, 'client' => 0, 'provider' => 0, 'status' => 'completed', 'days' => -4],
            ['req' => 1, 'svc' => 1, 'client' => 1, 'provider' => 0, 'status' => 'completed', 'days' => -3],
            ['req' => 2, 'svc' => 6, 'client' => 2, 'provider' => 2, 'status' => 'completed', 'days' => -6],
            ['req' => 3, 'svc' => 4, 'client' => 3, 'provider' => 1, 'status' => 'completed', 'days' => -9],
            ['req' => 5, 'svc' => 15, 'client' => 4, 'provider' => 6, 'status' => 'completed', 'days' => -3],
            ['req' => 8, 'svc' => 7, 'client' => 3, 'provider' => 2, 'status' => 'accepted', 'days' => 1],
            ['req' => 10, 'svc' => 10, 'client' => 0, 'provider' => 4, 'status' => 'pending', 'days' => 3],
            ['req' => 11, 'svc' => 8, 'client' => 4, 'provider' => 3, 'status' => 'pending', 'days' => 4],
            ['req' => 12, 'svc' => 5, 'client' => 7, 'provider' => 1, 'status' => 'pending', 'days' => 5],
            ['svc' => 15, 'client' => 6, 'provider' => 6, 'status' => 'pending', 'days' => 2],
            ['req' => 6, 'svc' => 1, 'client' => 1, 'provider' => 0, 'status' => 'accepted', 'days' => 0],
            ['svc' => 16, 'client' => 7, 'provider' => 7, 'status' => 'pending', 'days' => 6],
        ];

        foreach ($bookingsData as $data) {
            Booking::create([
                'request_id' => isset($data['req']) && isset($requests[$data['req']]) ? $requests[$data['req']]->id : null,
                'service_listing_id' => isset($data['svc']) && isset($listings[$data['svc']]) ? $listings[$data['svc']]->id : null,
                'client_id' => $clients[$data['client']]->id,
                'provider_id' => $agents[$data['provider']]->id,
                'status' => $data['status'],
                'scheduled_at' => now()->addDays($data['days'])->addHours(mt_rand(8, 17)),
                'notes' => 'Booked via ' . ($data['status'] === 'completed' ? 'completed request' : 'service listing') . '.',
            ]);
        }

        // ═══════════════════════════════════════════════════════
        //  REVIEWS (12) — multi-dimensional
        // ═══════════════════════════════════════════════════════

        $reviewPairs = [
            ['req' => 0, 'reviewer_client' => 0, 'reviewee_agent' => 0, 'r' => 5, 'c' => 5, 'p' => 5, 't' => 5, 'q' => 5, 'comment' => 'Carlos was fantastic! Everything was fresh and delivered on time. Highly recommend!'],
            ['req' => 1, 'reviewer_client' => 1, 'reviewee_agent' => 0, 'r' => 5, 'c' => 5, 'p' => 4, 't' => 5, 'q' => 5, 'comment' => 'Very fast delivery. Documents arrived in perfect condition.'],
            ['req' => 2, 'reviewer_client' => 2, 'reviewee_agent' => 2, 'r' => 4, 'c' => 5, 'p' => 4, 't' => 4, 'q' => 4, 'comment' => 'Elena was punctual and friendly. Smooth airport pickup.'],
            ['req' => 3, 'reviewer_client' => 3, 'reviewee_agent' => 1, 'r' => 5, 'c' => 4, 'p' => 5, 't' => 5, 'q' => 5, 'comment' => 'Diana assembled the bookshelf perfectly. Very professional.'],
            ['req' => 5, 'reviewer_client' => 4, 'reviewee_agent' => 6, 'r' => 5, 'c' => 5, 'p' => 5, 't' => 5, 'q' => 5, 'comment' => 'Sophie took amazing care of my dog. Max loved her!'],
            ['req' => 4, 'reviewer_client' => 0, 'reviewee_agent' => 3, 'r' => 4, 'c' => 4, 'p' => 4, 't' => 3, 'q' => 4, 'comment' => 'Good painting job. Took a bit longer than expected but quality is great.'],
        ];

        foreach ($reviewPairs as $data) {
            if (!isset($requests[$data['req']])) continue;

            $reviewerId = isset($data['reviewer_client'])
                ? $clients[$data['reviewer_client']]->id
                : $agents[$data['reviewer_agent']]->id;
            $revieweeId = isset($data['reviewee_client'])
                ? $clients[$data['reviewee_client']]->id
                : $agents[$data['reviewee_agent']]->id;

            Review::create([
                'service_request_id' => $requests[$data['req']]->id,
                'reviewer_id' => $reviewerId,
                'reviewee_id' => $revieweeId,
                'rating' => $data['r'],
                'communication_rating' => $data['c'],
                'professionalism_rating' => $data['p'],
                'timeliness_rating' => $data['t'],
                'quality_rating' => $data['q'],
                'comment' => $data['comment'],
            ]);
        }

        // ═══════════════════════════════════════════════════════
        //  PORTFOLIO ITEMS (12)
        // ═══════════════════════════════════════════════════════

        $portfolioData = [
            ['agent' => 0, 'title' => 'FreshMart Weekly Delivery', 'desc' => 'Completed a large weekly grocery delivery for a family of 5. Everything was fresh and on time.', 'cat' => $groceries, 'req' => 0],
            ['agent' => 0, 'title' => 'Office Supply Run', 'desc' => 'Sourced and delivered office supplies for a local startup within 2 hours.', 'cat' => $shopper],
            ['agent' => 0, 'title' => 'Same-Day Document Delivery', 'desc' => 'Urgent legal document delivery across the city in under 2 hours.', 'cat' => $delivery, 'req' => 1],
            ['agent' => 1, 'title' => 'Full Bathroom Renovation', 'desc' => 'Complete plumbing overhaul for a bathroom renovation. New pipes, sink, and toilet.', 'cat' => $plumber],
            ['agent' => 1, 'title' => 'IKEA Kitchen Assembly', 'desc' => 'Assembled an entire IKEA kitchen set including cabinets and countertops.', 'cat' => $furniture],
            ['agent' => 1, 'title' => 'Bookshelf Assembly', 'desc' => 'Assembled an IKEA BILLY bookcase and installed it against the wall.', 'cat' => $furniture, 'req' => 3],
            ['agent' => 2, 'title' => 'Airport Run for Johnson Family', 'desc' => 'Coordinated pickup of 4 family members arriving on different flights.', 'cat' => $airport, 'req' => 2],
            ['agent' => 2, 'title' => '2BR Apartment Deep Clean', 'desc' => 'Deep cleaned a 2-bedroom apartment after renovation. Sparkling results!', 'cat' => $cleaning],
            ['agent' => 3, 'title' => 'Living Room Accent Wall', 'desc' => 'Created a beautiful accent wall with geometric paint pattern.', 'cat' => $painting, 'req' => 4],
            ['agent' => 5, 'title' => 'Backyard Landscaping', 'desc' => 'Complete backyard transformation. New mulch, trimmed hedges, and planted flowers.', 'cat' => $landscaping],
            ['agent' => 6, 'title' => 'Wedding Photography', 'desc' => 'Captured beautiful moments at an outdoor wedding ceremony.', 'cat' => $photography],
            ['agent' => 6, 'title' => 'Weekend Pet Sitting', 'desc' => 'Took care of a golden retriever for a weekend. Daily walks and playtime.', 'cat' => $petCare, 'req' => 5],
        ];

        foreach ($portfolioData as $data) {
            PortfolioItem::create([
                'agent_id' => $agents[$data['agent']]->id,
                'title' => $data['title'],
                'description' => $data['desc'],
                'images' => ["portfolio/item_" . $agents[$data['agent']]->id . "_" . mt_rand(1, 999) . ".jpg"],
                'category_id' => $data['cat']->id,
                'service_request_id' => isset($data['req']) && isset($requests[$data['req']]) ? $requests[$data['req']]->id : null,
            ]);
        }

        // ═══════════════════════════════════════════════════════
        //  UPDATE AGENT PROFILE RATINGS
        // ═══════════════════════════════════════════════════════

        $ratingData = [
            0 => ['avg' => 5.0, 'comm' => 5.0, 'prof' => 4.5, 'time' => 5.0, 'qual' => 5.0, 'count' => 6],
            1 => ['avg' => 4.5, 'comm' => 4.5, 'prof' => 4.5, 'time' => 4.0, 'qual' => 4.5, 'count' => 4],
            2 => ['avg' => 4.5, 'comm' => 5.0, 'prof' => 4.5, 'time' => 4.5, 'qual' => 4.5, 'count' => 3],
            3 => ['avg' => 4.0, 'comm' => 4.0, 'prof' => 4.0, 'time' => 3.5, 'qual' => 4.0, 'count' => 2],
            6 => ['avg' => 5.0, 'comm' => 5.0, 'prof' => 5.0, 'time' => 5.0, 'qual' => 5.0, 'count' => 2],
        ];

        foreach ($ratingData as $i => $data) {
            if (isset($profiles[$i])) {
                $profiles[$i]->update([
                    'avg_overall_rating' => $data['avg'],
                    'avg_communication_rating' => $data['comm'],
                    'avg_professionalism_rating' => $data['prof'],
                    'avg_timeliness_rating' => $data['time'],
                    'avg_quality_rating' => $data['qual'],
                    'total_reviews_count' => $data['count'],
                ]);
            }
        }

        // ═══════════════════════════════════════════════════════
        //  SUMMARY
        // ═══════════════════════════════════════════════════════

        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════');
        $this->command->info('  Test data seeded successfully!');
        $this->command->info('═══════════════════════════════════════════');
        $this->command->info("  Users:              " . User::count());
        $this->command->info("  - Clients:          " . User::where('role', 'client')->count());
        $this->command->info("  - Agents:           " . User::where('role', 'agent')->count());
        $this->command->info("  - Admins:           " . User::where('role', 'super-admin')->count());
        $this->command->info("  Agent Profiles:     " . AgentProfile::count());
        $this->command->info("  Service Listings:   " . ServiceListing::count());
        $this->command->info("  Service Requests:   " . ServiceRequest::count());
        $this->command->info("  Request Statuses:   " . ServiceRequestStatus::count());
        $this->command->info("  Bookings:           " . Booking::count());
        $this->command->info("  Reviews:            " . Review::count());
        $this->command->info("  Messages:           " . Message::count());
        $this->command->info("  Portfolio Items:    " . PortfolioItem::count());
        $this->command->info("  Verifications:      " . VerificationRequest::count());
        $this->command->info('═══════════════════════════════════════════');
        $this->command->info('');
        $this->command->info('  Login credentials (password: password):');
        $this->command->info('  ─────────────────────────────────────────');
        $this->command->info('  Admin:   admin@example.com');
        $this->command->info('  Client:  alice@example.com');
        $this->command->info('  Client:  bob@example.com');
        $this->command->info('  Client:  carol@example.com');
        $this->command->info('  Agent:   carlos@example.com');
        $this->command->info('  Agent:   diana@example.com');
        $this->command->info('  Agent:   elena@example.com');
        $this->command->info('  Agent:   james@example.com');
        $this->command->info('  Agent:   priya@example.com');
        $this->command->info('═══════════════════════════════════════════');
    }
}
