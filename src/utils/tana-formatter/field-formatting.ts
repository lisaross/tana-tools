/**
 * Field formatting utilities for consistent Tana output
 * Handles metadata fields, content fields, and formatting helpers
 */
import { TranscriptChunk } from "./transcript-chunking";
import {
  parseMarkdownStructure,
  convertNodesToTana,
  cleanContentForTana,
} from "./content-processing";

/**
 * Format metadata fields for Tana
 *
 * Creates properly formatted metadata fields (URL, Author, Description, etc.)
 * with field name sanitization and conditional inclusion based on preferences.
 *
 * @param options - Object containing metadata and formatting preferences
 * @returns Array of formatted field strings ready for Tana
 */
export function formatMetadataFields(options: {
  url?: string;
  channelUrl?: string;
  description?: string;
  author?: string;
  duration?: string;
  videoId?: string;
  urlField?: string;
  authorField?: string;
  videoIdField?: string;
  includeAuthor?: boolean;
  includeDescription?: boolean;
}): string[] {
  const fields: string[] = [];

  if (options.url) {
    // Sanitize field name by trimming whitespace and removing trailing colons
    const urlFieldName = (options.urlField || "URL").trim().replace(/:+$/, "");
    fields.push(`  - ${urlFieldName}::${options.url}`);
  }

  if (options.channelUrl) {
    fields.push(`  - Channel URL::${options.channelUrl}`);
  }

  if (options.author && options.includeAuthor !== false) {
    // Sanitize field name by trimming whitespace and removing trailing colons
    const authorFieldName = (options.authorField || "Author")
      .trim()
      .replace(/:+$/, "");
    fields.push(`  - ${authorFieldName}::${options.author}`);
  }

  if (options.duration) {
    fields.push(`  - Duration::${options.duration}`);
  }

  if (options.videoId) {
    // Sanitize field name by trimming whitespace and removing trailing colons
    const videoIdFieldName = (options.videoIdField || "videoID")
      .trim()
      .replace(/:+$/, "");
    fields.push(`  - ${videoIdFieldName}::${options.videoId}`);
  }

  if (options.description && options.includeDescription !== false) {
    // Handle multi-line descriptions and decode any escaped characters
    const cleanDescription = options.description
      .replace(/\\n/g, " ") // Replace escaped newlines from JSON
      .replace(/\\r/g, " ") // Replace escaped carriage returns
      .replace(/\\\\/g, "\\") // Unescape backslashes
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\r\n/g, " ") // Replace actual newlines
      .replace(/\r/g, " ")
      .replace(/\n/g, " ")
      .replace(/#\w+\b/g, "") // Remove hashtags like #hashtag
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .replace(/::+/g, ":") // Remove multiple colons that could create fields
      .trim();

    fields.push(`  - Description::${cleanDescription}`);
  }

  return fields;
}

/**
 * Format content under a Content:: field with hierarchical structure
 *
 * Processes and formats content for the main content field, handling
 * different content types and applying appropriate cleaning and formatting.
 * Uses hierarchical processing for content with markdown headings.
 *
 * @param content - Raw content to format
 * @param contentField - Name of the content field (default: "Content")
 * @returns Array of formatted content lines ready for Tana
 */
export function formatContentField(
  content: string,
  contentField?: string,
): string[] {
  if (!content || content.trim().length === 0) {
    return [];
  }

  // Sanitize field name by trimming whitespace and removing trailing colons
  const fieldName = (contentField || "Content").trim().replace(/:+$/, "");
  const lines = [`  - ${fieldName}::`];

  // Check if content has markdown headings - if so, use hierarchical processing
  const hasHeadings = /^#{1,6}\s+.+$/m.test(content);

  if (hasHeadings) {
    // Use hierarchical markdown processing
    const nodes = parseMarkdownStructure(content);
    const tanaLines = convertNodesToTana(nodes, 2); // Start at depth 2 to account for Content:: indentation
    lines.push(...tanaLines);
  } else {
    // Use simple processing for content without headings
    const processedContent = cleanContentForTana(content);
    const contentLines = processedContent
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        // Add proper indentation for content under Content:: field
        if (line.startsWith("- ")) {
          return `    ${line}`;
        }
        return `    - ${line}`;
      });

    lines.push(...contentLines);
  }

  return lines;
}

/**
 * Format transcript chunks as sibling nodes in Tana
 *
 * Converts an array of transcript chunks into individual Tana bullet points,
 * creating a flat list structure where each chunk is a separate node.
 *
 * @param chunks - Array of transcript chunks with content and metadata
 * @returns Array of Tana-formatted bullet points, one per chunk
 */
export function formatTranscriptChunks(chunks: TranscriptChunk[]): string[] {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  return chunks.map((chunk) => `- ${chunk.content}`);
}

/**
 * Format transcript chunks under separate numbered fields
 *
 * Creates either a single Transcript:: field for one chunk or multiple
 * numbered Part N:: fields for multiple chunks, using custom field names
 * when provided by user preferences.
 *
 * @param chunks - Array of transcript chunks to format
 * @param transcriptField - Custom field name for transcript (default: "Transcript")
 * @returns Array of Tana field lines with transcript content
 */
export function formatTranscriptField(
  chunks: TranscriptChunk[],
  transcriptField?: string,
): string[] {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  const lines: string[] = [];

  if (chunks.length === 1) {
    // Single chunk - simple format
    const chunk = chunks[0];
    // Sanitize field name by trimming whitespace and removing trailing colons
    const fieldName = (transcriptField || "Transcript")
      .trim()
      .replace(/:+$/, "");
    lines.push(`  - ${fieldName}:: ${chunk.content}`);
  } else {
    // Multiple chunks - add as separate field entries
    chunks.forEach((chunk, index) => {
      lines.push(`  - Part ${index + 1}:: ${chunk.content}`);
    });
  }

  return lines;
}

/**
 * Format transcript chunks under a single Transcript:: field as nested children
 *
 * Creates a single Transcript field with multiple chunks as nested children,
 * providing better organization for long transcripts in Tana.
 *
 * @param chunks - Array of transcript chunks to format
 * @param transcriptField - Name of the transcript field (default: "Transcript")
 * @returns Array of formatted transcript lines with nested structure
 */
export function formatTranscriptFieldWithSiblings(
  chunks: TranscriptChunk[],
  transcriptField?: string,
): string[] {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Sanitize field name by trimming whitespace and removing trailing colons
  const fieldName = (transcriptField || "Transcript").trim().replace(/:+$/, "");
  const lines: string[] = [`  - ${fieldName}::`];

  // Add each chunk as a child under the Transcript:: field
  chunks.forEach((chunk) => {
    lines.push(`    - ${chunk.content}`);
  });

  return lines;
}

/**
 * Create a title line with optional tags
 */
export function formatTitleLine(title: string, tags?: string[]): string {
  let titleLine = `- ${title}`;

  if (tags && tags.length > 0) {
    const tagString = tags.map((tag) => `#${tag}`).join(" ");
    titleLine += ` ${tagString}`;
  }

  return titleLine;
}
