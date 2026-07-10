<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_listings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agent_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('price_type')->default('fixed');
            $table->decimal('starting_price', 10, 2)->nullable();
            $table->boolean('is_negotiable')->default(true);
            $table->text('location')->nullable();
            $table->integer('coverage_radius')->nullable()->comment('in km');
            $table->json('photos')->nullable();
            $table->json('availability')->nullable();
            $table->json('tags')->nullable();
            $table->integer('experience_years')->nullable();
            $table->integer('estimated_duration')->nullable()->comment('in minutes');
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_listings');
    }
};
