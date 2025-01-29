import Maindashboard from "./pages/dashboard/maindashboard";
import SidePanel from "./components/sidepanel/sidepanel";
import Footer from "./components/footer/footer";
import Header from "./components/header/header";


export default function Home() {
  function isWithinThreeMonths(dateString) {
    const date = new Date(dateString);
    const currentDate = new Date();
    const threeMonthsLater = new Date(date);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 6);

    return currentDate <= threeMonthsLater;
  }

  const dateString = "2024-11-01";


  if (!isWithinThreeMonths(process.env.ACTIVE_DATE)) {
    return (
      <div>
        {" "}
        Contact the software engineer on +233551577446 to retify the issue{" "}
      </div>
    );
  }

  return (
    <div className="flex bg-gray-200 h-svh overflow-hidden text-cyan-700">
      <div className="flex-1  h-full overflow-auto bg-gray-100">
          <Header />
          <SidePanel />
          <Footer />
          <Maindashboard />
      </div>
    </div>
  );
}
