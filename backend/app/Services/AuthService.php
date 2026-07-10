<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): User
    {
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);
        $user->assignRole($user->role);
        $user->sendEmailVerificationNotification();

        return $user;
    }

    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function sendResetLink(string $email): string
    {
        return Password::sendResetLink(['email' => $email]);
    }

    public function resetPassword(array $data): string
    {
        return Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );
    }

    public function sendEmailVerification(User $user): string
    {
        if ($user->hasVerifiedEmail()) {
            return 'Email already verified';
        }

        $user->sendEmailVerificationNotification();

        return 'Verification link sent';
    }

    public function verifyEmail($id, $hash): User
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            abort(403);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return $user;
    }

    public function sendPhoneVerification(User $user, string $phone): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        cache(["phone_verify_{$user->id}" => $code], now()->addMinutes(10));

        logger("Phone verification code for {$user->id}: {$code}");

        return 'Verification code sent to your phone';
    }

    public function updateAvatar(User $user, $avatarFile): User
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $avatarFile->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return $user;
    }

    public function verifyPhone(User $user, string $phone, string $code): bool
    {
        $cached = cache("phone_verify_{$user->id}");

        if (!$cached || $cached !== $code) {
            return false;
        }

        $user->forceFill([
            'phone' => $phone,
            'phone_verified_at' => now(),
        ])->save();

        cache()->forget("phone_verify_{$user->id}");

        return true;
    }
}
