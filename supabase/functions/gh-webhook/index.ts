// GitHub push webhook — no auth required (GitHub doesn't send Supabase keys)
// SegFault BOT: evaluates commits via Gemini and posts updates to the forum

import { createClient } from "jsr:@supabase/supabase-js@2"

const BOT_USER_ID = "00000000-0000-0000-0000-000000000001"
const BOT_USERNAME = "SegFault-BOT"
const GEMINI_MODEL = "gemini-3-flash-preview"

Deno.serve(async (req) => {
  const start = Date.now()

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 })
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")
    if (!GEMINI_API_KEY) {
      return new Response("Missing GEMINI_API_KEY", { status: 500 })
    }

    const body = await req.json()
    const ref = body.ref

    if (!ref?.endsWith("/main")) {
      return Response.json({ posted: false, reason: "Not main branch" })
    }

    const commits = body.commits
    if (!commits?.length) {
      return Response.json({ posted: false, reason: "No commits" })
    }

    const commitText = commits.map((c: any) => `- ${c.message?.split("\n")[0]}`).join("\n")
    const repoName = body.repository?.full_name ?? "unknown"
    const pusherName = body.pusher?.name ?? "unknown"

    console.log(`Evaluating ${commits.length} commit(s) for ${repoName}`)

    const decision = await evaluateChanges(GEMINI_API_KEY, commitText, repoName)

    if (!decision.post) {
      console.log(`Skipping post: ${decision.reason}`)
      return Response.json({ posted: false, reason: decision.reason })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // Ensure bot profile exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", BOT_USER_ID)
      .maybeSingle()

    if (!profile) {
      await supabase.from("profiles").insert({
        id: BOT_USER_ID,
        username: BOT_USERNAME,
        name: "SegFault BOT",
        karma: 0,
      })
    }

    const pusherNote = pusherName !== "unknown" ? `\n\n*Pushed by ${pusherName}*` : ""
    const content = `${decision.summary ?? ""}${pusherNote}`

    const { error } = await supabase.from("posts").insert({
      title: decision.title ?? "Update",
      content,
      user_id: BOT_USER_ID,
    })

    if (error) {
      console.error("Insert error:", error)
      return Response.json({ posted: false, error: error.message }, { status: 500 })
    }

    console.log(`Post created in ${Date.now() - start}ms`)
    return Response.json({ posted: true })
  } catch (err) {
    console.error("Handler error:", err)
    return new Response(String(err), { status: 500 })
  }
})

interface Evaluation {
  post: boolean
  title?: string
  summary?: string
  reason?: string
}

async function evaluateChanges(
  apiKey: string,
  commitText: string,
  repoName: string,
): Promise<Evaluation> {
  const prompt = `You are SegFault BOT for the ${repoName} repo. Analyze these git commits and decide if a forum announcement post should be made.

RULES:
- Post ONLY for: new features, major refactors, breaking changes, significant bug fixes, UI/UX improvements, database migrations, dependency changes that affect users.
- IGNORE: typo fixes, README/docs-only changes, trivial dependency bumps, chore commits, CI config tweaks, formatting-only changes, "wip" or "temp" commits.

Commits:
${commitText}

Respond with JSON only.
If worth posting: {"post":true,"title":"Short title (<60 chars)","summary":"2-4 sentence explanation"}
If not: {"post":false,"reason":"Brief explanation"}

Be concise and factual. No enthusiasm, no emoji, no markdown in the summary.`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25000)

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 500,
          },
        }),
        signal: controller.signal,
      },
    )

    if (!res.ok) {
      const err = await res.text()
      return { post: false, reason: `Gemini error: ${err}` }
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return { post: false, reason: "Empty Gemini response" }

    return JSON.parse(text)
  } catch (err) {
    return { post: false, reason: `Gemini exception: ${err}` }
  } finally {
    clearTimeout(timer)
  }
}
