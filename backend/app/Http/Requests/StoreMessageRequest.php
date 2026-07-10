<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => 'required_without:file|string',
            'type' => 'nullable|in:text,image,voice,location,file',
            'metadata' => 'nullable|array',
            'file' => 'nullable|file|max:10240',
        ];
    }
}
