<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Shopping' => [
                'Groceries', 'Market shopping', 'Supermarket shopping', 'Pharmacy purchases',
                'Electronics', 'Fashion', 'Baby products', 'Pet supplies',
                'Office supplies', 'Building materials', 'Furniture', 'Flowers', 'Gifts', 'Books',
            ],
            'Delivery' => [
                'Pick up parcel', 'Deliver package', 'Document delivery', 'Food pickup',
                'Laundry pickup', 'Courier assistance',
            ],
            'Home Services' => [
                'Furniture assembly', 'TV mounting', 'Painting', 'House cleaning',
                'Laundry', 'Gardening', 'House moving', 'Packing', 'Unpacking', 'Waste removal',
            ],
            'Repairs' => [
                'Electrician', 'Plumber', 'Carpenter', 'Locksmith', 'Mechanic',
                'Appliance repair', 'Phone repair', 'Computer repair',
            ],
            'Business Assistance' => [
                'Office errands', 'Purchase supplies', 'Bank deposits', 'Document submission',
                'Government office visits', 'Queue assistance', 'Printing', 'Photocopy',
                'Passport processing assistance',
            ],
            'Transportation' => [
                'Airport pickup', 'Airport drop-off', 'Vehicle hire', 'Driver for the day',
                'School pickup', 'Package transportation',
            ],
            'Personal Assistance' => [
                'Personal shopper', 'Gift shopping', 'Event assistant', 'Queue waiting',
                'Prescription pickup', 'Hospital companion', 'Senior assistance',
                'Pet walking', 'Pet feeding',
            ],
            'Events' => [
                'Decoration setup', 'Food purchase', 'Equipment rental',
                'Event errands', 'Guest pickup',
            ],
            'Food' => [
                'Restaurant pickup', 'Local food shopping', 'Bulk food purchase', 'Party catering pickup',
            ],
            'Custom Request' => [],
        ];

        foreach ($categories as $parentName => $children) {
            $parent = Category::firstOrCreate([
                'name' => $parentName,
            ], [
                'slug' => Str::slug($parentName),
                'description' => "{$parentName} services and errands",
            ]);

            foreach ($children as $childName) {
                Category::firstOrCreate([
                    'name' => $childName,
                ], [
                    'slug' => Str::slug($childName),
                    'description' => "{$childName} services",
                    'parent_id' => $parent->id,
                ]);
            }
        }
    }
}
