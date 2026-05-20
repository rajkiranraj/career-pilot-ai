<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    protected $fillable = [
        'user_id',
        'content',
        'ats_score',
        'feedback',
    ];

    protected $casts = [
        'ats_score' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
