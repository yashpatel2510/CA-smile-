import fs from "fs";
import path from "path";
import {
  FaqItem,
  FaqSettings,
  FaqsStoreData,
  DEFAULT_FAQS_STORE,
} from "@/types/faqs";

export * from "@/types/faqs";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "faqs-config.json");

declare global {
  // eslint-disable-next-line no-var
  var __faqsStoreData: FaqsStoreData | undefined;
}

export function getFaqsStoreData(): FaqsStoreData {
  if (global.__faqsStoreData) {
    return global.__faqsStoreData;
  }

  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      const data: FaqsStoreData = {
        settings: {
          ...DEFAULT_FAQS_STORE.settings,
          ...(parsed.settings || {}),
        },
        items: Array.isArray(parsed.items) ? parsed.items : DEFAULT_FAQS_STORE.items,
      };
      global.__faqsStoreData = data;
      return data;
    }
  } catch (err) {
    console.error("Failed to read faqs-config.json:", err);
  }

  global.__faqsStoreData = DEFAULT_FAQS_STORE;
  return DEFAULT_FAQS_STORE;
}

export function saveFaqsStoreData(data: FaqsStoreData): void {
  global.__faqsStoreData = data;
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist faqs-config.json:", err);
  }
}

export function updateFaqSettings(newSettings: Partial<FaqSettings>): FaqSettings {
  const store = getFaqsStoreData();
  const updatedSettings: FaqSettings = {
    ...store.settings,
    ...newSettings,
  };
  store.settings = updatedSettings;
  saveFaqsStoreData(store);
  return updatedSettings;
}

export function addFaqItem(item: Omit<FaqItem, "id" | "order"> & { id?: string; order?: number }): FaqItem {
  const store = getFaqsStoreData();
  const maxOrder = store.items.reduce((max, i) => Math.max(max, i.order || 0), 0);
  const newItem: FaqItem = {
    id: item.id || `faq-${Date.now()}`,
    question: item.question.trim(),
    answer: item.answer.trim(),
    category: item.category?.trim() || "General Care",
    isActive: item.isActive !== false,
    order: item.order !== undefined ? item.order : maxOrder + 1,
  };
  store.items.push(newItem);
  saveFaqsStoreData(store);
  return newItem;
}

export function updateFaqItem(id: string, updates: Partial<Omit<FaqItem, "id">>): FaqItem | null {
  const store = getFaqsStoreData();
  const index = store.items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  store.items[index] = {
    ...store.items[index],
    ...updates,
  };
  saveFaqsStoreData(store);
  return store.items[index];
}

export function deleteFaqItem(id: string): boolean {
  const store = getFaqsStoreData();
  const initialLength = store.items.length;
  store.items = store.items.filter((item) => item.id !== id);
  if (store.items.length !== initialLength) {
    saveFaqsStoreData(store);
    return true;
  }
  return false;
}

export function reorderFaqItems(orderedIds: string[]): FaqItem[] {
  const store = getFaqsStoreData();
  const itemMap = new Map(store.items.map((i) => [i.id, i]));
  const reordered: FaqItem[] = [];

  orderedIds.forEach((id, idx) => {
    const item = itemMap.get(id);
    if (item) {
      item.order = idx + 1;
      reordered.push(item);
      itemMap.delete(id);
    }
  });

  // Append any remaining items
  itemMap.forEach((item) => {
    item.order = reordered.length + 1;
    reordered.push(item);
  });

  store.items = reordered;
  saveFaqsStoreData(store);
  return reordered;
}
