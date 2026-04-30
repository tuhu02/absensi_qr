<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Otp;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\UserResource;

class PendingEmailVerificationController extends Controller
{
    public function verify(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = $request->user();

        $otp = Otp::where('user_id', $user->id)
            ->where('otp', $request->otp)
            ->where('type', 'pending_email_verification')
            ->where('expires_at', '>=', Carbon::now())
            ->whereNull('used_at')
            ->orderByDesc('id')
            ->first();

        if (!$otp) {
            return response()->json([
                'message' => 'Invalid or expired OTP code'
            ], 400);
        }

        if (!$user->pending_email) {
            return response()->json([
                'message' => 'No pending email to verify.'
            ], 400);
        }

        $user->email = $user->pending_email;
        $user->pending_email = null;
        $user->email_verified_at = now();
        $user->save();

        $otp->used_at = Carbon::now();
        $otp->save();

        Log::info('Pending email verified successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return response()->json([
            'message' => 'Pending email verified successfully',
            'user' => new UserResource($user),
        ]);
    }
}
