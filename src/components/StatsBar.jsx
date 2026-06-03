const stats = [
  { value: '25+',  label: 'Daily Stations'    },
  { value: '99.8%', label: 'On-Time Precision'  },
  { value: '25K',  label: 'Annual Travelers'   },
  { value: '0%',    label: 'Carbon Impact'      },
];

export default function StatsBar() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        {stats.map((stat, index) => (
          <div key={stat.label} className={`flex flex-col text-center gap-1 reveal reveal-delay-${(index + 1) * 100}`}>
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}