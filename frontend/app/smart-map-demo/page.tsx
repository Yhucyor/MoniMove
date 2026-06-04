'use client';

import { useState } from 'react';
import SmartGoogleMap from '../../src/map/SmartGoogleMap';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SmartMapDemo() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[2000] bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Quay lại</span>
            </Link>
            <div className="h-6 w-px bg-slate-300"></div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Smart Google Map Demo</h1>
              <p className="text-xs text-slate-500">IoT Monitoring System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-700">Live Demo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 pt-[73px]">
        <SmartGoogleMap />
      </div>

      {/* Info Panel */}
      <div className="absolute top-[90px] left-1/2 transform -translate-x-1/2 z-[1500] pointer-events-none">
        <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-3 rounded-full shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">🗺️ Smart Map Features:</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span>✓ Custom Markers</span>
              <span>✓ Search Bar</span>
              <span>✓ Route Layer</span>
              <span>✓ Info Popup</span>
              <span>✓ Multiple Styles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[1500] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-2xl pointer-events-auto">
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span>
            Hướng dẫn sử dụng
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <span className="text-cyan-500 font-bold">1.</span>
              <span>Sử dụng <strong>Search Bar</strong> ở trên để tìm thiết bị</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-500 font-bold">2.</span>
              <span>Click vào <strong>Map Style</strong> để đổi giao diện</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-500 font-bold">3.</span>
              <span><strong>Hover</strong> vào marker để xem thông tin chi tiết</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-500 font-bold">4.</span>
              <span>Sử dụng <strong>Quick Controls</strong> để toggle features</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
