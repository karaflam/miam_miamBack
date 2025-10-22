<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Http\Resources\EvenementResource;
use App\Http\Requests\StoreEvenementRequest;
use App\Http\Requests\UpdateEvenementRequest;
use Illuminate\Support\Facades\Storage;

class EvenementController extends Controller
{
    public function index()
    {
        $evenements = Evenement::actif()->orderBy('date_debut', 'desc')->get();
        return EvenementResource::collection($evenements);
    }

    public function show($id)
    {
        $item = Evenement::findOrFail($id);
        return new EvenementResource($item);
    }

    public function store(StoreEvenementRequest $request)
    {
        $data = $request->validated();
        if ($request->hasFile('affiche')) {
            $path = $request->file('affiche')->store('evenements', 'public');
            $data['url_affiche'] = Storage::url($path);
        }
        $item = Evenement::create($data);
        return new EvenementResource($item);
    }

    public function update(UpdateEvenementRequest $request, $id)
    {
        $item = Evenement::findOrFail($id);
        $data = $request->validated();
        if ($request->hasFile('affiche')) {
            $path = $request->file('affiche')->store('evenements', 'public');
            $data['url_affiche'] = Storage::url($path);
        }
        $item->update($data);
        return new EvenementResource($item);
    }

    public function destroy($id)
    {
        $item = Evenement::findOrFail($id);
        $item->delete();
        return response()->json(['deleted' => true]);
    }

    public function toggle($id)
    {
        $item = Evenement::findOrFail($id);
        $item->active = $item->active === 'oui' ? 'non' : 'oui';
        $item->save();
        return new EvenementResource($item);
    }
}

