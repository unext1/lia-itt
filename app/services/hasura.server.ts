import { GraphQLClient } from "graphql-request";
import jwt from "jsonwebtoken";
import { env } from "./env.server";
import { graphql } from "~/_gql";
import { TWorkplace } from "~/types";
const HASURA_URL = `${env.HASURA_GRAPHQL_URL}/v1/graphql`;
export const createHasuraToken = (userId: string | undefined): string => {
  const payload = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": ["public", "user"],
      "x-hasura-default-role": "user",
      "x-hasura-user-id": userId || "00000000-0000-0000-0000-000000000000",
    },
  };

  return jwt.sign(payload, env.HASURA_GRAPHQL_JWT_SECRET.key, {
    algorithm: env.HASURA_GRAPHQL_JWT_SECRET.type,
  });
};

export const hasuraAdminClient = new GraphQLClient(
  `${env.HASURA_GRAPHQL_URL}/v1/graphql`,
  {
    method: "post",
    headers: {
      "x-hasura-admin-secret": env.HASURA_GRAPHQL_ADMIN_SECRET,
    },
  }
);

export const hasuraClient = (token: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  return new GraphQLClient(HASURA_URL, {
    method: "post",
    headers,
  });
};

export const CreateWorkplace = async (
  ownerId: string,
  token: string,
  url: string,
  title: string
) => {
  const workplace: TWorkplace = await GetWorkplaceByURL(url);
  if (workplace) return workplace;
  const newWorkplace = (await hasuraAdminClient.request(CREATEWORKPLACE, {
    ownerId,
    token,
    url,
    title,
  })) as any;
  return newWorkplace.insertLiaWorkplace?.returning?.[0] as TWorkplace;
};
export const RemoveWorkplace = async (id: string) => {
  await hasuraAdminClient.request(REMOVEWORKPLACEMEMBERS, { id });
  return await hasuraAdminClient.request(REMOVEWORKPLACE, { id });
};

export const CREATEWORKPLACE: any = graphql(`
  mutation CreateWorkplace(
    $ownerId: uuid
    $token: String
    $url: String
    $title: String
  ) {
    insertLiaWorkplace(
      objects: { ownerId: $ownerId, token: $token, url: $url, title: $title }
      onConflict: { constraint: workplace_pkey }
    ) {
      affected_rows
      returning {
        id
        title
        url
        ownerId
        updatedAt
      }
    }
  }
`);
export const GETWORKPLACEBYURL = graphql(`
  query GetWorkplaceByURL($url: String) {
    liaWorkplace(where: { url: { _eq: $url } }) {
      title
      token
      url
      ownerId
      id
      updatedAt
    }
  }
`);
export const GETWORKPLACEBYID = graphql(`
  query GetWorkplaceById($id: uuid) {
    liaWorkplace(where: { id: { _eq: $id } }) {
      title
      token
      url
      ownerId
    }
  }
`);
export const GETWORKPLACES: any = graphql(`
  query GetWorkplaces {
    liaWorkplace {
      title
      token
      url
      ownerId
      id
      updatedAt
    }
  }
`);
export const REMOVEWORKPLACE: any = graphql(`
  mutation DeleteWorkplace($id: uuid) {
    deleteLiaWorkplace(where: { id: { _eq: $id } }) {
      affected_rows
      returning {
        id
      }
    }
  }
`);

export const INVITEUSERTOWORKPLACE = graphql(`
  mutation InviteUser($userId: uuid!, $workplaceId: uuid!) {
    insertLiaWorkplaceMember(
      objects: { userId: $userId, workplaceId: $workplaceId }
    ) {
      affected_rows
    }
  }
`);
export const REMOVEWORKPLACEMEMBERS: any = graphql(`
  mutation RemoveWorkplaceMembers($id: uuid) {
    deleteLiaWorkplaceMember(where: { workplaceId: { _eq: $id } }) {
      affected_rows
    }
  }
`);
// CHANGE THIS TO GET IT WITH HASURA CLIENT AND IN PROPS PASS TOKEN
export const GetUserWorkplaces = async ({ token }: { token: string }) => {
  return (
    await hasuraClient(token).request<{ liaWorkplace: TWorkplace[] }>(
      GETWORKPLACES
    )
  ).liaWorkplace;
};
export const GetWorkplaceById = async (id: string) =>
  (await hasuraAdminClient.request(GETWORKPLACEBYID, { id })).liaWorkplace[0];
export const GetWorkplaceByURL = async (url: string) =>
  (await hasuraAdminClient.request(GETWORKPLACEBYURL, { url })).liaWorkplace[0];

export const GETPUBLICUSERS = graphql(`
  query GetPublicUsers {
    liaPublicUser {
      id
      name
      email
    }
  }
`);

export const GetPublicUsers = async () =>
  (await hasuraAdminClient.request(GETPUBLICUSERS)).liaPublicUser;
