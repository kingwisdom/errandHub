<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateAvatarRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return response()->json([
            'user' => UserResource::make($user),
            'message' => 'Registration successful. Please check your email to verify your account.',
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());
        $result['user'] = UserResource::make($result['user']);

        return response()->json($result);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request): JsonResponse
    {
        return UserResource::make($request->user()->load('agentProfile'))->response();
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = $this->authService->sendResetLink($request->email);

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)]);
        }

        return response()->json(['message' => __($status)], 400);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = $this->authService->resetPassword($request->validated());

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)]);
        }

        return response()->json(['message' => __($status)], 400);
    }

    public function updateAvatar(UpdateAvatarRequest $request): JsonResponse
    {
        $user = $this->authService->updateAvatar($request->user(), $request->file('avatar'));

        return UserResource::make($user)->response();
    }

    public function sendEmailVerification(Request $request): JsonResponse
    {
        $message = $this->authService->sendEmailVerification($request->user());

        return response()->json(['message' => $message]);
    }

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = $this->authService->verifyEmail($id, $hash);

        $param = $user->wasChanged() ? 'verified=1' : 'verified=already';

        return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/dashboard?' . $param);
    }

    public function sendPhoneVerification(Request $request): JsonResponse
    {
        $request->validate(['phone' => 'required|string']);

        $message = $this->authService->sendPhoneVerification($request->user(), $request->phone);

        return response()->json(['message' => $message]);
    }

    public function verifyPhone(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        $verified = $this->authService->verifyPhone(
            $request->user(),
            $request->phone,
            $request->code
        );

        if (!$verified) {
            return response()->json(['message' => 'Invalid or expired verification code'], 400);
        }

        return response()->json(['message' => 'Phone verified successfully']);
    }
}
