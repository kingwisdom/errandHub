<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('errand_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_request_id')->constrained('service_requests')->cascadeOnDelete();
            $table->foreignUuid('agent_id')->constrained('users')->cascadeOnDelete();
            $table->text('cover_letter')->nullable();
            $table->decimal('proposed_budget', 10, 2)->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->unique(['service_request_id', 'agent_id']);
            $table->index(['agent_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('errand_applications');
    }
};
