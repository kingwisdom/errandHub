<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->json('skills')->nullable();
            $table->json('languages')->nullable();
            $table->text('coverage_area')->nullable();
            $table->string('vehicle')->nullable();
            $table->json('available_hours')->nullable();
            $table->unsignedTinyInteger('experience_years')->nullable();
            $table->unsignedInteger('completed_jobs_count')->default(0);
            $table->unsignedInteger('avg_response_time')->nullable();
            $table->unsignedInteger('avg_completion_time')->nullable();
            $table->unsignedTinyInteger('profile_completion_score')->default(0);
            $table->boolean('is_online')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_profiles');
    }
};
