import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import DashboardTitle from "~/components/dashboardTitle";
import { ProfileCard } from "~/components/profilecard";
import WorkplaceCard from "~/components/workplaceCard";
import { requireUser } from "~/services/auth.server";
import { GetUserWorkplaces } from "~/services/hasura.server";
import { type TWorkplace } from "~/types";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  const workplaces = await GetUserWorkplaces({
    token: user?.token!,
  });

  return json({ workplaces, user });
};

const Dashboard = () => {
  const { workplaces, user } = useLoaderData<typeof loader>();

  return (
    <div>
      <DashboardTitle title="Dashboard" />
      <ProfileCard name={user?.name} image={user?.image} email={user?.email} />
      <div className="mt-2">
        <div className="flex py-4 space-x-1 text-xl">
          <h2 className="font-semibold text-red-500">Your </h2>
          <h2>workplaces</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 mb-4 lg:gap-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {workplaces ? (
            workplaces.map((workplace: TWorkplace) => (
              <WorkplaceCard
                remove={false}
                workplace={workplace}
                key={workplace.id}
              />
            ))
          ) : (
            <p>U dont have any workplaces...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
