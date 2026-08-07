import React from 'react';
import { Calendar, CreditCard, TrendingUp, Users, Check, Phone, Shield, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen lg:h-screen bg-[#F7FAF9] flex flex-col justify-between overflow-x-hidden">
      {/* Header / Navbar */}
      <header className="bg-white border-b border-border-custom px-6 h-16 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <span className="font-logo font-bold text-2xl text-[#0D4846] uppercase tracking-[0.08em] select-none">MEDSPACES</span>
        <div className="flex items-center space-x-4">
          <a 
            href="/login" 
            className="text-white font-sans font-semibold text-xs lg:text-sm rounded-[14px] shadow-[0_12px_24px_rgba(13,72,70,0.25)] hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 transition-all duration-[250ms] ease-in-out flex items-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg, #0D4846, #11615D)',
              padding: '10px 24px',
            }}
          >
            Login <ArrowRight size={14} />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main 
        className="flex-1 flex items-center justify-center w-full max-w-7xl mx-auto px-6 py-6 lg:py-0 lg:h-[calc(100vh-64px-56px)] overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7FAF9 100%)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-5 space-y-6 lg:space-y-8 text-left py-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-[#082F2D] leading-tight tracking-tight">
              Streamlined Healthcare Practice & Clinic Management
            </h1>
            <p className="font-sans text-[#3F5E5C] text-base lg:text-lg leading-relaxed max-w-lg">
              MedSpaces tools suite extends our marketplace provider relationships to streamline scheduling, billing, queue token tracking, and patient visits securely.
            </p>

            {/* Feature Highlights */}
            <ul className="space-y-3 pt-1">
              <li className="flex items-center space-x-3 text-[#082F2D] font-medium text-sm lg:text-base">
                <div className="flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6 bg-[#F3F7F6] text-[#0D4846] rounded-full flex items-center justify-center shadow-sm">
                  <Check size={12} className="stroke-[3]" />
                </div>
                <span>Appointment Scheduling</span>
              </li>
              <li className="flex items-center space-x-3 text-[#082F2D] font-medium text-sm lg:text-base">
                <div className="flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6 bg-[#F3F7F6] text-[#0D4846] rounded-full flex items-center justify-center shadow-sm">
                  <Check size={12} className="stroke-[3]" />
                </div>
                <span>Smart Queue Management</span>
              </li>
              <li className="flex items-center space-x-3 text-[#082F2D] font-medium text-sm lg:text-base">
                <div className="flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6 bg-[#F3F7F6] text-[#0D4846] rounded-full flex items-center justify-center shadow-sm">
                  <Check size={12} className="stroke-[3]" />
                </div>
                <span>Secure Patient Records</span>
              </li>
            </ul>

            {/* CTA Area */}
            <div className="pt-2">
              <a 
                href="/signup" 
                className="btn-shine text-white font-sans font-semibold text-sm lg:text-base rounded-[16px] shadow-[0_16px_32px_rgba(13,72,70,0.30)] hover:-translate-y-[3px] hover:scale-[1.03] active:-translate-y-[1px] transition-all duration-[300ms] ease-in-out inline-flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #0D4846, #11615D)',
                  padding: '14px 28px',
                }}
              >
                New patient? Get started <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Right Column: Premium Expanded Dashboard Preview */}
          <div className="lg:col-span-7 w-full flex justify-center relative py-6 lg:py-0">
            {/* Background Circular Rings/Concentric circles decoration */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <div className="absolute w-[360px] h-[360px] md:w-[480px] md:h-[480px] rounded-full border border-dashed border-[#D8E7E5]/70"></div>
              <div className="absolute w-[460px] h-[460px] md:w-[580px] md:h-[580px] rounded-full border border-[#D8E7E5]/40"></div>
              <div className="absolute w-[260px] h-[260px] md:w-[380px] md:h-[380px] rounded-full border border-[#D8E7E5]/60"></div>
            </div>

            {/* Floating Action Icons */}
            <div className="absolute top-[8%] right-[22%] w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#0D4846] border border-[#D8E7E5] animate-bounce" style={{ animationDuration: '4s' }}>
              <Phone size={16} />
            </div>
            <div className="absolute top-[20%] right-[3%] w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#0D4846] border border-[#D8E7E5] animate-pulse">
              <Calendar size={16} />
            </div>
            <div className="absolute bottom-[10%] left-[8%] w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#0D4846] border border-[#D8E7E5] animate-pulse">
              <TrendingUp size={16} />
            </div>
            <div className="absolute bottom-[8%] right-[32%] w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#2F8F89] border border-[#D8E7E5] animate-bounce" style={{ animationDuration: '5s' }}>
              <Shield size={16} />
            </div>

            {/* Layout Wrapper: Expanded Dashboard */}
            <div className="relative w-full max-w-xl flex items-center">
              {/* Mock Dashboard container - Expanded to full right side width */}
              <div className="w-full bg-white border border-[#D8E7E5] rounded-2xl shadow-premium-card overflow-hidden transition-all duration-300 hover:shadow-2xl z-10">
                {/* Browser/Window Header */}
                <div className="bg-slate-50 border-b border-[#D8E7E5] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2F8F89]/80"></div>
                  </div>
                  <div className="text-[10px] text-[#6E8785] font-mono bg-[#F7FAF9] px-3 py-0.5 rounded border border-[#D8E7E5]">
                    medspaces.com/dashboard
                  </div>
                  <div className="w-10"></div>
                </div>

                {/* Dashboard Internal Mockup */}
                <div className="p-4 bg-[#F7FAF9] space-y-3.5">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-[#D8E7E5] shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[#6E8785] text-[8px] font-semibold tracking-wide uppercase">
                        <span>Queue</span>
                        <Users size={10} className="text-[#0D4846]" />
                      </div>
                      <div className="mt-1">
                        <div className="text-xs md:text-sm font-bold text-[#082F2D] font-heading">Token A-14</div>
                        <div className="text-[8px] text-[#2F8F89] font-medium font-semibold">Serving now</div>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#D8E7E5] shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[#6E8785] text-[8px] font-semibold tracking-wide uppercase">
                        <span>Visits</span>
                        <Calendar size={10} className="text-[#0D4846]" />
                      </div>
                      <div className="mt-1">
                        <div className="text-xs md:text-sm font-bold text-[#082F2D] font-heading">24 Patients</div>
                        <div className="text-[8px] text-[#6E8785] font-medium">8 scheduled</div>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#D8E7E5] shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[#6E8785] text-[8px] font-semibold tracking-wide uppercase">
                        <span>Revenue</span>
                        <CreditCard size={10} className="text-[#0D4846]" />
                      </div>
                      <div className="mt-1">
                        <div className="text-xs md:text-sm font-bold text-[#0D4846] font-heading">₹12,450</div>
                        <div className="text-[8px] text-[#2F8F89] font-medium font-semibold">+15% vs yesterday</div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Main Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Today's Appointments List */}
                    <div className="bg-white p-3 rounded-xl border border-[#D8E7E5] shadow-sm space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <h4 className="text-[10px] font-bold text-[#082F2D] tracking-wide">Today's Schedule</h4>
                        <span className="text-[8px] text-[#0D4846] font-semibold hover:underline cursor-pointer">View All</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] p-1 hover:bg-[#F7FAF9] rounded transition-colors">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-1 h-1 rounded-full bg-[#2F8F89]"></div>
                            <span className="font-semibold text-[#082F2D]">Sarah Connor</span>
                          </div>
                          <span className="text-[#3F5E5C] font-medium">10:00 AM</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] p-1 hover:bg-[#F7FAF9] rounded transition-colors">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-1 h-1 rounded-full bg-[#0D4846]"></div>
                            <span className="font-semibold text-[#082F2D]">John Doe</span>
                          </div>
                          <span className="text-[#3F5E5C] font-medium">11:30 AM</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] p-1 hover:bg-[#F7FAF9] rounded transition-colors">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-1 h-1 rounded-full bg-[#8DA9A7]"></div>
                            <span className="font-semibold text-[#082F2D]">Ellen Ripley</span>
                          </div>
                          <span className="text-[#3F5E5C] font-medium">02:15 PM</span>
                        </div>
                      </div>
                    </div>

                    {/* Smart Queue & Activity */}
                    <div className="bg-white p-3 rounded-xl border border-[#D8E7E5] shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                          <h4 className="text-[10px] font-bold text-[#082F2D] tracking-wide">Queue Flow Analytics</h4>
                          <TrendingUp size={10} className="text-[#2F8F89]" />
                        </div>
                        <div className="flex items-end justify-between h-12 pt-1 px-1">
                          <div className="w-2.5 bg-[#B9D8D5] hover:bg-[#0D4846]/80 rounded-t h-6 transition-colors"></div>
                          <div className="w-2.5 bg-[#B9D8D5] hover:bg-[#0D4846]/80 rounded-t h-9 transition-colors"></div>
                          <div className="w-2.5 bg-[#B9D8D5] hover:bg-[#0D4846]/80 rounded-t h-4 transition-colors"></div>
                          <div className="w-2.5 bg-[#0D4846] rounded-t h-12 transition-colors"></div>
                          <div className="w-2.5 bg-[#B9D8D5] hover:bg-[#0D4846]/80 rounded-t h-7 transition-colors"></div>
                          <div className="w-2.5 bg-[#B9D8D5] hover:bg-[#0D4846]/80 rounded-t h-10 transition-colors"></div>
                        </div>
                      </div>
                      <div className="text-[8px] text-[#6E8785] text-center font-medium mt-1.5">
                        Avg. wait time down to <span className="font-bold text-[#0D4846]">12 mins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border-custom py-4 text-center text-xs text-[#3F5E5C] h-14 flex items-center justify-center">
        &copy; {new Date().getFullYear()} MedSpaces. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
