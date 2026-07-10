<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_request_id')->unique()->constrained('service_requests')->cascadeOnDelete();
            $table->foreignUuid('reviewer_id')->constrained('users');
            $table->foreignUuid('reviewee_id')->constrained('users');
            $table->unsignedTinyInteger('rating');
            $table->unsignedTinyInteger('communication_rating')->nullable();
            $table->unsignedTinyInteger('professionalism_rating')->nullable();
            $table->unsignedTinyInteger('timeliness_rating')->nullable();
            $table->unsignedTinyInteger('quality_rating')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
