<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Notification;

class OrderActivatedNotification extends Notification
{
    public function __construct(
        private readonly Order $order,
        private readonly bool $forAdmin = false,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'tone' => 'success',
            'title' => $this->forAdmin ? 'Có đơn hàng mới' : 'Khóa học đã được kích hoạt',
            'message' => $this->forAdmin
                ? "Đơn {$this->order->code} vừa được thanh toán demo."
                : "Đơn {$this->order->code} đã hoàn tất; khóa học đã có trong thư viện.",
            'action_url' => $this->forAdmin
                ? "/admin/orders/{$this->order->id}"
                : "/orders/{$this->order->id}",
            'order_id' => $this->order->id,
            'order_code' => $this->order->code,
        ];
    }
}
