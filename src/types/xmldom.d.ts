declare module 'xmldom' {
  export class DOMParser {
    parseFromString(xmlsource: string, mimeType?: string): Document;
  }
}