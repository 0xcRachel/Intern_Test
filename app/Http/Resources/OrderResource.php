<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'status' => $this->status,
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'total' => $this->total,
            'currency' => $this->currency,
            'coupon_code' => $this->coupon_code,
            'payment_method' => $this->payment_method,
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'package_id' => $item->package_id,
                'package_title' => $item->package_title,
                'package_slug' => $item->package_slug,
                'price' => $item->price,
                'quantity' => $item->quantity,
            ])),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
        ];
    }
}
