<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_recommendations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_workflow_id');
            $table->string('type', 50);
            $table->string('title', 200);
            $table->text('description');
            $table->enum('priority', ['low', 'medium', 'high', 'critical']);
            $table->json('action_items')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->foreign('user_workflow_id')->references('id')->on('user_workflows')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_recommendations');
    }
};
