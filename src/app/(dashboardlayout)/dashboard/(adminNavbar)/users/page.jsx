"use client";

import { motion } from "motion/react";
import Text from '@/components/shared/Typography/Text';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { useEffect, useState } from 'react';

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

if(loading)return <p>Loading.....</p>

  return (
    <section>
      <Text tag="heading" text="Users List" />
      <Text
        tag="paragraph"
        text="Showing all registered users with quiz attempts"
        className="!text-green-500"
      />

      <motion.div
        className="overflow-x-auto border rounded-lg mt-4"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <Table>
          <TableHeader className="bg-purple-400">
            <TableRow>
              <TableHead className="border border-slate-950 text-center p-4">SL</TableHead>
              <TableHead className="border border-slate-950 text-center p-4">Name</TableHead>
              <TableHead className="border border-slate-950 text-center p-4">Email</TableHead>
              <TableHead className="border border-slate-950 text-center p-4">Created At</TableHead>
              <TableHead className="border border-slate-950 text-center p-4">Quiz Attempt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, idx) => (
              <motion.tr
                key={idx}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`text-center ${idx % 2 === 0 ? "bg-muted" : "bg-gray-200"} hover:bg-purple-200 transition-colors duration-400 hover:scale-102 transform `}
              >
                <TableCell className="text-center md:p-6 ">{idx + 1}</TableCell>
                <TableCell className="text-center md:p-6">{user.name}</TableCell>
                <TableCell className="text-center md:p-6">{user.email}</TableCell>
                <TableCell className="text-center md:p-6">{user.createdAt}</TableCell>
                <TableCell className="text-center md:p-6">{user.quizAttempt}</TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </section>
  );
};

export default UsersTable;
