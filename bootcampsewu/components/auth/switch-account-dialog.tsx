"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface SwitchAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SwitchAccountDialog({
  open,
  onOpenChange,
}: SwitchAccountDialogProps) {
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: setAuthUser } = useAuth(); // AuthContext login fn

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await authService.requestOtpLogin(email);
      setStep("OTP");
      toast.success(`OTP dikirim ke ${email}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengirim OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;

    setLoading(true);
    try {
      const res = await authService.verifyOtp(email, otp, "LOGIN");
      if (res.success) {
        toast.success("Berhasil ganti akun!");
        setAuthUser(res.data.user);
        onOpenChange(false);
        // Reset state
        setStep("EMAIL");
        setEmail("");
        setOtp("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal verifikasi OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ganti Akun</DialogTitle>
          <DialogDescription>
            {step === "EMAIL"
              ? "Masukkan email akun yang ingin Anda gunakan."
              : `Masukkan kode OTP yang dikirim ke ${email}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "EMAIL" ? (
          <form onSubmit={handleRequestOtp} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim Kode Masuk
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="grid justify-items-center gap-4 py-4">
            <InputOTP maxLength={6} value={otp} onChange={(val) => setOtp(val)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <div className="text-center text-sm">
              <button
                onClick={() => setStep("EMAIL")}
                className="text-blue-600 hover:underline"
                type="button"
              >
                Ganti Email
              </button>
            </div>

            <DialogFooter className="w-full">
              <Button
                onClick={handleVerifyOtp}
                className="w-full"
                disabled={loading || otp.length < 6}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verifikasi & Masuk
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
