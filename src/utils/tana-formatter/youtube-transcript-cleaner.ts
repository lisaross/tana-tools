/**
 * YouTube Transcript Cleaner
 * Specialized utility for cleaning manually pasted YouTube transcripts
 * Removes timestamps and formats for Tana paste
 */

/**
 * Clean manually pasted YouTube transcript by removing timestamps
 *
 * Handles various timestamp formats:
 * - ^0:00$ or ^1:23:45$ (at start of line)
 * - Mixed with content on same line
 * - Multiple timestamps per line
 *
 * @param rawTranscript - Raw transcript text with timestamps
 * @returns Cleaned transcript without timestamps
 */
export function cleanYouTubeTranscript(rawTranscript: string): string {
  if (!rawTranscript || rawTranscript.trim().length === 0) {
    return "";
  }

  // Split into lines for processing
  const lines = rawTranscript.split("\n");
  const cleanedLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) continue;

    // Check if entire line is just a timestamp
    if (/^\d+:\d{2}(:\d{2})?$/.test(trimmedLine)) {
      continue; // Skip standalone timestamp lines
    }

    // Remove timestamps from lines that have both timestamp and content
    // Handle patterns like "0:00 content" or "1:23:45 content"
    const cleanedLine = trimmedLine
      // Remove timestamps at start of line with space after
      .replace(/^\d+:\d{2}(:\d{2})?\s+/g, "")
      // Remove timestamps anywhere in the line (with surrounding spaces)
      .replace(/\s+\d+:\d{2}(:\d{2})?\s+/g, " ")
      // Remove timestamps at end of line
      .replace(/\s+\d+:\d{2}(:\d{2})?$/g, "")
      // Clean up any double spaces
      .replace(/\s{2,}/g, " ")
      .trim();

    // Only add non-empty cleaned lines
    if (cleanedLine) {
      cleanedLines.push(cleanedLine);
    }
  }

  // Join lines with single spaces to create continuous text
  return cleanedLines.join(" ");
}

/**
 * Check if content appears to be a YouTube transcript
 *
 * @param content - Content to check
 * @returns True if content contains timestamp patterns typical of YouTube transcripts
 */
export function isManualYouTubeTranscript(content: string): boolean {
  if (!content) return false;

  // Check for multiple timestamp patterns in the content
  const timestampPattern = /\d+:\d{2}(:\d{2})?/g;
  const matches = content.match(timestampPattern);

  // If we find at least 3 timestamps, it's likely a transcript
  return matches ? matches.length >= 3 : false;
}
