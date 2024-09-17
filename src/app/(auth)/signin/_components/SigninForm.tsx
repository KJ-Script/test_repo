"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components/theme/ThemeToggle";
import axios from "axios";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  token: z.string().optional(),
});

const SignInForm = ({ csrfToken }: { csrfToken: string | undefined }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [remainingAttempts, setRemainingAttempts] = useState<any>(null);
  const [remainingTime, setRemainingTime] = useState<any>(null);
  let tempUserInfo: any;
  const [registeringUser, setRegisteringUser] = useState<boolean>(false);
  if (typeof window !== "undefined") {
    tempUserInfo = JSON.parse(localStorage.getItem("tempUserInfo") || "{}");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setRegisteringUser(true);
      const attempts = await axios.post(`/api/user/login-attempt/check`, {
        email: values.email,
      });

      if (attempts.data.remaining_attempts == 0) {
        setRemainingAttempts(attempts.data.remaining_attempts);
        if (attempts.data.timeLeft) {
          setRemainingTime((attempts.data.timeLeft / 60000).toFixed(2));
        }
        throw new Error("");
      }
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      if (!res?.ok) {
        {
          const attempts = await axios.post("/api/user/login-attempt", {
            email: values.email,
          });
          setRemainingAttempts(attempts.data.remaining_attempts);
          if (attempts.data.timeLeft) {
            setRemainingTime((attempts.data.timeLeft / 60000).toFixed(2));
          }
          if (!attempts.data.timeLeft) {
            setRemainingTime(null);
          }
          throw new Error("");
        }
      }
      router.push("/");
    } catch (e: any) {
      return toast({
        title: "Couldn't log you in.",
        description: "Please check the credentials you provided.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setRegisteringUser(false);
    }
  }
  return (
    <div className="h-screen flex items-center justify-center px-2">
      <Card className="w-[450px] mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Sign Into Your Account</CardTitle>
              <CardDescription>Sign in to get access</CardDescription>
            </div>
            <ModeToggle />
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3"
              method="POST"
              autoComplete="off"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="new-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        name="csrfToken"
                        type="hidden"
                        autoComplete="new-password"
                        defaultValue={csrfToken}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {remainingAttempts !== null && (
                <div
                  className={cn("", remainingAttempts == 0 && "text-red-500")}
                >
                  Remaining Attempts: {remainingAttempts}
                </div>
              )}
              {remainingTime && (
                <div>Please try again after {remainingTime} minutes</div>
              )}

              <Button
                disabled={registeringUser}
                type="submit"
                className="w-full"
              >
                {registeringUser && (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInForm;
