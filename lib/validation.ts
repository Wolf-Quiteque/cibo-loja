import { z } from "zod";

export const signupSchema = z.object({
  role: z.enum(["cliente", "vendedor"]),
  name: z.string().trim().min(2, "Nome muito curto").max(60),
  phone: z
    .string()
    .trim()
    .regex(/^9\d{8}$/u, "Telefone inválido (9 dígitos começando por 9)"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(120),
});

export const loginSchema = z.object({
  phone: z.string().trim().regex(/^9\d{8}$/u, "Telefone inválido"),
  password: z.string().min(1, "Insira a senha"),
});

export const storeSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(500).optional().default(""),
  category: z.string().trim().min(2).max(40),
  phone: z.string().trim().regex(/^9\d{8}$/u, "Telefone inválido"),
  address: z.string().trim().min(4).max(200),
  deliveryFee: z.coerce.number().int().min(0).max(100000),
  isOpen: z.coerce.boolean().optional().default(true),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().default(""),
  price: z.coerce.number().int().min(1).max(10_000_000),
  category: z.string().trim().min(1).max(40),
  available: z.coerce.boolean().optional().default(true),
});

export const cartItemSchema = z.object({
  productId: z.string().regex(/^[a-f0-9]{24}$/u),
  qty: z.coerce.number().int().min(1).max(50),
});

export const placeOrderSchema = z.object({
  storeId: z.string().regex(/^[a-f0-9]{24}$/u),
  items: z.array(cartItemSchema).min(1, "Carrinho vazio"),
  street: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(60),
  notes: z.string().trim().max(300).optional().default(""),
  phone: z.string().trim().regex(/^9\d{8}$/u, "Telefone inválido"),
  paymentMethod: z.enum(["dinheiro_na_entrega", "transferencia"]),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
