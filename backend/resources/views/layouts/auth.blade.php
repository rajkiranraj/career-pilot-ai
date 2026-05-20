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
    </style>
</head>
<body class="bg-background text-foreground antialiased min-h-screen flex items-center justify-center p-4">
    <div class="grid-background"></div>
    <div class="w-full max-w-md">
        <div class="border border-border rounded-3xl bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
            @yield('content')
        </div>
    </div>
</body>
</html>
