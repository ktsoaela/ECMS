<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCampaignRequest;
use App\Http\Resources\CampaignCreatedResource;
use App\Http\Resources\CampaignDetailResource;
use App\Http\Resources\CampaignListResource;
use App\Models\Campaign;
use App\Services\CampaignService;
use Illuminate\Http\JsonResponse;

class CampaignController extends Controller
{
    public function __construct(private readonly CampaignService $campaigns) {}

    public function index(): JsonResponse
    {
        $campaigns = Campaign::query()
            ->orderByDesc('created_at')
            ->get();

        return response()->json(
            CampaignListResource::collection($campaigns)->resolve()
        );
    }

    public function store(StoreCampaignRequest $request): JsonResponse
    {
        $campaign = $this->campaigns->create($request->validated());

        return (new CampaignCreatedResource($campaign))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): CampaignDetailResource|JsonResponse
    {
        $campaign = Campaign::query()
            ->with(['emailJobs' => fn ($query) => $query->orderBy('id')])
            ->find($id);

        if ($campaign === null) {
            return response()->json(['error' => 'Campaign not found'], 404);
        }

        return new CampaignDetailResource($campaign);
    }
}
