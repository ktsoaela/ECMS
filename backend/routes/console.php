<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('send-mail', function () {
    $to = (string) config('mail.test_to');

    if ($to === '') {
        $this->error('Set MAIL_TEST_TO in backend/.env');

        return 1;
    }

    Mail::raw('Congrats for sending test email with Mailtrap!', function ($message) use ($to) {
        $message
            ->from('hello@demomailtrap.co', 'Mailtrap Test')
            ->to($to)
            ->subject('You are awesome!');

        $message->getSymfonyMessage()->getHeaders()->addTextHeader('X-MT-Category', 'Integration Test');
    });

    $this->info("Sent test email to {$to}");
})->purpose('Send Mail');
