<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StatistiqueRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'type_statistique' => 'required|string|max:255',
            'valeur' => 'required|numeric',
            'periode' => 'nullable|string|max:255',
            'date_statistique' => 'nullable|date',
        ];
    }
}


