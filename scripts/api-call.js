// 🌰 Regulatory Pulse — CPW API Data Fetcher
// Fetches crypto regulation & compliance events from CPW Tracker API

import { writeFile, mkdir } from "fs/promises"

const API_URL = "https://cpw-tracker.p.rapidapi.com/"
const API_KEY = process.env.RAPIDAPI_KEY

if (!API_KEY) {
  console.error("🌰 Error: RAPIDAPI_KEY environment variable is required")
  process.exit(1)
}

/**
 * 🌰 Get 7-day date range (maximum allowed by CPW API)
 * @returns {Object} Object with startTime and endTime ISO strings
 */
function getDateRange() {
  const now = new Date()
  const endTime = now
  const startTime = new Date(now)
  startTime.setDate(startTime.getDate() - 7) // 7 days — max range
  return {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  }
}

/**
 * 🌰 Fetch regulatory events from CPW Tracker API
 * Tracks crypto regulation, compliance, and enforcement activity
 * @returns {Promise<Array>} Array of regulatory event objects
 */
async function fetchData() {
  const { startTime, endTime } = getDateRange()

  console.log(`🌰 Fetching regulatory events: ${startTime} → ${endTime}`)

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": "cpw-tracker.p.rapidapi.com",
      "x-rapidapi-key": API_KEY,
    },
    body: JSON.stringify({
      entities: "cryptocurrency exchanges, SEC, CFTC, MiCA, central banks",
      topic: "regulation OR compliance OR enforcement OR legislation",
      startTime,
      endTime,
    }),
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  const data = await response.json()
  const results = Array.isArray(data) ? data : []

  console.log(`🌰 Found ${results.length} regulatory events`)
  return results
}

/**
 * 🌰 Save events sorted by timestamp (newest first)
 * @param {Array} data - Array of event objects
 */
async function saveData(data) {
  const sorted = data.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )

  await mkdir("data", { recursive: true })
  await writeFile("data/events.json", JSON.stringify(sorted, null, 2))

  console.log(`🌰 Saved ${sorted.length} events to data/events.json`)
}

/**
 * 🌰 Main: fetch and save regulatory events
 */
async function updateData() {
  try {
    const data = await fetchData()
    await saveData(data)
    console.log("🌰 Regulatory Pulse update completed successfully")
  } catch (error) {
    console.error("🌰 Update failed:", error.message)
    process.exit(1)
  }
}

updateData()
