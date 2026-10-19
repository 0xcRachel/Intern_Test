<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    /**
     * Ensure API requests always negotiate JSON responses, even when the
     * client forgets to send an Accept header. Without this, Sanctum's
     * unauthenticated handler redirects to a non-existent login route.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
