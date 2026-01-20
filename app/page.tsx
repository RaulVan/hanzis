import { WorksheetGenerator } from "@/components/worksheet/WorksheetGenerator";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                汉字字帖生成器
              </h1>
              <p className="text-sm text-gray-500">
                生成田字格、米字格字帖，支持拼音、笔画顺序
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <WorksheetGenerator />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
          <p>汉字字帖生成器 - 开源项目</p>
        </div>
      </footer>
    </main>
  );
}
