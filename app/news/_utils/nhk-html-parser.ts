import ky from "ky";
import { StructuredParagraph } from "../_types";

export interface ParsedContent {
  title: string;
  text: string;
  structuredText: StructuredParagraph[];
  url: string;
  metadata: {
    description?: string;
    author?: string;
    publishDate?: string;
    keywords?: string[];
  };
}

export class NhkHTMLParser {
  // HTML patterns as constants for better maintainability
  private static readonly PATTERNS = {
    MAIN_CONTENT:
      /<section[^>]*class="[^"]*content--detail-main[^"]*"[^>]*>([\s\S]*)/i,
    CONTENT_BODY:
      /<section[^>]*class="[^"]*content-body[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
    UNWANTED_ELEMENTS:
      /<(?:script|style|nav|header|footer|aside)[^>]*>[\s\S]*?<\/(?:script|style|nav|header|footer|aside)>/gi,
    BLOCK_ELEMENTS: /<\/?(?:p|div|section|article|h[1-6])[^>]*>/gi,
    BR_TAGS: /<br[^>]*\/?>/gi,
    LIST_ELEMENTS: /<\/?(?:ul|ol|li)[^>]*>/gi,
    HTML_TAGS: /<[^>]+>/g,
    TITLE: /<title[^>]*>([^<]+)<\/title>/i,
    H1: /<h1[^>]*>([^<]+)<\/h1>/i,
    OG_TITLE: /<meta\s+property="og:title"\s+content="([^"]+)"/i,
    HEADING: /<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/i,
    LIST_ITEMS: /<li[^>]*>(.*?)<\/li>/gi,
    PARAGRAPH_TAGS: /<(?:p|div)[^>]*>(.*?)<\/(?:p|div)>/gi,
    DOUBLE_BR: /<br\s*\/?>\s*<br\s*\/?>/gi,
    METADATA: {
      DESCRIPTION:
        /<meta\s+(?:name="description"|property="og:description")\s+content="([^"]+)"/i,
      AUTHOR: /<meta\s+name="author"\s+content="([^"]+)"/i,
      DATE: /<meta\s+(?:name="publish-date"|property="article:published_time")\s+content="([^"]+)"/i,
      KEYWORDS: /<meta\s+name="keywords"\s+content="([^"]+)"/i,
    },
  };

  private static cleanText(text: string): string {
    return text
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s+/g, "\n")
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  private static decodeHtmlEntities(text: string): string {
    return text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  private static cleanHtml(html: string): string {
    return html.replace(this.PATTERNS.UNWANTED_ELEMENTS, "");
  }

  private static extractMainContent(html: string): string {
    const mainMatch = html.match(this.PATTERNS.MAIN_CONTENT);
    if (!mainMatch) return html;

    const contentBodyMatches = mainMatch[1].match(this.PATTERNS.CONTENT_BODY);
    return contentBodyMatches
      ? contentBodyMatches
          .map((match) => match.replace(this.PATTERNS.CONTENT_BODY, "$1"))
          .join("\n\n")
      : mainMatch[1];
  }

  private static extractMetadata(html: string): ParsedContent["metadata"] {
    const metadata: ParsedContent["metadata"] = {};

    const descriptionMatch = html.match(this.PATTERNS.METADATA.DESCRIPTION);
    if (descriptionMatch) {
      metadata.description = descriptionMatch[1];
    }

    const authorMatch = html.match(this.PATTERNS.METADATA.AUTHOR);
    if (authorMatch) {
      metadata.author = authorMatch[1];
    }

    const dateMatch = html.match(this.PATTERNS.METADATA.DATE);
    if (dateMatch) {
      metadata.publishDate = dateMatch[1];
    }

    const keywordsMatch = html.match(this.PATTERNS.METADATA.KEYWORDS);
    if (keywordsMatch) {
      metadata.keywords = keywordsMatch[1].split(",").map((k) => k.trim());
    }

    return metadata;
  }

  private static extractTextContent(html: string): string {
    let text = this.extractMainContent(html);
    text = this.cleanHtml(text);

    // Convert block elements to line breaks
    text = text.replace(this.PATTERNS.BLOCK_ELEMENTS, "\n\n");
    text = text.replace(this.PATTERNS.BR_TAGS, "\n\n");
    text = text.replace(this.PATTERNS.LIST_ELEMENTS, "\n");

    // Remove remaining HTML tags and decode entities
    text = text.replace(this.PATTERNS.HTML_TAGS, " ");
    text = this.decodeHtmlEntities(text);

    return this.cleanText(text);
  }

  private static extractStructuredContent(html: string): StructuredParagraph[] {
    let content = this.extractMainContent(html);
    content = this.cleanHtml(content);
    return this.parseContentToParagraphs(content);
  }

  private static parseContentToParagraphs(
    content: string
  ): StructuredParagraph[] {
    const paragraphs: StructuredParagraph[] = [];
    let paragraphId = 0;

    // Split content into blocks based on double line breaks or major structural elements
    const blocks = content.split(
      /\n\s*\n|\s*<\/(?:section|article|div)>\s*<(?:section|article|div)[^>]*>\s*/i
    );

    for (const block of blocks) {
      if (!block.trim()) continue;

      const headingMatch = block.match(this.PATTERNS.HEADING);
      if (headingMatch) {
        const headingText = this.cleanText(
          headingMatch[2].replace(this.PATTERNS.HTML_TAGS, " ")
        );
        if (headingText.trim()) {
          paragraphs.push({
            id: paragraphId++,
            text: headingText,
            type: "heading",
            preview: headingText.substring(0, 50),
          });
        }

        const remainingContent = block.replace(this.PATTERNS.HEADING, "");
        if (remainingContent.trim()) {
          const subParagraphs = this.extractParagraphsFromContent(
            remainingContent,
            paragraphId
          );
          paragraphs.push(...subParagraphs.paragraphs);
          paragraphId = subParagraphs.nextId;
        }
      } else {
        const listMatches = block.match(this.PATTERNS.LIST_ITEMS);
        if (listMatches && listMatches.length > 0) {
          const listContent = listMatches
            .map((match) => {
              const itemText = this.cleanText(
                match
                  .replace(/<li[^>]*>|<\/li>/gi, "")
                  .replace(this.PATTERNS.HTML_TAGS, " ")
              );
              return `• ${itemText.trim()}`;
            })
            .filter((item) => item.length > 2)
            .join("\n");

          if (listContent.trim()) {
            paragraphs.push({
              id: paragraphId++,
              text: listContent,
              type: "list-item",
              preview: listContent.substring(0, 50),
            });
          }
        } else {
          const result = this.extractParagraphsFromContent(block, paragraphId);
          paragraphs.push(...result.paragraphs);
          paragraphId = result.nextId;
        }
      }
    }

    return paragraphs;
  }

  private static extractParagraphsFromContent(
    content: string,
    startId: number
  ): { paragraphs: StructuredParagraph[]; nextId: number } {
    const paragraphs: StructuredParagraph[] = [];
    let paragraphId = startId;

    const brSplitParts = content.split(this.PATTERNS.DOUBLE_BR);

    if (brSplitParts.length > 1) {
      // Multiple parts found - each is a separate paragraph
      for (const part of brSplitParts) {
        if (!part.trim()) continue;

        const paragraphText = this.extractAndMergeParagraphContent(part);
        if (paragraphText.trim() && paragraphText.length > 20) {
          paragraphs.push({
            id: paragraphId++,
            text: paragraphText,
            type: "paragraph",
            preview: paragraphText.substring(0, 50),
          });
        }
      }
    } else {
      // No double <br> found, use the original logic
      const paragraphText = this.extractAndMergeParagraphContent(content);
      if (paragraphText.trim() && paragraphText.length > 20) {
        paragraphs.push({
          id: paragraphId++,
          text: paragraphText,
          type: "paragraph",
          preview: paragraphText.substring(0, 50),
        });
      }
    }

    return { paragraphs, nextId: paragraphId };
  }

  private static extractAndMergeParagraphContent(content: string): string {
    const textParts: string[] = [];

    const paragraphMatches = content.match(this.PATTERNS.PARAGRAPH_TAGS);
    if (paragraphMatches) {
      paragraphMatches.forEach((match) => {
        let text = match.replace(/<(?:p|div)[^>]*>|<\/(?:p|div)>/gi, "");
        text = text.replace(this.PATTERNS.BR_TAGS, "\n");
        text = text.replace(this.PATTERNS.HTML_TAGS, " ");
        text = this.cleanText(text);

        if (text.trim() && text.length > 10) {
          textParts.push(text.trim());
        }
      });
    }

    if (textParts.length === 0) {
      let plainText = content.replace(this.PATTERNS.BR_TAGS, "\n");
      plainText = plainText.replace(this.PATTERNS.HTML_TAGS, " ");
      plainText = this.cleanText(plainText);
      if (plainText.trim() && plainText.length > 10) {
        textParts.push(plainText.trim());
      }
    }

    return textParts.join("\n\n").trim();
  }

  private static extractTitle(html: string): string {
    const titleMatch = html.match(this.PATTERNS.TITLE);
    if (titleMatch) {
      return this.cleanText(titleMatch[1]);
    }

    const h1Match = html.match(this.PATTERNS.H1);
    if (h1Match) {
      return this.cleanText(h1Match[1]);
    }

    const ogTitleMatch = html.match(this.PATTERNS.OG_TITLE);
    if (ogTitleMatch) {
      return this.cleanText(ogTitleMatch[1]);
    }

    return "Untitled";
  }

  static async parseFromUrl(
    url: string,
    timeout: number = 30000
  ): Promise<ParsedContent> {
    try {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      const response = await ky
        .get(url, {
          timeout,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        })
        .text();

      const title = this.extractTitle(response);
      const text = this.extractTextContent(response);
      const structuredText = this.extractStructuredContent(response);
      const metadata = this.extractMetadata(response);

      return {
        title,
        text,
        structuredText,
        url,
        metadata,
      };
    } catch (error) {
      throw new Error(
        `Failed to parse URL: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static parseFromHtml(html: string, url: string = ""): ParsedContent {
    const title = this.extractTitle(html);
    const text = this.extractTextContent(html);
    const structuredText = this.extractStructuredContent(html);
    const metadata = this.extractMetadata(html);

    return {
      title,
      text,
      structuredText,
      url,
      metadata,
    };
  }
}
