'use client'
import { onAuthStateChanged, User, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { useEffect, useState } from 'react'

export default function useAuthUser() {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => onAuthStateChanged(auth, setUser), [])
  return user
}
