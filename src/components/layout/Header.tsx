import { Leaf } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-6 bg-primary shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-3">
          <Leaf size={40} className="text-primary-foreground" />
          <h1 className="text-4xl font-bold text-primary-foreground font-headline">
            LemonLeaf.AI
          </h1>
        </Link>
      </div>
    </header>
  );
}
