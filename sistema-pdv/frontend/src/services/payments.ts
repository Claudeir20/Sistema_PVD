export interface PixPayment {
  id: string
  qrCodePayload: string
  status: "PENDING" | "CONFIRMED"
}

export async function createPixPayment(
  totalInCents: number,
): Promise<PixPayment> {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 350))

  return {
    id: `pix-${Date.now()}`,
    qrCodePayload: `PIX|OFICINA-CENTRAL|${totalInCents}`,
    status: "PENDING",
  }
}

export async function waitForPixPaymentConfirmation(
  payment: PixPayment,
): Promise<PixPayment> {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 3000))

  return {
    ...payment,
    status: "CONFIRMED",
  }
}
