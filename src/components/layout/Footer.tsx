export function Footer() {
  return (
    <footer className="py-6 mt-auto bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} LemonLeaf.AI. All rights reserved.</p>
        <p className="text-xs mt-1">Powered by Next.js & Roboflow</p>
      </div>
    </footer>
  );
}
