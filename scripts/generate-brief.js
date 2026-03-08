// 🌰 Regulatory Pulse — AI Brief Generator
// Uses GitHub Models (gpt-4o-mini) to analyze regulatory events

import { readFile, writeFile, mkdir } from "fs/promises"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const MODEL_URL =
  "https://models.inference.ai.azure.com/chat/completions"
const MODEL = "gpt-4o-mini"

/**
 * 🌰 Read events from data/events.json
 * @returns {Promise<Array>} Array of event objects
 */
async function loadEvents() {
  try {
    const raw = await readFile("data/events.json", "utf-8")
    const events = JSON.parse(raw)
    console.log(`🌰 Loaded ${events.length} events for analysis`)
    return events
  } catch {
    console.error("🌰 Could not read data/events.json — run api-call.js first")
    process.exit(1)
  }
}

/**
 * 🌰 Build the analysis prompt for the AI model
 * @param {Array} events - Array of event objects
 * @returns {string} Formatted prompt
 */
function buildPrompt(events) {
  const eventList = events
    .map(
      (e, i) =>
        `${i + 1}. [${e.timestamp}] ${e.title}\n   Source: ${e.source || "Unknown"}\n   Summary: ${e.summary || "N/A"}`
    )
    .join("\n\n")

  return `You are a crypto regulatory intelligence analyst. Analyze these regulatory events from the past week and produce a structured intelligence brief.

EVENTS:
${eventList}

Respond with ONLY valid JSON (no markdown, no code fences) in this exact structure:
{
  "summary": "2-3 sentence executive summary of the week's regulatory landscape",
  "by_jurisdiction": {
    "US": [{ "headline": "short title", "impact": "High|Medium|Low", "analysis": "1-2 sentence analysis" }],
    "EU": [{ "headline": "short title", "impact": "High|Medium|Low", "analysis": "1-2 sentence analysis" }],
    "Asia": [{ "headline": "short title", "impact": "High|Medium|Low", "analysis": "1-2 sentence analysis" }],
    "Global": [{ "headline": "short title", "impact": "High|Medium|Low", "analysis": "1-2 sentence analysis" }]
  },
  "outlook": "1-2 sentence forward-looking statement about regulatory trends"
}

Rules:
- Categorize each event into the most appropriate jurisdiction (US, EU, Asia, or Global)
- Assign impact levels based on market significance: High = major policy shift, Medium = notable development, Low = routine update
- If an event doesn't fit neatly, place it in Global
- Every jurisdiction array must have at least one entry (use "No significant developments this period" if needed)`
}

/**
 * 🌰 Call GitHub Models API for AI analysis
 * @param {string} prompt - The analysis prompt
 * @returns {Promise<Object>} Parsed AI response
 */
async function callGitHubModels(prompt) {
  console.log(`🌰 Calling GitHub Models (${MODEL})...`)

  const response = await fetch(MODEL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a crypto regulatory intelligence analyst. Respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GitHub Models API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error("No content in API response")
  }

  // Parse the JSON response (strip possible markdown fences)
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  return JSON.parse(cleaned)
}

/**
 * 🌰 Generate brief without AI (fallback when no GITHUB_TOKEN)
 * @param {Array} events - Array of event objects
 * @returns {Object} Basic brief structure
 */
function generateFallbackBrief(events) {
  console.log("🌰 No GITHUB_TOKEN — generating basic brief from events data")

  const byJurisdiction = { US: [], EU: [], Asia: [], Global: [] }

  for (const event of events) {
    const title = (event.title || "").toLowerCase()
    const entry = {
      headline: event.title || "Untitled event",
      impact: "Medium",
      analysis: event.summary || "No analysis available without AI.",
    }

    if (/sec |cftc |us |united states|american/i.test(title)) {
      byJurisdiction.US.push(entry)
    } else if (/eu |mica|europe|esma/i.test(title)) {
      byJurisdiction.EU.push(entry)
    } else if (/japan|china|korea|singapore|hong kong|asia/i.test(title)) {
      byJurisdiction.Asia.push(entry)
    } else {
      byJurisdiction.Global.push(entry)
    }
  }

  // Ensure every jurisdiction has at least one entry
  for (const key of Object.keys(byJurisdiction)) {
    if (byJurisdiction[key].length === 0) {
      byJurisdiction[key].push({
        headline: "No significant developments this period",
        impact: "Low",
        analysis: "No notable regulatory events detected for this jurisdiction.",
      })
    }
  }

  return {
    summary: `${events.length} regulatory events detected this week. AI analysis unavailable — showing raw event data.`,
    by_jurisdiction: byJurisdiction,
    outlook: "Enable GITHUB_TOKEN for AI-powered analysis and forward-looking insights.",
  }
}

/**
 * 🌰 Main: generate intelligence brief
 */
async function generateBrief() {
  try {
    const events = await loadEvents()

    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)

    let analysis

    if (GITHUB_TOKEN) {
      const prompt = buildPrompt(events)
      analysis = await callGitHubModels(prompt)
      console.log("🌰 AI analysis complete")
    } else {
      analysis = generateFallbackBrief(events)
    }

    const brief = {
      generated_at: now.toISOString(),
      period: `${weekAgo.toISOString().split("T")[0]} to ${now.toISOString().split("T")[0]}`,
      summary: analysis.summary,
      events_analyzed: events.length,
      by_jurisdiction: analysis.by_jurisdiction,
      outlook: analysis.outlook,
    }

    await mkdir("data", { recursive: true })
    await writeFile("data/brief.json", JSON.stringify(brief, null, 2))

    console.log("🌰 Brief saved to data/brief.json")
  } catch (error) {
    console.error("🌰 Brief generation failed:", error.message)
    process.exit(1)
  }
}

generateBrief()
