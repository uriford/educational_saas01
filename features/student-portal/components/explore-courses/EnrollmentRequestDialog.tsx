"use client";

import { PaymentMethod } from "@prisma/client";

import { useState } from "react";
import { Loader2, Send, Tag, CheckCircle2, XCircle } from "lucide-react";
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
import { validateEnrollmentCouponAction } from "../../actions/validate-enrollment-coupon.action";


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
  const [couponLoading, setCouponLoading] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponValid, setCouponValid] = useState(false);

  const [pricing, setPricing] = useState<{
    couponId: string;
    couponCode: string;
    couponType: PaymentMethod extends never ? never : "PERCENTAGE" | "FIXED";
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);

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


  async function validateCoupon() {
    const code = couponCode.trim();

    if (!code) {
      setCouponMessage("Enter a coupon code.");
      setCouponValid(false);
      setPricing(null);
      return;
    }

    setCouponLoading(true);
    setCouponMessage("");

    try {
      const result =
        await validateEnrollmentCouponAction(
          courseId,
          code,
        );

      if (!result.success) {
        setCouponValid(false);
        setPricing(null);
        setCouponMessage(
          result.message ?? "Invalid coupon code.",
        );
        return;
      }

      if (!result.pricing) {
        setCouponValid(false);
        setPricing(null);
        setCouponMessage(
          "Coupon pricing could not be calculated.",
        );
        return;
      }

      const appliedPricing = result.pricing;

      setCouponValid(true);
      setPricing(appliedPricing);
      setCouponMessage("Coupon applied successfully.");

      setForm((prev) => ({
        ...prev,
        requestedAmount: String(
          appliedPricing.finalAmount,
        ),
      }));
    } catch (error) {
      console.error(error);
      setCouponValid(false);
      setPricing(null);
      setCouponMessage(
        "Unable to validate coupon.",
      );
    } finally {
      setCouponLoading(false);
    }
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
            couponCode: couponValid
              ? couponCode
              : "",
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">

      <div className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl bg-background p-6 shadow-xl space-y-5 sm:my-8 sm:max-h-[calc(100vh-4rem)]">

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

          {pricing ? (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Original fee</span>
                <span>{formatPrice(pricing.originalAmount)}</span>
              </div>

              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(pricing.discountAmount)}</span>
              </div>

              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Final fee</span>
                <span>{formatPrice(pricing.finalAmount)}</span>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-2xl font-bold">
              {formatPrice(courseFee)}
            </p>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            {pricing
              ? `Coupon ${pricing.couponCode} applied.`
              : "This is the total fee for this course."}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Coupon Code</Label>

          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponValid(false);
                setPricing(null);
                setCouponMessage("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void validateCoupon();
                }
              }}
            />

            <Button
              type="button"
              variant="outline"
              disabled={couponLoading}
              onClick={() => void validateCoupon()}
            >
              {couponLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Tag className="size-4" />
              )}
              <span className="ml-2">Apply</span>
            </Button>
          </div>

          {couponMessage && (
            <p
              className={`flex items-center gap-1 text-xs ${
                couponValid
                  ? "text-green-600"
                  : "text-destructive"
              }`}
            >
              {couponValid ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <XCircle className="size-3.5" />
              )}
              {couponMessage}
            </p>
          )}
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
