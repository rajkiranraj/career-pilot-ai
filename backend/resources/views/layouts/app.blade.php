<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'CareerPilot') }}</title>

        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                darkMode: 'class',
                theme: {
                    extend: {
                        colors: {
                            background: 'hsl(0 0% 3.9%)',
                            foreground: 'hsl(0 0% 98%)',
                            primary: 'hsl(0 0% 98%)',
                            border: 'hsl(0 0% 14.9%)',
                        }
                    }
                }
            }
        </script>
        <style>
            .grid-background {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                background-size: 50px 50px;
                pointer-events: none;
                z-index: -1;
            }
            .grid-background::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, transparent, rgba(0, 0, 0, 0.9));
            }
            .gradient-title {
                background: linear-gradient(to bottom, #9ca3af, #e5e7eb, #4b5563);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        </style>

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])

        <!-- Styles -->
        @livewireStyles
    </head>
    <body class="bg-background text-foreground antialiased min-h-screen">
        <div class="grid-background"></div>

        <header class="fixed top-0 w-full border-b border-border bg-background/80 backdrop-blur-md z-50">
            <nav class="container mx-auto px-4 h-24 flex items-center justify-between">
                <a href="/" class="flex items-center">
                    <img src="/logo.png" alt="CareerPilot" class="h-16 w-16 md:h-20 md:w-20 object-contain rounded-2xl md:rounded-3xl">
                </a>
                <div class="flex items-center space-x-2 md:space-x-4">
                    @auth
                        <a href="/dashboard" class="hidden md:inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-white/5 transition-all text-sm font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                            Industry Insights
                        </a>

                        <!-- Growth Tools Dropdown -->
                        <div class="relative group">
                            <button class="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-all text-sm font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-stars"><path d="M13.8 17.5 18.5 22 23 17.5l-4.5-4.5-4.7 4.5Z"/><path d="m11 17-3-3-3 3 3 3 3-3Z"/><path d="m11 9-3-3-3 3 3 3 3-3Z"/><path d="m20 9-3-3-3 3 3 3 3-3Z"/><path d="m10 5-2-2-2 2 2 2 2-2Z"/></svg>
                                <span class="hidden md:block">Growth Tools</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                            <div class="absolute right-0 mt-2 w-48 bg-black border border-border rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <a href="http://localhost:5173/resume" class="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 border-b border-border">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                                    Build Resume
                                </a>
                                <a href="http://localhost:5173/ai-cover-letter" class="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 border-b border-border">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pen-box"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                                    Cover Letter
                                </a>
                                <a href="http://localhost:5173/interview" class="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                                    Interview Prep
                                </a>
                            </div>
                        </div>

                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="px-4 py-2 border border-border rounded-md hover:bg-white/5 transition-all text-sm font-medium">Sign Out</button>
                        </form>
                    @endauth
                </div>
            </nav>
        </header>

        <div class="pt-16">
            <!-- Page Heading -->
            @if (isset($header))
                <header class="bg-black/20 border-b border-border">
                    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {{ $header }}
                    </div>
                </header>
            @endif

            <!-- Page Content -->
            <main class="container mx-auto px-4 py-8">
                {{ $slot ?? '' }}
                @yield('content')
            </main>
        </div>

        @stack('modals')

        @livewireScripts
    </body>
</html>
