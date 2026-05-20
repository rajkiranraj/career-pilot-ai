<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('industry_insights', function (Blueprint $table) {
            $table->id();
            $table->string('industry')->unique();
            $table->json('salary_ranges');
            $table->float('growth_rate');
            $table->string('demand_level');
            $table->json('top_skills');
            $table->string('market_outlook');
            $table->json('key_trends');
            $table->json('recommended_skills');
            $table->timestamp('next_update');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('industry_insights');
    }
};
