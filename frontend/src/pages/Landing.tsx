import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Database, Shield, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-12">
      <div className="text-center space-y-6 max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
          ProjectPulse
        </h1>
        <p className="text-2xl text-blue-600 font-semibold">
          Intelligent Data Capture & Schedule-Linking Layer
        </p>
        <p className="text-xl text-gray-500">
          Stop manually reconciling messy field updates. ProjectPulse uses AI to instantly convert daily progress reports into verified, schedule-linked execution events.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Try Live Demo <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <a href="#how-it-works" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            How It Works
          </a>
        </div>
      </div>

      <div id="how-it-works" className="w-full max-w-5xl py-12 border-t">
        <h2 className="text-3xl font-bold text-center mb-12">The Execution Truth Engine</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-4 flex flex-col items-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Database size={32}/></div>
            <h3 className="font-semibold text-lg">1. Ingest Data</h3>
            <p className="text-gray-500 text-sm">Site supervisors upload messy text or Excel reports without worrying about schedule IDs.</p>
          </div>
          <div className="space-y-4 flex flex-col items-center">
            <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><Zap size={32}/></div>
            <h3 className="font-semibold text-lg">2. AI Extraction</h3>
            <p className="text-gray-500 text-sm">LLM extracts core activities, dates, location, and status automatically.</p>
          </div>
          <div className="space-y-4 flex flex-col items-center">
            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><CheckCircle size={32}/></div>
            <h3 className="font-semibold text-lg">3. Contextual Match</h3>
            <p className="text-gray-500 text-sm">Vector embeddings map the extracted events to the exact L5/L6 schedule activities.</p>
          </div>
          <div className="space-y-4 flex flex-col items-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Shield size={32}/></div>
            <h3 className="font-semibold text-lg">4. Trust Layer</h3>
            <p className="text-gray-500 text-sm">High confidence matches are auto-linked. Low confidence requires Planner Review.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
