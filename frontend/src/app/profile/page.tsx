"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";

type Profile = {
  username: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMe();
        setProfile(data);
      } catch (err: any) {
        setMessage(err.message);
      }
    }
    fetchProfile();
  }, []);

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      {profile ? (
        <div>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      {message && <p className="mt-3 text-red-500">{message}</p>}
    </div>
  );
}