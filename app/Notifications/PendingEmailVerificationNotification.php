<?php

namespace App\Notifications;

use App\Models\Otp;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PendingEmailVerificationNotification extends Notification
{
    use Queueable;

    public function __construct(public $user)
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $otp = rand(100000, 999999);

        Otp::create([
            'user_id' => $this->user->id,
            'otp' => $otp,

            'type' => 'pending_email_verification',
            'expires_at' => Carbon::now()->addMinutes(60),
        ]);

        return (new MailMessage)
            ->subject('Verifikasi Email Baru')
            ->line('Gunakan kode OTP berikut untuk memverifikasi email baru kamu:')
            ->line($otp)
            ->line('Kode ini berlaku selama 60 menit.');
    }
}