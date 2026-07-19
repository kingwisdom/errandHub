<?php

namespace App\Enums;

enum MessageRoleEnum: string
{
    case USER = 'user';
    case ASSISTANT = 'assistant';
}
