"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createSuperAdminAction,
} from "../actions/create-super-admin.action";


export default function CreateSuperAdminForm() {

  const router = useRouter();

  const [loading,setLoading] =
    useState(false);

  const [message,setMessage] =
    useState("");


  async function submit(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    setLoading(true);
    setMessage("");


    const form =
      new FormData(e.currentTarget);


    const result =
      await createSuperAdminAction({
        firstName:
          form.get("firstName"),

        lastName:
          form.get("lastName"),

        email:
          form.get("email"),

        password:
          form.get("password"),
      });


    setLoading(false);


    if(result.success){

      setMessage(result.message);

      router.push("/platform-admins");

    }else{

      setMessage(result.message);

    }

  }


  return (

    <form
      onSubmit={submit}
      className="max-w-xl space-y-4 rounded-lg border p-6"
    >

      <input
        name="firstName"
        placeholder="First name"
        required
        className="w-full rounded border px-3 py-2"
      />


      <input
        name="lastName"
        placeholder="Last name"
        className="w-full rounded border px-3 py-2"
      />


      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full rounded border px-3 py-2"
      />


      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="w-full rounded border px-3 py-2"
      />


      <button
        disabled={loading}
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
      >
        {loading
          ? "Creating..."
          : "Create Super Admin"}
      </button>


      {message && (
        <p className="text-sm">
          {message}
        </p>
      )}

    </form>

  );
}
