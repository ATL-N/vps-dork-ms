"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaBookOpen,
  FaCalendarAlt,
  FaCog,
  FaChevronRight,
  FaUserCheck,
  FaCalendarCheck,
  FaUniversity,
  FaMoneyBillWave,
  FaEnvelope,
  FaUsers,
  FaClock,
  FaBell,
  FaBoxes,
  FaMoneyCheckAlt,
  FaBars,
  FaFileArchive,
} from "react-icons/fa";
import { FaBowlFood, FaMessage } from "react-icons/fa6";

const SidePanel = () => {
  const { data: session, status } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [lastExpandedItem, setLastExpandedItem] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
    const authorizedRoles = ["admin", "head teacher"];

  const pathname = usePathname();

  // Check if we're on mobile on component mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical tablet/mobile breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Your existing menuItems setup remains the same...
  let menuItems = [
    {
      icon: <FaTachometerAlt />,
      text: "Dashboard",
      href: "/",
    },
  ];

  // Your menuItems array remains the same

  if (
    session?.user.role == "admin" ||
    session?.user?.roles?.some((role) =>
      authorizedRoles.includes(role)
    )
  ) {
    menuItems = [
      {
        icon: <FaTachometerAlt />,
        text: "Dashboard",
        href: "/",
      },
      {
        icon: <FaCalendarCheck />,
        text: "Attendance",
        href: "/pages/attendance",
      },
      {
        icon: <FaBook />,
        text: "Classes",
        href: "/pages/classes",
      },
      {
        icon: <FaCalendarAlt />,
        text: "Events",
        href: "/pages/events",
      },
      {
        icon: <FaBowlFood />,
        text: "Feeding & Transport ",
        href: "/pages/feedingNTnT",
      },
      {
        icon: <FaMoneyCheckAlt />,
        text: "Fees",
        href: "/pages/fees",
      },

      {
        icon: <FaMoneyBillWave />,
        text: "Finance",
        href: "/pages/financial",
      },
      {
        icon: <FaBookOpen />,
        text: "Exams and Remarks",
        href: "/pages/grading",
      },
      {
        icon: <FaBoxes />,
        text: "Inventory",
        href: "/pages/inventory",
        subItems: [
          { text: "Items Management", href: "/pages/inventory/items" },
          { text: "Stock Management", href: "/pages/inventory/stock" },
          { text: "Supply Management", href: "/pages/inventory/supply" },
        ],
      },
      {
        icon: <FaMessage />,
        text: "Messaging(SMS)",
        href: "/pages/messaging",
      },
      {
        icon: <FaBell />,
        text: "Notifications",
        href: "/pages/notification",
      },
      {
        icon: <FaCalendarAlt />,
        text: "Semester",
        href: "/pages/semester",
      },
      {
        icon: <FaCog />,
        text: "Settings",
        href: "/pages/settings/settingshub",
      },
      {
        icon: <FaBook />,
        text: "Subjects",
        href: "/pages/subjects",
      },
      {
        icon: <FaUserGraduate />,
        text: "Students",
        href: "/pages/students",
      },

      {
        icon: <FaChalkboardTeacher />,
        text: "Staff",
        href: "/pages/staff",
      },
      {
        icon: <FaChalkboardTeacher />,
        text: "Parents",
        href: "/pages/parents",
      },

      // {
      //   icon: <FaFileArchive/>,
      //   text: "Report",
      //   href: "/pages/reports",
      // },

      {
        icon: <FaClock />,
        text: "Timetable",
        href: "/pages/timetable",
      },
      {
        icon: <FaUsers />,
        text: "User Management",
        href: "/pages/users",
      },
    ].sort((a, b) => a.text.localeCompare(b.text));
  } else if (session?.user?.role === "student") {
    menuItems = [
      {
        icon: <FaTachometerAlt />,
        text: "Dashboard",
        href: "/",
      },
      {
        icon: <FaBook />,
        text: "Classes",
        href: "/pages/classes",
      },
      {
        icon: <FaCalendarAlt />,
        text: "Events",
        href: "/pages/events",
      },
      {
        icon: <FaBell />,
        text: "Notifications",
        href: "/pages/notification",
      },
      {
        icon: <FaCog />,
        text: "Settings",
        href: "/pages/settings/settingshub",
      },
      {
        icon: <FaBook />,
        text: "Subjects",
        href: "/pages/subjects",
      },
      {
        icon: <FaClock />,
        text: "Timetable",
        href: "/pages/timetable",
      },
      {
        icon: <FaUsers />,
        text: "User Management",
        href: "/pages/users",
      },
    ].sort((a, b) => a.text.localeCompare(b.text));
  } else if (session?.user?.role === "teaching staff") {
    menuItems = [
      {
        icon: <FaTachometerAlt />,
        text: "Dashboard",
        href: "/",
      },
      {
        icon: <FaCalendarCheck />,
        text: "Attendance",
        href: "/pages/attendance",
      },
      {
        icon: <FaBook />,
        text: "Classes",
        href: "/pages/classes",
      },
      {
        icon: <FaCalendarAlt />,
        text: "Events",
        href: "/pages/events",
      },
      {
        icon: <FaBookOpen />,
        text: "Exams and Remarks",
        href: "/pages/grading",
      },
      {
        icon: <FaBowlFood />,
        text: "Feeding & Transport ",
        href: "/pages/feedingNTnT",
      },
      {
        icon: <FaBell />,
        text: "Notifications",
        href: "/pages/notification",
      },
      {
        icon: <FaCalendarAlt />,
        text: "Semester",
        href: "/pages/semester",
      },
      {
        icon: <FaCog />,
        text: "Settings",
        href: "/pages/settings/settingshub",
      },
      {
        icon: <FaBook />,
        text: "Subjects",
        href: "/pages/subjects",
      },
      {
        icon: <FaUserGraduate />,
        text: "Students",
        href: "/pages/students",
      },
      {
        icon: <FaChalkboardTeacher />,
        text: "Staff",
        href: "/pages/staff",
      },

      {
        icon: <FaClock />,
        text: "Timetable",
        href: "/pages/timetable",
      },
      {
        icon: <FaUsers />,
        text: "User Management",
        href: "/pages/users",
      },
    ].sort((a, b) => a.text.localeCompare(b.text));
  }
  useEffect(() => {
    if (isExpanded && lastExpandedItem !== null && !isMobile) {
      setExpandedItem(lastExpandedItem);
    } else if (!isExpanded && !isMobile) {
      setExpandedItem(null);
    }
  }, [isExpanded, lastExpandedItem, isMobile]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsExpanded(true);
  };

  const toggleSubItems = (index) => {
    if (expandedItem === index) {
      setExpandedItem(null);
      setLastExpandedItem(null);
    } else {
      setExpandedItem(index);
      setLastExpandedItem(index);
    }
  };

  const isActive = (href) => {
    return pathname === href;
  };

  // Handle clicking outside the sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar");
      const hamburger = document.getElementById("hamburger-button");

      if (
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        !hamburger.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.addEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Hamburger Menu Button - Always visible on mobile */}
      <motion.button
        id="hamburger-button"
        onClick={toggleMobileMenu}
        className="fixed top-0 left-0 z-40 text-cyan-700 text-2xl md:hidden bg-white p-5"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaBars />
      </motion.button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <AnimatePresence>
        {(!isMobile || (isMobile && isMobileMenuOpen)) && (
          <motion.nav
            id="sidebar"
            initial={{ x: isMobile ? -320 : -80 }}
            animate={{
              x: 0,
              width: isMobile ? 256 : isExpanded ? 256 : 64,
            }}
            exit={{
              x: isMobile ? -320 : -80,
              transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1], // Custom easing function for smooth exit
              },
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 1,
              duration: 0.4,
            }}
            className={`fixed left-0 top-0 h-full bg-gray-900 text-gray-100 shadow-lg z-50 overflow-hidden`}
            onMouseEnter={() => !isMobile && setIsExpanded(true)}
            onMouseLeave={() => !isMobile && setIsExpanded(false)}
          >
            <div className="p-4 h-full overflow-y-auto scrollbar-hide">
              <div className="flex items-center mb-6">
                {!isMobile && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isExpanded ? 0 : 1 }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                    }}
                    className="text-2xl cursor-pointer"
                  >
                    <FaBars />
                  </motion.div>
                )}
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isExpanded || isMobile ? 1 : 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="text-xl font-bold ml-2 overflow-hidden whitespace-nowrap"
                >
                  School System
                </motion.h2>
              </div>

              {/* Menu Items */}
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      delay: index * 0.03,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    {item.subItems && item.subItems.length > 0 ? (
                      <div>
                        <motion.button
                          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors duration-200 ${
                            isActive(item.href)
                              ? "bg-blue-600 text-white"
                              : "hover:bg-gray-800"
                          }`}
                          onClick={() => toggleSubItems(index)}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center">
                            <span className="text-xl mr-3">{item.icon}</span>
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: isExpanded || isMobile ? 1 : 0,
                              }}
                              transition={{
                                duration: 0.3,
                                ease: "easeInOut",
                              }}
                              className="overflow-hidden whitespace-nowrap"
                            >
                              {item.text}
                            </motion.span>
                          </div>
                          <motion.span
                            animate={{
                              rotate: expandedItem === index ? 90 : 0,
                            }}
                            transition={{
                              duration: 0.3,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                          >
                            <FaChevronRight />
                          </motion.span>
                        </motion.button>
                        <AnimatePresence>
                          {(isExpanded || isMobile) &&
                            expandedItem === index && (
                              <motion.ul
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{
                                  duration: 0.3,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                                className="ml-6 mt-2 space-y-1 overflow-hidden"
                              >
                                {item.subItems.map((subItem, subIndex) => (
                                  <motion.li
                                    key={subIndex}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{
                                      delay: subIndex * 0.05,
                                      duration: 0.3,
                                    }}
                                  >
                                    <Link
                                      href={subItem.href}
                                      className={`block p-2 rounded-lg transition-colors duration-200 ${
                                        isActive(subItem.href)
                                          ? "bg-blue-600 text-white pointer-events-none"
                                          : "hover:bg-gray-800"
                                      }`}
                                      onClick={() =>
                                        isMobile && setIsMobileMenuOpen(false)
                                      }
                                    >
                                      {subItem.text}
                                    </Link>
                                  </motion.li>
                                ))}
                              </motion.ul>
                            )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`block ${
                          isActive(item.href) ? "pointer-events-none" : ""
                        }`}
                        onClick={() => isMobile && setIsMobileMenuOpen(false)}
                      >
                        <motion.div
                          className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                            isActive(item.href)
                              ? "bg-blue-600 text-white"
                              : "hover:bg-gray-800"
                          }`}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-xl mr-3">{item.icon}</span>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: isExpanded || isMobile ? 1 : 0,
                            }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                            className="overflow-hidden whitespace-nowrap"
                          >
                            {item.text}
                          </motion.span>
                        </motion.div>
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default SidePanel;
