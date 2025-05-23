//TODO: update input to include label

import React, { useState } from "react";
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
import {
  PRODUCT_ATTRIBUTES,
  getAttributeDisplayName,
} from "~/lib/productAttributes";
import { Input } from "~/components/ui/shared/Input";
import { Button } from "~/components/ui/shared/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/dashboard/Select";

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
  attributeId: string;
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
  onUpdate: (
    id: string,
    field: keyof Variation,
    value: string | number
  ) => void;
  onAddAttribute: (variationId: string, attributeId: string) => void;
  onRemoveAttribute: (variationId: string, attributeId: string) => void;
  onUpdateAttributeValue: (
    variationId: string,
    attributeId: string,
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
      className="border border-border rounded-md p-4 bg-background"
    >
      <div className="flex justify-between items-center mb-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move p-2 bg-muted rounded"
        >
          ≡
        </div>
        <Button
          type="button"
          onClick={() => onRemove(variation.id)}
          variant="invertedDestructive"
          size="sm"
        >
          Remove
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            SKU
          </label>
          <Input
            type="text"
            value={variation.sku}
            onChange={(e) => onUpdate(variation.id, "sku", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Price
          </label>
          <Input
            type="number"
            value={variation.price}
            onChange={(e) =>
              onUpdate(variation.id, "price", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Stock
          </label>
          <Input
            type="number"
            value={variation.stock}
            onChange={(e) =>
              onUpdate(variation.id, "stock", parseInt(e.target.value) || 0)
            }
          />
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-foreground mb-2">Attributes</h4>
        {variation.attributes.length > 0 ? (
          <div className="space-y-3">
            {variation.attributes.map((attr) => (
              <div
                key={attr.attributeId}
                className="flex items-center space-x-2"
              >
                <div className="grow grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-foreground">
                    {getAttributeDisplayName(attr.attributeId)}:
                  </div>
                  <Input
                    type="text"
                    value={attr.value}
                    onChange={(e) =>
                      onUpdateAttributeValue(
                        variation.id,
                        attr.attributeId,
                        e.target.value
                      )
                    }
                    placeholder="Value"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() =>
                    onRemoveAttribute(variation.id, attr.attributeId)
                  }
                  variant="invertedDestructive"
                  size="icon"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No attributes added yet.
          </p>
        )}
      </div>

      {unusedAttributes.length > 0 && (
        <div className="flex items-end space-x-2">
          <div className="grow max-w-md">
            <label className="block text-sm font-medium text-foreground mb-1">
              Add Attribute
            </label>
            <Select
              value={selectedAttribute}
              onValueChange={setSelectedAttribute}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an attribute" />
              </SelectTrigger>
              <SelectContent>
                {unusedAttributes.map((attr) => (
                  <SelectItem key={attr} value={attr}>
                    {getAttributeDisplayName(attr)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={handleAddAttributeClick}
            disabled={!selectedAttribute}
            variant="inverted"
            size="sm"
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProductVariationForm({
  variations,
  onChange,
}: ProductVariationFormProps) {
  const [availableAttributes] = useState<string[]>(
    Object.values(PRODUCT_ATTRIBUTES).map((attr) => attr.id)
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    value: string | number
  ) => {
    onChange(
      variations.map((variation) =>
        variation.id === id ? { ...variation, [field]: value } : variation
      )
    );
  };

  const handleAddAttribute = (variationId: string, attributeId: string) => {
    onChange(
      variations.map((variation) => {
        if (variation.id === variationId) {
          // Check if attribute already exists
          const attributeExists = variation.attributes.some(
            (attr) => attr.attributeId === attributeId
          );

          if (!attributeExists) {
            return {
              ...variation,
              attributes: [...variation.attributes, { attributeId, value: "" }],
            };
          }
        }
        return variation;
      })
    );
  };

  const handleRemoveAttribute = (variationId: string, attributeId: string) => {
    onChange(
      variations.map((variation) => {
        if (variation.id === variationId) {
          return {
            ...variation,
            attributes: variation.attributes.filter(
              (attr) => attr.attributeId !== attributeId
            ),
          };
        }
        return variation;
      })
    );
  };

  const handleUpdateAttributeValue = (
    variationId: string,
    attributeId: string,
    value: string
  ) => {
    onChange(
      variations.map((variation) => {
        if (variation.id === variationId) {
          return {
            ...variation,
            attributes: variation.attributes.map((attr) =>
              attr.attributeId === attributeId ? { ...attr, value } : attr
            ),
          };
        }
        return variation;
      })
    );
  };

  // Get unused attributes for a specific variation
  const getUnusedAttributes = (variation: Variation) => {
    const usedAttributeIds = variation.attributes.map(
      (attr) => attr.attributeId
    );
    return availableAttributes.filter(
      (attr) => !usedAttributeIds.includes(attr)
    );
  };

  return (
    <div className="space-y-6 pb-6">
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

      <Button type="button" onClick={handleAddVariation} variant="inverted">
        Add Variation
      </Button>
    </div>
  );
}
