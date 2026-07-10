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
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        if (User::count() > 0) {
            $this->command->info('Demo data already exists. Skipping.');
            return;
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

        // ── Users & Profiles ──────────────────────────────────

        $client1 = User::create([
            'name' => 'Alice Johnson', 'email' => 'alice@example.com',
            'password' => bcrypt('password'), 'role' => 'client',
            'phone' => '+1-555-0101', 'is_verified' => true,
            'email_verified_at' => now(), 'phone_verified_at' => now(),
        ]);
        $client1->assignRole('client');

        $client2 = User::create([
            'name' => 'Bob Smith', 'email' => 'bob@example.com',
            'password' => bcrypt('password'), 'role' => 'client',
            'phone' => '+1-555-0102', 'is_verified' => true,
            'email_verified_at' => now(), 'phone_verified_at' => now(),
        ]);
        $client2->assignRole('client');

        $agent1 = User::create([
            'name' => 'Carlos Rivera', 'email' => 'carlos@example.com',
            'password' => bcrypt('password'), 'role' => 'agent',
            'phone' => '+1-555-0103', 'is_verified' => true,
            'email_verified_at' => now(), 'phone_verified_at' => now(),
        ]);
        $agent1->assignRole('agent');

        $profile1 = AgentProfile::create([
            'user_id' => $agent1->id,
            'bio' => 'Experienced errand runner with 5+ years in shopping, delivery, and personal assistance. Reliable and fast.',
            'skills' => $categories->take(4)->pluck('id')->toArray(),
            'languages' => ['English', 'Spanish'],
            'coverage_area' => 'Downtown, Midtown, Westside',
            'vehicle' => 'Car',
            'available_hours' => ['weekdays 9-5', 'weekends 10-4'],
            'experience_years' => 5,
            'is_online' => true,
            'profile_completion_score' => 90,
        ]);

        $agent2 = User::create([
            'name' => 'Diana Chen', 'email' => 'diana@example.com',
            'password' => bcrypt('password'), 'role' => 'agent',
            'phone' => '+1-555-0104', 'is_verified' => true,
            'email_verified_at' => now(), 'phone_verified_at' => now(),
        ]);
        $agent2->assignRole('agent');

        $profile2 = AgentProfile::create([
            'user_id' => $agent2->id,
            'bio' => 'Handyman and repair specialist. I can fix almost anything around the house or office.',
            'skills' => $categories->skip(2)->take(3)->pluck('id')->toArray(),
            'languages' => ['English', 'Mandarin'],
            'coverage_area' => 'Eastside, Northside, Downtown',
            'vehicle' => 'Van',
            'available_hours' => ['weekdays 8-6', 'Saturday 9-12'],
            'experience_years' => 8,
            'is_online' => false,
            'profile_completion_score' => 85,
        ]);

        $agent3 = User::create([
            'name' => 'Elena Foster', 'email' => 'elena@example.com',
            'password' => bcrypt('password'), 'role' => 'agent',
            'phone' => '+1-555-0105', 'is_verified' => true,
            'email_verified_at' => now(), 'phone_verified_at' => now(),
        ]);
        $agent3->assignRole('agent');

        $profile3 = AgentProfile::create([
            'user_id' => $agent3->id,
            'bio' => 'Your go-to for event planning, catering pickup, and transportation. Friendly and detail-oriented.',
            'skills' => $categories->skip(5)->take(3)->pluck('id')->toArray(),
            'languages' => ['English', 'French'],
            'coverage_area' => 'City-wide',
            'vehicle' => 'Car',
            'available_hours' => ['weekdays 7-9', 'weekends 8-10'],
            'experience_years' => 3,
            'is_online' => true,
            'profile_completion_score' => 80,
        ]);

        $agents = [$agent1, $agent2, $agent3];
        $profiles = [$profile1, $profile2, $profile3];

        // ── Service Listings (2-3 per agent) ──────────────────

        $svc1 = ServiceListing::create([
            'agent_id' => $agent1->id, 'category_id' => $groceries->id,
            'title' => 'Grocery Shopping & Delivery', 'description' => 'I will shop for your groceries at any store and deliver to your door. Fresh produce guaranteed.',
            'price_type' => 'fixed', 'starting_price' => 25.00, 'is_negotiable' => true,
            'location' => 'Downtown', 'coverage_radius' => 10,
            'availability' => ['Mon-Fri 9am-6pm', 'Sat 10am-4pm'],
            'tags' => ['groceries', 'shopping', 'delivery', 'fresh'], 'experience_years' => 5,
            'estimated_duration' => 60, 'status' => 'active',
        ]);
        $svc2 = ServiceListing::create([
            'agent_id' => $agent1->id, 'category_id' => $delivery->id,
            'title' => 'Document & Parcel Delivery', 'description' => 'Same-day document and small parcel delivery across the city. Secure and trackable.',
            'price_type' => 'fixed', 'starting_price' => 15.00, 'is_negotiable' => false,
            'location' => 'Downtown', 'coverage_radius' => 15,
            'availability' => ['Mon-Fri 8am-7pm'], 'tags' => ['delivery', 'documents', 'courier'],
            'experience_years' => 4, 'estimated_duration' => 45, 'status' => 'active',
        ]);
        $svc3 = ServiceListing::create([
            'agent_id' => $agent1->id, 'category_id' => $shopper->id,
            'title' => 'Personal Shopping Assistant', 'description' => 'Need a personal shopper? I can help pick gifts, clothes, or anything you need.',
            'price_type' => 'hourly', 'starting_price' => 20.00, 'is_negotiable' => true,
            'location' => 'Downtown', 'coverage_radius' => 8,
            'availability' => ['weekdays 10am-5pm'], 'tags' => ['shopping', 'gifts', 'personal'],
            'experience_years' => 3, 'estimated_duration' => 120, 'status' => 'active',
        ]);

        $svc4 = ServiceListing::create([
            'agent_id' => $agent2->id, 'category_id' => $plumber->id,
            'title' => 'Plumbing Repairs & Installation', 'description' => 'Licensed plumber with 8 years experience. Sinks, faucets, pipes, water heaters — I fix it all.',
            'price_type' => 'hourly', 'starting_price' => 50.00, 'is_negotiable' => true,
            'location' => 'Eastside', 'coverage_radius' => 20,
            'availability' => ['Mon-Sat 8am-6pm'], 'tags' => ['plumbing', 'repair', 'installation'],
            'experience_years' => 8, 'estimated_duration' => 120, 'status' => 'active',
        ]);
        $svc5 = ServiceListing::create([
            'agent_id' => $agent2->id, 'category_id' => $furniture->id,
            'title' => 'Furniture Assembly', 'description' => 'I will assemble any flat-pack furniture quickly and correctly. I bring my own tools.',
            'price_type' => 'fixed', 'starting_price' => 40.00, 'is_negotiable' => true,
            'location' => 'Eastside', 'coverage_radius' => 15,
            'availability' => ['weekdays 9am-7pm', 'weekends 10am-5pm'],
            'tags' => ['assembly', 'furniture', 'ikea', 'handyman'], 'experience_years' => 6,
            'estimated_duration' => 90, 'status' => 'active',
        ]);

        $svc6 = ServiceListing::create([
            'agent_id' => $agent3->id, 'category_id' => $airport->id,
            'title' => 'Airport Pickup & Drop-off', 'description' => 'Reliable airport transportation. I will pick you up or drop you off with a smile.',
            'price_type' => 'fixed', 'starting_price' => 30.00, 'is_negotiable' => true,
            'location' => 'City-wide', 'coverage_radius' => 30,
            'availability' => ['everyday 6am-10pm'], 'tags' => ['airport', 'transport', 'pickup'],
            'experience_years' => 3, 'estimated_duration' => 60, 'status' => 'active',
        ]);
        $svc7 = ServiceListing::create([
            'agent_id' => $agent3->id, 'category_id' => $cleaning->id,
            'title' => 'Deep Cleaning Service', 'description' => 'Thorough deep cleaning for apartments and houses. Kitchen, bathrooms, and living areas.',
            'price_type' => 'fixed', 'starting_price' => 80.00, 'is_negotiable' => true,
            'location' => 'City-wide', 'coverage_radius' => 15,
            'availability' => ['Mon-Sat 8am-6pm'], 'tags' => ['cleaning', 'deep clean', 'housekeeping'],
            'experience_years' => 4, 'estimated_duration' => 180, 'status' => 'active',
        ]);

        // ── Portfolio Items (2 per agent) ─────────────────────

        PortfolioItem::create([
            'agent_id' => $agent1->id,
            'title' => 'FreshMart Grocery Delivery',
            'description' => 'Completed a large weekly grocery delivery for a family of 5. Everything was fresh and on time.',
            'images' => ['https://placehold.co/600x400/1E3A8A/FFFFFF?text=Grocery+Delivery'],
            'category_id' => $groceries->id,
        ]);
        PortfolioItem::create([
            'agent_id' => $agent1->id,
            'title' => 'Office Supply Run',
            'description' => 'Sourced and delivered office supplies for a local startup within 2 hours.',
            'images' => ['https://placehold.co/600x400/FF6B00/FFFFFF?text=Office+Supplies'],
            'category_id' => $shopper->id,
        ]);

        PortfolioItem::create([
            'agent_id' => $agent2->id,
            'title' => 'Full Bathroom Renovation',
            'description' => 'Complete plumbing overhaul for a bathroom renovation. New pipes, sink, and toilet installation.',
            'images' => ['https://placehold.co/600x400/22C55E/FFFFFF?text=Bathroom+Renovation'],
            'category_id' => $plumber->id,
        ]);
        PortfolioItem::create([
            'agent_id' => $agent2->id,
            'title' => 'IKEA Kitchen Assembly',
            'description' => 'Assembled an entire IKEA kitchen set including cabinets, drawers, and countertops.',
            'images' => ['https://placehold.co/600x400/1E3A8A/FFFFFF?text=Kitchen+Assembly'],
            'category_id' => $furniture->id,
        ]);

        PortfolioItem::create([
            'agent_id' => $agent3->id,
            'title' => 'Airport Run for Johnson Family',
            'description' => 'Coordinated pickup of 4 family members arriving on different flights. Smooth and stress-free.',
            'images' => ['https://placehold.co/600x400/FF6B00/FFFFFF?text=Airport+Pickup'],
            'category_id' => $airport->id,
        ]);
        PortfolioItem::create([
            'agent_id' => $agent3->id,
            'title' => '2BR Apartment Deep Clean',
            'description' => 'Deep cleaned a 2-bedroom apartment after renovation. Sparkling results!',
            'images' => ['https://placehold.co/600x400/22C55E/FFFFFF?text=Deep+Clean'],
            'category_id' => $cleaning->id,
        ]);

        // ── Service Requests ──────────────────────────────────

        $r1 = ServiceRequest::create([
            'client_id' => $client1->id, 'agent_id' => $agent1->id,
            'category_id' => $groceries->id,
            'title' => 'Weekly Grocery Run',
            'description' => 'Need someone to pick up my weekly groceries from FreshMart Downtown. I will share the list via chat.',
            'status' => 'completed', 'priority' => 'medium',
            'location' => 'FreshMart Downtown, 123 Main St',
            'deadline' => now()->subDays(3),
            'budget_range' => ['min' => 20, 'max' => 30],
            'instructions' => 'Please check produce for freshness. Use reusable bags if possible.',
        ]);
        foreach ([null, 'draft', 'published', 'accepted', 'client_confirmed', 'in_progress', 'completed'] as $i => $from) {
            $to = $i === 0 ? 'draft' : (['draft', 'published', 'accepted', 'client_confirmed', 'in_progress', 'completed'][$i - 1] ?? '');
            if ($to) ServiceRequestStatus::create(['service_request_id' => $r1->id, 'from_status' => $from, 'to_status' => ($from === null ? 'draft' : $to), 'user_id' => $client1->id]);
        }

        Message::create(['service_request_id' => $r1->id, 'sender_id' => $client1->id, 'content' => 'Hi Carlos, here is my shopping list: milk, eggs, bread, apples, chicken breast, and olive oil.']);
        Message::create(['service_request_id' => $r1->id, 'sender_id' => $agent1->id, 'content' => 'Got it! I will head to FreshMart now. Anything else?']);
        Message::create(['service_request_id' => $r1->id, 'sender_id' => $client1->id, 'content' => 'That is everything, thanks!']);

        $r2 = ServiceRequest::create([
            'client_id' => $client2->id, 'agent_id' => $agent1->id,
            'category_id' => $delivery->id,
            'title' => 'Deliver Contract Documents',
            'description' => 'Need to deliver signed contract documents to the law office on Oak Avenue by 3 PM.',
            'status' => 'in_progress', 'priority' => 'urgent',
            'location' => '456 Oak Avenue, Suite 200',
            'deadline' => now()->addHours(3),
            'budget_range' => ['min' => 15, 'max' => 25],
        ]);
        ServiceRequestStatus::create(['service_request_id' => $r2->id, 'from_status' => null, 'to_status' => 'published', 'user_id' => $client2->id]);
        ServiceRequestStatus::create(['service_request_id' => $r2->id, 'from_status' => 'published', 'to_status' => 'accepted', 'user_id' => $agent1->id]);
        ServiceRequestStatus::create(['service_request_id' => $r2->id, 'from_status' => 'accepted', 'to_status' => 'client_confirmed', 'user_id' => $client2->id]);
        ServiceRequestStatus::create(['service_request_id' => $r2->id, 'from_status' => 'client_confirmed', 'to_status' => 'in_progress', 'user_id' => $agent1->id]);

        Message::create(['service_request_id' => $r2->id, 'sender_id' => $client2->id, 'content' => 'The documents are in the lobby mailbox at 123 Main. Please pick them up and deliver to 456 Oak Ave.']);
        Message::create(['service_request_id' => $r2->id, 'sender_id' => $agent1->id, 'content' => 'On my way to pick them up now!']);

        $r3 = ServiceRequest::create([
            'client_id' => $client1->id,
            'category_id' => $furniture->id,
            'title' => 'Assemble IKEA Desk',
            'description' => 'Just bought an IKEA desk that needs assembly. Tools will be provided.',
            'status' => 'published', 'priority' => 'low',
            'location' => '789 Pine Road, Apt 4B',
            'deadline' => now()->addDays(5),
            'budget_range' => ['min' => 30, 'max' => 50],
        ]);
        ServiceRequestStatus::create(['service_request_id' => $r3->id, 'from_status' => null, 'to_status' => 'draft', 'user_id' => $client1->id]);
        ServiceRequestStatus::create(['service_request_id' => $r3->id, 'from_status' => 'draft', 'to_status' => 'published', 'user_id' => $client1->id]);

        $r4 = ServiceRequest::create([
            'client_id' => $client2->id, 'agent_id' => $agent2->id,
            'category_id' => $plumber->id,
            'title' => 'Fix Kitchen Sink Leak',
            'description' => 'The kitchen sink has been leaking for two days. Need someone to fix it as soon as possible.',
            'status' => 'accepted', 'priority' => 'urgent',
            'location' => '321 Elm Street',
            'deadline' => now()->addDay(),
            'budget_range' => ['min' => 40, 'max' => 80],
        ]);
        ServiceRequestStatus::create(['service_request_id' => $r4->id, 'from_status' => null, 'to_status' => 'published', 'user_id' => $client2->id]);
        ServiceRequestStatus::create(['service_request_id' => $r4->id, 'from_status' => 'published', 'to_status' => 'accepted', 'user_id' => $agent2->id]);
        ServiceRequestStatus::create(['service_request_id' => $r4->id, 'from_status' => 'accepted', 'to_status' => 'accepted', 'user_id' => $agent2->id, 'note' => 'Will arrive Saturday morning.']);

        $r5 = ServiceRequest::create([
            'client_id' => $client1->id, 'agent_id' => $agent3->id,
            'category_id' => $airport->id,
            'title' => 'Airport Pickup - Flight AA1234',
            'description' => 'Pick up my mother from the airport. She arrives on flight AA1234 at Terminal 2.',
            'status' => 'completed', 'priority' => 'high',
            'location' => 'International Airport, Terminal 2',
            'deadline' => now()->subDays(1),
            'budget_range' => ['min' => 25, 'max' => 40],
        ]);
        ServiceRequestStatus::create(['service_request_id' => $r5->id, 'from_status' => null, 'to_status' => 'published', 'user_id' => $client1->id]);
        ServiceRequestStatus::create(['service_request_id' => $r5->id, 'from_status' => 'published', 'to_status' => 'accepted', 'user_id' => $agent3->id]);
        ServiceRequestStatus::create(['service_request_id' => $r5->id, 'from_status' => 'accepted', 'to_status' => 'client_confirmed', 'user_id' => $client1->id]);
        ServiceRequestStatus::create(['service_request_id' => $r5->id, 'from_status' => 'client_confirmed', 'to_status' => 'in_progress', 'user_id' => $agent3->id]);
        ServiceRequestStatus::create(['service_request_id' => $r5->id, 'from_status' => 'in_progress', 'to_status' => 'completed', 'user_id' => $agent3->id]);

        $r6 = ServiceRequest::create([
            'client_id' => $client2->id,
            'category_id' => $shopper->id,
            'title' => 'Birthday Gift Shopping',
            'description' => 'Need help finding a birthday gift for my wife. Budget around $100. I need suggestions and help picking something nice.',
            'status' => 'published', 'priority' => 'medium',
            'location' => 'Downtown Mall',
            'deadline' => now()->addDays(2),
            'budget_range' => ['min' => 15, 'max' => 25],
        ]);
        ServiceRequestStatus::create(['service_request_id' => $r6->id, 'from_status' => null, 'to_status' => 'published', 'user_id' => $client2->id]);

        $r7 = ServiceRequest::create([
            'client_id' => $client1->id, 'agent_id' => $agent2->id,
            'category_id' => $cleaning->id,
            'title' => 'Deep Clean Apartment',
            'description' => 'Need a deep clean of my 2-bedroom apartment. Includes kitchen, bathrooms, and living room.',
            'status' => 'client_confirmed', 'priority' => 'medium',
            'location' => '789 Pine Road, Apt 4B',
            'deadline' => now()->addDays(2),
            'budget_range' => ['min' => 60, 'max' => 100],
            'instructions' => 'Bring your own cleaning supplies. Focus on kitchen and bathrooms.',
        ]);
        ServiceRequestStatus::create(['service_request_id' => $r7->id, 'from_status' => null, 'to_status' => 'published', 'user_id' => $client1->id]);
        ServiceRequestStatus::create(['service_request_id' => $r7->id, 'from_status' => 'published', 'to_status' => 'accepted', 'user_id' => $agent2->id]);
        ServiceRequestStatus::create(['service_request_id' => $r7->id, 'from_status' => 'accepted', 'to_status' => 'client_confirmed', 'user_id' => $client1->id]);

        // ── Bookings ──────────────────────────────────────────

        Booking::create([
            'request_id' => $r1->id, 'service_listing_id' => $svc1->id,
            'client_id' => $client1->id, 'provider_id' => $agent1->id,
            'status' => 'completed',
            'scheduled_at' => now()->subDays(4),
            'notes' => 'Weekly grocery run booked via request.',
        ]);
        Booking::create([
            'request_id' => $r2->id, 'service_listing_id' => $svc2->id,
            'client_id' => $client2->id, 'provider_id' => $agent1->id,
            'status' => 'accepted',
            'scheduled_at' => now()->addHours(2),
            'notes' => 'Urgent document delivery.',
        ]);
        Booking::create([
            'request_id' => $r4->id, 'service_listing_id' => $svc4->id,
            'client_id' => $client2->id, 'provider_id' => $agent2->id,
            'status' => 'accepted',
            'scheduled_at' => now()->addHours(24),
            'notes' => 'Plumbing repair - kitchen sink leak.',
        ]);
        Booking::create([
            'service_listing_id' => $svc3->id,
            'client_id' => $client1->id, 'provider_id' => $agent1->id,
            'status' => 'pending',
            'scheduled_at' => now()->addDays(3),
            'notes' => 'Need help shopping for birthday gifts.',
        ]);
        Booking::create([
            'service_listing_id' => $svc7->id,
            'client_id' => $client2->id, 'provider_id' => $agent3->id,
            'status' => 'pending',
            'scheduled_at' => now()->addDays(5),
            'notes' => 'End-of-lease deep clean for 1BR apartment.',
        ]);

        // ── Reviews (multi-dimensional) ───────────────────────

        Review::create([
            'service_request_id' => $r1->id,
            'reviewer_id' => $client1->id, 'reviewee_id' => $agent1->id,
            'rating' => 5, 'communication_rating' => 5, 'professionalism_rating' => 5,
            'timeliness_rating' => 5, 'quality_rating' => 5,
            'comment' => 'Carlos was fantastic! Everything was fresh and delivered on time.',
        ]);
        Review::create([
            'service_request_id' => $r5->id,
            'reviewer_id' => $client1->id, 'reviewee_id' => $agent3->id,
            'rating' => 4, 'communication_rating' => 5, 'professionalism_rating' => 4,
            'timeliness_rating' => 4, 'quality_rating' => 4,
            'comment' => 'Elena was very punctual and helpful. Would recommend!',
        ]);
        $r8 = ServiceRequest::create([
            'client_id' => $client1->id, 'agent_id' => $agent1->id,
            'category_id' => $groceries->id,
            'title' => 'Express Grocery Pickup',
            'description' => 'Quick grocery pickup - just milk, eggs, and bread from the corner store.',
            'status' => 'completed', 'priority' => 'low',
            'location' => 'Corner Store, 5th Ave',
            'deadline' => now()->subDays(7),
            'budget_range' => ['min' => 10, 'max' => 15],
        ]);
        ServiceRequestStatus::create(['service_request_id' => $r8->id, 'from_status' => null, 'to_status' => 'published', 'user_id' => $client1->id]);
        ServiceRequestStatus::create(['service_request_id' => $r8->id, 'from_status' => 'published', 'to_status' => 'accepted', 'user_id' => $agent1->id]);
        ServiceRequestStatus::create(['service_request_id' => $r8->id, 'from_status' => 'accepted', 'to_status' => 'client_confirmed', 'user_id' => $client1->id]);
        ServiceRequestStatus::create(['service_request_id' => $r8->id, 'from_status' => 'client_confirmed', 'to_status' => 'completed', 'user_id' => $agent1->id]);

        Review::create([
            'service_request_id' => $r8->id,
            'reviewer_id' => $agent1->id, 'reviewee_id' => $client1->id,
            'rating' => 5, 'communication_rating' => 5, 'professionalism_rating' => 5,
            'timeliness_rating' => 5, 'quality_rating' => 5,
            'comment' => 'Alice was a wonderful client. Clear instructions and very kind.',
        ]);

        // ── Update Agent Profile Ratings ──────────────────────

        foreach ($profiles as $i => $profile) {
            $profile->completed_jobs_count = [5, 12, 3][$i];
            $profile->total_reviews_count = [1, 0, 1][$i];
            $profile->avg_overall_rating = [5.0, 0, 4.5][$i];
            $profile->avg_communication_rating = [5.0, 0, 5.0][$i];
            $profile->avg_professionalism_rating = [5.0, 0, 4.5][$i];
            $profile->avg_timeliness_rating = [5.0, 0, 4.5][$i];
            $profile->avg_quality_rating = [5.0, 0, 4.5][$i];
            $profile->save();
        }

        $this->command->info('Demo data seeded successfully!');
    }
}
