import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-12 text-center pt-8">
        <h1 className="text-5xl font-bold mb-4 text-white">DisasterSense 🌍</h1>
        <p className="text-xl text-gray-300">AI-Powered Disaster Prediction & Early Warning System</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* Status Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm flex items-center justify-between shadow-lg">
          <div>
            <h2 className="text-2xl font-semibold mb-1">System Status</h2>
            <p className="text-sm text-gray-400">All services operational</p>
          </div>
          <div className="flex items-center space-x-3 bg-green-500/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">System Online</span>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-[#11111E] border border-white/10 rounded-xl h-96 flex items-center justify-center shadow-2xl relative overflow-hidden group transition-all duration-300 hover:border-white/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="text-center z-10">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 className="text-2xl font-medium text-gray-400">Heatmap coming in Phase 6</h3>
            <p className="mt-2 text-gray-500 text-sm">Interactive geographic visualizations will be displayed here.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
