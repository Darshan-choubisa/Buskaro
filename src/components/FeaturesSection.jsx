import { Clock, Armchair, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon:        Clock,
    iconBg:      'bg-blue-50',
    iconColor:   'text-blue-600',
    title:       'Precision Timing',
    description: 'Our proprietary AI-driven dispatch ensures we maintain a 99.8% on-time record, respecting every minute of your schedule.',
  },
  {
    icon:        Armchair,
    iconBg:      'bg-[#00c9a7]/10',
    iconColor:   'text-[#00c9a7]',
    title:       'Ergonomic Cabin',
    description: 'Experience 42 inches of legroom, silent acoustic insulation, and 180-degree reclining memory foam seating.',
  },
  {
    icon:        ShieldCheck,
    iconBg:      'bg-amber-50',
    iconColor:   'text-amber-600',
    title:       'Unrivaled Safety',
    description: 'Equipped with 360° LiDAR sensors and biometrically verified professional captains for total peace of mind.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Engineered for Comfort.
          </h2>
          <p className="text-gray-500 text-[14px] sm:text-[15px] mt-4 max-w-xs mx-auto leading-relaxed font-medium">
            We've removed the friction of regional travel, replacing it with space, light, and silence.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`bg-white rounded-lg p-7 shadow-sm border border-gray-300 hover:shadow-md transition-shadow reveal reveal-delay-${(index + 1) * 150}`}
              >
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-5 ${feature.iconBg}`}>
                  <Icon size={20} className={feature.iconColor} />
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-[13px] leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}