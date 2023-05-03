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
  name: string | undefined;
  href: string | undefined;
  svg: JSX.Element | undefined;
}[];

export type TTokenData = {
  token?: string;
  user_email?: string;
  user_nicename?: string;
  user_display_name?: string;
  code?: string;
};
export type TWorkplace = {
  title?: string | null | undefined;
  token: string;
  url: string;
  ownerId: string;
  id: string;
  updatedAt: string;
};
export type TLiaWorkplaceMember = {
  user: TUser;
}[];
export type TUser = {
  email: string;
  name: string;
  id: string;
};
export type TWorkplaceOwner = {
  owner: TUser;
}[];
