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
use App\Http\Controllers\Api\NearbySearchController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\AI\ConversationController;
use App\Http\Controllers\Api\AI\HealthController;
use App\Http\Controllers\Api\AI\MessageController as AiMessageController;
use App\Http\Controllers\Api\AI\UploadController;
use App\Http\Controllers\Api\AI\WorkflowController;
use App\Http\Controllers\Api\AI\WorkflowDocumentController;
use App\Http\Controllers\Api\AI\FinanceController;
use App\Http\Controllers\Api\AI\ImmigrationController;
use App\Http\Controllers\Api\AI\ShoppingController;
use App\Http\Controllers\Api\AI\PropertyController;
use App\Http\Controllers\Api\AI\TravelController;
use App\Http\Controllers\Api\AI\ReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health Check
    Route::get('/health', HealthController::class)->name('health');

    // Auth Routes (Public)
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
    Route::get('/auth/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');

    // Public Marketplace Routes
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

        Route::post('/search/nearby', NearbySearchController::class)->middleware('throttle:30,1');
    });

    // AI Routes (Guest Access)
    Route::middleware('guest.uuid')->group(function () {
        Route::resource('ai/conversations', ConversationController::class)->only(['index', 'store', 'show', 'destroy']);

        Route::prefix('ai/conversations/{conversationId}')->group(function () {
            Route::get('/messages', [AiMessageController::class, 'index'])->name('ai.messages.index');
            Route::post('/messages', [AiMessageController::class, 'store'])->name('ai.messages.store');
        });

        Route::resource('ai/uploads', UploadController::class)->only(['index', 'store']);

        Route::get('/ai/workflows', [WorkflowController::class, 'index'])->name('ai.workflows.index');
        Route::get('/ai/workflows/{slug}', [WorkflowController::class, 'show'])->name('ai.workflows.show');
        Route::post('/ai/workflows/{slug}/start', [WorkflowController::class, 'start'])->name('ai.workflows.start');
        Route::post('/ai/workflows/{userWorkflowId}/advance', [WorkflowController::class, 'advance'])->name('ai.workflows.advance');
        Route::get('/ai/my-workflows', [WorkflowController::class, 'myWorkflows'])->name('ai.workflows.my');
        Route::delete('/ai/workflows/{userWorkflowId}', [WorkflowController::class, 'destroy'])->name('ai.workflows.destroy');

        Route::get('/ai/workflows/{userWorkflowId}/documents', [WorkflowDocumentController::class, 'index'])->name('ai.workflow-documents.index');
        Route::post('/ai/workflows/{userWorkflowId}/documents', [WorkflowDocumentController::class, 'store'])->name('ai.workflow-documents.store');

        Route::post('/ai/finance/{userWorkflowId}/analyze', [FinanceController::class, 'analyze'])->name('ai.finance.analyze');
        Route::post('/ai/immigration/{userWorkflowId}/analyze', [ImmigrationController::class, 'analyze'])->name('ai.immigration.analyze');
        Route::post('/ai/shopping/{userWorkflowId}/analyze', [ShoppingController::class, 'analyze'])->name('ai.shopping.analyze');
        Route::post('/ai/property/{userWorkflowId}/analyze', [PropertyController::class, 'analyze'])->name('ai.property.analyze');
        Route::post('/ai/travel/{userWorkflowId}/analyze', [TravelController::class, 'analyze'])->name('ai.travel.analyze');

        Route::get('/ai/reports/{userWorkflowId}/download', [ReportController::class, 'download'])->name('ai.reports.download');
    });

    // Authenticated Routes (Marketplace + AI with User)
    Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {
        // Auth
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Profile
        Route::get('/my-profile', [AgentProfileController::class, 'myProfile']);
        Route::post('/my-profile', [AgentProfileController::class, 'store']);
        Route::put('/my-profile/{id}', [AgentProfileController::class, 'update']);

        // Service Requests
        Route::apiResource('requests', ServiceRequestController::class)->except(['destroy']);
        Route::post('/requests/{id}/accept', [ServiceRequestController::class, 'accept']);
        Route::post('/requests/{id}/confirm', [ServiceRequestController::class, 'confirm']);
        Route::post('/requests/{id}/start-travelling', [ServiceRequestController::class, 'startTravelling']);
        Route::post('/requests/{id}/mark-waiting', [ServiceRequestController::class, 'markWaiting']);
        Route::post('/requests/{id}/start', [ServiceRequestController::class, 'start']);
        Route::post('/requests/{id}/complete', [ServiceRequestController::class, 'complete']);
        Route::post('/requests/{id}/cancel', [ServiceRequestController::class, 'cancel']);
        Route::post('/requests/{id}/photos', [ServiceRequestController::class, 'uploadPhotos']);

        // Messages
        Route::get('/requests/{requestId}/messages', [MessageController::class, 'index']);
        Route::post('/requests/{requestId}/messages', [MessageController::class, 'store']);
        Route::post('/requests/{requestId}/messages/read', [MessageController::class, 'markAsRead']);

        // Reviews
        Route::get('/reviews', [ReviewController::class, 'index']);
        Route::get('/users/{userId}/reviews', [ReviewController::class, 'index']);
        Route::post('/requests/{requestId}/reviews', [ReviewController::class, 'store']);

        // Verification
        Route::post('/email/verification-notification', [AuthController::class, 'sendEmailVerification']);
        Route::post('/phone/verification-notification', [AuthController::class, 'sendPhoneVerification']);
        Route::post('/phone/verify', [AuthController::class, 'verifyPhone']);
        Route::post('/avatar', [AuthController::class, 'updateAvatar']);

        // Portfolio
        Route::get('/portfolio', [PortfolioController::class, 'index']);
        Route::get('/portfolio/completed-requests', [PortfolioController::class, 'completedRequests']);
        Route::post('/portfolio', [PortfolioController::class, 'store']);
        Route::get('/portfolio/{id}', [PortfolioController::class, 'show']);
        Route::put('/portfolio/{id}', [PortfolioController::class, 'update']);
        Route::delete('/portfolio/{id}', [PortfolioController::class, 'destroy']);

        // Service Listings
        Route::apiResource('services', ServiceListingController::class)->except(['show']);
        Route::post('/services/{id}/photos', [ServiceListingController::class, 'uploadPhotos']);

        // Bookings
        Route::apiResource('bookings', BookingController::class)->except(['update', 'destroy']);
        Route::post('/bookings/{id}/accept', [BookingController::class, 'accept']);
        Route::post('/bookings/{id}/decline', [BookingController::class, 'decline']);
        Route::post('/bookings/{id}/reschedule', [BookingController::class, 'reschedule']);
        Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
        Route::post('/bookings/{id}/complete', [BookingController::class, 'complete']);

        // Verification Requests
        Route::post('/verification-requests', [VerificationController::class, 'submit']);
        Route::get('/verification-requests', [VerificationController::class, 'myRequests']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::get('/notifications/preferences', [NotificationController::class, 'preferences']);
        Route::put('/notifications/preferences', [NotificationController::class, 'updatePreferences']);

        // Errand Applications
        Route::post('/errand-applications', [ErrandApplicationController::class, 'store']);
        Route::post('/errand-applications/{id}/withdraw', [ErrandApplicationController::class, 'withdraw']);
        Route::post('/errand-applications/{id}/accept', [ErrandApplicationController::class, 'accept']);
        Route::post('/errand-applications/{id}/reject', [ErrandApplicationController::class, 'reject']);
        Route::get('/requests/{requestId}/applications', [ErrandApplicationController::class, 'forRequest']);
        Route::get('/my-applications', [ErrandApplicationController::class, 'myApplications']);

        // Dashboard
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        // Admin Routes
        Route::middleware('role:super-admin')->group(function () {
            Route::get('/admin/verification-requests/pending', [VerificationController::class, 'pending']);
            Route::get('/admin/verification-requests', [VerificationController::class, 'all']);
            Route::post('/admin/verification-requests/{id}/approve', [VerificationController::class, 'approve']);
            Route::post('/admin/verification-requests/{id}/reject', [VerificationController::class, 'reject']);

            Route::get('/admin/reviews', [AdminReviewController::class, 'index']);
            Route::get('/admin/reviews/flagged', [AdminReviewController::class, 'flagged']);
            Route::post('/admin/reviews/{id}/hide', [AdminReviewController::class, 'hide']);
            Route::post('/admin/reviews/{id}/show', [AdminReviewController::class, 'show']);

            Route::get('/admin/users', [AdminUserController::class, 'index']);
            Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
            Route::post('/admin/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);

            Route::get('/admin/services', [AdminServiceController::class, 'index']);
            Route::post('/admin/services/{id}/status', [AdminServiceController::class, 'updateStatus']);

            Route::get('/admin/requests', [AdminRequestController::class, 'index']);

            Route::get('/admin/categories', [AdminCategoryController::class, 'index']);
            Route::post('/admin/categories', [AdminCategoryController::class, 'store']);
            Route::put('/admin/categories/{id}', [AdminCategoryController::class, 'update']);
            Route::delete('/admin/categories/{id}', [AdminCategoryController::class, 'destroy']);

            Route::get('/admin/analytics', [AdminAnalyticsController::class, 'index']);
        });
    });
});
