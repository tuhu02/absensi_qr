<?php

namespace App\Http\Controllers\Settings;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\URL;

class PendingEmailVerificationController extends Controller
{
    public function __invoke(Request $request)
    {
        $userId = $request->route('user');
        $pendingEmail = $request->route('email');

        if (! $request->hasValidSignature()) {
            abort(403, 'Invalid or expired verification link.');
        }

        $user = User::findOrFail($userId);

        if ($user->pending_email !== $pendingEmail) {
            abort(403, 'Email mismatch.');
        }

        $user->email = $user->pending_email;
        $user->pending_email = null;
        $user->email_verified_at = now();
        $user->save();

        Auth::login($user);

        return Redirect::route('profile.edit')->with('status', 'Email berhasil diverifikasi!');
    }
}
