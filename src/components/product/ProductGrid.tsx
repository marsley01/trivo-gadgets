import { Database } from "@/types/database.types";
import ProductCard from "./ProductCard";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h3 className="text-xl font-bold text-foreground mb-2">No products available</h3>
        <p className="text-muted">Check back later for new drops.</p>
      </div>
    );
  }

  return (
    <section id="products" className="py-16 md:py-24 container mx-auto px-4 md:px-8">
      <div className="mb-12 flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          All <span className="text-accent">Products</span>
        </h2>
        <p className="text-muted max-w-xl">
          Browse our full catalog of tech gadgets available for order in Kenya. Tap any item to view details, or order directly via WhatsApp.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
