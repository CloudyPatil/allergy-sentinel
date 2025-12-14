import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
// FIXED IMPORT LINE BELOW:
import { ScanLine, Zap, Globe2, ArrowRight, Mail, Linkedin, Github, ArrowDown, Skull, FileSearch, User, Camera, ShieldCheck } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-950 dark:to-gray-950 transition-colors duration-300 selection:bg-brand-100 dark:selection:bg-brand-900 selection:text-brand-900 dark:selection:text-brand-100">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200 dark:bg-brand-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/40 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            New: Hazard Protocol v2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            Detect Allergies & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400">Hidden Toxins.</span>
          </h1>
          
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The world's first AI food scanner that flags <span className="font-bold text-gray-700 dark:text-gray-200">carcinogens, banned dyes, and allergens</span> instantly. 
            Know exactly what you are eating.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/scan" 
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-brand-500/20 hover:bg-brand-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              Start Scanning <ArrowRight className="w-5 h-5" />
            </Link>
            
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              See How It Works <ArrowDown className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* --- HOW IT WORKS (STEP BY STEP GUIDE) --- */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Complete Safety in 3 Steps</h2>
            <p className="text-gray-500 dark:text-gray-400">We don't just check for peanuts. We check for poison.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-brand-200 dark:via-brand-900 to-transparent z-0"></div>

            {/* STEP 1 */}
            <div className="relative z-10 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600 dark:text-brand-400 font-bold border border-brand-100 dark:border-brand-800">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">1. Set Profile</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                Define your allergens. Our Hazard Protocol is always active to catch universal toxins.
              </p>
            </div>

            {/* STEP 2 */}
            <div className="relative z-10 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600 dark:text-brand-400 font-bold border border-brand-100 dark:border-brand-800">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">2. Scan Label</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                Take a photo of any ingredient list. Our Vision Pro AI reads even curved or crinkled text.
              </p>
            </div>

            {/* STEP 3 */}
            <div className="relative z-10 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600 dark:text-brand-400 font-bold border border-brand-100 dark:border-brand-800">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">3. Total Analysis</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                We identify your allergies AND flag hazardous chemicals like <b>Nitrates</b> or <b>Red 40</b>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/50 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Allergy Sentinel?</h2>
            <p className="text-gray-500 dark:text-gray-400">Because food labels are designed to hide the truth.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-brand-600 dark:text-brand-400">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Vision Pro OCR</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                Our multi-pass computer vision engine extracts text from shiny, crinkled, or low-light packaging instantly.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Smart Ontology</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                We know that "Casein" means Milk and "Ovalbumin" means Egg. We catch scientific names basic apps miss.
              </p>
            </div>
            
            {/* UPDATED HAZARD CARD */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
                <Skull className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Carcinogen Shield</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                We automatically flag <b>Carcinogens</b> (Nitrates), <b>Banned Dyes</b> (Yellow 5, Red 40), and <b>Toxins</b>.
              </p>
            </div>
          </div>
        </div>
      </section>

           {/* --- CONTACT SECTION --- */}
      <section id="contact" className="relative z-10 py-24 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="inline-block p-3 rounded-full bg-brand-50 dark:bg-brand-900/30 mb-6">
            <Mail className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Questions? Partnership?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            Whether you are a grocery chain looking for API access or a user with feedback, we'd love to hear from you.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-20">
            {/* EMAIL BUTTON - Fixed with Z-Index */}
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=harshalgenai@gmail.com&su=Inquiry about Allergy Sentinel"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200"
            >
              <Mail className="w-4 h-4" /> Email Us
            </a>

            {/* LINKEDIN */}
            <a 
              href="https://www.linkedin.com/in/harshal-patil-77538a355/" 
              target="_blank" 
              rel="noreferrer" 
              className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>

            {/* GITHUB */}
            <a 
              href="https://github.com/CloudyPatil" 
              target="_blank" 
              rel="noreferrer" 
              className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 transition-colors duration-300">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2025 Food Allergy Sentinel. Built with ❤️ for safety.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400">Privacy Policy</a>
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;