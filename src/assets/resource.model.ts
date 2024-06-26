export interface Resource {
    tags: string[];
    section : string;
    cover: File | null; // URL for the cover image
    title: string;
    author: string;
    isbn: string;
    year: number | null;
    publication: string;
    description: string;
    shelf : string;
    level : string;
  }
  