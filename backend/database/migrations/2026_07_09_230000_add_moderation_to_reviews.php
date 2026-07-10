<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->boolean('is_visible')->default(true)->after('quality_rating');
            $table->foreignUuid('moderated_by_id')->nullable()->constrained('users')->nullOnDelete()->after('is_visible');
            $table->timestamp('moderated_at')->nullable()->after('moderated_by_id');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['is_visible', 'moderated_by_id', 'moderated_at']);
        });
    }
};
