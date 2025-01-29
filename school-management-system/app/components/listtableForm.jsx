import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaInfoCircle,
  FaBookOpen,
  FaLink,
} from "react-icons/fa";

const CustomTable = ({
  data,
  headerNames,
  height = "65vh",
  handleDelete,
  handleSearch,
  handleEdit,
  handleDetails,
  handleEvaluation,
  handleOpenLink,
  searchTerm = "",
  displayActions = true,
  displaySearchBar = true,
  displayEditBtn = true,
  displayDetailsBtn = true,
  displayDelBtn = true,
  displayEvaluationBtn = false,
  displayLinkBtn = false,
  searchPlaceholder = "search",
  itemDetails = "class",
  editTitle = "Edit ",
  editIcon = <FaEdit />,
  extendedDetailsIcon = <FaLink />,
  evaluationIcon = <FaBookOpen />,
  detailsIcon = <FaInfoCircle />,
  evalTitle = "Staff Evaluation ",
  linkBtnTitle = `Click to view extended details for `,
  detailsTitle = `Details of  `,
}) => {
  const truncateText = (text) => {
    if (!text) return "";
    const lines = String(text).split("\n");
    let result = "";
    let lineCount = 0;
    for (const line of lines) {
      if (lineCount >= 2) {
        break;
      }
      if (line.length <= 50) {
        result += line + " ";
      } else {
        result += line.substring(0, 50) + "... ";
      }
      lineCount++;
    }

    if (lineCount > 2) {
      return result.trim() + "...";
    }

    return result.trim();
  };

  return (
    <>
      <div className="mb-4 shadow ">
        {displaySearchBar && (
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-cyan-700"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
          </div>
        )}
      </div>
      <div className="tableWrap height-45vh">
        {data?.length > 0 ? (
          <table className={`overflow-y-scroll capitalize table-auto`}>
            <thead className="header-overlay ">
              <tr className=" px-6 py-3 text-xs font-medium text-white text-center uppercase tracking-wider">
                {headerNames.map((header, index) => (
                  <th key={index} title={header} className="bg-cyan-700 p-4">
                    {header}
                  </th>
                ))}
                {displayActions && (
                  <th className="text-left pl-4 bg-cyan-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody
              className={`bg-white divide-y divide-gray-200 text-cyan-800 h-[${height}] overflow-scroll `}
            >
              {data.map((item, index) => {
                return (
                  <>
                    <tr
                      key={index}
                      // title={item}
                      className={`${
                        index % 2 === 0 ? "bg-gray-100" : ""
                      }  hover:bg-cyan-50 text-center`}
                    >
                      {Object.values(item).map((value, colIndex) => {
                        // console.log("value", item);
                        return (
                          <td
                            key={colIndex}
                            title={value}
                            className={`border px-6 py-4 whitespace-nowrap`}
                          >
                            {typeof value === "object" && value !== null ? (
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 relative">
                                  <Image
                                    src={
                                      value.src ||
                                      value.image_details ||
                                      "/default-image.jpg"
                                    }
                                    alt=""
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-full"
                                  />
                                </div>
                              </div>
                            ) : (
                              <span title={value?.toString() || ""}>
                                {truncateText(value?.toString()) || ""}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      {displayActions && (
                        <td className="px-6 py-4 whitespace-nowrap text-lg font-medium flex text-right">
                          {displayEditBtn && (
                            <button
                              onClick={() => handleEdit(item.id)}
                              className="mr-6 text-xl grid text-cyan-900 hover:text-cyan-500 hover:bg-white"
                              title={`${editTitle} ${item.id}`}
                            >
                              {editIcon}
                            </button>
                          )}
                          {displayDetailsBtn && (
                            <button
                              onClick={() => handleDetails(item.id)}
                              className="mr-6 text-xl grid text-cyan-900 hover:text-cyan-500 hover:bg-white"
                              title={`${detailsTitle} ${item.id}`}
                            >
                              {detailsIcon}
                            </button>
                          )}

                          {displayEvaluationBtn && (
                            <button
                              onClick={() => handleEvaluation(item.id)}
                              className="mr-6 text-xl grid text-green-500 hover:text-green-900 hover:bg-white"
                              title={`${evalTitle} ${item.id}`}
                            >
                              {evaluationIcon}
                            </button>
                          )}

                          {displayDelBtn && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-900 hover:text-red-600"
                              title={`Delete ${item.id}`}
                            >
                              <FaTrash />
                            </button>
                          )}

                          {displayLinkBtn && (
                            // <Link href={`${displaybtnlink}${item.id}`}>
                            <button
                              onClick={() => handleOpenLink(item.id)}
                              className="mx-4 text-xl grid text-green-500 hover:text-green-900 hover:bg-white"
                              title={`${linkBtnTitle} ${itemDetails}(${item.id})`}
                            >
                              {extendedDetailsIcon}
                            </button>
                            // </Link>
                          )}
                        </td>
                      )}
                    </tr>
                    {/* <tr key="print-row" className="bg-gray-100 text-right"></tr> */}
                  </>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-cyan-700">No data found</div>
        )}
      </div>
    </>
  );
};

export default CustomTable;
