import { GoogleGenAI, Type } from "@google/genai";

export interface Lead {
  companyName: string;
  companyNameLocal?: string;
  website: string;
  category: string;
  phone: string;
  email: string;
  socialMedia: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  telegram?: string;
  whatsapp?: string;
  city: string;
  cityLocal?: string;
  country: string;
  keyPersonnel?: string;
  reasoning: string;
}

const leadSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      companyName: { type: Type.STRING, description: "Company name in English" },
      companyNameLocal: { type: Type.STRING, description: "Company name in the local language of the region" },
      website: { type: Type.STRING },
      category: { 
        type: Type.STRING,
        description: "The industry or role of the company (e.g., Manufacturer, Distributor, Service Provider, etc.)"
      },
      phone: { type: Type.STRING },
      email: { type: Type.STRING },
      socialMedia: { type: Type.STRING, description: "Primary LinkedIn profile URL" },
      facebook: { type: Type.STRING },
      instagram: { type: Type.STRING },
      twitter: { type: Type.STRING },
      telegram: { type: Type.STRING },
      whatsapp: { type: Type.STRING },
      city: { type: Type.STRING, description: "City name in English" },
      cityLocal: { type: Type.STRING, description: "City name in the local language" },
      country: { type: Type.STRING },
      keyPersonnel: { type: Type.STRING, description: "Names and roles of key people found (CEO, Sales Manager, etc.)" },
      reasoning: { type: Type.STRING, description: "Why this lead is high-quality and verified" }
    },
    required: ["companyName", "website", "category", "city", "country", "reasoning"]
  }
};

export async function generateLeads(chemical: string, region: string): Promise<Lead[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const genAI = new GoogleGenAI({ apiKey });
  
  const currentTime = new Date().toISOString();
  const prompt = `
    Role: Professional Lead Generation Engine & Data Architect.
    Current Date: ${currentTime}

    Task: Deep-search the internet for the query "${chemical}" in the region "${region}".
    
    Query Analysis & Translation:
    1. Translate "${chemical}" into the primary local language of "${region}".
    2. Perform searches using both the original query and the translated version.
    3. If "${chemical}" is a URL, analyze that specific website and its associated social media.
    4. If "${chemical}" is a company name, prioritize finding that specific entity first.

    Extraction Logic (Strict Filtering):
    1. Search Sources (MANDATORY): 
       - Multi-Engine Search: Use Google Search, Bing Search, and Google Maps.
       - Industrial Directories: Check Kompass, Europages, and local trade lists.
       - Social Media (Deep Scan): LinkedIn, Facebook, Instagram, Twitter/X.
       - Messaging: Look for Telegram handles and WhatsApp Business numbers.
       - Search Engine Analysis: Identify the most authoritative regional players.

    2. Multilingual Output Requirement:
       - For each lead, provide the Company Name and City in BOTH English and the Local Language of "${region}".
       - Identify key personnel (CEO, Sales, Managers) and their contact info if available.

    3. Verification & Inclusion:
       - MANDATORY: If a company matches the query name or URL exactly, it MUST be included as the top result.
       - Ensure the website is active and prioritize companies with clear contact details (Email, Phone, WhatsApp).

    3. Classification:
       - Buyer: Produces end-products (Paint, Resins, Pharma, Cleaning supplies, etc.).
       - Seller/Distributor: Lists chemicals as main sales item/trading.
       - Manufacturer: Has a refinery, plant, or production facility.

    4. Diversity Requirement:
       - Provide a diverse set of leads. 
       - Do NOT return generic or extremely well-known global corporations unless they have a specific regional plant.
       - Focus on high-quality regional players.

    Return a list of high-quality, verified leads with clickable URLs and active contact info.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: leadSchema,
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (e: any) {
    console.error("API Error:", e);
    if (e.message?.includes("429") || e.message?.includes("quota")) {
      throw new Error("سهمیه جستجوی رایگان به پایان رسیده است. لطفاً چند دقیقه دیگر تلاش کنید.");
    }
    if (e.message?.includes("403") || e.message?.includes("permission")) {
      throw new Error("خطای دسترسی به API. لطفاً تنظیمات کلید خود را بررسی کنید.");
    }
    throw new Error("خطا در برقراری ارتباط با سرور جستجو. لطفاً دوباره تلاش کنید.");
  }
}
