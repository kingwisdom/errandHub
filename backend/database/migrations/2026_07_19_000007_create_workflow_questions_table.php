<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('step_id');
            $table->string('key', 100);
            $table->string('type', 50);
            $table->string('label', 200);
            $table->text('description')->nullable();
            $table->boolean('is_required');
            $table->json('options')->nullable();
            $table->json('validation')->nullable();
            $table->json('dependencies')->nullable();
            $table->json('visibility')->nullable();
            $table->integer('order');
            $table->json('default_value')->nullable();
            $table->string('placeholder', 200)->nullable();
            $table->timestamps();

            $table->foreign('step_id')->references('id')->on('workflow_steps')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_questions');
    }
};
