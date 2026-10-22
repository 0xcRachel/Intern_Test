<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'level' => $this->level,
            'duration_hours' => $this->duration_hours,
            'rating' => $this->rating,
            'students_count' => $this->students_count,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'outcomes' => $this->outcomes ?? [],
            'price' => $this->price,
            'units_count' => $this->whenCounted('units'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
