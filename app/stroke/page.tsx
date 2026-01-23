"use client";

import * as React from "react";
import { Navigation } from "@/components/layout";
import { StrokeViewer } from "@/components/stroke/StrokeViewer";

export default function StrokePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">汉字笔顺</h1>
          <p className="text-sm text-gray-500 mt-1">
            查询汉字笔顺、观看笔画动画、学习正确书写顺序
          </p>
        </div>

        <StrokeViewer />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
          <p>汉字网</p>
        </div>
      </footer>
    </main>
  );
}
