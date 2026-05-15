"use client";
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<{email: string; password: string; fullName: string; role: "Influencer" | "Brand"}>({
    email: "",
    password: "",
    fullName: "",
    role: "Influencer",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      router.push("/dashboard/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow rounded w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Register</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <input
          type="text"
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as "Influencer" | "Brand" })}
          className="w-full border p-2 rounded"
        >
          <option value="Influencer">Influencer</option>
          <option value="Brand">Brand</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Register
        </button>
        <p className="text-center">
          Already have an account? <Link href="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}