import "server-only";

import { headers } from "next/headers";
import { db } from "@/lib/db";


export async function admissionRateLimiter(
  email?: string,
  courseId?: string,
) {

  const requestHeaders =
    await headers();


  const ip =
    requestHeaders
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim()
    ??
    requestHeaders.get("x-real-ip")
    ??
    "unknown";


  const fingerprint =
    `${ip}:${email ?? "unknown"}:${courseId ?? "unknown"}`;


  const action =
    `ADMISSION:${fingerprint}`;


  const windowStart =
    new Date(
      Date.now() -
      60 * 60 * 1000,
    );


  const existing =
    await db.admissionRateLimit.findUnique({
      where:{
        ipAddress_action:{
          ipAddress:fingerprint,
          action,
        },
      },
    });



  if(!existing){

    await db.admissionRateLimit.create({
      data:{
        ipAddress:fingerprint,
        action,
        attempts:1,
      },
    });


    return {
      success:true,
    };
  }



  if(existing.windowStart < windowStart){

    await db.admissionRateLimit.update({
      where:{
        id:existing.id,
      },
      data:{
        attempts:1,
        windowStart:new Date(),
      },
    });


    return {
      success:true,
    };
  }



  if(existing.attempts >= 3){

    return {
      success:false,
    };
  }



  await db.admissionRateLimit.update({
    where:{
      id:existing.id,
    },
    data:{
      attempts:{
        increment:1,
      },
    },
  });


  return {
    success:true,
  };

}
