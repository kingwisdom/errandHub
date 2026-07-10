<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->index('status');
            $table->index('priority');
            $table->index('created_at');
            $table->index(['client_id', 'status']);
            $table->index(['agent_id', 'status']);
        });

        Schema::table('service_listings', function (Blueprint $table) {
            $table->index('status');
            $table->index('price_type');
            $table->index('experience_years');
            $table->index(['agent_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index('created_at');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->index('status');
            $table->index('scheduled_at');
            $table->index(['client_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index('created_at');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index(['service_request_id', 'created_at']);
            $table->index('read_at');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->index(['reviewee_id', 'rating']);
        });

        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->index('is_online');
            $table->index('profile_completion_score');
        });

        Schema::table('service_request_statuses', function (Blueprint $table) {
            $table->index(['service_request_id', 'created_at']);
        });

        Schema::table('portfolio_items', function (Blueprint $table) {
            $table->index('agent_id');
        });

        Schema::table('verification_requests', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['notifiable_id', 'notifiable_type', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropIndex(['client_id', 'status']);
            $table->dropIndex(['agent_id', 'status']);
            $table->dropIndex(['status']);
            $table->dropIndex(['priority']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('service_listings', function (Blueprint $table) {
            $table->dropIndex(['agent_id', 'status']);
            $table->dropIndex(['category_id', 'status']);
            $table->dropIndex(['status']);
            $table->dropIndex(['price_type']);
            $table->dropIndex(['experience_years']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['client_id', 'status']);
            $table->dropIndex(['provider_id', 'status']);
            $table->dropIndex(['status']);
            $table->dropIndex(['scheduled_at']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['service_request_id', 'created_at']);
            $table->dropIndex(['read_at']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['reviewee_id', 'rating']);
        });

        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropIndex(['is_online']);
            $table->dropIndex(['profile_completion_score']);
        });

        Schema::table('service_request_statuses', function (Blueprint $table) {
            $table->dropIndex(['service_request_id', 'created_at']);
        });

        Schema::table('portfolio_items', function (Blueprint $table) {
            $table->dropIndex(['agent_id']);
        });

        Schema::table('verification_requests', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['notifiable_id', 'notifiable_type', 'read_at']);
        });
    }
};
