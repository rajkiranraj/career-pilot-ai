@extends('layouts.auth')

@section('content')
<div class="space-y-6">
    <div class="text-center mb-8">
        <a href="/">
            <img src="/logo.png" alt="CareerPilot" class="h-16 w-16 md:h-20 md:w-20 mx-auto object-contain rounded-2xl md:rounded-3xl mb-6">
        </a>
        <h2 class="text-2xl font-bold">Welcome Back</h2>
        <p class="text-sm text-gray-400 mt-2">Sign in to your account.</p>
    </div>

    @if ($errors->any())
        <div class="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm">
            <ul class="list-disc list-inside">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if (session('status'))
        <div class="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-lg text-sm">
            {{ session('status') }}
        </div>
    @endif

    <form method="POST" action="{{ route('login') }}" class="space-y-4">
        @csrf

        <div class="space-y-1">
            <label for="email" class="block text-sm font-medium text-gray-400">Email Address</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus autocomplete="username" class="w-full bg-black/40 border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-white">
        </div>

        <div class="space-y-1">
            <div class="flex justify-between items-center">
                <label for="password" class="block text-sm font-medium text-gray-400">Password</label>
                @if (Route::has('password.request'))
                    <a href="{{ route('password.request') }}" class="text-xs text-gray-500 hover:text-white transition-colors">Forgot password?</a>
                @endif
            </div>
            <input id="password" type="password" name="password" required autocomplete="current-password" class="w-full bg-black/40 border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-white">
        </div>

        <div class="flex items-center">
            <input id="remember_me" type="checkbox" name="remember" class="h-4 w-4 rounded border-border bg-black/40 text-white focus:ring-0">
            <label for="remember_me" class="ml-2 block text-sm text-gray-400">Remember me</label>
        </div>

        <button type="submit" class="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
            Sign In
        </button>

        <div class="text-center text-sm text-gray-400 mt-4">
            Don't have an account? <a href="{{ route('register') }}" class="text-white hover:underline">Sign Up</a>
        </div>
    </form>
</div>
@endsection
