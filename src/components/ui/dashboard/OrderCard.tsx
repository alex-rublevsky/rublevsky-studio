import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/shared/Button";
import { Checkbox } from "~/components/ui/shared/Checkbox";
import { Image } from "~/components/ui/shared/Image";
import { Switch } from "~/components/ui/shared/Switch";

interface OrderAddress {
	id: number;
	orderId: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	streetAddress: string;
	city: string;
	state: string | null;
	country: string;
	zipCode: string;
	addressType: string;
	createdAt: Date;
}

interface OrderItem {
	id: number;
	orderId: number;
	productId: number;
	quantity: number;
	unitAmount: number;
	finalAmount: number;
	discountPercentage: number | null;
	product: {
		name: string;
		images: string | null;
	};
	variation?: {
		id: number;
		sku: string;
	};
	attributes?: Record<string, string>;
}

interface Order {
	id: number;
	status: string;
	subtotalAmount: number;
	discountAmount: number;
	shippingAmount: number;
	totalAmount: number;
	currency: string;
	paymentMethod: string | null;
	paymentStatus: string;
	shippingMethod: string | null;
	notes: string | null;
	createdAt: Date;
	completedAt: Date | null;
	addresses: OrderAddress[];
	items: OrderItem[];
}

interface OrderCardProps {
	order: Order;
	onStatusToggle: (orderId: number, currentStatus: string) => Promise<void>;
	onDelete?: (orderId: number) => Promise<void>;
	onClick?: (order: Order) => void;
	isSelectionMode?: boolean;
	isSelected?: boolean;
	onSelectionChange?: (orderId: number, selected: boolean) => void;
}

export function OrderCard({
	order,
	onStatusToggle,
	onDelete,
	onClick,
	isSelectionMode = false,
	isSelected = false,
	onSelectionChange,
}: OrderCardProps) {
	const shippingAddress = order.addresses?.find(
		(addr) => addr.addressType === "shipping" || addr.addressType === "both",
	);

	const totalItems =
		order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

	return (
		<button
			className={`border rounded-lg p-4 space-y-4 hover:border-primary/50 transition-colors cursor-pointer w-full text-left ${
				isSelectionMode && isSelected ? "ring-2 ring-primary" : ""
			}`}
			onClick={() => {
				if (isSelectionMode) {
					// In selection mode, toggle selection
					onSelectionChange?.(order.id, !isSelected);
				} else {
					// Normal mode, open drawer
					onClick?.(order);
				}
			}}
			type="button"
		>
			{/* Header */}
			<div className="flex items-center justify-between gap-2">
				<div className="min-w-0 flex items-center gap-2">
					{isSelectionMode && (
						<Checkbox
							checked={isSelected}
							onCheckedChange={(checked) =>
								onSelectionChange?.(order.id, !!checked)
							}
							onClick={(e) => e.stopPropagation()}
						/>
					)}
					<div className="flex flex-wrap items-center gap-2">
						<p className="text-xs text-foreground">#{order.id}</p>
						<p className="text-xs text-muted-foreground">
							{new Date(order.createdAt).toLocaleDateString()}
						</p>
						<p className="text-xs text-muted-foreground">
							{totalItems} {totalItems === 1 ? "item" : "items"}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{onDelete && (
						<Button
							size="icon"
							variant="ghost"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(order.id);
							}}
							className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			{/* All Order Items */}
			{order.items && order.items.length > 0 && (
				<div className="space-y-2">
					{order.items.map((item) => (
						<div key={item.id} className="flex items-center gap-2">
							<div className="relative w-12 h-12 shrink-0 bg-muted rounded overflow-hidden">
								{item.product.images ? (
									<Image
										src={`/${item.product.images.split(",").map((img) => img.trim())[0]}`}
										alt={item.product.name}
										className="object-cover"
										sizes="3rem"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
										No image
									</div>
								)}
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-xs font-medium truncate">
									{item.product.name}
								</p>
								<p className="text-xs text-muted-foreground">
									Qty: {item.quantity} × ${item.unitAmount.toFixed(2)}
								</p>
							</div>
							<p className="text-xs font-medium shrink-0">
								${item.finalAmount.toFixed(2)}
							</p>
						</div>
					))}
				</div>
			)}

			{/* Customer Info */}
			{shippingAddress && (
				<div className="space-y-1">
					<p className="text-xs font-medium">
						{shippingAddress.firstName} {shippingAddress.lastName}
					</p>
					<p className="text-xs text-muted-foreground truncate">
						{shippingAddress.email}
					</p>
					<p className="text-xs text-muted-foreground">
						{shippingAddress.city}, {shippingAddress.country}
					</p>
				</div>
			)}

			{/* Price and Status Toggle */}
			<div className="flex items-center justify-between pt-2 border-t">
				<div>
					<div className="flex items-baseline gap-0.5">
						<span className="text-xl font-light">
							{(order.totalAmount || 0).toFixed(2)}
						</span>
						<span className="text-xs font-light text-muted-foreground">
							{order.currency}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Switch
						checked={order.status === "processed"}
						onChange={(e) => {
							e.stopPropagation();
							onStatusToggle(order.id, order.status);
						}}
					/>
				</div>
			</div>
		</button>
	);
}
