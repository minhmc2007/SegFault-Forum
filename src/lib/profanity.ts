const badWords = [
  "fuck", "fucking", "fucked", "fucker", "fucks",
  "shit", "shitting", "shits",
  "ass", "asses", "asshole", "assholes",
  "bitch", "bitches", "bitching",
  "bastard", "bastards",
  "damn", "dammit",
  "crap",
  "dick", "dicks", "dickhead",
  "piss", "pissed", "pissing",
  "slut", "sluts",
  "whore", "whores",
  "cunt", "cunts",
  "cock", "cocks",
  "fag", "faggot",
  "nigga", "nigger",
  "retard", "retarded",
]

const pattern = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi")

export function censor(text: string | null | undefined): string {
  if (!text) return text ?? ""
  return text.replace(pattern, (match) => "*".repeat(match.length))
}
