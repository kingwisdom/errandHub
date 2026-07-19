<?php

namespace Database\Seeders;

use App\Models\Workflow;
use App\Models\WorkflowStep;
use App\Models\WorkflowQuestion;
use Illuminate\Database\Seeder;

class WorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedFinanceWorkflow();
        $this->seedImmigrationWorkflow();
        $this->seedTravelWorkflow();
        $this->seedShoppingWorkflow();
        $this->seedPropertyWorkflow();
    }

    private function seedFinanceWorkflow(): void
    {
        $workflow = Workflow::updateOrCreate(
            ['slug' => 'finance'],
            [
                'name' => 'Financial Analysis',
                'module' => 'finance',
                'description' => 'Analyse your income, expenses, and goals to create a personalised budget plan.',
                'icon' => 'DollarSign',
                'color' => '#16A34A',
                'config' => ['ai_prompt' => 'Analyse the following financial data and return a structured JSON response with: summary, income_breakdown, expense_breakdown, categories, budget_recommendations, savings_plan, warnings, action_items.'],
            ]
        );

        $steps = [
            ['title' => 'Income Details', 'description' => 'Tell us about your income sources', 'order' => 1, 'type' => 'form'],
            ['title' => 'Expenses & Goals', 'description' => 'Your monthly expenses and financial goals', 'order' => 2, 'type' => 'form'],
            ['title' => 'Upload Statement', 'description' => 'Upload a bank statement for AI analysis (optional)', 'order' => 3, 'type' => 'document'],
            ['title' => 'Review & Analyse', 'description' => 'AI analysis of your financial data', 'order' => 4, 'type' => 'ai_analysis'],
            ['title' => 'Budget Dashboard', 'description' => 'Your personalised budget plan', 'order' => 5, 'type' => 'result'],
            ['title' => 'Recommendations', 'description' => 'AI-powered financial recommendations', 'order' => 6, 'type' => 'result'],
        ];

        foreach ($steps as $stepData) {
            $step = WorkflowStep::updateOrCreate(
                ['workflow_id' => $workflow->id, 'order' => $stepData['order']],
                array_merge($stepData, ['workflow_id' => $workflow->id])
            );

            if ($stepData['order'] === 1) {
                $this->createIncomeQuestions($step);
            } elseif ($stepData['order'] === 2) {
                $this->createExpenseQuestions($step);
            }
        }
    }

    private function createIncomeQuestions(WorkflowStep $step): void
    {
        $questions = [
            ['key' => 'employment_status', 'type' => 'select', 'label' => 'Employment Status', 'is_required' => true, 'order' => 1, 'options' => ['Employed', 'Self-Employed', 'Freelancer', 'Unemployed', 'Student', 'Retired']],
            ['key' => 'monthly_salary', 'type' => 'currency', 'label' => 'Monthly Salary (After Tax)', 'is_required' => true, 'order' => 2, 'placeholder' => 'e.g. 3000'],
            ['key' => 'additional_income', 'type' => 'currency', 'label' => 'Additional Monthly Income', 'is_required' => false, 'order' => 3, 'placeholder' => 'e.g. 500'],
            ['key' => 'income_source', 'type' => 'text', 'label' => 'Source of Additional Income', 'is_required' => false, 'order' => 4, 'placeholder' => 'e.g. Freelancing, Rental'],
        ];

        foreach ($questions as $q) {
            WorkflowQuestion::updateOrCreate(
                ['step_id' => $step->id, 'key' => $q['key']],
                array_merge($q, ['step_id' => $step->id])
            );
        }
    }

    private function createExpenseQuestions(WorkflowStep $step): void
    {
        $questions = [
            ['key' => 'rent_mortgage', 'type' => 'currency', 'label' => 'Rent / Mortgage', 'is_required' => true, 'order' => 1, 'placeholder' => 'e.g. 1200'],
            ['key' => 'utilities', 'type' => 'currency', 'label' => 'Utilities (Electric, Gas, Water)', 'is_required' => false, 'order' => 2, 'placeholder' => 'e.g. 200'],
            ['key' => 'transport', 'type' => 'currency', 'label' => 'Transport', 'is_required' => false, 'order' => 3, 'placeholder' => 'e.g. 150'],
            ['key' => 'food_groceries', 'type' => 'currency', 'label' => 'Food & Groceries', 'is_required' => false, 'order' => 4, 'placeholder' => 'e.g. 400'],
            ['key' => 'subscriptions', 'type' => 'currency', 'label' => 'Subscriptions', 'is_required' => false, 'order' => 5, 'placeholder' => 'e.g. 50'],
            ['key' => 'financial_goals', 'type' => 'multi_select', 'label' => 'Financial Goals', 'is_required' => true, 'order' => 6, 'options' => ['Build Emergency Fund', 'Pay Off Debt', 'Save for Vacation', 'Invest', 'Buy Property', 'Retirement Planning', 'Start Business']],
            ['key' => 'monthly_savings_target', 'type' => 'currency', 'label' => 'Monthly Savings Target', 'is_required' => false, 'order' => 7, 'placeholder' => 'e.g. 500'],
        ];

        foreach ($questions as $q) {
            WorkflowQuestion::updateOrCreate(
                ['step_id' => $step->id, 'key' => $q['key']],
                array_merge($q, ['step_id' => $step->id])
            );
        }
    }

    private function seedImmigrationWorkflow(): void
    {
        $workflow = Workflow::updateOrCreate(
            ['slug' => 'immigration'],
            [
                'name' => 'Immigration Eligibility',
                'module' => 'immigration',
                'description' => 'Check your eligibility for immigration and get a personalised action plan.',
                'icon' => 'Globe',
                'color' => '#2563EB',
                'config' => ['ai_prompt' => 'Analyse the following immigration data and return structured JSON with: eligibility_score, recommended_visa_types, requirements, timeline, document_checklist, risks, action_items.'],
            ]
        );

        $steps = [
            ['title' => 'Personal Information', 'description' => 'Basic details about you', 'order' => 1, 'type' => 'form'],
            ['title' => 'Destination & Goals', 'description' => 'Where do you want to go?', 'order' => 2, 'type' => 'form'],
            ['title' => 'Upload Documents', 'description' => 'Passport, certificates, etc.', 'order' => 3, 'type' => 'document'],
            ['title' => 'Eligibility Check', 'description' => 'AI analysis of your eligibility', 'order' => 4, 'type' => 'ai_analysis'],
            ['title' => 'Timeline & Checklist', 'description' => 'Your immigration timeline', 'order' => 5, 'type' => 'result'],
            ['title' => 'Action Plan', 'description' => 'Personalised next steps', 'order' => 6, 'type' => 'result'],
        ];

        foreach ($steps as $stepData) {
            $step = WorkflowStep::updateOrCreate(
                ['workflow_id' => $workflow->id, 'order' => $stepData['order']],
                array_merge($stepData, ['workflow_id' => $workflow->id])
            );

            if ($stepData['order'] === 1) {
                $this->createImmigrationPersonalQuestions($step);
            } elseif ($stepData['order'] === 2) {
                $this->createImmigrationDestinationQuestions($step);
            }
        }
    }

    private function createImmigrationPersonalQuestions(WorkflowStep $step): void
    {
        $questions = [
            ['key' => 'nationality', 'type' => 'text', 'label' => 'Nationality', 'is_required' => true, 'order' => 1, 'placeholder' => 'e.g. Nigerian'],
            ['key' => 'age', 'type' => 'number', 'label' => 'Age', 'is_required' => true, 'order' => 2, 'placeholder' => 'e.g. 30'],
            ['key' => 'education', 'type' => 'select', 'label' => 'Highest Education', 'is_required' => true, 'order' => 3, 'options' => ['High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Trade Certificate', 'Other']],
            ['key' => 'occupation', 'type' => 'text', 'label' => 'Occupation', 'is_required' => true, 'order' => 4, 'placeholder' => 'e.g. Software Engineer'],
            ['key' => 'english_level', 'type' => 'select', 'label' => 'English Proficiency', 'is_required' => true, 'order' => 5, 'options' => ['Native', 'Fluent', 'Intermediate', 'Basic', 'None']],
            ['key' => 'family_size', 'type' => 'number', 'label' => 'Family Members (including you)', 'is_required' => false, 'order' => 6, 'placeholder' => 'e.g. 3'],
        ];

        foreach ($questions as $q) {
            WorkflowQuestion::updateOrCreate(
                ['step_id' => $step->id, 'key' => $q['key']],
                array_merge($q, ['step_id' => $step->id])
            );
        }
    }

    private function createImmigrationDestinationQuestions(WorkflowStep $step): void
    {
        $questions = [
            ['key' => 'destination_country', 'type' => 'select', 'label' => 'Destination Country', 'is_required' => true, 'order' => 1, 'options' => ['Canada', 'United Kingdom', 'United States', 'Australia', 'Germany', 'New Zealand', 'Japan', 'France', 'Netherlands', 'Sweden']],
            ['key' => 'immigration_purpose', 'type' => 'select', 'label' => 'Primary Purpose', 'is_required' => true, 'order' => 2, 'options' => ['Work', 'Study', 'Family Reunion', 'Business', 'Asylum', 'Retirement']],
            ['key' => 'budget', 'type' => 'currency', 'label' => 'Available Budget for Relocation', 'is_required' => false, 'order' => 3, 'placeholder' => 'e.g. 10000'],
            ['key' => 'timeline', 'type' => 'select', 'label' => 'Desired Timeline', 'is_required' => false, 'order' => 4, 'options' => ['Within 3 months', '3-6 months', '6-12 months', '1-2 years', 'Flexible']],
        ];

        foreach ($questions as $q) {
            WorkflowQuestion::updateOrCreate(
                ['step_id' => $step->id, 'key' => $q['key']],
                array_merge($q, ['step_id' => $step->id])
            );
        }
    }

    private function seedTravelWorkflow(): void
    {
        $workflow = Workflow::updateOrCreate(
            ['slug' => 'travel'],
            [
                'name' => 'Trip Planner',
                'module' => 'travel',
                'description' => 'Plan your perfect trip with AI-powered itineraries and cost estimates.',
                'icon' => 'Plane',
                'color' => '#0891B2',
                'config' => ['ai_prompt' => 'Generate a travel plan with structured JSON: trip_summary, daily_itinerary, cost_breakdown, packing_list, travel_tips, nearby_attractions, accommodation_options, transport_options, recommendations.'],
            ]
        );

        $steps = [
            ['title' => 'Trip Details', 'description' => 'Where and when are you going?', 'order' => 1, 'type' => 'form'],
            ['title' => 'Preferences', 'description' => 'Budget, interests, and accommodation', 'order' => 2, 'type' => 'form'],
            ['title' => 'Generate Plan', 'description' => 'AI itinerary and cost estimate', 'order' => 3, 'type' => 'ai_analysis'],
            ['title' => 'Your Trip', 'description' => 'Your personalised travel plan', 'order' => 4, 'type' => 'result'],
        ];

        foreach ($steps as $stepData) {
            $step = WorkflowStep::updateOrCreate(
                ['workflow_id' => $workflow->id, 'order' => $stepData['order']],
                array_merge($stepData, ['workflow_id' => $workflow->id])
            );

            if ($stepData['order'] === 1) {
                $this->createTravelTripQuestions($step);
            } elseif ($stepData['order'] === 2) {
                $this->createTravelPreferencesQuestions($step);
            }
        }
    }

    private function createTravelTripQuestions(WorkflowStep $step): void
    {
        $questions = [
            ['key' => 'destination', 'type' => 'text', 'label' => 'Destination', 'is_required' => true, 'order' => 1, 'placeholder' => 'e.g. Paris, France'],
            ['key' => 'trip_type', 'type' => 'select', 'label' => 'Trip Type', 'is_required' => true, 'order' => 2, 'options' => ['Solo', 'Couple', 'Family', 'Group of Friends', 'Business']],
            ['key' => 'start_date', 'type' => 'date', 'label' => 'Start Date', 'is_required' => true, 'order' => 3],
            ['key' => 'end_date', 'type' => 'date', 'label' => 'End Date', 'is_required' => true, 'order' => 4],
            ['key' => 'origin', 'type' => 'text', 'label' => 'Travelling From', 'is_required' => true, 'order' => 5, 'placeholder' => 'e.g. London, UK'],
            ['key' => 'num_travellers', 'type' => 'number', 'label' => 'Number of Travellers', 'is_required' => true, 'order' => 6, 'placeholder' => 'e.g. 2'],
        ];

        foreach ($questions as $q) {
            WorkflowQuestion::updateOrCreate(
                ['step_id' => $step->id, 'key' => $q['key']],
                array_merge($q, ['step_id' => $step->id])
            );
        }
    }

    private function createTravelPreferencesQuestions(WorkflowStep $step): void
    {
        $questions = [
            ['key' => 'budget_total', 'type' => 'currency', 'label' => 'Total Trip Budget', 'is_required' => true, 'order' => 1, 'placeholder' => 'e.g. 3000'],
            ['key' => 'budget_per_day', 'type' => 'currency', 'label' => 'Budget Per Day (optional)', 'is_required' => false, 'order' => 2, 'placeholder' => 'e.g. 200'],
            ['key' => 'interests', 'type' => 'multi_select', 'label' => 'Interests', 'is_required' => true, 'order' => 3, 'options' => ['Culture & History', 'Food & Dining', 'Nightlife', 'Adventure & Sports', 'Shopping', 'Relaxation', 'Photography', 'Nature & Outdoors', 'Art & Museums', 'Family-Friendly']],
            ['key' => 'accommodation_type', 'type' => 'select', 'label' => 'Accommodation Preference', 'is_required' => true, 'order' => 4, 'options' => ['Hotel', 'Hostel', 'Airbnb', 'Resort', 'Boutique Hotel', 'No Preference']],
            ['key' => 'travel_style', 'type' => 'select', 'label' => 'Travel Style', 'is_required' => true, 'order' => 5, 'options' => ['Budget', 'Mid-Range', 'Luxury', 'No Preference']],
            ['key' => 'special_requirements', 'type' => 'textarea', 'label' => 'Special Requirements (optional)', 'is_required' => false, 'order' => 6, 'placeholder' => 'e.g. Vegetarian food, wheelchair accessible, pet-friendly...'],
        ];

        foreach ($questions as $q) {
            WorkflowQuestion::updateOrCreate(
                ['step_id' => $step->id, 'key' => $q['key']],
                array_merge($q, ['step_id' => $step->id])
            );
        }
    }

    private function seedShoppingWorkflow(): void
    {
        $workflow = Workflow::updateOrCreate(
            ['slug' => 'shopping'],
            [
                'name' => 'Smart Shopping',
                'module' => 'shopping',
                'description' => 'Compare products, find deals, and make informed purchasing decisions.',
                'icon' => 'ShoppingCart',
                'color' => '#EA580C',
                'config' => ['ai_prompt' => 'Analyse the shopping requirements and return structured JSON: product_summary, alternatives, vendor_comparison, price_analysis, pros_cons, recommendations, savings_estimate, action_items.'],
            ]
        );

        $steps = [
            ['title' => 'What Are You Looking For?', 'description' => 'Tell us about the product you need', 'order' => 1, 'type' => 'form'],
            ['title' => 'Budget & Preferences', 'description' => 'Your budget and brand preferences', 'order' => 2, 'type' => 'form'],
            ['title' => 'Compare & Analyse', 'description' => 'AI product comparison and recommendations', 'order' => 3, 'type' => 'ai_analysis'],
            ['title' => 'Results', 'description' => 'Your personalised shopping guide', 'order' => 4, 'type' => 'result'],
        ];

        foreach ($steps as $stepData) {
            $step = WorkflowStep::updateOrCreate(
                ['workflow_id' => $workflow->id, 'order' => $stepData['order']],
                array_merge($stepData, ['workflow_id' => $workflow->id])
            );

            if ($stepData['order'] === 1) {
                $this->createShoppingProductQuestions($step);
            } elseif ($stepData['order'] === 2) {
                $this->createShoppingBudgetQuestions($step);
            }
        }
    }

    private function createShoppingProductQuestions(WorkflowStep $step): void
    {
        $questions = [
            ['key' => 'product_name', 'type' => 'text', 'label' => 'Product Name', 'is_required' => true, 'order' => 1, 'placeholder' => 'e.g. iPhone 15 Pro, Sony WH-1000XM5'],
            ['key' => 'product_category', 'type' => 'select', 'label' => 'Category', 'is_required' => true, 'order' => 2, 'options' => ['Electronics', 'Appliances', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Software', 'Other']],
            ['key' => 'primary_use', 'type' => 'textarea', 'label' => 'What will you use it for?', 'is_required' => true, 'order' => 3, 'placeholder' => 'e.g. Daily commuting, home office, gaming...'],
            ['key' => 'must_have_features', 'type' => 'textarea', 'label' => 'Must-Have Features', 'is_required' => false, 'order' => 4, 'placeholder' => 'e.g. Wireless, long battery life, waterproof...'],
            ['key' => 'deal_breakers', 'type' => 'textarea', 'label' => 'Deal Breakers', 'is_required' => false, 'order' => 5, 'placeholder' => 'e.g. Too heavy, poor reviews, overpriced...'],
        ];

        foreach ($questions as $q) {
            WorkflowQuestion::updateOrCreate(
                ['step_id' => $step->id, 'key' => $q['key']],
                array_merge($q, ['step_id' => $step->id])
            );
        }
    }

    private function createShoppingBudgetQuestions(WorkflowStep $step): void
    {
        $questions = [
            ['key' => 'budget_min', 'type' => 'currency', 'label' => 'Minimum Budget', 'is_required' => false, 'order' => 1, 'placeholder' => 'e.g. 100'],
            ['key' => 'budget_max', 'type' => 'currency', 'label' => 'Maximum Budget', 'is_required' => true, 'order' => 2, 'placeholder' => 'e.g. 500'],
            ['key' => 'preferred_brands', 'type' => 'text', 'label' => 'Preferred Brands (optional)', 'is_required' => false, 'order' => 3, 'placeholder' => 'e.g. Apple, Samsung, Sony...'],
            ['key' => 'purchase_urgency', 'type' => 'select', 'label' => 'How Soon Do You Need It?', 'is_required' => true, 'order' => 4, 'options' => ['Immediately', 'Within a week', 'Within a month', 'No rush / waiting for deals']],
            ['key' => 'location', 'type' => 'text', 'label' => 'Your Location (for availability)', 'is_required' => false, 'order' => 5, 'placeholder' => 'e.g. London, UK'],
        ];

        foreach ($questions as $q) {
            WorkflowQuestion::updateOrCreate(
                ['step_id' => $step->id, 'key' => $q['key']],
                array_merge($q, ['step_id' => $step->id])
            );
        }
    }

    private function seedPropertyWorkflow(): void
    {
        $workflow = Workflow::updateOrCreate(
            ['slug' => 'property'],
            [
                'name' => 'Property Analysis',
                'module' => 'property',
                'description' => 'Analyse property surveys, affordability, and area insights.',
                'icon' => 'Home',
                'color' => '#CA8A04',
                'config' => ['ai_prompt' => 'Analyse the property data and return structured JSON: property_summary, risk_assessment, repair_priorities, affordability, mortgage_options, area_insights, recommendation.'],
            ]
        );

        $steps = [
            ['title' => 'Property Details', 'description' => 'Tell us about the property', 'order' => 1, 'type' => 'form'],
            ['title' => 'Your Situation', 'description' => 'Budget and preferences', 'order' => 2, 'type' => 'form'],
            ['title' => 'Upload Survey', 'description' => 'Upload a survey report if you have one (optional)', 'order' => 3, 'type' => 'document'],
            ['title' => 'Analyse Property', 'description' => 'AI analysis of the property', 'order' => 4, 'type' => 'ai_analysis'],
            ['title' => 'Results', 'description' => 'Your property report and recommendations', 'order' => 5, 'type' => 'result'],
        ];

        foreach ($steps as $stepData) {
            $step = WorkflowStep::updateOrCreate(
                ['workflow_id' => $workflow->id, 'order' => $stepData['order']],
                array_merge($stepData, ['workflow_id' => $workflow->id])
            );

            if ($stepData['order'] === 1) {
                $this->createPropertyDetailsQuestions($step);
            } elseif ($stepData['order'] === 2) {
                $this->createPropertyBudgetQuestions($step);
            }
        }
    }

    private function createPropertyDetailsQuestions(WorkflowStep $step): void
    {
        $questions = [
            ['key' => 'property_type', 'type' => 'select', 'label' => 'Property Type', 'is_required' => true, 'order' => 1, 'options' => ['Detached House', 'Semi-Detached', 'Terraced House', 'Flat/Apartment', 'Bungalow', 'Cottage', 'New Build', 'Other']],
            ['key' => 'listing_price', 'type' => 'currency', 'label' => 'Asking Price', 'is_required' => true, 'order' => 2, 'placeholder' => 'e.g. 350000'],
            ['key' => 'bedrooms', 'type' => 'number', 'label' => 'Bedrooms', 'is_required' => true, 'order' => 3, 'placeholder' => 'e.g. 3'],
            ['key' => 'bathrooms', 'type' => 'number', 'label' => 'Bathrooms', 'is_required' => false, 'order' => 4, 'placeholder' => 'e.g. 2'],
            ['key' => 'square_footage', 'type' => 'number', 'label' => 'Square Footage', 'is_required' => false, 'order' => 5, 'placeholder' => 'e.g. 1200'],
            ['key' => 'property_age', 'type' => 'select', 'label' => 'Property Age', 'is_required' => false, 'order' => 6, 'options' => ['New Build', 'Under 5 years', '5-20 years', '20-50 years', '50-100 years', 'Over 100 years', 'Unknown']],
            ['key' => 'condition', 'type' => 'select', 'label' => 'Overall Condition', 'is_required' => false, 'order' => 7, 'options' => ['Excellent', 'Good', 'Fair', 'Needs Renovation', 'Unknown']],
            ['key' => 'location', 'type' => 'text', 'label' => 'Property Location', 'is_required' => true, 'order' => 8, 'placeholder' => 'e.g. Manchester, UK'],
        ];

        foreach ($questions as $q) {
            WorkflowQuestion::updateOrCreate(
                ['step_id' => $step->id, 'key' => $q['key']],
                array_merge($q, ['step_id' => $step->id])
            );
        }
    }

    private function createPropertyBudgetQuestions(WorkflowStep $step): void
    {
        $questions = [
            ['key' => 'budget', 'type' => 'currency', 'label' => 'Your Total Budget', 'is_required' => true, 'order' => 1, 'placeholder' => 'e.g. 400000'],
            ['key' => 'deposit', 'type' => 'currency', 'label' => 'Deposit Amount', 'is_required' => true, 'order' => 2, 'placeholder' => 'e.g. 80000'],
            ['key' => 'annual_income', 'type' => 'currency', 'label' => 'Annual Household Income', 'is_required' => true, 'order' => 3, 'placeholder' => 'e.g. 60000'],
            ['key' => 'monthly_commitments', 'type' => 'currency', 'label' => 'Monthly Existing Commitments', 'is_required' => false, 'order' => 4, 'placeholder' => 'e.g. 500'],
            ['key' => 'purpose', 'type' => 'select', 'label' => 'Purchase Purpose', 'is_required' => true, 'order' => 5, 'options' => ['First Home', 'Next Home', 'Buy to Let', 'Holiday Home', 'Investment']],
            ['key' => 'timeline', 'type' => 'select', 'label' => 'Purchase Timeline', 'is_required' => false, 'order' => 6, 'options' => ['Ready to buy now', '1-3 months', '3-6 months', '6-12 months', 'Just researching']],
        ];

        foreach ($questions as $q) {
            WorkflowQuestion::updateOrCreate(
                ['step_id' => $step->id, 'key' => $q['key']],
                array_merge($q, ['step_id' => $step->id])
            );
        }
    }
}
