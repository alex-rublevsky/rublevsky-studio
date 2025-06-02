import { Category, TeaCategory, Brand, ProductWithVariations } from "~/types";
import { useState } from "react";
import { Image } from "~/components/ui/shared/Image";
import { Button } from "~/components/ui/shared/Button";
import { Badge } from "~/components/ui/shared/Badge";
import { cn } from "~/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { isProductAvailable, getStockDisplayText } from "~/utils/validateStock";

interface AdminProductCardProps {
  product: ProductWithVariations;
  categories: Category[];
  teaCategories: TeaCategory[];
  brands: Brand[];
  onEdit: (product: ProductWithVariations) => void;
  onDelete: (product: ProductWithVariations) => void;
  formatPrice: (price: number) => string;
  getCategoryName: (slug: string | null) => string | null;
  getTeaCategoryNames: (teaCategories: string[]) => string;
}

export function AdminProductCard({
  product,
  categories,
  teaCategories,
  brands,
  onEdit,
  onDelete,
  formatPrice,
  getCategoryName,
  getTeaCategoryNames,
}: AdminProductCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  const imageArray = product.images?.split(",").map((img) => img.trim()) ?? [];
  const primaryImage = imageArray[0];
  const isAvailable = isProductAvailable(product);
  const stockDisplayText = getStockDisplayText(product);

  // Calculate the display price - use highest variation price if variations exist, otherwise base price
  const displayPrice = (() => {
    if (
      product.hasVariations &&
      product.variations &&
      product.variations.length > 0
    ) {
      const prices = product.variations.map((v) => v.price);
      return Math.max(...prices);
    }
    return product.price;
  })();

  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-border shadow-sm transition-all duration-300 overflow-hidden",
        "hover:shadow-md hover:border-primary/20",
        !isAvailable && "opacity-75 border-muted"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {primaryImage ? (
          <Image
            src={`/${primaryImage}`}
            alt={product.name}
            className={cn(
              "object-cover w-full h-full transition-transform duration-300 hover:scale-105",
              !isAvailable && "grayscale opacity-60"
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

        {/* Out of Stock Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <Badge variant="secondary" className="text-black">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant={product.isActive ? "default" : "secondary"}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-2 left-2">
            <Badge
              variant="outline"
              className="bg-yellow-500/90 text-white border-yellow-500"
            >
              Featured
            </Badge>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <div>
          <h3 className="font-semibold !text-base line-clamp-2 mb-1">
            {product.name}
          </h3>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(displayPrice)}
          </span>
          {product.discount && (
            <Badge variant="destructive" className="text-xs">
              -{product.discount}%
            </Badge>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Stock:</span>
          <span className={isAvailable ? "text-black" : "text-red-600"}>
            {stockDisplayText}
          </span>
        </div>

        {/* Category */}
        <div className="text-sm">
          <span className="text-muted-foreground">Category: </span>
          <span className="font-medium">
            {getCategoryName(product.categorySlug) || "N/A"}
          </span>
        </div>

        {/* Tea Categories */}
        {product.teaCategories && product.teaCategories.length > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">Tea Types: </span>
            <span className="font-medium text-xs">
              {getTeaCategoryNames(product.teaCategories)}
            </span>
          </div>
        )}

        {/* Weight */}
        {product.weight && (
          <div className="text-sm">
            <span className="text-muted-foreground">Weight: </span>
            <span className="font-medium">{product.weight}</span>
          </div>
        )}

        {/* Variations indicator */}
        {product.hasVariations && (
          <div className="text-xs">
            <Badge variant="outline">Has Variations</Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(product)}
            className="flex-1 group justify-center"
          >
            <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(product)}
            className="flex-1 group justify-center"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
