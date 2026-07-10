<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function allActive(): Collection
    {
        return Category::whereNull('parent_id')
            ->with('children')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function findById(int $id): Category
    {
        return Category::with('parent', 'children')->findOrFail($id);
    }
}
