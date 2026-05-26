<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saved_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('remotive_job_id');
            $table->string('title', 500);
            $table->string('company_name');
            $table->string('company_logo', 1000)->nullable();
            $table->string('job_url', 1000);
            $table->string('salary')->nullable();
            $table->string('job_type', 50)->nullable();
            $table->string('location')->nullable();
            $table->string('category')->nullable();
            $table->timestamp('saved_at')->useCurrent();

            $table->unique(['user_id', 'remotive_job_id']);
            $table->index('user_id');
            $table->index('remotive_job_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_jobs');
    }
};
