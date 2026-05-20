@extends('layouts.app')

@section('content')
<section class="w-full pt-20 md:pt-32 pb-10 overflow-hidden text-center">
    <div class="space-y-6">
        <h1 class="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title pb-2">
            Your AI Career Coach for<br>Professional Success
        </h1>
        <p class="mx-auto max-w-[600px] text-gray-400 md:text-xl">
            Advance your career with personalized guidance, interview prep, and AI-powered tools for job success.
        </p>
        <div class="flex justify-center space-x-4">
            <a href="/dashboard" class="px-8 py-3 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-colors">
                Get Started
            </a>
            <a href="https://www.youtube.com/roadsidecoder" class="px-8 py-3 border border-border rounded-md hover:bg-white/5 transition-colors">
                Watch Demo
            </a>
        </div>
        <div class="mt-20 px-4">
            <div class="relative max-w-6xl mx-auto border border-border rounded-lg overflow-hidden shadow-2xl">
                <img src="/banner.jpeg" alt="Dashboard Preview" class="w-full h-auto">
            </div>
        </div>
    </div>
</section>
@endsection
