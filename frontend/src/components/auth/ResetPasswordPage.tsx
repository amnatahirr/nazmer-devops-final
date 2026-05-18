"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>("");
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams?.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors: Partial<ResetPasswordFormData> = {};

    // Validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch(
       `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: token,
              password: formData.password,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          // Store token and user data
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          setIsSuccess(true);

          // Redirect after 3 seconds
          setTimeout(() => {
            router.push("/");
          }, 3000);
        } else {
          if (data.errors) {
            const apiErrors: Partial<ResetPasswordFormData> = {};
            data.errors.forEach((error: any) => {
              if (error.path) {
                apiErrors[error.path as keyof ResetPasswordFormData] =
                  error.msg;
              }
            });
            setErrors(apiErrors);
          } else {
            alert(data.message || "Password reset failed. Please try again.");
          }
        }
      } catch (error) {
        console.error("Reset password error:", error);
        alert("Network error. Please check your connection and try again.");
      }
    }

    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className=" bg-gray-50 flex items-start justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-light text-gray-900 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You are now logged in.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to home page in 3 seconds...
            </p>
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
            Reset Your Password
          </h2>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your new password"
                className={`pr-10 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-beige_dark focus:border-beige_dark"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                className={`pr-10 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-beige_dark focus:border-beige_dark"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-beige_dark hover:bg-third text-white py-3 text-base font-medium disabled:opacity-50"
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
