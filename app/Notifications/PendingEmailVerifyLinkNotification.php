<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;

class PendingEmailVerifyLinkNotification extends Notification
{
    use Queueable;

    protected $user;
    protected $pendingEmail;

    public function __construct($user, $pendingEmail)
    {
        $this->user = $user;
        $this->pendingEmail = $pendingEmail;
    }

    public function via(object $notifiable): array
    { 
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl();

        return (new MailMessage)
            ->subject('Verifikasi Email Baru')
            ->greeting('Halo ' . $this->user->name . ',')
            ->line('Silakan klik tombol di bawah ini untuk memverifikasi email baru Anda:')
            ->action('Verifikasi Email', $verificationUrl)
            ->line('Jika Anda tidak meminta perubahan email, abaikan pesan ini.');
    }

    protected function verificationUrl()
    {
        $expiration = Carbon::now()->addMinutes(60);
        $url = URL::temporarySignedRoute(
            'pending-email.verify',
            $expiration,
            [
                'user' => $this->user->id,
                'email' => $this->pendingEmail,
            ]
        );
        return $url;
    }
}
