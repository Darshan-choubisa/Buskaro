export default function DestinationCard({
  image,
  name,
  price,
  departures,
  badge,
  className = '',
}) {
  return (
    <div className={`relative overflow-hidden rounded-lg cursor-pointer group ${className}`}>
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Optional Badge */}
      {badge && (
        <span className="absolute top-3 left-3 bg-[#00c9a7] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-[15px] leading-snug">{name}</h3>
        <p className="text-gray-300 text-[12px] mt-0.5">
          From {price} · {departures}
        </p>
      </div>
    </div>
  );
}