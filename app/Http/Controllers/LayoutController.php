<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LayoutController extends Controller
{
    /**
     * Save layout JSON to server storage
     */
    public function store(Request $request): JsonResponse
    {
        Log::info('Layout store method called', ['request' => $request->all()]);

        $request->validate([
            'layout' => 'required|array',
            'name' => 'nullable|string|max:255',
        ]);

        $layout = $request->input('layout');
        $name = $request->input('name', 'layout_'.now()->format('Y-m-d_H-i-s'));

        Log::info('Processing layout', ['name' => $name, 'layout_count' => count($layout)]);

        // Ensure the name is safe for filesystem
        $filename = Str::slug($name).'.json';

        // Create layouts directory if it doesn't exist
        if (! Storage::disk('local')->exists('layouts')) {
            Log::info('Creating layouts directory');
            Storage::disk('local')->makeDirectory('layouts');
        }

        // Save the layout JSON
        $path = 'layouts/'.$filename;
        $jsonContent = json_encode($layout, JSON_PRETTY_PRINT);

        Log::info('Saving file', ['path' => $path, 'content_length' => strlen($jsonContent)]);

        $result = Storage::disk('local')->put($path, $jsonContent);

        Log::info('File save result', ['result' => $result, 'full_path' => storage_path('app/'.$path)]);

        return response()->json([
            'success' => true,
            'message' => 'Layout saved successfully',
            'filename' => $filename,
            'path' => storage_path('app/private/'.$path),
        ]);
    }

    /**
     * List all saved layouts
     */
    public function index(): JsonResponse
    {
        $files = Storage::disk('local')->files('layouts');

        $layouts = collect($files)->map(function ($file) {
            return [
                'filename' => basename($file),
                'name' => str_replace(['.json', '_'], ['', ' '], basename($file, '.json')),
                'path' => $file,
                'size' => Storage::disk('local')->size($file),
                'modified' => Storage::disk('local')->lastModified($file),
                'created_at' => date('Y-m-d H:i:s', Storage::disk('local')->lastModified($file)),
            ];
        })->sortByDesc('modified')->values();

        return response()->json([
            'layouts' => $layouts,
        ]);
    }

    /**
     * Get a specific layout
     */
    public function show(string $filename): JsonResponse
    {
        $path = 'layouts/'.$filename;

        if (! Storage::disk('local')->exists($path)) {
            return response()->json([
                'error' => 'Layout not found',
            ], 404);
        }

        $content = Storage::disk('local')->get($path);
        $layout = json_decode($content, true);

        return response()->json([
            'filename' => $filename,
            'layout' => $layout,
        ]);
    }
}
