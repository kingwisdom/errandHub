<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_workflow_id');
            $table->uuid('step_id')->nullable();
            $table->string('original_name', 255);
            $table->string('stored_name', 255);
            $table->string('mime_type', 100);
            $table->integer('size');
            $table->string('path', 500);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->json('extracted_data')->nullable();
            $table->json('ai_analysis')->nullable();
            $table->timestamps();

            $table->foreign('user_workflow_id')->references('id')->on('user_workflows')->onDelete('cascade');
            $table->foreign('step_id')->references('id')->on('workflow_steps')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_documents');
    }
};
