<?php

return [
    'api_key' => env('CINETPAY_API_KEY'),
    'site_id' => env('CINETPAY_SITE_ID'),
    'secret_key' => env('CINETPAY_SECRET_KEY'),
    'mode' => env('CINETPAY_MODE', 'TEST'), // TEST ou PRODUCTION
    'notify_url' => env('CINETPAY_NOTIFY_URL'),
    'return_url' => env('CINETPAY_RETURN_URL'),
    'cancel_url' => env('CINETPAY_CANCEL_URL'),
];