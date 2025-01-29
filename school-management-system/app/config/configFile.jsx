import { toast } from "react-toastify";

// const [loading, setLoading] = useState(false);

export const fetchData = async (
  url,
  datatype = "",
  toastNotification = true
) => {
  let toastId4;
  if (toastNotification) {
    toastId4 = toast.loading(`Processing...`);
  }
  // setLoading(true);
  let data;
  try {
    // let url = "/api/roles/all";

    const response = await fetch(url);
    if (!response.ok) {
      if (toastNotification) {
        toast.update(toastId4, {
          render:
            response.error ||
            `Error: fetching data or no data found`,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }

      return data;
    }

    data = await response.json();

    if (data.length === 0) {
      if (toastNotification) {
        toast.update(toastId4, {
          render: "No data found ",
          type: "info",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } else {
      if (toastNotification) {
        toast.update(toastId4, {
          render: `Data fetched successfully`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      }
    }
    return data;
  } catch (err) {
    setError(err.message);
    if (toastNotification) {
      toast.update(toastId4, {
        render: `Error: ${err.message}`,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }

    return data;
  } finally {
    // setLoading(false);
  }
};

//  if(loading){
//   return (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-700"></div>
//         </div>
//       )
//     }

function extractStaffData(staffData) {
  return staffData.map((staff) => ({
    name: `${staff.first_name.trim()} ${staff.middle_name.trim()} ${staff.last_name.trim()}`,
    department: staff.department,
    role: staff.role,
    staff_id: staff.staff_id,
  }));
}

// import { toast } from "react-toastify";

export const submitData = async ({
  apiUrl,
  method = "POST",
  data,
  successMessage = "Operation successful",
  errorMessage = "Operation failed",
  onSuccess = () => {},
  onError = () => {},
}) => {
  const toastId4 = toast.loading("Processing...");

  try {
    const response = await fetch(apiUrl, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.update(toastId4, {
      render: result.error || errorMessage,
      type: "error",
      isLoading: false,
      autoClose: 2000,
    });
      return
    }

    toast.update(toastId4, {
      render: result.message || successMessage,
      type: "success",
      isLoading: false,
      autoClose: 2000,
    });

    // Call onSuccess, which will handle resetting the form
    // onSuccess(result);
    return
  } catch (error) {
    console.error("Error:", error);
    toast.update(toastId4, {
      render: error.message || errorMessage,
      type: "error",
      isLoading: false,
      autoClose: 2000,
    });
    onError(error);
  }
};

export const getTodayString = () => {
  return new Date().toISOString().split("T")[0];
};

export const get20YearsAgoString = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 20);
  return date.toISOString().split("T")[0];
};

