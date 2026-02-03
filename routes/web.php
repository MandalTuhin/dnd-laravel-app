<?php

use App\Http\Controllers\LayoutController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('WorkspaceBuilder');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Layout management routes
Route::prefix('api/layouts')->group(function () {
    Route::post('/', [LayoutController::class, 'store'])->name('layouts.store');
    Route::get('/', [LayoutController::class, 'index'])->name('layouts.index');
    Route::get('/{filename}', [LayoutController::class, 'show'])->name('layouts.show');
});

require __DIR__.'/settings.php';
