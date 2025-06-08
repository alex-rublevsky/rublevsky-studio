import { useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PRODUCT_ATTRIBUTES } from "~/lib/productAttributes";
import {
  ProductWithVariations,
  ProductVariation,
  VariationAttribute,
  CartItem,
} from "~/types";
import { getAvailableQuantityForVariation } from "~/utils/validateStock";

interface UseVariationSelectionProps {
  product: ProductWithVariations | null;
  cartItems: CartItem[];
  search?: Record<string, string | undefined>; // Optional - if provided, uses URL state
  onVariationChange?: () => void;
}

interface UseVariationSelectionReturn {
  selectedVariation: ProductVariation | null;
  selectedAttributes: Record<string, string>;
  selectVariation: (attributeId: string, value: string) => void;
  isAttributeValueAvailable: (attributeId: string, value: string) => boolean;
  clearVariation?: (attributeId: string) => void;
  clearAllVariations?: () => void;
}

export function useVariationSelection({
  product,
  cartItems,
  search,
  onVariationChange,
}: UseVariationSelectionProps): UseVariationSelectionReturn {
  const navigate = useNavigate();
  
  // Determine if we should use URL state or local state
  const useUrlState = search !== undefined;
  
  // Local state for non-URL mode (product cards)
  const [localSelectedAttributes, setLocalSelectedAttributes] = useState<Record<string, string>>({});

  // Convert search params back to attribute format (URL mode only)
  const urlSelectedAttributes = useMemo(() => {
    if (!useUrlState || !product?.variations || !search) return {};

    const attributes: Record<string, string> = {};

    // Map URL params back to attribute IDs
    Object.entries(search).forEach(([paramName, value]) => {
      if (!value) return;

      // Find the corresponding attribute ID (e.g., size_cm -> SIZE_CM)
      const attributeId = Object.keys(PRODUCT_ATTRIBUTES).find(
        (id) => id.toLowerCase() === paramName
      );
      
      if (attributeId) {
        // Verify this attribute exists in the product variations
        const hasAttribute = product.variations?.some((variation) =>
          variation.attributes.some(
            (attr: VariationAttribute) => attr.attributeId === attributeId
          )
        );

        if (hasAttribute) {
          attributes[attributeId] = value;
        }
      }
    });

    return attributes;
  }, [useUrlState, product?.variations, search]);

  // Get the current selected attributes based on mode
  const selectedAttributes = useUrlState ? urlSelectedAttributes : localSelectedAttributes;

  // Get all unique attribute IDs from product variations (memoized)
  const allAttributeIds = useMemo(() => {
    if (!product?.variations) return new Set<string>();
    
    const attributeIds = new Set<string>();
    product.variations.forEach((variation) => {
      variation.attributes.forEach((attr: VariationAttribute) => {
        attributeIds.add(attr.attributeId);
      });
    });
    return attributeIds;
  }, [product?.variations]);

  // Auto-select default variation if none are selected
  useEffect(() => {
    if (!product?.variations || !product.hasVariations) return;
    
    // Check if we already have any variation selected
    const hasAnySelection = Object.keys(selectedAttributes).length > 0;
    if (hasAnySelection) return;

    // Find the first available variation (preferably with stock)
    const sortedVariations = [...product.variations].sort((a, b) => {
      const aStock = getAvailableQuantityForVariation(product, a.id, cartItems);
      const bStock = getAvailableQuantityForVariation(product, b.id, cartItems);
      
      // Prioritize variations with stock, then by sort order
      if (product.unlimitedStock) {
        return (b.sort ?? 0) - (a.sort ?? 0);
      }
      
      if (aStock > 0 && bStock <= 0) return -1;
      if (bStock > 0 && aStock <= 0) return 1;
      return (b.sort ?? 0) - (a.sort ?? 0);
    });

    const defaultVariation = sortedVariations[0];
    if (defaultVariation) {
      // Create attributes for all attributes of the default variation
      const newAttributes: Record<string, string> = {};
      defaultVariation.attributes.forEach((attr: VariationAttribute) => {
        newAttributes[attr.attributeId] = attr.value;
      });

      if (useUrlState) {
        // Navigate with the default selection for URL mode
        const urlParams: Record<string, string> = {};
        defaultVariation.attributes.forEach((attr: VariationAttribute) => {
          const paramName = attr.attributeId.toLowerCase();
          urlParams[paramName] = attr.value;
        });

        (navigate as any)({
          search: (prev: any) => ({
            ...prev,
            ...urlParams,
          }),
          replace: true,
          resetScroll: false,
        });
      } else {
        // Set local state for non-URL mode
        setLocalSelectedAttributes(newAttributes);
      }
    }
  }, [product, selectedAttributes, cartItems, navigate, useUrlState]);

  // Find the selected variation based on current attributes
  const selectedVariation = useMemo(() => {
    if (
      !product?.variations ||
      !product.hasVariations ||
      Object.keys(selectedAttributes).length === 0
    ) {
      return null;
    }

    // Check if we have selected values for all required attributes
    const hasAllRequiredAttributes = Array.from(allAttributeIds).every(
      (attrId) => selectedAttributes[attrId]
    );

    if (!hasAllRequiredAttributes) {
      return null;
    }

    // Find variation that matches all selected attributes
    const matchingVariation = product.variations.find((variation) => {
      return Object.entries(selectedAttributes).every(([attrId, value]) =>
        variation.attributes.some(
          (attr: VariationAttribute) =>
            attr.attributeId === attrId && attr.value === value
        )
      );
    });

    // Return the variation even if out of stock for pricing purposes
    return matchingVariation || null;
  }, [product, selectedAttributes, allAttributeIds]);

  // Check if a specific attribute value is available
  const isAttributeValueAvailable = useCallback(
    (attributeId: string, value: string): boolean => {
      if (!product?.variations) return false;

      // Find variations that have this attribute value
      const variationsWithValue = product.variations.filter((variation) =>
        variation.attributes.some(
          (attr: VariationAttribute) =>
            attr.attributeId === attributeId && attr.value === value
        )
      );

      if (variationsWithValue.length === 0) return false;

      // Check if any of these variations would be valid with current selections
      return variationsWithValue.some((variation) => {
        // Create a test selection with the current attributes plus this new value
        const testAttributes = {
          ...selectedAttributes,
          [attributeId]: value,
        };

        // Check if this variation matches the test selection
        const matches = Object.entries(testAttributes).every(([attrId, val]) =>
          variation.attributes.some(
            (attr: VariationAttribute) =>
              attr.attributeId === attrId && attr.value === val
          )
        );

        if (!matches) return false;

        // Check if this variation has stock available
        const availableQuantity = getAvailableQuantityForVariation(
          product,
          variation.id,
          cartItems
        );

        return product.unlimitedStock || availableQuantity > 0;
      });
    },
    [product, selectedAttributes, cartItems]
  );

  // Update state when variation is selected - FIXED to preserve existing selections
  const selectVariation = useCallback(
    (attributeId: string, value: string) => {
      if (!product?.variations) return;

      // Create the desired attributes by updating only the changed attribute
      const desiredAttributes = {
        ...selectedAttributes,
        [attributeId]: value,
      };

      // First, try to find a variation that matches ALL desired attributes
      // This preserves the existing selection as much as possible
      let targetVariation = product.variations.find((variation) => {
        return Object.entries(desiredAttributes).every(([attrId, val]) =>
          variation.attributes.some(
            (attr: VariationAttribute) =>
              attr.attributeId === attrId && attr.value === val
          )
        );
      });

      // If no exact match found, fall back to finding any variation with the new attribute value
      // but prioritize variations that share the most attributes with current selection
      if (!targetVariation) {
        const variationsWithNewAttribute = product.variations.filter((variation) =>
          variation.attributes.some(
            (attr: VariationAttribute) =>
              attr.attributeId === attributeId && attr.value === value
          )
        );

        // Sort by how many current attributes they preserve
        variationsWithNewAttribute.sort((a, b) => {
          const aMatches = Object.entries(selectedAttributes).filter(([attrId, val]) =>
            attrId !== attributeId && // Don't count the attribute we're changing
            a.attributes.some(
              (attr: VariationAttribute) =>
                attr.attributeId === attrId && attr.value === val
            )
          ).length;

          const bMatches = Object.entries(selectedAttributes).filter(([attrId, val]) =>
            attrId !== attributeId && // Don't count the attribute we're changing
            b.attributes.some(
              (attr: VariationAttribute) =>
                attr.attributeId === attrId && attr.value === val
            )
          ).length;

          return bMatches - aMatches; // Higher matches first
        });

        targetVariation = variationsWithNewAttribute[0];
      }

      if (targetVariation) {
        // Use all attributes from the target variation to ensure completeness
        const newAttributes: Record<string, string> = {};
        targetVariation.attributes.forEach((attr: VariationAttribute) => {
          newAttributes[attr.attributeId] = attr.value;
        });

        if (useUrlState) {
          // Navigate with the complete variation selection for URL mode
          const urlParams: Record<string, string> = {};
          targetVariation.attributes.forEach((attr: VariationAttribute) => {
            const paramName = attr.attributeId.toLowerCase();
            urlParams[paramName] = attr.value;
          });

                  (navigate as any)({
          search: (prev: any) => ({
            ...prev,
            ...urlParams,
          }),
          replace: true,
          resetScroll: false,
        });
        } else {
          // Set local state for non-URL mode
          setLocalSelectedAttributes(newAttributes);
        }
      }

      onVariationChange?.();
    },
    [product?.variations, selectedAttributes, navigate, onVariationChange, useUrlState]
  );

  // Clear a specific variation attribute (URL mode only)
  const clearVariation = useUrlState ? useCallback(
    (attributeId: string) => {
      const paramName = attributeId.toLowerCase();
      
      const newSearch = { ...search };
      delete newSearch[paramName];

      (navigate as any)({
        search: (prev: any) => ({
          ...prev,
          ...newSearch,
        }),
        replace: true,
        resetScroll: false,
      });

      onVariationChange?.();
    },
    [search, navigate, onVariationChange]
  ) : undefined;

  // Clear all variation selections (URL mode only)
  const clearAllVariations = useUrlState ? useCallback(() => {
    const newSearch: Record<string, string> = {};
    
    // Keep only non-variation params
    Object.entries(search || {}).forEach(([key, value]) => {
      const isVariationParam = Object.keys(PRODUCT_ATTRIBUTES).some(
        (attrId) => attrId.toLowerCase() === key
      );
      
      if (!isVariationParam && value) {
        newSearch[key] = value;
      }
    });

    (navigate as any)({
      search: (prev: any) => ({
        ...newSearch,
      }),
      replace: true,
      resetScroll: false,
    });

    onVariationChange?.();
  }, [search, navigate, onVariationChange]) : undefined;

  return {
    selectedVariation,
    selectedAttributes,
    selectVariation,
    isAttributeValueAvailable,
    clearVariation,
    clearAllVariations,
  };
} 