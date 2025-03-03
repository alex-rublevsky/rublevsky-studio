"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getProductAttributes } from "@/lib/actions/products";

// Define the Variation type since it's not exported from @/types
interface Variation {
  id: string;
  sku: string;
  price: number;
  stock: number;
  sort: number;
  attributes: VariationAttribute[];
}

interface VariationAttribute {
  name: string;
  value: string;
}

interface ProductVariationFormProps {
  variations: Variation[];
  onChange: (variations: Variation[]) => void;
}

// Sortable variation item component
function SortableVariationItem({
  variation,
  onRemove,
  onUpdate,
  onAddAttribute,
  onRemoveAttribute,
  onUpdateAttributeValue,
  unusedAttributes,
}: {
  variation: Variation;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Variation, value: any) => void;
  onAddAttribute: (variationId: string, attributeName: string) => void;
  onRemoveAttribute: (variationId: string, attributeName: string) => void;
  onUpdateAttributeValue: (
    variationId: string,
    attributeName: string,
    value: string
  ) => void;
  unusedAttributes: string[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: variation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [selectedAttribute, setSelectedAttribute] = useState("");

  const handleAddAttributeClick = () => {
    if (selectedAttribute) {
      onAddAttribute(variation.id, selectedAttribute);
      setSelectedAttribute("");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-300 rounded-md p-4 bg-white"
    >
      <div className="flex justify-between items-center mb-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move p-2 bg-gray-100 rounded"
        >
          ≡
        </div>
        <button
          type="button"
          onClick={() => onRemove(variation.id)}
          className="text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            value={variation.sku}
            onChange={(e) => onUpdate(variation.id, "sku", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            value={variation.price}
            onChange={(e) =>
              onUpdate(variation.id, "price", parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock
          </label>
          <input
            type="number"
            value={variation.stock}
            onChange={(e) =>
              onUpdate(variation.id, "stock", parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Attributes</h4>
        {variation.attributes.length > 0 ? (
          <div className="space-y-3">
            {variation.attributes.map((attr) => (
              <div key={attr.name} className="flex items-center space-x-2">
                <div className="flex-grow grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">{attr.name}:</div>
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) =>
                      onUpdateAttributeValue(
                        variation.id,
                        attr.name,
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Value"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveAttribute(variation.id, attr.name)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No attributes added yet.</p>
        )}
      </div>

      {unusedAttributes.length > 0 && (
        <div className="flex items-end space-x-2">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Attribute
            </label>
            <select
              value={selectedAttribute}
              onChange={(e) => setSelectedAttribute(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an attribute</option>
              {unusedAttributes.map((attr) => (
                <option key={attr} value={attr}>
                  {attr}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddAttributeClick}
            disabled={!selectedAttribute}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductVariationForm({
  variations,
  onChange,
}: ProductVariationFormProps) {
  const [availableAttributes, setAvailableAttributes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const attributes = await getProductAttributes();
      setAvailableAttributes(attributes || []);
    } catch (err) {
      console.error("Error fetching attributes:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = variations.findIndex((item) => item.id === active.id);
      const newIndex = variations.findIndex((item) => item.id === over.id);

      const newVariations = arrayMove(variations, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          sort: index,
        })
      );

      onChange(newVariations);
    }
  };

  const handleAddVariation = () => {
    const newVariation: Variation = {
      id: `temp-${Date.now()}`,
      sku: "",
      price: 0,
      stock: 0,
      sort: variations.length,
      attributes: [],
    };
    onChange([...variations, newVariation]);
  };

  const handleRemoveVariation = (id: string) => {
    onChange(variations.filter((variation) => variation.id !== id));
  };

  const handleUpdateVariation = (
    id: string,
    field: keyof Variation,
    value: any
  ) => {
    onChange(
      variations.map((variation) =>
        variation.id === id ? { ...variation, [field]: value } : variation
      )
    );
  };

  const handleAddAttribute = (variationId: string, attributeName: string) => {
    onChange(
      variations.map((variation) => {
        if (variation.id === variationId) {
          // Check if attribute already exists
          const attributeExists = variation.attributes.some(
            (attr) => attr.name === attributeName
          );

          if (!attributeExists) {
            return {
              ...variation,
              attributes: [
                ...variation.attributes,
                { name: attributeName, value: "" },
              ],
            };
          }
        }
        return variation;
      })
    );
  };

  const handleRemoveAttribute = (
    variationId: string,
    attributeName: string
  ) => {
    onChange(
      variations.map((variation) => {
        if (variation.id === variationId) {
          return {
            ...variation,
            attributes: variation.attributes.filter(
              (attr) => attr.name !== attributeName
            ),
          };
        }
        return variation;
      })
    );
  };

  const handleUpdateAttributeValue = (
    variationId: string,
    attributeName: string,
    value: string
  ) => {
    onChange(
      variations.map((variation) => {
        if (variation.id === variationId) {
          return {
            ...variation,
            attributes: variation.attributes.map((attr) =>
              attr.name === attributeName ? { ...attr, value } : attr
            ),
          };
        }
        return variation;
      })
    );
  };

  // Get unused attributes for a specific variation
  const getUnusedAttributes = (variation: Variation) => {
    const usedAttributeNames = variation.attributes.map((attr) => attr.name);
    return availableAttributes.filter(
      (attr) => !usedAttributeNames.includes(attr)
    );
  };

  return (
    <div className="space-y-6">
      {isLoading && <p className="text-gray-500">Loading attributes...</p>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading attributes: {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={variations.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {variations.map((variation) => (
              <SortableVariationItem
                key={variation.id}
                variation={variation}
                onRemove={handleRemoveVariation}
                onUpdate={handleUpdateVariation}
                onAddAttribute={handleAddAttribute}
                onRemoveAttribute={handleRemoveAttribute}
                onUpdateAttributeValue={handleUpdateAttributeValue}
                unusedAttributes={getUnusedAttributes(variation)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={handleAddVariation}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Add Variation
      </button>
    </div>
  );
}
