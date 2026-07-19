<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureGuestUuid
{
    public function handle(Request $request, Closure $next): Response
    {
        $guestUuid = $request->header('X-Guest-UUID');

        if (!$guestUuid) {
            return response()->json([
                'success' => false,
                'message' => 'X-Guest-UUID header is required',
            ], 401);
        }

        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $guestUuid)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Guest UUID format',
            ], 401);
        }

        $request->merge(['guest_uuid' => $guestUuid]);

        return $next($request);
    }
}
