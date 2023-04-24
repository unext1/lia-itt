export interface WPschema {
  id: number;
  date: number;
  title: {
    rendered: string;
  };
  source_url: string;
  mime_type: string;
  description: {
    rendered: string;
  };
  ai_generated_text: string;
  ai_generated_date: string;
  modified: string;
}

export type Navigation = {
  name: string;
  href: string;
  svg: JSX.Element;
}[];
