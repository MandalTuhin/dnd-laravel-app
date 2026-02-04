<?php

use App\Http\Controllers\LayoutController;
use Illuminate\Support\Facades\Route;

// Layout management routes (no CSRF protection needed for API)
Route::prefix('layouts')->group(function () {
    Route::post('/', [LayoutController::class, 'store'])->name('api.layouts.store');
    Route::get('/latest', [LayoutController::class, 'latest'])->name('api.layouts.latest');
});
