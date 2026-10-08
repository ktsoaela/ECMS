<?php

namespace App\Enums;

enum EmailJobStatus: string
{
    case Pending = 'pending';
    case Sent = 'sent';
    case Failed = 'failed';
}
