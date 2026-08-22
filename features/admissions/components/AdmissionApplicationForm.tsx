"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
} from "@/components/ui/select";

import {
  submitAdmissionRequestAction,
} from "@/features/enrollments/actions/submit-admission-request.action";


type Course = {
  id: string;
  name: string;
};


type Props = {
  organizationSlug: string;
  courses: Course[];
};


export default function AdmissionApplicationForm({
  organizationSlug,
  courses,
}: Props) {

  const [loading, setLoading] =
    useState(false);


  const [paymentMethod, setPaymentMethod] =
    useState("MOBILE_BANKING");


  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",

    gender: "MALE",
    dateOfBirth: "",
    address: "",

    courseId: "",

    requestedAmount: "",

    transactionId: "",
    paymentPhone: "",
    paymentReference: "",

    cardHolderName: "",
    cardLastFour: "",

    paymentNote: "",
    admissionNote: "",
  });


  function update(
    key: keyof typeof form,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }


  async function submit() {

    setLoading(true);

    try {

      const result =
        await submitAdmissionRequestAction(
          organizationSlug,
          {
            ...form,
            paymentMethod,
          },
        );


      if (!result.success) {
        toast.error(result.message);
        return;
      }


      toast.success(result.message);


      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",

        guardianName: "",
        guardianPhone: "",
        guardianEmail: "",

        gender: "MALE",
        dateOfBirth: "",
        address: "",

        courseId: "",

        requestedAmount: "",

        transactionId: "",
        paymentPhone: "",
        paymentReference: "",

        cardHolderName: "",
        cardLastFour: "",

        paymentNote: "",
        admissionNote: "",
      });


    } catch(error) {

      console.error(error);

      toast.error(
        "Failed to submit application.",
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="space-y-8">

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Student Information
        </h2>


        <div className="grid gap-4 md:grid-cols-2">

          <Input
            placeholder="First name"
            value={form.firstName}
            onChange={(e)=>
              update(
                "firstName",
                e.target.value,
              )
            }
          />


          <Input
            placeholder="Last name"
            value={form.lastName}
            onChange={(e)=>
              update(
                "lastName",
                e.target.value,
              )
            }
          />


          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e)=>
              update(
                "email",
                e.target.value,
              )
            }
          />


          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(e)=>
              update(
                "phone",
                e.target.value,
              )
            }
          />

        </div>
      </section>



      <section className="space-y-4">

        <h2 className="text-xl font-semibold">
          Guardian Information
        </h2>


        <div className="grid gap-4 md:grid-cols-2">

          <Input
            placeholder="Guardian name"
            value={form.guardianName}
            onChange={(e)=>
              update(
                "guardianName",
                e.target.value,
              )
            }
          />


          <Input
            placeholder="Guardian phone"
            value={form.guardianPhone}
            onChange={(e)=>
              update(
                "guardianPhone",
                e.target.value,
              )
            }
          />


          <Input
            placeholder="Guardian email"
            value={form.guardianEmail}
            onChange={(e)=>
              update(
                "guardianEmail",
                e.target.value,
              )
            }
          />

        </div>

      </section>



      <section className="space-y-4">

        <h2 className="text-xl font-semibold">
          Course & Academic Information
        </h2>


        <select
          className="h-10 w-full rounded-md border bg-background px-3"
          value={form.courseId}
          onChange={(e)=>
            update(
              "courseId",
              e.target.value,
            )
          }
        >

          <option value="">
            Select Course
          </option>

          {courses.map((course)=>(
            <option
              key={course.id}
              value={course.id}
            >
              {course.name}
            </option>
          ))}

        </select>


        <Textarea
          placeholder="Address"
          value={form.address}
          onChange={(e)=>
            update(
              "address",
              e.target.value,
            )
          }
        />

      </section>



      <section className="space-y-4">

        <h2 className="text-xl font-semibold">
          Payment Information
        </h2>


        <select
          className="h-10 w-full rounded-md border bg-background px-3"
          value={paymentMethod}
          onChange={(e)=>
            setPaymentMethod(
              e.target.value,
            )
          }
        >

          <option value="MOBILE_BANKING">
            bKash / Nagad / Rocket
          </option>

          <option value="BANK_TRANSFER">
            Bank Transfer
          </option>

          <option value="CARD">
            Card
          </option>

          <option value="OTHER">
            Other
          </option>

        </select>


        <Input
          placeholder="Requested amount"
          type="number"
          value={form.requestedAmount}
          onChange={(e)=>
            update(
              "requestedAmount",
              e.target.value,
            )
          }
        />


        {paymentMethod === "MOBILE_BANKING" && (
          <>
            <Input
              placeholder="Transaction ID"
              value={form.transactionId}
              onChange={(e)=>
                update(
                  "transactionId",
                  e.target.value,
                )
              }
            />

            <Input
              placeholder="Payment phone"
              value={form.paymentPhone}
              onChange={(e)=>
                update(
                  "paymentPhone",
                  e.target.value,
                )
              }
            />
          </>
        )}


        {paymentMethod === "BANK_TRANSFER" && (
          <Input
            placeholder="Bank reference"
            value={form.paymentReference}
            onChange={(e)=>
              update(
                "paymentReference",
                e.target.value,
              )
            }
          />
        )}


        {paymentMethod === "CARD" && (
          <>
            <Input
              placeholder="Card holder name"
              value={form.cardHolderName}
              onChange={(e)=>
                update(
                  "cardHolderName",
                  e.target.value,
                )
              }
            />

            <Input
              placeholder="Last 4 digits"
              maxLength={4}
              value={form.cardLastFour}
              onChange={(e)=>
                update(
                  "cardLastFour",
                  e.target.value,
                )
              }
            />
          </>
        )}

      </section>



      <Textarea
        placeholder="Admission note (optional)"
        value={form.admissionNote}
        onChange={(e)=>
          update(
            "admissionNote",
            e.target.value,
          )
        }
      />


      <Button
        disabled={loading}
        onClick={submit}
        className="w-full"
      >
        {loading
          ? "Submitting..."
          : "Submit Admission Application"}
      </Button>


    </div>
  );
}
