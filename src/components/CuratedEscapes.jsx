import DestinationCard from './DestinationCard';

const destinations = [
  {
    image:      'https://media.istockphoto.com/id/1440013181/photo/high-angle-shot-of-bandra-worli-sealink-in-mumbai-enveloped-with-fog.jpg?s=612x612&w=0&k=20&c=3G5yyZjMLeLR2idRd_5MPEs_AwkNFe_OlJgej-zYMwg=',
    name:       'Mumbai Metropolitan',
    price:      '₹450',
    departures: '120 Daily Departures',
    badge:      'Most Popular',
  },
  {
    image:      'https://images.unsplash.com/photo-1755613586839-4947978800e8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8QWdyYSUyMEhlcml0YWdlfGVufDB8fDB8fHww',
    name:       'Agra Heritage',
    price:      '₹850',
    departures: '24 Daily Departures',
  },
  {
    image:      'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=800',
    name:       'Goa Coastal',
    price:      '₹1200',  
    departures: '18 Daily Departures',
  },
  {
    image:      'https://i.pinimg.com/1200x/39/7a/9d/397a9def301c6d052516863e1925a767.jpg',
    name:       'Manali Heights',
    price:      '₹1500',
    departures: '12 Daily Departures',
  },
];

export default function CuratedEscapes() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8 reveal">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Curated Escapes</h2>
            <p className="text-gray-500 text-[14px] mt-2 max-w-sm">
              Discover our most sought-after terminal connections, from mountain
              retreats to metropolitan hubs.
            </p>
          </div>
          <a href="#" className="hidden md:flex items-center gap-1 text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap">
            View Route Map <span className="ml-1">→</span>
          </a>
        </div>

        {/* 2×2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="reveal reveal-delay-100">
            <DestinationCard {...destinations[0]} className="h-64 md:h-72" />
          </div>
          <div className="reveal reveal-delay-200">
            <DestinationCard {...destinations[1]} className="h-64 md:h-72" />
          </div>
          <div className="reveal reveal-delay-300">
            <DestinationCard {...destinations[2]} className="h-52 md:h-56" />
          </div>
          <div className="reveal reveal-delay-400">
            <DestinationCard {...destinations[3]} className="h-52 md:h-56" />
          </div>
        </div>
      </div>
    </section>
  );
}