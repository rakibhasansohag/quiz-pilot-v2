"use client";

import { motion } from "motion/react";
import Text from '@/components/shared/Typography/Text';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { useEffect, useState } from 'react';
import { Loader2, UsersRound } from "lucide-react";
import { Input } from "@/components/ui/input";

const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.05 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
      else console.error(data.error || 'Failed to load users');
    } catch (err) {
      console.error('Server error', err);
    } finally {
      setLoading(false);
    }
  }


  // filtered users based on search (name & email)
  const filteredUsers = users.filter((u) => {
    const lowerSearch = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(lowerSearch) ||
      u.email?.toLowerCase().includes(lowerSearch)
    );
  });




  if (loading) return <div className="flex justify-center items-center my-auto min-h-screen"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /><p> users is Loading.....</p></div>

  return (
    <section>
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-10">
        <h2 className=" flex justify-center gap-1 text-2xl font-semibold tracking-tight "><UsersRound /> Users List </h2>

        {/* Search Input */}
        <div className="relative w-full sm:w-1/3 r">
          <Input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary transition-all"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
            />
          </svg>
        </div>


      </div>
      <motion.div
        className="overflow-x-auto  rounded-md mt-4"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <Table>
          <TableHeader className="bg-[#673ab7]">
            <TableRow  >
              <TableHead className="border-b text-white font-semibold border-slate-950 text-center p-4">SL</TableHead>
              <TableHead className="border-b text-white font-semibold  border-slate-950 text-center p-4">Name</TableHead>
              <TableHead className="border-b text-white font-semibold  border-slate-950 text-center p-4">Email</TableHead>
              <TableHead className="border-b text-white font-semibold  border-slate-950 text-center p-4">Created At</TableHead>
              <TableHead className="border-b text-white font-semibold   border-slate-950 text-center p-4">Quiz Attempt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, idx) => (
              <motion.tr
                key={idx}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`text-center ${idx % 2 === 0
                    ? "bg-muted dark:bg-black-100"
                    : "bg-gray-200 dark:bg-gray-900"
                  } hover:bg-indigo-100 dark:hover:bg-zinc-800 transition-transform duration-300 `}
              >
                <TableCell className="text-center md:p-6">{idx + 1}</TableCell>
                <TableCell className="text-center md:p-6">{user.name}</TableCell>
                <TableCell className="text-center md:p-6">{user.email}</TableCell>
                <TableCell className="text-center md:p-6">
                  {new Date(user.createdAt).toLocaleString()} {/* formatted date */}
                </TableCell>
                <TableCell className="text-center md:p-6">
                  {user.quizAttempt ?? 0}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </section>
  );
};

export default UsersTable;
