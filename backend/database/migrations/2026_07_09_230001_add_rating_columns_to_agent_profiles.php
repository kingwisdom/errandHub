<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->decimal('avg_overall_rating', 3, 2)->default(0)->after('profile_completion_score');
            $table->decimal('avg_communication_rating', 3, 2)->default(0)->after('avg_overall_rating');
            $table->decimal('avg_professionalism_rating', 3, 2)->default(0)->after('avg_communication_rating');
            $table->decimal('avg_timeliness_rating', 3, 2)->default(0)->after('avg_professionalism_rating');
            $table->decimal('avg_quality_rating', 3, 2)->default(0)->after('avg_timeliness_rating');
            $table->integer('total_reviews_count')->default(0)->after('avg_quality_rating');
        });
    }

    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'avg_overall_rating',
                'avg_communication_rating',
                'avg_professionalism_rating',
                'avg_timeliness_rating',
                'avg_quality_rating',
                'total_reviews_count',
            ]);
        });
    }
};
