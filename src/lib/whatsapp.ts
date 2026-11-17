import { CartItem, CheckoutForm, Product, Store } from '../types/catalog';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getEffectivePrice(product: Product): number {
  if (
    typeof product.promo_price === 'number' &&
    product.promo_price > 0 &&
    product.promo_price < product.price
  ) {
    return product.promo_price;
  }
  return product.price;
}

export function sanitizeWhatsAppNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '5511999999999';
  // Se o lojista digitou apenas DDD + número (10 ou 11 dígitos), prefixa DDI 55 do Brasil
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export function formatPhoneDisplay(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  const local = digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits;
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return rawPhone;
}

const PAYMENT_LABELS: Record<CheckoutForm['paymentMethod'], string> = {
  pix: 'Pix (Chave / QR Code)',
  card: 'Cartão de Crédito/Débito (Maquininha)',
  cash: 'Dinheiro em Espécie',
};

export function buildWhatsAppOrderMessage({
  store,
  items,
  checkout,
  subtotal,
  deliveryFee,
  total,
  orderCode: providedCode,
}: {
  store: Store;
  items: CartItem[];
  checkout: CheckoutForm;
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderCode?: number;
}): string {
  const orderCode = providedCode || Math.floor(1000 + Math.random() * 9000);
  const trackingUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/pedido/${orderCode}`
      : '';
  const now = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [
    `*NOVO PEDIDO #${orderCode} — ${store.name.toUpperCase()}*`,
    `_Enviado via ZapCatálogo às ${now}_`,
    `--------------------------------`,
    `*CLIENTE:* ${checkout.customerName.trim()}`,
  ];

  if (checkout.customerPhone.trim()) {
    lines.push(`*CONTATO:* ${checkout.customerPhone.trim()}`);
  }

  lines.push(`--------------------------------`);
  lines.push(`*ITENS DO PEDIDO:*`);

  items.forEach((item) => {
    const unitPrice = getEffectivePrice(item.product);
    const lineTotal = unitPrice * item.quantity;
    lines.push(
      `• *${item.quantity}x ${item.product.name}* — ${formatCurrency(lineTotal)}`
    );
    if (item.notes.trim()) {
      lines.push(`   _Obs: ${item.notes.trim()}_`);
    }
  });

  if (checkout.generalNotes.trim()) {
    lines.push(``);
    lines.push(`*Observações Gerais:* ${checkout.generalNotes.trim()}`);
  }

  lines.push(`--------------------------------`);

  if (checkout.deliveryMethod === 'delivery') {
    lines.push(`*MODALIDADE:* Entrega (Delivery)`);
    lines.push(`*ENDEREÇO:* ${checkout.streetAndNumber.trim()}`);
    lines.push(`*BAIRRO:* ${checkout.neighborhood.trim()}`);
    if (checkout.complement.trim()) {
      lines.push(`*COMPLEMENTO/REF:* ${checkout.complement.trim()}`);
    }
  } else {
    lines.push(`*MODALIDADE:* Retirada no Balcão`);
    lines.push(`*LOCAL DE RETIRADA:* ${store.address}`);
  }

  lines.push(`--------------------------------`);
  lines.push(`*FORMA DE PAGAMENTO:* ${PAYMENT_LABELS[checkout.paymentMethod]}`);
  if (checkout.paymentMethod === 'cash') {
    if (checkout.cashChangeFor.trim()) {
      lines.push(`*TROCO PARA:* R$ ${checkout.cashChangeFor.trim()}`);
    } else {
      lines.push(`*TROCO:* Não precisa de troco`);
    }
  }

  lines.push(`--------------------------------`);
  lines.push(`Subtotal dos itens: ${formatCurrency(subtotal)}`);
  lines.push(
    `Taxa de entrega: ${
      checkout.deliveryMethod === 'pickup'
        ? 'Grátis (Retirada)'
        : deliveryFee === 0
        ? 'Grátis'
        : formatCurrency(deliveryFee)
    }`
  );
  lines.push(`*TOTAL A PAGAR: ${formatCurrency(total)}*`);
  lines.push(`--------------------------------`);
  if (trackingUrl) {
    lines.push(`*ACOMPANHE O STATUS AO VIVO:*`);
    lines.push(trackingUrl);
    lines.push(`--------------------------------`);
  }
  lines.push(`Aguardo a confirmação do pedido!`);

  return lines.join('\n');
}

export function buildWhatsAppOrderUrl(params: {
  store: Store;
  items: CartItem[];
  checkout: CheckoutForm;
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderCode?: number;
}): { url: string; message: string } {
  const message = buildWhatsAppOrderMessage(params);
  const phone = sanitizeWhatsAppNumber(params.store.whatsapp_number);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return { url, message };
}
