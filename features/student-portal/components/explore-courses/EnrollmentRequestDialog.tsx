"use client";

import { PaymentMethod } from "@prisma/client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectItem,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { requestEnrollmentAction } from "../../actions/request-enrollment.action";


function formatPrice(price: unknown) {
  if (price === null || price === undefined) {
    return "Contact for price";
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(numericPrice);
}


type Props = {
  courseId: string;
  courseFee: unknown;
  open: boolean;
  onClose: () => void;
};


export default function EnrollmentRequestDialog({
  courseId,
  courseFee,
  open,
  onClose,
}: Props) {

  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(PaymentMethod.MOBILE_BANKING);


  const [form, setForm] = useState({
    requestedAmount: "",
    transactionId: "",
    paymentPhone: "",
    paymentDate: "",
    paymentReference: "",
    cardHolderName: "",
    cardLastFour: "",
    paymentNote: "",
  });


  if (!open) return null;


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

    if (!form.requestedAmount) {
      toast.error("Please enter requested amount.");
      return;
    }


    setLoading(true);

    try {

      const result =
        await requestEnrollmentAction(
          courseId,
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

      onClose();


    } catch(error) {

      console.error(error);

      toast.error(
        "Failed to submit enrollment request.",
      );

    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-xl rounded-xl bg-background p-6 shadow-xl space-y-5">

        <div>
          <h2 className="text-xl font-semibold">
            Request Enrollment
          </h2>

          <p className="text-sm text-muted-foreground">
            Provide payment details for admin verification.
          </p>
        </div>


        <div className="rounded-xl border bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground">
            Course Fee
          </p>

          <p className="mt-1 text-2xl font-bold">
            {formatPrice(courseFee)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            This is the total fee for this course.
          </p>
        </div>


        <div className="space-y-2">
          <Label>
            Requested Amount
          </Label>

          <Input
            type="number"
            min="0"
            placeholder="Enter amount you are paying"
            value={form.requestedAmount}
            onChange={(e)=>
              update(
                "requestedAmount",
                e.target.value,
              )
            }
          />

          <p className="text-xs text-muted-foreground">
            You may request enrollment with a partial payment if applicable.
          </p>
        </div>



        <div className="space-y-2">

          <Label>
            Payment Method
          </Label>

          <Select
            value={paymentMethod}
            onValueChange={(value) =>
              setPaymentMethod(value as PaymentMethod)
            }
          >

            <SelectItem value="MOBILE_BANKING">
              bKash / Nagad / Rocket
            </SelectItem>

            <SelectItem value="BANK_TRANSFER">
              Bank Transfer
            </SelectItem>

            <SelectItem value="CARD">
              Debit / Credit Card
            </SelectItem>

            <SelectItem value="OTHER">
              Other
            </SelectItem>

          </Select>

        </div>



        {paymentMethod === PaymentMethod.MOBILE_BANKING && (
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
              placeholder="Sender phone number"
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



        {paymentMethod === PaymentMethod.BANK_TRANSFER && (
          <>

            <Input
              placeholder="Bank reference number"
              value={form.paymentReference}
              onChange={(e)=>
                update(
                  "paymentReference",
                  e.target.value,
                )
              }
            />

          </>
        )}



        {paymentMethod === PaymentMethod.CARD && (
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
              placeholder="Last 4 digits of card"
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



        <Textarea
          placeholder="Additional payment note (optional)"
          value={form.paymentNote}
          onChange={(e)=>
            update(
              "paymentNote",
              e.target.value,
            )
          }
        />



        <div className="flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>


          <Button
            disabled={loading}
            onClick={submit}
          >

            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Submit Request
              </>
            )}

          </Button>

        </div>

      </div>

    </div>
  );
}
