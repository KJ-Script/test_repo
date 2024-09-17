import React, { useState } from "react";
import SignInForm from "./_components/SigninForm";
import { getCsrfToken } from "next-auth/react";
import { headers } from "next/headers";

const RegistrationUserForm = async () => {
  const csrfToken = await getCsrfToken();
  const nonce = headers().get("x-nonce");

  return (
    <div>
      <SignInForm csrfToken={csrfToken} />
    </div>
  );
};

export default RegistrationUserForm;
