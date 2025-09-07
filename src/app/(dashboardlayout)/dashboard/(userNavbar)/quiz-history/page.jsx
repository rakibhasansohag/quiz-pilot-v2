"use client"

import { motion } from "motion/react"
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

const QuizHistory = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchList();
    }, []);


    async function fetchList() {
        setLoading(true);
        try {
            const res = await fetch('/api/questions', { credentials: 'include' });
            const data = await res.json();
            if (res.ok) setQuestions(data.questions || []);
            else toast.error(data.error || 'Failed to load');
        } catch (err) {
            console.error(err);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    }
    console.log(questions);
    return (
        <section>
            <Text tag={"heading"} text="Quiz History"></Text>
            <Text tag={"paragraph"} text="This is a demo data! Change The table columns heading" className={"!text-green-500"}></Text>


            <motion.div
                className="overflow-x-auto border rounded-lg"
                variants={tableVariants}
                initial="hidden"
                animate="visible"
            >
                <Table>
                    <TableHeader className="bg-primary ">
                        <TableRow>
                            <TableHead
                                className="border border-slate-950 cursor-pointer select-none text-center p-4"
                            >
                                SL
                            </TableHead>
                            <TableHead
                                className="border border-slate-950 cursor-pointer select-none text-center p-4"
                            >
                                Type
                            </TableHead>
                            <TableHead
                                className="border border-slate-950 cursor-pointer select-none text-center p-4"
                            >
                                Category
                            </TableHead>
                            <TableHead
                                className="border border-slate-950 cursor-pointer select-none text-center p-4"
                            >
                                Score
                            </TableHead>
                            <TableHead
                                className="border border-slate-950 cursor-pointer select-none text-center p-4"
                            >
                                Attempted At
                            </TableHead>
                            <TableHead
                                className="border border-slate-950 cursor-pointer select-none text-center p-4"
                            >
                                Actions
                            </TableHead>

                        </TableRow>
                    </TableHeader>
                    <TableBody >

                        {
                            questions.map((question, idx) =>

                                <motion.tr
                                    key={idx}
                                    variants={rowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    // ${idx % 2 === 0 ? "bg-white" : "bg-gray-100"}
                                    className={` text-center ${idx % 2 === 0 ? "bg-muted" : "bg-muted-foreground"}`}
                                >

                                    <TableCell className="text-center md:p-6">
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell className="text-center md:p-6">
                                        {question.type}
                                    </TableCell>
                                    <TableCell className="text-center md:p-6">
                                        {question.categoryName}
                                    </TableCell>
                                    <TableCell className="text-center md:p-6">
                                        <span className="border border-green-500">Score</span>
                                    </TableCell>
                                    <TableCell className="text-center md:p-6">
                                        <span className="border border-green-500">date</span>
                                    </TableCell>
                                    <TableCell className="text-center md:p-6">
                                        <span className="border border-green-500">Buttons</span>
                                    </TableCell>
                                </motion.tr>
                            )
                        }

                    </TableBody>
                </Table>




            </motion.div>

        </section>
    );
};

export default QuizHistory;