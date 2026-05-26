<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedJob extends Model
{
    public $timestamps = false;

    protected $table = 'saved_jobs';

    protected $fillable = [
        'user_id',
        'remotive_job_id',
        'title',
        'company_name',
        'company_logo',
        'job_url',
        'salary',
        'job_type',
        'location',
        'category',
        'saved_at',
    ];

    protected $casts = [
        'saved_at' => 'datetime',
        'remotive_job_id' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
