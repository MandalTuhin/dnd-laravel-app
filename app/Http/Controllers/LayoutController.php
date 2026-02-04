<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LayoutController extends Controller
{
    /**
     * Save layout JSON to server storage
     */
    public function store(Request $request): JsonResponse
    {
        Log::info('Layout store method called', ['request' => $request->all()]);

        try {
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

            if ($jsonContent === false) {
                throw new Exception('Failed to encode layout data to JSON');
            }

            Log::info('Saving file', ['path' => $path, 'content_length' => strlen($jsonContent)]);

            $result = Storage::disk('local')->put($path, $jsonContent);

            if (! $result) {
                throw new Exception('Failed to save layout file to storage');
            }

            Log::info('File save result', ['result' => $result, 'full_path' => storage_path('app/'.$path)]);

            return response()->json([
                'success' => true,
                'message' => 'Layout saved successfully',
                'filename' => $filename,
                'path' => storage_path('app/private/'.$path),
            ]);
        } catch (ValidationException $e) {
            Log::error('Layout validation failed', ['errors' => $e->errors()]);
            throw $e; // Re-throw validation exceptions to maintain Laravel's error handling
        } catch (Exception $e) {
            Log::error('Failed to save layout', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save layout: '.$e->getMessage(),
            ], 500);
        }
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
     * Get the latest (most recently modified) layout
     */
    public function latest(): JsonResponse
    {
        try {
            $files = Storage::disk('local')->files('layouts');

            if (empty($files)) {
                return response()->json([
                    'layout' => null,
                    'message' => 'No saved layouts found',
                ]);
            }

            // Get the most recent file directly without full metadata processing
            $latestFile = collect($files)
                ->sortByDesc(fn ($file) => Storage::disk('local')->lastModified($file))
                ->first();

            $content = Storage::disk('local')->get($latestFile);

            if ($content === false) {
                throw new Exception('Failed to read latest layout file');
            }

            $layout = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON in latest layout file: '.json_last_error_msg());
            }

            return response()->json([
                'filename' => basename($latestFile),
                'layout' => $layout,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to load latest layout', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'layout' => null,
                'error' => 'Failed to load latest layout: '.$e->getMessage(),
            ], 500);
        }
    }

    public function show(string $filename): JsonResponse
    {
        try {
            $path = 'layouts/'.$filename;

            if (! Storage::disk('local')->exists($path)) {
                return response()->json([
                    'error' => 'Layout not found',
                ], 404);
            }

            $content = Storage::disk('local')->get($path);

            if ($content === false) {
                throw new Exception('Failed to read layout file');
            }

            $layout = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON in layout file: '.json_last_error_msg());
            }

            return response()->json([
                'filename' => $filename,
                'layout' => $layout,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to load layout', [
                'filename' => $filename,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to load layout: '.$e->getMessage(),
            ], 500);
        }
    }
}
