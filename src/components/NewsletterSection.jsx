import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 reveal">
      <div className="rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[280px]">
        {/* Left: Dark Form Panel */}
        <div className="bg-[#0d1b2a] flex flex-col justify-center px-8 sm:px-10 py-12 text-center md:text-left items-center md:items-start">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Stay ahead of the schedule.
          </h2>
          <p className="text-gray-300 text-[14px] mt-4 mb-8 leading-relaxed max-w-sm">
            Receive early access to seasonal routes and exclusive terminal
            membership offers.
          </p>

          {submitted ? (
            <p className="text-[#00c9a7] font-semibold text-[14px]">
              ✓ You're on the list!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-500 text-[14px] px-5 py-3.5 rounded-xl outline-none focus:border-[#00c9a7] transition-all"
              />
              <button
                type="submit"
                className="bg-[#00c9a7] text-white text-[14px] font-bold px-8 py-3.5 rounded-xl hover:bg-[#00b090] transition-all whitespace-nowrap shadow-lg shadow-[#00c9a720] active:scale-95"
              >
                Join Now
              </button>
            </form>
          )}
        </div>

        {/* Right: Image Panel */}
        <div className="relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
            alt="Terminal interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0d1b2a]/20" />
        </div>
      </div>
    </section>
  );
}
