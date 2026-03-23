import { getMonths, getMonthData } from "@/actions/months";
import { getUserCategories } from "@/actions/categories";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const months = await getMonths();
  const selectedMonthId = searchParams.month || (months.length > 0 ? months[0].id : null);
  
  const monthData = selectedMonthId ? await getMonthData(selectedMonthId) : null;
  const userCategories = await getUserCategories();

  return (
    <DashboardClient 
      months={months} 
      initialMonthData={monthData} 
      selectedMonthId={selectedMonthId} 
      userCategories={userCategories}
    />
  );
}
