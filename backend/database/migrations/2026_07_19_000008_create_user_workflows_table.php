<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_workflows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('guest_uuid')->index();
            $table->uuid('workflow_id');
            $table->uuid('current_step_id')->nullable();
            $table->enum('status', ['in_progress', 'completed', 'abandoned'])->default('in_progress');
            $table->json('data')->nullable();
            $table->unsignedInteger('progress')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('workflow_id')->references('id')->on('workflows');
            $table->foreign('current_step_id')->references('id')->on('workflow_steps')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_workflows');
    }
};
