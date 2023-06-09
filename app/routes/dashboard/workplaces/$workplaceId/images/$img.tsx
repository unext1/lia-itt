import { json, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ImageComponent } from "~/components/imageform";
import { requireUser } from "~/services/auth.server";
import { GetWorkplaceById } from "~/services/hasura.server";
import { type WPschema } from "~/types";

export async function action({ request, params }: ActionArgs) {
  const { workplaceId } = params;

  const formData = await request.formData();
  const values = Object.fromEntries(formData);

  //FIX WITH ZODIX IF POSSIBLE
  const aiInputs = {
    title: values.title, //check if empty
    alt_text: values.description,
    description: values.description,
  };

  const user = await requireUser(request);

  try {
    const workplace = await GetWorkplaceById({
      token: user?.token!,
      id: workplaceId!,
    });
    await fetch(`${workplace.url}wp-json/wp/v2/media/${values.id}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${workplace.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiInputs),
    });
    return { toastMessage: "Text has been changed !" };
  } catch (error) {
    return json({ toastMessage: "There was an error" });
  }
}

export async function loader({ params, request }: LoaderArgs) {
  const { img, workplaceId } = params;

  const user = await requireUser(request);

  try {
    const workplace = await GetWorkplaceById({
      token: user?.token!,
      id: workplaceId!,
    });

    const imageResponse = await fetch(
      `${workplace.url}wp-json/wp/v2/media/${img}`
    );

    const data: WPschema = await imageResponse.json();
    const aiResponse = await fetch(
      "https://northeurope.api.cognitive.microsoft.com/vision/v3.2/describe?maxCandidates=1&language=en&model-version=latest",
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": process.env
            .AZURE_SUBSCRIPTION_KEY as string,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: data.source_url,
        }),
      }
    );

    const aiData = await aiResponse.json();

    if (!aiData) return json({ tags: "", description: "" });

    const aiTextDescription: string = aiData.description.captions
      ? aiData.description.captions.map((caption: any) => caption.text)
      : "";

    const wordpressDescription =
      data.description.rendered.split("</p>").length > 1
        ? data.description.rendered.split("</p>")[1].slice(4)
        : "";

    return json({
      tags: aiData.description.tags,
      description: aiTextDescription,
      data: { ...data, description: { rendered: wordpressDescription } },
      message: "hi",
    });
  } catch (err: any) {
    if (err.code === "ERR_INVALID_URL")
      return {
        error_message: "Invalid Url",
      };
    return { error_message: "Error" };
  }
}
const ImageForm = () => {
  const toastMessage = useActionData();

  const { data, error_message, tags, description } = useLoaderData<{
    tags: string | string[];
    description: string;
    data: WPschema;
    error_message: string;
  }>();

  const navigation = useNavigation();

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    if (toastMessage) {
      toast.success(toastMessage.toastMessage);
    }
  }, [toastMessage]);

  return (
    <>
      {toastMessage?.toastMessage ? (
        <Toaster position="top-right" reverseOrder={false} />
      ) : null}
      <div className="overflow-hidden ">
        {error_message}
        <div className="grid grid-cols-5 gap-5 mt-10 ">
          <div className="col-span-5 p-10 bg-white md:col-span-3 rounded-xl">
            <div className="mb-5">
              <p className="text-sm tracking-wider text-gray-600">
                AI GENERATOR
              </p>
              <div className="text-lg font-semibold ">
                {data?.title.rendered.replace(/,/g, " ")}
              </div>
            </div>
            <div className="flex items-center justify-center max-h-[50vh]">
              <img
                src={data?.source_url}
                alt={data?.source_url}
                className="max-w-full max-h-[50vh] object-contain"
              />
            </div>
          </div>

          <div className="col-span-5 p-10 bg-white md:col-span-2 rounded-xl">
            <Form method="post">
              <ImageComponent
                tags={tags}
                data={data}
                navigation={navigation}
                description={description}
              />
            </Form>
            {/* {actionData && actionData.errormessage
              ? actionData.errormessage.code
              : null} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageForm;
