<?php

namespace App\Services;

use App\Models\PortfolioItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class PortfolioService
{
    public function listForAgent(int $userId): Collection
    {
        return PortfolioItem::where('agent_id', $userId)
            ->with('category')
            ->latest()
            ->get();
    }

    public function listPublic(int $agentId): Collection
    {
        return PortfolioItem::where('agent_id', $agentId)
            ->with('category')
            ->latest()
            ->get();
    }

    public function findById(int $id): PortfolioItem
    {
        return PortfolioItem::with('category')->findOrFail($id);
    }

    public function create(int $agentId, array $data): PortfolioItem
    {
        $paths = [];
        foreach ($data['images'] as $image) {
            $paths[] = $image->store('portfolio', 'public');
        }

        $data['agent_id'] = $agentId;
        $data['images'] = $paths;

        return PortfolioItem::create($data);
    }

    public function update(int $agentId, int $id, array $data): PortfolioItem
    {
        $item = PortfolioItem::where('agent_id', $agentId)->findOrFail($id);

        if (isset($data['images'])) {
            foreach ($item->images as $oldPath) {
                Storage::disk('public')->delete($oldPath);
            }

            $paths = [];
            foreach ($data['images'] as $image) {
                $paths[] = $image->store('portfolio', 'public');
            }
            $data['images'] = $paths;
        }

        $item->update($data);

        return $item;
    }

    public function delete(int $agentId, int $id): void
    {
        $item = PortfolioItem::where('agent_id', $agentId)->findOrFail($id);

        foreach ($item->images as $path) {
            Storage::disk('public')->delete($path);
        }

        $item->delete();
    }
}
