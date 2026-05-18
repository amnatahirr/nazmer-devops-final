"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors: Partial<LoginFormData> = {};

    // Validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`
, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store token and user data
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          // Redirect to home page
          router.push("/");
        } else {
          // Handle API errors
          if (response.status === 423) {
            alert(
              "Account temporarily locked due to too many failed attempts. Please try again later."
            );
          } else if (data.errors) {
            const apiErrors: Partial<LoginFormData> = {};
            data.errors.forEach((error: any) => {
              if (error.path) {
                apiErrors[error.path as keyof LoginFormData] = error.msg;
              }
            });
            setErrors(apiErrors);
          } else {
            alert(
              data.message || "Login failed. Please check your credentials."
            );
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Network error. Please check your connection and try again.");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className=" bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className=" space-y-6">
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
              placeholder="you@example.com"
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

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-beige_dark focus:ring-beige_dark border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <Link
              href="/forget-password"
              className="text-sm text-beige_dark hover:text-third underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-beige_dark hover:bg-third text-white py-3 text-base font-medium disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Sign Up Link */}
          <div className="inline text-center mt-4">
            <p className="text-sm text-gray-600 pt-5">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-sm text-gray-600 pl-1 hover:text-third"
              >
                Create Account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
