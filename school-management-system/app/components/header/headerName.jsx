import React from 'react'
import Link from "next/link";
import Image from "next/image";



const HeaderName = () => {

    // console.log("Your School Name:", process.env.SCHOOL_NAME);
  return (
    <div className="flex items-center space-x-4">
      <Link href={`/`}>
        <div className="w-8 h-8 relative">
          <Image
            src="/favicon.ico"
            alt="School Favicon"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </Link>
      <div className="flex relative text-cyan-900 text-2xl hover:text-cyan-700">
        <Link href={`/`}>
          <b>
            {" "}
            {process.env.NEXT_PUBLIC_SCHOOL_NAME_SHORT ||
              "You School Name"}{" "}
          </b>
        </Link>
      </div>
    </div>
  );
}

export default HeaderName