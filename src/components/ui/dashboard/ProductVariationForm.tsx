import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Button } from "~/components/ui/shared/Button";
import { Input } from "~/components/ui/shared/Input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/shared/Select";
import { COUNTRY_OPTIONS } from "~/constants/countries";
import {
	getAttributeDisplayName,
	PRODUCT_ATTRIBUTES,
} from "~/lib/productAttributes";

// Define the Variation type since it's not exported from @/types
interface Variation {
	id: string;
	sku: string;
	price: number;
	stock: number;
	discount?: number | null; // Add discount field
	sort: number;
	shippingFrom?: string; // Country code for shipping origin
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
		value: string | number | null,
	) => void;
	onAddAttribute: (variationId: string, attributeId: string) => void;
	onRemoveAttribute: (variationId: string, attributeId: string) => void;
	onUpdateAttributeValue: (
		variationId: string,
		attributeId: string,
		value: string,
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
			className="border border-border rounded-md p-3 bg-background"
		>
			{/* Header with drag handle and remove button */}
			<div className="flex justify-between items-center mb-3">
				<div
					{...attributes}
					{...listeners}
					className="cursor-move p-1 bg-muted rounded text-xs"
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

			{/* Main fields in a compact grid */}
			<div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
				<div>
					<label
						htmlFor={`sku-${variation.id}`}
						className="block text-xs font-medium text-foreground mb-1"
					>
						SKU
					</label>
					<Input
						id={`sku-${variation.id}`}
						type="text"
						value={variation.sku}
						onChange={(e) => onUpdate(variation.id, "sku", e.target.value)}
						className="text-sm"
					/>
				</div>
				<div>
					<label
						htmlFor={`price-${variation.id}`}
						className="block text-xs font-medium text-foreground mb-1"
					>
						Price
					</label>
					<Input
						id={`price-${variation.id}`}
						type="number"
						value={variation.price}
						onChange={(e) =>
							onUpdate(variation.id, "price", parseFloat(e.target.value) || 0)
						}
						className="text-sm"
					/>
				</div>
				<div>
					<label
						htmlFor={`stock-${variation.id}`}
						className="block text-xs font-medium text-foreground mb-1"
					>
						Stock
					</label>
					<Input
						id={`stock-${variation.id}`}
						type="number"
						value={variation.stock}
						onChange={(e) =>
							onUpdate(variation.id, "stock", parseInt(e.target.value, 10) || 0)
						}
						className="text-sm"
					/>
				</div>
				<div>
					<label
						htmlFor={`discount-${variation.id}`}
						className="block text-xs font-medium text-foreground mb-1"
					>
						Discount %
					</label>
					<Input
						id={`discount-${variation.id}`}
						type="number"
						value={variation.discount || ""}
						onChange={(e) =>
							onUpdate(
								variation.id,
								"discount",
								parseInt(e.target.value, 10) || null,
							)
						}
						placeholder="0"
						min="0"
						max="100"
						className="text-sm"
					/>
				</div>
				<div className="col-span-2 lg:col-span-2">
					<label
						htmlFor={`shipping-${variation.id}`}
						className="block text-xs font-medium text-foreground mb-1"
					>
						Ships From
					</label>
					<Select
						value={variation.shippingFrom || "NONE"}
						onValueChange={(value) =>
							onUpdate(
								variation.id,
								"shippingFrom",
								value === "NONE" ? null : value,
							)
						}
					>
						<SelectTrigger id={`shipping-${variation.id}`} className="text-sm">
							<SelectValue placeholder="Shipping from..." />
						</SelectTrigger>
						<SelectContent>
							{COUNTRY_OPTIONS.map((country) => (
								<SelectItem key={country.code} value={country.code}>
									{country.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Attributes section - more compact */}
			<div className="mb-3">
				<h4 className="text-xs font-medium text-foreground mb-2">Attributes</h4>
				{variation.attributes.length > 0 ? (
					<div className="space-y-2">
						{variation.attributes.map((attr) => (
							<div
								key={attr.attributeId}
								className="flex items-center space-x-2"
							>
								<div className="flex-1 grid grid-cols-2 gap-2 items-center">
									<label
										htmlFor={`attr-${variation.id}-${attr.attributeId}`}
										className="text-xs font-medium text-foreground truncate"
									>
										{getAttributeDisplayName(attr.attributeId)}:
									</label>
									<Input
										id={`attr-${variation.id}-${attr.attributeId}`}
										type="text"
										value={attr.value}
										onChange={(e) =>
											onUpdateAttributeValue(
												variation.id,
												attr.attributeId,
												e.target.value,
											)
										}
										placeholder="Value"
										className="text-sm"
									/>
								</div>
								<Button
									type="button"
									onClick={() =>
										onRemoveAttribute(variation.id, attr.attributeId)
									}
									variant="invertedDestructive"
									size="icon"
									className="h-6 w-6 text-xs"
								>
									×
								</Button>
							</div>
						))}
					</div>
				) : (
					<p className="text-xs text-muted-foreground">
						No attributes added yet.
					</p>
				)}
			</div>

			{/* Add attribute section - more compact */}
			{unusedAttributes.length > 0 && (
				<div className="flex items-end space-x-2">
					<div className="flex-1">
						<label
							htmlFor={`add-attr-${variation.id}`}
							className="block text-xs font-medium text-foreground mb-1"
						>
							Add Attribute
						</label>
						<Select
							value={selectedAttribute}
							onValueChange={setSelectedAttribute}
						>
							<SelectTrigger
								id={`add-attr-${variation.id}`}
								className="text-sm"
							>
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
		Object.values(PRODUCT_ATTRIBUTES).map((attr) => attr.id),
	);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
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
				}),
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
			discount: null,
			sort: variations.length,
			shippingFrom: undefined,
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
		value: string | number | null,
	) => {
		onChange(
			variations.map((variation) =>
				variation.id === id ? { ...variation, [field]: value } : variation,
			),
		);
	};

	const handleAddAttribute = (variationId: string, attributeId: string) => {
		onChange(
			variations.map((variation) => {
				if (variation.id === variationId) {
					// Check if attribute already exists
					const attributeExists = variation.attributes.some(
						(attr) => attr.attributeId === attributeId,
					);

					if (!attributeExists) {
						return {
							...variation,
							attributes: [...variation.attributes, { attributeId, value: "" }],
						};
					}
				}
				return variation;
			}),
		);
	};

	const handleRemoveAttribute = (variationId: string, attributeId: string) => {
		onChange(
			variations.map((variation) => {
				if (variation.id === variationId) {
					return {
						...variation,
						attributes: variation.attributes.filter(
							(attr) => attr.attributeId !== attributeId,
						),
					};
				}
				return variation;
			}),
		);
	};

	const handleUpdateAttributeValue = (
		variationId: string,
		attributeId: string,
		value: string,
	) => {
		onChange(
			variations.map((variation) => {
				if (variation.id === variationId) {
					return {
						...variation,
						attributes: variation.attributes.map((attr) =>
							attr.attributeId === attributeId ? { ...attr, value } : attr,
						),
					};
				}
				return variation;
			}),
		);
	};

	// Get unused attributes for a specific variation
	const getUnusedAttributes = (variation: Variation) => {
		const usedAttributeIds = variation.attributes.map(
			(attr) => attr.attributeId,
		);
		return availableAttributes.filter(
			(attr) => !usedAttributeIds.includes(attr),
		);
	};

	return (
		<div className="space-y-4 pb-4">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={variations.map((item) => item.id)}
					strategy={verticalListSortingStrategy}
				>
					{/* Grid layout for variations */}
					<div className="grid grid-cols-1 md:grid-cols-2  gap-3">
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

			<Button type="button" onClick={handleAddVariation}>
				Add Variation
			</Button>
		</div>
	);
}
