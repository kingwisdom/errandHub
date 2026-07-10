<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('email_notifications')->default(true);
            $table->boolean('database_notifications')->default(true);
            $table->boolean('request_updates')->default(true);
            $table->boolean('booking_updates')->default(true);
            $table->boolean('chat_messages')->default(true);
            $table->boolean('marketing_emails')->default(false);
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
