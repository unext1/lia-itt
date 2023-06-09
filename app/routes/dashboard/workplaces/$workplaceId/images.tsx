import { json, type LoaderArgs } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { zx } from "zodix";
import Images from "~/components/images";
import { requireUser } from "~/services/auth.server";
import { GetWorkplaceById } from "~/services/hasura.server";

import { type WPschema } from "~/types";

const TOTAL_IMAGES_PER_PAGE = 20;

export async function loader({ request, params }: LoaderArgs) {
  const user = await requireUser(request);
  const { workplaceId } = params;

  const res = zx.parseQuerySafe(request, {
    page: z.string().optional(),
    search: z.string().optional(),
    ai_generated_text: z.string().optional(),
    after: z
      .string()
      .optional()
      .transform((value) => value && new Date(value).toISOString()),
    before: z
      .string()
      .optional()
      .transform((value) => value && new Date(value).toISOString()),
  });

  let urlParams;

  if (res.success) {
    urlParams = new URLSearchParams(
      Object.entries(res.data).filter(([_, v]) => v)
    ).toString();
  }

  const searchParams = new URL(request.url).searchParams;
  const pageParam = searchParams.get("page");
  const page = pageParam ? Number(pageParam) : 1;

  try {
    const workplace = await GetWorkplaceById({
      token: user?.token!,
      id: workplaceId!,
    });
    const imagesResponse = await fetch(
      `${workplace.url}wp-json/wp/v2/media?media_type=image&per_page=${TOTAL_IMAGES_PER_PAGE}&${urlParams}`
    );
    const totalPages = imagesResponse.headers.get("x-wp-totalpages");
    const data = (await imagesResponse.json()) as WPschema[];

    return json({
      data: data,
      currentPage: page,
      totalPages,
      workplaceId,
    });
  } catch (err: any) {
    if (err.code === "ERR_INVALID_URL")
      return {
        error_message: "Invalid Url",
      };
    return { error_message: "error" };
  }
}

const LayoutImage = () => {
  const { data, error_message, currentPage, totalPages, workplaceId } =
    useLoaderData<{
      data: WPschema[];
      error_message: string;
      currentPage: number;
      totalPages: number;
      workplaceId: string;
    }>();

  const { search, pathname } = useLocation();

  const params = Object.fromEntries(new URLSearchParams(search).entries());

  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollableRef?.current?.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div>
      <Form
        action={`/dashboard/workplaces/${workplaceId}/images`}
        className="space-y-3 "
      >
        <input type="hidden" name="page" value="1" />
        <div className="inline-block mr-3">
          <input
            type="text"
            name="search"
            placeholder="Search"
            className="border border-transparent rounded-md bg-gray-50 hover:bg-white hover:border-gray-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 "
          />
        </div>
        <div className="inline-block mr-3">
          <select
            name="ai_generated_text"
            className="border border-transparent rounded-md bg-gray-50 hover:bg-white hover:border-gray-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 "
          >
            <option value="">All Images</option>
            <option value="1">Edited Images</option>
            <option value="2">Unedited Images</option>
          </select>
        </div>
        <div className="inline-block mr-3">
          <input
            type="date"
            name="after"
            className="border border-transparent rounded-md bg-gray-50 hover:bg-white hover:border-gray-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 "
          />
        </div>
        <div className="inline-block mr-3 ">
          <input
            type="date"
            name="before"
            className="border border-transparent rounded-md bg-gray-50 hover:bg-white hover:border-gray-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 "
          />
        </div>
        <button
          type="submit"
          className="py-1 text-white transition-all transform bg-red-500 border border-transparent rounded-md shadow-md hover:scale-105 px-14 hover:cursor-pointer active:ring-2 active:ring-red-200 active:border-red-400"
        >
          Filter
        </button>
      </Form>
      <div className="lg:block xl:flex">
        <div>
          <Images
            ref={scrollableRef}
            data={data}
            error_message={error_message}
            navigation={search}
            workplaceId={workplaceId!}
          />
          <div className="flex flex-row justify-between mt-2">
            <Link
              to={`${pathname}?${new URLSearchParams({
                ...params,
                page: params?.page
                  ? Math.max(Number(params.page) - 1, 1).toString()
                  : "1",
              })}`}
              className={
                Number(currentPage) <= 1
                  ? "invisible text-sm font-semibold"
                  : "block text-sm font-semibold"
              }
            >
              {"<"}
            </Link>
            <div className="my-auto mt-1 text-xs font-semibold">
              {currentPage} {totalPages > 0 ? "/" : ""}{" "}
              {totalPages > 0 ? totalPages : ""}
            </div>
            <Link
              to={`${pathname}?${new URLSearchParams({
                ...params,
                page: params?.page
                  ? Math.min(Number(params.page) + 1).toString()
                  : "2",
              })}`}
              className={
                Number(currentPage) >= totalPages
                  ? "invisible text-sm font-semibold"
                  : "block text-sm font-semibold"
              }
            >
              {">"}
            </Link>
          </div>
        </div>
        <div className="flex-1 xl:pl-10">
          {data.length > 1 ? (
            <Outlet />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <h1>No images found.</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LayoutImage;
