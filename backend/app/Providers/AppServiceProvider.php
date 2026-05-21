<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use PDOException;
use Exception;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('database.default') === 'mysql') {
            try {
                // Attempt to connect to the database to ensure connection is valid
                DB::connection()->getPdo();
            } catch (PDOException $e) {
                // Error code 1049 is "Unknown database" in MySQL
                if ($e->getCode() == 1049 || str_contains($e->getMessage(), 'Unknown database')) {
                    $database = config('database.connections.mysql.database');
                    $charset = config('database.connections.mysql.charset', 'utf8mb4');
                    $collation = config('database.connections.mysql.collation', 'utf8mb4_unicode_ci');

                    // Temporary change connection database config to null to connect without database specified
                    config(['database.connections.mysql.database' => null]);
                    DB::purge('mysql');

                    try {
                        // Create database using direct raw SQL statement
                        DB::connection('mysql')->statement(
                            "CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET {$charset} COLLATE {$collation};"
                        );
                    } catch (Exception $dbError) {
                        Log::error('Failed to auto-create MySQL database: ' . $dbError->getMessage());
                        if (!app()->runningInConsole()) {
                            throw $dbError;
                        }
                    }

                    // Restore database name in configuration
                    config(['database.connections.mysql.database' => $database]);
                    DB::purge('mysql');
                } else {
                    // Avoid crashing console commands (like key:generate) when database is temporarily offline/unreachable
                    if (!app()->runningInConsole()) {
                        throw $e;
                    }
                }
            }

            // Database now exists, check if tables exist and run migrations if 'users' table is missing
            try {
                if (DB::connection()->getDatabaseName() && !Schema::hasTable('users')) {
                    Artisan::call('migrate', ['--force' => true]);
                }
            } catch (Exception $migrationError) {
                Log::error('Auto-migration failed: ' . $migrationError->getMessage());
            }
        }
    }
}

