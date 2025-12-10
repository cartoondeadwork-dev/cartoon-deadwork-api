// api/mashup-image.js
export default async function handler(req, res) {
  // Allow your Shopify domain (change this if testing on preview URL)
  const ALLOW_ORIGIN = "https://www.cartoondeadwork.com";
  res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt, width = 1024, height = 1024, quality = "standard" } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: `${width}x${height}`,
        quality
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    const item = data?.data?.[0];
    let image_url = item?.url || (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
    return res.status(200).json({ image_url });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}

