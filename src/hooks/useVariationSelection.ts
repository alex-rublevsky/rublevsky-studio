import { useCallback, useEffect, useState } from "react";
import { ProductVariation, VariationAttribute, ProductWithVariations } from "~/types";
import { getAvailableQuantityForVariation } from "~/utils/validateStock";
import { CartItem } from "~/lib/cartContext";

interface ProductVariationWithAttributes extends ProductVariation {
  attributes: VariationAttribute[];
}

interface UseVariationSelectionProps {
  product: ProductWithVariations;
  cartItems: CartItem[];
  onVariationChange?: () => void;
}

interface UseVariationSelectionReturn {
  selectedVariation: ProductVariationWithAttributes | null;
  selectedAttributes: Record<string, string>;
  selectVariation: (attributeId: string, attributeValue: string) => void;
  findMatchingVariation: (attributes: Record<string, string>) => ProductVariationWithAttributes | null;
  isAttributeValueAvailable: (attributeId: string, attributeValue: string) => boolean;
}

export function useVariationSelection({
  product,
  cartItems,
  onVariationChange,
}: UseVariationSelectionProps): UseVariationSelectionReturn {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariationWithAttributes | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Find the first available variation considering stock
  const findFirstAvailableVariation = useCallback(() => {
    if (!product.hasVariations || !product.variations || product.variations.length === 0) {
      return null;
    }

    // Sort variations by sort property (descending order)
    const sortedVariations = [...product.variations].sort(
      (a, b) => (b.sort ?? 0) - (a.sort ?? 0)
    );

    // Find first variation with available stock
    const availableVariation = sortedVariations.find((variation) => {
      const availableQuantity = getAvailableQuantityForVariation(
        product,
        variation.id,
        cartItems
      );
      return availableQuantity > 0;
    });

    return availableVariation || null;
  }, [product, cartItems]);

  // Find a variation that matches all the selected attributes
  const findMatchingVariation = useCallback(
    (attributes: Record<string, string>) => {
      if (!product.variations) return null;

      return (
        product.variations.find((variation) => {
          return Object.entries(attributes).every(([attributeId, value]) =>
            variation.attributes.some(
              (attr) => attr.attributeId === attributeId && attr.value === value
            )
          );
        }) || null
      );
    },
    [product.variations]
  );

  // Initialize selected variation when product loads
  useEffect(() => {
    if (!selectedVariation) {
      const availableVariation = findFirstAvailableVariation();
      if (availableVariation) {
        setSelectedVariation(availableVariation);
        const initialAttributes: Record<string, string> = {};
        availableVariation.attributes.forEach((attr: VariationAttribute) => {
          initialAttributes[attr.attributeId] = attr.value;
        });
        setSelectedAttributes(initialAttributes);
      }
    }
  }, [product, findFirstAvailableVariation, selectedVariation]);

  // Update selected variation when cart changes
  useEffect(() => {
    if (!selectedVariation || !product.hasVariations) return;

    const currentQuantity = getAvailableQuantityForVariation(
      product,
      selectedVariation.id,
      cartItems
    );

    // Only auto-select if current variation is completely unavailable
    if (currentQuantity === 0) {
      const availableVariation = findFirstAvailableVariation();
      if (availableVariation && availableVariation.id !== selectedVariation.id) {
        setSelectedVariation(availableVariation);
        const newAttributes: Record<string, string> = {};
        availableVariation.attributes.forEach((attr: VariationAttribute) => {
          newAttributes[attr.attributeId] = attr.value;
        });
        setSelectedAttributes(newAttributes);
      }
    }
  }, [cartItems, product, selectedVariation, findFirstAvailableVariation]);

  // Select a variation based on attribute ID and value
  const selectVariation = useCallback(
    (attributeId: string, attributeValue: string) => {
      if (!product.variations) return;

      // Update selected attributes
      const newSelectedAttributes = {
        ...selectedAttributes,
        [attributeId]: attributeValue,
      };

      // Find matching variation
      const newVariation = findMatchingVariation(newSelectedAttributes);

      if (newVariation) {
        setSelectedVariation(newVariation);
        setSelectedAttributes(newSelectedAttributes);
        // Call the callback when variation changes
        onVariationChange?.();
      }
    },
    [product.variations, selectedAttributes, findMatchingVariation, onVariationChange]
  );

  // Check if a specific attribute value is available with current selections
  const isAttributeValueAvailable = useCallback(
    (attributeId: string, attributeValue: string): boolean => {
      if (!product.variations) return false;

      // Get all other selected attributes except the one we're checking
      const otherAttributes = { ...selectedAttributes };
      delete otherAttributes[attributeId];

      // Check if there's any variation that matches this attribute value and all other selected attributes
      // AND has stock available
      return product.variations.some((variation) => {
        const matchesThisAttribute = variation.attributes.some(
          (attr) =>
            attr.attributeId === attributeId && attr.value === attributeValue
        );

        const matchesOtherAttributes = Object.entries(otherAttributes).every(
          ([id, value]) =>
            variation.attributes.some(
              (attr) => attr.attributeId === id && attr.value === value
            )
        );

        // Check if this variation has stock available
        const availableQuantity = getAvailableQuantityForVariation(
          product,
          variation.id,
          cartItems
        );

        return (
          matchesThisAttribute &&
          matchesOtherAttributes &&
          availableQuantity > 0
        );
      });
    },
    [product, selectedAttributes, cartItems]
  );

  return {
    selectedVariation,
    selectedAttributes,
    selectVariation,
    findMatchingVariation,
    isAttributeValueAvailable,
  };
} 