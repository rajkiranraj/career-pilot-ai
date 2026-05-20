<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    protected $fillable = [
        'user_id',
        'quiz_score',
        'questions',
        'category',
        'improvement_tip',
    ];

    protected $casts = [
        'questions' => 'array',
        'quiz_score' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
