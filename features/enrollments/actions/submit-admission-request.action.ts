"use server";

import { db } from "@/lib/db";
import { OrganizationRepository } from "@/features/organizations/repository/organization.repository";
import {
  admissionSchema,
} from "../schemas/admission.schema";

import { admissionRateLimiter } from "@/lib/security/rate-limiter";

export async function submitAdmissionRequestAction(
  organizationSlug: string,
  payload: unknown,
) {
  try {

    const parsed =
      admissionSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid admission data.",
        errors: parsed.error.flatten(),
      };
    }

    const data = parsed.data;


    if (data.website) {
      console.warn(
        "Blocked bot admission submission",
      );

      return {
        success: false,
        message:
          "Invalid admission submission.",
      };
    }


    const rateLimit =
      await admissionRateLimiter(
        data.email,
        data.courseId,
      );

    if (!rateLimit.success) {
      return {
        success: false,
        message:
          "Too many admission attempts. Please try again later.",
      };
    }



    const organization =
      await OrganizationRepository.findPublicBySlug(
        organizationSlug,
      );


    if (!organization) {
      return {
        success: false,
        message: "Organization not found.",
      };
    }


    const course =
      await db.course.findFirst({
        where: {
          id: data.courseId,
          organizationId: organization.id,
          status: "ACTIVE",
          deletedAt: null,
        },
        select: {
          id: true,
          branchId: true,
        },
      });


    if (!course) {
      return {
        success: false,
        message: "Selected course is unavailable.",
      };
    }


    const enrolledStudent =
      await db.student.findFirst({
        where: {
          organizationId: organization.id,
          email: data.email,
          deletedAt: null,
          courseEnrollments: {
            some: {
              courseId: course.id,
              status: "ACTIVE",
            },
          },
        },
        select: {
          id: true,
        },
      });


    if (enrolledStudent) {
      return {
        success: false,
        message:
          "You are already enrolled in this course.",
      };
    }


    const existing =
      await db.enrollmentRequest.findFirst({
        where: {
          organizationId: organization.id,
          email: data.email,
          courseId: course.id,
          status: "PENDING",
        },
      });


    if (existing) {
      return {
        success: false,
        message:
          "An admission request already exists.",
      };
    }


    await db.enrollmentRequest.create({
      data: {
        organizationId:
          organization.id,

        branchId:
          course.branchId,

        courseId:
          course.id,


        firstName:
          data.firstName,

        lastName:
          data.lastName || null,

        email:
          data.email,

        phone:
          data.phone,


        guardianName:
          data.guardianName,

        guardianPhone:
          data.guardianPhone,

        guardianEmail:
          data.guardianEmail || null,


        gender:
          data.gender,

        dateOfBirth:
          data.dateOfBirth
            ? new Date(data.dateOfBirth)
            : null,

        address:
          data.address || null,


        admissionNote:
          data.admissionNote || null,


        paymentMethod:
          data.paymentMethod,


        requestedAmount:
          data.requestedAmount,


        transactionId:
          data.transactionId || null,

        paymentPhone:
          data.paymentPhone || null,

        paymentDate:
          data.paymentDate
            ? new Date(data.paymentDate)
            : null,

        paymentReference:
          data.paymentReference || null,


        cardHolderName:
          data.cardHolderName || null,

        cardLastFour:
          data.cardLastFour || null,


        paymentNote:
          data.paymentNote || null,


        status:
          "PENDING",
      },
    });


    return {
      success: true,
      message:
        "Admission request submitted successfully.",
    };


  } catch (error) {

    console.error(
      "PUBLIC ADMISSION ERROR:",
      error,
    );


    return {
      success: false,
      message:
        "Failed to submit admission request.",
    };
  }
}
