<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Http\Resources\MenuResource;
use App\Http\Requests\StoreMenuRequest;
use App\Http\Requests\UpdateMenuRequest;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index()
    {
        $menu = Menu::with('categorie', 'stock')
                    ->disponible()
                    ->get();

        return MenuResource::collection($menu);
    }

    public function store(StoreMenuRequest $request)
    {
        $article = Menu::create($request->validated());
        return new MenuResource($article);
    }

    public function update(UpdateMenuRequest $request, $id)
    {
        $article = Menu::findOrFail($id);
        $article->update($request->validated());
        return new MenuResource($article);
    }
}
