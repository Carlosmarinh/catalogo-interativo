import { CartItem, CheckoutForm, Product, ProductAddon, Store } from '../types/catalog';

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

export function getAddonsTotal(addons?: ProductAddon[]): number {
  if (!addons || addons.length === 0) return 0;
  return addons.reduce((sum, addon) => sum + Number(addon.price || 0), 0);
}

export function getCartItemUnitPrice(item: CartItem): number {
  return getEffectivePrice(item.product) + getAddonsTotal(item.selectedAddons);
}

export function sanitizeWhatsAppNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '5511999999999';
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
    `*================================*`,
    `*NOVO PEDIDO #${orderCode} — ${store.name.toUpperCase()}*`,
    `*================================*`,
    `_Horário do pedido: ${now}_`,
    ``,
    `*DADOS DO CLIENTE:*`,
    `• *Nome:* ${checkout.customerName.trim() || 'Não informado'}`,
  ];

  if (checkout.customerPhone.trim()) {
    lines.push(`• *WhatsApp:* ${checkout.customerPhone.trim()}`);
  }

  lines.push(``);
  lines.push(`*--------------------------------*`);
  lines.push(`*ITENS PARA A COZINHA:*`);
  lines.push(`*--------------------------------*`);

  items.forEach((item, idx) => {
    const unitPrice = getCartItemUnitPrice(item);
    const lineTotal = unitPrice * item.quantity;
    lines.push(
      `*${idx + 1}. ${item.quantity}x ${item.product.name}* — *${formatCurrency(lineTotal)}*`
    );

    if (item.selectedAddons && item.selectedAddons.length > 0) {
      item.selectedAddons.forEach((addon) => {
        lines.push(`   + _Adicional: ${addon.name} (+${formatCurrency(addon.price)})_`);
      });
    }

    if (item.notes && item.notes.trim()) {
      lines.push(`   *Obs:* _${item.notes.trim()}_`);
    }
  });

  if (checkout.generalNotes.trim()) {
    lines.push(``);
    lines.push(`*Observações Gerais do Pedido:*`);
    lines.push(`_${checkout.generalNotes.trim()}_`);
  }

  lines.push(``);
  lines.push(`*--------------------------------*`);
  lines.push(`*ENTREGA / RECEBIMENTO:*`);
  lines.push(`*--------------------------------*`);

  if (checkout.deliveryMethod === 'delivery') {
    lines.push(`• *Modalidade:* Entrega (Delivery)`);
    lines.push(`• *Endereço:* ${checkout.streetAndNumber.trim() || 'A preencher'}`);
    lines.push(`• *Bairro:* ${checkout.neighborhood.trim() || 'A preencher'}`);
    if (checkout.complement.trim()) {
      lines.push(`• *Complemento/Ref:* ${checkout.complement.trim()}`);
    }
  } else {
    lines.push(`• *Modalidade:* Retirada no Balcão`);
    lines.push(`• *Local de Retirada:* ${store.address}`);
  }

  lines.push(``);
  lines.push(`*--------------------------------*`);
  lines.push(`*PAGAMENTO E VALORES:*`);
  lines.push(`*--------------------------------*`);
  lines.push(`• *Forma de Pagamento:* ${PAYMENT_LABELS[checkout.paymentMethod]}`);

  if (checkout.paymentMethod === 'cash') {
    const parsedChange = Number(checkout.cashChangeFor.replace(',', '.'));
    if (!checkout.needChange || !checkout.cashChangeFor.trim()) {
      lines.push(`• *Troco:* Não precisa de troco`);
    } else if (!isNaN(parsedChange) && parsedChange > total) {
      lines.push(
        `• *Troco para:* ${formatCurrency(parsedChange)} *(Levar ${formatCurrency(
          parsedChange - total
        )} de troco)*`
      );
    } else {
      lines.push(`• *Troco para:* R$ ${checkout.cashChangeFor.trim()}`);
    }
  }

  lines.push(`• *Subtotal dos itens:* ${formatCurrency(subtotal)}`);
  lines.push(
    `• *Taxa de entrega:* ${
      checkout.deliveryMethod === 'pickup'
        ? 'Grátis (Retirada)'
        : deliveryFee === 0
        ? 'Grátis'
        : formatCurrency(deliveryFee)
    }`
  );
  lines.push(`*TOTAL GERAL: ${formatCurrency(total)}*`);

  if (trackingUrl) {
    lines.push(``);
    lines.push(`*--------------------------------*`);
    lines.push(`*ACOMPANHE O STATUS AO VIVO:*`);
    lines.push(trackingUrl);
  }

  lines.push(`*================================*`);

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
