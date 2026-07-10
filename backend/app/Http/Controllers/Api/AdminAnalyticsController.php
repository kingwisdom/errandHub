<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\ServiceListing;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\VerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    public function index(): JsonResponse
    {
        $now = now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        $currentPeriodUsers = User::where('created_at', '>=', $thirtyDaysAgo)->count();
        $previousPeriodUsers = User::where('created_at', '>=', $sixtyDaysAgo)->where('created_at', '<', $thirtyDaysAgo)->count();

        $currentPeriodRequests = ServiceRequest::where('created_at', '>=', $thirtyDaysAgo)->count();
        $previousPeriodRequests = ServiceRequest::where('created_at', '>=', $sixtyDaysAgo)->where('created_at', '<', $thirtyDaysAgo)->count();

        $currentPeriodBookings = Booking::where('created_at', '>=', $thirtyDaysAgo)->count();
        $previousPeriodBookings = Booking::where('created_at', '>=', $sixtyDaysAgo)->where('created_at', '<', $thirtyDaysAgo)->count();

        $usersByDay = User::where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $requestsByDay = ServiceRequest::where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $bookingsByDay = Booking::where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topAgents = User::where('role', 'agent')
            ->withCount(['agentRequests as completed_count' => function ($q) {
                $q->where('status', 'completed');
            }])
            ->with('agentProfile')
            ->orderByDesc('completed_count')
            ->take(10)
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'completed_count' => $u->completed_count,
                'avg_rating' => $u->agentProfile?->avg_overall_rating ?? 0,
            ]);

        return response()->json([
            'data' => [
                'summary' => [
                    'total_users' => User::count(),
                    'total_agents' => User::where('role', 'agent')->count(),
                    'total_clients' => User::where('role', 'client')->count(),
                    'total_requests' => ServiceRequest::count(),
                    'total_bookings' => Booking::count(),
                    'total_reviews' => Review::count(),
                    'total_services' => ServiceListing::count(),
                    'pending_verifications' => VerificationRequest::where('status', 'pending')->count(),
                ],
                'growth' => [
                    'users' => ['current' => $currentPeriodUsers, 'previous' => $previousPeriodUsers],
                    'requests' => ['current' => $currentPeriodRequests, 'previous' => $previousPeriodRequests],
                    'bookings' => ['current' => $currentPeriodBookings, 'previous' => $previousPeriodBookings],
                ],
                'trends' => [
                    'users_by_day' => $usersByDay,
                    'requests_by_day' => $requestsByDay,
                    'bookings_by_day' => $bookingsByDay,
                ],
                'top_agents' => $topAgents,
                'requests_by_status' => ServiceRequest::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'bookings_by_status' => Booking::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
            ],
        ]);
    }
}
