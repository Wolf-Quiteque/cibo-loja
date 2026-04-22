import { MongoClient, type Db, type Collection, ObjectId } from "mongodb";
import { env } from "./env";

declare global {

  var _mongoClientPromise: Promise<MongoClient> | undefined;

  var _mongoIndexesReady: Promise<void> | undefined;
}

function createClient(): Promise<MongoClient> {
  const client = new MongoClient(env.mongoUri(), {
    maxPoolSize: 10,
  });
  return client.connect();
}

const clientPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? (global._mongoClientPromise = createClient());

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const db = client.db(env.mongoDb());
  if (!global._mongoIndexesReady) {
    global._mongoIndexesReady = ensureIndexes(db).catch((e) => {
      global._mongoIndexesReady = undefined;
      throw e;
    });
  }
  await global._mongoIndexesReady;
  return db;
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection("users").createIndex({ phone: 1 }, { unique: true }),
    db.collection("stores").createIndex({ slug: 1 }, { unique: true }),
    db.collection("stores").createIndex({ vendorId: 1 }),
    db.collection("products").createIndex({ storeId: 1 }),
    db.collection("products").createIndex({ category: 1 }),
    db.collection("orders").createIndex({ clientId: 1, createdAt: -1 }),
    db.collection("orders").createIndex({ storeId: 1, createdAt: -1 }),
    db.collection("orders").createIndex({ status: 1 }),
  ]);
}

export type Role = "cliente" | "vendedor";

export type OrderStatus =
  | "pendente"
  | "confirmado"
  | "preparando"
  | "a_caminho"
  | "entregue"
  | "cancelado";

export type PaymentMethod = "dinheiro_na_entrega" | "transferencia";

export type PaymentStatus = "aguardando" | "comprovante_enviado" | "confirmado";

export interface UserAddress {
  label: string;
  street: string;
  city: string;
  notes?: string;
}

export interface UserDoc {
  _id: ObjectId;
  role: Role;
  name: string;
  phone: string;
  passwordHash: string;
  addresses?: UserAddress[];
  createdAt: Date;
}

export interface StoreDoc {
  _id: ObjectId;
  vendorId: ObjectId;
  name: string;
  slug: string;
  description: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone: string;
  address: string;
  isOpen: boolean;
  deliveryFee: number;
  createdAt: Date;
}

export interface ProductDoc {
  _id: ObjectId;
  storeId: ObjectId;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  available: boolean;
  createdAt: Date;
}

export interface OrderItem {
  productId: ObjectId;
  name: string;
  price: number;
  qty: number;
}

export interface OrderDoc {
  _id: ObjectId;
  clientId: ObjectId;
  storeId: ObjectId;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: { street: string; city: string; notes?: string; phone: string };
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentProofUrl?: string;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export async function users(): Promise<Collection<UserDoc>> {
  return (await getDb()).collection<UserDoc>("users");
}
export async function stores(): Promise<Collection<StoreDoc>> {
  return (await getDb()).collection<StoreDoc>("stores");
}
export async function products(): Promise<Collection<ProductDoc>> {
  return (await getDb()).collection<ProductDoc>("products");
}
export async function orders(): Promise<Collection<OrderDoc>> {
  return (await getDb()).collection<OrderDoc>("orders");
}

export { ObjectId };
