<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IndustryInsight extends Model
{
    protected $fillable = [
        'industry',
        'salary_ranges',
        'growth_rate',
        'demand_level',
        'top_skills',
        'market_outlook',
        'key_trends',
        'recommended_skills',
        'next_update',
    ];

    protected $casts = [
        'salary_ranges' => 'array',
        'top_skills' => 'array',
        'key_trends' => 'array',
        'recommended_skills' => 'array',
        'growth_rate' => 'float',
        'next_update' => 'datetime',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'industry', 'industry');
    }
}
