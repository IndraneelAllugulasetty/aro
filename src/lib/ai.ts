import { z } from 'zod';

const insightSchema = z.object({
  soilType: z.string().min(1),
  suitableCrops: z.array(z.string().min(1)).min(1),
  estBudget: z.number().positive(),
  estYield: z.number().positive(),
  pesticides: z.array(z.string().min(1)).min(1),
});

export type LandInsights = z.infer<typeof insightSchema>;

function getMockInsights(location: string): LandInsights {
  const possibleSoils = ['Loamy', 'Clay', 'Sandy', 'Silt'];
  const possibleCropsList = [
    ['Wheat', 'Corn', 'Soybeans'],
    ['Cotton', 'Peanuts'],
    ['Rice', 'Sugarcane'],
    ['Tomatoes', 'Potatoes', 'Carrots'],
  ];
  const possiblePesticides = [
    ['Glyphosate', 'Atrazine'],
    ['Organophosphates', 'Pyrethroids'],
    ['Neonicotinoids', 'Fungicides'],
  ];

  const hash = location.length;
  const soilType = possibleSoils[hash % possibleSoils.length];
  const suitableCrops = possibleCropsList[hash % possibleCropsList.length];
  const estBudget = (hash * 1500) % 10000 + 2000;
  const estYield = estBudget * 1.6;
  const pesticides = possiblePesticides[hash % possiblePesticides.length];

  return { soilType, suitableCrops, estBudget, estYield, pesticides };
}

async function openAIJson(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an agronomy assistant. Output ONLY valid JSON. No markdown, no extra keys.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function generateLandInsights(input: {
  location: string;
  sizeAcres: number;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<LandInsights> {
  const location = input.location.trim();

  const prompt = [
    'Given the following farmland listing, estimate agronomy and basic unit economics.',
    '',
    `Location: ${location}`,
    `Size (acres): ${Number.isFinite(input.sizeAcres) ? input.sizeAcres : 'unknown'}`,
    input.latitude != null && input.longitude != null
      ? `Coordinates: ${input.latitude}, ${input.longitude}`
      : 'Coordinates: unknown',
    '',
    'Return JSON with exactly these keys:',
    '- soilType: string',
    '- suitableCrops: string[] (3-6 crops)',
    '- estBudget: number (USD, total budget for one season)',
    '- estYield: number (USD, total expected revenue for one season; should generally be >= estBudget)',
    '- pesticides: string[] (2-5 common categories or examples)',
  ].join('\n');

  const json = await openAIJson(prompt);
  const parsed = insightSchema.safeParse(json);
  if (parsed.success) return parsed.data;

  return getMockInsights(location);
}

