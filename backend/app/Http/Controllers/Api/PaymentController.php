<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    use ApiResponseTrait;

    /**
     * POST /api/payment/create-order
     * Create a Razorpay payment link.
     */
    public function createOrder(Request $request)
    {
        $request->validate([
            'amount'      => 'required|numeric|min:1',
            'planName'    => 'nullable|string|max:100',
            'callbackUrl' => 'required|url|max:2048',
        ]);

        try {
            $user = Auth::user();

            $amount      = $request->amount;
            $currency    = $request->input('currency', 'INR');
            $planName    = $request->input('planName', 'Pro');
            $callbackUrl = $request->callbackUrl;

            $keyId     = config('services.razorpay.key_id');
            $keySecret = config('services.razorpay.key_secret');

            if (! $keyId || ! $keySecret) {
                return $this->error('Razorpay keys are not configured on the server.', null, 500);
            }


            $response = \Illuminate\Support\Facades\Http::withBasicAuth($keyId, $keySecret)
                ->post('https://api.razorpay.com/v1/payment_links', [
                    'amount'      => (int) round($amount * 100), // convert to paise
                    'currency'    => $currency,
                    'description' => "Upgrade to {$planName} Plan",
                    'customer'    => [
                        'name'  => $user->name ?? explode('@', $user->email)[0] ?? 'User',
                        'email' => $user->email ?? 'user@example.com',
                    ],
                    'notify' => [
                        'sms'   => false,
                        'email' => true,
                    ],
                    'reminder_enable' => true,
                    'callback_url'    => $callbackUrl,
                    'callback_method' => 'get',
                ]);

            if ($response->failed()) {
                Log::error('Razorpay create payment link failed: ' . $response->body());
                return $this->error('Failed to create Razorpay payment link: ' . $response->body(), null, 502);
            }

            return response()->json($response->json());

        } catch (\Exception $e) {
            Log::error('PaymentController@createOrder: ' . $e->getMessage());
            return $this->error('Failed to create order: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * POST /api/payment/verify
     * Verify a Razorpay payment signature and upgrade the user.
     */
    public function verifyPayment(Request $request)
    {
        $request->validate([
            'razorpay_payment_id'              => 'required|string',
            'razorpay_payment_link_id'         => 'required|string',
            'razorpay_payment_link_reference_id' => 'nullable|string',
            'razorpay_payment_link_status'     => 'required|string',
            'razorpay_signature'               => 'required|string',
            'planName'                         => 'nullable|string|max:100',
        ]);

        try {
            $user = Auth::user();

            $paymentId          = $request->razorpay_payment_id;
            $paymentLinkId      = $request->razorpay_payment_link_id;
            $paymentLinkRefId   = $request->input('razorpay_payment_link_reference_id', '');
            $paymentLinkStatus  = $request->razorpay_payment_link_status;
            $signature          = $request->razorpay_signature;
            $planName           = $request->input('planName', 'Pro');

            $keySecret = config('services.razorpay.key_secret');

            if (! $keySecret) {
                return $this->error('Razorpay secret not configured on the server.', null, 500);
            }


            $payload = "{$paymentLinkId}|{$paymentLinkRefId}|{$paymentLinkStatus}|{$paymentId}";
            $generatedSignature = hash_hmac('sha256', $payload, $keySecret);

            if ($generatedSignature !== $signature) {
                return $this->error('Payment signature verification failed.', null, 400);
            }


            $user->update([
                'subscription_plan'   => $planName,
                'subscription_active' => true,
            ]);

            return $this->success([
                'success' => true,
                'message' => 'Payment verified successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('PaymentController@verifyPayment: ' . $e->getMessage());
            return $this->error('Failed to verify payment: ' . $e->getMessage(), null, 500);
        }
    }
}
