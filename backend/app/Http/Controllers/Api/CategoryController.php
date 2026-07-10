<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    public function index(): JsonResponse
    {
        return CategoryResource::collection($this->categoryService->allActive())->response();
    }

    public function show($id): JsonResponse
    {
        return CategoryResource::make($this->categoryService->findById($id))->response();
    }
}
