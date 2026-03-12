const placeholderCount = 6;

export function Gallery() {
  return (
    <section
      id="gallery"
      className="py-16 sm:py-24 bg-white"
      aria-labelledby="gallery-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2
            id="gallery-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-falcon-sageDark mb-4"
          >
            Our Gallery
          </h2>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            Glimpses of our classrooms, activities, and the joyful moments at Falcons Education System.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-xl overflow-hidden bg-falcon-sand/50 border-2 border-dashed border-falcon-sage/30 flex items-center justify-center"
              aria-label={`Gallery image placeholder ${i + 1}`}
            >
              <div className="text-center p-6">
                <span className="text-4xl mb-2 block" aria-hidden>🖼️</span>
                <p className="text-falcon-earth/60 text-sm">Image {i + 1}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Video placeholder */}
        <div className="mt-12">
          <div
            className="aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden bg-falcon-sand/50 border-2 border-dashed border-falcon-sage/30 flex items-center justify-center"
            aria-label="Video placeholder - add school tour or activity video"
          >
            <div className="text-center p-8">
              <span className="text-6xl mb-4 block" aria-hidden>🎬</span>
              <p className="text-falcon-earth/70 font-medium">Add video here</p>
              <p className="text-sm text-falcon-earth/50 mt-1">School tour, classroom activities, or events</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
