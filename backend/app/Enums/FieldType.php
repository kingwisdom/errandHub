<?php

namespace App\Enums;

enum FieldType: string
{
    case TEXT = 'text';
    case TEXTAREA = 'textarea';
    case EMAIL = 'email';
    case PHONE = 'phone';
    case NUMBER = 'number';
    case CURRENCY = 'currency';
    case DATE = 'date';
    case TIME = 'time';
    case CHECKBOX = 'checkbox';
    case RADIO = 'radio';
    case SELECT = 'select';
    case MULTI_SELECT = 'multi_select';
    case FILE = 'file';
    case IMAGE = 'image';
    case ADDRESS = 'address';
    case SLIDER = 'slider';
    case RATING = 'rating';
    case TAGS = 'tags';
}
