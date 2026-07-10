<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->text('cancellation_reason')->nullable()->after('instructions');
            $table->foreignUuid('cancelled_by_id')->nullable()->constrained('users')->nullOnDelete()->after('cancellation_reason');
            $table->timestamp('expires_at')->nullable()->after('cancelled_by_id');
        });
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropColumn(['cancellation_reason', 'cancelled_by_id', 'expires_at']);
        });
    }
};
