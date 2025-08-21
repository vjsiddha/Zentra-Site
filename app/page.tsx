export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-indigo-600">Zentra</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Interactive Finance Simulation Platform
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Getting Started
          </h2>
          <p className="text-gray-600">
            Your Zentra platform is now running! This Next.js application is ready for development
            with Builder.io, TailwindCSS, and AI-powered features.
          </p>
        </div>
      </div>
    </main>
  )
}
