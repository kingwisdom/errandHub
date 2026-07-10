<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        protected BookingService $bookingService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return BookingResource::collection(
            $this->bookingService->listForUser($user->id, $user->role)
        )->response();
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $booking = $this->bookingService->book(
            $request->user()->id,
            $request->input('provider_id'),
            $request->validated()
        );

        return BookingResource::make($booking)->response()->setStatusCode(201);
    }

    public function show($id): JsonResponse
    {
        return BookingResource::make($this->bookingService->findById($id))->response();
    }

    public function accept(Request $request, $id): JsonResponse
    {
        $booking = $this->bookingService->accept($request->user()->id, $id);

        return BookingResource::make($booking)->response();
    }

    public function decline(Request $request, $id): JsonResponse
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        $booking = $this->bookingService->decline(
            $request->user()->id,
            $id,
            $request->input('reason')
        );

        return BookingResource::make($booking)->response();
    }

    public function reschedule(Request $request, $id): JsonResponse
    {
        $request->validate(['scheduled_at' => 'required|date']);

        $booking = $this->bookingService->reschedule(
            $request->user()->id,
            $id,
            $request->input('scheduled_at')
        );

        return BookingResource::make($booking)->response();
    }

    public function cancel(Request $request, $id): JsonResponse
    {
        $booking = $this->bookingService->cancel($request->user()->id, $id);

        return BookingResource::make($booking)->response();
    }

    public function complete(Request $request, $id): JsonResponse
    {
        $booking = $this->bookingService->complete($request->user()->id, $id);

        return BookingResource::make($booking)->response();
    }
}
