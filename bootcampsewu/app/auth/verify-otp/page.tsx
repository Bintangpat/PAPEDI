"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const formSchema = z.object({
  otp: z.string().length(6, "Kode OTP harus 6 digit"),
});

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const email = searchParams.get("email");
  const type = searchParams.get("type"); // 'REGISTER' | 'LOGIN'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (!email || !type) {
      toast.error("Invalid Request");
      router.push("/auth/login");
    }
  }, [email, type, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data } = await api.post("/auth/verify-otp", {
        email,
        otp: values.otp,
        type,
      });

      if (type === "REGISTER") {
        toast.success("Verifikasi berhasil! Silakan login.");
        router.push("/auth/login");
      } else {
        // LOGIN
        login(data.data.user);
        toast.success("Login berhasil!");
        // Redirect handled by AuthContext or separate logic? usually login function might not redirect
        router.push(`/${data.data.user.role}/dashboard`);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Kode OTP salah atau kadaluarsa",
      );
    }
  }

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-otp", { email, type });
      toast.success("Kode OTP baru telah dikirim.");
    } catch (error: any) {
      toast.error("Gagal mengirim ulang OTP.");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          Verifikasi OTP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-center text-sm text-gray-600">
          Masukkan 6 digit kode yang dikirim ke{" "}
          <span className="font-semibold">{email}</span>
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode OTP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      {...field}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Verifying..." : "Verifikasi"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Tidak menerima kode?{" "}
          <button
            onClick={handleResend}
            className="text-blue-600 hover:underline"
          >
            Kirim Ulang
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
