"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors: Partial<ForgotPasswordFormData> = {};

    // Validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setIsEmailSent(true);
        } else {
          if (data.errors) {
            const apiErrors: Partial<ForgotPasswordFormData> = {};
            data.errors.forEach((error: any) => {
              if (error.path) {
                apiErrors[error.path as keyof ForgotPasswordFormData] =
                  error.msg;
              }
            });
            setErrors(apiErrors);
          } else {
            alert(
              data.message || "Failed to send reset email. Please try again."
            );
          }
        }
      } catch (error) {
        console.error("Forgot password error:", error);
        alert("Network error. Please check your connection and try again.");
      }
    }

    setIsLoading(false);
  };

  const handleResendEmail = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Reset email sent successfully!");
      } else {
        alert(data.message || "Failed to resend email. Please try again.");
      }
    } catch (error) {
      console.error("Resend email error:", error);
      alert("Network error. Please check your connection and try again.");
    }

    setIsLoading(false);
  };

  if (isEmailSent) {
    return (
      <div className=" bg-gray-50 flex items-start justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-light text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-gray-900">
                {formData.email}
              </span>
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm space-y-6">
            <div className="text-center space-y-4">
              <Mail className="h-12 w-12 text-beige_dark mx-auto" />
              <p className="text-sm text-gray-600">
                Didn&apos;t receive the email? Check your spam folder or click
                below to resend.
              </p>

              <Button
                onClick={handleResendEmail}
                disabled={isLoading}
                variant="default"
                className="w-full bg-beige_dark text-white hover:bg-beige transition-colors rounded-md"
              >
                {isLoading ? "Resending..." : "Resend Email"}
              </Button>

              <div className="pt-4 border-t">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm bg-beige_dark text-white hover:bg-beige transition-colors rounded-md"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-900 mb-2">
            Forgot Password?
          </h2>
          <p className="text-gray-600">
            No worries! Enter your email address and we&apos;ll send you a link
            to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={`${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-beige_dark focus:border-beige_dark"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-beige_dark hover:bg-third text-white py-3 text-base font-medium disabled:opacity-50"
          >
            {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
          </Button>

          {/* Back to Login */}
          <div className="text-center mt-4">
            <Link href="/login" className="text-sm text-gray-600">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
