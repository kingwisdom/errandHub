<?php

namespace App\Console\Commands;

use App\Models\ServiceRequest;
use App\Models\ServiceRequestStatus;
use Illuminate\Console\Command;

class ExpireStaleRequests extends Command
{
    protected $signature = 'requests:expire-stale';
    protected $description = 'Expire published service requests past their deadline or older than 7 days';

    public function handle(): int
    {
        $cutoff = now()->subDays(7);

        $expired = ServiceRequest::where('status', 'published')
            ->where(function ($q) use ($cutoff) {
                $q->where('deadline', '<', now())
                  ->orWhere('created_at', '<', $cutoff);
            })
            ->get();

        $count = 0;
        foreach ($expired as $request) {
            $request->update(['status' => 'expired']);

            ServiceRequestStatus::create([
                'service_request_id' => $request->id,
                'from_status' => 'published',
                'to_status' => 'expired',
                'user_id' => $request->client_id,
                'note' => 'Auto-expired: deadline passed or stale',
            ]);

            $count++;
        }

        $this->info("Expired {$count} stale request(s).");

        return Command::SUCCESS;
    }
}
