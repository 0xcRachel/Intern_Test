<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class SocialAuthController extends Controller
{
    private const PROVIDERS = ['google', 'github'];

    public function providers(): JsonResponse
    {
        return response()->json([
            'data' => collect(self::PROVIDERS)->mapWithKeys(fn (string $provider) => [
                $provider => [
                    'configured' => $this->isConfigured($provider),
                ],
            ]),
        ]);
    }

    public function redirect(string $provider)
    {
        if (! in_array($provider, self::PROVIDERS, true)) {
            return $this->failure('Nhà cung cấp đăng nhập không được hỗ trợ.');
        }

        if (! $this->isConfigured($provider)) {
            return $this->failure("Đăng nhập {$provider} chưa được cấu hình. Thêm client ID và secret vào .env để bật.");
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback(string $provider)
    {
        if (! in_array($provider, self::PROVIDERS, true) || ! $this->isConfigured($provider)) {
            return $this->failure('Không thể hoàn tất đăng nhập OAuth.');
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (Throwable $exception) {
            report($exception);

            return $this->failure('Đăng nhập OAuth thất bại hoặc đã bị hủy.');
        }

        $email = $socialUser->getEmail();
        if (! $email) {
            return $this->failure('Tài khoản OAuth không cung cấp email.');
        }

        $user = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if (! $user) {
            $user = User::where('email', $email)->first();
        }

        if ($user) {
            $user->update([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar() ?: $user->avatar,
            ]);
        } else {
            $user = User::create([
                'name' => $socialUser->getName() ?: Str::before($email, '@'),
                'email' => $email,
                'password' => Hash::make(Str::random(40)),
                'role' => 'student',
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
                'email_verified_at' => now(),
            ]);
        }

        $token = $user->createToken("oauth-{$provider}")->plainTextToken;
        $code = Str::random(48);

        Cache::put("oauth_login:{$code}", [
            'token' => $token,
            // Cache only scalars/arrays. Serializing an Eloquent model here can
            // restore as an incomplete object on the follow-up exchange request.
            'user' => $user->fresh()->only([
                'id',
                'name',
                'email',
                'role',
                'avatar',
                'target_band',
                'bio',
            ]),
        ], now()->addMinutes(3));

        return redirect(
            rtrim(config('services.frontend_url'), '/').'/login?oauth_code='.$code
        );
    }

    public function exchange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:80'],
        ]);

        $payload = Cache::pull('oauth_login:'.$validated['code']);

        if (! $payload) {
            return response()->json([
                'message' => 'Mã đăng nhập OAuth không hợp lệ hoặc đã hết hạn.',
            ], 422);
        }

        return response()->json([
            'token' => $payload['token'],
            'user' => $payload['user'] instanceof User
                ? $payload['user']->only([
                    'id',
                    'name',
                    'email',
                    'role',
                    'avatar',
                    'target_band',
                    'bio',
                ])
                : $payload['user'],
        ]);
    }

    private function isConfigured(string $provider): bool
    {
        return filled(config("services.{$provider}.client_id"))
            && filled(config("services.{$provider}.client_secret"));
    }

    private function failure(string $message)
    {
        return redirect(
            rtrim(config('services.frontend_url'), '/').'/login?oauth_error='.urlencode($message)
        );
    }
}
