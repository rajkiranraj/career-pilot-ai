@extends('layouts.auth')

@section('content')
<div class="space-y-6">
    <div class="text-center mb-8">
        <a href="/">
            <img src="/logo.png" alt="CareerPilot" class="h-16 w-16 md:h-20 md:w-20 mx-auto object-contain rounded-2xl md:rounded-3xl mb-6">
        </a>
        <h2 class="text-2xl font-bold">Create an Account</h2>
        <p class="text-sm text-gray-400 mt-2">Join CareerPilot to accelerate your career.</p>
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

    <form method="POST" action="{{ route('register') }}" class="space-y-4">
        @csrf

        <div class="space-y-1">
            <label for="name" class="block text-sm font-medium text-gray-400">Name</label>
            <input id="name" type="text" name="name" value="{{ old('name') }}" required autofocus autocomplete="name" class="w-full bg-black/40 border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-white">
        </div>

        <div class="space-y-1">
            <label for="email" class="block text-sm font-medium text-gray-400">Email Address</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" required autocomplete="username" class="w-full bg-black/40 border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-white">
        </div>

        <div class="space-y-1">
            <label for="password" class="block text-sm font-medium text-gray-400">Password</label>
            <input id="password" type="password" name="password" required autocomplete="new-password" class="w-full bg-black/40 border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-white">
        </div>

        <div class="space-y-1">
            <label for="password_confirmation" class="block text-sm font-medium text-gray-400">Confirm Password</label>
            <input id="password_confirmation" type="password" name="password_confirmation" required autocomplete="new-password" class="w-full bg-black/40 border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-white">
        </div>

        <button type="submit" class="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
            Sign Up
        </button>

        <div class="text-center text-sm text-gray-400 mt-4">
            Already have an account? <a href="{{ route('login') }}" class="text-white hover:underline">Sign In</a>
        </div>
    </form>
</div>
@endsection
