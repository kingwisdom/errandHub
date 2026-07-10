<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Message;
use App\Models\Review;
use App\Models\ServiceListing;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\VerificationRequest;
use App\Notifications\RequestStatusNotification;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function stats(User $user): array
    {
        $base = [
            'notifications' => [
                'unread_count' => $user->notifications()->whereNull('read_at')->count(),
            ],
            'recent_requests' => ServiceRequest::where(function ($q) use ($user) {
                if ($user->role === 'client') {
                    $q->where('client_id', $user->id);
                } elseif ($user->role === 'agent') {
                    $q->where('agent_id', $user->id);
                }
            })->with(['client', 'agent', 'category'])
                ->latest()
                ->take(5)
                ->get(),
        ];

        $role = $user->role;

        if ($role === 'client') {
            return array_merge($base, [
                'role' => 'client',
                'requests_total' => ServiceRequest::where('client_id', $user->id)->count(),
                'requests_by_status' => ServiceRequest::where('client_id', $user->id)
                    ->select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'bookings_total' => Booking::where('client_id', $user->id)->count(),
                'bookings_by_status' => Booking::where('client_id', $user->id)
                    ->select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'messages_unread' => Message::whereHas('serviceRequest', function ($q) use ($user) {
                    $q->where('client_id', $user->id);
                })->where('sender_id', '!=', $user->id)
                    ->whereNull('read_at')
                    ->count(),
                'reviews_given' => Review::where('reviewer_id', $user->id)->count(),
                'reviews_received' => Review::where('reviewee_id', $user->id)->count(),
            ]);
        }

        if ($role === 'agent') {
            $profile = $user->agentProfile;
            return array_merge($base, [
                'role' => 'agent',
                'services_total' => ServiceListing::where('agent_id', $user->id)->count(),
                'services_active' => ServiceListing::where('agent_id', $user->id)
                    ->where('status', 'active')
                    ->count(),
                'requests_total' => ServiceRequest::where('agent_id', $user->id)->count(),
                'requests_by_status' => ServiceRequest::where('agent_id', $user->id)
                    ->select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'bookings_total' => Booking::where('provider_id', $user->id)->count(),
                'bookings_by_status' => Booking::where('provider_id', $user->id)
                    ->select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'messages_unread' => Message::whereHas('serviceRequest', function ($q) use ($user) {
                    $q->where('agent_id', $user->id);
                })->where('sender_id', '!=', $user->id)
                    ->whereNull('read_at')
                    ->count(),
                'reviews_received' => Review::where('reviewee_id', $user->id)->count(),
                'profile_completion' => $profile?->profile_completion_score ?? 0,
                'is_online' => $profile?->is_online ?? false,
                'total_reviews' => $profile?->total_reviews_count ?? 0,
                'avg_rating' => $profile?->avg_overall_rating ?? 0,
                'portfolio_items' => $profile?->user?->portfolioItems()->count() ?? 0,
            ]);
        }

        if ($role === 'super-admin') {
            return array_merge($base, [
                'role' => 'super-admin',
                'total_users' => User::count(),
                'total_clients' => User::where('role', 'client')->count(),
                'total_agents' => User::where('role', 'agent')->count(),
                'total_requests' => ServiceRequest::count(),
                'requests_by_status' => ServiceRequest::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'total_bookings' => Booking::count(),
                'total_reviews' => Review::count(),
                'total_services' => ServiceListing::count(),
                'pending_verifications' => VerificationRequest::where('status', 'pending')->count(),
                'recent_verifications' => VerificationRequest::with('user')
                    ->latest()
                    ->take(5)
                    ->get(),
            ]);
        }

        return $base;
    }
}
