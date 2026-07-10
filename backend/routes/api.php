<?php

use App\Http\Controllers\Api\AdminAnalyticsController;
use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminRequestController;
use App\Http\Controllers\Api\AdminReviewController;
use App\Http\Controllers\Api\AdminServiceController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AgentProfileController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ErrandApplicationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ServiceListingController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\Api\VerificationController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');

Route::middleware('throttle:60,1')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);

    Route::get('/agents', [AgentProfileController::class, 'index']);
    Route::get('/agents/{id}', [AgentProfileController::class, 'show']);
    Route::get('/agents/{agentId}/portfolio', [PortfolioController::class, 'showAgent']);

    Route::get('/requests/browse', [ServiceRequestController::class, 'browsePublished']);
    Route::get('/requests/{id}', [ServiceRequestController::class, 'show']);
    Route::get('/services/browse', [ServiceListingController::class, 'browsePublished']);
    Route::get('/services/{id}', [ServiceListingController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/my-profile', [AgentProfileController::class, 'myProfile']);
    Route::post('/my-profile', [AgentProfileController::class, 'store']);
    Route::put('/my-profile/{id}', [AgentProfileController::class, 'update']);

    Route::apiResource('requests', ServiceRequestController::class)->except(['destroy']);
    Route::post('/requests/{id}/accept', [ServiceRequestController::class, 'accept']);
    Route::post('/requests/{id}/confirm', [ServiceRequestController::class, 'confirm']);
    Route::post('/requests/{id}/start-travelling', [ServiceRequestController::class, 'startTravelling']);
    Route::post('/requests/{id}/mark-waiting', [ServiceRequestController::class, 'markWaiting']);
    Route::post('/requests/{id}/start', [ServiceRequestController::class, 'start']);
    Route::post('/requests/{id}/complete', [ServiceRequestController::class, 'complete']);
    Route::post('/requests/{id}/cancel', [ServiceRequestController::class, 'cancel']);
    Route::post('/requests/{id}/photos', [ServiceRequestController::class, 'uploadPhotos']);

    Route::get('/requests/{requestId}/messages', [MessageController::class, 'index']);
    Route::post('/requests/{requestId}/messages', [MessageController::class, 'store']);
    Route::post('/requests/{requestId}/messages/read', [MessageController::class, 'markAsRead']);

    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::get('/users/{userId}/reviews', [ReviewController::class, 'index']);
    Route::post('/requests/{requestId}/reviews', [ReviewController::class, 'store']);

    Route::post('/email/verification-notification', [AuthController::class, 'sendEmailVerification']);
    Route::post('/phone/verification-notification', [AuthController::class, 'sendPhoneVerification']);
    Route::post('/phone/verify', [AuthController::class, 'verifyPhone']);
    Route::post('/avatar', [AuthController::class, 'updateAvatar']);

    Route::get('/portfolio', [PortfolioController::class, 'index']);
    Route::get('/portfolio/completed-requests', [PortfolioController::class, 'completedRequests']);
    Route::post('/portfolio', [PortfolioController::class, 'store']);
    Route::get('/portfolio/{id}', [PortfolioController::class, 'show']);
    Route::put('/portfolio/{id}', [PortfolioController::class, 'update']);
    Route::delete('/portfolio/{id}', [PortfolioController::class, 'destroy']);

    Route::apiResource('services', ServiceListingController::class)->except(['show']);
    Route::post('/services/{id}/photos', [ServiceListingController::class, 'uploadPhotos']);

    Route::apiResource('bookings', BookingController::class)->except(['update', 'destroy']);
    Route::post('/bookings/{id}/accept', [BookingController::class, 'accept']);
    Route::post('/bookings/{id}/decline', [BookingController::class, 'decline']);
    Route::post('/bookings/{id}/reschedule', [BookingController::class, 'reschedule']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::post('/bookings/{id}/complete', [BookingController::class, 'complete']);

    Route::post('/verification-requests', [VerificationController::class, 'submit']);
    Route::get('/verification-requests', [VerificationController::class, 'myRequests']);
    Route::get('/admin/verification-requests/pending', [VerificationController::class, 'pending'])->middleware('role:super-admin');
    Route::get('/admin/verification-requests', [VerificationController::class, 'all'])->middleware('role:super-admin');
    Route::post('/admin/verification-requests/{id}/approve', [VerificationController::class, 'approve'])->middleware('role:super-admin');
    Route::post('/admin/verification-requests/{id}/reject', [VerificationController::class, 'reject'])->middleware('role:super-admin');

    Route::get('/admin/reviews', [AdminReviewController::class, 'index'])->middleware('role:super-admin');
    Route::get('/admin/reviews/flagged', [AdminReviewController::class, 'flagged'])->middleware('role:super-admin');
    Route::post('/admin/reviews/{id}/hide', [AdminReviewController::class, 'hide'])->middleware('role:super-admin');
    Route::post('/admin/reviews/{id}/show', [AdminReviewController::class, 'show'])->middleware('role:super-admin');

    Route::get('/admin/users', [AdminUserController::class, 'index'])->middleware('role:super-admin');
    Route::get('/admin/users/{id}', [AdminUserController::class, 'show'])->middleware('role:super-admin');
    Route::post('/admin/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus'])->middleware('role:super-admin');

    Route::get('/admin/services', [AdminServiceController::class, 'index'])->middleware('role:super-admin');
    Route::post('/admin/services/{id}/status', [AdminServiceController::class, 'updateStatus'])->middleware('role:super-admin');

    Route::get('/admin/requests', [AdminRequestController::class, 'index'])->middleware('role:super-admin');

    Route::get('/admin/categories', [AdminCategoryController::class, 'index'])->middleware('role:super-admin');
    Route::post('/admin/categories', [AdminCategoryController::class, 'store'])->middleware('role:super-admin');
    Route::put('/admin/categories/{id}', [AdminCategoryController::class, 'update'])->middleware('role:super-admin');
    Route::delete('/admin/categories/{id}', [AdminCategoryController::class, 'destroy'])->middleware('role:super-admin');

    Route::get('/admin/analytics', [AdminAnalyticsController::class, 'index'])->middleware('role:super-admin');

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/preferences', [NotificationController::class, 'preferences']);
    Route::put('/notifications/preferences', [NotificationController::class, 'updatePreferences']);

    Route::post('/errand-applications', [ErrandApplicationController::class, 'store']);
    Route::post('/errand-applications/{id}/withdraw', [ErrandApplicationController::class, 'withdraw']);
    Route::post('/errand-applications/{id}/accept', [ErrandApplicationController::class, 'accept']);
    Route::post('/errand-applications/{id}/reject', [ErrandApplicationController::class, 'reject']);
    Route::get('/requests/{requestId}/applications', [ErrandApplicationController::class, 'forRequest']);
    Route::get('/my-applications', [ErrandApplicationController::class, 'myApplications']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
});
