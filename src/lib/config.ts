export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254757512769";

export const generateWhatsAppLink = (productName: string, price: number, options?: Record<string, string>) => {
  let message = `Hi! I'd like to order *${productName}`;
  if (options && Object.keys(options).length > 0) {
    const opts = Object.entries(options).map(([k, v]) => `${k}: ${v}`).join(", ");
    message += ` (${opts})`;
  }
  message += `* at KES ${price.toLocaleString()}.`;
  message += `\n\nIs it available?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const generateCartWhatsAppLink = (items: { name: string; quantity: number; price: number; variantLabel?: string }[], total: number) => {
  let message = `*Hi Trivo Kenya! I'd like to place an order:*\n\n`;
  
  items.forEach(item => {
    const nameWithVariant = item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name;
    message += `- ${item.quantity}x ${nameWithVariant} = KES ${(item.price * item.quantity).toLocaleString()}\n`;
  });
  
  message += `\n*Total: KES ${total.toLocaleString()}*\n\nPlease confirm availability. My name and delivery location:`;
  
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
