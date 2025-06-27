/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from "react";
import { Wrench, Mail, Twitter } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-500 opacity-20 mix-blend-multiply blur-xl filter"></div>
        <div className="absolute right-1/4 top-3/4 h-72 w-72 animate-pulse rounded-full bg-pink-500 opacity-20 mix-blend-multiply blur-xl filter delay-1000"></div>
        <div className="delay-2000 absolute bottom-1/4 left-1/3 h-72 w-72 animate-pulse rounded-full bg-blue-500 opacity-20 mix-blend-multiply blur-xl filter"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 animate-pulse rounded-full bg-white opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Main icon with animation */}
        <div className="relative mb-8">
          <div className="mx-auto mb-6 flex h-24 w-24 transform items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-2xl transition-transform duration-300 hover:scale-110">
            <Wrench
              className="h-12 w-12 animate-spin text-white"
              style={{ animationDuration: "3s" }}
            />
          </div>
          <div className="absolute inset-0 mx-auto h-24 w-24 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-xl"></div>
        </div>

        {/* Main heading */}
        <h1 className="mb-8 text-5xl font-bold tracking-tight text-white md:text-7xl">
          <span className="animate-pulse bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Svetainė šiuo metu yra tvarkoma.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-16 max-w-2xl text-xl leading-relaxed text-gray-300 md:text-2xl">
          <br className="hidden md:block" />
          Grįšime netrukus su dar geresniais sprendimais!
        </p>

        {/* Footer */}
        <div className="text-sm text-gray-400">
          <p>© 2025 Saugos Kursai. Visos teisės yra saugomos.</p>
        </div>
      </div>

      {/* Loading animation at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform">
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-purple-400"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
