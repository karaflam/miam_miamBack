<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\UsagePromo;
use App\Http\Requests\StoreUsagePromoRequest;
use App\Http\Requests\UpdateUsagePromoRequest;
use Illuminate\Http\JsonResponse;

class UsagePromoController extends Controller
{
    //<?php




    public function index(): JsonResponse
    {
        $usages = UsagePromo::with(['evenement', 'commande', 'utilisateur'])->get();
        return response()->json($usages);
    }

    public function store(StoreUsagePromoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['date_utilisation'] = now();
        
        $usage = UsagePromo::create($data);
        return response()->json($usage, 201);
    }

    public function show(int $id): JsonResponse
    {
        $usage = UsagePromo::with(['evenement', 'commande', 'utilisateur'])->findOrFail($id);
        return response()->json($usage);
    }

    public function update(UpdateUsagePromoRequest $request, int $id): JsonResponse
    {
        $usage = UsagePromo::findOrFail($id);
        $usage->update($request->validated());
        
        return response()->json($usage);
    }

    public function destroy(int $id): JsonResponse
    {
        UsagePromo::findOrFail($id)->delete();
        return response()->json(['message' => 'Supprimé']);
    }
}

