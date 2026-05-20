<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoverLetter extends Model
{
    protected $fillable = [
        'user_id',
        'content',
        'job_description',
        'company_name',
        'job_title',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
