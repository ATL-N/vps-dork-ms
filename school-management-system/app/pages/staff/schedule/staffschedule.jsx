'use client'
import React from "react";
import Teacherschedulepage from "../../../components/staffcomponent/teacherscheduledate";

const Teacherscheculepage = ({showStaffDet=true, staffData}) => {
 

  return (
    <>
      <Teacherschedulepage
        teacherData={staffData}
        initialSchedule={staffData?.schedule}
        showStaffDet={showStaffDet}
      />
    </>
  );
};


export default Teacherscheculepage;
