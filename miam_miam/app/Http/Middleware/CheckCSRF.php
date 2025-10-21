<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class CheckCSRF
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Log::info('CSRF Token', [
            'token' => $request->session()->token(),
            'header' => $request->header('X-CSRF-TOKEN'),
            'hasSession' => $request->hasSession(),
        ]);
        return $next($request);
    }
}
