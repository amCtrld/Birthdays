export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 md:space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground text-balance">
              We Don't Forget Birthdays Anymore
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance">
              A celebratory wall of fame where every birthday matters. Submit your birthday and join our community of joy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <a
              href="#add-birthday"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
            >
              Add Your Birthday
            </a>
            <a
              href="#wall-of-fame"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold border-2 border-primary/20 hover:border-primary/40 transition-colors"
            >
              View the Wall
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-8">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-accent">42</p>
              <p className="text-sm text-muted-foreground">Birthdays Celebrated</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-accent">365</p>
              <p className="text-sm text-muted-foreground">Days of Joy</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-accent">100%</p>
              <p className="text-sm text-muted-foreground">No Forgetting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl opacity-50 -z-10" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl opacity-50 -z-10" />
    </section>
  );
}
