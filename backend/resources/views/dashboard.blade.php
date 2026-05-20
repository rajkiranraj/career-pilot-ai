@extends('layouts.app')

@section('content')
<div class="space-y-8 py-4">
    @if(!$isOnboarded)
        <div class="border border-yellow-500/50 bg-yellow-500/10 rounded-xl p-8 text-center space-y-4">
            <h2 class="text-2xl font-bold text-yellow-500">Complete Your Profile</h2>
            <p class="text-gray-400 max-w-xl mx-auto">To get personalized AI career coaching, insights, and tools, you need to complete your professional profile first.</p>
            <a href="http://localhost:5173/onboarding" class="inline-block px-8 py-3 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 transition-colors">
                Complete Onboarding
            </a>
        </div>
    @else
        <div class="flex items-center justify-between">
            <h1 class="text-6xl font-bold gradient-title text-left">
                Industry Insights
            </h1>
            <div class="flex space-x-4">
                <a href="http://localhost:5173/dashboard" class="px-4 py-2 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                    Go to React App
                </a>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="border border-border rounded-xl bg-black/20 p-6 space-y-2">
                <p class="text-sm font-medium text-gray-400">Market Outlook</p>
                <p class="text-2xl font-bold text-white">{{ $insights->market_outlook ?? 'Generating...' }}</p>
            </div>
            <div class="border border-border rounded-xl bg-black/20 p-6 space-y-2">
                <p class="text-sm font-medium text-gray-400">Industry Growth</p>
                <p class="text-2xl font-bold text-white">{{ $insights->growth_rate ?? '0' }}%</p>
            </div>
            <div class="border border-border rounded-xl bg-black/20 p-6 space-y-2">
                <p class="text-sm font-medium text-gray-400">Demand Level</p>
                <p class="text-2xl font-bold text-white">{{ $insights->demand_level ?? 'Generating...' }}</p>
            </div>
            <div class="border border-border rounded-xl bg-black/20 p-6 space-y-2">
                <p class="text-sm font-medium text-gray-400">Your Industry</p>
                <p class="text-2xl font-bold text-white">{{ Auth::user()->industry }}</p>
            </div>
        </div>

        <div class="border border-border rounded-xl bg-black/20 p-8">
            <h2 class="text-2xl font-bold mb-4 text-white">Welcome back, {{ Auth::user()->name }}!</h2>
            <p class="text-gray-400 mb-6">Your personalized AI career dashboard is ready. Access all features through our high-performance React application.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="space-y-2">
                    <h3 class="font-bold text-white">Resume Builder</h3>
                    <p class="text-sm text-gray-400">Create ATS-optimized resumes with AI assistance.</p>
                    <a href="http://localhost:5173/resume" class="text-sm text-white underline">Open Builder →</a>
                </div>
                <div class="space-y-2">
                    <h3 class="font-bold text-white">Interview Prep</h3>
                    <p class="text-sm text-gray-400">Practice with role-specific questions.</p>
                    <a href="http://localhost:5173/interview" class="text-sm text-white underline">Start Prep →</a>
                </div>
                <div class="space-y-2">
                    <h3 class="font-bold text-white">Cover Letter</h3>
                    <p class="text-sm text-gray-400">Generate compelling cover letters.</p>
                    <a href="http://localhost:5173/ai-cover-letter" class="text-sm text-white underline">Generate Now →</a>
                </div>
            </div>
        </div>
    @endif
</div>
@endsection
