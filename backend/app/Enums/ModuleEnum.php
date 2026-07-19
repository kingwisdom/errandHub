<?php

namespace App\Enums;

enum ModuleEnum: string
{
    case CHAT = 'chat';
    case CAREER = 'career';
    case IMMIGRATION = 'immigration';
    case FINANCE = 'finance';
    case SHOPPING = 'shopping';
    case TRAVEL = 'travel';
    case PROPERTY = 'property';

    public function label(): string
    {
        return match ($this) {
            self::CHAT => 'AI Chat',
            self::CAREER => 'Career',
            self::IMMIGRATION => 'Immigration',
            self::FINANCE => 'Finance',
            self::SHOPPING => 'Shopping',
            self::TRAVEL => 'Travel',
            self::PROPERTY => 'Property',
        };
    }
}
