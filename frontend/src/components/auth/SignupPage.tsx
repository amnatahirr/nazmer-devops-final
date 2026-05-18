"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors: Partial<SignupFormData> = {};

    // Validation
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store token in localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          // Show success message
          alert(
            "Account created successfully! Please check your email to verify your account."
          );
          router.push("/login");
        } else {
          // Handle API errors
          if (data.errors) {
            const apiErrors: Partial<SignupFormData> = {};
            data.errors.forEach((error: any) => {
              if (error.path) {
                apiErrors[error.path as keyof SignupFormData] = error.msg;
              }
            });
            setErrors(apiErrors);
          } else {
            alert(data.message || "Registration failed. Please try again.");
          }
        }
      } catch (error) {
        console.error("Signup error:", error);
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
            Create Account
          </h2>
          <p className="text-gray-600">Join us for sustainable fashion</p>
        </div>

        <form onSubmit={handleSubmit} className=" space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className={`${
                  errors.firstName
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-beige_dark focus:border-beige_dark"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={`${
                  errors.lastName
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-beige_dark focus:border-beige_dark"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

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
                placeholder="Create a strong password"
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
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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

          {/* Terms Agreement */}
          <div>
            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-beige_dark focus:ring-beige_dark border-gray-300 rounded mt-1"
              />
              <label
                htmlFor="agreeToTerms"
                className="ml-2 block text-sm text-gray-700"
              >
                I agree to the{" "}
                <Link
                  href="/terms-and-conditions"
                  className="text-beige_dark hover:text-third underline"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="text-beige_dark hover:text-third underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-beige_dark hover:bg-third text-white py-3 text-base font-medium disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 pt-5">
              Already have an account?
              <Link
                href="/login"
                className="text-sm text-gray-600 pl-1 hover:text-third"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
